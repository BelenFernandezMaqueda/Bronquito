from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.deps import get_current_medico
from app.models.medico import Medico
from app.models.medico_paciente import MedicoPaciente
from app.models.paciente import Paciente
from app.schemas.medico import MedicoPerfilOut, VincularPacienteRequest
from app.schemas.paciente import PacientePerfilOut

router = APIRouter(prefix="/medicos", tags=["medicos"])


@router.get("/me", response_model=MedicoPerfilOut)
def mi_perfil(medico: Medico = Depends(get_current_medico)):
    """
    Ejemplo más simple posible de endpoint protegido: `Depends(get_current_medico)`
    ya se encarga de exigir un token válido de médico antes de llegar acá.
    Si el token falta o es inválido, la función ni se ejecuta.
    """
    return medico


@router.get("/me/pacientes", response_model=list[PacientePerfilOut])
def mis_pacientes(medico: Medico = Depends(get_current_medico), db: Session = Depends(get_db)):
    """Pacientes vinculados a ESTE médico (el que mandó el token), no a cualquiera."""
    return (
        db.query(Paciente)
        .join(MedicoPaciente, MedicoPaciente.id_paciente == Paciente.id_paciente)
        .filter(MedicoPaciente.id_medico == medico.id_medico)
        .all()
    )


@router.post("/me/vincular", response_model=PacientePerfilOut, status_code=201)
def vincular_paciente(
    payload: VincularPacienteRequest,
    medico: Medico = Depends(get_current_medico),
    db: Session = Depends(get_db),
):
    """
    Vinculación DIRECTA por DNI: se busca al paciente, y si existe se crea
    la fila en medico_paciente al toque (sin pedirle confirmación al
    paciente — así lo definiste para esta versión).
    """
    paciente = db.query(Paciente).filter(Paciente.dni == payload.dni).first()
    if paciente is None:
        raise HTTPException(status_code=404, detail="No existe ningún paciente con ese DNI.")

    ya_vinculado = (
        db.query(MedicoPaciente)
        .filter(MedicoPaciente.id_medico == medico.id_medico, MedicoPaciente.id_paciente == paciente.id_paciente)
        .first()
    )
    if ya_vinculado is not None:
        raise HTTPException(status_code=400, detail="Ya tenés a este paciente vinculado.")

    vinculo = MedicoPaciente(
        id_medico=medico.id_medico,
        id_paciente=paciente.id_paciente,
        fecha_vinculacion=datetime.now(timezone.utc),
    )
    db.add(vinculo)
    db.commit()

    return paciente
