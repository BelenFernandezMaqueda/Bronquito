interface PimTrendChartProps {
  /** Valores ordenados cronológicamente (más antiguo primero). */
  valores: number[]
  /** Una fecha corta por valor, mismo orden y largo que `valores`. */
  fechas: string[]
  caption: string
  /** Texto del eje Y, ej. "PIM (cmH₂O)" o "FVC (L)". */
  etiquetaEje?: string
}

/** Evolución de una métrica a lo largo de las evaluaciones, con ejes X/Y. */
export function PimTrendChart({ valores, fechas, caption, etiquetaEje = 'PIM (cmH₂O)' }: PimTrendChartProps) {
  const w = 340
  const h = 220
  const padLeft = 46
  const padRight = 16
  const padTop = 18
  const padBottom = 30

  const plotW = w - padLeft - padRight
  const plotH = h - padTop - padBottom

  const min = Math.min(...valores)
  const max = Math.max(...valores)
  const rango = max - min || 1

  const puntos = valores.map((v, i) => ({
    x: padLeft + (i / Math.max(valores.length - 1, 1)) * plotW,
    y: padTop + plotH - ((v - min) / rango) * plotH,
  }))

  const puntosStr = puntos.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  // Hasta 3 marcas en Y (mínimo, medio, máximo) para no saturar de números.
  const marcasY = min === max ? [min] : [min, (min + max) / 2, max]

  // Hasta 3 marcas en X (primera, del medio, última) para que las fechas no se pisen.
  const indicesMarcasX =
    valores.length <= 3
      ? valores.map((_, i) => i)
      : [0, Math.round((valores.length - 1) / 2), valores.length - 1]

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label={caption}>
        <text x={padLeft} y={12} fontSize="9.5" fill="#5C7C82" fontFamily="Nunito">
          {etiquetaEje}
        </text>

        {/* eje Y */}
        <line x1={padLeft} y1={padTop} x2={padLeft} y2={padTop + plotH} stroke="#B7CDD2" strokeWidth={1.5} />
        {/* eje X */}
        <line
          x1={padLeft}
          y1={padTop + plotH}
          x2={padLeft + plotW}
          y2={padTop + plotH}
          stroke="#B7CDD2"
          strokeWidth={1.5}
        />

        {marcasY.map((v) => {
          const y = padTop + plotH - ((v - min) / rango) * plotH
          return (
            <g key={v}>
              <line x1={padLeft - 4} y1={y} x2={padLeft} y2={y} stroke="#B7CDD2" strokeWidth={1.5} />
              <text x={padLeft - 8} y={y + 3} fontSize="9" fill="#5C7C82" fontFamily="Nunito" textAnchor="end">
                {v.toFixed(1)}
              </text>
            </g>
          )
        })}

        {indicesMarcasX.map((i) => (
          <text
            key={i}
            x={puntos[i].x}
            y={padTop + plotH + 16}
            fontSize="9"
            fill="#5C7C82"
            fontFamily="Nunito"
            textAnchor="middle"
          >
            {fechas[i]}
          </text>
        ))}

        <polyline points={puntosStr} fill="none" stroke="#F0459A" strokeWidth={3} strokeLinecap="round" />
        {puntos.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="#F0459A" />
        ))}
      </svg>
      <div className="chart-caption">{caption}</div>
    </div>
  )
}
