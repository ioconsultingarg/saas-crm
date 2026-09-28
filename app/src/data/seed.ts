import type { Canal } from '../tipos'

/** La demo congela "hoy" para que los numeros no se desfasen con el tiempo. */
export const HOY = new Date('2026-09-22T12:00:00')
export const FECHA_ULTIMO_DATO = '2026-09-22'
export const FECHA_SALDOS = '2026-09-19'

export const EMPRESA = {
  razonSocial: 'Distribuidora Demo S.R.L.',
  rubro: 'Consumo masivo',
  zona: 'AMBA sur',
  clientesActivos: 412,
}

export const VENDEDORES = [
  'Marcela Ruiz',
  'Diego Sosa',
  'Vanina Coria',
  'Hernán Prieto',
  'Lucas Bianchi',
  'Rocío Ferrari',
] as const

export const ZONAS = [
  'Lomas de Zamora',
  'Lanús',
  'Avellaneda',
  'Quilmes',
  'La Matanza',
  'CABA Sur',
] as const

export const CANALES: Canal[] = [
  'kiosco',
  'maxikiosco',
  'almacén',
  'autoservicio',
  'minimercado',
  'supermercado',
]

export const PRODUCTOS = [
  'Galletitas surtidas x12',
  'Gaseosa cola 2.25 L x6',
  'Agua mineral 1.5 L x6',
  'Alfajores triples x24',
  'Yerba mate 1 kg x10',
  'Fideos guiseros 500 g x20',
  'Aceite de girasol 900 ml x12',
  'Papel higiénico doble hoja x4',
  'Jabón en polvo 800 g x10',
  'Arroz largo fino 1 kg x10',
  'Puré de tomate 520 g x12',
  'Cerveza lata 473 ml x24',
]

/** Total de alertas abiertas y plata en juego. Los datos estan construidos para cerrar en esto. */
export const TOTAL_ALERTAS = 23
export const TOTAL_EN_RIESGO = 4_180_000
