from datetime import date

from pydantic import BaseModel, ConfigDict

from app.models.enums import OrigenRutina


class RutinaOut(BaseModel):
    """La rutina activa de un paciente ahora mismo."""

    model_config = ConfigDict(from_attributes=True)

    resistencia_activa: float
    tiempo_descanso: int
    repeticiones: int
    modificado_por: OrigenRutina
    fecha_actualizacion: date
