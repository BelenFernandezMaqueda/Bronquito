from datetime import date

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


class MedicoPerfilOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id_medico: int
    usuario: str
    nombre: str
    apellido: str
    fecha_registro: date


class MedicoPerfilUpdate(BaseModel):
    usuario: EmailStr | None = None
    nombre: str | None = Field(default=None, min_length=1, max_length=80)
    apellido: str | None = Field(default=None, min_length=1, max_length=80)
    nueva_contrasena: str | None = Field(default=None, min_length=8)

    @field_validator("nombre", "apellido")
    @classmethod
    def nombre_sin_numeros(cls, valor: str | None) -> str | None:
        if valor is not None and any(caracter.isdigit() for caracter in valor):
            raise ValueError("El nombre y el apellido no pueden contener números.")
        return valor


class VincularPacienteRequest(BaseModel):
    dni: str
    pin: str
