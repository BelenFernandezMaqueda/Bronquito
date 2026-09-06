interface DuckLogoProps {
  className?: string
  spinning?: boolean
}

/** El patito de Bronquito, reutilizado como logo, favicon y "loader" del simulador de dispositivo. */
export function DuckLogo({ className, spinning }: DuckLogoProps) {
  return (
    <svg
      className={[className, spinning ? 'spinning' : ''].filter(Boolean).join(' ')}
      viewBox="0 0 120 90"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse cx="55" cy="55" rx="42" ry="35" fill="#FFCB3E" />
      <circle cx="30" cy="35" r="26" fill="#FFCB3E" />
      <circle cx="24" cy="28" r="5" fill="#0C3A44" />
      <circle cx="25.5" cy="26.5" r="1.7" fill="#fff" />
      <path d="M8 33 L-8 30 L8 42 Z" fill="#F2924B" />
    </svg>
  )
}
