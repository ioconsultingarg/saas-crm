import type { Analisis, Cliente, ClienteAnalizado, Segmento, TipoAlerta } from '../tipos'
import { HOY } from '../data/seed'

const MS_DIA = 86_400_000

export function diasEntre(desde: string, hasta: Date = HOY): number {
  const d = new Date(desde + 'T12:00:00')
  return Math.round((hasta.getTime() - d.getTime()) / MS_DIA)
}

export function fechaMenosDias(dias: number, desde: Date = HOY): string {
  return new Date(desde.getTime() - dias * MS_DIA).toISOString().slice(0, 10)
}

/** Variacion de los ultimos 90 dias (3 meses) contra los 90 previos. */
function tendencia(valores: number[]): number {
  if (valores.length < 6) return 0
  const n = valores.length
  const recientes = valores.slice(n - 3).reduce((a, b) => a + b, 0)
  const previos = valores.slice(n - 6, n - 3).reduce((a, b) => a + b, 0)
  if (previos === 0) return 0
  return recientes / previos - 1
}

export function analizar(c: Cliente): Analisis {
  const diasSinComprar = diasEntre(c.ultimaCompra)
  const atraso = c.cadencia === null ? 0 : Math.max(0, diasSinComprar - c.cadencia)

  const tendenciaPesos =
    c.tendenciaPesosFija ?? tendencia(c.serie.map((p) => p.pesos))
  const tendenciaUnidades =
    c.tendenciaUnidadesFija ?? tendencia(c.serie.map((p) => p.unidades))

  const caidaDisfrazada = tendenciaUnidades < -0.25 && tendenciaPesos > 0
  const sinPatron = c.compras < 3 || c.cadencia === null

  // --- Alerta -------------------------------------------------------------
  let alerta: TipoAlerta | null = null
  if (sinPatron && diasSinComprar > 30 && c.compras > 0 && diasEntre(c.primeraCompra) < 90) {
    alerta = 'cliente nuevo sin segunda compra'
  } else if (
    c.cadencia !== null &&
    diasSinComprar > c.cadencia * 1.5 &&
    diasSinComprar <= 120
  ) {
    alerta = 'dejó de comprar'
  } else if (caidaDisfrazada) {
    alerta = 'compra menos'
  }

  // --- Monto en riesgo ----------------------------------------------------
  let montoEnRiesgo = 0
  if (alerta === 'dejó de comprar') {
    montoEnRiesgo = Math.round((c.factMensual * atraso) / 30)
  } else if (alerta === 'compra menos') {
    montoEnRiesgo = Math.round(c.factMensual * Math.abs(tendenciaUnidades))
  } else if (alerta === 'cliente nuevo sin segunda compra') {
    montoEnRiesgo = c.factMensual
  }

  // --- Segmento (gana el primero que da verdadero) ------------------------
  let segmento: Segmento
  if (c.compras < 3 && diasEntre(c.primeraCompra) < 90) segmento = 'nuevo'
  else if (diasSinComprar > 240) segmento = 'perdido'
  else if (diasSinComprar > 120) segmento = 'dormido'
  else if ((c.cadencia !== null && diasSinComprar > c.cadencia * 1.5) || caidaDisfrazada)
    segmento = 'en riesgo'
  else if (c.cadencia !== null && diasSinComprar > c.cadencia * 1.2)
    segmento = 'activo esporádico'
  else segmento = 'activo frecuente'

  return {
    diasSinComprar,
    atraso,
    montoEnRiesgo,
    segmento,
    alerta,
    tendenciaPesos,
    tendenciaUnidades,
    caidaDisfrazada,
  }
}

export function analizarTodos(cs: Cliente[]): ClienteAnalizado[] {
  return cs.map((c) => ({ ...c, a: analizar(c) }))
}

export function conAlerta(cs: ClienteAnalizado[]): ClienteAnalizado[] {
  return cs
    .filter((c) => c.a.alerta !== null)
    .sort((x, y) => y.a.montoEnRiesgo - x.a.montoEnRiesgo)
}

export function contarSegmentos(cs: ClienteAnalizado[]): Record<Segmento, number> {
  const base: Record<Segmento, number> = {
    nuevo: 0,
    'activo frecuente': 0,
    'activo esporádico': 0,
    'en riesgo': 0,
    dormido: 0,
    perdido: 0,
  }
  for (const c of cs) base[c.a.segmento]++
  return base
}

/** Serie mensual verosimil a partir de la facturacion y una tendencia de unidades. */
export function construirSerie(
  factMensual: number,
  tendPesos: number,
  tendUnidades: number,
  semilla: number,
): { mes: string; pesos: number; unidades: number }[] {
  const meses: { mes: string; pesos: number; unidades: number }[] = []
  let r = semilla
  const rnd = () => {
    r = (r * 1103515245 + 12345) % 2147483648
    return r / 2147483648
  }
  const precioBulto = 11_000
  for (let i = 0; i < 14; i++) {
    // progreso 0..1 a lo largo de los 14 meses
    const t = i / 13
    const factorPesos = 1 + tendPesos * (t - 0.5)
    const factorUnid = 1 + tendUnidades * (t - 0.5)
    const ruido = 0.9 + rnd() * 0.2
    const pesos = Math.round(factMensual * factorPesos * ruido)
    const unidades = Math.max(1, Math.round((factMensual / precioBulto) * factorUnid * ruido))
    const fecha = new Date(2025, 7 + i, 1)
    meses.push({
      mes: `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`,
      pesos,
      unidades,
    })
  }
  return meses
}
