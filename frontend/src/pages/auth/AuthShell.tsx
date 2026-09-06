import type { ReactNode } from 'react'
import { DuckLogo } from '../../components/ui/DuckLogo'

interface AuthShellProps {
  titulo: string
  subtitulo?: string
  children: ReactNode
  wide?: boolean
}

/** Marco compartido de todas las pantallas de auth: patito + tarjeta centrada. */
export function AuthShell({ titulo, subtitulo, children, wide }: AuthShellProps) {
  return (
    <div className="auth-screen">
      <div className="auth-brand">
        <DuckLogo />
        <div>
          <div className="brand-name">Bronquito</div>
          <div className="brand-tag">La vía para respirar mejor</div>
        </div>
      </div>
      <div className={wide ? 'auth-card wide' : 'auth-card'}>
        <h1>{titulo}</h1>
        {subtitulo && <p className="auth-sub">{subtitulo}</p>}
        {children}
      </div>
    </div>
  )
}
