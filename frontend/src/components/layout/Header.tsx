import { DuckLogo } from '../ui/DuckLogo'
import { WaveBottom } from '../ui/WaveBottom'
import type { Role } from '../../types'
import { medicos, pacientes, pacienteActualId, medicoActualId } from '../../data/mockData'

interface HeaderProps {
  rol: Role
  onCambiarRol: (rol: Role) => void
}

export function Header({ rol, onCambiarRol }: HeaderProps) {
  const paciente = pacientes.find((p) => p.id === pacienteActualId)
  const medico = medicos.find((m) => m.id === medicoActualId)
  const usuario = rol === 'paciente' ? paciente : medico
  const nombreMostrado = rol === 'paciente' ? usuario?.nombre : medico?.nombre
  const inicialesMostradas = usuario?.avatarIniciales ?? '??'

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

        <div className="role-toggle" role="group" aria-label="Cambiar de vista (demo)">
          <button
            className={rol === 'paciente' ? 'active' : ''}
            aria-pressed={rol === 'paciente'}
            onClick={() => onCambiarRol('paciente')}
          >
            Vista paciente
          </button>
          <button
            className={rol === 'medico' ? 'active' : ''}
            aria-pressed={rol === 'medico'}
            onClick={() => onCambiarRol('medico')}
          >
            Vista médico
          </button>
        </div>

        <div className="who">
          <div className="avatar" aria-hidden="true">
            {inicialesMostradas}
          </div>
          <div>
            <div className="who-name">{nombreMostrado}</div>
            <div className="who-role">{rol === 'paciente' ? 'Paciente' : 'Médica'}</div>
          </div>
        </div>
      </div>
      <WaveBottom />
    </header>
  )
}
