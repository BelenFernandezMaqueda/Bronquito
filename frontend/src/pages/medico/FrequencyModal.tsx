import { useState } from 'react'
import { Modal } from '../../components/ui/Modal'

interface FrequencyModalProps {
  frecuenciaActual: number
  nombrePaciente: string
  onClose: () => void
  onGuardar: (nuevaFrecuencia: number) => void
}

const OPCIONES = [2, 3, 4, 5, 6, 7]

export function FrequencyModal({ frecuenciaActual, nombrePaciente, onClose, onGuardar }: FrequencyModalProps) {
  const [seleccion, setSeleccion] = useState(frecuenciaActual)

  return (
    <Modal
      titulo="Modificar frecuencia"
      onClose={onClose}
      wide
      acciones={
        <>
          <button className="btn btn-outline" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-teal"
            onClick={() => {
              onGuardar(seleccion)
              onClose()
            }}
          >
            Guardar
          </button>
        </>
      }
    >
      <p>
        Definí cuántas veces por semana se le recomienda entrenar a {nombrePaciente}. Este valor
        se sincroniza con el dispositivo la próxima vez que se conecte.
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
    </Modal>
  )
}
