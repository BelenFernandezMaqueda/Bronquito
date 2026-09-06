from datetime import datetime

from sqlalchemy import DateTime, Enum, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import TipoEvaluacion


class Evaluacion(Base):
    """TABLA EVALUACIONES — un registro por cada prueba (espirometría o PIM/PEM)."""

    __tablename__ = "evaluaciones"

    id_evaluacion: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_paciente: Mapped[int] = mapped_column(ForeignKey("usuarios.id_paciente"))
    tipo: Mapped[TipoEvaluacion] = mapped_column(Enum(TipoEvaluacion, native_enum=False, length=20))
    fecha_hora: Mapped[datetime] = mapped_column(DateTime)

    # Espirometría (válvulas abiertas)
    fvc: Mapped[float | None] = mapped_column(Float, nullable=True)
    fev1: Mapped[float | None] = mapped_column(Float, nullable=True)
    pef: Mapped[float | None] = mapped_column(Float, nullable=True)
    fivc: Mapped[float | None] = mapped_column(Float, nullable=True)
    fiv1: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Presiones máximas (válvulas cerradas)
    pim: Mapped[float | None] = mapped_column(Float, nullable=True)
    pem: Mapped[float | None] = mapped_column(Float, nullable=True)

    temperatura: Mapped[float | None] = mapped_column(Float, nullable=True)
    humedad: Mapped[float | None] = mapped_column(Float, nullable=True)

    paciente = relationship("Paciente", back_populates="evaluaciones")
    muestras = relationship(
        "EvaluacionMuestra", back_populates="evaluacion", order_by="EvaluacionMuestra.tiempo"
    )


class EvaluacionMuestra(Base):
    """
    TABLA EVALUACIONES_MUESTRAS — los puntos crudos (tiempo/flujo/presión/
    volumen) de una evaluación, para poder dibujar la curva. Una evaluación
    tiene muchísimas filas acá (una por cada instante muestreado).
    """

    __tablename__ = "evaluaciones_muestras"

    id_grafico: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_evaluacion: Mapped[int] = mapped_column(ForeignKey("evaluaciones.id_evaluacion"))
    tiempo: Mapped[float] = mapped_column(Float)
    flujo: Mapped[float] = mapped_column(Float)
    presion: Mapped[float] = mapped_column(Float)
    volumen: Mapped[float] = mapped_column(Float)

    evaluacion = relationship("Evaluacion", back_populates="muestras")
