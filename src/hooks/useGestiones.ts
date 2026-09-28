import { useCallback, useEffect, useState } from 'react'
import type { GestionRegistrada, ResultadoGestion } from '../tipos'

const CLAVE = 'io-crm:gestiones'

function leer(): GestionRegistrada[] {
  try {
    const crudo = localStorage.getItem(CLAVE)
    if (!crudo) return []
    const v = JSON.parse(crudo)
    return Array.isArray(v) ? (v as GestionRegistrada[]) : []
  } catch {
    return []
  }
}

/**
 * Las gestiones que se registran durante la demo. Persisten al recargar y
 * el boton "Reiniciar demo" las borra.
 */
export function useGestiones() {
  const [gestiones, setGestiones] = useState<GestionRegistrada[]>(leer)

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(gestiones))
    } catch {
      /* sin persistencia; la sesion sigue funcionando en memoria */
    }
  }, [gestiones])

  const registrar = useCallback((clienteId: string, resultado: ResultadoGestion, nota?: string) => {
    setGestiones((g) => [
      ...g.filter((x) => x.clienteId !== clienteId),
      { clienteId, resultado, nota, cuando: Date.now() },
    ])
  }, [])

  const deshacer = useCallback((clienteId: string) => {
    setGestiones((g) => g.filter((x) => x.clienteId !== clienteId))
  }, [])

  const reiniciar = useCallback(() => setGestiones([]), [])

  const porCliente = useCallback(
    (clienteId: string) => gestiones.find((x) => x.clienteId === clienteId),
    [gestiones],
  )

  return { gestiones, registrar, deshacer, reiniciar, porCliente }
}
