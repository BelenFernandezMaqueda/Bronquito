from datetime import date

from sqlalchemy import Date, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class NotaMedica(Base):
    """TABLA NOTAS_MEDICAS — comentarios/indicaciones que el médico le deja al paciente."""

    __tablename__ = "notas_medicas"

    id_nota: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_paciente: Mapped[int] = mapped_column(ForeignKey("usuarios.id_paciente"))
    id_medico: Mapped[int] = mapped_column(ForeignKey("medicos.id_medico"))
    mensaje: Mapped[str] = mapped_column(Text)
    fecha: Mapped[date] = mapped_column(Date)

    paciente = relationship("Paciente", back_populates="notas")
    medico = relationship("Medico", back_populates="notas")
