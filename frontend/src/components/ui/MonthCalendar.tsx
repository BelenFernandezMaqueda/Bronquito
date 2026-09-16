import { useLayoutEffect, useRef, useState } from 'react'

const DOW = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

/** Una recomendación vigente desde una fecha (ISO) en adelante, hasta la siguiente del historial. */
export interface RecomendacionVigente {
  vigenteDesde: string
  dias: number[]
}

interface MonthCalendarProps {
  /** Año y mes que se muestran al montar el calendario — después se navega con las flechitas. */
  anio: number
  mes: number // 0-11
  /** Días (ISO) con una evaluación registrada — cinta clickeable. */
  diasConEvaluacion?: Set<string>
  /** Días (ISO) con un entrenamiento registrado — cinta rosa. */
  diasConEntrenamiento?: Set<string>
  /** Historial de recomendaciones, en cualquier orden — se resuelve cuál regía en cada fecha. */
  historialRecomendaciones?: RecomendacionVigente[]
  hoyIso?: string
  onClickEvaluacion?: (iso: string) => void
}

function isoDe(anio: number, mes: number, dia: number): string {
  return `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

/**
 * Días recomendados que regían en `iso`: la recomendación con el
 * `vigenteDesde` más reciente que sea <= iso. Si hay empate (dos cambios el
 * mismo día), gana la última del array — pasar `historial` ordenado del más
 * viejo al más nuevo.
 */
function diasVigentesEn(historial: RecomendacionVigente[], iso: string): number[] {
  let elegida: RecomendacionVigente | null = null
  for (const r of historial) {
    if (r.vigenteDesde > iso) continue
    if (!elegida || r.vigenteDesde >= elegida.vigenteDesde) elegida = r
  }
  return elegida?.dias ?? []
}

export function MonthCalendar({
  anio,
  mes,
  diasConEvaluacion = new Set(),
  diasConEntrenamiento = new Set(),
  historialRecomendaciones = [],
  hoyIso,
  onClickEvaluacion,
}: MonthCalendarProps) {
  const [{ anio: anioActual, mes: mesActual }, setMesMostrado] = useState({ anio, mes })

  function irMesAnterior() {
    setMesMostrado((actual) =>
      actual.mes === 0 ? { anio: actual.anio - 1, mes: 11 } : { anio: actual.anio, mes: actual.mes - 1 },
    )
  }

  function irMesSiguiente() {
    setMesMostrado((actual) =>
      actual.mes === 11 ? { anio: actual.anio + 1, mes: 0 } : { anio: actual.anio, mes: actual.mes + 1 },
    )
  }

  const primerDiaSemana = (new Date(anioActual, mesActual, 1).getDay() + 6) % 7 // 0 = lunes
  const diasEnMes = new Date(anioActual, mesActual + 1, 0).getDate()
  const filas = Math.ceil((primerDiaSemana + diasEnMes) / 7)

  const celdas: Array<{ dia: number | null; iso?: string; diaSemana?: number }> = []
  for (let i = 0; i < primerDiaSemana; i++) celdas.push({ dia: null })
  for (let d = 1; d <= diasEnMes; d++) {
    celdas.push({
      dia: d,
      iso: isoDe(anioActual, mesActual, d),
      diaSemana: (new Date(anioActual, mesActual, d).getDay() + 6) % 7,
    })
  }

  const gridRef = useRef<HTMLDivElement>(null)
  const [altoGrilla, setAltoGrilla] = useState(420)

  // Calcula cuánto espacio vertical queda libre para que se vea el mes entero
  // sin scrollear, sin importar el alto de la ventana ni cuántas semanas tenga.
  useLayoutEffect(() => {
    function recalcular() {
      const el = gridRef.current
      if (!el) return
      const top = el.getBoundingClientRect().top
      const disponible = window.innerHeight - top - 70
      setAltoGrilla(Math.max(disponible, 260))
    }
    recalcular()
    window.addEventListener('resize', recalcular)
    return () => window.removeEventListener('resize', recalcular)
  }, [filas])

  return (
    <div>
      <div className="cal-header">
        <button type="button" className="cal-nav-btn" onClick={irMesAnterior} aria-label="Mes anterior">
          ‹
        </button>
        <div className="cal-titulo">
          {MESES[mesActual]} {anioActual}
        </div>
        <button type="button" className="cal-nav-btn" onClick={irMesSiguiente} aria-label="Mes siguiente">
          ›
        </button>
      </div>
      <div
        ref={gridRef}
        className="cal-grid"
        role="grid"
        aria-label={`Calendario de ${MESES[mesActual]} ${anioActual}`}
        style={{ height: altoGrilla, gridTemplateRows: `auto repeat(${filas}, 1fr)` }}
      >
        {DOW.map((d, i) => (
          <div className="cal-dow" key={`dow-${i}`} aria-hidden="true">
            {d}
          </div>
        ))}
        {celdas.map((c, i) => {
          if (c.dia === null) return <div className="cal-cell empty" key={`empty-${i}`} aria-hidden="true" />
          const tieneEvaluacion = c.iso ? diasConEvaluacion.has(c.iso) : false
          const tieneEntrenamiento = c.iso ? diasConEntrenamiento.has(c.iso) : false
          const esRecomendado =
            c.iso !== undefined &&
            c.diaSemana !== undefined &&
            diasVigentesEn(historialRecomendaciones, c.iso).includes(c.diaSemana)
          const esHoy = c.iso === hoyIso
          return (
            <div
              key={c.iso}
              className={['cal-cell', esRecomendado ? 'is-recomendado' : '', esHoy ? 'is-today' : '']
                .filter(Boolean)
                .join(' ')}
              title={esRecomendado ? `${c.iso}: día recomendado para entrenar` : c.iso}
            >
              <span className="cal-day-number">{c.dia}</span>
              <div className="cal-ribbons">
                {tieneEvaluacion &&
                  (onClickEvaluacion ? (
                    <button
                      type="button"
                      className="cal-ribbon cal-ribbon-evaluacion"
                      onClick={() => c.iso && onClickEvaluacion(c.iso)}
                      title="Ver evaluación de este día"
                    >
                      Evaluación
                    </button>
                  ) : (
                    <div className="cal-ribbon cal-ribbon-evaluacion" title="Evaluación registrada">
                      Evaluación
                    </div>
                  ))}
                {tieneEntrenamiento && (
                  <div className="cal-ribbon cal-ribbon-entrenamiento" title="Entrenamiento registrado">
                    Entrenamiento
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
