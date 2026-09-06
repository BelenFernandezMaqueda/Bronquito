"""
Todo lo relacionado a "probar quién sos" vive acá:
  - hashear y verificar contraseñas/PINs (nunca se guardan en texto plano)
  - crear y leer los tokens de sesión (JWT)

Un token JWT es básicamente un papelito firmado que dice "soy el médico con
id 3" (o "soy el paciente con id 7"), con una fecha de vencimiento. El
servidor lo firma con `jwt_secret_key` al crearlo; después, en cada request
protegido, vuelve a chequear esa firma para saber que el papelito no fue
inventado ni alterado. El cliente (la web) lo guarda y lo manda de vuelta en
cada pedido, en el header `Authorization: Bearer <token>`.

A propósito NO hay bloqueo de cuenta por intentos fallidos (ni de PIN ni de
contraseña) — fue una decisión explícita para esta primera versión, no un
olvido. Si más adelante lo quieren agregar, este archivo es el lugar natural
para sumar un contador de intentos.
"""

from datetime import datetime, timedelta, timezone
from typing import Any, Literal

import bcrypt
import jwt

from app.core.config import settings

# --- Hashing de contraseñas y PINs -----------------------------------------
# Usamos el mismo mecanismo (bcrypt) para las dos cosas: la contraseña del
# médico y el PIN de 4 dígitos del paciente son, en el fondo, "un secreto
# que hay que guardar de forma que ni mirando la base de datos se pueda leer
# el original". bcrypt genera un hash distinto cada vez (por eso dos
# usuarios con el mismo PIN "1234" van a tener hashes distintos guardados),
# pero `verificar_secreto` siempre puede confirmar si un valor nuevo
# coincide con el hash guardado.


def hashear_secreto(valor_plano: str) -> str:
    """Convierte una contraseña o PIN en texto plano a su hash para guardar en la DB."""
    hash_bytes = bcrypt.hashpw(valor_plano.encode("utf-8"), bcrypt.gensalt())
    return hash_bytes.decode("utf-8")


def verificar_secreto(valor_plano: str, hash_guardado: str) -> bool:
    """Compara un valor tipeado por el usuario contra el hash guardado en la DB."""
    return bcrypt.checkpw(valor_plano.encode("utf-8"), hash_guardado.encode("utf-8"))


# --- Tokens de sesión (JWT) -------------------------------------------------

RolToken = Literal["medico", "paciente"]


def crear_token(*, sujeto_id: int, rol: RolToken) -> str:
    """
    Arma el token que se le entrega al frontend después de un login exitoso.
    `sujeto_id` es el id_medico o id_paciente según corresponda; `rol` es lo
    que le permite al backend, más adelante, saber a cuál de las dos tablas
    hay que ir a buscar según ese id.
    """
    ahora = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": str(sujeto_id),
        "rol": rol,
        "iat": ahora,
        "exp": ahora + timedelta(minutes=settings.jwt_expire_minutes),
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


class TokenInvalido(Exception):
    """El token no existe, está mal formado, vencido, o fue alterado."""


def leer_token(token: str) -> tuple[int, RolToken]:
    """Decodifica y valida un token. Devuelve (id, rol) o levanta TokenInvalido."""
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        return int(payload["sub"]), payload["rol"]
    except (jwt.PyJWTError, KeyError, ValueError) as exc:
        raise TokenInvalido from exc
