import type { ResultadoGestion } from '../tipos'

export interface LineaParte {
  comercio: string
  vendedor: string
  fecha: string
  resultado: ResultadoGestion
  recuperado: number
}

/** Semana del 15 al 19/09/2026. Datos historicos de la demo. */
export const PARTE_SEMANA_PASADA = {
  desde: '2026-09-15',
  hasta: '2026-09-19',
  enRiesgoInicio: 27,
  recuperados: 7,
  nuevosEnRiesgo: 3,
  enRiesgoCierre: 23,
  gestionados: 18,
  montoRecuperado: 960_000,
  criterio:
    'Se cuenta como recuperado el cliente que, habiendo tenido alerta abierta, volvió a comprar dentro de los 7 días de la gestión. Se computa su facturación mensual promedio, no el importe de la compra.',
  lineas: [
    { comercio: 'Almacén San Cayetano', vendedor: 'Vanina Coria', fecha: '2026-09-15', resultado: 'compró', recuperado: 214_000 },
    { comercio: 'Kiosco Pavón 2280', vendedor: 'Diego Sosa', fecha: '2026-09-15', resultado: 'compró', recuperado: 88_000 },
    { comercio: 'Autoservicio La Perla', vendedor: 'Hernán Prieto', fecha: '2026-09-15', resultado: 'no atendió', recuperado: 0 },
    { comercio: 'Despensa Los Pinos', vendedor: 'Rocío Ferrari', fecha: '2026-09-16', resultado: 'compró', recuperado: 156_000 },
    { comercio: 'Minimercado El Ceibo', vendedor: 'Lucas Bianchi', fecha: '2026-09-16', resultado: 'atendido', recuperado: 0 },
    { comercio: 'Maxikiosco El Cruce', vendedor: 'Marcela Ruiz', fecha: '2026-09-16', resultado: 'compró', recuperado: 132_000 },
    { comercio: 'Almacén Doña Chela', vendedor: 'Vanina Coria', fecha: '2026-09-16', resultado: 'no atendió', recuperado: 0 },
    { comercio: 'Supermercado La Central', vendedor: 'Diego Sosa', fecha: '2026-09-17', resultado: 'compró', recuperado: 198_000 },
    { comercio: 'Kiosco La Vía', vendedor: 'Marcela Ruiz', fecha: '2026-09-17', resultado: 'atendido', recuperado: 0 },
    { comercio: 'Autoservicio El Progreso', vendedor: 'Hernán Prieto', fecha: '2026-09-17', resultado: 'no atendió', recuperado: 0 },
    { comercio: 'Despensa Santa Elena', vendedor: 'Rocío Ferrari', fecha: '2026-09-17', resultado: 'compró', recuperado: 104_000 },
    { comercio: 'Almacén El Ombú', vendedor: 'Vanina Coria', fecha: '2026-09-18', resultado: 'atendido', recuperado: 0 },
    { comercio: 'Minimercado Don Julio', vendedor: 'Lucas Bianchi', fecha: '2026-09-18', resultado: 'compró', recuperado: 68_000 },
    { comercio: 'Kiosco El Faro', vendedor: 'Diego Sosa', fecha: '2026-09-18', resultado: 'no atendió', recuperado: 0 },
    { comercio: 'Polirrubro La Paz', vendedor: 'Marcela Ruiz', fecha: '2026-09-18', resultado: 'atendido', recuperado: 0 },
    { comercio: 'Almacén Los Robles', vendedor: 'Rocío Ferrari', fecha: '2026-09-19', resultado: 'no atendió', recuperado: 0 },
    { comercio: 'Autoservicio El Portal', vendedor: 'Hernán Prieto', fecha: '2026-09-19', resultado: 'atendido', recuperado: 0 },
    { comercio: 'Mercadito La Rambla', vendedor: 'Lucas Bianchi', fecha: '2026-09-19', resultado: 'no atendió', recuperado: 0 },
  ] as LineaParte[],
}
