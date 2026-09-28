import type { Etapa, Oportunidad, Tarea } from '../tipos-crm'
import { ETAPAS_TABLERO, PROBABILIDAD_ETAPA } from '../tipos-crm'
import { HOY } from '../data/seed'
import { ACTIVIDADES, OPORTUNIDADES, USUARIOS, empresaDe } from '../data/crm'

const MS_DIA = 86_400_000
const dias = (iso: string) => Math.round((HOY.getTime() - new Date(iso + 'T12:00:00').getTime()) / MS_DIA)

export const abiertas = (ops: Oportunidad[]) =>
  ops.filter((o) => o.etapa !== 'ganado' && o.etapa !== 'perdido')

export const probabilidadDe = (o: Oportunidad) => o.probabilidad ?? PROBABILIDAD_ETAPA[o.etapa]

/** Valor ponderado por probabilidad: lo que razonablemente se puede esperar. */
export const valorPonderado = (o: Oportunidad) => o.valor * probabilidadDe(o)

export interface PasoEmbudo {
  etapa: Etapa
  cantidad: number
  valor: number
  /** % que llega a esta etapa respecto de la primera */
  conversionDesdeInicio: number
  /** % que pasa de la etapa anterior a esta */
  conversionPaso: number
}

/**
 * Embudo acumulado: en "prospecto" se cuentan todas las que alguna vez
 * estuvieron ahí, es decir, todas. Cada etapa siguiente acumula las que
 * llegaron al menos hasta ahí. Es como se lee un funnel de verdad.
 */
export function embudo(ops: Oportunidad[] = OPORTUNIDADES): PasoEmbudo[] {
  const orden = ETAPAS_TABLERO
  const indice = (e: Etapa) => (e === 'perdido' ? -1 : orden.indexOf(e))

  const pasos = orden.map((etapa, i) => {
    const alcanzaron = ops.filter((o) => {
      const idx = indice(o.etapa)
      if (idx === -1) {
        // Una perdida alcanzo las etapas previas a donde murio; se aproxima
        // con la etapa en la que estaba al cerrarse.
        return i === 0
      }
      return idx >= i
    })
    return {
      etapa,
      cantidad: alcanzaron.length,
      valor: alcanzaron.reduce((a, o) => a + o.valor, 0),
      conversionDesdeInicio: 0,
      conversionPaso: 0,
    }
  })

  const base = pasos[0].cantidad || 1
  pasos.forEach((p, i) => {
    p.conversionDesdeInicio = p.cantidad / base
    p.conversionPaso = i === 0 ? 1 : p.cantidad / (pasos[i - 1].cantidad || 1)
  })
  return pasos
}

export interface ResumenComercial {
  abiertas: number
  valorAbierto: number
  proyeccion: number
  ganadas: number
  valorGanado: number
  perdidas: number
  tasaGanadas: number
  ticketPromedio: number
  cicloPromedioDias: number
}

export function resumen(ops: Oportunidad[] = OPORTUNIDADES): ResumenComercial {
  const ab = abiertas(ops)
  const ganadas = ops.filter((o) => o.etapa === 'ganado')
  const perdidas = ops.filter((o) => o.etapa === 'perdido')
  const cerradas = ganadas.length + perdidas.length

  const ciclos = ganadas
    .filter((o) => o.cerrada)
    .map((o) => dias(o.creada) - dias(o.cerrada!))

  return {
    abiertas: ab.length,
    valorAbierto: ab.reduce((a, o) => a + o.valor, 0),
    proyeccion: Math.round(ab.reduce((a, o) => a + valorPonderado(o), 0)),
    ganadas: ganadas.length,
    valorGanado: ganadas.reduce((a, o) => a + o.valor, 0),
    perdidas: perdidas.length,
    tasaGanadas: cerradas ? ganadas.length / cerradas : 0,
    ticketPromedio: ganadas.length
      ? Math.round(ganadas.reduce((a, o) => a + o.valor, 0) / ganadas.length)
      : 0,
    cicloPromedioDias: ciclos.length
      ? Math.round(ciclos.reduce((a, b) => a + b, 0) / ciclos.length)
      : 0,
  }
}

export interface RendimientoAgente {
  usuarioId: string
  nombre: string
  iniciales: string
  abiertas: number
  valorAbierto: number
  ganadas: number
  valorGanado: number
  perdidas: number
  tasaGanadas: number
  actividades: number
}

export function rendimientoPorAgente(ops: Oportunidad[] = OPORTUNIDADES): RendimientoAgente[] {
  return USUARIOS.filter((u) => u.rol !== 'administrador')
    .map((u) => {
      const mias = ops.filter((o) => o.propietario === u.id)
      const ganadas = mias.filter((o) => o.etapa === 'ganado')
      const perdidas = mias.filter((o) => o.etapa === 'perdido')
      const cerradas = ganadas.length + perdidas.length
      const ab = abiertas(mias)
      return {
        usuarioId: u.id,
        nombre: u.nombre,
        iniciales: u.iniciales,
        abiertas: ab.length,
        valorAbierto: ab.reduce((a, o) => a + o.valor, 0),
        ganadas: ganadas.length,
        valorGanado: ganadas.reduce((a, o) => a + o.valor, 0),
        perdidas: perdidas.length,
        tasaGanadas: cerradas ? ganadas.length / cerradas : 0,
        actividades: ACTIVIDADES.filter((a) => a.usuario === u.id).length,
      }
    })
    .sort((a, b) => b.valorGanado - a.valorGanado)
}

/** Proyeccion de ingresos por mes de cierre estimado, ponderada. */
export function proyeccionMensual(ops: Oportunidad[] = OPORTUNIDADES) {
  const mapa = new Map<string, { ponderado: number; total: number }>()
  for (const o of abiertas(ops)) {
    const mes = o.cierreEstimado.slice(0, 7)
    const prev = mapa.get(mes) ?? { ponderado: 0, total: 0 }
    mapa.set(mes, {
      ponderado: prev.ponderado + valorPonderado(o),
      total: prev.total + o.valor,
    })
  }
  return [...mapa.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, v]) => ({ mes, ponderado: Math.round(v.ponderado), total: v.total }))
}

export function motivosDePerdida(ops: Oportunidad[] = OPORTUNIDADES) {
  const mapa = new Map<string, { cantidad: number; valor: number }>()
  for (const o of ops.filter((x) => x.etapa === 'perdido')) {
    const k = o.motivoPerdida ?? 'Sin registrar'
    const prev = mapa.get(k) ?? { cantidad: 0, valor: 0 }
    mapa.set(k, { cantidad: prev.cantidad + 1, valor: prev.valor + o.valor })
  }
  return [...mapa.entries()]
    .map(([motivo, v]) => ({ motivo, ...v }))
    .sort((a, b) => b.cantidad - a.cantidad)
}

export function origenes(ops: Oportunidad[] = OPORTUNIDADES) {
  const mapa = new Map<string, { cantidad: number; ganadas: number }>()
  for (const o of ops) {
    const prev = mapa.get(o.origen) ?? { cantidad: 0, ganadas: 0 }
    mapa.set(o.origen, {
      cantidad: prev.cantidad + 1,
      ganadas: prev.ganadas + (o.etapa === 'ganado' ? 1 : 0),
    })
  }
  return [...mapa.entries()]
    .map(([origen, v]) => ({ origen, ...v, tasa: v.cantidad ? v.ganadas / v.cantidad : 0 }))
    .sort((a, b) => b.cantidad - a.cantidad)
}

export const tareasDeHoy = (tareas: Tarea[]) =>
  tareas
    .filter((t) => !t.hecha && dias(t.vence) >= 0)
    .sort((a, b) => a.vence.localeCompare(b.vence))

export const diasSinActividad = (oportunidadId: string) => {
  const ult = ACTIVIDADES.find((a) => a.oportunidadId === oportunidadId)
  return ult ? dias(ult.fecha) : null
}

export const nombreEmpresa = (id: string) => empresaDe(id)?.razonSocial ?? '—'
export const diasDesde = dias
