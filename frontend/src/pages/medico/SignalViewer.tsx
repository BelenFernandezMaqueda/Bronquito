import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Evaluacion, EvaluacionMuestras } from '../../api/types'
import { ApiError, api } from '../../api/client'
import { useSession } from '../../auth/session'
import { SignalXYChart } from '../../components/ui/SignalXYChart'
import { formatearFecha } from '../../data/mockData'

interface SignalViewerProps {
  idPaciente: number
  evaluacion: Evaluacion
  onVolver: () => void
  /** Busca (o avisa que no existe) la señal del otro tipo en la misma fecha. */
  onCambiarTipo: () => void
  /** Mensaje a mostrar cuando `onCambiarTipo` no encontró una señal del otro tipo. */
  avisoTipo: string | null
  onAnterior?: () => void
  onSiguiente?: () => void
  onUltima?: () => void
}

/** Visor de las señales crudas de una evaluación puntual. Por ahora solo sabe mostrar espirometrías. */
export function SignalViewer({
  idPaciente,
  evaluacion,
  onVolver,
  onCambiarTipo,
  avisoTipo,
  onAnterior,
  onSiguiente,
  onUltima,
}: SignalViewerProps) {
  const { token } = useSession()
  const [muestras, setMuestras] = useState<EvaluacionMuestras | null>(null)
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const [altoGrilla, setAltoGrilla] = useState(420)

  useEffect(() => {
    if (!token) return
    let cancelado = false
    setCargando(true)
    setError(null)
    api.medico
      .muestrasDeEvaluacion(token, idPaciente, evaluacion.id_evaluacion)
      .then((datos) => {
        if (!cancelado) setMuestras(datos)
      })
      .catch((err) => {
        if (cancelado) return
        setError(err instanceof ApiError ? err.message : 'No pudimos cargar la curva de esta evaluación.')
      })
      .finally(() => {
        if (!cancelado) setCargando(false)
      })
    return () => {
      cancelado = true
    }
  }, [token, idPaciente, evaluacion.id_evaluacion])

  // Calcula cuánto espacio vertical queda libre debajo de la grilla para que los
  // cuatro gráficos entren sin scrollear, sin importar el alto de la ventana.
  useLayoutEffect(() => {
    function recalcular() {
      const el = gridRef.current
      if (!el) return
      const top = el.getBoundingClientRect().top
      // deja lugar al padding inferior de main (60px), más un margen de seguridad.
      const disponible = window.innerHeight - top - 70
      setAltoGrilla(Math.max(disponible, 320))
    }
    recalcular()
    window.addEventListener('resize', recalcular)
    return () => window.removeEventListener('resize', recalcular)
  }, [muestras])

  return (
    <div>
      <div className="signal-viewer-header">
        <button className="btn btn-red btn-sm" onClick={onVolver}>
          ← Volver
        </button>
        <button className="btn btn-outline btn-sm" onClick={onAnterior} disabled={!onAnterior} title="Evaluación anterior">
          ◀ Anterior
        </button>
        <button className="btn btn-outline btn-sm" onClick={onSiguiente} disabled={!onSiguiente} title="Evaluación siguiente">
          Siguiente ▶
        </button>
        <button className="btn btn-outline btn-sm" onClick={onUltima} disabled={!onUltima} title="Ir a la última evaluación">
          Ir a última evaluación
        </button>

        <h3>
          <button className="signal-tipo-toggle" onClick={onCambiarTipo} title="Ver la otra señal de esta fecha">
            {evaluacion.tipo === 'ESPIROMETRIA' ? 'Espirometría' : 'PIM'}
          </button>{' '}
          · {formatearFecha(evaluacion.fecha_hora)}
        </h3>
      </div>

      {avisoTipo && <p className="empty-state mt-16">{avisoTipo}</p>}

      {cargando ? (
        <p className="empty-state">Cargando curva…</p>
      ) : error ? (
        <p className="empty-state">{error}</p>
      ) : !muestras ? null : evaluacion.tipo === 'ESPIROMETRIA' ? (
        <div ref={gridRef} className="grid cols-2 signal-grid" style={{ height: altoGrilla }}>
          <SignalXYChart
            x={muestras.tiempo}
            y={muestras.flujo}
            etiquetaX="Tiempo (s)"
            etiquetaY="Flujo (L/s)"
            caption="Flujo en función del tiempo"
            color="#2FA7A0"
          />
          <SignalXYChart
            x={muestras.tiempo}
            y={muestras.volumen}
            etiquetaX="Tiempo (s)"
            etiquetaY="Volumen (L)"
            caption="Volumen en función del tiempo"
            color="#F0459A"
          />
          <SignalXYChart
            x={muestras.volumen}
            y={muestras.flujo}
            etiquetaX="Volumen (L)"
            etiquetaY="Flujo (L/s)"
            caption="Curva flujo-volumen"
            color="#7C5CF0"
          />
          <SignalXYChart
            x={muestras.tiempo}
            y={muestras.presion}
            etiquetaX="Tiempo (s)"
            etiquetaY="Presión (cmH₂O)"
            caption="Presión en función del tiempo"
            color="#E0A030"
          />
        </div>
      ) : (
        <div ref={gridRef} className="grid cols-2 signal-grid signal-grid-rows-1" style={{ height: altoGrilla }}>
          <SignalXYChart
            x={muestras.tiempo}
            y={muestras.presion}
            etiquetaX="Tiempo (s)"
            etiquetaY="Presión (cmH₂O)"
            caption="Presión en función del tiempo"
            color="#E0A030"
          />
          <SignalXYChart
            x={muestras.tiempo}
            y={muestras.flujo}
            etiquetaX="Tiempo (s)"
            etiquetaY="Flujo (L/s)"
            caption="Flujo en función del tiempo"
            color="#2FA7A0"
          />
        </div>
      )}
    </div>
  )
}
