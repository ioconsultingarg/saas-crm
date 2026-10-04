import type {
  Articulo, CuentaCorriente, EstadoVisita, Lote, Pedido, Presentacion, Ruta, Visita,
} from '../tipos-calle'
import { EMPRESAS, VENDEDORES_ACTIVOS } from './crm'
import { HOY } from './seed'

const MS_DIA = 86_400_000
const masDias = (n: number) => new Date(HOY.getTime() + n * MS_DIA).toISOString().slice(0, 10)

function mulberry32(a: number) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rnd = mulberry32(8675309)
const elegir = <T,>(xs: readonly T[]): T => xs[Math.floor(rnd() * xs.length)]
const entre = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1))

/* ------------------------------------------------------------- artículos */

const CATALOGO: [string, string, string, number, boolean][] = [
  // nombre, marca, categoría, precio por unidad suelta, tiene lotes
  ['Galletitas surtidas 300 g', 'Doña Fina', 'Galletitas', 1_850, false],
  ['Gaseosa cola 2.25 L', 'Refrescor', 'Bebidas', 3_400, false],
  ['Agua mineral 1.5 L', 'Vertiente', 'Bebidas', 1_600, false],
  ['Alfajor triple chocolate', 'Dulcor', 'Golosinas', 1_200, false],
  ['Yerba mate 1 kg', 'Del Litoral', 'Almacén', 6_900, false],
  ['Fideos guiseros 500 g', 'Molino Sur', 'Almacén', 1_450, false],
  ['Aceite de girasol 900 ml', 'Sol de Oro', 'Almacén', 4_200, false],
  ['Papel higiénico doble hoja x4', 'Nube', 'Limpieza', 3_800, false],
  ['Jabón en polvo 800 g', 'Blanca', 'Limpieza', 5_600, false],
  ['Arroz largo fino 1 kg', 'Espiga', 'Almacén', 2_100, false],
  ['Puré de tomate 520 g', 'Huerta Roja', 'Almacén', 1_350, false],
  ['Cerveza lata 473 ml', 'Cumbre', 'Bebidas', 2_450, false],
  ['Leche entera larga vida 1 L', 'Pradera', 'Lácteos', 2_200, true],
  ['Yogur bebible 900 g', 'Pradera', 'Lácteos', 3_100, true],
  ['Queso cremoso x kg', 'La Tambera', 'Lácteos', 12_800, true],
  ['Ibuprofeno 400 mg x10', 'Genfar', 'Farma', 4_900, true],
  ['Paracetamol 500 mg x20', 'Genfar', 'Farma', 3_600, true],
  ['Alcohol en gel 250 ml', 'Higión', 'Farma', 2_800, true],
]

function presentacionesDe(precioUnidad: number): Presentacion[] {
  const porPack = entre(3, 6)
  const porBulto = porPack * entre(2, 4)
  return [
    { unidad: 'unidad', equivale: 1, precio: precioUnidad },
    { unidad: 'pack', equivale: porPack, precio: Math.round(precioUnidad * porPack * 0.96) },
    { unidad: 'bulto', equivale: porBulto, precio: Math.round(precioUnidad * porBulto * 0.91) },
  ]
}

function lotesDe(i: number): Lote[] {
  // Uno de cada tres artículos con trazabilidad tiene un lote por vencer:
  // es el caso que la pantalla tiene que saber mostrar.
  const porVencer = i % 3 === 0
  return [
    { codigo: `L${2026}${String(100 + i)}A`, vence: masDias(porVencer ? entre(8, 25) : entre(120, 400)), cantidad: entre(12, 90) },
    { codigo: `L${2026}${String(100 + i)}B`, vence: masDias(entre(180, 520)), cantidad: entre(30, 200) },
  ]
}

export const ARTICULOS: Articulo[] = CATALOGO.map(([nombre, marca, categoria, precio, conLotes], i) => ({
  id: `art-${i}`,
  codigo: `A${String(1000 + i)}`,
  ean: `779${String(1000000 + i * 7919).padStart(10, '0')}`,
  nombre,
  marca,
  categoria,
  presentaciones: presentacionesDe(precio),
  stock: entre(0, 480),
  lotes: conLotes ? lotesDe(i) : undefined,
  enOferta: i % 5 === 0,
  iva: categoria === 'Farma' ? 10.5 : 21,
}))

export const CATEGORIAS = [...new Set(ARTICULOS.map((a) => a.categoria))].sort()
export const MARCAS = [...new Set(ARTICULOS.map((a) => a.marca))].sort()

/** Artículos cuyo lote más próximo vence dentro de 30 días. */
export const LOTES_POR_VENCER = ARTICULOS.flatMap((a) =>
  (a.lotes ?? [])
    .filter((l) => new Date(l.vence + 'T12:00:00').getTime() - HOY.getTime() < 30 * MS_DIA)
    .map((l) => ({ articulo: a, lote: l })),
)

/* --------------------------------------------------------- cuenta corriente */

export const CUENTAS: CuentaCorriente[] = EMPRESAS.map((e, i) => {
  const limite = entre(3, 30) * 100_000

  // Reparto deliberado: 5 de cada 7 sanas, 1 cerca del limite, 1 con problema.
  // El modulo 7 garantiza que CUALQUIER tramo de la cartera tenga las tres
  // situaciones: si toda la ruta sale verde el semaforo no se ve nunca, y si
  // sale toda roja el preventista no puede vender nada. Las dos rompen la demo.
  const grupo = i % 7
  const uso = grupo < 5 ? 0.05 + rnd() * 0.6 : grupo === 5 ? 0.82 + rnd() * 0.15 : 0.95 + rnd() * 0.3
  const saldo = Math.round(limite * uso)
  const vencido = grupo === 6 && rnd() < 0.75 ? Math.round(saldo * (0.2 + rnd() * 0.5)) : 0

  return {
    empresaId: e.id,
    limiteCredito: limite,
    saldo,
    vencido,
    diasPlazo: elegir([0, 15, 30, 45]),
    listaPrecios: elegir(['Mostrador', 'Mayorista', 'Cuenta corriente 30', 'Especial volumen']),
    semaforo: vencido > 0 || uso > 1 ? 'rojo' : uso > 0.8 ? 'amarillo' : 'verde',
  }
})

export const cuentaDe = (empresaId: string) => CUENTAS.find((c) => c.empresaId === empresaId)

/* ------------------------------------------------------------------ rutas */

export const RUTAS: Ruta[] = VENDEDORES_ACTIVOS.flatMap((v, i) =>
  [1, 3, 5].map((dia) => {
    const dela = EMPRESAS.filter((e) => e.propietario === v.id)
    const tercio = Math.ceil(dela.length / 3) || 1
    const desde = ((dia - 1) / 2) * tercio
    return {
      id: `r-${i}-${dia}`,
      nombre: `${v.zona ?? 'Zona'} · ${['', 'lunes', '', 'miércoles', '', 'viernes'][dia]}`,
      zona: v.zona ?? 'Sin zona',
      vendedor: v.id,
      dia,
      empresas: dela.slice(desde, desde + tercio).map((e) => e.id),
    }
  }),
)

/* --------------------------------------------------------------- visitas */

/** Coordenadas verosímiles del AMBA sur, para los sellos de check-in. */
const CENTRO = { lat: -34.72, lng: -58.39 }
const cerca = () => ({
  lat: CENTRO.lat + (rnd() - 0.5) * 0.18,
  lng: CENTRO.lng + (rnd() - 0.5) * 0.22,
})

const HORAS = ['08:40', '09:15', '09:50', '10:30', '11:10', '11:45', '12:20', '14:05', '14:40', '15:20', '16:00']
const AUSENCIAS = ['Local cerrado', 'No estaba el encargado', 'Pidió volver mañana', 'Mudanza del local']

export const VISITAS_DE_HOY: Visita[] = (() => {
  const ruta = RUTAS.find((r) => r.vendedor === VENDEDORES_ACTIVOS[0].id && r.dia === 1)!
  const empresas = ruta.empresas.length >= 6 ? ruta.empresas : EMPRESAS.slice(0, 9).map((e) => e.id)
  return empresas.slice(0, 9).map((empresaId, i) => {
    // Las primeras ya se hicieron; la del medio está en curso; el resto pendiente.
    const estado: EstadoVisita = i < 3 ? 'visitado' : i === 3 ? 'ausente' : i === 4 ? 'en curso' : 'pendiente'
    const hecha = estado === 'visitado' || estado === 'ausente' || estado === 'en curso'
    return {
      id: `v-${i}`,
      fecha: masDias(0),
      orden: i + 1,
      empresaId,
      vendedor: VENDEDORES_ACTIVOS[0].id,
      estado,
      checkIn: hecha ? { hora: HORAS[i], coord: cerca(), precision: entre(6, 22) } : undefined,
      checkOut:
        estado === 'visitado' || estado === 'ausente'
          ? { hora: HORAS[i + 1] ?? '16:40', coord: cerca(), precision: entre(6, 22) }
          : undefined,
      motivoAusencia: estado === 'ausente' ? elegir(AUSENCIAS) : undefined,
      pedidoId: estado === 'visitado' ? `p-${i}` : undefined,
    }
  })
})()

/* --------------------------------------------------------------- pedidos */

const MOTIVOS_RETENCION = [
  'Supera el límite de crédito disponible',
  'Tiene facturas vencidas',
  'Descuento por encima del autorizado',
]

export const PEDIDOS: Pedido[] = Array.from({ length: 18 }, (_, i) => {
  const empresa = elegir(EMPRESAS)
  const cuenta = cuentaDe(empresa.id)!
  const lineas = Array.from({ length: entre(2, 6) }, () => {
    const art = elegir(ARTICULOS)
    const pres = elegir(art.presentaciones)
    return {
      articuloId: art.id,
      unidad: pres.unidad,
      cantidad: entre(1, 12),
      precioUnitario: pres.precio,
      descuento: rnd() < 0.3 ? elegir([5, 10, 15]) : 0,
    }
  })
  // Los primeros cinco son los que caen en la bandeja de aprobación.
  const retenido = i < 5
  const estado = retenido
    ? ('retenido' as const)
    : i < 8
      ? ('pendiente de sincronizar' as const)
      : i < 14
        ? ('aprobado' as const)
        : ('facturado' as const)
  return {
    id: `p-${i}`,
    numero: `NP-${String(4820 + i)}`,
    fecha: masDias(-entre(0, 3)),
    empresaId: empresa.id,
    vendedor: empresa.propietario,
    visitaId: i < 3 ? `v-${i}` : undefined,
    lineas,
    estado,
    motivoRetencion: retenido
      ? cuenta.vencido > 0
        ? MOTIVOS_RETENCION[1]
        : elegir(MOTIVOS_RETENCION)
      : undefined,
    firmadoPor: estado === 'aprobado' || estado === 'facturado' ? 'Firmado en el local' : undefined,
  }
})

export const totalPedido = (p: Pedido) =>
  p.lineas.reduce((a, l) => a + l.precioUnitario * l.cantidad * (1 - l.descuento / 100), 0)

export const articuloDe = (id: string) => ARTICULOS.find((a) => a.id === id)
