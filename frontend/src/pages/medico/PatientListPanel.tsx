import { useMemo, useState } from 'react'
import type { Paciente } from '../../types'
import { AdherenciaDot } from '../../components/ui/Badge'
import { adherenciaDe, textoUltimaSesion, invitacionesPendientes } from '../../data/mockData'

interface PatientListPanelProps {
  pacientes: Paciente[]
  pacienteSeleccionadoId: string | null
  onSeleccionar: (id: string) => void
  onInvitar: () => void
}

export function PatientListPanel({ pacientes, pacienteSeleccionadoId, onSeleccionar, onInvitar }: PatientListPanelProps) {
  const [busqueda, setBusqueda] = useState('')

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return pacientes
    return pacientes.filter(
      (p) => p.nombre.toLowerCase().includes(q) || p.diagnostico.toLowerCase().includes(q),
    )
  }, [pacientes, busqueda])

  return (
    <div className="card patient-list">
      <div className="search">
        <span aria-hidden="true">🔍</span>
        <label htmlFor="buscar-paciente" className="sr-only">
          Buscar paciente
        </label>
        <input
          id="buscar-paciente"
          placeholder="Buscar paciente…"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      <div role="list" aria-label="Lista de pacientes">
        {filtrados.map((p) => (
          <button
            key={p.id}
            role="listitem"
            className={`patient-item ${p.id === pacienteSeleccionadoId ? 'active' : ''}`}
            onClick={() => onSeleccionar(p.id)}
            aria-current={p.id === pacienteSeleccionadoId}
          >
            <div className="p-avatar" aria-hidden="true">
              {p.avatarIniciales}
            </div>
            <div className="p-info">
              <div className="p-name">{p.nombre}</div>
              <div className="p-sub">{textoUltimaSesion(p.id)}</div>
            </div>
            <AdherenciaDot adherencia={adherenciaDe(p.id)} />
          </button>
        ))}
        {filtrados.length === 0 && <p className="empty-state">No encontramos pacientes con esa búsqueda.</p>}
      </div>

      {invitacionesPendientes.map((inv) => (
        <div className="pending-invite" key={inv.id} title="Invitación pendiente de aceptación">
          <div className="p-avatar" aria-hidden="true">
            ⏳
          </div>
          <div className="p-info">
            <div className="p-name">{inv.nombreOEmailInvitado}</div>
            <div className="p-sub">Invitación pendiente</div>
          </div>
        </div>
      ))}

      <button className="add-patient" onClick={onInvitar}>
        ＋ Invitar paciente
      </button>
      <p className="invite-note">
        Se envía una solicitud de acceso; el paciente debe aceptarla desde su cuenta para que
        puedas ver sus datos.
      </p>
    </div>
  )
}
