// Genera public/ejemplo-ventas.csv y los iconos PNG de la PWA.
// Se corre una sola vez: los archivos quedan versionados.
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const publico = join(raiz, 'app', 'public')
mkdirSync(publico, { recursive: true })

/* ------------------------------------------------------------------ PNG */
function crc32(buf) {
  let c
  const tabla = []
  for (let n = 0; n < 256; n++) {
    c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    tabla[n] = c >>> 0
  }
  let crc = 0xffffffff
  for (const b of buf) crc = tabla[(crc ^ b) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(tipo, datos) {
  const largo = Buffer.alloc(4)
  largo.writeUInt32BE(datos.length)
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(cuerpo))
  return Buffer.concat([largo, cuerpo, crc])
}

function png(ancho, alto, pixeles) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(ancho, 0)
  ihdr.writeUInt32BE(alto, 4)
  ihdr[8] = 8 // profundidad
  ihdr[9] = 6 // RGBA
  const crudo = Buffer.alloc((ancho * 4 + 1) * alto)
  for (let y = 0; y < alto; y++) {
    crudo[y * (ancho * 4 + 1)] = 0 // filtro none
    pixeles.copy(crudo, y * (ancho * 4 + 1) + 1, y * ancho * 4, (y + 1) * ancho * 4)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(crudo, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const hex = (h) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
]

/** El remito: sello azul, hoja de papel, tres renglones de tinta. */
function icono(lado, margenMarca) {
  const px = Buffer.alloc(lado * lado * 4)
  const sello = hex('#12408F')
  const papel = hex('#FAF8F5')

  const pintar = (x0, y0, x1, y1, color) => {
    for (let y = Math.max(0, y0 | 0); y < Math.min(lado, y1 | 0); y++) {
      for (let x = Math.max(0, x0 | 0); x < Math.min(lado, x1 | 0); x++) {
        const i = (y * lado + x) * 4
        px[i] = color[0]
        px[i + 1] = color[1]
        px[i + 2] = color[2]
        px[i + 3] = 255
      }
    }
  }

  pintar(0, 0, lado, lado, sello)

  const m = lado * margenMarca
  const hojaX0 = m
  const hojaY0 = m * 0.86
  const hojaX1 = lado - m
  const hojaY1 = lado - m * 0.86
  pintar(hojaX0, hojaY0, hojaX1, hojaY1, papel)

  const anchoHoja = hojaX1 - hojaX0
  const altoHoja = hojaY1 - hojaY0
  const grosor = Math.max(2, altoHoja * 0.085)
  const izq = hojaX0 + anchoHoja * 0.16
  const anchos = [0.68, 0.52, 0.38]
  anchos.forEach((w, i) => {
    const y = hojaY0 + altoHoja * (0.26 + i * 0.22)
    pintar(izq, y, izq + anchoHoja * w, y + grosor, sello)
  })

  return png(lado, lado, px)
}

writeFileSync(join(publico, 'icono-192.png'), icono(192, 0.16))
writeFileSync(join(publico, 'icono-512.png'), icono(512, 0.16))
writeFileSync(join(publico, 'icono-512-maskable.png'), icono(512, 0.26))
writeFileSync(join(publico, 'apple-touch-icon.png'), icono(180, 0.16))
writeFileSync(
  join(publico, 'icono.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" fill="#12408F"/><rect x="10" y="9" width="44" height="46" fill="#FAF8F5"/><g fill="#12408F"><rect x="17" y="21" width="30" height="4"/><rect x="17" y="31" width="23" height="4"/><rect x="17" y="41" width="17" height="4"/></g></svg>\n`,
)

/* ------------------------------------------------------------------ CSV */
const comercios = [
  'Autoservicio La Esquina', 'Kiosco Rivadavia 3400', 'Almacen Don Pedro',
  'Supermercado El Trebol', 'Maxikiosco 24hs Lanus', 'Despensa Santa Rita',
  'Almacen y Fiambreria Muniz', 'Minimercado Dona Rosa', 'Kiosco La Parada',
  'Autoservicio Hermanos Paz', 'Almacen San Cayetano', 'Kiosco Pavon 2280',
  'Autoservicio La Perla', 'Despensa Los Pinos', 'Minimercado El Ceibo',
  'Maxikiosco El Cruce', 'Supermercado La Central', 'Polirrubro La Paz',
  // Duplicado probable, a proposito:
  'Autoservicio La Esquina SRL',
]

const articulos = [
  'GALLETITAS SURTIDAS X12', 'GASEOSA COLA 2.25L X6', 'AGUA MINERAL 1.5L X6',
  'ALFAJORES TRIPLES X24', 'YERBA MATE 1KG X10', 'FIDEOS GUISEROS 500G X20',
  'ACEITE GIRASOL 900ML X12', 'PAPEL HIGIENICO X4', 'JABON EN POLVO 800G X10',
  'ARROZ LARGO FINO 1KG X10', 'PURE DE TOMATE 520G X12', 'CERVEZA LATA 473ML X24',
]

let semilla = 424242
const rnd = () => {
  semilla = (semilla * 1103515245 + 12345) % 2147483648
  return semilla / 2147483648
}
const elegir = (xs) => xs[Math.floor(rnd() * xs.length)]
const entre = (a, b) => a + Math.floor(rnd() * (b - a + 1))

const filas = [['Fecha', 'Razon Social', 'Comprobante', 'Articulo', 'Cantidad', 'Importe']]
for (let i = 0; i < 800; i++) {
  const d = entre(1, 28)
  const mes = entre(1, 9)
  let fecha = `${String(d).padStart(2, '0')}/${String(mes).padStart(2, '0')}/2026`
  let cliente = elegir(comercios)
  let importe = entre(8, 640) * 1000 + entre(0, 99) / 100

  // Problemas sembrados a proposito para que el informe muestre algo real.
  if (i === 118 || i === 402 || i === 671) fecha = ''
  if (i === 254) importe = -48250.4
  if (i === 517) cliente = ''

  filas.push([
    fecha,
    cliente,
    `FC-A-${String(entre(1, 9999)).padStart(5, '0')}`,
    elegir(articulos),
    String(entre(1, 24)),
    importe.toFixed(2).replace('.', ','),
  ])
}

const csv = filas.map((f) => f.map((v) => `"${v}"`).join(';')).join('\r\n')
writeFileSync(join(publico, 'ejemplo-ventas.csv'), '﻿' + csv, 'utf8')

console.log('Activos generados en public/')
