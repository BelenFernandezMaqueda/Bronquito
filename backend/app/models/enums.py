"""
Enums compartidos por varios modelos. Se guardan en MySQL como texto corto
(`native_enum=False`), no como el tipo ENUM propio de MySQL, para que sea más
fácil de leer/migrar después.
"""

import enum


class TipoEvaluacion(str, enum.Enum):
    """TABLA EVALUACIONES.TIPO"""

    espirometria = "ESPIROMETRIA"
    pim_pem = "PIM_PEM"


class OrigenRutina(str, enum.Enum):
    """TABLA RUTINA.MODIFICADO_POR — quién generó/ajustó la rutina activa."""

    algoritmo = "ALGORITMO"
    medico = "MEDICO"


class OrigenPaciente(str, enum.Enum):
    """
    TABLA USUARIOS.ORIGEN — cómo se creó la cuenta del paciente.

    - `dispositivo`: la creó la OLED (aparece con DNI + PIN nuevos) y todavía
      puede que le falte el mail; se lo pedimos la primera vez que entra a la
      web. A futuro, estas cuentas llegan por la sincronización de la micro SD.
    - `web`: la creó el propio paciente desde la web, con el formulario
      completo (mail incluido desde el arranque).
    """

    dispositivo = "DISPOSITIVO"
    web = "WEB"
