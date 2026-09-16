"""
Zona horaria de Argentina, para poder calcular "qué día es hoy" de forma
consistente sin importar en qué timezone corra el servidor — Docker suele
correr en UTC por default, así que `date.today()` a la noche (hora
argentina) puede devolver el día siguiente.
"""

from datetime import date, datetime
from zoneinfo import ZoneInfo

ARGENTINA = ZoneInfo("America/Argentina/Buenos_Aires")


def hoy_argentina() -> date:
    """La fecha de hoy tal como la ve alguien en Argentina, no la del servidor."""
    return datetime.now(ARGENTINA).date()
