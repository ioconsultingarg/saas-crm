import { useMemo, useState } from 'react'
import { MessageCircle, Phone } from 'lucide-react'
import type { ClienteAnalizado, GestionRegistrada, ResultadoGestion } from '../tipos'
import { EtiquetaAlerta } from '../componentes/EtiquetaEstado'
import { RegistrarGestion } from '../componentes/RegistrarGestion'
import { dias as diasTexto, fecha, pesosARS, telefonoWhatsapp } from '../lib/formato'
import { VENDEDORES, ZONAS } from '../data/seed'

const TOPE = 10

interface Props {
  enRiesgo: ClienteAnalizado[]
  totalEnRiesgo: number
  gestiones: GestionRegistrada[]
  registrar: (id: string, r: ResultadoGestion, nota?: string) => void
  abrirCliente: (id: string) => void
  filtroVendedor?: string
  filtroZona?: string
  alFiltrar: (cambio: { vendedor?: string; zona?: string }) => void
}

export function ListaDelLunes({
  enRiesgo,
  totalEnRiesgo,
  gestiones,
  registrar,
  abrirCliente,
  filtroVendedor,
  filtroZona,
  alFiltrar,
}: Props) {
  const [abierto, setAbierto] = useState<string | null>(null)

  const filtrados = useMemo(
    () =>
      enRiesgo.filter(
        (c) =>
          (!filtroVendedor || c.vendedor === filtroVendedor) &&
          (!filtroZona || c.zona === filtroZona),
      ),
    [enRiesgo, filtroVendedor, filtroZona],
  )

  const gestionadoDe = (id: string) => gestiones.find((g) => g.clienteId === id)

  // Los gestionados bajan al final, con opacidad reducida.
  const ordenados = useMemo(() => {
    const visibles = filtrados.slice(0, TOPE)
    return [...visibles].sort((a, b) => {
      const ga = gestionadoDe(a.id) ? 1 : 0
      const gb = gestionadoDe(b.id) ? 1 : 0
      if (ga !== gb) return ga - gb
      return b.a.montoEnRiesgo - a.a.montoEnRiesgo
    })
  }, [filtrados, gestiones])

  const restantes = Math.max(0, filtrados.length - TOPE)
  const pendientes = ordenados.filter((c) => !gestionadoDe(c.id)).length

  if (filtrados.length === 0) {
    return (
      <div className="panel p-6 text-center">
        <h1 className="text-titulo font-display mb-2">Ningún cliente en riesgo esta semana</h1>
        <p className="text-tinta-suave">
          Toda la cartera está dentro de su ritmo habitual de compra. Buena semana.
        </p>
      </div>
    )
  }

  return (
    <>
      <header className="mb-4">
        <h1 className="font-display text-titulo">Lista del lunes</h1>
        <p className="encabezado-columna mt-2">En riesgo esta semana</p>
        <p className="font-display cifra" style={{ fontSize: 34, lineHeight: '38px' }}>
          {pesosARS(totalEnRiesgo)}
        </p>
        <p className="text-tinta-suave text-cuerpo">
          {enRiesgo.length} clientes con alerta · {pendientes} sin gestionar en esta lista
        </p>
      </header>

      <div className="flex flex-wrap gap-2 mb-4 no-imprimir">
        <label className="sr-only" htmlFor="f-vendedor">
          Filtrar por vendedor
        </label>
        <select
          id="f-vendedor"
          className="campo"
          value={filtroVendedor ?? ''}
          onChange={(e) => alFiltrar({ vendedor: e.target.value || undefined })}
        >
          <option value="">Todos los vendedores</option>
          {VENDEDORES.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>

        <label className="sr-only" htmlFor="f-zona">
          Filtrar por zona
        </label>
        <select
          id="f-zona"
          className="campo"
          value={filtroZona ?? ''}
          onChange={(e) => alFiltrar({ zona: e.target.value || undefined })}
        >
          <option value="">Todas las zonas</option>
          {ZONAS.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>
      </div>

      <ul className="grid gap-2">
        {ordenados.map((c) => {
          const g = gestionadoDe(c.id)
          const tel = c.contactos[0]
          return (
            <li
              key={c.id}
              className="panel"
              style={{
                opacity: g ? 0.55 : 1,
                borderLeft:
                  g?.resultado === 'pospuesto' ? '3px solid var(--riesgo)' : undefined,
                transition: 'opacity var(--mov-medio) var(--curva)',
              }}
            >
              {/* --- Escritorio --------------------------------------------- */}
              <div className="hidden tablet:grid items-center gap-3 p-3"
                   style={{ gridTemplateColumns: 'minmax(0,2fr) minmax(0,1.4fr) auto minmax(0,1.2fr) auto' }}>
                <div className="min-w-0">
                  <button
                    type="button"
                    className="text-subtitulo font-semibold text-left truncate w-full hover:underline"
                    onClick={() => abrirCliente(c.id)}
                  >
                    {c.razonSocial}
                  </button>
                  <p className="text-micro text-tinta-suave truncate">
                    {c.canal} · {c.zona} · {c.vendedor}
                  </p>
                </div>

                <div className="min-w-0">
                  <p className="text-cuerpo">
                    hace {diasTexto(c.a.diasSinComprar)}
                    {c.cadencia && (
                      <span className="text-tinta-suave"> · compraba cada {c.cadencia}</span>
                    )}
                  </p>
                  <p className="text-micro text-tinta-suave truncate">
                    {c.productos.map((p) => p.nombre.split(' ')[0]).join(', ')}
                  </p>
                </div>

                <EtiquetaAlerta alerta={c.a.alerta!} />

                <div className="min-w-0 text-micro text-tinta-suave">
                  {tel && (
                    <>
                      <p className="truncate">{tel.nombre}</p>
                      <p className="cifra">{tel.telefono}</p>
                    </>
                  )}
                  {g && <p className="truncate">Gestionado: {g.resultado}</p>}
                  {!g && c.gestiones[0] && (
                    <p className="truncate">
                      {fecha(c.gestiones[0].fecha)}: {c.gestiones[0].resultado}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 justify-end">
                  <p className="cifra text-right font-semibold" style={{ fontSize: 16 }}>
                    {pesosARS(c.a.montoEnRiesgo)}
                  </p>
                  <div className="relative">
                    <button
                      type="button"
                      className="boton boton-secundario"
                      onClick={() => setAbierto(abierto === c.id ? null : c.id)}
                      aria-expanded={abierto === c.id}
                    >
                      {g ? 'Cambiar' : 'Registrar'}
                    </button>
                    {abierto === c.id && (
                      <div className="absolute right-0 top-full mt-1 z-40">
                        <RegistrarGestion
                          comercio={c.razonSocial}
                          comoHoja={false}
                          alCerrar={() => setAbierto(null)}
                          alElegir={(r, nota) => {
                            registrar(c.id, r, nota)
                            setAbierto(null)
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* --- Movil: la vista principal ------------------------------ */}
              <div className="tablet:hidden p-3 grid gap-2">
                <div className="flex items-start justify-between gap-2">
                  <button
                    type="button"
                    className="text-subtitulo font-semibold text-left min-w-0 flex-1"
                    onClick={() => abrirCliente(c.id)}
                  >
                    <span className="block truncate">{c.razonSocial}</span>
                    <span className="block text-micro text-tinta-suave font-normal truncate">
                      {c.canal} · {c.zona}
                    </span>
                  </button>
                  <p className="cifra font-semibold shrink-0" style={{ fontSize: 18 }}>
                    {pesosARS(c.a.montoEnRiesgo)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <EtiquetaAlerta alerta={c.a.alerta!} />
                  <span className="text-micro text-tinta-suave">
                    hace {diasTexto(c.a.diasSinComprar)}
                    {c.cadencia && ` · cada ${c.cadencia}`}
                  </span>
                </div>

                {g && <p className="text-micro text-tinta-suave">Gestionado: {g.resultado}</p>}

                <div className="grid grid-cols-3 gap-2">
                  {tel ? (
                    <a
                      className="boton boton-secundario"
                      style={{ minHeight: 48 }}
                      href={`tel:${tel.telefono}`}
                    >
                      <Phone size={18} strokeWidth={1.5} aria-hidden="true" />
                      Llamar
                    </a>
                  ) : (
                    <span />
                  )}
                  {tel?.whatsapp ? (
                    <a
                      className="boton boton-secundario"
                      style={{ minHeight: 48 }}
                      href={telefonoWhatsapp(tel.telefono)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle size={18} strokeWidth={1.5} aria-hidden="true" />
                      WhatsApp
                    </a>
                  ) : (
                    <span />
                  )}
                  <button
                    type="button"
                    className="boton boton-primario"
                    style={{ minHeight: 48 }}
                    onClick={() => setAbierto(c.id)}
                  >
                    {g ? 'Cambiar' : 'Registrar'}
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      {restantes > 0 && (
        <p className="text-micro text-tinta-suave mt-3">
          {restantes} clientes más en riesgo: entran la semana que viene.
        </p>
      )}

      {/* Hoja inferior en movil */}
      {abierto && (
        <div className="tablet:hidden">
          <RegistrarGestion
            comercio={ordenados.find((c) => c.id === abierto)?.razonSocial ?? ''}
            comoHoja
            alCerrar={() => setAbierto(null)}
            alElegir={(r, nota) => {
              registrar(abierto, r, nota)
              setAbierto(null)
            }}
          />
        </div>
      )}
    </>
  )
}
