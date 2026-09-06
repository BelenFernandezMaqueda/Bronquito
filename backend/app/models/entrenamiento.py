from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Entrenamiento(Base):
    """TABLA ENTRENAMIENTOS — un registro por cada sesión de entrenamiento."""

    __tablename__ = "entrenamientos"

    id_entrenamiento: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_paciente: Mapped[int] = mapped_column(ForeignKey("usuarios.id_paciente"))
    fecha_hora: Mapped[datetime] = mapped_column(DateTime)

    resistencia_programada: Mapped[float] = mapped_column(Float)
    repeticiones_programadas: Mapped[int] = mapped_column(Integer)
    tiempo_descanso: Mapped[int] = mapped_column(Integer)  # segundos
    posicion_valvula: Mapped[float | None] = mapped_column(Float, nullable=True)

    rep_terminadas: Mapped[int] = mapped_column(Integer)
    presion_max: Mapped[float] = mapped_column(Float)
    presion_media_sostenida: Mapped[float] = mapped_column(Float)
    indice_fatiga: Mapped[float] = mapped_column(Float)  # %
    potencia_insp: Mapped[float] = mapped_column(Float)  # Watts
    trabajo_insp: Mapped[float] = mapped_column(Float)  # Joules
    volumen_total: Mapped[float] = mapped_column(Float)  # Litros

    temperatura: Mapped[float | None] = mapped_column(Float, nullable=True)
    humedad: Mapped[float | None] = mapped_column(Float, nullable=True)

    paciente = relationship("Paciente", back_populates="entrenamientos")
    puntos = relationship(
        "EntrenamientoGraficar", back_populates="entrenamiento", order_by="EntrenamientoGraficar.tiempo"
    )


class EntrenamientoGraficar(Base):
    """
    TABLA ENTRENAMIENTOS_GRAFICAR — puntos crudos (presión/flujo/volumen en
    el tiempo) de un entrenamiento, con la fase (esfuerzo/descanso) y el
    número de repetición, para poder graficarlo diferenciando colores.
    """

    __tablename__ = "entrenamientos_graficar"

    id_graficar_ent: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_entrenamiento: Mapped[int] = mapped_column(ForeignKey("entrenamientos.id_entrenamiento"))
    tiempo: Mapped[float] = mapped_column(Float)
    volumen: Mapped[float] = mapped_column(Float)
    flujo: Mapped[float] = mapped_column(Float)
    presion: Mapped[float] = mapped_column(Float)
    fase: Mapped[str] = mapped_column(String(20))  # 'ESFUERZO' / 'DESCANSO'
    repeticion: Mapped[int] = mapped_column(Integer)

    entrenamiento = relationship("Entrenamiento", back_populates="puntos")
