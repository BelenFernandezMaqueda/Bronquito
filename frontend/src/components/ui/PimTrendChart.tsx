interface PimTrendChartProps {
  /** Puntos ordenados cronológicamente (más antiguo primero). */
  valores: number[]
  caption: string
}

/** Evolución de PIM a lo largo de las calibraciones, como polyline SVG. */
export function PimTrendChart({ valores, caption }: PimTrendChartProps) {
  const w = 300
  const h = 110
  const pad = 10
  const min = Math.min(...valores)
  const max = Math.max(...valores)
  const rango = max - min || 1

  const puntos = valores.map((v, i) => {
    const x = pad + (i / Math.max(valores.length - 1, 1)) * (w - pad * 2)
    const y = h - pad - ((v - min) / rango) * (h - pad * 2)
    return { x, y }
  })

  const puntosStr = puntos.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const ultimo = puntos[puntos.length - 1]

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${w} ${h + 30}`} width="100%" role="img" aria-label={caption}>
        <polyline points={puntosStr} fill="none" stroke="#F0459A" strokeWidth={3} strokeLinecap="round" />
        {ultimo && <circle cx={ultimo.x} cy={ultimo.y} r={4} fill="#F0459A" />}
        <text x={12} y={h + 22} fontSize="10" fill="#5C7C82" fontFamily="Nunito">
          PIM (cmH₂O) en el tiempo
        </text>
      </svg>
      <div className="chart-caption">{caption}</div>
    </div>
  )
}
