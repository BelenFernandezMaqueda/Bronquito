import { useState } from 'react'
import { Modal } from '../../components/ui/Modal'

interface FrequencyModalProps {
  frecuenciaActual: number
  /** Días de la semana recomendados para entrenar (0 = lunes ... 6 = domingo). */
  diasActuales: number[]
  nombrePaciente: string
  onClose: () => void
  onGuardar: (nuevaFrecuencia: number, nuevosDias: number[]) => Promise<void>
}

const OPCIONES = [2, 3, 4, 5, 6, 7]
const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

export function FrequencyModal({ frecuenciaActual, diasActuales, nombrePaciente, onClose, onGuardar }: FrequencyModalProps) {
  const [seleccion, setSeleccion] = useState(frecuenciaActual)
  const [dias, setDias] = useState(diasActuales)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const diasCoinciden = dias.length === seleccion

  function toggleDia(indice: number) {
    setDias((actuales) =>
      actuales.includes(indice) ? actuales.filter((d) => d !== indice) : [...actuales, indice].sort(),
    )
  }

  async function guardar() {
    if (!diasCoinciden) return
    setGuardando(true)
    setError(null)
    try {
      await onGuardar(seleccion, dias)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos guardar el cambio.')
      setGuardando(false)
    }
  }

  return (
    <Modal
      titulo="Modificar frecuencia"
      onClose={onClose}
      wide
      acciones={
        <>
          <button className="btn btn-outline" onClick={onClose} disabled={guardando}>
            Cancelar
          </button>
          <button className="btn btn-teal" onClick={guardar} disabled={guardando || !diasCoinciden}>
            {guardando ? 'Guardando…' : 'Guardar'}
          </button>
        </>
      }
    >
      <p>
        Definí cuántas veces por semana y qué días se le recomienda entrenar a {nombrePaciente}.
        Queda guardado como un cambio nuevo en el historial — los meses anteriores del calendario
        van a seguir mostrando lo que regía antes.
      </p>
      <div className="field">
        <label id="freq-label">Sesiones por semana</label>
        <div className="freq-picker" role="radiogroup" aria-labelledby="freq-label">
          {OPCIONES.map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={seleccion === n}
              className={`freq-option ${seleccion === n ? 'active' : ''}`}
              onClick={() => setSeleccion(n)}
            >
              {n}x
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label id="dias-label">Días recomendados</label>
        <div className="freq-picker" role="group" aria-labelledby="dias-label">
          {DIAS.map((etiqueta, indice) => (
            <button
              key={etiqueta}
              type="button"
              aria-pressed={dias.includes(indice)}
              className={`freq-option ${dias.includes(indice) ? 'active' : ''}`}
              onClick={() => toggleDia(indice)}
            >
              {etiqueta}
            </button>
          ))}
        </div>
        {!diasCoinciden && (
          <p className="field-hint">
            Marcá {seleccion} día{seleccion === 1 ? '' : 's'} para que coincidan con las {seleccion} sesiones semanales.
          </p>
        )}
      </div>
      {error && <div className="auth-alert error">{error}</div>}
    </Modal>
  )
}
