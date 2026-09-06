import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ApiError, api } from '../../api/client'
import { useSession } from '../../auth/session'
import { AuthShell } from './AuthShell'

export function RegistroMedicoPage() {
  const { iniciarSesion } = useSession()
  const navigate = useNavigate()

  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [contrasena2, setContrasena2] = useState('')
  const [acepto, setAcepto] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (contrasena !== contrasena2) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (contrasena.length < 8) {
      setError('La contraseña tiene que tener al menos 8 caracteres.')
      return
    }
    setEnviando(true)
    try {
      const res = await api.medico.registro({
        usuario: usuario.trim(),
        contrasena,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        acepto_terminos: acepto,
      })
      await iniciarSesion(res.access_token, res.rol)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo crear la cuenta.')
      setEnviando(false)
    }
  }

  return (
    <AuthShell titulo="Crear cuenta de médico/a" subtitulo="Registrate con tu mail y una contraseña.">
      {error && <div className="auth-alert error">{error}</div>}

      <form onSubmit={onSubmit}>
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
        <div className="field">
          <label htmlFor="usuario">Mail</label>
          <input
            id="usuario"
            type="email"
            autoComplete="username"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="contrasena">Contraseña (mín. 8 caracteres)</label>
          <input
            id="contrasena"
            type="password"
            autoComplete="new-password"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="contrasena2">Repetir contraseña</label>
          <input
            id="contrasena2"
            type="password"
            autoComplete="new-password"
            value={contrasena2}
            onChange={(e) => setContrasena2(e.target.value)}
            required
          />
        </div>

        <label className="field-check">
          <input type="checkbox" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} />
          <span>Acepto los términos y la política de privacidad de Bronquito.</span>
        </label>

        <button type="submit" className="btn btn-teal btn-block" disabled={enviando || !acepto}>
          {enviando ? 'Creando…' : 'Crear cuenta'}
        </button>
      </form>

      <div className="auth-links">
        <span>
          ¿Ya tenés cuenta? <Link to="/login">Iniciá sesión</Link>
        </span>
      </div>
    </AuthShell>
  )
}
