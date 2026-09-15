import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Paciente } from '../../types'
import type { Evaluacion } from '../../api/types'
import { ApiError, api } from '../../api/client'
import { useSession } from '../../auth/session'
import { EstadoSesionBadge } from '../../components/ui/Badge'
import { PimTrendChart } from '../../components/ui/PimTrendChart'
import { MonthCalendar } from '../../components/ui/MonthCalendar'
import { Modal } from '../../components/ui/Modal'
import { TrashIcon } from '../../components/ui/TrashIcon'
import { FrequencyModal } from './FrequencyModal'
import { entrenamientosDe, formatearFecha, formatearDuracion, HOY } from '../../data/mockData'

type Tab = 'evaluaciones' | 'entrenamiento' | 'calendario'

interface PatientDetailProps {
  paciente: Paciente
  onDesvincular: () => Promise<void>
}

export function PatientDetail({ paciente, onDesvincular }: PatientDetailProps) {
  const { token } = useSession()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('evaluaciones')
  const [frecuencia, setFrecuencia] = useState(paciente.frecuenciaSemanal)
  const [modalFrecuencia, setModalFrecuencia] = useState(false)
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

  const [evaluaciones, setEvaluaciones] = useState<Evaluacion[]>([])
  const [cargandoEvaluaciones, setCargandoEvaluaciones] = useState(true)
  const [errorEvaluaciones, setErrorEvaluaciones] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    let cancelado = false
    setCargandoEvaluaciones(true)
    setErrorEvaluaciones(null)
    api.medico
      .evaluacionesDe(token, Number(paciente.id))
      .then((datos) => {
        if (!cancelado) setEvaluaciones(datos)
      })
      .catch((err) => {
        if (cancelado) return
        setErrorEvaluaciones(err instanceof ApiError ? err.message : 'No pudimos cargar las evaluaciones.')
      })
      .finally(() => {
        if (!cancelado) setCargandoEvaluaciones(false)
      })
    return () => {
      cancelado = true
    }
  }, [token, paciente.id])

  // Dos evaluaciones son la misma sesión de consultorio si comparten el
  // `fecha_hora` exacto (se captura una sola vez al arrancar la sesión) —
  // se agrupan en una sola fila de la tabla.
  const sesiones = useMemo(() => {
    const porFecha = new Map<string, { fecha_hora: string; espirometria?: Evaluacion; pim?: Evaluacion }>()
    for (const e of evaluaciones) {
      const sesion = porFecha.get(e.fecha_hora) ?? { fecha_hora: e.fecha_hora }
      if (e.tipo === 'ESPIROMETRIA') sesion.espirometria = e
      else sesion.pim = e
      porFecha.set(e.fecha_hora, sesion)
    }
    return [...porFecha.values()]
  }, [evaluaciones])

  const ultimaEvaluacion = evaluaciones[0]
  const entrenamientos = entrenamientosDe(paciente.id)

  const fechasConSesion = useMemo(
    () =>
      new Set([
        ...entrenamientos.map((e) => e.fecha),
        ...evaluaciones.map((e) => e.fecha_hora.slice(0, 10)),
      ]),
    [entrenamientos, evaluaciones],
  )

  const evaluacionesCronologicas = [...evaluaciones].reverse()
  const seriePim = evaluacionesCronologicas
    .filter((e): e is Evaluacion & { pim: number } => e.pim != null)
    .map((e) => ({ valor: e.pim, fecha: formatearFecha(e.fecha_hora) }))
  const serieFvc = evaluacionesCronologicas
    .filter((e): e is Evaluacion & { fvc: number } => e.fvc != null)
    .map((e) => ({ valor: e.fvc, fecha: formatearFecha(e.fecha_hora) }))

  return (
    <div className="card">
      <div className="detail-title-row">
        <h2>{paciente.nombre}</h2>
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
      </div>

      <div className="tabs-row">
        <div className="tabs" role="tablist" aria-label="Detalle clínico del paciente">
          <button className={`tab ${tab === 'evaluaciones' ? 'active' : ''}`} role="tab" aria-selected={tab === 'evaluaciones'} onClick={() => setTab('evaluaciones')}>
            Evaluaciones
          </button>
          <button className={`tab ${tab === 'entrenamiento' ? 'active' : ''}`} role="tab" aria-selected={tab === 'entrenamiento'} onClick={() => setTab('entrenamiento')}>
            Entrenamiento
          </button>
          <button className={`tab ${tab === 'calendario' ? 'active' : ''}`} role="tab" aria-selected={tab === 'calendario'} onClick={() => setTab('calendario')}>
            Calendario
          </button>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => setModalFrecuencia(true)}>
          Modificar frecuencia
        </button>
      </div>

      {tab === 'evaluaciones' && (
        <div role="tabpanel">
          {cargandoEvaluaciones ? (
            <p className="empty-state">Cargando evaluaciones…</p>
          ) : errorEvaluaciones ? (
            <p className="empty-state">{errorEvaluaciones}</p>
          ) : (
            <>
              {ultimaEvaluacion ? (
                <div className="grid cols-2">
                  {seriePim.length > 0 ? (
                    <PimTrendChart
                      valores={seriePim.map((p) => p.valor)}
                      fechas={seriePim.map((p) => p.fecha)}
                      etiquetaEje="PIM (cmH₂O)"
                      caption={`Evolución de PIM: ${seriePim[0].valor} → ${seriePim[seriePim.length - 1].valor} cmH₂O`}
                    />
                  ) : (
                    <div className="chart-wrap">
                      <p className="empty-state">No hay ningún valor de PIM para graficar.</p>
                    </div>
                  )}
                  {serieFvc.length > 0 ? (
                    <PimTrendChart
                      valores={serieFvc.map((p) => p.valor)}
                      fechas={serieFvc.map((p) => p.fecha)}
                      etiquetaEje="FVC (L)"
                      caption={`Evolución de FVC: ${serieFvc[0].valor} → ${serieFvc[serieFvc.length - 1].valor} L`}
                    />
                  ) : (
                    <div className="chart-wrap">
                      <p className="empty-state">No hay ningún valor de FVC para graficar.</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="empty-state">Todavía no hay evaluaciones registradas.</p>
              )}

              {evaluaciones.length > 0 && (
                <div className="table-wrap mt-16">
                  <table>
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>FVC (L)</th>
                        <th>FEV1 (L)</th>
                        <th>PEF (L/min)</th>
                        <th>FIVC (L)</th>
                        <th>FIV1 (L)</th>
                        <th>PIM (cmH₂O)</th>
                        <th>Señales</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sesiones.map((sesion) => (
                        <tr key={sesion.fecha_hora}>
                          <td>{formatearFecha(sesion.fecha_hora)}</td>
                          <td>{sesion.espirometria?.fvc ?? '—'}</td>
                          <td>{sesion.espirometria?.fev1 ?? '—'}</td>
                          <td>{sesion.espirometria?.pef ?? '—'}</td>
                          <td>{sesion.espirometria?.fivc ?? '—'}</td>
                          <td>{sesion.espirometria?.fiv1 ?? '—'}</td>
                          <td>{sesion.pim?.pim ?? '—'}</td>
                          <td>
                            <div className="table-actions">
                              {sesion.espirometria && (
                                <button
                                  className="btn btn-outline btn-sm"
                                  onClick={() =>
                                    navigate(`/medico/pacientes/${paciente.id}/evaluaciones/${sesion.espirometria!.id_evaluacion}`)
                                  }
                                >
                                  {sesion.pim ? 'Espirometría' : 'Inspeccionar'}
                                </button>
                              )}
                              {sesion.pim && (
                                <button
                                  className="btn btn-outline btn-sm"
                                  onClick={() =>
                                    navigate(`/medico/pacientes/${paciente.id}/evaluaciones/${sesion.pim!.id_evaluacion}`)
                                  }
                                >
                                  {sesion.espirometria ? 'PIM' : 'Inspeccionar'}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
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
