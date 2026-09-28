import { useEffect } from 'react'
import { Undo2 } from 'lucide-react'

interface Props {
  texto: string
  alDeshacer?: () => void
  alCerrar: () => void
  /** ms; 6 segundos por defecto */
  duracion?: number
}

export function Aviso({ texto, alDeshacer, alCerrar, duracion = 6000 }: Props) {
  useEffect(() => {
    const t = window.setTimeout(alCerrar, duracion)
    return () => window.clearTimeout(t)
  }, [alCerrar, duracion])

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-0 right-0 z-50 flex justify-center px-4 no-imprimir"
      style={{ bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="panel shadow-panel flex items-center gap-3 px-4 py-2">
        <span className="text-dato">{texto}</span>
        {alDeshacer && (
          <button type="button" className="boton boton-sutil" onClick={alDeshacer}>
            <Undo2 size={16} strokeWidth={1.5} aria-hidden="true" />
            Deshacer
          </button>
        )}
      </div>
    </div>
  )
}
