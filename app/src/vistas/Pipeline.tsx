import { useMemo, useRef, useState } from 'react'
import { Clock, GripVertical, MoveRight } from 'lucide-react'
import type { Etapa, Oportunidad } from '../tipos-crm'
import { ETAPAS_TABLERO, ETIQUETA_ETAPA, PROBABILIDAD_ETAPA } from '../tipos-crm'
import { contactoDe, empresaDe, usuarioDe } from '../data/crm'
import { diasSinActividad, probabilidadDe } from '../lib/crm'
import { Avatar, COLOR_ETAPA } from '../componentes/Piezas'
import { fecha, num, pct, pesosARS } from '../lib/formato'
import { VENDEDORES_ACTIVOS } from '../data/crm'

interface Props {
  oportunidades: Oportunidad[]
  mover: (id: string, etapa: Etapa) => void
  abrirEmpresa: (id: string) => void
}

export function Pipeline({ oportunidades, mover, abrirEmpresa }: Props) {
  const [arrastrando, setArrastrando] = useState<string | null>(null)
  const [encima, setEncima] = useState<Etapa | null>(null)
  const [menu, setMenu] = useState<string | null>(null)
  const [filtro, setFiltro] = useState('')
  const vivo = useRef<HTMLParagraphElement>(null)

  const visibles = useMemo(
    () => (filtro ? oportunidades.filter((o) => o.propietario === filtro) : oportunidades),
    [oportunidades, filtro],
  )

  const porEtapa = useMemo(() => {
    const m = new Map<Etapa, Oportunidad[]>()
    for (const e of ETAPAS_TABLERO) m.set(e, [])
    for (const o of visibles) {
      if (o.etapa === 'perdido') continue
      m.get(o.etapa)?.push(o)
    }
    for (const [, lista] of m) lista.sort((a, b) => b.valor - a.valor)
    return m
  }, [visibles])

  const anunciar = (texto: string) => {
    if (vivo.current) vivo.current.textContent = texto
  }

  const soltarEn = (etapa: Etapa, id: string) => {
    const o = oportunidades.find((x) => x.id === id)
    if (!o || o.etapa === etapa) return
    mover(id, etapa)
    anunciar(`${o.titulo} movida a ${ETIQUETA_ETAPA[etapa]}`)
  }

  const perdidas = visibles.filter((o) => o.etapa === 'perdido')

  return (
    <div className="grid gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-titulo">Pipeline</h1>
          <p className="text-tinta-suave text-cuerpo">
            <span className="cifra">{num(visibles.filter((o) => o.etapa !== 'perdido' && o.etapa !== 'ganado').length)}</span>{' '}
            oportunidades abiertas · arrastrá las tarjetas o usá el botón de mover
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="f-prop">Filtrar por vendedor</label>
          <select id="f-prop" className="campo" value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="">Todo el equipo</option>
            {VENDEDORES_ACTIVOS.map((u) => (
              <option key={u.id} value={u.id}>{u.nombre}</option>
            ))}
          </select>
        </div>
      </header>

      <p ref={vivo} role="status" aria-live="polite" className="sr-only" />

      <div className="overflow-x-auto pb-2">
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${ETAPAS_TABLERO.length}, minmax(252px, 1fr))` }}>
          {ETAPAS_TABLERO.map((etapa) => {
            const lista = porEtapa.get(etapa) ?? []
            const total = lista.reduce((a, o) => a + o.valor, 0)
            const activa = encima === etapa
            return (
              <section
                key={etapa}
                aria-label={ETIQUETA_ETAPA[etapa]}
                onDragOver={(e) => { e.preventDefault(); setEncima(etapa) }}
                onDragLeave={() => setEncima((v) => (v === etapa ? null : v))}
                onDrop={(e) => {
                  e.preventDefault()
                  setEncima(null)
                  const id = e.dataTransfer.getData('text/plain') || arrastrando
                  if (id) soltarEn(etapa, id)
                  setArrastrando(null)
                }}
                className="rounded-md flex flex-col"
                style={{
                  background: activa
                    ? 'color-mix(in srgb, var(--marca) 8%, var(--superficie))'
                    : 'var(--superficie)',
                  border: `1px solid ${activa ? 'var(--marca)' : 'var(--pauta)'}`,
                  transition: 'background-color var(--mov-corto) var(--curva), border-color var(--mov-corto) var(--curva)',
                  minHeight: 200,
                }}
              >
                <header
                  className="px-3 py-2 sticky top-0 rounded-t-md"
                  style={{ borderBottom: '1px solid var(--pauta)', background: 'inherit' }}
                >
                  <div className="flex items-center gap-2">
                    <span aria-hidden="true" style={{ width: 8, height: 8, borderRadius: 2, background: COLOR_ETAPA[etapa] }} />
                    <h2 className="text-cuerpo font-semibold flex-1 truncate">{ETIQUETA_ETAPA[etapa]}</h2>
                    <span className="cifra text-micro text-tinta-suave">{num(lista.length)}</span>
                  </div>
                  <p className="cifra text-micro text-tinta-suave mt-0.5">{pesosARS(total)}</p>
                </header>

                <ul className="p-2 grid gap-2 flex-1">
                  {lista.map((o) => {
                    const emp = empresaDe(o.empresaId)
                    const ct = contactoDe(o.contactoId)
                    const u = usuarioDe(o.propietario)
                    const quieto = diasSinActividad(o.id)
                    const estancada = quieto !== null && quieto > 15 && etapa !== 'ganado'
                    return (
                      <li key={o.id}>
                        <article
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', o.id)
                            e.dataTransfer.effectAllowed = 'move'
                            setArrastrando(o.id)
                          }}
                          onDragEnd={() => { setArrastrando(null); setEncima(null) }}
                          className="rounded p-2 grid gap-1 relative"
                          style={{
                            background: 'var(--papel)',
                            border: '1px solid var(--pauta)',
                            borderLeft: `3px solid ${COLOR_ETAPA[etapa]}`,
                            opacity: arrastrando === o.id ? 0.45 : 1,
                            cursor: 'grab',
                            transition: 'opacity var(--mov-corto) var(--curva)',
                          }}
                        >
                          <div className="flex items-start gap-1">
                            <GripVertical size={14} strokeWidth={1.5} aria-hidden="true" className="text-tinta-suave shrink-0 mt-0.5" />
                            <h3 className="text-cuerpo font-semibold leading-tight flex-1 min-w-0">{o.titulo}</h3>
                          </div>

                          <button
                            type="button"
                            className="text-micro text-tinta-suave text-left truncate hover:underline"
                            onClick={() => abrirEmpresa(o.empresaId)}
                          >
                            {emp?.razonSocial}
                          </button>

                          <p className="cifra font-semibold" style={{ fontSize: 15 }}>{pesosARS(o.valor)}</p>

                          <div className="flex items-center gap-2 flex-wrap text-micro text-tinta-suave">
                            <Avatar iniciales={u?.iniciales ?? '··'} titulo={u?.nombre} />
                            <span className="truncate">{ct?.nombre}</span>
                          </div>

                          <div className="flex items-center justify-between gap-2 text-micro text-tinta-suave">
                            <span>cierre {fecha(o.cierreEstimado)}</span>
                            <span className="cifra">{pct(probabilidadDe(o))}</span>
                          </div>

                          {estancada && (
                            <p className="flex items-center gap-1 text-micro" style={{ color: 'var(--riesgo)' }}>
                              <Clock size={12} strokeWidth={1.5} aria-hidden="true" />
                              {quieto} días sin actividad
                            </p>
                          )}

                          {/* Alternativa al arrastre: obligatoria para teclado */}
                          <div className="relative">
                            <button
                              type="button"
                              className="boton boton-sutil w-full justify-start"
                              style={{ minHeight: 40 }}
                              aria-expanded={menu === o.id}
                              onClick={() => setMenu(menu === o.id ? null : o.id)}
                            >
                              <MoveRight size={14} strokeWidth={1.5} aria-hidden="true" />
                              Mover
                            </button>
                            {menu === o.id && (
                              <ul
                                className="absolute z-20 left-0 right-0 mt-1 panel shadow-panel p-1"
                                style={{ transformOrigin: 'top left' }}
                              >
                                {[...ETAPAS_TABLERO, 'perdido' as Etapa]
                                  .filter((e) => e !== o.etapa)
                                  .map((e) => (
                                    <li key={e}>
                                      <button
                                        type="button"
                                        className="boton boton-sutil w-full justify-start"
                                        onClick={() => { soltarEn(e, o.id); setMenu(null) }}
                                      >
                                        {ETIQUETA_ETAPA[e]}
                                      </button>
                                    </li>
                                  ))}
                              </ul>
                            )}
                          </div>
                        </article>
                      </li>
                    )
                  })}

                  {lista.length === 0 && (
                    <li className="text-micro text-tinta-suave p-2 text-center">
                      Sin oportunidades en esta etapa
                    </li>
                  )}
                </ul>
              </section>
            )
          })}
        </div>
      </div>

      {perdidas.length > 0 && (
        <details className="panel p-4">
          <summary className="text-subtitulo font-semibold cursor-pointer">
            Cerradas / Perdidas ({num(perdidas.length)})
          </summary>
          <ul className="grid gap-2 mt-3">
            {perdidas.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 text-cuerpo" style={{ borderTop: '1px solid var(--pauta)', paddingTop: 8 }}>
                <span className="min-w-0">
                  <span className="block truncate">{o.titulo}</span>
                  <span className="block text-micro text-tinta-suave truncate">
                    {empresaDe(o.empresaId)?.razonSocial} · {o.motivoPerdida}
                  </span>
                </span>
                <span className="cifra" style={{ color: 'var(--e-perdido)' }}>{pesosARS(o.valor)}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      <p className="text-micro text-tinta-suave">
        La probabilidad sale de la etapa ({ETAPAS_TABLERO.map((e) => `${ETIQUETA_ETAPA[e].split(' / ')[0]} ${pct(PROBABILIDAD_ETAPA[e])}`).join(' · ')}).
      </p>
    </div>
  )
}
