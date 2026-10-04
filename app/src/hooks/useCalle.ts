import { useCallback, useEffect, useMemo, useState } from 'react'
import type { EstadoVisita, LineaPedido, UnidadLogistica, Visita } from '../tipos-calle'
import { PEDIDOS, VISITAS_DE_HOY, articuloDe } from '../data/calle'
import { precioDe } from '../lib/calle'

const CLAVE_VISITAS = 'io-crm:visitas'
const CLAVE_CARRITO = 'io-crm:carrito'
const CLAVE_COLA = 'io-crm:cola'

type CambiosVisita = Record<string, Partial<Visita>>

function leer<T>(clave: string, porDefecto: T): T {
  try {
    const crudo = localStorage.getItem(clave)
    return crudo ? (JSON.parse(crudo) as T) : porDefecto
  } catch {
    return porDefecto
  }
}

function guardar(clave: string, valor: unknown) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor))
  } catch {
    /* sin persistencia: la sesión sigue en memoria */
  }
}

/** Coordenada aproximada del AMBA sur, para el sello de check-in de la demo. */
const sello = () => ({
  hora: new Date().toTimeString().slice(0, 5),
  coord: { lat: -34.72 + (Math.random() - 0.5) * 0.18, lng: -58.39 + (Math.random() - 0.5) * 0.22 },
  precision: 8 + Math.floor(Math.random() * 14),
})

export interface Carrito {
  empresaId: string
  visitaId?: string
  lineas: LineaPedido[]
}

export function useCalle() {
  const [cambios, setCambios] = useState<CambiosVisita>(() => leer(CLAVE_VISITAS, {}))
  const [carrito, setCarrito] = useState<Carrito | null>(() => leer<Carrito | null>(CLAVE_CARRITO, null))
  const [cola, setCola] = useState<string[]>(() => leer<string[]>(CLAVE_COLA, []))

  useEffect(() => guardar(CLAVE_VISITAS, cambios), [cambios])
  useEffect(() => guardar(CLAVE_CARRITO, carrito), [carrito])
  useEffect(() => guardar(CLAVE_COLA, cola), [cola])

  const visitas: Visita[] = useMemo(
    () => VISITAS_DE_HOY.map((v) => (cambios[v.id] ? { ...v, ...cambios[v.id] } : v)),
    [cambios],
  )

  /** Sello puntual al llegar. No se registra nada entre un sello y el otro. */
  const checkIn = useCallback((id: string) => {
    setCambios((c) => ({ ...c, [id]: { ...c[id], estado: 'en curso' as EstadoVisita, checkIn: sello() } }))
  }, [])

  const checkOut = useCallback((id: string, estado: EstadoVisita = 'visitado', motivo?: string) => {
    setCambios((c) => ({
      ...c,
      [id]: { ...c[id], estado, checkOut: sello(), motivoAusencia: motivo },
    }))
  }, [])

  /* ------------------------------------------------------------ carrito */

  const abrirCarrito = useCallback((empresaId: string, visitaId?: string) => {
    setCarrito((c) => (c && c.empresaId === empresaId ? c : { empresaId, visitaId, lineas: [] }))
  }, [])

  const agregar = useCallback((articuloId: string, unidad: UnidadLogistica, cantidad = 1) => {
    const art = articuloDe(articuloId)
    if (!art) return
    setCarrito((c) => {
      if (!c) return c
      const i = c.lineas.findIndex((l) => l.articuloId === articuloId && l.unidad === unidad)
      const lineas = [...c.lineas]
      if (i >= 0) lineas[i] = { ...lineas[i], cantidad: lineas[i].cantidad + cantidad }
      else lineas.push({ articuloId, unidad, cantidad, precioUnitario: precioDe(art, unidad), descuento: 0 })
      return { ...c, lineas }
    })
  }, [])

  const cambiarCantidad = useCallback((i: number, cantidad: number) => {
    setCarrito((c) => {
      if (!c) return c
      if (cantidad <= 0) return { ...c, lineas: c.lineas.filter((_, j) => j !== i) }
      return { ...c, lineas: c.lineas.map((l, j) => (j === i ? { ...l, cantidad } : l)) }
    })
  }, [])

  const cambiarDescuento = useCallback((i: number, descuento: number) => {
    setCarrito((c) =>
      c ? { ...c, lineas: c.lineas.map((l, j) => (j === i ? { ...l, descuento } : l)) } : c,
    )
  }, [])

  const vaciarCarrito = useCallback(() => setCarrito(null), [])

  /** Cierra la visita: el pedido queda en la cola si no hay señal. */
  const confirmarPedido = useCallback(
    (retenido: boolean, motivo?: string) => {
      if (!carrito) return null
      const numero = `NP-${String(4900 + PEDIDOS.length + cola.length)}`
      setCola((q) => [...q, numero])
      if (carrito.visitaId) checkOut(carrito.visitaId, 'visitado')
      setCarrito(null)
      return { numero, retenido, motivo }
    },
    [carrito, cola.length, checkOut],
  )

  const sincronizar = useCallback(() => setCola([]), [])

  const reiniciar = useCallback(() => {
    setCambios({})
    setCarrito(null)
    setCola([])
  }, [])

  return {
    visitas, checkIn, checkOut,
    carrito, abrirCarrito, agregar, cambiarCantidad, cambiarDescuento, vaciarCarrito, confirmarPedido,
    cola, sincronizar, reiniciar,
  }
}
