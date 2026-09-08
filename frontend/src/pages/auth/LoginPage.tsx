import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ApiError, api } from '../../api/client'
import { useSession } from '../../auth/session'
import { AuthShell } from './AuthShell'

type Tab = 'paciente' | 'medico'

export function LoginPage() {
  const { iniciarSesion } = useSession()
  const navigate = useNavigate()

  const [tab, setTab] = useState<Tab>('paciente')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  // paciente
  const [dni, setDni] = useState('')
  const [pin, setPin] = useState('')
  // medico
  const [usuario, setUsuario] = useState('')
  const [contrasena, setContrasena] = useState('')

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      const res =
        tab === 'paciente'
          ? await api.paciente.login({ dni: dni.trim(), pin })
          : await api.medico.login({ usuario: usuario.trim(), contrasena })
      await iniciarSesion(res.access_token, res.rol)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo iniciar sesión.')
      setEnviando(false)
    }
  }

  return (
    <AuthShell titulo="Iniciar sesión" subtitulo="Entrá para ver tu entrenamiento y tus calibraciones.">
      <div className="auth-tabs" role="tablist" aria-label="Tipo de cuenta">
        <button
          role="tab"
          aria-selected={tab === 'paciente'}
          className={tab === 'paciente' ? 'active' : ''}
          onClick={() => {
            setTab('paciente')
            setError(null)
          }}
        >
          Soy paciente
        </button>
        <button
          role="tab"
          aria-selected={tab === 'medico'}
          className={tab === 'medico' ? 'active' : ''}
          onClick={() => {
            setTab('medico')
            setError(null)
          }}
        >
          Soy médico/a
        </button>
      </div>

      {error && <div className="auth-alert error">{error}</div>}

      <form onSubmit={onSubmit}>
        {tab === 'paciente' ? (
          <>
            <div className="field">
              <label htmlFor="dni">DNI</label>
              <input
                id="dni"
                type="text"
                inputMode="numeric"
                autoComplete="username"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="pin">PIN (4 dígitos)</label>
              <input
                id="pin"
                type="password"
                inputMode="numeric"
                autoComplete="current-password"
                maxLength={4}
                pattern="\d{4}"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
          </>
        ) : (
          <>
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
              <label htmlFor="contrasena">Contraseña</label>
              <input
                id="contrasena"
                type="password"
                autoComplete="current-password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
            </div>
          </>
        )}

        <button type="submit" className="btn btn-teal btn-block" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>

      <div className="auth-links">
        <Link to="/recuperar">
          {tab === 'paciente' ? '¿Olvidaste tu PIN?' : '¿Olvidaste tu contraseña?'}
        </Link>
        <span>
          ¿No tenés cuenta?{' '}
          <Link to={tab === 'paciente' ? '/registro/paciente' : '/registro/medico'}>
            Registrate
          </Link>
        </span>
      </div>
    </AuthShell>
  )
}
