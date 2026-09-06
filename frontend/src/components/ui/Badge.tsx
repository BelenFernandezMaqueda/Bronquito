import type { EstadoSesion, Adherencia } from '../../types'

const ESTADO_LABEL: Record<EstadoSesion, string> = {
  completa: 'Completa',
  parcial: 'Parcial',
  no_realizada: 'No realizada',
}

const ESTADO_TONO: Record<EstadoSesion, string> = {
  completa: 'badge-good',
  parcial: 'badge-warn',
  no_realizada: 'badge-bad',
}

export function EstadoSesionBadge({ estado }: { estado: EstadoSesion }) {
  return <span className={`badge ${ESTADO_TONO[estado]}`}>{ESTADO_LABEL[estado]}</span>
}

const ADHERENCIA_LABEL: Record<Adherencia, string> = {
  buena: 'Buena adherencia',
  irregular: 'Adherencia irregular',
  sin_actividad: 'Sin actividad reciente',
}

const ADHERENCIA_DOT: Record<Adherencia, string> = {
  buena: 'dot-good',
  irregular: 'dot-warn',
  sin_actividad: 'dot-bad',
}

export function AdherenciaDot({ adherencia }: { adherencia: Adherencia }) {
  return <span className={`dot ${ADHERENCIA_DOT[adherencia]}`} title={ADHERENCIA_LABEL[adherencia]} />
}
