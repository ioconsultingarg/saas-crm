import { Component, type ErrorInfo, type ReactNode } from 'react'
import { RotateCcw, TriangleAlert } from 'lucide-react'

interface Props {
  children: ReactNode
  /** se muestra para volver a una vista sana sin recargar */
  alVolver?: () => void
}

interface Estado {
  error: Error | null
  detalle: string | null
}

/**
 * Sin esto, cualquier excepción en una vista deja la pantalla en blanco. En
 * una demo delante de un prospecto ese es el peor final posible: no se ve un
 * error, se ve un producto que no anda.
 *
 * Tiene que ser una clase: React no expone todavía los límites de error como
 * hook.
 */
export class LimiteDeError extends Component<Props, Estado> {
  state: Estado = { error: null, detalle: null }

  static getDerivedStateFromError(error: Error): Partial<Estado> {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    this.setState({ detalle: info.componentStack ?? null })
    // En la demo no hay servidor al que reportar; queda en la consola para
    // que se pueda copiar y pegar.
    console.error('[IO-CRM] Error no controlado:', error, info.componentStack)
  }

  reiniciarDemo = () => {
    try {
      for (const clave of Object.keys(localStorage)) {
        if (clave.startsWith('io-crm:')) localStorage.removeItem(clave)
      }
    } catch {
      /* si el almacenamiento está bloqueado, recargar alcanza */
    }
    window.location.reload()
  }

  volver = () => {
    this.setState({ error: null, detalle: null })
    this.props.alVolver?.()
  }

  render() {
    const { error, detalle } = this.state
    if (!error) return this.props.children

    return (
      <div className="panel p-5 grid gap-4 justify-items-start" style={{ maxWidth: 560 }} role="alert">
        <TriangleAlert size={30} strokeWidth={1.5} aria-hidden="true" style={{ color: 'var(--critico)' }} />

        <div className="grid gap-1">
          <h1 className="font-display text-titulo">Esta pantalla se rompió</h1>
          <p className="text-cuerpo text-tinta-suave">
            El resto de la aplicación sigue funcionando. Podés volver y seguir desde otra vista.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {this.props.alVolver && (
            <button type="button" className="boton boton-primario" onClick={this.volver}>
              Volver al panel
            </button>
          )}
          <button type="button" className="boton boton-secundario" onClick={this.reiniciarDemo}>
            <RotateCcw size={18} strokeWidth={1.5} aria-hidden="true" />
            Reiniciar la demo
          </button>
        </div>

        <details className="w-full">
          <summary className="text-micro text-tinta-suave cursor-pointer">
            Detalle técnico
          </summary>
          <pre
            className="mt-2 p-3 rounded text-micro font-mono overflow-x-auto"
            style={{ background: 'var(--papel)', border: '1px solid var(--pauta)', whiteSpace: 'pre-wrap' }}
          >
            {error.message}
            {detalle ? `\n${detalle.trim()}` : ''}
          </pre>
        </details>
      </div>
    )
  }
}
