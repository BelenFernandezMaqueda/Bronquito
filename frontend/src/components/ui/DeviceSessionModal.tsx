import { useEffect, useState } from 'react'
import { Modal } from './Modal'
import { DuckLogo } from './DuckLogo'
import { formatearDuracion } from '../../data/mockData'

export type DeviceSessionKind = 'entrenamiento' | 'calibracion'

interface DeviceSessionModalProps {
  tipo: DeviceSessionKind
  /** Si está presente, encabeza el modal aclarando que es en consultorio con el paciente presente. */
  nombrePaciente?: string
  onClose: () => void
  onFinalizar?: (resultado: { duracionSegundos: number; pim?: number }) => void
}

type Paso = 'conectando' | 'en_curso' | 'resultado'

const PASOS: Array<{ id: Paso; label: string }> = [
  { id: 'conectando', label: 'Conectando con el dispositivo' },
  { id: 'en_curso', label: 'Sesión en curso — respirá siguiendo la guía' },
  { id: 'resultado', label: 'Sesión finalizada' },
]

/**
 * Simula el flujo de operar el dispositivo Bronquito: conexión → sesión en curso → resultado.
 * No hay hardware real acá (los datos se generan offline en el dispositivo y se sincronizan
 * después); esto sólo demuestra cómo se vería la web mientras una sesión ocurre.
 */
export function DeviceSessionModal({ tipo, nombrePaciente, onClose, onFinalizar }: DeviceSessionModalProps) {
  const [paso, setPaso] = useState<Paso>('conectando')
  const [segundos, setSegundos] = useState(0)
  const duracionObjetivo = tipo === 'entrenamiento' ? 15 : 8 // segundos "acelerados" para la demo

  useEffect(() => {
    const t1 = setTimeout(() => setPaso('en_curso'), 1400)
    return () => clearTimeout(t1)
  }, [])

  useEffect(() => {
    if (paso !== 'en_curso') return
    const interval = setInterval(() => {
      setSegundos((s) => {
        if (s + 1 >= duracionObjetivo) {
          clearInterval(interval)
          setPaso('resultado')
          return duracionObjetivo
        }
        return s + 1
      })
    }, 250)
    return () => clearInterval(interval)
  }, [paso, duracionObjetivo])

  const pctProgreso = Math.min(100, Math.round((segundos / duracionObjetivo) * 100))

  const resultadoDuracionReal = tipo === 'entrenamiento' ? 8 * 60 - 20 : undefined
  const resultadoPim = tipo === 'calibracion' ? 76 : undefined

  const titulo =
    tipo === 'entrenamiento'
      ? nombrePaciente
        ? `Entrenamiento en consultorio · ${nombrePaciente}`
        : 'Sesión de entrenamiento'
      : nombrePaciente
        ? `Calibración en consultorio · ${nombrePaciente}`
        : 'Calibración'

  return (
    <Modal
      titulo={titulo}
      onClose={onClose}
      acciones={
        paso === 'resultado' ? (
          <button
            className="btn btn-teal"
            onClick={() => {
              onFinalizar?.({ duracionSegundos: resultadoDuracionReal ?? 0, pim: resultadoPim })
              onClose()
            }}
          >
            Listo
          </button>
        ) : (
          <button className="btn btn-outline" onClick={onClose}>
            Cancelar
          </button>
        )
      }
    >
      <DuckLogo className="duck-spin" spinning={paso !== 'resultado'} />

      {paso !== 'resultado' && (
        <p>
          {nombrePaciente
            ? 'Conectá el dispositivo y guiá al paciente para comenzar la sesión.'
            : 'Conectá el dispositivo y esperá la indicación en pantalla para empezar a respirar.'}
        </p>
      )}

      <div className="device-steps">
        {PASOS.map((p, i) => {
          const idxActual = PASOS.findIndex((x) => x.id === paso)
          const estado = i < idxActual ? 'done' : i === idxActual ? 'active' : ''
          return (
            <div key={p.id} className={`device-step ${estado}`}>
              <span className="step-dot" aria-hidden="true">
                {i < idxActual ? '✓' : i + 1}
              </span>
              <span>{p.label}</span>
            </div>
          )
        })}
      </div>

      {paso === 'en_curso' && (
        <div className="session-bar-wrap" style={{ height: 12 }} role="progressbar" aria-valuenow={pctProgreso} aria-valuemin={0} aria-valuemax={100}>
          <div className="session-bar" style={{ width: `${pctProgreso}%` }} />
        </div>
      )}

      {paso === 'resultado' && (
        <div className="result-grid">
          {tipo === 'entrenamiento' ? (
            <>
              <div className="result-item">
                <div className="result-label">DURACIÓN</div>
                <div className="result-value">{formatearDuracion(resultadoDuracionReal ?? 0)}</div>
              </div>
              <div className="result-item">
                <div className="result-label">RESPIRACIONES</div>
                <div className="result-value">21</div>
              </div>
              <div className="result-item">
                <div className="result-label">WOB</div>
                <div className="result-value">3.9 J</div>
              </div>
              <div className="result-item">
                <div className="result-label">EFICIENCIA</div>
                <div className="result-value">85%</div>
              </div>
            </>
          ) : (
            <>
              <div className="result-item">
                <div className="result-label">PIM</div>
                <div className="result-value">{resultadoPim} cmH₂O</div>
              </div>
              <div className="result-item">
                <div className="result-label">VOLUMEN</div>
                <div className="result-value">2.9 L</div>
              </div>
            </>
          )}
        </div>
      )}
    </Modal>
  )
}
