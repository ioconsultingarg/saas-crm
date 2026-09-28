import type { Canal, Cliente } from '../tipos'
import { construirSerie, fechaMenosDias } from '../lib/calculos'
import { PRODUCTOS, VENDEDORES, ZONAS } from './seed'

/** PRNG con semilla fija: la demo tiene que dar siempre los mismos numeros. */
function mulberry32(a: number) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const rnd = mulberry32(20260922)
const elegir = <T,>(xs: readonly T[]): T => xs[Math.floor(rnd() * xs.length)]
const entre = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1))

const PREFIJOS: [string, Canal][] = [
  ['Kiosco', 'kiosco'],
  ['Maxikiosco', 'maxikiosco'],
  ['Almacén', 'almacén'],
  ['Despensa', 'almacén'],
  ['Autoservicio', 'autoservicio'],
  ['Minimercado', 'minimercado'],
  ['Mercadito', 'minimercado'],
  ['Supermercado', 'supermercado'],
  ['Polirrubro', 'kiosco'],
]

const NOMBRES = [
  'San Cayetano', 'La Perla', 'Don Alberto', 'Las Flores', 'El Ceibo', 'Los Andes',
  'Santa Clara', 'El Progreso', 'La Nueva Estrella', 'Doña Marta', 'El Rincón',
  'La Amistad', 'San Jorge', 'Los Pinos', 'El Trigal', 'La Esperanza', 'Don Julio',
  'El Molino', 'La Tablada', 'Nueva Era', 'El Sol', 'La Estación', 'San Martín',
  'Los Robles', 'El Puente', 'La Colonia', 'Doña Ana', 'El Faro', 'La Paz',
  'Don Ramón', 'El Trébol Azul', 'La Central', 'Santa Rosa', 'El Abasto',
  'La Familia', 'Don Chino', 'El Ombú', 'La Bodeguita', 'San Pedro', 'El Galpón',
  'La Terminal', 'Doña Chela', 'El Mirador', 'La Barraca', 'Don Nico', 'El Cruce',
  'La Vía', 'Santa Elena', 'El Portal', 'La Rambla',
]

const CALLES = [
  'Rivadavia', 'Mitre', 'Belgrano', 'Alsina', 'Yrigoyen', 'Sarmiento', 'Pavón',
  'Colón', 'Brown', 'Güemes', 'Moreno', 'Dorrego', 'Lavalle', 'Urquiza', 'Roca',
]

const APELLIDOS = [
  'Gómez', 'Fernández', 'Rodríguez', 'López', 'Martínez', 'Sosa', 'Romero',
  'Álvarez', 'Torres', 'Ruiz', 'Benítez', 'Acosta', 'Medina', 'Herrera', 'Aguirre',
  'Cabrera', 'Godoy', 'Molina', 'Ojeda', 'Villalba', 'Quiroga', 'Peralta',
]

const ROLES = ['Dueño', 'Dueña', 'Encargado', 'Encargada', 'Depósito', 'Pagos']

const usados = new Set<string>()
function nombreComercio(): { razon: string; canal: Canal } {
  for (let intento = 0; intento < 60; intento++) {
    const [prefijo, canal] = elegir(PREFIJOS)
    const cuerpo =
      rnd() < 0.7 ? elegir(NOMBRES) : `${elegir(CALLES)} ${entre(100, 9800)}`
    const razon = `${prefijo} ${cuerpo}`
    if (!usados.has(razon)) {
      usados.add(razon)
      return { razon, canal }
    }
  }
  const razon = `Almacén ${elegir(APELLIDOS)} ${usados.size}`
  usados.add(razon)
  return { razon, canal: 'almacén' }
}

function cuit(): string {
  const cuerpo = String(entre(10_000_000, 44_999_999))
  return `${elegir(['20', '23', '27', '30'])}${cuerpo}${entre(0, 9)}`
}

function telefono(): string {
  return `11${entre(30_000_000, 69_999_999)}`
}

function productosDe(cadencia: number) {
  const elegidos = new Set<string>()
  while (elegidos.size < 3) elegidos.add(elegir(PRODUCTOS))
  return [...elegidos].map((nombre) => ({
    nombre,
    cadaCuantosDias: Math.max(5, cadencia + entre(-3, 8)),
    diasDesdeUltima: cadencia + entre(0, 12),
  }))
}

function armar(
  i: number,
  cadencia: number,
  dias: number,
  factMensual: number,
  tendPesos: number,
  tendUnid: number,
  compras: number,
): Cliente {
  const { razon, canal } = nombreComercio()
  const conSaldo = rnd() < 0.55
  const saldo = conSaldo ? Math.round(factMensual * (0.2 + rnd() * 0.9)) : 0
  return {
    id: `g-${i}`,
    razonSocial: razon,
    cuit: cuit(),
    canal,
    zona: elegir(ZONAS),
    vendedor: elegir(VENDEDORES),
    primeraCompra: fechaMenosDias(Math.min(420, dias + compras * cadencia)),
    ultimaCompra: fechaMenosDias(dias),
    compras,
    cadencia,
    desvio: Math.max(1, Math.round(cadencia * 0.25)),
    factMensual,
    serie: construirSerie(factMensual, tendPesos, tendUnid, 104729 + i * 977),
    productos: productosDe(cadencia),
    dejoDeLlevar: rnd() < 0.25 ? [elegir(PRODUCTOS)] : [],
    contactos: [
      {
        nombre: `${elegir(['Carlos', 'Ana', 'Jorge', 'Silvia', 'Marcos', 'Laura', 'Rubén', 'Nadia'])} ${elegir(APELLIDOS)}`,
        rol: elegir(ROLES),
        telefono: telefono(),
        whatsapp: rnd() < 0.85,
      },
    ],
    saldo,
    saldoVencido: conSaldo && rnd() < 0.3 ? Math.round(saldo * 0.6) : 0,
    gestiones: [],
  }
}

/* ---------------------------------------------------------------------------
   13 clientes con alerta que completan los $4.180.000 del encabezado.
   El atraso se elige de modo que factMensual * atraso / 30 de exacto el monto,
   para que el total cierre al peso y no "casi".
   --------------------------------------------------------------------------- */
const MONTOS_OBJETIVO = [
  420_000, 310_000, 268_000, 231_000, 205_000, 186_000, 162_000, 141_000, 118_000,
  96_000, 84_000, 73_000, 84_084,
]

const ATRASOS_POSIBLES = [60, 45, 30, 20, 15]

/** Rota el atraso preferido por indice para que los 13 no queden todos iguales. */
function atrasoExacto(monto: number, k: number): number {
  const n = ATRASOS_POSIBLES.length
  for (let j = 0; j < n; j++) {
    const at = ATRASOS_POSIBLES[(k + j) % n]
    if ((monto * 30) % at === 0) {
      const f = (monto * 30) / at
      if (f >= 20_000 && f <= 1_200_000) return at
    }
  }
  return 30
}

function generarConAlerta(): Cliente[] {
  return MONTOS_OBJETIVO.map((monto, k) => {
    const atraso = atrasoExacto(monto, k)
    const factMensual = (monto * 30) / atraso
    // dias > cadencia * 1.5 y <= 120  =>  atraso > cadencia / 2
    const cadencia = Math.max(6, Math.min(30, Math.floor(atraso / 2) - 1))
    const dias = cadencia + atraso
    return armar(k, cadencia, dias, factMensual, 0.09, 0.02, entre(8, 40))
  })
}

function generarSinAlerta(): Cliente[] {
  const out: Cliente[] = []
  let i = 100

  // 148 activos frecuentes: al dia
  for (let k = 0; k < 148; k++) {
    const cadencia = entre(6, 28)
    const dias = Math.max(1, Math.round(cadencia * (0.3 + rnd() * 0.85)))
    out.push(armar(i++, cadencia, dias, entre(28, 620) * 1000, 0.1, 0.03, entre(10, 48)))
  }
  // 96 activos esporadicos: entre 1,2 y 1,5 cadencias
  for (let k = 0; k < 96; k++) {
    const cadencia = entre(8, 30)
    const dias = Math.min(
      Math.floor(cadencia * 1.5),
      Math.max(Math.ceil(cadencia * 1.2) + 1, Math.round(cadencia * 1.35)),
    )
    out.push(armar(i++, cadencia, dias, entre(22, 380) * 1000, 0.08, 0.01, entre(6, 30)))
  }
  // 61 dormidos: entre 121 y 240 dias
  for (let k = 0; k < 61; k++) {
    out.push(armar(i++, entre(10, 30), entre(121, 240), entre(18, 260) * 1000, 0.05, 0.02, entre(4, 22)))
  }
  // 84 perdidos: mas de 240 dias
  for (let k = 0; k < 84; k++) {
    out.push(armar(i++, entre(10, 35), entre(241, 400), entre(15, 220) * 1000, 0.04, 0.01, entre(3, 18)))
  }
  return out
}

export const CLIENTES_GENERADOS: Cliente[] = [...generarConAlerta(), ...generarSinAlerta()]
