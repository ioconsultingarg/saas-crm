import type { ReactNode } from 'react'
import { SearchX } from 'lucide-react'

interface Props {
  titulo: string
  /** qué hacer para salir del vacío, no un consuelo */
  detalle: string
  Icono?: typeof SearchX
  accion?: ReactNode
  /** tono positivo: el vacío es una buena noticia, no una falla */
  buenaNoticia?: boolean
}

/**
 * Estado vacío. Dos reglas:
 *
 * 1. Dice QUÉ HACER, no sólo que no hay nada. "No hay resultados" deja al
 *    usuario mirando la pantalla; "ningún comercio coincide, probá quitando
 *    la zona" le da la salida.
 * 2. Distingue el vacío que es un problema del que es una buena noticia.
 *    Que no haya clientes en riesgo no es un error: es la mejor semana.
 */
export function Vacio({ titulo, detalle, Icono = SearchX, accion, buenaNoticia }: Props) {
  return (
    <div className="panel p-6 grid gap-3 justify-items-center text-center">
      <Icono
        size={28}
        strokeWidth={1.5}
        aria-hidden="true"
        style={{ color: buenaNoticia ? 'var(--sano)' : 'var(--tinta-suave)' }}
      />
      <h2 className="text-subtitulo font-semibold">{titulo}</h2>
      <p className="text-cuerpo text-tinta-suave" style={{ maxWidth: 420 }}>
        {detalle}
      </p>
      {accion}
    </div>
  )
}
