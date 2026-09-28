/**
 * Borra los artefactos del build anterior que viven en la raiz del repo.
 *
 * El build escribe en la raiz (porque la raiz ES el sitio publicado), asi que
 * `emptyOutDir` esta desactivado: vaciar la raiz borraria app/, package.json y
 * el repositorio entero. Este script hace la limpieza a mano y SOLO sobre una
 * lista blanca de nombres que produce el build. Todo lo que no esta en la
 * lista no se toca nunca.
 */
import { existsSync, readdirSync, rmSync, statSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..')

/** Nunca, bajo ninguna circunstancia. */
const INTOCABLES = new Set([
  '.git', '.github', '.claude', '.gitignore', 'app', 'node_modules', 'scripts',
  'package.json', 'package-lock.json', 'postcss.config.js', 'tailwind.config.js',
  'tsconfig.json', 'tsconfig.tsbuildinfo', 'vite.config.ts', 'README.md',
])

/** Carpetas y archivos exactos que produce el build. */
const CARPETAS = ['assets']
const ARCHIVOS = [
  'index.html',
  'manifest.webmanifest',
  'sw.js',
  'registerSW.js',
  '.nojekyll',
  'icono.svg',
  'icono-192.png',
  'icono-512.png',
  'icono-512-maskable.png',
  'apple-touch-icon.png',
  'ejemplo-ventas.csv',
]

/** Los workbox-*.js llevan hash, asi que van por patron. */
const PATRONES = [/^workbox-[\w-]+\.js$/]

let borrados = 0

for (const nombre of CARPETAS) {
  if (INTOCABLES.has(nombre)) continue
  const ruta = join(raiz, nombre)
  if (existsSync(ruta) && statSync(ruta).isDirectory()) {
    rmSync(ruta, { recursive: true, force: true })
    borrados++
  }
}

for (const nombre of readdirSync(raiz)) {
  if (INTOCABLES.has(nombre)) continue
  const coincide = ARCHIVOS.includes(nombre) || PATRONES.some((p) => p.test(nombre))
  if (!coincide) continue
  const ruta = join(raiz, nombre)
  if (statSync(ruta).isFile()) {
    rmSync(ruta, { force: true })
    borrados++
  }
}

console.log(`Salida anterior limpiada: ${borrados} elementos.`)
