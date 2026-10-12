/**
 * Genera app/public/og.png (1200x630), la imagen que aparece al compartir el
 * link por WhatsApp. Sin dependencias: compone el PNG a mano, igual que los
 * iconos de la PWA.
 *
 * Es geometrica a proposito: no hay fuente disponible para rasterizar texto
 * sin sumar una dependencia, y una composicion de barras con la marca lee
 * mejor a tamano de miniatura que un texto chico y pixelado.
 */
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')
const publico = join(raiz, 'app', 'public')
mkdirSync(publico, { recursive: true })

function crc32(buf) {
  const tabla = []
  for (let n = 0; n < 256; n++) {
    let c = n
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

function png(ancho, alto, px) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(ancho, 0)
  ihdr.writeUInt32BE(alto, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  const crudo = Buffer.alloc((ancho * 4 + 1) * alto)
  for (let y = 0; y < alto; y++) {
    crudo[y * (ancho * 4 + 1)] = 0
    px.copy(crudo, y * (ancho * 4 + 1) + 1, y * ancho * 4, (y + 1) * ancho * 4)
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

const A = 1200
const AL = 630
const px = Buffer.alloc(A * AL * 4)

const campo = hex('#0D2F6B')
const papel = hex('#FAF8F5')
const verde = hex('#6FDCA6')
const tenue = hex('#1A3F80')

const pintar = (x0, y0, x1, y1, color, alfa = 255) => {
  for (let y = Math.max(0, y0 | 0); y < Math.min(AL, y1 | 0); y++) {
    for (let x = Math.max(0, x0 | 0); x < Math.min(A, x1 | 0); x++) {
      const i = (y * A + x) * 4
      px[i] = color[0]
      px[i + 1] = color[1]
      px[i + 2] = color[2]
      px[i + 3] = alfa
    }
  }
}

// Fondo: campo azul con la pauta cuadriculada del login
pintar(0, 0, A, AL, campo)
for (let x = 0; x < A; x += 48) pintar(x, 0, x + 1, AL, tenue)
for (let y = 0; y < AL; y += 48) pintar(0, y, A, y + 1, tenue)

// Marca: la hoja con el monograma, a la izquierda
const mx = 96
const my = 150
pintar(mx, my, mx + 150, my + 170, papel)
pintar(mx + 24, my + 34, mx + 102, my + 46, campo)
pintar(mx + 24, my + 70, mx + 84, my + 82, campo)
pintar(mx + 24, my + 106, mx + 62, my + 118, campo)

// Barras del embudo, a la derecha: la imagen del producto en una mirada
const bx = 320
let by = 150
const anchos = [740, 560, 420, 300, 190]
for (const w of anchos) {
  pintar(bx, by, bx + w, by + 46, papel)
  pintar(bx, by, bx + 6, by + 46, verde)
  by += 62
}

// Franja inferior: barra verde de acento
pintar(0, AL - 14, A, AL, verde)

writeFileSync(join(publico, 'og.png'), png(A, AL, px))
console.log('og.png generado en app/public/ (1200x630)')
