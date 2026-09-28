import Papa from 'papaparse'

export type Columna = 'fecha' | 'cliente' | 'comprobante' | 'articulo' | 'cantidad' | 'importe'

export type Mapeo = Partial<Record<Columna, string>>

const PISTAS: Record<Columna, string[]> = {
  fecha: ['fecha', 'fec', 'date', 'emision', 'fechacomprobante'],
  cliente: ['cliente', 'razonsocial', 'razon', 'comercio', 'cuenta', 'nombre'],
  comprobante: ['comprobante', 'factura', 'nrocomprobante', 'numero', 'doc'],
  articulo: ['articulo', 'producto', 'descripcion', 'item', 'sku', 'detalle'],
  cantidad: ['cantidad', 'cant', 'unidades', 'bultos', 'qty'],
  importe: ['importe', 'total', 'monto', 'subtotal', 'neto', 'precio'],
}

const normalizar = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '')

export function detectarColumnas(encabezados: string[]): Mapeo {
  const mapeo: Mapeo = {}
  const tomadas = new Set<string>()
  for (const col of Object.keys(PISTAS) as Columna[]) {
    const pistas = PISTAS[col]
    const hallado = encabezados.find((h) => {
      if (tomadas.has(h)) return false
      const n = normalizar(h)
      return pistas.some((p) => n === p || n.includes(p))
    })
    if (hallado) {
      mapeo[col] = hallado
      tomadas.add(hallado)
    }
  }
  return mapeo
}

export interface Problema {
  clase: 'fecha inválida' | 'sin cliente' | 'importe negativo' | 'duplicado probable'
  cantidad: number
  ejemplo: string
  gravedad: 'crítico' | 'riesgo'
}

export interface Informe {
  filasLeidas: number
  filasValidas: number
  clientesDistintos: number
  problemas: Problema[]
  muestra: { crudo: Record<string, string>; interpretado: Interpretada }[]
}

export interface Interpretada {
  fecha: string
  cliente: string
  comprobante: string
  articulo: string
  cantidad: number
  importe: number
}

function parsearFecha(v: string): string | null {
  if (!v || !v.trim()) return null
  const s = v.trim()
  const m = s.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/)
  if (m) {
    const [, d, mes, a] = m
    const anio = a.length === 2 ? `20${a}` : a
    const fecha = new Date(Number(anio), Number(mes) - 1, Number(d))
    if (Number.isNaN(fecha.getTime())) return null
    if (fecha.getFullYear() < 2015 || fecha.getFullYear() > 2035) return null
    return `${anio}-${mes.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return iso[0]
  return null
}

/** Acepta 1.234,56 (es-AR) y 1234.56. */
function parsearNumero(v: string): number {
  if (!v) return 0
  const s = v.trim().replace(/\s/g, '').replace(/\$/g, '')
  const esAR = /,\d{1,2}$/.test(s)
  const limpio = esAR ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '')
  const n = Number(limpio)
  return Number.isFinite(n) ? n : 0
}

const claveNombre = (s: string) => normalizar(s).slice(0, 18)

export function analizarFilas(filas: Record<string, string>[], mapeo: Mapeo): Informe {
  const problemas: Record<Problema['clase'], { cantidad: number; ejemplo: string }> = {
    'fecha inválida': { cantidad: 0, ejemplo: '' },
    'sin cliente': { cantidad: 0, ejemplo: '' },
    'importe negativo': { cantidad: 0, ejemplo: '' },
    'duplicado probable': { cantidad: 0, ejemplo: '' },
  }
  const sumar = (c: Problema['clase'], ejemplo: string) => {
    problemas[c].cantidad++
    if (!problemas[c].ejemplo) problemas[c].ejemplo = ejemplo
  }

  const clientes = new Map<string, string>()
  const muestra: Informe['muestra'] = []
  let validas = 0

  for (const fila of filas) {
    const cliente = (mapeo.cliente ? fila[mapeo.cliente] : '')?.trim() ?? ''
    const fechaCruda = (mapeo.fecha ? fila[mapeo.fecha] : '') ?? ''
    const fecha = parsearFecha(fechaCruda)
    const importe = parsearNumero((mapeo.importe ? fila[mapeo.importe] : '') ?? '')
    const cantidad = parsearNumero((mapeo.cantidad ? fila[mapeo.cantidad] : '') ?? '')

    if (!fecha) sumar('fecha inválida', `"${fechaCruda || '(vacío)'}" en ${cliente || 'fila sin cliente'}`)
    if (!cliente) sumar('sin cliente', `comprobante ${(mapeo.comprobante && fila[mapeo.comprobante]) || '—'}`)
    if (importe < 0) sumar('importe negativo', `${cliente}: ${importe}`)

    if (cliente) {
      const k = claveNombre(cliente)
      const previo = clientes.get(k)
      if (previo && previo !== cliente) sumar('duplicado probable', `"${previo}" y "${cliente}"`)
      else if (!previo) clientes.set(k, cliente)
    }

    if (fecha && cliente) validas++

    if (muestra.length < 10) {
      muestra.push({
        crudo: fila,
        interpretado: {
          fecha: fecha ?? '—',
          cliente: cliente || '—',
          comprobante: (mapeo.comprobante ? fila[mapeo.comprobante] : '') ?? '—',
          articulo: (mapeo.articulo ? fila[mapeo.articulo] : '') ?? '—',
          cantidad,
          importe,
        },
      })
    }
  }

  const lista: Problema[] = (Object.keys(problemas) as Problema['clase'][])
    .filter((c) => problemas[c].cantidad > 0)
    .map((c) => ({
      clase: c,
      cantidad: problemas[c].cantidad,
      ejemplo: problemas[c].ejemplo,
      gravedad: c === 'duplicado probable' || c === 'sin cliente' ? 'crítico' : 'riesgo',
    }))

  return {
    filasLeidas: filas.length,
    filasValidas: validas,
    clientesDistintos: clientes.size,
    problemas: lista,
    muestra,
  }
}

export function parsearCSV(texto: string): { encabezados: string[]; filas: Record<string, string>[] } {
  const r = Papa.parse<Record<string, string>>(texto, {
    header: true,
    skipEmptyLines: 'greedy',
    delimiter: '',
  })
  const filas = (r.data ?? []).filter((f) => f && typeof f === 'object')
  const encabezados = (r.meta?.fields ?? []).filter(Boolean)
  return { encabezados, filas }
}
