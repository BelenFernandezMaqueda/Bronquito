interface DuckLogoProps {
  className?: string
  spinning?: boolean
}

/** Logo de Bronquito, reutilizado en encabezados y pantallas de carga. */
export function DuckLogo({ className, spinning }: DuckLogoProps) {
  return (
    <img
      className={[className, spinning ? 'spinning' : ''].filter(Boolean).join(' ')}
      src="/bronquito-logo.png"
      alt=""
      aria-hidden="true"
    />
  )
}
