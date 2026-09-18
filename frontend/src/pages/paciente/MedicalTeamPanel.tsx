import { useEffect, useState } from 'react'

import { ApiError, api } from '../../api/client'
import type { MedicoACargo } from '../../api/types'
import { useSession } from '../../auth/session'

function inicialesDe(nombre: string, apellido: string): string {
  return `${nombre[0] ?? ''}${apellido[0] ?? ''}`.toUpperCase() || 'MD'
}

export function MedicalTeamPanel() {
  const { token } = useSession()
  const [medicos, setMedicos] = useState<MedicoACargo[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    const tokenActual = token
    let cancelado = false

    async function cargarMedicos() {
      try {
        const datos = await api.paciente.medicosACargo(tokenActual)
        if (!cancelado) {
          setMedicos(datos)
          setError(null)
        }
      } catch (err) {
        if (!cancelado) {
          setError(err instanceof ApiError ? err.message : 'No pudimos cargar tus médicos a cargo.')
        }
      } finally {
        if (!cancelado) setCargando(false)
      }
    }

    void cargarMedicos()
    window.addEventListener('focus', cargarMedicos)
    return () => {
      cancelado = true
      window.removeEventListener('focus', cargarMedicos)
    }
  }, [token])

  return (
    <aside className="card patient-list medical-team" aria-labelledby="medicos-a-cargo">
      <div className="medical-team-heading">
        <h2 id="medicos-a-cargo">Médicos a cargo</h2>
        <p>Profesionales con acceso a tu información clínica.</p>
      </div>

      {cargando ? (
        <p className="empty-state">Cargando médicos…</p>
      ) : error ? (
        <p className="empty-state">{error}</p>
      ) : medicos.length === 0 ? (
        <p className="empty-state">Todavía no tenés médicos vinculados.</p>
      ) : (
        <div role="list" aria-label="Médicos con acceso a tu información">
          {medicos.map((medico) => (
            <div className="patient-item medical-team-item" key={medico.id_medico} role="listitem">
              <div className="p-avatar" aria-hidden="true">
                {inicialesDe(medico.nombre, medico.apellido)}
              </div>
              <div className="p-info">
                <div className="p-name">{`${medico.nombre} ${medico.apellido}`.trim()}</div>
                <div className="p-sub">Acceso activo</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  )
}
