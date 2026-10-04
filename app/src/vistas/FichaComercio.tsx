import { ArrowLeft, MessageCircle, Phone, ShoppingCart, TriangleAlert } from 'lucide-react'
import { CONTACTOS, empresaDe } from '../data/crm'
import { cuentaDe } from '../data/calle'
import { CLIENTES } from '../data'
import { analizar } from '../lib/calculos'
import { sugeridosPara } from '../lib/calle'
import { Panel } from '../componentes/Piezas'
import { cuitFormateado, dias as diasTexto, num, pesosARS, telefonoWhatsapp } from '../lib/formato'

interface Props {
  empresaId: string
  visitaId?: string
  volver: () => void
  irACatalogo: () => void
  abrirCarrito: (empresaId: string, visitaId?: string) => void
}

export function FichaComercio({ empresaId, visitaId, volver, irACatalogo, abrirCarrito }: Props) {
  const emp = empresaDe(empresaId)
  const cuenta = cuentaDe(empresaId)
  const contactos = CONTACTOS.filter((c) => c.empresaId === empresaId)
  const sugeridos = sugeridosPara(empresaId)

  // Si este comercio además es cliente de recompra, se muestra su ritmo.
  const cliente = CLIENTES[Math.abs(empresaId.length * 7 + empresaId.charCodeAt(2)) % CLIENTES.length]
  const a = analizar(cliente)

  if (!emp) return <p className="text-cuerpo">No encontré ese comercio.</p>

  const disponible = cuenta ? Math.max(0, cuenta.limiteCredito - cuenta.saldo) : 0
  const tono =
    cuenta?.semaforo === 'rojo' ? { c: 'var(--critico)', f: 'var(--critico-fondo)' }
    : cuenta?.semaforo === 'amarillo' ? { c: 'var(--riesgo)', f: 'var(--riesgo-fondo)' }
    : { c: 'var(--sano)', f: 'var(--sano-fondo)' }

  return (
    <div className="grid gap-4">
      <button type="button" className="boton boton-sutil justify-self-start" onClick={volver}>
        <ArrowLeft size={18} strokeWidth={1.5} aria-hidden="true" />
        Volver a la ruta
      </button>

      <header className="grid gap-1">
        <h1 className="font-display text-titulo">{emp.razonSocial}</h1>
        <p className="text-cuerpo text-tinta-suave">
          {emp.canal} · {emp.localidad}, {emp.zona}
        </p>
        <p className="text-micro text-tinta-suave font-mono">{cuitFormateado(emp.cuit)}</p>
      </header>

      {/* Semáforo de cuenta corriente: lo que define si se puede vender */}
      {cuenta && (
        <section className="panel p-4" style={{ borderLeft: `3px solid ${tono.c}` }}>
          <h2 className="encabezado-columna">Cuenta corriente</h2>
          <p className="font-display cifra" style={{ fontSize: 28, lineHeight: '32px', color: tono.c }}>
            {pesosARS(disponible)}
          </p>
          <p className="text-micro text-tinta-suave">disponible para vender hoy</p>

          <dl className="grid grid-cols-2 gap-3 mt-3">
            <div>
              <dt className="encabezado-columna">Límite</dt>
              <dd className="cifra text-cuerpo">{pesosARS(cuenta.limiteCredito)}</dd>
            </div>
            <div>
              <dt className="encabezado-columna">Saldo</dt>
              <dd className="cifra text-cuerpo">{pesosARS(cuenta.saldo)}</dd>
            </div>
            <div>
              <dt className="encabezado-columna">Vencido</dt>
              <dd className="cifra text-cuerpo" style={{ color: cuenta.vencido > 0 ? 'var(--critico)' : undefined }}>
                {pesosARS(cuenta.vencido)}
              </dd>
            </div>
            <div>
              <dt className="encabezado-columna">Condición</dt>
              <dd className="text-cuerpo">{cuenta.diasPlazo === 0 ? 'Contado' : `${cuenta.diasPlazo} días`}</dd>
            </div>
          </dl>

          <p className="text-micro text-tinta-suave mt-2">Lista de precios: {cuenta.listaPrecios}</p>

          {cuenta.vencido > 0 && (
            <p
              className="mt-3 rounded-sm p-2 text-cuerpo flex items-start gap-2"
              style={{ background: 'var(--critico-fondo)', color: 'var(--critico)' }}
            >
              <TriangleAlert size={16} strokeWidth={1.5} aria-hidden="true" className="shrink-0 mt-0.5" />
              Tiene facturas vencidas. Se puede tomar el pedido, pero queda retenido hasta que
              administración lo autorice.
            </p>
          )}
        </section>
      )}

      <Panel titulo="Cómo viene comprando">
        <dl className="grid grid-cols-2 gap-3">
          <div>
            <dt className="encabezado-columna">Cadencia</dt>
            <dd className="text-cuerpo cifra">{cliente.cadencia ? `cada ${cliente.cadencia} días` : 'sin patrón'}</dd>
          </div>
          <div>
            <dt className="encabezado-columna">Última compra</dt>
            <dd className="text-cuerpo cifra">hace {diasTexto(a.diasSinComprar)}</dd>
          </div>
          <div>
            <dt className="encabezado-columna">Compras</dt>
            <dd className="text-cuerpo cifra">{num(cliente.compras)}</dd>
          </div>
          <div>
            <dt className="encabezado-columna">Promedio mensual</dt>
            <dd className="text-cuerpo cifra">{pesosARS(cliente.factMensual)}</dd>
          </div>
        </dl>
        <div className="mt-3">
          <p className="encabezado-columna">Lo que suele llevar</p>
          <ul className="text-cuerpo">
            {cliente.productos.map((p) => (
              <li key={p.nombre} className="flex justify-between gap-2">
                <span className="truncate">{p.nombre}</span>
                <span className="cifra text-tinta-suave shrink-0">cada {p.cadaCuantosDias} d</span>
              </li>
            ))}
          </ul>
        </div>
      </Panel>

      {sugeridos.length > 0 && (
        <Panel titulo="Sugerido para este cliente">
          <ul className="grid gap-2">
            {sugeridos.map((s) => (
              <li key={s.articulo.id} className="flex items-start justify-between gap-2" style={{ borderTop: '1px solid var(--pauta)', paddingTop: 8 }}>
                <span className="min-w-0">
                  <span className="block text-cuerpo truncate">{s.articulo.nombre}</span>
                  <span className="block text-micro text-tinta-suave">{s.razon}</span>
                </span>
                <span className="cifra text-micro text-tinta-suave shrink-0">
                  {s.cantidad} {s.unidad}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-micro text-tinta-suave mt-3">
            Es aritmética sobre el historial de compra, no una predicción.
          </p>
        </Panel>
      )}

      <Panel titulo="Contactos">
        <ul className="grid gap-3">
          {contactos.map((c) => (
            <li key={c.id} className="grid gap-1">
              <span className="text-cuerpo font-semibold">{c.nombre}</span>
              <span className="text-micro text-tinta-suave">{c.cargo}</span>
              <span className="flex flex-wrap gap-2">
                <a className="boton boton-secundario" style={{ minHeight: 44 }} href={`tel:${c.telefono}`}>
                  <Phone size={16} strokeWidth={1.5} aria-hidden="true" />
                  <span className="cifra">{c.telefono}</span>
                </a>
                {c.whatsapp && (
                  <a className="boton boton-secundario" style={{ minHeight: 44 }} href={telefonoWhatsapp(c.telefono)} target="_blank" rel="noreferrer">
                    <MessageCircle size={16} strokeWidth={1.5} aria-hidden="true" />
                    WhatsApp
                  </a>
                )}
              </span>
            </li>
          ))}
        </ul>
      </Panel>

      <button
        type="button"
        className="boton boton-primario"
        style={{ minHeight: 52 }}
        onClick={() => { abrirCarrito(empresaId, visitaId); irACatalogo() }}
      >
        <ShoppingCart size={20} strokeWidth={1.5} aria-hidden="true" />
        Tomar pedido
      </button>
    </div>
  )
}
