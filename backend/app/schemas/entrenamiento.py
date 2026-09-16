from datetime import datetime

from pydantic import BaseModel, ConfigDict


class EntrenamientoOut(BaseModel):
    """Un resumen de sesión de entrenamiento, sin la curva cruda."""

    model_config = ConfigDict(from_attributes=True)

    id_entrenamiento: int
    fecha_hora: datetime
    resistencia_programada: float
    repeticiones_programadas: int
    presion_max: float
    presion_promedio: float
    indice_fatiga: float
    potencia_insp: float
    trabajo: float
    duty_cycle: float
    tiempo_entre_reps: float
    volumen_total: float
    temperatura: float | None
    humedad: float | None
