from datetime import date

from pydantic import BaseModel, ConfigDict


class PacientePerfilOut(BaseModel):
    """Lo que ve un médico (o el propio paciente) del perfil básico — sin el PIN, claro."""

    model_config = ConfigDict(from_attributes=True)

    id_paciente: int
    dni: str
    altura_cm: float
    peso_kg: float
    fecha_nacimiento: date
    sexo: str
    fumador: bool
    fecha_registro: date
