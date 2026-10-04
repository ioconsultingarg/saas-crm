import { useState } from 'react'
import { Check, ClipboardCheck, TriangleAlert, X } from 'lucide-react'
import type { EstadoPedido } from '../tipos-calle'
import { ETIQUETA_UNIDAD } from '../tipos-calle'
import { PEDIDOS, articuloDe, cuentaDe, totalPedido } from '../data/calle'
import { empresaDe, usuarioDe } from '../data/crm'
import { Panel } from '../componentes/Piezas'
import { fecha, num, pesosARS } from '../lib/formato'

type Decision = Record<string, EstadoPedido>

export function Aprobaciones() {
  const [decisiones, setDecisiones] = useState<Decision>({})
  const [abierto, setAbierto] = useState<string | null>(null)

  const retenidos = PEDIDOS.filter((p) => p.estado === 'retenido')
  const pendientes = retenidos.filter((p) => !decisiones[p.id])
  const resueltos = retenidos.filter((p) => decisiones[p.id])

  const decidir = (id: string, estado: EstadoPedido) =>
    setDecisiones((d) => ({ ...d, [id]: estado }))

  return (
    <div className="grid gap-4">
      <header>
        <h1 className="font-display text-titulo">Aprobación de pedidos</h1>
        <p className="text-tinta-suave text-cuerpo">
          Pedidos retenidos en la calle por crédito o descuento.{' '}
          <span className="cifra">{num(pendientes.length)}</span> esperando decisión.
        </p>
      </header>

      {pendientes.length === 0 ? (
        <div className="panel p-6 text-center grid gap-2 justify-items-center">
          <ClipboardCheck size={32} strokeWidth={1.5} aria-hidden="true" style={{ color: 'var(--sano)' }} />
          <h2 className="font-display text-titulo">Bandeja vacía</h2>
          <p className="text-cuerpo text-tinta-suave">No hay pedidos esperando autorización.</p>
        </div>
      ) : (
        <ul className="grid gap-3">
          {pendientes.map((p) => {
            const emp = empresaDe(p.empresaId)
            const cuenta = cuentaDe(p.empresaId)
            const total = Math.round(totalPedido(p))
            const disponible = cuenta ? cuenta.limiteCredito - cuenta.saldo : 0
            const expandido = abierto === p.id
            return (
              <li key={p.id} className="panel p-4 grid gap-3" style={{ borderLeft: '3px solid var(--riesgo)' }}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-subtitulo font-semibold">{emp?.razonSocial}</h2>
                    <p className="text-micro text-tinta-suave">
                      <span className="font-mono">{p.numero}</span> · {fecha(p.fecha)} ·{' '}
                      {usuarioDe(p.vendedor)?.nombre}
                    </p>
                  </div>
                  <p className="font-display cifra" style={{ fontSize: 24 }}>{pesosARS(total)}</p>
                </div>

                <p
                  className="rounded-sm p-2 text-cuerpo flex items-start gap-2"
                  style={{ background: 'var(--riesgo-fondo)', color: 'var(--riesgo)' }}
                >
                  <TriangleAlert size={16} strokeWidth={1.5} aria-hidden="true" className="shrink-0 mt-0.5" />
                  {p.motivoRetencion}
                </p>

                {cuenta && (
                  <dl className="grid grid-cols-2 tablet:grid-cols-4 gap-3">
                    <div><dt className="encabezado-columna">Límite</dt><dd className="cifra text-cuerpo">{pesosARS(cuenta.limiteCredito)}</dd></div>
                    <div><dt className="encabezado-columna">Saldo</dt><dd className="cifra text-cuerpo">{pesosARS(cuenta.saldo)}</dd></div>
                    <div>
                      <dt className="encabezado-columna">Disponible</dt>
                      <dd className="cifra text-cuerpo" style={{ color: disponible < total ? 'var(--critico)' : undefined }}>
                        {pesosARS(Math.max(0, disponible))}
                      </dd>
                    </div>
                    <div>
                      <dt className="encabezado-columna">Vencido</dt>
                      <dd className="cifra text-cuerpo" style={{ color: cuenta.vencido > 0 ? 'var(--critico)' : undefined }}>
                        {pesosARS(cuenta.vencido)}
                      </dd>
                    </div>
                  </dl>
                )}

                <button
                  type="button"
                  className="boton boton-sutil justify-self-start"
                  aria-expanded={expandido}
                  onClick={() => setAbierto(expandido ? null : p.id)}
                >
                  {expandido ? 'Ocultar' : 'Ver'} el detalle ({num(p.lineas.length)} artículos)
                </button>

                {expandido && (
                  <table className="w-full text-dato">
                    <caption className="sr-only">Detalle del pedido {p.numero}</caption>
                    <thead>
                      <tr>
                        <th scope="col" className="encabezado-columna text-left pb-1">Artículo</th>
                        <th scope="col" className="encabezado-columna text-left pb-1">Unidad</th>
                        <th scope="col" className="encabezado-columna text-right pb-1">Cant.</th>
                        <th scope="col" className="encabezado-columna text-right pb-1">Desc.</th>
                        <th scope="col" className="encabezado-columna text-right pb-1">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.lineas.map((l, i) => {
                        const a = articuloDe(l.articuloId)
                        const sub = l.precioUnitario * l.cantidad * (1 - l.descuento / 100)
                        return (
                          <tr key={i} style={{ borderTop: '1px solid var(--pauta)' }}>
                            <td className="py-1 pr-2">{a?.nombre}</td>
                            <td className="py-1 text-tinta-suave">{ETIQUETA_UNIDAD[l.unidad]}</td>
                            <td className="py-1 text-right cifra">{num(l.cantidad)}</td>
                            <td className="py-1 text-right cifra" style={{ color: l.descuento > 0 ? 'var(--riesgo)' : undefined }}>
                              {l.descuento > 0 ? `${l.descuento}%` : '—'}
                            </td>
                            <td className="py-1 text-right cifra">{pesosARS(Math.round(sub))}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                )}

                <div className="grid gap-2 tablet:grid-cols-2">
                  <button type="button" className="boton boton-primario" style={{ minHeight: 48 }} onClick={() => decidir(p.id, 'aprobado')}>
                    <Check size={18} strokeWidth={1.5} aria-hidden="true" />
                    Aprobar
                  </button>
                  <button type="button" className="boton boton-destructivo" style={{ minHeight: 48 }} onClick={() => decidir(p.id, 'rechazado')}>
                    <X size={18} strokeWidth={1.5} aria-hidden="true" />
                    Rechazar
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {resueltos.length > 0 && (
        <Panel titulo={`Resueltos en esta sesión (${num(resueltos.length)})`}>
          <ul className="grid gap-2">
            {resueltos.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2" style={{ borderTop: '1px solid var(--pauta)', paddingTop: 8 }}>
                <span className="min-w-0">
                  <span className="block text-cuerpo truncate">{empresaDe(p.empresaId)?.razonSocial}</span>
                  <span className="block text-micro text-tinta-suave font-mono">{p.numero}</span>
                </span>
                <span
                  className="text-micro font-semibold rounded-sm px-2 py-0.5"
                  style={{
                    color: decisiones[p.id] === 'aprobado' ? 'var(--sano)' : 'var(--critico)',
                    background: decisiones[p.id] === 'aprobado' ? 'var(--sano-fondo)' : 'var(--critico-fondo)',
                  }}
                >
                  {decisiones[p.id] === 'aprobado' ? 'Aprobado' : 'Rechazado'}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-micro text-tinta-suave mt-3">
            En la demo las decisiones viven sólo en esta sesión.
          </p>
        </Panel>
      )}
    </div>
  )
}
