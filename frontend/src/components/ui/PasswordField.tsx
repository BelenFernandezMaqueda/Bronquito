import { useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import { EyeIcon } from './EyeIcon'

interface PasswordFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'> {
  id: string
  label: string
}

/** Campo de contraseña/PIN con el mismo formato que el resto de los inputs, y un botón para mostrar/ocultar. */
export function PasswordField({ id, label, ...inputProps }: PasswordFieldProps) {
  const [mostrar, setMostrar] = useState(false)

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="password-field">
        <input id={id} type={mostrar ? 'text' : 'password'} {...inputProps} />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setMostrar((actual) => !actual)}
          aria-label={mostrar ? 'Ocultar' : 'Mostrar'}
        >
          <EyeIcon tachado={mostrar} className="icon-16" />
        </button>
      </div>
    </div>
  )
}
