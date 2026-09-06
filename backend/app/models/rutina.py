from datetime import date

from sqlalchemy import Date, Enum, Float, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import OrigenRutina


class Rutina(Base):
    """
    TABLA RUTINA — la rutina ACTIVA de cada paciente ahora mismo (una fila
    por paciente). El médico la edita desde su vista; la ESP32, al
    conectarse, lee esta tabla para saber si hubo cambios que aplicar.
    """

    __tablename__ = "rutina"

    id_rutina: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_paciente: Mapped[int] = mapped_column(ForeignKey("usuarios.id_paciente"), unique=True)

    resistencia_activa: Mapped[float] = mapped_column(Float)
    tiempo_descanso: Mapped[int] = mapped_column(Integer)  # segundos
    repeticiones: Mapped[int] = mapped_column(Integer)
    modificado_por: Mapped[OrigenRutina] = mapped_column(Enum(OrigenRutina, native_enum=False, length=20))
    fecha_actualizacion: Mapped[date] = mapped_column(Date)

    paciente = relationship("Paciente", back_populates="rutina")
