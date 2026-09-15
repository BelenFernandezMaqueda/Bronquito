import { useMemo, useState } from 'react'
import type { Paciente } from '../../types'
import { EstadoSesionBadge } from '../../components/ui/Badge'
import { FlowVolumeChart } from '../../components/ui/FlowVolumeChart'
import { PimTrendChart } from '../../components/ui/PimTrendChart'
import { MonthCalendar } from '../../components/ui/MonthCalendar'
import { DeviceSessionModal } from '../../components/ui/DeviceSessionModal'
import { Modal } from '../../components/ui/Modal'
import { TrashIcon } from '../../components/ui/TrashIcon'
import { FrequencyModal } from './FrequencyModal'
import {
  calibracionesDe,
  entrenamientosDe,
  formatearFecha,
  formatearDuracion,
  HOY,
} from '../../data/mockData'

type Tab = 'calibraciones' | 'entrenamiento' | 'calendario'

interface PatientDetailProps {
  paciente: Paciente
  onDesvincular: () => Promise<void>
}

export function PatientDetail({ paciente, onDesvincular }: PatientDetailProps) {
  const [tab, setTab] = useState<Tab>('calibraciones')
  const [frecuencia, setFrecuencia] = useState(paciente.frecuenciaSemanal)
  const [modalFrecuencia, setModalFrecuencia] = useState(false)
  const [sesionConsultorio, setSesionConsultorio] = useState<'entrenamiento' | 'calibracion' | null>(null)
  const [confirmarDesvinculo, setConfirmarDesvinculo] = useState(false)
  const [desvinculando, setDesvinculando] = useState(false)
  const [errorDesvinculo, setErrorDesvinculo] = useState<string | null>(null)

  async function confirmarYDesvincular() {
    setDesvinculando(true)
    setErrorDesvinculo(null)
    try {
      await onDesvincular()
    } catch (err) {
      setErrorDesvinculo(err instanceof Error ? err.message : 'No se pudo desvincular al paciente.')
      setDesvinculando(false)
    }
  }

  const calibraciones = calibracionesDe(paciente.id)
  const entrenamientos = entrenamientosDe(paciente.id)

  const fechasConSesion = useMemo(
    () => new Set([...entrenamientos, ...calibraciones].map((s) => s.fecha)),
    [entrenamientos, calibraciones],
  )

  const ultimaCalibracion = calibraciones[0]
  const calibracionesCronologicas = [...calibraciones].reverse()

  return (
    <div className="card">
      <div className="detail-toolbar">
        <button
          className="btn-icon btn-icon-pink"
          onClick={() => setConfirmarDesvinculo(true)}
          aria-label="Desvincular paciente"
          title="Desvincular paciente"
        >
          <TrashIcon className="icon-16" />
        </button>
      </div>

      <div className="detail-header">
        <div className="detail-id">
          <h2>{paciente.nombre}</h2>
          <div className="p-sub">
            {paciente.diagnostico} · {paciente.edad} años · ID #{paciente.id.toUpperCase()}
          </div>
          <div className="tags">
            <span className="tag">PIM inicial: {paciente.pimInicial} cmH₂O</span>
            <span className="tag">PIM actual: {paciente.pimActual} cmH₂O</span>
            <span className="tag">Resistencia actual: Nivel {paciente.resistenciaActual}</span>
            <span className="tag">Frecuencia: {frecuencia}x/semana</span>
          </div>
        </div>
        <div className="detail-actions">
          <button className="btn btn-outline" onClick={() => setModalFrecuencia(true)}>
            Modificar frecuencia
          </button>
          <button className="btn btn-outline" onClick={() => setSesionConsultorio('calibracion')}>
            Calibración en consultorio
          </button>
          <button className="btn btn-teal" onClick={() => setSesionConsultorio('entrenamiento')}>
            Entrenamiento en consultorio
          </button>
        </div>
      </div>

      <div className="tabs" role="tablist" aria-label="Detalle clínico del paciente">
        <button className={`tab ${tab === 'calibraciones' ? 'active' : ''}`} role="tab" aria-selected={tab === 'calibraciones'} onClick={() => setTab('calibraciones')}>
          Calibraciones
        </button>
        <button className={`tab ${tab === 'entrenamiento' ? 'active' : ''}`} role="tab" aria-selected={tab === 'entrenamiento'} onClick={() => setTab('entrenamiento')}>
          Entrenamiento
        </button>
        <button className={`tab ${tab === 'calendario' ? 'active' : ''}`} role="tab" aria-selected={tab === 'calendario'} onClick={() => setTab('calendario')}>
          Calendario
        </button>
      </div>

      {tab === 'calibraciones' && (
        <div role="tabpanel">
          {ultimaCalibracion ? (
            <div className="grid cols-2">
              <FlowVolumeChart
                puntos={ultimaCalibracion.curvaFlujoVolumen}
                caption={`Curva flujo–volumen · última calibración (${formatearFecha(ultimaCalibracion.fecha)})`}
              />
              <PimTrendChart
                valores={calibracionesCronologicas.map((c) => c.pim)}
                caption={`Evolución de PIM: ${calibracionesCronologicas[0]?.pim} → ${ultimaCalibracion.pim} cmH₂O`}
              />
            </div>
          ) : (
            <p className="empty-state">Todavía no hay calibraciones registradas.</p>
          )}

          {calibraciones.length > 0 && (
            <div className="table-wrap mt-16">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>PIM (cmH₂O)</th>
                    <th>Volumen (L)</th>
                    <th>Origen</th>
                    <th>Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {calibraciones.map((c) => (
                    <tr key={c.id}>
                      <td>{formatearFecha(c.fecha)}</td>
                      <td>{c.pim}</td>
                      <td>{c.volumen}</td>
                      <td>{c.enConsultorio ? 'Consultorio' : 'Casa'}</td>
                      <td>{c.observaciones ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'entrenamiento' && (
        <div role="tabpanel">
          {entrenamientos.length > 0 ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Duración</th>
                    <th>Resistencia</th>
                    <th>WoB (J)</th>
                    <th>Potencia (W)</th>
                    <th>Respiraciones</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {entrenamientos.map((e) => (
                    <tr key={e.id}>
                      <td>{formatearFecha(e.fecha)}</td>
                      <td>{formatearDuracion(e.duracionSegundos)}</td>
                      <td>Nivel {e.resistencia}</td>
                      <td>{e.wob}</td>
                      <td>{e.potencia}</td>
                      <td>{e.respiraciones}</td>
                      <td>
                        <EstadoSesionBadge estado={e.estado} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="empty-state">Todavía no hay sesiones de entrenamiento registradas.</p>
          )}
        </div>
      )}

      {tab === 'calendario' && (
        <div role="tabpanel">
          <MonthCalendar
            anio={HOY.getFullYear()}
            mes={HOY.getMonth()}
            fechasConSesion={fechasConSesion}
            hoyIso={HOY.toISOString().slice(0, 10)}
          />
          <p className="invite-note">
            Los días marcados en celeste tienen una sesión de entrenamiento o calibración
            registrada. La frecuencia recomendada actual es de {frecuencia} sesiones por semana;
            podés ajustarla con "Modificar frecuencia".
          </p>
        </div>
      )}

      {modalFrecuencia && (
        <FrequencyModal
          frecuenciaActual={frecuencia}
          nombrePaciente={paciente.nombre}
          onClose={() => setModalFrecuencia(false)}
          onGuardar={setFrecuencia}
        />
      )}

      {sesionConsultorio && (
        <DeviceSessionModal
          tipo={sesionConsultorio}
          nombrePaciente={paciente.nombre}
          onClose={() => setSesionConsultorio(null)}
        />
      )}

      {confirmarDesvinculo && (
        <Modal
          titulo="Desvincular paciente"
          onClose={() => setConfirmarDesvinculo(false)}
          acciones={
            <>
              <button
                className="btn btn-outline"
                onClick={() => setConfirmarDesvinculo(false)}
                disabled={desvinculando}
              >
                Cancelar
              </button>
              <button className="btn btn-teal" onClick={confirmarYDesvincular} disabled={desvinculando}>
                {desvinculando ? 'Desvinculando…' : 'Sí, desvincular'}
              </button>
            </>
          }
        >
          <p>
            ¿Seguro que querés desvincular a <strong>{paciente.nombre}</strong>? Vas a dejar de ver su
            información clínica hasta que lo vuelvas a conectar con su DNI y PIN.
          </p>
          {errorDesvinculo && <div className="auth-alert error">{errorDesvinculo}</div>}
        </Modal>
      )}
    </div>
  )
}
