from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_paciente
from app.models.paciente import Paciente
from app.schemas.paciente import PacientePerfilOut, PacientePerfilUpdate

router = APIRouter(prefix="/pacientes", tags=["pacientes"])


@router.get("/me", response_model=PacientePerfilOut)
def mi_perfil(paciente: Paciente = Depends(get_current_paciente)):
    """El propio paciente viendo su perfil (protegido con SU token, no el de un médico)."""
    return paciente


@router.patch("/me", response_model=PacientePerfilOut)
def actualizar_mi_perfil(
    payload: PacientePerfilUpdate,
    paciente: Paciente = Depends(get_current_paciente),
    db: Session = Depends(get_db),
):
    """
    El paciente completa/edita su perfil una vez logueado. El caso central es
    la cuenta creada por el dispositivo que llega sin mail: la web la manda
    acá con `email` + `acepto_terminos=true` antes de dejarla entrar al
    dashboard (ver `perfil_completo` en el schema).
    """
    datos = payload.model_dump(exclude_unset=True)

    nuevo_email = datos.get("email")
    if nuevo_email is not None and nuevo_email != paciente.email:
        ya_usado = db.query(Paciente).filter(Paciente.email == nuevo_email).first()
        if ya_usado is not None:
            raise HTTPException(status_code=400, detail="Ese mail ya está en uso por otra cuenta.")

    # `acepto_terminos` sólo se puede pasar a True desde acá; si el paciente
    # manda false lo ignoramos (no hay un flujo de "revocar consentimiento").
    if datos.get("acepto_terminos") is True and not paciente.acepto_terminos:
        paciente.acepto_terminos = True
        paciente.fecha_aceptacion_terminos = datetime.now(timezone.utc)
    datos.pop("acepto_terminos", None)

    for campo, valor in datos.items():
        setattr(paciente, campo, valor)

    db.commit()
    db.refresh(paciente)
    return paciente
