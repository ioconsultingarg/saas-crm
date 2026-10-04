import { useCallback, useEffect, useState } from 'react'

export type Vista =
  // comercial
  | 'panel' | 'pipeline' | 'empresas' | 'reportes'
  // calle
  | 'ruta' | 'catalogo' | 'carrito' | 'cierre'
  // operación
  | 'operacion' | 'aprobaciones' | 'stock' | 'cuentas' | 'rutas'
  // recompra
  | 'lista' | 'cartera' | 'parte' | 'importar'
  // cuenta
  | 'configuracion'

const VISTAS: Vista[] = [
  'panel', 'pipeline', 'empresas', 'reportes',
  'ruta', 'catalogo', 'carrito', 'cierre',
  'operacion', 'aprobaciones', 'stock', 'cuentas', 'rutas',
  'lista', 'cartera', 'parte', 'importar', 'configuracion',
]

export interface Ruta {
  vista: Vista
  cliente?: string
  empresa?: string
  comercio?: string
  visita?: string
  vendedor?: string
  zona?: string
  segmento?: string
}

function leer(): Ruta {
  const crudo = window.location.hash.replace(/^#\/?/, '')
  const [camino, consulta] = crudo.split('?')
  const partes = camino.split('/').filter(Boolean)
  const p = new URLSearchParams(consulta ?? '')

  const esCliente = partes[0] === 'cliente'
  const esEmpresa = partes[0] === 'empresa'
  const esComercio = partes[0] === 'comercio'
  const vista = (VISTAS as string[]).includes(partes[0])
    ? (partes[0] as Vista)
    : esCliente ? 'lista' : esEmpresa ? 'empresas' : esComercio ? 'ruta' : 'panel'

  return {
    vista,
    cliente: esCliente ? partes[1] : undefined,
    empresa: esEmpresa ? partes[1] : undefined,
    comercio: esComercio ? partes[1] : undefined,
    visita: esComercio ? partes[2] : undefined,
    vendedor: p.get('vendedor') ?? undefined,
    zona: p.get('zona') ?? undefined,
    segmento: p.get('segmento') ?? undefined,
  }
}

function escribir(r: Ruta): string {
  const p = new URLSearchParams()
  if (r.vendedor) p.set('vendedor', r.vendedor)
  if (r.zona) p.set('zona', r.zona)
  if (r.segmento) p.set('segmento', r.segmento)
  const consulta = p.toString()
  const camino = r.cliente
    ? `cliente/${r.cliente}`
    : r.empresa
      ? `empresa/${r.empresa}`
      : r.comercio
        ? `comercio/${r.comercio}${r.visita ? `/${r.visita}` : ''}`
        : r.vista
  return `#/${camino}${consulta ? `?${consulta}` : ''}`
}

/**
 * El estado vive en la URL: el botón atrás del navegador y del teléfono
 * funciona, y una ficha se puede compartir por link.
 */
export function useRutaHash() {
  const [ruta, setRuta] = useState<Ruta>(leer)

  useEffect(() => {
    const alCambiar = () => setRuta(leer())
    window.addEventListener('hashchange', alCambiar)
    return () => window.removeEventListener('hashchange', alCambiar)
  }, [])

  const navegar = useCallback((cambio: Partial<Ruta>) => {
    // El spread ya pisa con undefined las claves presentes en `cambio`, que es
    // justamente como se limpian cliente/empresa/comercio al cambiar de vista.
    window.location.hash = escribir({ ...leer(), ...cambio })
    setRuta(leer())
  }, [])

  const abrirCliente = useCallback((id: string) => {
    window.location.hash = escribir({ ...leer(), cliente: id, empresa: undefined })
  }, [])

  const abrirEmpresa = useCallback((id: string) => {
    window.location.hash = escribir({ ...leer(), empresa: id, cliente: undefined, comercio: undefined })
  }, [])

  const abrirComercio = useCallback((empresaId: string, visitaId?: string) => {
    window.location.hash = escribir({
      ...leer(), comercio: empresaId, visita: visitaId, cliente: undefined, empresa: undefined,
    })
  }, [])

  const volver = useCallback(() => window.history.back(), [])

  return { ruta, navegar, abrirCliente, abrirEmpresa, abrirComercio, volver }
}
