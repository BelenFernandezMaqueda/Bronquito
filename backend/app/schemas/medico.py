from datetime import date

from pydantic import BaseModel, ConfigDict


class MedicoPerfilOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_medico: int
    usuario: str
    nombre: str
    apellido: str
    fecha_registro: date


class VincularPacienteRequest(BaseModel):
    dni: str
