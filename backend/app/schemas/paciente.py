from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, computed_field


class PacientePerfilOut(BaseModel):
    """Lo que ve un médico (o el propio paciente) del perfil básico — sin el PIN, claro."""

    model_config = ConfigDict(from_attributes=True)

    id_paciente: int
    dni: str
    nombre: str | None
    apellido: str | None
    email: str | None
    altura_cm: float
    peso_kg: float
    fecha_nacimiento: date
    sexo: str
    fumador: bool
    fecha_registro: date
    origen: str
    acepto_terminos: bool

    @computed_field
    @property
    def perfil_completo(self) -> bool:
        """
        False mientras al paciente le falte nombre, apellido, mail o aceptar
        los términos — el front usa esto para mostrar la pantalla bloqueante
        "completá tu perfil" antes de dejarlo entrar al dashboard.
        """
        return (
            bool(self.nombre)
            and bool(self.apellido)
            and self.email is not None
            and self.acepto_terminos
        )


class PacientePerfilUpdate(BaseModel):
    """
    Con lo que el paciente completa/edita su perfil una vez logueado
    (`PATCH /pacientes/me`). Todo opcional: el caso principal es la cuenta
    creada por el dispositivo que sólo carga el mail y acepta los términos.
    """

    nombre: str | None = Field(default=None, min_length=1, max_length=80)
    apellido: str | None = Field(default=None, min_length=1, max_length=80)
    email: EmailStr | None = None
    altura_cm: float | None = Field(default=None, gt=0, lt=300)
    peso_kg: float | None = Field(default=None, gt=0, lt=500)
    fecha_nacimiento: date | None = None
    sexo: Literal["F", "M", "X"] | None = None
    fumador: bool | None = None
    acepto_terminos: bool | None = None
