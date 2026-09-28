export type Canal =
  | 'kiosco'
  | 'maxikiosco'
  | 'almacén'
  | 'autoservicio'
  | 'minimercado'
  | 'supermercado'

export type Segmento =
  | 'nuevo'
  | 'activo frecuente'
  | 'activo esporádico'
  | 'en riesgo'
  | 'dormido'
  | 'perdido'

export type TipoAlerta =
  | 'dejó de comprar'
  | 'compra menos'
  | 'cliente nuevo sin segunda compra'

export type ResultadoGestion =
  | 'compró'
  | 'atendido'
  | 'no atendió'
  | 'pospuesto'
  | 'no compra más'

export interface PuntoMes {
  /** aaaa-mm */
  mes: string
  pesos: number
  unidades: number
}

export interface Contacto {
  nombre: string
  rol: string
  telefono: string
  whatsapp: boolean
}

export interface Gestion {
  fecha: string
  canal: 'llamada' | 'whatsapp' | 'visita'
  resultado: ResultadoGestion
  nota?: string
}

export interface ProductoHabitual {
  nombre: string
  cadaCuantosDias: number
  diasDesdeUltima: number
}

export interface Cliente {
  id: string
  razonSocial: string
  cuit: string
  canal: Canal
  zona: string
  vendedor: string
  primeraCompra: string
  ultimaCompra: string
  compras: number
  /** dias; null cuando hay menos de 3 compras */
  cadencia: number | null
  desvio: number
  factMensual: number
  serie: PuntoMes[]
  productos: ProductoHabitual[]
  dejoDeLlevar: string[]
  contactos: Contacto[]
  saldo: number
  saldoVencido: number
  gestiones: Gestion[]
  /** solo lo fijan los clientes escritos a mano; el resto se deriva de la serie */
  tendenciaPesosFija?: number
  tendenciaUnidadesFija?: number
}

export interface Analisis {
  diasSinComprar: number
  atraso: number
  montoEnRiesgo: number
  segmento: Segmento
  alerta: TipoAlerta | null
  tendenciaPesos: number
  tendenciaUnidades: number
  caidaDisfrazada: boolean
}

export interface ClienteAnalizado extends Cliente {
  a: Analisis
}

/** Gestion que registra el usuario durante la demo. */
export interface GestionRegistrada {
  clienteId: string
  resultado: ResultadoGestion
  nota?: string
  cuando: number
}
