from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Enum, Float, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import OrigenPaciente


class Paciente(Base):
    """
    TABLA 1: USUARIOS (del documento de arquitectura). La llamamos `Paciente`
    en el código porque es más claro para nosotros, pero la tabla real en
    MySQL se llama `usuarios` — así coincide con lo que definieron.

    Un paciente puede nacer de dos lados (ver `origen`):

    - Desde el DISPOSITIVO: la OLED genera un DNI + PIN y esa cuenta llega a
      la web (por ahora vía `seed.py`; a futuro, al sincronizar la micro SD).
      Puede no tener `email` todavía: se lo pedimos la primera vez que el
      paciente entra a la web (pantalla "completá tu perfil").
    - Desde la WEB: el propio paciente se registra con el formulario completo
      (`POST /auth/pacientes/registro`), con mail desde el arranque.

    En los dos casos, el vínculo con un médico se crea después, desde la
    cuenta del médico (`POST /medicos/me/vincular`), no acá.
    """

    __tablename__ = "usuarios"

    id_paciente: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    dni: Mapped[str] = mapped_column(String(20), unique=True, index=True)

    # Pueden ser NULL para cuentas del dispositivo que todavía no completaron
    # su perfil en la web. El médico necesita el nombre para identificar a sus
    # pacientes (no alcanza el DNI).
    nombre: Mapped[str | None] = mapped_column(String(80), nullable=True)
    apellido: Mapped[str | None] = mapped_column(String(80), nullable=True)
    # El PIN nunca se guarda en texto plano — se guarda "hasheado" (ver
    # app/core/security.py). Esta columna guarda ese hash, no el PIN en sí.
    pin_hash: Mapped[str] = mapped_column(String(255))

    # Puede ser NULL para cuentas creadas por el dispositivo que todavía no
    # cargaron el mail. Único cuando está presente (MySQL permite varios NULL).
    # Se usa para recuperar el PIN por mail.
    email: Mapped[str | None] = mapped_column(String(160), unique=True, index=True, nullable=True)

    altura_cm: Mapped[float] = mapped_column(Float)
    peso_kg: Mapped[float] = mapped_column(Float)
    fecha_nacimiento: Mapped[date] = mapped_column(Date)
    sexo: Mapped[str] = mapped_column(String(1))  # 'F' / 'M' / 'X'
    fumador: Mapped[bool] = mapped_column(Boolean, default=False)
    fecha_registro: Mapped[date] = mapped_column(Date)

    origen: Mapped[OrigenPaciente] = mapped_column(
        Enum(OrigenPaciente, native_enum=False, length=20),
        default=OrigenPaciente.dispositivo,
    )

    # Consentimiento informado. Las cuentas que vienen del dispositivo lo
    # aceptan cuando completan su perfil en la web; las de registro web, al
    # registrarse. NULL = todavía no lo aceptó por la web.
    acepto_terminos: Mapped[bool] = mapped_column(Boolean, default=False)
    fecha_aceptacion_terminos: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    # "Olvidé mi PIN" — mismo mecanismo que el reset de contraseña del médico
    # (ver app/routers/auth.py).
    reset_token: Mapped[str | None] = mapped_column(String(255), nullable=True)
    reset_token_expira: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    vinculos = relationship("MedicoPaciente", back_populates="paciente")
    evaluaciones = relationship("Evaluacion", back_populates="paciente")
    entrenamientos = relationship("Entrenamiento", back_populates="paciente")
    rutina = relationship("Rutina", back_populates="paciente", uselist=False)
    notas = relationship("NotaMedica", back_populates="paciente")

    @property
    def perfil_completo(self) -> bool:
        """
        True cuando el paciente ya no necesita pasar por la pantalla
        "completá tu perfil": tiene nombre, apellido y mail, y aceptó los
        términos por la web.
        """
        return (
            bool(self.nombre)
            and bool(self.apellido)
            and self.email is not None
            and self.acepto_terminos
        )
