import { useCallback, useEffect, useState } from 'react'

export type Vista =
  | 'panel'
  | 'pipeline'
  | 'empresas'
  | 'reportes'
  | 'lista'
  | 'cartera'
  | 'parte'
  | 'importar'
  | 'configuracion'

const VISTAS: Vista[] = [
  'panel', 'pipeline', 'empresas', 'reportes',
  'lista', 'cartera', 'parte', 'importar', 'configuracion',
]

export interface Ruta {
  vista: Vista
  cliente?: string
  empresa?: string
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
  const vista = (VISTAS as string[]).includes(partes[0]) ? (partes[0] as Vista) : esCliente ? 'lista' : esEmpresa ? 'empresas' : 'panel'

  return {
    vista,
    cliente: esCliente ? partes[1] : undefined,
    empresa: esEmpresa ? partes[1] : undefined,
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
  const camino = r.cliente ? `cliente/${r.cliente}` : r.empresa ? `empresa/${r.empresa}` : r.vista
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
    window.location.hash = escribir({ ...leer(), ...cambio })
    setRuta(leer())
  }, [])

  const abrirCliente = useCallback((id: string) => {
    window.location.hash = escribir({ ...leer(), cliente: id, empresa: undefined })
  }, [])

  const abrirEmpresa = useCallback((id: string) => {
    window.location.hash = escribir({ ...leer(), empresa: id, cliente: undefined })
  }, [])

  const volver = useCallback(() => window.history.back(), [])

  return { ruta, navegar, abrirCliente, abrirEmpresa, volver }
}
