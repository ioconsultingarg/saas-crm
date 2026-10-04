import type { Articulo, CuentaCorriente, LineaPedido, Lote, UnidadLogistica, Visita } from '../tipos-calle'
import { ARTICULOS, CUENTAS, articuloDe } from '../data/calle'
import { HOY } from '../data/seed'
import { CLIENTES } from '../data'

const MS_DIA = 86_400_000

export const diasHasta = (iso: string) =>
  Math.round((new Date(iso + 'T12:00:00').getTime() - HOY.getTime()) / MS_DIA)

/* ------------------------------------------------------------- crédito */

export interface EstadoCredito {
  cuenta: CuentaCorriente
  disponible: number
  /** el pedido entra sin autorización */
  alcanza: boolean
  /** bloqueado por deuda vencida, aunque tenga margen */
  bloqueado: boolean
  motivo?: string
}

export function evaluarCredito(empresaId: string, totalPedido: number): EstadoCredito | null {
  const cuenta = CUENTAS.find((c) => c.empresaId === empresaId)
  if (!cuenta) return null

  const disponible = cuenta.limiteCredito - cuenta.saldo
  const bloqueado = cuenta.vencido > 0
  const alcanza = !bloqueado && totalPedido <= disponible

  let motivo: string | undefined
  if (bloqueado) motivo = 'Tiene facturas vencidas: el pedido requiere autorización de administración.'
  else if (!alcanza) motivo = 'El pedido supera el crédito disponible: requiere autorización de administración.'

  return { cuenta, disponible, alcanza, bloqueado, motivo }
}

/* -------------------------------------------------------------- totales */

export const precioDe = (a: Articulo, u: UnidadLogistica) =>
  a.presentaciones.find((p) => p.unidad === u)?.precio ?? a.presentaciones[0].precio

export const equivaleDe = (a: Articulo, u: UnidadLogistica) =>
  a.presentaciones.find((p) => p.unidad === u)?.equivale ?? 1

export interface Totales {
  neto: number
  descuentos: number
  iva: number
  total: number
  unidades: number
}

export function totalizar(lineas: LineaPedido[]): Totales {
  let neto = 0
  let descuentos = 0
  let iva = 0
  let unidades = 0

  for (const l of lineas) {
    const a = articuloDe(l.articuloId)
    if (!a) continue
    const bruto = l.precioUnitario * l.cantidad
    const desc = bruto * (l.descuento / 100)
    const sub = bruto - desc
    neto += sub
    descuentos += desc
    iva += sub * (a.iva / 100)
    unidades += l.cantidad * equivaleDe(a, l.unidad)
  }

  return {
    neto: Math.round(neto),
    descuentos: Math.round(descuentos),
    iva: Math.round(iva),
    total: Math.round(neto + iva),
    unidades,
  }
}

/* ------------------------------------------------------------- sugerido */

export interface Sugerencia {
  articulo: Articulo
  razon: string
  cantidad: number
  unidad: UnidadLogistica
}

/**
 * Sugerido de reposición: aritmética sobre el histórico, no un modelo.
 * Si el cliente lleva un artículo cada N días y pasaron más de N, se sugiere.
 * El copy lo dice así a propósito: no lo llamamos inteligencia artificial.
 */
export function sugeridosPara(empresaId: string, clienteId?: string): Sugerencia[] {
  const cliente = CLIENTES.find((c) => c.id === (clienteId ?? empresaId))
  const sugerencias: Sugerencia[] = []

  if (cliente) {
    for (const p of cliente.productos) {
      if (p.diasDesdeUltima <= p.cadaCuantosDias) continue
      const art = ARTICULOS.find((a) => a.nombre.toLowerCase().startsWith(p.nombre.split(' ')[0].toLowerCase()))
      if (!art) continue
      sugerencias.push({
        articulo: art,
        razon: `Lo lleva cada ${p.cadaCuantosDias} días y pasaron ${p.diasDesdeUltima}`,
        cantidad: Math.max(1, Math.round(p.diasDesdeUltima / p.cadaCuantosDias)),
        unidad: 'bulto',
      })
    }
  }

  // Completar con artículos en oferta y buen stock, marcados como tales.
  if (sugerencias.length < 3) {
    for (const a of ARTICULOS.filter((x) => x.enOferta && x.stock > 40)) {
      if (sugerencias.some((s) => s.articulo.id === a.id)) continue
      sugerencias.push({ articulo: a, razon: 'En oferta esta semana', cantidad: 2, unidad: 'bulto' })
      if (sugerencias.length >= 4) break
    }
  }

  return sugerencias.slice(0, 4)
}

/* ---------------------------------------------------------------- lotes */

export const loteMasProximo = (a: Articulo): Lote | undefined =>
  (a.lotes ?? []).slice().sort((x, y) => x.vence.localeCompare(y.vence))[0]

export function estadoLote(l: Lote): { tono: 'critico' | 'riesgo' | 'sano'; texto: string } {
  const d = diasHasta(l.vence)
  if (d <= 30) return { tono: 'critico', texto: `Vence en ${d} días` }
  if (d <= 90) return { tono: 'riesgo', texto: `Vence en ${d} días` }
  return { tono: 'sano', texto: `Vence en ${Math.round(d / 30)} meses` }
}

export function estadoStock(a: Articulo): { tono: 'critico' | 'riesgo' | 'sano'; texto: string } {
  if (a.stock === 0) return { tono: 'critico', texto: 'Sin stock' }
  if (a.stock < 24) return { tono: 'riesgo', texto: `Quedan ${a.stock}` }
  return { tono: 'sano', texto: `${a.stock} disponibles` }
}

/* --------------------------------------------------------------- ruta */

export const resumenRuta = (visitas: Visita[]) => ({
  total: visitas.length,
  visitados: visitas.filter((v) => v.estado === 'visitado').length,
  ausentes: visitas.filter((v) => v.estado === 'ausente').length,
  pendientes: visitas.filter((v) => v.estado === 'pendiente' || v.estado === 'en curso').length,
  cumplimiento: visitas.length
    ? visitas.filter((v) => v.estado === 'visitado' || v.estado === 'ausente').length / visitas.length
    : 0,
})
