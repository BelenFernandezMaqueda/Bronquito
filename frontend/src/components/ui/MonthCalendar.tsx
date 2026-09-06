const DOW = ['L', 'M', 'M', 'J', 'V', 'S', 'D']
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

interface MonthCalendarProps {
  anio: number
  mes: number // 0-11
  fechasConSesion: Set<string>
  hoyIso?: string
}

function isoDe(anio: number, mes: number, dia: number): string {
  return `${anio}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

export function MonthCalendar({ anio, mes, fechasConSesion, hoyIso }: MonthCalendarProps) {
  const primerDiaSemana = (new Date(anio, mes, 1).getDay() + 6) % 7 // 0 = lunes
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()

  const celdas: Array<{ dia: number | null; iso?: string }> = []
  for (let i = 0; i < primerDiaSemana; i++) celdas.push({ dia: null })
  for (let d = 1; d <= diasEnMes; d++) celdas.push({ dia: d, iso: isoDe(anio, mes, d) })

  return (
    <div>
      <div style={{ fontWeight: 800, marginBottom: 4 }}>
        {MESES[mes]} {anio}
      </div>
      <div className="cal-grid" role="grid" aria-label={`Calendario de ${MESES[mes]} ${anio}`}>
        {DOW.map((d, i) => (
          <div className="cal-dow" key={`dow-${i}`} aria-hidden="true">
            {d}
          </div>
        ))}
        {celdas.map((c, i) => {
          if (c.dia === null) return <div className="cal-cell empty" key={`empty-${i}`} aria-hidden="true" />
          const tieneSesion = c.iso ? fechasConSesion.has(c.iso) : false
          const esHoy = c.iso === hoyIso
          return (
            <div
              key={c.iso}
              className={['cal-cell', tieneSesion ? 'has-session' : '', esHoy ? 'is-today' : ''].filter(Boolean).join(' ')}
              title={tieneSesion ? `${c.iso}: sesión realizada` : c.iso}
            >
              {c.dia}
            </div>
          )
        })}
      </div>
    </div>
  )
}
