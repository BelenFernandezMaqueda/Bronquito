"""
Dependencias de FastAPI para proteger endpoints: se agregan como parámetro
a cualquier función de un router (`medico: Medico = Depends(get_current_medico)`)
y automáticamente exigen un token válido antes de dejar entrar al request.

`OAuth2PasswordBearer` es lo que le indica a FastAPI de dónde sacar el token
(el header `Authorization: Bearer <token>`) y lo que hace que en /docs
aparezca el botón "Authorize" para probar endpoints protegidos a mano.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import TokenInvalido, leer_token
from app.models.medico import Medico
from app.models.paciente import Paciente

# tokenUrl es sólo informativo para la UI de /docs, no se llama de verdad.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/medicos/login", auto_error=False)


def _credenciales_invalidas() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas o sesión vencida. Iniciá sesión de nuevo.",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_medico(
    token: str | None = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> Medico:
    if token is None:
        raise _credenciales_invalidas()
    try:
        sujeto_id, rol = leer_token(token)
    except TokenInvalido:
        raise _credenciales_invalidas()
    if rol != "medico":
        raise _credenciales_invalidas()
    medico = db.get(Medico, sujeto_id)
    if medico is None:
        raise _credenciales_invalidas()
    return medico


def get_current_paciente(
    token: str | None = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> Paciente:
    if token is None:
        raise _credenciales_invalidas()
    try:
        sujeto_id, rol = leer_token(token)
    except TokenInvalido:
        raise _credenciales_invalidas()
    if rol != "paciente":
        raise _credenciales_invalidas()
    paciente = db.get(Paciente, sujeto_id)
    if paciente is None:
        raise _credenciales_invalidas()
    return paciente
