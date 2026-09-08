import { useState } from 'react'
import type { FormEvent } from 'react'

import { ApiError, api } from '../../api/client'
import type { PacientePerfilUpdateBody } from '../../api/types'
import { useSession } from '../../auth/session'
import { AuthShell } from '../auth/AuthShell'

/**
 * Pantalla bloqueante para cuentas de paciente que vienen del dispositivo
 * incompletas (sin nombre, sin mail, o sin aceptar los términos): no las
 * dejamos entrar al dashboard hasta que completen esos datos. El backend lo
 * señala con `perfil_completo: false`.
 */
export function CompletarPerfilPage() {
  const { token, perfil, cerrarSesion, refrescarPerfil } = useSession()
  const datos = perfil?.rol === 'paciente' ? perfil.datos : null

  const faltaNombre = !datos?.nombre || !datos?.apellido
  const faltaEmail = !datos?.email

  const [nombre, setNombre] = useState(datos?.nombre ?? '')
  const [apellido, setApellido] = useState(datos?.apellido ?? '')
  const [email, setEmail] = useState(datos?.email ?? '')
  const [acepto, setAcepto] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!token) return
    setError(null)
    setEnviando(true)
    try {
      const body: PacientePerfilUpdateBody = { acepto_terminos: true }
      if (faltaNombre) {
        body.nombre = nombre.trim()
        body.apellido = apellido.trim()
      }
      if (faltaEmail) body.email = email.trim()

      await api.paciente.actualizarPerfil(token, body)
      await refrescarPerfil()
      // El guard de rutas detecta perfil_completo y deja pasar al dashboard.
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo guardar. Probá de nuevo.')
      setEnviando(false)
    }
  }

  return (
    <AuthShell
      titulo="Completá tu perfil"
      subtitulo="Tu cuenta se creó desde el dispositivo. Necesitamos unos datos más para que tu médico pueda identificarte y para poder ayudarte a recuperar el acceso si lo perdés."
    >
      {error && <div className="auth-alert error">{error}</div>}

      <form onSubmit={onSubmit}>
        {faltaNombre && (
          <div className="auth-row">
            <div className="field">
              <label htmlFor="nombre">Nombre</label>
              <input
                id="nombre"
                type="text"
                autoComplete="given-name"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="apellido">Apellido</label>
              <input
                id="apellido"
                type="text"
                autoComplete="family-name"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                required
              />
            </div>
          </div>
        )}

        {faltaEmail && (
          <div className="field">
            <label htmlFor="email">Tu mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        )}

        <label className="field-check">
          <input type="checkbox" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} />
          <span>Acepto los términos y la política de privacidad de Bronquito.</span>
        </label>

        <button type="submit" className="btn btn-teal btn-block" disabled={enviando || !acepto}>
          {enviando ? 'Guardando…' : 'Guardar y continuar'}
        </button>
      </form>

      <div className="auth-links">
        <button className="link" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </div>
    </AuthShell>
  )
}
