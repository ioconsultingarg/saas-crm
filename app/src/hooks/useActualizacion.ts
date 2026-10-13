import { useEffect, useState } from 'react'
import { registerSW } from 'virtual:pwa-register'

/**
 * El service worker esta en modo `prompt`: instala la version nueva pero no
 * la activa hasta que alguien la acepta. Sin un aviso que permita aceptarla,
 * la actualizacion queda esperando para siempre y la app sigue mostrando la
 * version vieja aunque el servidor ya tenga la nueva.
 *
 * Se eligio `prompt` y no `autoUpdate` a proposito: una recarga automatica en
 * mitad de una demo, delante de un prospecto, es peor que un aviso.
 */

let aplicar: ((recargar?: boolean) => Promise<void>) | null = null
let registrado = false
let hayPendiente = false
const oyentes = new Set<(hay: boolean) => void>()

function avisar(valor: boolean) {
  hayPendiente = valor
  for (const oyente of oyentes) oyente(valor)
}

export function useActualizacion() {
  const [hay, setHay] = useState(hayPendiente)

  useEffect(() => {
    oyentes.add(setHay)

    if (!registrado) {
      registrado = true
      aplicar = registerSW({
        immediate: true,
        onNeedRefresh: () => avisar(true),
        onRegisterError: (e) => console.error('[IO-CRM] No se pudo registrar el service worker:', e),
      })
    }

    return () => {
      oyentes.delete(setHay)
    }
  }, [])

  return {
    hay,
    /** activa la version nueva y recarga */
    actualizar: () => {
      avisar(false)
      void aplicar?.(true)
    },
  }
}
