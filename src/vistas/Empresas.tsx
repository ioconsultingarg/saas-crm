import { useMemo, useState } from 'react'
import { Mail, MessageCircle, Phone, Search, X } from 'lucide-react'
import type { Oportunidad, TipoActividad } from '../tipos-crm'
import { ACTIVIDADES, CONTACTOS, EMPRESAS, VENDEDORES_ACTIVOS, usuarioDe } from '../data/crm'
import { Avatar, EtiquetaEtapa } from '../componentes/Piezas'
import { cuitFormateado, fecha, num, pesosARS, telefonoWhatsapp } from '../lib/formato'

const POR_PAGINA = 25

const ICONO: Record<TipoActividad, typeof Phone> = {
  llamada: Phone,
  email: Mail,
  'reunión': Phone,
  whatsapp: MessageCircle,
  nota: Mail,
}

interface Props {
  oportunidades: Oportunidad[]
  empresaAbierta?: string
  abrirEmpresa: (id: string) => void
  cerrarEmpresa: () => void
}

export function Empresas({ oportunidades, empresaAbierta, abrirEmpresa, cerrarEmpresa }: Props) {
  const [q, setQ] = useState('')
  const [zona, setZona] = useState('')
  const [propietario, setPropietario] = useState('')
  const [pagina, setPagina] = useState(0)

  const zonas = useMemo(() => [...new Set(EMPRESAS.map((e) => e.zona))].sort(), [])

  const filtradas = useMemo(() => {
    const t = q.trim().toLowerCase()
    return EMPRESAS.filter(
      (e) =>
        (!t ||
          e.razonSocial.toLowerCase().includes(t) ||
          e.cuit.includes(t.replace(/\D/g, '')) ||
          CONTACTOS.some((c) => c.empresaId === e.id && c.nombre.toLowerCase().includes(t))) &&
        (!zona || e.zona === zona) &&
        (!propietario || e.propietario === propietario),
    )
  }, [q, zona, propietario])

  const paginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA))
  const pag = Math.min(pagina, paginas - 1)
  const visibles = filtradas.slice(pag * POR_PAGINA, (pag + 1) * POR_PAGINA)

  const abierta = empresaAbierta ? EMPRESAS.find((e) => e.id === empresaAbierta) : undefined

  if (abierta) {
    const contactos = CONTACTOS.filter((c) => c.empresaId === abierta.id)
    const ops = oportunidades.filter((o) => o.empresaId === abierta.id)
    const actividades = ACTIVIDADES.filter((a) => a.empresaId === abierta.id).slice(0, 20)
    const u = usuarioDe(abierta.propietario)

    return (
      <article className="grid gap-4">
        <button type="button" className="boton boton-sutil justify-self-start" onClick={cerrarEmpresa}>
          <X size={18} strokeWidth={1.5} aria-hidden="true" />
          Cerrar ficha
        </button>

        <header className="grid gap-2">
          <h1 className="font-display text-titulo">{abierta.razonSocial}</h1>
          <p className="text-cuerpo text-tinta-suave">
            {abierta.canal} · {abierta.rubro} · {abierta.localidad}, {abierta.zona} ·{' '}
            <span className="font-mono text-dato">{cuitFormateado(abierta.cuit)}</span>
          </p>
          <p className="flex items-center gap-2 text-micro text-tinta-suave">
            <Avatar iniciales={u?.iniciales ?? '··'} /> atiende {u?.nombre} · {num(abierta.empleados)} empleados
          </p>
        </header>

        <div className="grid gap-4 escritorio:grid-cols-2">
          <section className="panel p-4">
            <h2 className="text-subtitulo font-semibold mb-3">Contactos</h2>
            <ul className="grid gap-3">
              {contactos.map((c) => (
                <li key={c.id} className="grid gap-1">
                  <span className="text-cuerpo font-semibold">
                    {c.nombre}
                    {c.principal && <span className="text-micro text-tinta-suave font-normal"> · principal</span>}
                  </span>
                  <span className="text-micro text-tinta-suave">{c.cargo}</span>
                  <span className="flex flex-wrap gap-2">
                    <a className="boton boton-secundario" href={`tel:${c.telefono}`}>
                      <Phone size={16} strokeWidth={1.5} aria-hidden="true" />
                      <span className="cifra">{c.telefono}</span>
                    </a>
                    {c.whatsapp && (
                      <a className="boton boton-secundario" href={telefonoWhatsapp(c.telefono)} target="_blank" rel="noreferrer">
                        <MessageCircle size={16} strokeWidth={1.5} aria-hidden="true" />
                        WhatsApp
                      </a>
                    )}
                    <a className="boton boton-secundario" href={`mailto:${c.email}`}>
                      <Mail size={16} strokeWidth={1.5} aria-hidden="true" />
                      Mail
                    </a>
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel p-4">
            <h2 className="text-subtitulo font-semibold mb-3">Oportunidades</h2>
            {ops.length === 0 ? (
              <p className="text-cuerpo text-tinta-suave">Sin oportunidades registradas.</p>
            ) : (
              <ul className="grid gap-2">
                {ops.map((o) => (
                  <li key={o.id} className="flex flex-wrap items-center justify-between gap-2" style={{ borderTop: '1px solid var(--pauta)', paddingTop: 8 }}>
                    <span className="min-w-0">
                      <span className="block text-cuerpo truncate">{o.titulo}</span>
                      <EtiquetaEtapa etapa={o.etapa} compacta />
                    </span>
                    <span className="cifra font-semibold">{pesosARS(o.valor)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section className="panel p-4">
          <h2 className="text-subtitulo font-semibold mb-3">Historial de comunicación</h2>
          <ul className="grid gap-3">
            {actividades.map((a) => {
              const Ico = ICONO[a.tipo]
              return (
                <li key={a.id} className="flex items-start gap-2" style={{ borderTop: '1px solid var(--pauta)', paddingTop: 8 }}>
                  <Ico size={16} strokeWidth={1.5} aria-hidden="true" className="shrink-0 mt-1 text-tinta-suave" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-cuerpo">{a.resumen}</span>
                    <span className="block text-micro text-tinta-suave capitalize">
                      {a.tipo} · {fecha(a.fecha)} · {usuarioDe(a.usuario)?.nombre}
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      </article>
    )
  }

  return (
    <div className="grid gap-4">
      <header>
        <h1 className="font-display text-titulo">Empresas y contactos</h1>
        <p className="text-tinta-suave text-cuerpo">
          <span className="cifra">{num(EMPRESAS.length)}</span> cuentas ·{' '}
          <span className="cifra">{num(CONTACTOS.length)}</span> contactos ·{' '}
          <span className="cifra">{num(filtradas.length)}</span> en la vista
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        <div className="relative">
          <Search size={16} strokeWidth={1.5} aria-hidden="true" className="absolute left-2 top-1/2 -translate-y-1/2 text-tinta-suave" />
          <label className="sr-only" htmlFor="q">Buscar empresa, contacto o CUIT</label>
          <input
            id="q"
            type="search"
            className="campo"
            style={{ paddingLeft: 30 }}
            placeholder="Buscar empresa, contacto o CUIT…"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPagina(0) }}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <label className="sr-only" htmlFor="z">Zona</label>
        <select id="z" className="campo" value={zona} onChange={(e) => { setZona(e.target.value); setPagina(0) }}>
          <option value="">Todas las zonas</option>
          {zonas.map((z) => <option key={z} value={z}>{z}</option>)}
        </select>
        <label className="sr-only" htmlFor="p">Vendedor</label>
        <select id="p" className="campo" value={propietario} onChange={(e) => { setPropietario(e.target.value); setPagina(0) }}>
          <option value="">Todo el equipo</option>
          {VENDEDORES_ACTIVOS.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
        </select>
      </div>

      <div className="panel overflow-x-auto">
        <table className="w-full text-dato" style={{ minWidth: 780 }}>
          <caption className="sr-only">Empresas</caption>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--pauta)' }}>
              <th scope="col" className="text-left p-2 encabezado-columna">Empresa</th>
              <th scope="col" className="text-left p-2 encabezado-columna">Contacto principal</th>
              <th scope="col" className="text-left p-2 encabezado-columna">Zona</th>
              <th scope="col" className="text-left p-2 encabezado-columna">Atiende</th>
              <th scope="col" className="text-right p-2 encabezado-columna">Oportunidades</th>
              <th scope="col" className="text-right p-2 encabezado-columna">En juego</th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((e) => {
              const ct = CONTACTOS.find((c) => c.empresaId === e.id && c.principal)
              const ops = oportunidades.filter((o) => o.empresaId === e.id && o.etapa !== 'perdido' && o.etapa !== 'ganado')
              const u = usuarioDe(e.propietario)
              return (
                <tr key={e.id} style={{ borderBottom: '1px solid var(--pauta)' }} className="hover:bg-papel">
                  <td className="p-2">
                    <button type="button" className="text-left font-semibold hover:underline" onClick={() => abrirEmpresa(e.id)}>
                      {e.razonSocial}
                    </button>
                    <span className="block text-micro text-tinta-suave">{e.canal} · {e.localidad}</span>
                  </td>
                  <td className="p-2">
                    {ct ? (
                      <>
                        <span className="block truncate">{ct.nombre}</span>
                        <span className="block text-micro text-tinta-suave cifra">{ct.telefono}</span>
                      </>
                    ) : '—'}
                  </td>
                  <td className="p-2 text-tinta-suave">{e.zona}</td>
                  <td className="p-2">
                    <span className="flex items-center gap-2">
                      <Avatar iniciales={u?.iniciales ?? '··'} titulo={u?.nombre} />
                      <span className="truncate text-tinta-suave">{u?.nombre}</span>
                    </span>
                  </td>
                  <td className="p-2 text-right cifra">{num(ops.length)}</td>
                  <td className="p-2 text-right cifra">{pesosARS(ops.reduce((a, o) => a + o.valor, 0))}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-micro text-tinta-suave">Página {pag + 1} de {paginas}</p>
        <div className="flex gap-2">
          <button type="button" className="boton boton-secundario" disabled={pag === 0} onClick={() => setPagina(pag - 1)}>Anterior</button>
          <button type="button" className="boton boton-secundario" disabled={pag >= paginas - 1} onClick={() => setPagina(pag + 1)}>Siguiente</button>
        </div>
      </div>
    </div>
  )
}
