from fastapi import APIRouter, Depends

from app.core.deps import get_current_paciente
from app.models.paciente import Paciente
from app.schemas.paciente import PacientePerfilOut

router = APIRouter(prefix="/pacientes", tags=["pacientes"])


@router.get("/me", response_model=PacientePerfilOut)
def mi_perfil(paciente: Paciente = Depends(get_current_paciente)):
    """El propio paciente viendo su perfil (protegido con SU token, no el de un médico)."""
    return paciente
