import { useState } from 'react'
import {
  CheckCircle2, CloudOff, MapPin, Navigation, PackageCheck, RefreshCw, UserX,
} from 'lucide-react'
import type { EstadoVisita, Visita } from '../tipos-calle'
import { ETIQUETA_ESTADO_VISITA } from '../tipos-calle'
import { empresaDe } from '../data/crm'
import { cuentaDe } from '../data/calle'
import { resumenRuta } from '../lib/calle'
import { Barra, Panel } from '../componentes/Piezas'
import { num, pct, pesosARS } from '../lib/formato'

const TONO: Record<EstadoVisita, { color: string; fondo: string }> = {
  pendiente: { color: 'var(--tinta-suave)', fondo: 'var(--papel)' },
  'en curso': { color: 'var(--marca)', fondo: 'color-mix(in srgb, var(--marca) 10%, transparent)' },
  visitado: { color: 'var(--sano)', fondo: 'var(--sano-fondo)' },
  ausente: { color: 'var(--critico)', fondo: 'var(--critico-fondo)' },
  reasignado: { color: 'var(--riesgo)', fondo: 'var(--riesgo-fondo)' },
}

const MOTIVOS = ['Local cerrado', 'No estaba el encargado', 'Pidió volver mañana', 'No compra hoy']

interface Props {
  visitas: Visita[]
  cola: string[]
  checkIn: (id: string) => void
  checkOut: (id: string, estado?: EstadoVisita, motivo?: string) => void
  sincronizar: () => void
  abrirComercio: (empresaId: string, visitaId: string) => void
}

export function Ruta({ visitas, cola, checkIn, checkOut, sincronizar, abrirComercio }: Props) {
  const [ausentando, setAusentando] = useState<string | null>(null)
  const r = resumenRuta(visitas)

  return (
    <div className="grid gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-titulo">Mi ruta de hoy</h1>
          <p className="text-tinta-suave text-cuerpo">
            <span className="cifra">{num(r.total)}</span> comercios ·{' '}
            <span className="cifra">{num(r.pendientes)}</span> sin visitar
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1 rounded-sm px-2 py-1 text-micro font-semibold"
            style={{ color: 'var(--sano)', background: 'var(--sano-fondo)' }}
          >
            <PackageCheck size={14} strokeWidth={1.5} aria-hidden="true" />
            Catálogo descargado
          </span>
        </div>
      </header>

      {/* Cola de pedidos sin enviar: el caso de quedarse sin señal */}
      {cola.length > 0 && (
        <div
          className="panel p-3 flex flex-wrap items-center gap-3"
          style={{ background: 'var(--riesgo-fondo)', borderColor: 'var(--riesgo)' }}
        >
          <CloudOff size={18} strokeWidth={1.5} aria-hidden="true" style={{ color: 'var(--riesgo)' }} />
          <p className="text-cuerpo flex-1" style={{ color: 'var(--riesgo)' }}>
            <span className="cifra font-semibold">{num(cola.length)}</span>{' '}
            {cola.length === 1 ? 'pedido guardado' : 'pedidos guardados'} en el teléfono, esperando señal.
          </p>
          <button type="button" className="boton boton-secundario" onClick={sincronizar}>
            <RefreshCw size={16} strokeWidth={1.5} aria-hidden="true" />
            Sincronizar ahora
          </button>
        </div>
      )}

      <Panel titulo="Cumplimiento de la ruta">
        <Barra valor={r.visitados + r.ausentes} maximo={r.total} color="var(--sano)" etiqueta={pct(r.cumplimiento)} />
        <ul className="flex flex-wrap gap-4 mt-3 text-micro text-tinta-suave">
          <li><span className="cifra" style={{ color: 'var(--sano)' }}>{num(r.visitados)}</span> visitados</li>
          <li><span className="cifra" style={{ color: 'var(--critico)' }}>{num(r.ausentes)}</span> ausentes</li>
          <li><span className="cifra">{num(r.pendientes)}</span> pendientes</li>
        </ul>
      </Panel>

      <ol className="grid gap-2">
        {visitas.map((v) => {
          const emp = empresaDe(v.empresaId)
          const cuenta = cuentaDe(v.empresaId)
          const t = TONO[v.estado]
          return (
            <li key={v.id} className="panel p-3 grid gap-2" style={{ borderLeft: `3px solid ${t.color}` }}>
              <div className="flex items-start gap-3">
                <span
                  className="inline-grid place-items-center rounded-full cifra text-micro font-semibold shrink-0"
                  style={{ width: 28, height: 28, background: t.fondo, color: t.color }}
                  aria-hidden="true"
                >
                  {v.orden}
                </span>

                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    className="text-subtitulo font-semibold text-left truncate w-full hover:underline"
                    onClick={() => abrirComercio(v.empresaId, v.id)}
                  >
                    {emp?.razonSocial}
                  </button>
                  <p className="text-micro text-tinta-suave truncate">
                    {emp?.canal} · {emp?.localidad}
                  </p>
                </div>

                <span
                  className="inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-micro font-semibold shrink-0"
                  style={{ color: t.color, background: t.fondo }}
                >
                  <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 1, background: 'currentColor' }} />
                  {ETIQUETA_ESTADO_VISITA[v.estado]}
                </span>
              </div>

              {/* Semáforo de crédito, lo primero que necesita antes de ofrecer */}
              {cuenta && (
                <p className="text-micro flex flex-wrap items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1 rounded-sm px-2 py-0.5 font-semibold"
                    style={{
                      color:
                        cuenta.semaforo === 'rojo' ? 'var(--critico)'
                        : cuenta.semaforo === 'amarillo' ? 'var(--riesgo)' : 'var(--sano)',
                      background:
                        cuenta.semaforo === 'rojo' ? 'var(--critico-fondo)'
                        : cuenta.semaforo === 'amarillo' ? 'var(--riesgo-fondo)' : 'var(--sano-fondo)',
                    }}
                  >
                    {cuenta.vencido > 0
                      ? 'Con deuda vencida'
                      : cuenta.semaforo === 'rojo'
                        ? 'Límite agotado'
                        : cuenta.semaforo === 'amarillo'
                          ? 'Cerca del límite'
                          : 'Crédito disponible'}
                  </span>
                  {cuenta.vencido > 0 ? (
                    <span className="cifra" style={{ color: 'var(--critico)' }}>
                      {pesosARS(cuenta.vencido)} vencidos
                    </span>
                  ) : (
                    <span className="text-tinta-suave cifra">
                      {pesosARS(Math.max(0, cuenta.limiteCredito - cuenta.saldo))} disponibles
                    </span>
                  )}
                </p>
              )}

              {/* Sellos puntuales. No hay nada registrado entre uno y otro. */}
              {(v.checkIn || v.checkOut) && (
                <p className="text-micro text-tinta-suave flex flex-wrap items-center gap-3">
                  {v.checkIn && (
                    <span className="flex items-center gap-1">
                      <MapPin size={12} strokeWidth={1.5} aria-hidden="true" />
                      Llegada <span className="cifra">{v.checkIn.hora}</span> (±{v.checkIn.precision} m)
                    </span>
                  )}
                  {v.checkOut && (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 size={12} strokeWidth={1.5} aria-hidden="true" />
                      Cierre <span className="cifra">{v.checkOut.hora}</span>
                    </span>
                  )}
                </p>
              )}

              {v.motivoAusencia && (
                <p className="text-micro" style={{ color: 'var(--critico)' }}>{v.motivoAusencia}</p>
              )}

              {/* Acciones */}
              {v.estado === 'pendiente' && (
                <button
                  type="button"
                  className="boton boton-primario"
                  style={{ minHeight: 48 }}
                  onClick={() => checkIn(v.id)}
                >
                  <Navigation size={18} strokeWidth={1.5} aria-hidden="true" />
                  Llegué al local
                </button>
              )}

              {v.estado === 'en curso' && ausentando !== v.id && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className="boton boton-primario"
                    style={{ minHeight: 48 }}
                    onClick={() => abrirComercio(v.empresaId, v.id)}
                  >
                    Tomar pedido
                  </button>
                  <button
                    type="button"
                    className="boton boton-secundario"
                    style={{ minHeight: 48 }}
                    onClick={() => setAusentando(v.id)}
                  >
                    <UserX size={18} strokeWidth={1.5} aria-hidden="true" />
                    No vendí
                  </button>
                </div>
              )}

              {ausentando === v.id && (
                <div className="grid gap-2">
                  <p className="text-micro text-tinta-suave">¿Por qué no se tomó pedido?</p>
                  {MOTIVOS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      className="boton boton-secundario justify-start"
                      style={{ minHeight: 44 }}
                      onClick={() => { checkOut(v.id, 'ausente', m); setAusentando(null) }}
                    >
                      {m}
                    </button>
                  ))}
                  <button type="button" className="boton boton-sutil" onClick={() => setAusentando(null)}>
                    Cancelar
                  </button>
                </div>
              )}
            </li>
          )
        })}
      </ol>

      <p className="text-micro text-tinta-suave">
        La ubicación se toma sólo al marcar la llegada y al cerrar la visita, para certificar que
        ocurrió. No se registra el recorrido ni el tiempo entre visitas.
      </p>
    </div>
  )
}
