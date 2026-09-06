interface StatCardProps {
  icono: string
  iconoFondo: string
  etiqueta: string
  valor: string
  sub?: string
  subTono?: 'up' | 'down' | 'neutral'
}

export function StatCard({ icono, iconoFondo, etiqueta, valor, sub, subTono = 'neutral' }: StatCardProps) {
  return (
    <div className="card stat-card">
      <div className="stat-icon" style={{ background: iconoFondo }} aria-hidden="true">
        {icono}
      </div>
      <div className="stat-label">{etiqueta}</div>
      <div className="stat-value">{valor}</div>
      {sub && <div className={`stat-sub ${subTono}`}>{sub}</div>}
    </div>
  )
}
