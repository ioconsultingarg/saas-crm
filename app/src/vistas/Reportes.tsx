import { useMemo } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { Oportunidad } from '../tipos-crm'
import { ETIQUETA_ETAPA } from '../tipos-crm'
import { embudo, motivosDePerdida, origenes, proyeccionMensual, rendimientoPorAgente, resumen } from '../lib/crm'
import { Avatar, Barra, COLOR_ETAPA, Kpi, Panel } from '../componentes/Piezas'
import { mesEtiqueta, num, pct, pesosARS, pesosCorto } from '../lib/formato'

const ejeComun = {
  tick: { fill: 'var(--tinta-suave)', fontSize: 12 },
  tickLine: false,
}

const tooltipComun = {
  contentStyle: {
    background: 'var(--superficie)',
    border: '1px solid var(--borde-control)',
    borderRadius: 4,
    color: 'var(--tinta)',
    fontSize: 14,
  },
  labelStyle: { color: 'var(--tinta-suave)' },
}

export function Reportes({ oportunidades }: { oportunidades: Oportunidad[] }) {
  const r = useMemo(() => resumen(oportunidades), [oportunidades])
  const pasos = useMemo(() => embudo(oportunidades), [oportunidades])
  const proyeccion = useMemo(() => proyeccionMensual(oportunidades), [oportunidades])
  const motivos = useMemo(() => motivosDePerdida(oportunidades), [oportunidades])
  const orig = useMemo(() => origenes(oportunidades), [oportunidades])
  const agentes = useMemo(() => rendimientoPorAgente(oportunidades), [oportunidades])

  const datosProy = proyeccion.map((p) => ({ mes: mesEtiqueta(`${p.mes}-01`), ponderado: p.ponderado, total: p.total }))
  const datosConv = pasos.map((p) => ({ etapa: ETIQUETA_ETAPA[p.etapa].split(' / ')[0], cantidad: p.cantidad, etapaId: p.etapa }))
  const maxMotivo = Math.max(...motivos.map((m) => m.cantidad), 1)
  const maxAgente = Math.max(...agentes.map((a) => a.valorGanado), 1)

  return (
    <div className="grid gap-4">
      <header>
        <h1 className="font-display text-titulo">Reportes y análisis</h1>
        <p className="text-tinta-suave text-cuerpo">Conversión, proyección de ingresos y productividad del equipo.</p>
      </header>

      <div className="grid gap-3 grid-cols-2 escritorio:grid-cols-4">
        <Kpi etiqueta="Proyección ponderada" valor={pesosARS(r.proyeccion)} nota="pipeline abierto" destacado />
        <Kpi etiqueta="Valor total abierto" valor={pesosARS(r.valorAbierto)} nota={`${num(r.abiertas)} oportunidades`} />
        <Kpi etiqueta="Ticket promedio" valor={pesosARS(r.ticketPromedio)} nota="de negocios ganados" />
        <Kpi etiqueta="Ciclo de venta" valor={`${num(r.cicloPromedioDias)} días`} nota="promedio de cierre" />
      </div>

      <div className="grid gap-4 escritorio:grid-cols-2">
        <Panel titulo="Proyección de ingresos">
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={datosProy} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--marca)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="var(--marca)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--pauta)" vertical={false} />
                <XAxis dataKey="mes" {...ejeComun} axisLine={{ stroke: 'var(--pauta)' }} />
                <YAxis width={64} {...ejeComun} axisLine={false} tickFormatter={(v: number) => pesosCorto(v)} />
                <Tooltip {...tooltipComun} formatter={(v: number, n) => [pesosARS(v), n === 'ponderado' ? 'Ponderado' : 'Valor total']} />
                <Area type="monotone" dataKey="total" stroke="var(--pauta)" strokeWidth={1} fill="transparent" isAnimationActive={false} dot={false} />
                <Area type="monotone" dataKey="ponderado" stroke="var(--marca)" strokeWidth={2} fill="url(#gp)" isAnimationActive={false} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-micro text-tinta-suave mt-2">
            La línea llena pondera cada negocio por la probabilidad de su etapa; la fina es el valor
            nominal, sin ponderar.
          </p>
        </Panel>

        <Panel titulo="Conversión por etapa">
          <div style={{ height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosConv} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--pauta)" vertical={false} />
                <XAxis dataKey="etapa" {...ejeComun} axisLine={{ stroke: 'var(--pauta)' }} interval={0} />
                <YAxis width={40} {...ejeComun} axisLine={false} allowDecimals={false} />
                <Tooltip {...tooltipComun} formatter={(v: number) => [`${num(v)} negocios`, 'Alcanzaron la etapa']} />
                <Bar dataKey="cantidad" radius={[2, 2, 0, 0]} isAnimationActive={false}>
                  {datosConv.map((d) => (
                    <Cell key={d.etapaId} fill={COLOR_ETAPA[d.etapaId]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <ul className="grid gap-1 mt-2 text-micro text-tinta-suave">
            {pasos.slice(1).map((p, i) => (
              <li key={p.etapa}>
                {ETIQUETA_ETAPA[pasos[i].etapa].split(' / ')[0]} →{' '}
                {ETIQUETA_ETAPA[p.etapa].split(' / ')[0]}:{' '}
                <span className="cifra" style={{ color: 'var(--tinta)' }}>{pct(p.conversionPaso)}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="grid gap-4 escritorio:grid-cols-3">
        <Panel titulo="Productividad por vendedor" className="escritorio:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-dato" style={{ minWidth: 520 }}>
              <caption className="sr-only">Productividad por vendedor</caption>
              <thead>
                <tr>
                  <th scope="col" className="encabezado-columna text-left pb-2">Vendedor</th>
                  <th scope="col" className="encabezado-columna text-right pb-2">Actividades</th>
                  <th scope="col" className="encabezado-columna text-right pb-2">Abiertas</th>
                  <th scope="col" className="encabezado-columna text-right pb-2">Ganadas</th>
                  <th scope="col" className="encabezado-columna text-right pb-2">Cierre</th>
                  <th scope="col" className="encabezado-columna text-left pb-2 w-40">Facturado</th>
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
                    <td className="py-2 text-right cifra">{num(a.actividades)}</td>
                    <td className="py-2 text-right cifra">{num(a.abiertas)}</td>
                    <td className="py-2 text-right cifra">{num(a.ganadas)}</td>
                    <td className="py-2 text-right cifra">{pct(a.tasaGanadas)}</td>
                    <td className="py-2">
                      <Barra valor={a.valorGanado} maximo={maxAgente} color="var(--e-ganado)" etiqueta={pesosARS(a.valorGanado)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel titulo="Por qué se pierden">
          <ul className="grid gap-3">
            {motivos.map((m) => (
              <li key={m.motivo} className="grid gap-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-cuerpo">{m.motivo}</span>
                  <span className="cifra text-micro text-tinta-suave">{num(m.cantidad)}</span>
                </div>
                <Barra valor={m.cantidad} maximo={maxMotivo} color="var(--e-perdido)" etiqueta={pesosARS(m.valor)} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <Panel titulo="Rendimiento por origen">
        <div className="overflow-x-auto">
          <table className="w-full text-dato" style={{ minWidth: 520 }}>
            <caption className="sr-only">Oportunidades por origen</caption>
            <thead>
              <tr>
                <th scope="col" className="encabezado-columna text-left pb-2">Origen</th>
                <th scope="col" className="encabezado-columna text-right pb-2">Oportunidades</th>
                <th scope="col" className="encabezado-columna text-right pb-2">Ganadas</th>
                <th scope="col" className="encabezado-columna text-right pb-2">Tasa</th>
              </tr>
            </thead>
            <tbody>
              {orig.map((o) => (
                <tr key={o.origen} style={{ borderTop: '1px solid var(--pauta)' }}>
                  <td className="py-2">{o.origen}</td>
                  <td className="py-2 text-right cifra">{num(o.cantidad)}</td>
                  <td className="py-2 text-right cifra">{num(o.ganadas)}</td>
                  <td className="py-2 text-right cifra" style={{ color: o.tasa >= 0.4 ? 'var(--sano)' : undefined }}>
                    {pct(o.tasa)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  )
}
