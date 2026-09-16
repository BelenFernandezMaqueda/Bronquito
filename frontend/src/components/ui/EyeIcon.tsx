interface EyeIconProps {
  /** true = el campo está mostrando el valor en texto plano (ojo tachado). */
  tachado: boolean
  className?: string
}

/** Ícono de ojo para mostrar/ocultar contraseñas y PIN. */
export function EyeIcon({ tachado, className }: EyeIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M1 10.5C2.8 6.4 6.2 3.8 10 3.8s7.2 2.6 9 6.7c-1.8 4.1-5.2 6.7-9 6.7S2.8 14.6 1 10.5z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10.5" r="2.3" stroke="currentColor" strokeWidth="1.5" />
      {tachado && (
        <line x1="2.5" y1="2.5" x2="17.5" y2="18.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      )}
    </svg>
  )
}
