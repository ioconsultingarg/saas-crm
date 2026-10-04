import { useMemo } from 'react'
import { ArrowRight, Lock, Minus, Plus, ShoppingCart, Trash2, TriangleAlert } from 'lucide-react'
import { ETIQUETA_UNIDAD } from '../tipos-calle'
import { articuloDe } from '../data/calle'
import { empresaDe } from '../data/crm'
import { evaluarCredito, totalizar } from '../lib/calle'
import { Panel } from '../componentes/Piezas'
import { num, pesosARS } from '../lib/formato'
import type { Carrito } from '../hooks/useCalle'

interface Props {
  carrito: Carrito | null
  cambiarCantidad: (i: number, cantidad: number) => void
  cambiarDescuento: (i: number, descuento: number) => void
  irACatalogo: () => void
  irAlCierre: () => void
}

export function CarritoPedido({ carrito, cambiarCantidad, cambiarDescuento, irACatalogo, irAlCierre }: Props) {
  const t = useMemo(() => totalizar(carrito?.lineas ?? []), [carrito])
  const credito = useMemo(
    () => (carrito ? evaluarCredito(carrito.empresaId, t.total) : null),
    [carrito, t.total],
  )

  if (!carrito) {
    return (
      <div className="panel p-6 text-center grid gap-3 justify-items-center">
        <ShoppingCart size={32} strokeWidth={1.5} aria-hidden="true" style={{ color: 'var(--tinta-suave)' }} />
        <h1 className="font-display text-titulo">No hay pedido abierto</h1>
        <p className="text-cuerpo text-tinta-suave">Abrí uno desde la ficha de un comercio de tu ruta.</p>
      </div>
    )
  }

  const emp = empresaDe(carrito.empresaId)
  const vacio = carrito.lineas.length === 0

  return (
    <div className="grid gap-4">
      <header>
        <h1 className="font-display text-titulo">Pedido</h1>
        <p className="text-tinta-suave text-cuerpo">{emp?.razonSocial}</p>
      </header>

      {vacio ? (
        <div className="panel p-6 text-center grid gap-3 justify-items-center">
          <p className="text-cuerpo text-tinta-suave">Todavía no agregaste artículos.</p>
          <button type="button" className="boton boton-primario" onClick={irACatalogo}>Ir al catálogo</button>
        </div>
      ) : (
        <>
          <ul className="grid gap-2">
            {carrito.lineas.map((l, i) => {
              const a = articuloDe(l.articuloId)
              if (!a) return null
              const sub = l.precioUnitario * l.cantidad * (1 - l.descuento / 100)
              return (
                <li key={`${l.articuloId}-${l.unidad}`} className="panel p-3 grid gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="min-w-0">
                      <span className="block text-cuerpo font-semibold truncate">{a.nombre}</span>
                      <span className="block text-micro text-tinta-suave">
                        {ETIQUETA_UNIDAD[l.unidad]} · {pesosARS(l.precioUnitario)} c/u
                      </span>
                    </span>
                    <span className="cifra font-semibold shrink-0">{pesosARS(Math.round(sub))}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button type="button" className="boton boton-secundario" style={{ minWidth: 44 }}
                      onClick={() => cambiarCantidad(i, l.cantidad - 1)} aria-label={`Restar uno de ${a.nombre}`}>
                      <Minus size={16} strokeWidth={1.5} aria-hidden="true" />
                    </button>
                    <span className="cifra text-cuerpo font-semibold w-8 text-center">{l.cantidad}</span>
                    <button type="button" className="boton boton-secundario" style={{ minWidth: 44 }}
                      onClick={() => cambiarCantidad(i, l.cantidad + 1)} aria-label={`Sumar uno de ${a.nombre}`}>
                      <Plus size={16} strokeWidth={1.5} aria-hidden="true" />
                    </button>

                    <label className="sr-only" htmlFor={`d-${i}`}>Descuento de {a.nombre}</label>
                    <select id={`d-${i}`} className="campo" value={l.descuento}
                      onChange={(e) => cambiarDescuento(i, Number(e.target.value))}>
                      {[0, 5, 10, 15, 20].map((d) => <option key={d} value={d}>{d}% desc.</option>)}
                    </select>

                    <button type="button" className="boton boton-sutil ml-auto"
                      onClick={() => cambiarCantidad(i, 0)} aria-label={`Quitar ${a.nombre}`}>
                      <Trash2 size={16} strokeWidth={1.5} aria-hidden="true" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>

          <Panel titulo="Resumen">
            <dl className="grid gap-2">
              <div className="flex justify-between gap-2">
                <dt className="text-cuerpo text-tinta-suave">Neto</dt>
                <dd className="cifra">{pesosARS(t.neto)}</dd>
              </div>
              {t.descuentos > 0 && (
                <div className="flex justify-between gap-2">
                  <dt className="text-cuerpo text-tinta-suave">Descuentos</dt>
                  <dd className="cifra" style={{ color: 'var(--sano)' }}>−{pesosARS(t.descuentos)}</dd>
                </div>
              )}
              <div className="flex justify-between gap-2">
                <dt className="text-cuerpo text-tinta-suave">IVA</dt>
                <dd className="cifra">{pesosARS(t.iva)}</dd>
              </div>
              <div className="flex justify-between gap-2" style={{ borderTop: '1px solid var(--pauta)', paddingTop: 8 }}>
                <dt className="text-subtitulo font-semibold">Total</dt>
                <dd className="font-display cifra" style={{ fontSize: 24 }}>{pesosARS(t.total)}</dd>
              </div>
            </dl>
            <p className="text-micro text-tinta-suave mt-2">
              <span className="cifra">{num(t.unidades)}</span> unidades sueltas equivalentes
            </p>
          </Panel>

          {/* Validador de crédito: bloquea el envío si no alcanza */}
          {credito && (
            <section
              className="panel p-4"
              style={{
                borderLeft: `3px solid ${credito.alcanza ? 'var(--sano)' : 'var(--critico)'}`,
              }}
              aria-live="polite"
            >
              <h2 className="encabezado-columna">Control de crédito</h2>
              <dl className="grid grid-cols-2 gap-3 mt-1">
                <div>
                  <dt className="text-micro text-tinta-suave">Disponible</dt>
                  <dd className="cifra text-cuerpo">{pesosARS(credito.disponible)}</dd>
                </div>
                <div>
                  <dt className="text-micro text-tinta-suave">Este pedido</dt>
                  <dd className="cifra text-cuerpo">{pesosARS(t.total)}</dd>
                </div>
              </dl>

              {credito.motivo && (
                <p
                  className="mt-3 rounded-sm p-2 text-cuerpo flex items-start gap-2"
                  style={{ background: 'var(--critico-fondo)', color: 'var(--critico)' }}
                >
                  <TriangleAlert size={16} strokeWidth={1.5} aria-hidden="true" className="shrink-0 mt-0.5" />
                  {credito.motivo}
                </p>
              )}
            </section>
          )}

          <div className="grid gap-2 tablet:grid-cols-2">
            <button type="button" className="boton boton-secundario" style={{ minHeight: 48 }} onClick={irACatalogo}>
              Seguir agregando
            </button>
            <button type="button" className="boton boton-primario" style={{ minHeight: 48 }} onClick={irAlCierre}>
              {credito && !credito.alcanza ? (
                <>
                  <Lock size={18} strokeWidth={1.5} aria-hidden="true" />
                  Cerrar para autorización
                </>
              ) : (
                <>
                  Cerrar visita
                  <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
