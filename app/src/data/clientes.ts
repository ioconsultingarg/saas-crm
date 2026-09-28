import type { Cliente } from '../tipos'
import { construirSerie, fechaMenosDias } from '../lib/calculos'
import { FECHA_SALDOS } from './seed'

export { FECHA_SALDOS }

interface Base {
  id: string
  razonSocial: string
  cuit: string
  canal: Cliente['canal']
  zona: string
  vendedor: string
  cadencia: number | null
  dias: number
  factMensual: number
  compras: number
  productos: [string, number][]
  dejoDeLlevar?: string[]
  contactos: Cliente['contactos']
  saldo: number
  saldoVencido: number
  gestiones?: Cliente['gestiones']
  tendPesos: number
  tendUnid: number
  primeraCompraDias?: number
}

const base: Base[] = [
  {
    id: 'c-trebol',
    razonSocial: 'Supermercado El Trébol',
    cuit: '30712458093',
    canal: 'supermercado',
    zona: 'Quilmes',
    vendedor: 'Diego Sosa',
    cadencia: 21,
    dias: 63,
    factMensual: 520_000,
    compras: 19,
    productos: [
      ['Yerba mate 1 kg x10', 24],
      ['Aceite de girasol 900 ml x12', 21],
      ['Arroz largo fino 1 kg x10', 28],
      ['Fideos guiseros 500 g x20', 21],
    ],
    dejoDeLlevar: ['Cerveza lata 473 ml x24'],
    contactos: [
      { nombre: 'Silvana Gómez', rol: 'Encargada', telefono: '1144128890', whatsapp: true },
    ],
    saldo: 318_400,
    saldoVencido: 140_200,
    tendPesos: 0.05,
    tendUnid: -0.1,
  },
  {
    id: 'c-maxi24',
    razonSocial: 'Maxikiosco 24hs Lanús',
    cuit: '20284419377',
    canal: 'maxikiosco',
    zona: 'Lanús',
    vendedor: 'Marcela Ruiz',
    cadencia: 7,
    dias: 26,
    factMensual: 310_000,
    compras: 44,
    productos: [
      ['Alfajores triples x24', 7],
      ['Gaseosa cola 2.25 L x6', 9],
      ['Galletitas surtidas x12', 10],
    ],
    contactos: [{ nombre: 'Walter Gómez', rol: 'Dueño', telefono: '1167210345', whatsapp: true }],
    saldo: 96_500,
    saldoVencido: 0,
    gestiones: [
      { fecha: '2026-09-12', canal: 'whatsapp', resultado: 'no atendió', nota: 'Sin respuesta.' },
    ],
    tendPesos: 0.12,
    tendUnid: -0.05,
  },
  {
    id: 'c-paz',
    razonSocial: 'Autoservicio Hermanos Paz',
    cuit: '30710034821',
    canal: 'autoservicio',
    zona: 'La Matanza',
    vendedor: 'Hernán Prieto',
    cadencia: 10,
    dias: 33,
    factMensual: 245_000,
    compras: 31,
    productos: [
      ['Jabón en polvo 800 g x10', 14],
      ['Papel higiénico doble hoja x4', 12],
      ['Puré de tomate 520 g x12', 15],
    ],
    contactos: [{ nombre: 'Rubén Paz', rol: 'Dueño', telefono: '1139887412', whatsapp: true }],
    saldo: 182_000,
    saldoVencido: 61_300,
    tendPesos: 0.08,
    tendUnid: -0.12,
  },
  {
    id: 'c-esquina',
    razonSocial: 'Autoservicio La Esquina',
    cuit: '27302114558',
    canal: 'autoservicio',
    zona: 'CABA Sur',
    vendedor: 'Marcela Ruiz',
    cadencia: 12,
    dias: 41,
    factMensual: 186_000,
    compras: 26,
    productos: [
      ['Galletitas surtidas x12', 12],
      ['Gaseosa cola 2.25 L x6', 13],
      ['Agua mineral 1.5 L x6', 18],
    ],
    dejoDeLlevar: ['Alfajores triples x24'],
    contactos: [{ nombre: 'Nadia Britos', rol: 'Encargada', telefono: '1155287711', whatsapp: true }],
    saldo: 74_800,
    saldoVencido: 0,
    gestiones: [
      { fecha: '2026-09-05', canal: 'llamada', resultado: 'no atendió', nota: 'No atendió.' },
    ],
    tendPesos: 0.1,
    tendUnid: -0.08,
  },
  {
    id: 'c-muniz',
    razonSocial: 'Almacén y Fiambrería Muñiz',
    cuit: '20172339041',
    canal: 'almacén',
    zona: 'Avellaneda',
    vendedor: 'Vanina Coria',
    cadencia: 18,
    dias: 55,
    factMensual: 132_000,
    compras: 17,
    productos: [
      ['Fideos guiseros 500 g x20', 20],
      ['Puré de tomate 520 g x12', 22],
      ['Arroz largo fino 1 kg x10', 25],
    ],
    contactos: [{ nombre: 'Elsa Muñiz', rol: 'Dueña', telefono: '1144029963', whatsapp: false }],
    saldo: 41_600,
    saldoVencido: 41_600,
    tendPesos: 0.04,
    tendUnid: -0.14,
  },
  {
    id: 'c-rosa',
    razonSocial: 'Minimercado Doña Rosa',
    cuit: '27259884106',
    canal: 'minimercado',
    zona: 'Lomas de Zamora',
    vendedor: 'Lucas Bianchi',
    cadencia: 14,
    dias: 39,
    factMensual: 175_000,
    compras: 22,
    productos: [
      ['Aceite de girasol 900 ml x12', 16],
      ['Yerba mate 1 kg x10', 15],
      ['Jabón en polvo 800 g x10', 19],
    ],
    contactos: [{ nombre: 'Rosa Ledesma', rol: 'Dueña', telefono: '1162340018', whatsapp: true }],
    saldo: 128_900,
    saldoVencido: 0,
    tendPesos: 0.09,
    tendUnid: -0.06,
  },
  {
    id: 'c-santarita',
    razonSocial: 'Despensa Santa Rita',
    cuit: '20301127744',
    canal: 'almacén',
    zona: 'Quilmes',
    vendedor: 'Rocío Ferrari',
    cadencia: 15,
    dias: 44,
    factMensual: 88_000,
    compras: 15,
    productos: [
      ['Galletitas surtidas x12', 17],
      ['Agua mineral 1.5 L x6', 16],
      ['Arroz largo fino 1 kg x10', 21],
    ],
    contactos: [{ nombre: 'Jorge Ojeda', rol: 'Dueño', telefono: '1158720394', whatsapp: true }],
    saldo: 22_300,
    saldoVencido: 0,
    tendPesos: 0.06,
    tendUnid: -0.09,
  },
  {
    id: 'c-parada',
    razonSocial: 'Kiosco La Parada',
    cuit: '20355018829',
    canal: 'kiosco',
    zona: 'Lanús',
    vendedor: 'Diego Sosa',
    cadencia: 9,
    dias: 30,
    factMensual: 64_000,
    compras: 33,
    productos: [
      ['Alfajores triples x24', 9],
      ['Gaseosa cola 2.25 L x6', 11],
      ['Galletitas surtidas x12', 12],
    ],
    contactos: [{ nombre: 'Mauro Ávila', rol: 'Dueño', telefono: '1130095517', whatsapp: true }],
    saldo: 18_400,
    saldoVencido: 0,
    tendPesos: 0.11,
    tendUnid: -0.04,
  },
  {
    id: 'c-rivadavia',
    razonSocial: 'Kiosco Rivadavia 3400',
    cuit: '20409937215',
    canal: 'kiosco',
    zona: 'CABA Sur',
    vendedor: 'Lucas Bianchi',
    cadencia: null,
    dias: 38,
    factMensual: 42_000,
    compras: 1,
    primeraCompraDias: 38,
    productos: [['Alfajores triples x24', 0]],
    contactos: [{ nombre: 'Brian Sequeira', rol: 'Dueño', telefono: '1169447730', whatsapp: true }],
    saldo: 42_000,
    saldoVencido: 0,
    tendPesos: 0,
    tendUnid: 0,
  },
  {
    id: 'c-donpedro',
    razonSocial: 'Almacén Don Pedro',
    cuit: '20189044372',
    canal: 'almacén',
    zona: 'Avellaneda',
    vendedor: 'Vanina Coria',
    cadencia: 10,
    dias: 9,
    factMensual: 95_000,
    compras: 38,
    productos: [
      ['Fideos guiseros 500 g x20', 11],
      ['Puré de tomate 520 g x12', 12],
      ['Yerba mate 1 kg x10', 14],
    ],
    dejoDeLlevar: ['Aceite de girasol 900 ml x12', 'Cerveza lata 473 ml x24'],
    contactos: [{ nombre: 'Pedro Ferreyra', rol: 'Dueño', telefono: '1147712205', whatsapp: true }],
    saldo: 55_100,
    saldoVencido: 0,
    // El caso trampa: la plata sube, el volumen se derrumba.
    tendPesos: 0.18,
    tendUnid: -0.31,
  },
]

export const CLIENTES_A_MANO: Cliente[] = base.map((b, i) => ({
  id: b.id,
  razonSocial: b.razonSocial,
  cuit: b.cuit,
  canal: b.canal,
  zona: b.zona,
  vendedor: b.vendedor,
  primeraCompra: fechaMenosDias(b.primeraCompraDias ?? 380 + i * 5),
  ultimaCompra: fechaMenosDias(b.dias),
  compras: b.compras,
  cadencia: b.cadencia,
  desvio: b.cadencia ? Math.max(1, Math.round(b.cadencia * 0.25)) : 0,
  factMensual: b.factMensual,
  serie: construirSerie(b.factMensual, b.tendPesos, b.tendUnid, 7919 + i * 131),
  productos: b.productos.map(([nombre, cada]) => ({
    nombre,
    cadaCuantosDias: cada,
    diasDesdeUltima: b.dias + Math.round(cada * 0.3),
  })),
  dejoDeLlevar: b.dejoDeLlevar ?? [],
  contactos: b.contactos,
  saldo: b.saldo,
  saldoVencido: b.saldoVencido,
  gestiones: b.gestiones ?? [],
  tendenciaPesosFija: b.tendPesos,
  tendenciaUnidadesFija: b.tendUnid,
}))
