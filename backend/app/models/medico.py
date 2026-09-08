from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class Medico(Base):
    """
    TABLA 2: MEDICOS. A diferencia de los pacientes, los médicos SÍ se
    registran desde la web (usuario = su mail, contraseña).

    Sumamos dos grupos de columnas que no estaban en tu lista original de
    campos, pero que hacen falta para las funcionalidades que sí pediste:
    - `acepto_terminos` / `fecha_aceptacion_terminos`: para la pantalla de
      consentimiento informado al registrarse.
    - `reset_token` / `reset_token_expira`: para "cambiar la contraseña con
      el mail" — ver app/routers/auth.py para el flujo completo.
    """

    __tablename__ = "medicos"

    id_medico: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    usuario: Mapped[str] = mapped_column(String(160), unique=True, index=True)  # el mail
    # Igual que el PIN del paciente: nunca se guarda la contraseña en texto
    # plano, se guarda su hash.
    contrasena_hash: Mapped[str] = mapped_column(String(255))
    # El médico siempre se registra desde la web con el formulario completo,
    # así que nombre y apellido nunca faltan (a diferencia del paciente).
    nombre: Mapped[str] = mapped_column(String(80))
    apellido: Mapped[str] = mapped_column(String(80))
    fecha_registro: Mapped[date] = mapped_column(Date)

    acepto_terminos: Mapped[bool] = mapped_column(Boolean, default=False)
    fecha_aceptacion_terminos: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    reset_token: Mapped[str | None] = mapped_column(String(255), nullable=True)
    reset_token_expira: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    vinculos = relationship("MedicoPaciente", back_populates="medico")
    notas = relationship("NotaMedica", back_populates="medico")
