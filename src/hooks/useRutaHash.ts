import { useCallback, useEffect, useState } from 'react'

export type Vista = 'lista' | 'cartera' | 'parte' | 'importar'

export interface Ruta {
  vista: Vista
  cliente?: string
  vendedor?: string
  zona?: string
  segmento?: string
}

const VISTAS: Vista[] = ['lista', 'cartera', 'parte', 'importar']

function leer(): Ruta {
  const crudo = window.location.hash.replace(/^#\/?/, '')
  const [camino, consulta] = crudo.split('?')
  const partes = camino.split('/').filter(Boolean)
  const vista = (VISTAS as string[]).includes(partes[0]) ? (partes[0] as Vista) : 'lista'
  const p = new URLSearchParams(consulta ?? '')
  return {
    vista,
    cliente: partes[0] === 'cliente' ? partes[1] : undefined,
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
  const camino = r.cliente ? `cliente/${r.cliente}` : r.vista
  return `#/${camino}${consulta ? `?${consulta}` : ''}`
}

/**
 * El estado vive en la URL: el boton atras del navegador y del telefono
 * funciona, y una ficha se puede compartir por link.
 */
export function useRutaHash() {
  const [ruta, setRuta] = useState<Ruta>(leer)

  useEffect(() => {
    const alCambiar = () => setRuta(leer())
    window.addEventListener('hashchange', alCambiar)
    return () => window.removeEventListener('hashchange', alCambiar)
  }, [])

  const navegar = useCallback((cambio: Partial<Ruta>, reemplazar = false) => {
    const siguiente = { ...leer(), ...cambio }
    const destino = escribir(siguiente)
    if (reemplazar) window.history.replaceState(null, '', destino)
    else window.location.hash = destino
    setRuta(leer())
  }, [])

  const abrirCliente = useCallback((id: string) => {
    const actual = leer()
    window.location.hash = escribir({ ...actual, cliente: id })
  }, [])

  const cerrarCliente = useCallback(() => {
    window.history.back()
  }, [])

  return { ruta, navegar, abrirCliente, cerrarCliente }
}
