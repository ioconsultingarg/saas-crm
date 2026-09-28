// Todo el formato pasa por Intl con locale es-AR. Nada a mano.

const pesos0 = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

const numero0 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 })

const porcentaje = new Intl.NumberFormat('es-AR', {
  style: 'percent',
  maximumFractionDigits: 0,
  signDisplay: 'exceptZero',
})

const fechaCorta = new Intl.DateTimeFormat('es-AR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})

const mesCorto = new Intl.DateTimeFormat('es-AR', { month: 'short' })

export const pesosARS = (n: number) => pesos0.format(n)
export const num = (n: number) => numero0.format(n)
export const pct = (n: number) => porcentaje.format(n)

const porcentajeSinSigno = new Intl.NumberFormat('es-AR', {
  style: 'percent',
  maximumFractionDigits: 0,
})
/** Para frases que ya dicen la direccion: "las unidades bajan 31%". */
export const pctPlano = (n: number) => porcentajeSinSigno.format(Math.abs(n))

export const fecha = (iso: string) => fechaCorta.format(new Date(iso + 'T12:00:00'))

export function mesEtiqueta(iso: string): string {
  const [a, m] = iso.split('-')
  const d = new Date(Number(a), Number(m) - 1, 1)
  return `${mesCorto.format(d).replace('.', '')} ${a.slice(2)}`
}

/** Escala corta para los ejes del grafico: $520 K. */
export function pesosCorto(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${numero0.format(Math.round(n / 100_000) / 10)} M`
  if (Math.abs(n) >= 1_000) return `$${numero0.format(Math.round(n / 1_000))} K`
  return pesos0.format(n)
}

/** Espacio duro para que "41 dias" no se parta al final de una linea. */
export const dias = (n: number) => `${numero0.format(n)} ${n === 1 ? 'día' : 'días'}`

export function cuitFormateado(cuit: string): string {
  const s = cuit.replace(/\D/g, '')
  if (s.length !== 11) return cuit
  return `${s.slice(0, 2)}-${s.slice(2, 10)}-${s.slice(10)}`
}

export function telefonoWhatsapp(tel: string): string {
  const s = tel.replace(/\D/g, '')
  return `https://wa.me/54${s.startsWith('54') ? s.slice(2) : s}`
}
