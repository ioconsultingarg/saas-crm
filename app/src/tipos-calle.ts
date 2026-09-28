/**
 * Modelo de la operación de calle y depósito.
 *
 * REGLA DE UBICACIÓN, decidida el 28/09/2026 y no negociable sin volver a
 * hablarlo: sólo se guardan las coordenadas del INSTANTE del check-in y del
 * check-out, para certificar que la visita ocurrió. No hay recorrido, ni
 * velocidad, ni tiempo entre visitas, ni posición en vivo. El mapa del
 * backoffice muestra densidad de clientes y facturación por zona: ningún
 * punto del mapa es una persona.
 */

export type EstadoVisita = 'pendiente' | 'en curso' | 'visitado' | 'ausente' | 'reasignado'

export interface Coordenada {
  lat: number
  lng: number
}

/** Sello puntual. Nunca hay una serie de estos por visita. */
export interface SelloUbicacion {
  hora: string
  coord: Coordenada
  /** metros de error del GPS al momento del sello */
  precision: number
}

export interface Visita {
  id: string
  fecha: string
  orden: number
  empresaId: string
  vendedor: string
  estado: EstadoVisita
  checkIn?: SelloUbicacion
  checkOut?: SelloUbicacion
  motivoAusencia?: string
  pedidoId?: string
  notas?: string
}

export type UnidadLogistica = 'unidad' | 'pack' | 'bulto' | 'pallet'

export interface Presentacion {
  unidad: UnidadLogistica
  /** cuántas unidades sueltas entran en esta presentación */
  equivale: number
  precio: number
}

export interface Lote {
  codigo: string
  vence: string
  cantidad: number
}

export interface Articulo {
  id: string
  codigo: string
  ean: string
  nombre: string
  marca: string
  categoria: string
  presentaciones: Presentacion[]
  stock: number
  /** sólo en rubros con trazabilidad (droguería, alimentos) */
  lotes?: Lote[]
  enOferta?: boolean
  iva: number
}

export interface LineaPedido {
  articuloId: string
  unidad: UnidadLogistica
  cantidad: number
  precioUnitario: number
  descuento: number
}

export type EstadoPedido =
  | 'borrador'
  | 'pendiente de sincronizar'
  | 'retenido'
  | 'aprobado'
  | 'rechazado'
  | 'facturado'

export interface Pedido {
  id: string
  numero: string
  fecha: string
  empresaId: string
  vendedor: string
  visitaId?: string
  lineas: LineaPedido[]
  estado: EstadoPedido
  /** por qué quedó retenido en la calle */
  motivoRetencion?: string
  firmadoPor?: string
  /** trazo de la firma, como path SVG */
  firma?: string
}

export interface CuentaCorriente {
  empresaId: string
  limiteCredito: number
  saldo: number
  vencido: number
  diasPlazo: number
  listaPrecios: string
  /** verde: hay margen · amarillo: cerca del límite · rojo: bloqueado */
  semaforo: 'verde' | 'amarillo' | 'rojo'
}

export interface Ruta {
  id: string
  nombre: string
  zona: string
  vendedor: string
  /** 1 = lunes … 6 = sábado */
  dia: number
  empresas: string[]
}

export const NOMBRE_DIA = ['', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

export const ETIQUETA_UNIDAD: Record<UnidadLogistica, string> = {
  unidad: 'Unidad',
  pack: 'Pack',
  bulto: 'Bulto',
  pallet: 'Pallet',
}

export const ETIQUETA_ESTADO_VISITA: Record<EstadoVisita, string> = {
  pendiente: 'Pendiente',
  'en curso': 'En curso',
  visitado: 'Visitado',
  ausente: 'Ausente',
  reasignado: 'Reasignado',
}

export const ETIQUETA_ESTADO_PEDIDO: Record<EstadoPedido, string> = {
  borrador: 'Borrador',
  'pendiente de sincronizar': 'Pendiente de sincronizar',
  retenido: 'Retenido',
  aprobado: 'Aprobado',
  rechazado: 'Rechazado',
  facturado: 'Facturado',
}
