import { useMemo, useState } from 'react'
import { StatCard } from '../../components/ui/StatCard'
import { EstadoSesionBadge } from '../../components/ui/Badge'
import { MonthCalendar } from '../../components/ui/MonthCalendar'
import { DeviceSessionModal } from '../../components/ui/DeviceSessionModal'
import {
  entrenamientosDe,
  calibracionesDe,
  rachaSemanalDe,
  resumenProgresoDe,
  formatearFecha,
  formatearDuracion,
  pacientes,
  pacienteActualId,
  HOY,
} from '../../data/mockData'
import { useSession } from '../../auth/session'

type SubVista = 'resumen' | 'calendario' | 'historial'

export function PatientDashboard() {
  const [subVista, setSubVista] = useState<SubVista>('resumen')
  const [sesionAbierta, setSesionAbierta] = useState<'entrenamiento' | 'calibracion' | null>(null)

  const { perfil } = useSession()
  const paciente = pacientes.find((p) => p.id === pacienteActualId)!
  const racha = rachaSemanalDe(pacienteActualId)
  const resumen = resumenProgresoDe(pacienteActualId)
  const sesiones = entrenamientosDe(pacienteActualId)
  const calibraciones = calibracionesDe(pacienteActualId)

  const fechasConSesion = useMemo(
    () => new Set([...sesiones, ...calibraciones].map((s) => s.fecha)),
    [sesiones, calibraciones],
  )

  // El nombre sale de la sesión real; el resto del dashboard todavía es mock.
  const primerNombre =
    (perfil?.rol === 'paciente' && perfil.datos.nombre) || paciente.nombre.split(' ')[0]

  return (
    <div id="contenido-principal">
      {subVista === 'resumen' && (
        <>
          <div className="card hero">
            <div>
              <h2>Hola {primerNombre}, ¿lista para hoy? 🐣</h2>
              <p>
                Tu ejercicio de hoy es una sesión de entrenamiento inspiratorio de 8 minutos con
                resistencia nivel {paciente.resistenciaActual}. Llevás {resumen.rachaActualDias} día
                {resumen.rachaActualDias === 1 ? '' : 's'} seguidos, ¡no cortes la racha!
              </p>
            </div>
            <button className="btn btn-light" onClick={() => setSesionAbierta('entrenamiento')}>
              Iniciar sesión de hoy
            </button>
          </div>

          <div className="grid cols-3">
            <StatCard
              icono="⏱️"
              iconoFondo="var(--teal-pale)"
              etiqueta="Duración promedio"
              valor={formatearDuracion(resumen.duracionPromedioSegundos)}
              sub={
                resumen.duracionPromedioVariacionPct !== 0
                  ? `${resumen.duracionPromedioVariacionPct > 0 ? '▲' : '▼'} ${Math.abs(resumen.duracionPromedioVariacionPct)}% vs. semana pasada`
                  : undefined
              }
              subTono={resumen.duracionPromedioVariacionPct >= 0 ? 'up' : 'down'}
            />
            <StatCard
              icono="🎯"
              iconoFondo="var(--pink-soft)"
              etiqueta="Eficiencia respiratoria"
              valor={`${resumen.eficienciaPromedio}%`}
              sub={
                resumen.eficienciaVariacionPts !== 0
                  ? `${resumen.eficienciaVariacionPts > 0 ? '▲' : '▼'} ${Math.abs(resumen.eficienciaVariacionPts)} pts`
                  : undefined
              }
              subTono={resumen.eficienciaVariacionPts >= 0 ? 'up' : 'down'}
            />
            <StatCard
              icono="💪"
              iconoFondo="var(--yellow-soft)"
              etiqueta="Resistencia actual"
              valor={`Nivel ${resumen.resistenciaActual}`}
              sub="Ajustada por tu equipo médico"
              subTono="neutral"
            />
          </div>

          <section className="block">
            <div className="block-title">
              <h3>Esta semana</h3>
              <button className="link" onClick={() => setSubVista('calendario')}>
                Ver calendario completo
              </button>
            </div>
            <div className="card">
              <div className="streak">
                {racha.map((d) => (
                  <div key={d.fecha} className={['day', d.completado ? 'done' : '', d.esHoy ? 'today' : ''].filter(Boolean).join(' ')}>
                    <div className="day-name">{d.etiqueta}</div>
                    <div className="day-mark">{d.completado ? '✓' : d.esHoy ? '🐥' : '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="block">
            <div className="block-title">
              <h3>Sesiones recientes</h3>
              <button className="link" onClick={() => setSubVista('historial')}>
                Ver historial
              </button>
            </div>
            <div className="card">
              {sesiones.slice(0, 3).map((s) => (
                <div className="session-row" key={s.id}>
                  <div className="session-date">{formatearFecha(s.fecha)}</div>
                  <div className="session-bar-wrap">
                    <div
                      className="session-bar"
                      style={{ width: `${Math.round((s.duracionSegundos / s.duracionObjetivoSegundos) * 100)}%` }}
                    />
                  </div>
                  <div className="session-meta">
                    {formatearDuracion(s.duracionSegundos)} · Nivel {s.resistencia} <EstadoSesionBadge estado={s.estado} />
                  </div>
                </div>
              ))}
              {sesiones.length === 0 && <p className="empty-state">Todavía no hiciste sesiones de entrenamiento.</p>}
            </div>
          </section>

          <section className="block">
            <div className="block-title">
              <h3>Calibraciones</h3>
            </div>
            <div className="card">
              <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginBottom: 14 }}>
                Tu última calibración fue el {calibraciones[0] ? formatearFecha(calibraciones[0].fecha) : '—'}. La
                calibración mide qué tan fuerte y eficiente es tu respiración para ajustar la
                resistencia del dispositivo.
              </p>
              <button className="btn btn-outline btn-sm" onClick={() => setSesionAbierta('calibracion')}>
                Iniciar calibración
              </button>
            </div>
          </section>
        </>
      )}

      {subVista === 'calendario' && (
        <div className="card">
          <div className="block-title">
            <h3>Calendario completo</h3>
            <button className="link" onClick={() => setSubVista('resumen')}>
              ← Volver al resumen
            </button>
          </div>
          <MonthCalendar
            anio={HOY.getFullYear()}
            mes={HOY.getMonth()}
            fechasConSesion={fechasConSesion}
            hoyIso={HOY.toISOString().slice(0, 10)}
          />
        </div>
      )}

      {subVista === 'historial' && (
        <div className="card">
          <div className="block-title">
            <h3>Historial de sesiones</h3>
            <button className="link" onClick={() => setSubVista('resumen')}>
              ← Volver al resumen
            </button>
          </div>
          {sesiones.map((s) => (
            <div className="session-row" key={s.id}>
              <div className="session-date">{formatearFecha(s.fecha)}</div>
              <div className="session-bar-wrap">
                <div
                  className="session-bar"
                  style={{ width: `${Math.round((s.duracionSegundos / s.duracionObjetivoSegundos) * 100)}%` }}
                />
              </div>
              <div className="session-meta">
                {formatearDuracion(s.duracionSegundos)} · Nivel {s.resistencia} · Eficiencia {s.eficiencia}%{' '}
                <EstadoSesionBadge estado={s.estado} />
              </div>
            </div>
          ))}
          {sesiones.length === 0 && <p className="empty-state">Todavía no hiciste sesiones de entrenamiento.</p>}
        </div>
      )}

      {sesionAbierta && (
        <DeviceSessionModal tipo={sesionAbierta} onClose={() => setSesionAbierta(null)} />
      )}
    </div>
  )
}
