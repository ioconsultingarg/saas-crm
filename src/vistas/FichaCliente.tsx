import { ArrowLeft, MessageCircle, Phone } from 'lucide-react'
import type { ClienteAnalizado } from '../tipos'
import { GraficoCompras } from '../componentes/GraficoCompras'
import { EtiquetaAlerta, EtiquetaSegmento } from '../componentes/EtiquetaEstado'
import { FECHA_SALDOS } from '../data/seed'
import { cuitFormateado, dias as diasTexto, fecha, num, pesosARS, telefonoWhatsapp } from '../lib/formato'

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <dt className="encabezado-columna">{etiqueta}</dt>
      <dd className="text-cuerpo cifra">{valor}</dd>
    </div>
  )
}

export function FichaCliente({ c, volver }: { c: ClienteAnalizado; volver: () => void }) {
  return (
    <article className="grid gap-4">
      <button type="button" className="boton boton-sutil justify-self-start no-imprimir" onClick={volver}>
        <ArrowLeft size={18} strokeWidth={1.5} aria-hidden="true" />
        Volver
      </button>

      <header className="grid gap-2">
        <h1 className="font-display text-titulo">{c.razonSocial}</h1>
        <p className="text-tinta-suave text-cuerpo">
          {c.canal} · {c.zona} · atiende {c.vendedor} · CUIT{' '}
          <span className="font-mono text-dato">{cuitFormateado(c.cuit)}</span>
        </p>
        <div className="flex flex-wrap gap-2">
          <EtiquetaSegmento segmento={c.a.segmento} />
          {c.a.alerta && <EtiquetaAlerta alerta={c.a.alerta} />}
          {c.a.montoEnRiesgo > 0 && (
            <span className="text-cuerpo cifra font-semibold">
              {pesosARS(c.a.montoEnRiesgo)} en riesgo
            </span>
          )}
        </div>
      </header>

      <GraficoCompras cliente={c} />

      <div className="grid gap-4 escritorio:grid-cols-2">
        <section className="panel p-4">
          <h2 className="text-subtitulo font-semibold mb-3">Ritmo de compra</h2>
          <dl className="grid grid-cols-2 gap-3">
            <Dato
              etiqueta="Cadencia"
              valor={c.cadencia ? `cada ${c.cadencia} días` : 'sin patrón suficiente'}
            />
            <Dato etiqueta="Desvío" valor={c.cadencia ? `± ${c.desvio} días` : '—'} />
            <Dato etiqueta="Sin comprar" valor={diasTexto(c.a.diasSinComprar)} />
            <Dato etiqueta="Compras" valor={num(c.compras)} />
            <Dato etiqueta="Primera compra" valor={fecha(c.primeraCompra)} />
            <Dato etiqueta="Última compra" valor={fecha(c.ultimaCompra)} />
            <Dato etiqueta="Facturación mensual" valor={pesosARS(c.factMensual)} />
          </dl>
        </section>

        <section className="panel p-4">
          <h2 className="text-subtitulo font-semibold mb-3">Qué compra</h2>
          <table className="w-full text-dato">
            <thead>
              <tr>
                <th className="encabezado-columna text-left py-1">Artículo</th>
                <th className="encabezado-columna text-right py-1">Cada</th>
                <th className="encabezado-columna text-right py-1">Hace</th>
              </tr>
            </thead>
            <tbody>
              {c.productos.map((p) => (
                <tr key={p.nombre} style={{ borderTop: '1px solid var(--pauta)' }}>
                  <td className="py-1 pr-2">{p.nombre}</td>
                  <td className="py-1 text-right cifra">{p.cadaCuantosDias} d</td>
                  <td
                    className="py-1 text-right cifra"
                    style={{
                      color:
                        p.diasDesdeUltima > p.cadaCuantosDias * 1.5 ? 'var(--critico)' : undefined,
                    }}
                  >
                    {p.diasDesdeUltima} d
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {c.dejoDeLlevar.length > 0 && (
            <div className="mt-3">
              <p className="encabezado-columna">Dejó de llevar</p>
              <ul className="text-cuerpo">
                {c.dejoDeLlevar.map((p) => (
                  <li key={p} style={{ color: 'var(--critico)' }}>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="panel p-4">
          <h2 className="text-subtitulo font-semibold mb-3">Cuenta corriente</h2>
          <dl className="grid grid-cols-2 gap-3">
            <Dato etiqueta="Saldo" valor={pesosARS(c.saldo)} />
            <Dato etiqueta="Vencido" valor={pesosARS(c.saldoVencido)} />
          </dl>
          <p className="text-micro text-tinta-suave mt-2">
            Dato al {fecha(FECHA_SALDOS)}. La cuenta corriente se administra en el sistema de
            gestión; acá sólo se muestra.
          </p>
        </section>

        <section className="panel p-4">
          <h2 className="text-subtitulo font-semibold mb-3">Contactos y gestiones</h2>
          <ul className="grid gap-2">
            {c.contactos.map((ct) => (
              <li key={ct.telefono} className="flex flex-wrap items-center gap-2">
                <span className="text-cuerpo">
                  {ct.nombre} <span className="text-tinta-suave">· {ct.rol}</span>
                </span>
                <a className="boton boton-secundario" href={`tel:${ct.telefono}`}>
                  <Phone size={16} strokeWidth={1.5} aria-hidden="true" />
                  <span className="cifra">{ct.telefono}</span>
                </a>
                {ct.whatsapp && (
                  <a
                    className="boton boton-secundario"
                    href={telefonoWhatsapp(ct.telefono)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle size={16} strokeWidth={1.5} aria-hidden="true" />
                    WhatsApp
                  </a>
                )}
              </li>
            ))}
          </ul>

          <div className="mt-3">
            <p className="encabezado-columna">Historial</p>
            {c.gestiones.length === 0 ? (
              <p className="text-cuerpo text-tinta-suave">Sin gestiones registradas.</p>
            ) : (
              <ul className="text-cuerpo">
                {c.gestiones.map((g) => (
                  <li key={g.fecha}>
                    {fecha(g.fecha)} · {g.canal} · {g.resultado}
                    {g.nota ? ` — ${g.nota}` : ''}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </article>
  )
}
