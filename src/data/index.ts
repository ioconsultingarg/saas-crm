import type { Cliente } from '../tipos'
import { CLIENTES_A_MANO } from './clientes'
import { CLIENTES_GENERADOS } from './generador'

export const CLIENTES: Cliente[] = [...CLIENTES_A_MANO, ...CLIENTES_GENERADOS]

export * from './seed'
export { PARTE_SEMANA_PASADA } from './gestiones'
