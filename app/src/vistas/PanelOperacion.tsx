import { useMemo } from 'react'
import { ClipboardCheck, MapPin, Package, TriangleAlert } from 'lucide-react'
import type { Visita } from '../tipos-calle'
import { ETIQUETA_ESTADO_PEDIDO } from '../tipos-calle'
import { LOTES_POR_VENCER, PEDIDOS, totalPedido } from '../data/calle'
import { EMPRESAS, VENDEDORES_ACTIVOS, empresaDe, usuarioDe } from '../data/crm'
import { resumenRuta } from '../lib/calle'
import { Barra, Kpi, Panel } from '../componentes/Piezas'
import { num, pct, pesosARS } from '../lib/formato'

/** Densidad por zona: cuántos clientes y cuánto facturan. Nunca personas. */
function densidadPorZona() {
  const zonas = new Map<string, { clientes: number; facturado: number }>()
  for (const e of EMPRESAS) {
    const prev = zonas.get(e.zona) ?? { clientes: 0, facturado: 0 }
    const suyos = PEDIDOS.filter((p) => p.empresaId === e.id)
    zonas.set(e.zona, {
      clientes: prev.clientes + 1,
      facturado: prev.facturado + suyos.reduce((a, p) => a + totalPedido(p), 0),
    })
  }
  return [...zonas.entries()]
    .map(([zona, v]) => ({ zona, ...v }))
    .sort((a, b) => b.facturado - a.facturado)
}

export function PanelOperacion({ visitas, irAAprobaciones, irAStock }: {
  visitas: Visita[]
  irAAprobaciones: () => void
  irAStock: () => void
}) {
  const r = resumenRuta(visitas)
  const zonas = useMemo(densidadPorZona, [])
  const maxZona = Math.max(...zonas.map((z) => z.facturado), 1)

  const delDia = PEDIDOS.filter((p) => p.estado !== 'rechazado')
  const facturado = delDia.reduce((a, p) => a + totalPedido(p), 0)
  const retenidos = PEDIDOS.filter((p) => p.estado === 'retenido')
  const sinSincronizar = PEDIDOS.filter((p) => p.estado === 'pendiente de sincronizar')

  return (
    <div className="grid gap-4">
      <header>
        <h1 className="font-display text-titulo">Panel del día</h1>
        <p className="text-tinta-suave text-cuerpo">Operación de calle y depósito en tiempo real.</p>
      </header>

      <div className="grid gap-3 grid-cols-2 escritorio:grid-cols-4">
        <Kpi etiqueta="Facturado hoy" valor={pesosARS(facturado)} nota={`${num(delDia.length)} pedidos`} destacado />
        <Kpi etiqueta="Cumplimiento de rutas" valor={pct(r.cumplimiento)} nota={`${num(r.pendientes)} visitas pendientes`} />
        <Kpi etiqueta="Pedidos retenidos" valor={num(retenidos.length)} nota="esperando autorización" />
        <Kpi etiqueta="Sin sincronizar" valor={num(sinSincronizar.length)} nota="guardados en teléfonos" />
      </div>

      <div className="grid gap-4 escritorio:grid-cols-3">
        <Panel
          titulo="Facturación y clientes por zona"
          className="escritorio:col-span-2"
        >
          <ul className="grid gap-3">
            {zonas.map((z) => (
              <li key={z.zona} className="grid gap-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-cuerpo font-semibold flex items-center gap-2">
                    <MapPin size={14} strokeWidth={1.5} aria-hidden="true" className="text-tinta-suave" />
                    {z.zona}
                  </span>
                  <span className="text-micro text-tinta-suave">
                    <span className="cifra">{num(z.clientes)}</span> clientes
                  </span>
                </div>
                <Barra valor={z.facturado} maximo={maxZona} color="var(--marca)" etiqueta={pesosARS(z.facturado)} />
              </li>
            ))}
          </ul>
          <p className="text-micro text-tinta-suave mt-3">
            El mapa muestra dónde están los clientes y cuánto facturan. No muestra dónde están los
            vendedores: el producto no registra su posición.
          </p>
        </Panel>

        <div className="grid gap-4 content-start">
          <Panel
            titulo="Esperando autorización"
            accion={<button type="button" className="boton boton-sutil" onClick={irAAprobaciones}>Ver bandeja</button>}
          >
            {retenidos.length === 0 ? (
              <p className="text-cuerpo text-tinta-suave">Nada retenido.</p>
            ) : (
              <ul className="grid gap-2">
                {retenidos.slice(0, 4).map((p) => (
                  <li key={p.id} className="flex items-start gap-2">
                    <ClipboardCheck size={16} strokeWidth={1.5} aria-hidden="true" className="shrink-0 mt-1" style={{ color: 'var(--riesgo)' }} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-cuerpo truncate">{empresaDe(p.empresaId)?.razonSocial}</span>
                      <span className="block text-micro text-tinta-suave truncate">{p.motivoRetencion}</span>
                    </span>
                    <span className="cifra text-micro shrink-0">{pesosARS(Math.round(totalPedido(p)))}</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel
            titulo="Lotes por vencer"
            accion={<button type="button" className="boton boton-sutil" onClick={irAStock}>Ver stock</button>}
          >
            {LOTES_POR_VENCER.length === 0 ? (
              <p className="text-cuerpo text-tinta-suave">Ningún lote vence este mes.</p>
            ) : (
              <ul className="grid gap-2">
                {LOTES_POR_VENCER.slice(0, 5).map(({ articulo, lote }) => (
                  <li key={lote.codigo} className="flex items-start gap-2">
                    <TriangleAlert size={16} strokeWidth={1.5} aria-hidden="true" className="shrink-0 mt-1" style={{ color: 'var(--critico)' }} />
                    <span className="min-w-0 flex-1">
                      <span className="block text-cuerpo truncate">{articulo.nombre}</span>
                      <span className="block text-micro text-tinta-suave font-mono">{lote.codigo}</span>
                    </span>
                    <span className="cifra text-micro shrink-0">{num(lote.cantidad)} u.</span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <Panel titulo="Pedidos de hoy">
        <div className="overflow-x-auto">
          <table className="w-full text-dato" style={{ minWidth: 640 }}>
            <caption className="sr-only">Pedidos ingresados</caption>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--pauta)' }}>
                <th scope="col" className="text-left p-2 encabezado-columna">Nº</th>
                <th scope="col" className="text-left p-2 encabezado-columna">Comercio</th>
                <th scope="col" className="text-left p-2 encabezado-columna">Vendedor</th>
                <th scope="col" className="text-left p-2 encabezado-columna">Estado</th>
                <th scope="col" className="text-right p-2 encabezado-columna">Total</th>
              </tr>
            </thead>
            <tbody>
              {PEDIDOS.slice(0, 12).map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--pauta)' }}>
                  <td className="p-2 font-mono">{p.numero}</td>
                  <td className="p-2 truncate">{empresaDe(p.empresaId)?.razonSocial}</td>
                  <td className="p-2 text-tinta-suave">{usuarioDe(p.vendedor)?.nombre}</td>
                  <td className="p-2">
                    <span
                      className="text-micro font-semibold rounded-sm px-1.5 py-0.5"
                      style={{
                        color: p.estado === 'retenido' ? 'var(--riesgo)' : p.estado === 'facturado' ? 'var(--sano)' : 'var(--tinta-suave)',
                        background: p.estado === 'retenido' ? 'var(--riesgo-fondo)' : p.estado === 'facturado' ? 'var(--sano-fondo)' : 'var(--papel)',
                      }}
                    >
                      {ETIQUETA_ESTADO_PEDIDO[p.estado]}
                    </span>
                  </td>
                  <td className="p-2 text-right cifra">{pesosARS(Math.round(totalPedido(p)))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel titulo="Equipo en calle">
        <ul className="grid gap-2 tablet:grid-cols-2 escritorio:grid-cols-3">
          {VENDEDORES_ACTIVOS.map((v) => {
            const suyos = PEDIDOS.filter((p) => p.vendedor === v.id)
            return (
              <li key={v.id} className="rounded p-3" style={{ border: '1px solid var(--pauta)' }}>
                <p className="text-cuerpo font-semibold">{v.nombre}</p>
                <p className="text-micro text-tinta-suave">{v.zona}</p>
                <p className="text-micro text-tinta-suave mt-1 flex items-center gap-1">
                  <Package size={13} strokeWidth={1.5} aria-hidden="true" />
                  <span className="cifra">{num(suyos.length)}</span> pedidos ·{' '}
                  <span className="cifra">{pesosARS(Math.round(suyos.reduce((a, p) => a + totalPedido(p), 0)))}</span>
                </p>
              </li>
            )
          })}
        </ul>
      </Panel>
    </div>
  )
}
