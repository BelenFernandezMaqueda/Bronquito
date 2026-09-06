from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator


class MedicoRegistro(BaseModel):
    """Lo que manda el formulario de registro de médico."""

    usuario: EmailStr
    contrasena: str = Field(min_length=8, description="Mínimo 8 caracteres")
    acepto_terminos: bool

    @field_validator("acepto_terminos")
    @classmethod
    def debe_aceptar_terminos(cls, v: bool) -> bool:
        if not v:
            raise ValueError("Tenés que aceptar los términos y la política de privacidad para registrarte.")
        return v


class MedicoLogin(BaseModel):
    usuario: EmailStr
    contrasena: str


class PacienteLogin(BaseModel):
    dni: str = Field(min_length=6, max_length=20)
    pin: str = Field(pattern=r"^\d{4}$", description="4 dígitos")


class TokenOut(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    rol: Literal["medico", "paciente"]


class OlvideContrasenaRequest(BaseModel):
    usuario: EmailStr


class OlvideContrasenaOut(BaseModel):
    mensaje: str
    # OJO: esto es un facilitador de DESARROLLO. En producción este token
    # jamás se devuelve en la respuesta HTTP — se manda por mail y listo.
    # Lo dejamos visible acá para poder probar el flujo completo sin tener
    # un servidor de emails configurado todavía.
    reset_token_dev: str | None = None


class ResetearContrasenaRequest(BaseModel):
    token: str
    nueva_contrasena: str = Field(min_length=8)
