
import { useEffect, useMemo, useState } from 'react'
import { StatCard } from '../../components/ui/StatCard'
import { EstadoSesionBadge } from '../../components/ui/Badge'
import { diasVigentesEn, MonthCalendar } from '../../components/ui/MonthCalendar'
import { DeviceSessionModal } from '../../components/ui/DeviceSessionModal'
import {
  entrenamientosDe,
  evaluacionesDe,
  resumenProgresoDe,
  formatearFecha,
  formatearDuracion,
  pacientes,
  pacienteActualId,
  isoArgentina,
} from '../../data/mockData'
import { useSession } from '../../auth/session'
import { api } from '../../api/client'
import type { Frecuencia } from '../../api/types'

type SubVista = 'resumen' | 'calendario' | 'historial'

const DIAS_SEMANA_CORTOS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']
const INTERVALO_ACTUALIZACION_FRECUENCIA_MS = 30_000

export function PatientDashboard() {
  const [subVista, setSubVista] = useState<SubVista>('resumen')
  const [sesionAbierta, setSesionAbierta] = useState<'entrenamiento' | 'evaluacion' | null>(null)

  const { perfil, token } = useSession()
  const paciente = pacientes.find((p) => p.id === pacienteActualId)!
  const resumen = resumenProgresoDe(pacienteActualId)
  const sesiones = entrenamientosDe(pacienteActualId)
  const evaluaciones = evaluacionesDe(pacienteActualId)

  const diasConEntrenamiento = useMemo(() => new Set(sesiones.map((s) => s.fecha)), [sesiones])
  const diasConEvaluacion = useMemo(() => new Set(evaluaciones.map((s) => s.fecha)), [evaluaciones])

  // El nombre sale de la sesión real; el resto del dashboard todavía es mock.
  const primerNombre =
    (perfil?.rol === 'paciente' && perfil.datos.nombre) || paciente.nombre.split(' ')[0]

  const [historialFrecuencia, setHistorialFrecuencia] = useState<Frecuencia[]>([])

  useEffect(() => {
    let cancelado = false

    async function cargarFrecuencia() {
      if (!token) {
        if (!cancelado) setHistorialFrecuencia([])
        return
      }

      try {
        const datos = await api.paciente.historialFrecuencia(token)
        if (!cancelado) setHistorialFrecuencia(datos)
      } catch {
        // Si no se puede consultar, mantenemos los últimos días recomendados.
      }
    }

    void cargarFrecuencia()

    // Si el médico hizo el cambio en otra pestaña, se vuelve a consultar al
    // regresar al dashboard. El intervalo también mantiene el dato actualizado
    // mientras la pantalla del paciente queda abierta.
    const alVolverALaApp = () => {
      if (document.visibilityState === 'visible') void cargarFrecuencia()
    }
    window.addEventListener('focus', alVolverALaApp)
    document.addEventListener('visibilitychange', alVolverALaApp)
    const intervalo = window.setInterval(() => void cargarFrecuencia(), INTERVALO_ACTUALIZACION_FRECUENCIA_MS)

    return () => {
      cancelado = true
      window.removeEventListener('focus', alVolverALaApp)
      document.removeEventListener('visibilitychange', alVolverALaApp)
      window.clearInterval(intervalo)
    }
  }, [token])

  const historialParaCalendario = useMemo(
    () => [...historialFrecuencia].reverse().map((f) => ({ vigenteDesde: f.vigente_desde, dias: f.dias_semana })),
    [historialFrecuencia],
  )

  // La recomendación se guarda con la fecha real del servidor. Usamos la fecha
  // actual acá (y no HOY, que sólo sostiene los datos mock) para que un cambio
  // hecho hoy aparezca inmediatamente en el calendario del paciente.
  const hoy = new Date()
  const hoyIso = isoArgentina(hoy)
  const semana = useMemo(() => {
    const lunes = new Date(hoy)
    lunes.setHours(12, 0, 0, 0)
    lunes.setDate(lunes.getDate() - ((lunes.getDay() + 6) % 7))

    return Array.from({ length: 7 }, (_, indice) => {
      const fecha = new Date(lunes)
      fecha.setDate(lunes.getDate() + indice)
      const fechaIso = isoArgentina(fecha)
      const recomendado = diasVigentesEn(historialParaCalendario, fechaIso).includes(indice)
      return {
        etiqueta: DIAS_SEMANA_CORTOS[indice],
        fechaIso,
        recomendado,
        esHoy: fechaIso === hoyIso,
      }
    })
  }, [historialParaCalendario, hoyIso])

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
                {semana.map((dia) => (
                  <div
                    key={dia.fechaIso}
                    className={['day', dia.recomendado ? 'done' : '', dia.esHoy ? 'today' : ''].filter(Boolean).join(' ')}
                    title={dia.recomendado ? 'Día recomendado para entrenar' : 'Sin entrenamiento recomendado'}
                  >
                    <div className="day-name">{dia.etiqueta}</div>
                    <div className="day-mark">{dia.recomendado ? '✓' : '—'}</div>
                  </div>
                ))}
              </div>
              <p className="field-hint">Los checks indican los días que recomendó tu médico para entrenar.</p>
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
              <h3>Evaluaciones</h3>
            </div>
            <div className="card">
              <p style={{ fontSize: 13.5, color: 'var(--ink-soft)', marginBottom: 14 }}>
                Tu última evaluación fue el {evaluaciones[0] ? formatearFecha(evaluaciones[0].fecha) : '—'}. La
                evaluación mide qué tan fuerte y eficiente es tu respiración para ajustar la
                resistencia del dispositivo.
              </p>
              <button className="btn btn-outline btn-sm" onClick={() => setSesionAbierta('evaluacion')}>
                Iniciar evaluación
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
            anio={hoy.getFullYear()}
            mes={hoy.getMonth()}
            diasConEntrenamiento={diasConEntrenamiento}
            diasConEvaluacion={diasConEvaluacion}
            historialRecomendaciones={historialParaCalendario}
            hoyIso={hoyIso}
          />
          <p className="invite-note">
            Los días con ✓ son los recomendados por tu médico. Usá las flechas para consultar cualquier mes.
          </p>
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
