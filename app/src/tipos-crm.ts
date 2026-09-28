export type Etapa =
  | 'prospecto'
  | 'contactado'
  | 'propuesta'
  | 'negociacion'
  | 'ganado'
  | 'perdido'

/** Las cinco columnas del tablero. Ganado y perdido salen del flujo. */
export const ETAPAS_TABLERO: Etapa[] = [
  'prospecto',
  'contactado',
  'propuesta',
  'negociacion',
  'ganado',
]

export const ETIQUETA_ETAPA: Record<Etapa, string> = {
  prospecto: 'Prospecto',
  contactado: 'Contactado',
  propuesta: 'Propuesta enviada',
  negociacion: 'Negociación',
  ganado: 'Cerrado / Ganado',
  perdido: 'Cerrado / Perdido',
}

/** Probabilidad por defecto de cada etapa, para la proyección ponderada. */
export const PROBABILIDAD_ETAPA: Record<Etapa, number> = {
  prospecto: 0.1,
  contactado: 0.25,
  propuesta: 0.5,
  negociacion: 0.75,
  ganado: 1,
  perdido: 0,
}

export type RolUsuario = 'administrador' | 'supervisor' | 'vendedor'

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: RolUsuario
  iniciales: string
  activo: boolean
  zona?: string
}

export interface Empresa {
  id: string
  razonSocial: string
  cuit: string
  rubro: string
  canal: string
  zona: string
  localidad: string
  empleados: number
  propietario: string
  /** id del cliente de recompra, si esta empresa además compra */
  clienteId?: string
}

export interface ContactoCRM {
  id: string
  empresaId: string
  nombre: string
  cargo: string
  email: string
  telefono: string
  whatsapp: boolean
  principal: boolean
}

export type TipoActividad = 'llamada' | 'email' | 'reunión' | 'whatsapp' | 'nota'

export interface Actividad {
  id: string
  tipo: TipoActividad
  fecha: string
  resumen: string
  empresaId: string
  contactoId?: string
  oportunidadId?: string
  usuario: string
}

export interface Oportunidad {
  id: string
  titulo: string
  empresaId: string
  contactoId: string
  valor: number
  etapa: Etapa
  /** 0 a 1; si no se fija, sale de la etapa */
  probabilidad?: number
  cierreEstimado: string
  creada: string
  cerrada?: string
  propietario: string
  motivoPerdida?: string
  origen: string
}

export interface Tarea {
  id: string
  titulo: string
  vence: string
  usuario: string
  empresaId?: string
  oportunidadId?: string
  hecha: boolean
  prioridad: 'alta' | 'media' | 'baja'
}

export interface Integracion {
  id: string
  nombre: string
  descripcion: string
  categoria: 'comunicación' | 'cobros' | 'gestión' | 'datos'
  conectada: boolean
}

export interface ReglaAutomatica {
  id: string
  cuando: string
  entonces: string
  activa: boolean
}
