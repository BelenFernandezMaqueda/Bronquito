from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class FrecuenciaOut(BaseModel):
    """Una entrada del historial de frecuencia/días recomendados."""

    model_config = ConfigDict(from_attributes=True)

    id_frecuencia: int
    sesiones_por_semana: int
    dias_semana: list[int]
    vigente_desde: date
    creado_en: datetime


class FrecuenciaCrearRequest(BaseModel):
    sesiones_por_semana: int = Field(ge=1, le=7)
    # Días de la semana recomendados (0 = lunes ... 6 = domingo).
    dias_semana: list[int] = Field(default_factory=list)

    @field_validator("dias_semana")
    @classmethod
    def _dias_validos(cls, valor: list[int]) -> list[int]:
        if any(d < 0 or d > 6 for d in valor):
            raise ValueError("Cada día tiene que ser un número de 0 (lunes) a 6 (domingo).")
        if len(set(valor)) != len(valor):
            raise ValueError("No puede haber días repetidos.")
        return sorted(valor)
