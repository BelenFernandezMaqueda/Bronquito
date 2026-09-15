from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.enums import TipoEvaluacion


class EvaluacionOut(BaseModel):
    """Un resumen de evaluación (espirometría o PIM), sin la curva cruda."""

    model_config = ConfigDict(from_attributes=True)

    id_evaluacion: int
    tipo: TipoEvaluacion
    fecha_hora: datetime
    fvc: float | None
    fev1: float | None
    pef: float | None
    fivc: float | None
    fiv1: float | None
    pim: float | None
    temperatura: float | None
    humedad: float | None


class EvaluacionMuestraOut(BaseModel):
    """La curva cruda (tiempo/flujo/presión/volumen) de una evaluación puntual."""

    model_config = ConfigDict(from_attributes=True)

    tiempo: list[float]
    flujo: list[float]
    presion: list[float]
    volumen: list[float]
