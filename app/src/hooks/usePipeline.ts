import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Etapa, Oportunidad } from '../tipos-crm'
import { OPORTUNIDADES } from '../data/crm'

const CLAVE = 'io-crm:pipeline'

type Movimientos = Record<string, Etapa>

function leer(): Movimientos {
  try {
    const crudo = localStorage.getItem(CLAVE)
    return crudo ? (JSON.parse(crudo) as Movimientos) : {}
  } catch {
    return {}
  }
}

/**
 * Los movimientos del tablero durante la demo se guardan aparte de los datos
 * semilla, para poder reiniciar sin tocar la fuente.
 */
export function usePipeline() {
  const [movimientos, setMovimientos] = useState<Movimientos>(leer)
  const [ultimo, setUltimo] = useState<{ id: string; anterior: Etapa } | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(movimientos))
    } catch {
      /* la sesión sigue en memoria */
    }
  }, [movimientos])

  const oportunidades: Oportunidad[] = useMemo(
    () => OPORTUNIDADES.map((o) => (movimientos[o.id] ? { ...o, etapa: movimientos[o.id] } : o)),
    [movimientos],
  )

  const mover = useCallback(
    (id: string, etapa: Etapa) => {
      const actual = oportunidades.find((o) => o.id === id)
      if (!actual || actual.etapa === etapa) return
      setUltimo({ id, anterior: actual.etapa })
      setMovimientos((m) => ({ ...m, [id]: etapa }))
    },
    [oportunidades],
  )

  const deshacer = useCallback(() => {
    if (!ultimo) return
    setMovimientos((m) => ({ ...m, [ultimo.id]: ultimo.anterior }))
    setUltimo(null)
  }, [ultimo])

  const reiniciar = useCallback(() => {
    setMovimientos({})
    setUltimo(null)
  }, [])

  return { oportunidades, mover, deshacer, reiniciar, ultimo, hayCambios: Object.keys(movimientos).length > 0 }
}
