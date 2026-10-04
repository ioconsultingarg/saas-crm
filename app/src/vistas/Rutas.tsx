import { useMemo, useState } from 'react'
import { CalendarDays, MapPin, UserCog } from 'lucide-react'
import { NOMBRE_DIA } from '../tipos-calle'
import { RUTAS } from '../data/calle'
import { VENDEDORES_ACTIVOS, empresaDe, usuarioDe } from '../data/crm'
import { Kpi, Panel } from '../componentes/Piezas'
import { num } from '../lib/formato'

const DIAS = [1, 2, 3, 4, 5, 6]

export function Rutas({ abrirEmpresa }: { abrirEmpresa: (id: string) => void }) {
  const [vendedor, setVendedor] = useState('')
  const [reasignando, setReasignando] = useState<string | null>(null)
  const [reasignaciones, setReasignaciones] = useState<Record<string, string>>({})

  const visibles = useMemo(
    () => (vendedor ? RUTAS.filter((r) => r.vendedor === vendedor) : RUTAS),
    [vendedor],
  )

  const porDia = useMemo(() => {
    const m = new Map<number, typeof RUTAS>()
    for (const d of DIAS) m.set(d, [])
    for (const r of visibles) m.get(r.dia)?.push(r)
    return m
  }, [visibles])

  const comerciosCubiertos = new Set(RUTAS.flatMap((r) => r.empresas)).size
  const vendedorDe = (rutaId: string, original: string) => reasignaciones[rutaId] ?? original

  return (
    <div className="grid gap-4">
      <header>
        <h1 className="font-display text-titulo">Rutas y preventistas</h1>
        <p className="text-tinta-suave text-cuerpo">
          Zonas, días de visita y reasignación ante ausencias.
        </p>
      </header>

      <div className="grid gap-3 grid-cols-2 escritorio:grid-cols-4">
        <Kpi etiqueta="Rutas activas" valor={num(RUTAS.length)} destacado />
        <Kpi etiqueta="Preventistas" valor={num(VENDEDORES_ACTIVOS.length)} nota="en calle" />
        <Kpi etiqueta="Comercios cubiertos" valor={num(comerciosCubiertos)} />
        <Kpi etiqueta="Reasignaciones" valor={num(Object.keys(reasignaciones).length)} nota="en esta sesión" />
      </div>

      <div className="flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="v">Preventista</label>
        <select id="v" className="campo" value={vendedor} onChange={(e) => setVendedor(e.target.value)}>
          <option value="">Todo el equipo</option>
          {VENDEDORES_ACTIVOS.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
        </select>
      </div>

      <div className="grid gap-4 tablet:grid-cols-2 escritorio:grid-cols-3">
        {DIAS.map((d) => {
          const rutas = porDia.get(d) ?? []
          return (
            <Panel key={d} titulo={NOMBRE_DIA[d]}>
              {rutas.length === 0 ? (
                <p className="text-cuerpo text-tinta-suave">Sin rutas este día.</p>
              ) : (
                <ul className="grid gap-3">
                  {rutas.map((r) => {
                    const actual = vendedorDe(r.id, r.vendedor)
                    const u = usuarioDe(actual)
                    return (
                      <li key={r.id} className="grid gap-2" style={{ borderTop: '1px solid var(--pauta)', paddingTop: 10 }}>
                        <div className="flex items-start gap-2">
                          <MapPin size={15} strokeWidth={1.5} aria-hidden="true" className="shrink-0 mt-0.5 text-tinta-suave" />
                          <span className="min-w-0 flex-1">
                            <span className="block text-cuerpo font-semibold truncate">{r.zona}</span>
                            <span className="block text-micro text-tinta-suave">
                              <span className="cifra">{num(r.empresas.length)}</span> comercios
                            </span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <UserCog size={15} strokeWidth={1.5} aria-hidden="true" className="shrink-0 text-tinta-suave" />
                          {reasignando === r.id ? (
                            <>
                              <label className="sr-only" htmlFor={`re-${r.id}`}>Reasignar {r.zona}</label>
                              <select
                                id={`re-${r.id}`} className="campo flex-1" value={actual}
                                onChange={(e) => {
                                  setReasignaciones((x) => ({ ...x, [r.id]: e.target.value }))
                                  setReasignando(null)
                                }}
                              >
                                {VENDEDORES_ACTIVOS.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
                              </select>
                            </>
                          ) : (
                            <>
                              <span className="text-cuerpo flex-1 truncate">
                                {u?.nombre}
                                {reasignaciones[r.id] && (
                                  <span className="text-micro" style={{ color: 'var(--riesgo)' }}> · reasignada</span>
                                )}
                              </span>
                              <button type="button" className="boton boton-sutil" onClick={() => setReasignando(r.id)}>
                                Cambiar
                              </button>
                            </>
                          )}
                        </div>

                        <details>
                          <summary className="text-micro text-tinta-suave cursor-pointer">Ver comercios</summary>
                          <ul className="grid gap-1 mt-1">
                            {r.empresas.map((id) => (
                              <li key={id}>
                                <button type="button" className="text-micro text-left hover:underline truncate w-full" onClick={() => abrirEmpresa(id)}>
                                  {empresaDe(id)?.razonSocial}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </details>
                      </li>
                    )
                  })}
                </ul>
              )}
            </Panel>
          )
        })}
      </div>

      <p className="text-micro text-tinta-suave flex items-start gap-2">
        <CalendarDays size={14} strokeWidth={1.5} aria-hidden="true" className="shrink-0 mt-0.5" />
        La planificación es por zona y día de visita. No hay optimización automática de recorrido:
        el preventista conoce su zona mejor que un algoritmo, y además eso exigiría rastrearlo.
      </p>
    </div>
  )
}
