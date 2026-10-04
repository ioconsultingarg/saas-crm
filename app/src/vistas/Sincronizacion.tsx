import { useEffect, useState } from 'react'
import { Check, CloudDownload, Loader2, Wifi } from 'lucide-react'
import { ARTICULOS } from '../data/calle'
import { EMPRESAS } from '../data/crm'
import { num } from '../lib/formato'

interface Paquete {
  id: string
  nombre: string
  detalle: string
  items: number
}

/**
 * Primera sincronización del día: antes de salir a la calle el teléfono se
 * lleva todo lo que necesita para trabajar sin señal. Es una pantalla real
 * del flujo, no un adorno: si esto no corre, el resto no funciona offline.
 */
export function Sincronizacion({ alTerminar }: { alTerminar: () => void }) {
  const paquetes: Paquete[] = [
    { id: 'ruta', nombre: 'Ruta del día', detalle: 'Comercios a visitar, en orden', items: 9 },
    { id: 'clientes', nombre: 'Fichas de clientes', detalle: 'Contactos, historial y cuenta corriente', items: EMPRESAS.length },
    { id: 'catalogo', nombre: 'Catálogo y precios', detalle: 'Artículos, presentaciones y listas', items: ARTICULOS.length },
    { id: 'stock', nombre: 'Stock y lotes', detalle: 'Disponibilidad y vencimientos', items: ARTICULOS.filter((a) => a.lotes).length },
  ]

  const [listos, setListos] = useState<string[]>([])
  const [enCurso, setEnCurso] = useState<string | null>(paquetes[0].id)

  useEffect(() => {
    if (!enCurso) return
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const t = window.setTimeout(() => {
      setListos((l) => [...l, enCurso])
      const i = paquetes.findIndex((p) => p.id === enCurso)
      setEnCurso(paquetes[i + 1]?.id ?? null)
    }, reducido ? 60 : 420)
    return () => window.clearTimeout(t)
  }, [enCurso])

  const completo = listos.length === paquetes.length

  return (
    <div className="grid gap-4" style={{ maxWidth: 520 }}>
      <header>
        <h1 className="font-display text-titulo">Preparar el día</h1>
        <p className="text-tinta-suave text-cuerpo">
          Se descarga todo al teléfono para poder trabajar sin señal. Conviene hacerlo con wifi
          antes de salir.
        </p>
      </header>

      <div className="panel p-4 grid gap-3">
        <p className="flex items-center gap-2 text-cuerpo">
          <Wifi size={18} strokeWidth={1.5} aria-hidden="true" style={{ color: 'var(--sano)' }} />
          Conectado
        </p>

        <ul className="grid gap-2" aria-live="polite">
          {paquetes.map((p) => {
            const hecho = listos.includes(p.id)
            const activo = enCurso === p.id
            return (
              <li
                key={p.id}
                className="flex items-center gap-3 rounded p-2"
                style={{
                  border: '1px solid var(--pauta)',
                  opacity: hecho || activo ? 1 : 0.5,
                  transition: 'opacity var(--mov-corto) var(--curva)',
                }}
              >
                <span className="shrink-0" style={{ width: 20, height: 20 }}>
                  {hecho ? (
                    <Check size={20} strokeWidth={2} aria-hidden="true" style={{ color: 'var(--sano)' }} />
                  ) : activo ? (
                    <Loader2 size={20} strokeWidth={1.5} aria-hidden="true" className="girando" style={{ color: 'var(--marca)' }} />
                  ) : (
                    <CloudDownload size={20} strokeWidth={1.5} aria-hidden="true" style={{ color: 'var(--tinta-suave)' }} />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-cuerpo font-semibold">{p.nombre}</span>
                  <span className="block text-micro text-tinta-suave">{p.detalle}</span>
                </span>
                <span className="cifra text-micro text-tinta-suave shrink-0">
                  {hecho ? `${num(p.items)} listos` : activo ? 'descargando…' : `${num(p.items)}`}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      <button
        type="button"
        className="boton boton-primario"
        style={{ minHeight: 52 }}
        disabled={!completo}
        onClick={alTerminar}
      >
        {completo ? 'Empezar la ruta' : 'Descargando…'}
      </button>

      <p className="text-micro text-tinta-suave">
        Una vez descargado, la app abre y toma pedidos sin conexión. Los pedidos quedan guardados
        en el teléfono y se envían solos cuando vuelve la señal.
      </p>
    </div>
  )
}
