import { useMemo } from 'react'
import { CalendarClock, CircleCheck, Mail, MessageCircle, Phone, StickyNote, Users } from 'lucide-react'
import type { Oportunidad, TipoActividad } from '../tipos-crm'
import { ETIQUETA_ETAPA } from '../tipos-crm'
import { ACTIVIDADES, TAREAS, usuarioDe } from '../data/crm'
import { embudo, nombreEmpresa, rendimientoPorAgente, resumen, tareasDeHoy } from '../lib/crm'
import { conAlerta } from '../lib/calculos'
import { Avatar, Barra, COLOR_ETAPA, Dinero, Kpi, Panel } from '../componentes/Piezas'
import { fecha, num, pct, pesosARS } from '../lib/formato'
import type { ClienteAnalizado } from '../tipos'

const ICONO_ACTIVIDAD: Record<TipoActividad, typeof Phone> = {
  llamada: Phone,
  email: Mail,
  'reunión': Users,
  whatsapp: MessageCircle,
  nota: StickyNote,
}

interface Props {
  oportunidades: Oportunidad[]
  clientes: ClienteAnalizado[]
  irAPipeline: () => void
  irACartera: () => void
  abrirEmpresa: (id: string) => void
}

export function Dashboard({ oportunidades, clientes, irAPipeline, irACartera, abrirEmpresa }: Props) {
  const r = useMemo(() => resumen(oportunidades), [oportunidades])
  const pasos = useMemo(() => embudo(oportunidades), [oportunidades])
  const agentes = useMemo(() => rendimientoPorAgente(oportunidades), [oportunidades])
  const tareas = useMemo(() => tareasDeHoy(TAREAS).slice(0, 6), [])
  const recompra = useMemo(() => conAlerta(clientes), [clientes])
  const enRiesgo = recompra.reduce((a, c) => a + c.a.montoEnRiesgo, 0)
  const maxEmbudo = pasos[0]?.cantidad || 1
  const maxAgente = Math.max(...agentes.map((a) => a.valorGanado), 1)

  return (
    <div className="grid gap-4">
      <header>
        <h1 className="font-display text-titulo">Panel</h1>
        <p className="text-tinta-suave text-cuerpo">
          Embudo, tareas del día y estado de la cartera, de un vistazo.
        </p>
      </header>

      {/* Tira de métricas */}
      <div className="grid gap-3 grid-cols-2 escritorio:grid-cols-4">
        <Kpi etiqueta="Proyección ponderada" valor={pesosARS(r.proyeccion)} nota="del pipeline abierto" destacado />
        <Kpi etiqueta="Ganado" valor={pesosARS(r.valorGanado)} variacion={0.18} nota={`${num(r.ganadas)} negocios`} />
        <Kpi etiqueta="Tasa de cierre" valor={pct(r.tasaGanadas)} nota={`${num(r.perdidas)} perdidas`} />
        <Kpi etiqueta="Ciclo promedio" valor={`${num(r.cicloPromedioDias)} días`} nota="de alta a cierre" />
      </div>

      {/* Bento: embudo ancho + tareas al costado */}
      <div className="grid gap-4 escritorio:grid-cols-3">
        <Panel
          titulo="Embudo de ventas"
          className="escritorio:col-span-2"
          accion={
            <button type="button" className="boton boton-sutil" onClick={irAPipeline}>
              Ver tablero
            </button>
          }
        >
          <ol className="grid gap-3">
            {pasos.map((p, i) => (
              <li key={p.etapa} className="grid gap-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-cuerpo font-semibold">{ETIQUETA_ETAPA[p.etapa]}</span>
                  <span className="text-micro text-tinta-suave">
                    <span className="cifra">{num(p.cantidad)}</span> negocios ·{' '}
                    <span className="cifra">{pesosARS(p.valor)}</span>
                  </span>
                </div>
                {/* Ancho proporcional: el embudo se estrecha de verdad */}
                <div
                  className="rounded-sm relative overflow-hidden"
                  style={{
                    height: 30,
                    width: `${Math.max(12, (p.cantidad / maxEmbudo) * 100)}%`,
                    background: COLOR_ETAPA[p.etapa],
                    transition: 'width var(--mov-medio) var(--curva)',
                  }}
                >
                  <span
                    className="absolute inset-y-0 left-2 grid items-center text-micro font-semibold"
                    style={{ color: 'var(--superficie)' }}
                  >
                    {i === 0 ? '100%' : pct(p.conversionDesdeInicio)}
                  </span>
                </div>
                {i > 0 && (
                  <span className="text-micro text-tinta-suave">
                    pasa el <span className="cifra">{pct(p.conversionPaso)}</span> desde{' '}
                    {ETIQUETA_ETAPA[pasos[i - 1].etapa].toLowerCase()}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </Panel>

        <div className="grid gap-4 content-start">
          <Panel titulo="Tareas de hoy">
            {tareas.length === 0 ? (
              <p className="text-cuerpo text-tinta-suave">Nada pendiente para hoy.</p>
            ) : (
              <ul className="grid gap-2">
                {tareas.map((t) => (
                  <li key={t.id} className="flex items-start gap-2">
                    <CalendarClock
                      size={16}
                      strokeWidth={1.5}
                      aria-hidden="true"
                      className="shrink-0 mt-1"
                      style={{ color: t.prioridad === 'alta' ? 'var(--critico)' : 'var(--tinta-suave)' }}
                    />
                    <span className="min-w-0">
                      <span className="block text-cuerpo truncate">{t.titulo}</span>
                      <span className="block text-micro text-tinta-suave truncate">
                        {t.empresaId ? nombreEmpresa(t.empresaId) : '—'} · vence {fecha(t.vence)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {/* El módulo que diferencia: recompra */}
          <Panel
            titulo="Recompra en riesgo"
            accion={
              <button type="button" className="boton boton-sutil" onClick={irACartera}>
                Ver lista
              </button>
            }
          >
            <Dinero valor={enRiesgo} grande />
            <p className="text-micro text-tinta-suave mt-1">
              {num(recompra.length)} clientes se salieron de su ritmo de compra
            </p>
            <ul className="grid gap-1 mt-3">
              {recompra.slice(0, 3).map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-2 text-micro">
                  <span className="truncate">{c.razonSocial}</span>
                  <span className="cifra shrink-0">{pesosARS(c.a.montoEnRiesgo)}</span>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>

      {/* Equipo + actividad */}
      <div className="grid gap-4 escritorio:grid-cols-3">
        <Panel titulo="Rendimiento del equipo" className="escritorio:col-span-2">
          <table className="w-full text-dato">
            <caption className="sr-only">Rendimiento por vendedor</caption>
            <thead>
              <tr>
                <th scope="col" className="encabezado-columna text-left pb-2">Vendedor</th>
                <th scope="col" className="encabezado-columna text-right pb-2">Abiertas</th>
                <th scope="col" className="encabezado-columna text-right pb-2">Cierre</th>
                <th scope="col" className="encabezado-columna text-left pb-2 w-40">Ganado</th>
              </tr>
            </thead>
            <tbody>
              {agentes.map((a) => (
                <tr key={a.usuarioId} style={{ borderTop: '1px solid var(--pauta)' }}>
                  <td className="py-2">
                    <span className="flex items-center gap-2">
                      <Avatar iniciales={a.iniciales} />
                      <span className="truncate">{a.nombre}</span>
                    </span>
                  </td>
                  <td className="py-2 text-right cifra">{num(a.abiertas)}</td>
                  <td className="py-2 text-right cifra">{pct(a.tasaGanadas)}</td>
                  <td className="py-2">
                    <Barra
                      valor={a.valorGanado}
                      maximo={maxAgente}
                      color="var(--e-ganado)"
                      etiqueta={pesosARS(a.valorGanado)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-micro text-tinta-suave mt-3">
            Se mide la cartera y su resultado, no a las personas: no hay ubicación, ni horarios, ni
            ranking atado a evaluación.
          </p>
        </Panel>

        <Panel titulo="Actividad reciente">
          <ul className="grid gap-3">
            {ACTIVIDADES.slice(0, 7).map((a) => {
              const Icono = ICONO_ACTIVIDAD[a.tipo]
              const u = usuarioDe(a.usuario)
              return (
                <li key={a.id} className="flex items-start gap-2">
                  <Icono size={16} strokeWidth={1.5} aria-hidden="true" className="shrink-0 mt-1 text-tinta-suave" />
                  <span className="min-w-0">
                    <button
                      type="button"
                      className="block text-cuerpo text-left truncate w-full hover:underline"
                      onClick={() => abrirEmpresa(a.empresaId)}
                    >
                      {nombreEmpresa(a.empresaId)}
                    </button>
                    <span className="block text-micro text-tinta-suave line-clamp-2">{a.resumen}</span>
                    <span className="block text-micro text-tinta-suave">
                      {u?.iniciales} · {fecha(a.fecha)}
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
        </Panel>
      </div>

      <p className="text-micro text-tinta-suave flex items-center gap-2">
        <CircleCheck size={14} strokeWidth={1.5} aria-hidden="true" />
        Datos ficticios de Distribuidora Demo S.R.L.
      </p>
    </div>
  )
}
