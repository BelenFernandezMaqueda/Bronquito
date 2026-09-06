from datetime import date

from sqlalchemy import Boolean, Date, Float, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Paciente(Base):
    """
    TABLA 1: USUARIOS (del documento de arquitectura). La llamamos `Paciente`
    en el código porque es más claro para nosotros, pero la tabla real en
    MySQL se llama `usuarios` — así coincide con lo que definieron.

    Los pacientes NO se registran desde la web (el dispositivo tiene que
    poder funcionar sin ella): se dan de alta cuando el perfil.json de la
    micro SD se sincroniza. Por ahora, mientras no exista ese sincronizador,
    `seed.py` carga un par de pacientes de prueba a mano para poder probar
    el login.
    """

    __tablename__ = "usuarios"

    id_paciente: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    dni: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    # El PIN nunca se guarda en texto plano — se guarda "hasheado" (ver
    # app/core/security.py). Esta columna guarda ese hash, no el PIN en sí.
    pin_hash: Mapped[str] = mapped_column(String(255))
    altura_cm: Mapped[float] = mapped_column(Float)
    peso_kg: Mapped[float] = mapped_column(Float)
    fecha_nacimiento: Mapped[date] = mapped_column(Date)
    sexo: Mapped[str] = mapped_column(String(1))  # 'F' / 'M' / 'X'
    fumador: Mapped[bool] = mapped_column(Boolean, default=False)
    fecha_registro: Mapped[date] = mapped_column(Date)

    vinculos = relationship("MedicoPaciente", back_populates="paciente")
    evaluaciones = relationship("Evaluacion", back_populates="paciente")
    entrenamientos = relationship("Entrenamiento", back_populates="paciente")
    rutina = relationship("Rutina", back_populates="paciente", uselist=False)
    notas = relationship("NotaMedica", back_populates="paciente")
