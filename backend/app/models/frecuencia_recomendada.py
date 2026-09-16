from datetime import date, datetime

from sqlalchemy import JSON, Date, DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class FrecuenciaRecomendada(Base):
    """
    TABLA FRECUENCIA_RECOMENDADA — historial de cambios de frecuencia y días
    de entrenamiento recomendados por el médico para un paciente.

    Es una tabla EXCLUSIVA de la web: a diferencia de `rutina` (que sí lee la
    ESP32), esta no forma parte de las tablas compartidas con el dispositivo,
    así que no está en la lista de las 9 originales.

    Es historial, no un valor único: cada cambio agrega una fila nueva en vez
    de pisar la anterior, para que el calendario pueda mostrar correctamente
    lo que regía en el pasado aunque el médico haya cambiado la recomendación
    después. La recomendación es del PACIENTE, no del médico — si tiene más
    de un médico vinculado, todos ven y comparten el mismo historial;
    `id_medico` es solo para saber quién hizo cada cambio.

    Para saber qué regía en una fecha X: la fila con `vigente_desde` más
    reciente que sea <= X.
    """

    __tablename__ = "frecuencia_recomendada"

    id_frecuencia: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_paciente: Mapped[int] = mapped_column(ForeignKey("usuarios.id_paciente"), index=True)
    id_medico: Mapped[int] = mapped_column(ForeignKey("medicos.id_medico"))

    sesiones_por_semana: Mapped[int] = mapped_column(Integer)
    # Días de la semana recomendados (0 = lunes ... 6 = domingo).
    dias_semana: Mapped[list[int]] = mapped_column(JSON)

    vigente_desde: Mapped[date] = mapped_column(Date)
    creado_en: Mapped[datetime] = mapped_column(DateTime)

    paciente = relationship("Paciente", back_populates="frecuencias_recomendadas")
    medico = relationship("Medico", back_populates="frecuencias_recomendadas")
