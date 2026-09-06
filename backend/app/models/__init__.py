"""
Importa las 9 tablas del documento de arquitectura en un solo lugar, para
que `Base.metadata.create_all()` (en app/main.py) las conozca a todas al
crear las tablas, y para que las relaciones declaradas como strings
(ej. "MedicoPaciente") se puedan resolver sin problema.
"""

from app.models.entrenamiento import Entrenamiento, EntrenamientoGraficar
from app.models.evaluacion import Evaluacion, EvaluacionMuestra
from app.models.medico import Medico
from app.models.medico_paciente import MedicoPaciente
from app.models.nota_medica import NotaMedica
from app.models.paciente import Paciente
from app.models.rutina import Rutina

__all__ = [
    "Paciente",  # tabla usuarios
    "Medico",  # tabla medicos
    "MedicoPaciente",  # tabla medico_paciente
    "Evaluacion",  # tabla evaluaciones
    "EvaluacionMuestra",  # tabla evaluaciones_muestras
    "Entrenamiento",  # tabla entrenamientos
    "EntrenamientoGraficar",  # tabla entrenamientos_graficar
    "Rutina",  # tabla rutina
    "NotaMedica",  # tabla notas_medicas
]
