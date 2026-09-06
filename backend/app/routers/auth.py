"""
Todo el login/registro vive acá. Dos flujos bien separados porque son
conceptualmente distintos:

- MÉDICOS: se registran desde la web (mail + contraseña) y pueden pedir
  resetear su contraseña por mail si la olvidan.
- PACIENTES: NO se registran desde la web (el dispositivo tiene que poder
  funcionar sin ella). Sólo inician sesión con DNI + PIN, sobre una cuenta
  que ya existe en la base (creada al sincronizar la micro SD — o, por
  ahora, cargada a mano por `seed.py` para poder probar el login).
"""

import secrets
from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import crear_token, hashear_secreto, verificar_secreto
from app.models.medico import Medico
from app.models.paciente import Paciente
from app.schemas.auth import (
    MedicoLogin,
    MedicoRegistro,
    OlvideContrasenaOut,
    OlvideContrasenaRequest,
    PacienteLogin,
    ResetearContrasenaRequest,
    TokenOut,
)

router = APIRouter(prefix="/auth", tags=["auth"])


# --- Médicos -----------------------------------------------------------------


@router.post("/medicos/registro", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
def registrar_medico(payload: MedicoRegistro, db: Session = Depends(get_db)):
    """
    Alta de médico. `acepto_terminos` ya viene validado como True desde el
    schema (ver app/schemas/auth.py) — acá sólo falta chequear que el mail
    no esté usado, hashear la contraseña, y guardar cuándo aceptó los
    términos (para tener un registro real de consentimiento, no sólo un
    checkbox visual).
    """
    ya_existe = db.query(Medico).filter(Medico.usuario == payload.usuario).first()
    if ya_existe:
        raise HTTPException(status_code=400, detail="Ya existe una cuenta de médico con ese mail.")

    nuevo = Medico(
        usuario=payload.usuario,
        contrasena_hash=hashear_secreto(payload.contrasena),
        fecha_registro=date.today(),
        acepto_terminos=True,
        fecha_aceptacion_terminos=datetime.now(timezone.utc),
    )
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)

    token = crear_token(sujeto_id=nuevo.id_medico, rol="medico")
    return TokenOut(access_token=token, rol="medico")


@router.post("/medicos/login", response_model=TokenOut)
def login_medico(payload: MedicoLogin, db: Session = Depends(get_db)):
    medico = db.query(Medico).filter(Medico.usuario == payload.usuario).first()

    # OJO con este detalle: si devolviéramos un mensaje distinto para
    # "el mail no existe" vs. "la contraseña está mal", alguien podría usar
    # eso para averiguar qué mails están registrados. Por eso el mismo
    # mensaje genérico sirve para los dos casos.
    credenciales_invalidas = HTTPException(status_code=401, detail="Usuario o contraseña incorrectos.")

    if medico is None:
        raise credenciales_invalidas
    if not verificar_secreto(payload.contrasena, medico.contrasena_hash):
        raise credenciales_invalidas

    token = crear_token(sujeto_id=medico.id_medico, rol="medico")
    return TokenOut(access_token=token, rol="medico")


@router.post("/medicos/olvide-contrasena", response_model=OlvideContrasenaOut)
def olvide_contrasena(payload: OlvideContrasenaRequest, db: Session = Depends(get_db)):
    """
    Genera un token de recuperación válido por `reset_token_expire_minutes`.
    En un sistema real, acá se dispararía un mail con un link tipo
    `https://bronquito.app/resetear?token=...` y la respuesta HTTP NO
    incluiría el token. Como todavía no tenemos un servidor de mails
    configurado, lo devolvemos igual en la respuesta (`reset_token_dev`)
    para poder probar el flujo completo desde /docs mientras tanto.
    """
    medico = db.query(Medico).filter(Medico.usuario == payload.usuario).first()

    # Respondemos "mensaje enviado" exista o no la cuenta, para no revelar
    # qué mails están registrados. Sólo generamos el token si sí existe.
    if medico is None:
        return OlvideContrasenaOut(mensaje="Si el mail existe, vas a recibir instrucciones para resetear tu contraseña.")

    token = secrets.token_urlsafe(32)
    medico.reset_token = token
    medico.reset_token_expira = datetime.now(timezone.utc) + timedelta(minutes=settings.reset_token_expire_minutes)
    db.commit()

    return OlvideContrasenaOut(
        mensaje="Si el mail existe, vas a recibir instrucciones para resetear tu contraseña.",
        reset_token_dev=token,
    )


@router.post("/medicos/resetear-contrasena", status_code=status.HTTP_204_NO_CONTENT)
def resetear_contrasena(payload: ResetearContrasenaRequest, db: Session = Depends(get_db)):
    medico = db.query(Medico).filter(Medico.reset_token == payload.token).first()

    token_invalido = HTTPException(status_code=400, detail="El link para resetear la contraseña es inválido o venció.")

    if medico is None or medico.reset_token_expira is None:
        raise token_invalido
    if datetime.now(timezone.utc) > medico.reset_token_expira.replace(tzinfo=timezone.utc):
        raise token_invalido

    medico.contrasena_hash = hashear_secreto(payload.nueva_contrasena)
    medico.reset_token = None
    medico.reset_token_expira = None
    db.commit()


# --- Pacientes -----------------------------------------------------------------


@router.post("/pacientes/login", response_model=TokenOut)
def login_paciente(payload: PacienteLogin, db: Session = Depends(get_db)):
    """
    Sin registro acá a propósito: si el DNI no existe en la base, es porque
    ese paciente todavía no sincronizó su dispositivo con la web (o nunca
    lo va a hacer, y usa el dispositivo standalone). No hay bloqueo por
    intentos fallidos — decisión explícita para esta primera versión.
    """
    paciente = db.query(Paciente).filter(Paciente.dni == payload.dni).first()

    credenciales_invalidas = HTTPException(status_code=401, detail="DNI o PIN incorrectos.")

    if paciente is None:
        raise credenciales_invalidas
    if not verificar_secreto(payload.pin, paciente.pin_hash):
        raise credenciales_invalidas

    token = crear_token(sujeto_id=paciente.id_paciente, rol="paciente")
    return TokenOut(access_token=token, rol="paciente")
