interface Punto {
  x: number
  y: number
}

interface FlowVolumeChartProps {
  puntos: Punto[]
  caption: string
}

/** Curva flujo-volumen de una calibración, como polyline SVG (igual que en el mockup). */
export function FlowVolumeChart({ puntos, caption }: FlowVolumeChartProps) {
  const maxX = Math.max(...puntos.map((p) => p.x), 1)
  const maxY = Math.max(...puntos.map((p) => p.y), 1)
  const w = 300
  const h = 110
  const pad = 10

  const escalados = puntos.map((p) => ({
    x: pad + (p.x / maxX) * (w - pad * 2),
    y: h - pad - (p.y / maxY) * (h - pad * 2),
  }))

  const puntosStr = escalados.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${w} ${h + 30}`} width="100%" role="img" aria-label={caption}>
        <polyline points={puntosStr} fill="none" stroke="#12A8C4" strokeWidth={3} strokeLinecap="round" />
        <text x={12} y={h + 22} fontSize="10" fill="#5C7C82" fontFamily="Nunito">
          Flujo (L/s)
        </text>
      </svg>
      <div className="chart-caption">{caption}</div>
    </div>
  )
}
