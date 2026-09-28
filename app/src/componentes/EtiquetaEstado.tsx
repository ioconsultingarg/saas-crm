import type { CSSProperties } from 'react'
import { AlertTriangle, CircleCheck, Clock, TrendingDown, UserPlus } from 'lucide-react'
import type { Segmento, TipoAlerta } from '../tipos'

const ESTILOS: Record<string, CSSProperties> = {
  sano: { color: 'var(--sano)', background: 'var(--sano-fondo)' },
  riesgo: { color: 'var(--riesgo)', background: 'var(--riesgo-fondo)' },
  critico: { color: 'var(--critico)', background: 'var(--critico-fondo)' },
  neutro: { color: 'var(--tinta-suave)', background: 'var(--papel)' },
}

const clases =
  'inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-micro font-semibold whitespace-nowrap'

/** Nunca solo color: siempre color + icono + palabra. */
export function EtiquetaAlerta({ alerta }: { alerta: TipoAlerta }) {
  const mapa = {
    'dejó de comprar': { texto: 'Dejó de comprar', Icono: Clock, tono: 'critico' },
    'compra menos': { texto: 'Compra menos', Icono: TrendingDown, tono: 'riesgo' },
    'cliente nuevo sin segunda compra': {
      texto: 'Sin segunda compra',
      Icono: UserPlus,
      tono: 'riesgo',
    },
  } as const

  const { texto, Icono, tono } = mapa[alerta]
  return (
    <span className={clases} style={ESTILOS[tono]}>
      <Icono size={14} strokeWidth={1.5} aria-hidden="true" />
      {texto}
    </span>
  )
}

const TONO_SEGMENTO: Record<Segmento, keyof typeof ESTILOS> = {
  'activo frecuente': 'sano',
  'activo esporádico': 'neutro',
  nuevo: 'riesgo',
  'en riesgo': 'riesgo',
  dormido: 'critico',
  perdido: 'critico',
}

export function EtiquetaSegmento({ segmento }: { segmento: Segmento }) {
  const tono = TONO_SEGMENTO[segmento]
  const Icono = tono === 'sano' ? CircleCheck : tono === 'critico' ? AlertTriangle : TrendingDown
  return (
    <span className={clases} style={ESTILOS[tono]}>
      <Icono size={13} strokeWidth={1.5} aria-hidden="true" />
      {segmento}
    </span>
  )
}
