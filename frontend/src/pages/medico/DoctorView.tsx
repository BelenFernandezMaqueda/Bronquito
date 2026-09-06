import { useState } from 'react'
import { PatientListPanel } from './PatientListPanel'
import { PatientDetail } from './PatientDetail'
import { InvitePatientModal } from './InvitePatientModal'
import { pacientesDeMedico, medicoActualId } from '../../data/mockData'

export function DoctorView() {
  const misPacientes = pacientesDeMedico(medicoActualId)
  const [seleccionadoId, setSeleccionadoId] = useState<string | null>(misPacientes[0]?.id ?? null)
  const [mostrarInvitar, setMostrarInvitar] = useState(false)

  const pacienteSeleccionado = misPacientes.find((p) => p.id === seleccionadoId) ?? null

  return (
    <div id="contenido-principal" className="doctor-layout">
      <PatientListPanel
        pacientes={misPacientes}
        pacienteSeleccionadoId={seleccionadoId}
        onSeleccionar={setSeleccionadoId}
        onInvitar={() => setMostrarInvitar(true)}
      />

      {pacienteSeleccionado ? (
        <PatientDetail paciente={pacienteSeleccionado} />
      ) : (
        <div className="card">
          <p className="empty-state">
            {misPacientes.length === 0
              ? 'Todavía no tenés pacientes vinculados. Invitá al primero con el botón "＋ Invitar paciente".'
              : 'Seleccioná un paciente de la lista para ver su detalle.'}
          </p>
        </div>
      )}

      {mostrarInvitar && (
        <InvitePatientModal onClose={() => setMostrarInvitar(false)} onEnviar={() => {}} />
      )}
    </div>
  )
}
