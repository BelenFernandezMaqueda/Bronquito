import { useState } from 'react'
import { Modal } from '../../components/ui/Modal'

interface InvitePatientModalProps {
  onClose: () => void
  onEnviar: (emailOTelefono: string) => void
}

/**
 * Flujo de alta de paciente por parte del médico: se envía una solicitud de
 * acceso y el paciente debe aceptarla desde su cuenta para que el médico
 * pueda ver sus datos. No todos los médicos ven a todos los pacientes.
 */
export function InvitePatientModal({ onClose, onEnviar }: InvitePatientModalProps) {
  const [valor, setValor] = useState('')
  const [enviado, setEnviado] = useState(false)

  if (enviado) {
    return (
      <Modal titulo="Invitación enviada" onClose={onClose}>
        <p>
          Le enviamos una solicitud de acceso a <strong>{valor}</strong>. Vas a poder ver su
          información clínica apenas la acepte desde su cuenta.
        </p>
      </Modal>
    )
  }

  return (
    <Modal
      titulo="Invitar paciente"
      onClose={onClose}
      wide
      acciones={
        <>
          <button className="btn btn-outline" onClick={onClose}>
            Cancelar
          </button>
          <button
            className="btn btn-teal"
            disabled={!valor.trim()}
            onClick={() => {
              onEnviar(valor.trim())
              setEnviado(true)
            }}
          >
            Enviar invitación
          </button>
        </>
      }
    >
      <p>Invitá a un paciente para empezar a supervisar su entrenamiento y sus calibraciones.</p>
      <div className="field">
        <label htmlFor="invite-email">Email o teléfono del paciente</label>
        <input
          id="invite-email"
          type="text"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="nombre@mail.com"
          autoFocus
        />
      </div>
      <p className="invite-note">
        Se envía una solicitud de acceso; el paciente debe aceptarla desde su cuenta para que
        puedas ver sus datos. Hasta entonces va a figurar como "pendiente" en tu lista.
      </p>
    </Modal>
  )
}
