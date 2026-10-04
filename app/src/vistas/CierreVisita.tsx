import { useRef, useState } from 'react'
import { CheckCircle2, CloudOff, Eraser, Lock, PenLine } from 'lucide-react'
import { empresaDe } from '../data/crm'
import { evaluarCredito, totalizar } from '../lib/calle'
import { Panel } from '../componentes/Piezas'
import { fecha, num, pesosARS } from '../lib/formato'
import { FECHA_ULTIMO_DATO } from '../data/seed'
import type { Carrito } from '../hooks/useCalle'

interface Props {
  carrito: Carrito | null
  confirmar: (retenido: boolean, motivo?: string) => { numero: string; retenido: boolean; motivo?: string } | null
  volverARuta: () => void
}

export function CierreVisita({ carrito, confirmar, volverARuta }: Props) {
  const [nombre, setNombre] = useState('')
  const [trazos, setTrazos] = useState<string[]>([])
  const [actual, setActual] = useState<string>('')
  const [hecho, setHecho] = useState<{ numero: string; retenido: boolean; motivo?: string } | null>(null)
  const lienzo = useRef<SVGSVGElement>(null)
  const dibujando = useRef(false)

  if (!carrito && !hecho) {
    return <p className="text-cuerpo">No hay pedido abierto.</p>
  }

  const t = totalizar(carrito?.lineas ?? [])
  const credito = carrito ? evaluarCredito(carrito.empresaId, t.total) : null
  const retenido = Boolean(credito && !credito.alcanza)
  const emp = carrito ? empresaDe(carrito.empresaId) : null

  /* ------------------------------------------------------------ firma */

  const punto = (e: React.PointerEvent) => {
    const r = lienzo.current?.getBoundingClientRect()
    if (!r) return null
    return `${Math.round(e.clientX - r.left)},${Math.round(e.clientY - r.top)}`
  }

  const empezar = (e: React.PointerEvent) => {
    const p = punto(e)
    if (!p) return
    dibujando.current = true
    lienzo.current?.setPointerCapture(e.pointerId)
    setActual(`M${p}`)
  }

  const mover = (e: React.PointerEvent) => {
    if (!dibujando.current) return
    const p = punto(e)
    if (p) setActual((a) => `${a} L${p}`)
  }

  const soltar = () => {
    if (!dibujando.current) return
    dibujando.current = false
    if (actual) setTrazos((t) => [...t, actual])
    setActual('')
  }

  const hayFirma = trazos.length > 0 || actual !== ''

  /* ---------------------------------------------------------- resultado */

  if (hecho) {
    return (
      <div className="grid gap-4">
        <div
          className="panel p-5 grid gap-3 justify-items-center text-center"
          style={{ borderLeft: `3px solid ${hecho.retenido ? 'var(--riesgo)' : 'var(--sano)'}` }}
        >
          {hecho.retenido ? (
            <Lock size={34} strokeWidth={1.5} aria-hidden="true" style={{ color: 'var(--riesgo)' }} />
          ) : (
            <CheckCircle2 size={34} strokeWidth={1.5} aria-hidden="true" style={{ color: 'var(--sano)' }} />
          )}
          <h1 className="font-display text-titulo">
            {hecho.retenido ? 'Pedido tomado, pendiente de autorización' : 'Visita cerrada'}
          </h1>
          <p className="cifra text-subtitulo font-semibold">{hecho.numero}</p>
          {hecho.motivo && (
            <p className="text-cuerpo" style={{ color: 'var(--riesgo)' }}>{hecho.motivo}</p>
          )}
          <p className="text-cuerpo text-tinta-suave flex items-center gap-2">
            <CloudOff size={16} strokeWidth={1.5} aria-hidden="true" />
            Guardado en el teléfono. Se envía solo cuando vuelva la señal.
          </p>
          <button type="button" className="boton boton-primario" style={{ minHeight: 48 }} onClick={volverARuta}>
            Seguir con la ruta
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4">
      <header>
        <h1 className="font-display text-titulo">Cerrar visita</h1>
        <p className="text-tinta-suave text-cuerpo">{emp?.razonSocial}</p>
      </header>

      <Panel titulo="Lo que se va a enviar">
        <dl className="grid gap-2">
          <div className="flex justify-between gap-2">
            <dt className="text-cuerpo text-tinta-suave">Artículos</dt>
            <dd className="cifra">{num(carrito?.lineas.length ?? 0)}</dd>
          </div>
          <div className="flex justify-between gap-2">
            <dt className="text-cuerpo text-tinta-suave">Fecha</dt>
            <dd className="cifra">{fecha(FECHA_ULTIMO_DATO)}</dd>
          </div>
          <div className="flex justify-between gap-2" style={{ borderTop: '1px solid var(--pauta)', paddingTop: 8 }}>
            <dt className="text-subtitulo font-semibold">Total</dt>
            <dd className="font-display cifra" style={{ fontSize: 24 }}>{pesosARS(t.total)}</dd>
          </div>
        </dl>

        {retenido && credito?.motivo && (
          <p
            className="mt-3 rounded-sm p-2 text-cuerpo flex items-start gap-2"
            style={{ background: 'var(--riesgo-fondo)', color: 'var(--riesgo)' }}
          >
            <Lock size={16} strokeWidth={1.5} aria-hidden="true" className="shrink-0 mt-0.5" />
            {credito.motivo} Se guarda igual y queda en la bandeja de aprobación.
          </p>
        )}
      </Panel>

      <Panel
        titulo="Firma del comerciante"
        accion={
          hayFirma ? (
            <button type="button" className="boton boton-sutil" onClick={() => { setTrazos([]); setActual('') }}>
              <Eraser size={16} strokeWidth={1.5} aria-hidden="true" />
              Borrar
            </button>
          ) : undefined
        }
      >
        <label className="sr-only" htmlFor="firmante">Nombre de quien firma</label>
        <input
          id="firmante" className="campo w-full mb-2" placeholder="Nombre de quien recibe…"
          value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="name"
        />

        <svg
          ref={lienzo}
          role="img"
          aria-label="Área de firma"
          onPointerDown={empezar}
          onPointerMove={mover}
          onPointerUp={soltar}
          onPointerLeave={soltar}
          className="w-full rounded"
          style={{
            height: 180,
            background: 'var(--superficie)',
            border: `2px dashed ${hayFirma ? 'var(--marca)' : 'var(--borde-control)'}`,
            touchAction: 'none',
            cursor: 'crosshair',
          }}
        >
          {[...trazos, actual].filter(Boolean).map((d, i) => (
            <path key={i} d={d} fill="none" stroke="var(--tinta)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          ))}
        </svg>

        <p className="text-micro text-tinta-suave mt-2 flex items-center gap-2">
          <PenLine size={14} strokeWidth={1.5} aria-hidden="true" />
          Firmá con el dedo. Es opcional: se puede cerrar la visita sin firma.
        </p>
      </Panel>

      <button
        type="button"
        className="boton boton-primario"
        style={{ minHeight: 52 }}
        onClick={() => setHecho(confirmar(retenido, credito?.motivo))}
      >
        {retenido ? 'Guardar para autorización' : 'Confirmar y cerrar visita'}
      </button>
    </div>
  )
}
