import type { CSSProperties, ReactNode } from 'react'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import type { Etapa } from '../tipos-crm'
import { ETIQUETA_ETAPA } from '../tipos-crm'
import { pctVar, pesosARS } from '../lib/formato'

export const COLOR_ETAPA: Record<Etapa, string> = {
  prospecto: 'var(--e-prospecto)',
  contactado: 'var(--e-contactado)',
  propuesta: 'var(--e-propuesta)',
  negociacion: 'var(--e-negociacion)',
  ganado: 'var(--e-ganado)',
  perdido: 'var(--e-perdido)',
}

/** Forma + color + palabra: el estado nunca depende solo del color. */
export function EtiquetaEtapa({ etapa, compacta }: { etapa: Etapa; compacta?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-micro font-semibold whitespace-nowrap"
      style={{ color: COLOR_ETAPA[etapa], background: 'color-mix(in srgb, currentColor 12%, transparent)' }}
    >
      <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 1, background: 'currentColor' }} />
      {compacta ? ETIQUETA_ETAPA[etapa].split(' / ').pop() : ETIQUETA_ETAPA[etapa]}
    </span>
  )
}

export function Avatar({ iniciales, titulo }: { iniciales: string; titulo?: string }) {
  return (
    <span
      title={titulo}
      className="inline-grid place-items-center rounded-full text-micro font-semibold shrink-0"
      style={{
        width: 28,
        height: 28,
        background: 'color-mix(in srgb, var(--marca) 14%, transparent)',
        color: 'var(--marca)',
      }}
    >
      {iniciales}
    </span>
  )
}

interface KpiProps {
  etiqueta: string
  valor: string
  nota?: string
  variacion?: number
  /** el número grande va en serif: es la firma visual del producto */
  destacado?: boolean
  estilo?: CSSProperties
}

export function Kpi({ etiqueta, valor, nota, variacion, destacado, estilo }: KpiProps) {
  const Flecha = variacion === undefined ? Minus : variacion >= 0 ? ArrowUpRight : ArrowDownRight
  const colorVar =
    variacion === undefined
      ? 'var(--tinta-suave)'
      : variacion >= 0
        ? 'var(--sano)'
        : 'var(--critico)'

  return (
    <div className="panel p-4 flex flex-col gap-1" style={estilo}>
      <p className="encabezado-columna">{etiqueta}</p>
      <p
        className={destacado ? 'font-display cifra' : 'cifra font-semibold'}
        style={
          destacado
            // Escala con el ancho: a 375 px una cifra de 8 digitos no entra a 30 px.
            ? { fontSize: 'clamp(21px, 5.6vw, 30px)', lineHeight: 1.15 }
            : { fontSize: 'clamp(17px, 4.4vw, 22px)', lineHeight: 1.2 }
        }
      >
        {valor}
      </p>
      <div className="flex items-center gap-2 text-micro flex-wrap" style={{ color: colorVar }}>
        {variacion !== undefined && (
          <>
            <Flecha size={14} strokeWidth={1.5} aria-hidden="true" />
            <span className="cifra">{pctVar(variacion)}</span>
          </>
        )}
        {nota && <span className="text-tinta-suave">{nota}</span>}
      </div>
    </div>
  )
}

export function Panel({
  titulo,
  accion,
  children,
  className = '',
  estilo,
}: {
  titulo: string
  accion?: ReactNode
  children: ReactNode
  className?: string
  estilo?: CSSProperties
}) {
  return (
    <section className={`panel p-4 ${className}`} style={estilo}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <h2 className="text-subtitulo font-semibold">{titulo}</h2>
        {accion}
      </div>
      {children}
    </section>
  )
}

/** Barra horizontal simple, sin librería: se usa mucho y pesa cero. */
export function Barra({
  valor,
  maximo,
  color,
  etiqueta,
}: {
  valor: number
  maximo: number
  color: string
  etiqueta?: string
}) {
  const ancho = maximo > 0 ? Math.max(2, (valor / maximo) * 100) : 0
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 rounded-sm overflow-hidden"
        style={{ height: 8, background: 'color-mix(in srgb, var(--tinta) 8%, transparent)' }}
      >
        <div
          style={{
            width: `${ancho}%`,
            height: '100%',
            background: color,
            transition: 'width var(--mov-medio) var(--curva)',
          }}
        />
      </div>
      {etiqueta && <span className="cifra text-micro text-tinta-suave w-20 text-right">{etiqueta}</span>}
    </div>
  )
}

export function Dinero({ valor, grande }: { valor: number; grande?: boolean }) {
  return (
    <span
      className={grande ? 'font-display cifra' : 'cifra'}
      style={grande ? { fontSize: 28, lineHeight: '32px' } : undefined}
    >
      {pesosARS(valor)}
    </span>
  )
}
