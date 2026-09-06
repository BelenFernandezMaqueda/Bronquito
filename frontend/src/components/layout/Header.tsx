import { DuckLogo } from '../ui/DuckLogo'
import { WaveBottom } from '../ui/WaveBottom'
import { useSession } from '../../auth/session'

function iniciales(nombre: string, apellido: string, fallback: string): string {
  const a = nombre.trim()[0] ?? ''
  const b = apellido.trim()[0] ?? ''
  const ini = (a + b) || fallback.replace(/[^a-zA-Z]/g, '').slice(0, 2)
  return (ini || '??').toUpperCase()
}

export function Header() {
  const { perfil, cerrarSesion } = useSession()

  let nombreMostrado = ''
  let etiquetaRol = ''
  let ini = '??'
  if (perfil?.rol === 'medico') {
    const { nombre, apellido, usuario } = perfil.datos
    nombreMostrado = `${nombre} ${apellido}`.trim() || usuario
    etiquetaRol = 'Médico/a'
    ini = iniciales(nombre, apellido, usuario)
  } else if (perfil?.rol === 'paciente') {
    const { nombre, apellido, email, dni } = perfil.datos
    const nombreCompleto = `${nombre ?? ''} ${apellido ?? ''}`.trim()
    nombreMostrado = nombreCompleto || email || `DNI ${dni}`
    etiquetaRol = 'Paciente'
    ini = iniciales(nombre ?? '', apellido ?? '', email ?? dni)
  }

  return (
    <header className="topwave">
      <a href="#contenido-principal" className="skip-link">
        Saltar al contenido principal
      </a>
      <DuckLogo className="deco" />
      <div className="topbar">
        <div className="brand">
          <DuckLogo className="brand-duck" />
          <div>
            <div className="brand-name">Bronquito</div>
            <div className="brand-tag">La vía para respirar mejor</div>
          </div>
        </div>

        <div className="who">
          <div className="avatar" aria-hidden="true">
            {ini}
          </div>
          <div>
            <div className="who-name">{nombreMostrado}</div>
            <div className="who-role">{etiquetaRol}</div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={cerrarSesion}>
            Salir
          </button>
        </div>
      </div>
      <WaveBottom />
    </header>
  )
}
