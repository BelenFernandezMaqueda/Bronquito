import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { ApiError, api } from '../../api/client'
import type { Sexo } from '../../api/types'
import { useSession } from '../../auth/session'
import { AuthShell } from './AuthShell'

export function RegistroPacientePage() {
  const { iniciarSesion } = useSession()
  const navigate = useNavigate()

  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [dni, setDni] = useState('')
  const [pin, setPin] = useState('')
  const [pin2, setPin2] = useState('')
  const [email, setEmail] = useState('')
  const [altura, setAltura] = useState('')
  const [peso, setPeso] = useState('')
  const [nacimiento, setNacimiento] = useState('')
  const [sexo, setSexo] = useState<Sexo | ''>('')
  const [fumador, setFumador] = useState(false)
  const [acepto, setAcepto] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!/^\d{4}$/.test(pin)) {
      setError('El PIN tiene que ser de 4 dígitos.')
      return
    }
    if (pin !== pin2) {
      setError('Los PIN no coinciden.')
      return
    }
    if (!sexo) {
      setError('Elegí una opción en "Sexo".')
      return
    }
    setEnviando(true)
    try {
      const res = await api.paciente.registro({
        dni: dni.trim(),
        pin,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email.trim(),
        altura_cm: Number(altura),
        peso_kg: Number(peso),
        fecha_nacimiento: nacimiento,
        sexo,
        fumador,
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
    <AuthShell
      titulo="Crear cuenta de paciente"
      subtitulo="Si tu dispositivo ya te generó un DNI y PIN, no hace falta que te registres: entrá directo desde el login."
      wide
    >
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

        <div className="auth-row">
          <div className="field">
            <label htmlFor="dni">DNI</label>
            <input
              id="dni"
              type="text"
              inputMode="numeric"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="email">Mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="auth-row">
          <div className="field">
            <label htmlFor="pin">PIN (4 dígitos)</label>
            <input
              id="pin"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="pin2">Repetir PIN</label>
            <input
              id="pin2"
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin2}
              onChange={(e) => setPin2(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>
        </div>

        <div className="auth-row">
          <div className="field">
            <label htmlFor="altura">Altura (cm)</label>
            <input
              id="altura"
              type="number"
              min="1"
              max="299"
              step="0.1"
              value={altura}
              onChange={(e) => setAltura(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="peso">Peso (kg)</label>
            <input
              id="peso"
              type="number"
              min="1"
              max="499"
              step="0.1"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="auth-row">
          <div className="field">
            <label htmlFor="nacimiento">Fecha de nacimiento</label>
            <input
              id="nacimiento"
              type="date"
              value={nacimiento}
              onChange={(e) => setNacimiento(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="sexo">Sexo</label>
            <select id="sexo" value={sexo} onChange={(e) => setSexo(e.target.value as Sexo)} required>
              <option value="" disabled>
                Elegí una opción
              </option>
              <option value="F">Femenino</option>
              <option value="M">Masculino</option>
              <option value="X">Otro / prefiero no decir</option>
            </select>
          </div>
        </div>

        <label className="field-check">
          <input type="checkbox" checked={fumador} onChange={(e) => setFumador(e.target.checked)} />
          <span>Soy fumador/a.</span>
        </label>

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
