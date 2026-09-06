import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

interface ModalProps {
  titulo: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
  /** Contenido de los botones de acción, alineados a la derecha. Si no se pasa, se muestra un botón "Entendido". */
  acciones?: ReactNode
}

/** Modal accesible: cierra con Escape, cierra al click en el backdrop, y mueve el foco al abrirse. */
export function Modal({ titulo, onClose, children, wide, acciones }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    dialogRef.current?.focus()
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        ref={dialogRef}
        className={['modal', wide ? 'modal-wide' : ''].filter(Boolean).join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        tabIndex={-1}
      >
        <h3 id="modal-title">{titulo}</h3>
        {children}
        <div className="modal-actions">
          {acciones ?? (
            <button className="btn btn-teal" onClick={onClose}>
              Entendido
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
