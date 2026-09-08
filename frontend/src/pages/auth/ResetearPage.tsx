import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { ApiError, api } from '../../api/client'
import { AuthShell } from './AuthShell'

interface ResetearPageProps {
  modo: 'contrasena' | 'pin'
}

export function ResetearPage({ modo }: ResetearPageProps) {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''

  const [valor, setValor] = useState('')
  const [valor2, setValor2] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [listo, setListo] = useState(false)

  const esPin = modo === 'pin'
  const etiqueta = esPin ? 'PIN' : 'contraseña'

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (valor !== valor2) {
      setError(`${esPin ? 'Los PIN' : 'Las contraseñas'} no coinciden.`)
      return
    }
    if (esPin && !/^\d{4}$/.test(valor)) {
      setError('El PIN tiene que ser de 4 dígitos.')
      return
    }
    if (!esPin && valor.length < 8) {
      setError('La contraseña tiene que tener al menos 8 caracteres.')
      return
    }
    setEnviando(true)
    try {
      if (esPin) await api.paciente.resetearPin(token, valor)
      else await api.medico.resetearContrasena(token, valor)
      setListo(true)
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo cambiar la credencial.')
      setEnviando(false)
    }
  }

  if (!token) {
    return (
      <AuthShell titulo={`Cambiar ${etiqueta}`}>
        <div className="auth-alert error">
          El link es inválido: falta el token. Pedí uno nuevo desde "¿Olvidaste tu {etiqueta}?".
        </div>
        <div className="auth-links">
          <Link to="/recuperar">← Pedir un link nuevo</Link>
        </div>
      </AuthShell>
    )
  }

  if (listo) {
    return (
      <AuthShell titulo={`${esPin ? 'PIN' : 'Contraseña'} actualizado`}>
        <div className="auth-alert ok">
          Listo. Ya podés iniciar sesión con {esPin ? 'tu nuevo PIN' : 'tu nueva contraseña'}.
        </div>
        <div className="auth-links">
          <Link to="/login">Ir al login →</Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell titulo={`Elegí tu ${esPin ? 'nuevo PIN' : 'nueva contraseña'}`}>
      {error && <div className="auth-alert error">{error}</div>}

      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="valor">{esPin ? 'Nuevo PIN (4 dígitos)' : 'Nueva contraseña (mín. 8)'}</label>
          <input
            id="valor"
            type="password"
            inputMode={esPin ? 'numeric' : undefined}
            maxLength={esPin ? 4 : undefined}
            autoComplete="new-password"
            value={valor}
            onChange={(e) => setValor(esPin ? e.target.value.replace(/\D/g, '') : e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label htmlFor="valor2">Repetir {esPin ? 'PIN' : 'contraseña'}</label>
          <input
            id="valor2"
            type="password"
            inputMode={esPin ? 'numeric' : undefined}
            maxLength={esPin ? 4 : undefined}
            autoComplete="new-password"
            value={valor2}
            onChange={(e) => setValor2(esPin ? e.target.value.replace(/\D/g, '') : e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-teal btn-block" disabled={enviando}>
          {enviando ? 'Guardando…' : `Cambiar ${etiqueta}`}
        </button>
      </form>

      <div className="auth-links">
        <Link to="/login">← Volver al login</Link>
      </div>
    </AuthShell>
  )
}
