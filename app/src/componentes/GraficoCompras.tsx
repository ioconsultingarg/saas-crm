import { useId, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ClienteAnalizado } from '../tipos'
import { mesEtiqueta, num, pctPlano, pesosARS, pesosCorto } from '../lib/formato'

type Unidad = 'pesos' | 'unidades'

export function GraficoCompras({ cliente }: { cliente: ClienteAnalizado }) {
  const [unidad, setUnidad] = useState<Unidad>('pesos')
  const idTabla = useId()

  const datos = cliente.serie.map((p) => ({
    mes: mesEtiqueta(p.mes),
    valor: unidad === 'pesos' ? p.pesos : p.unidades,
  }))

  const color = cliente.a.caidaDisfrazada && unidad === 'unidades' ? 'var(--critico)' : 'var(--marca)'

  return (
    <section className="panel p-4" aria-labelledby={`${idTabla}-titulo`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h3 id={`${idTabla}-titulo`} className="text-subtitulo font-semibold">
          Compras de los últimos 14 meses
        </h3>

        <div
          role="group"
          aria-label="Unidad de medida del gráfico"
          className="inline-flex rounded border border-control overflow-hidden"
        >
          {(['pesos', 'unidades'] as Unidad[]).map((u) => (
            <button
              key={u}
              type="button"
              aria-pressed={unidad === u}
              onClick={() => setUnidad(u)}
              className="px-3 text-dato font-semibold capitalize"
              style={{
                minHeight: 44,
                background: unidad === u ? 'var(--marca)' : 'transparent',
                color: unidad === u ? 'var(--marca-texto)' : 'var(--tinta)',
                transition: 'background-color var(--mov-corto) var(--curva)',
              }}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={datos} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`relleno-${idTabla}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.18} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--pauta)" vertical={false} />
            <XAxis
              dataKey="mes"
              tick={{ fill: 'var(--tinta-suave)', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: 'var(--pauta)' }}
              interval="preserveStartEnd"
            />
            <YAxis
              width={64}
              tick={{ fill: 'var(--tinta-suave)', fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => (unidad === 'pesos' ? pesosCorto(v) : num(v))}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--superficie)',
                border: '1px solid var(--borde-control)',
                borderRadius: 4,
                color: 'var(--tinta)',
                fontSize: 14,
              }}
              labelStyle={{ color: 'var(--tinta-suave)' }}
              formatter={(v: number) => [
                unidad === 'pesos' ? pesosARS(v) : `${num(v)} bultos`,
                unidad === 'pesos' ? 'Facturado' : 'Volumen',
              ]}
            />
            <Area
              type="monotone"
              dataKey="valor"
              stroke={color}
              strokeWidth={2}
              fill={`url(#relleno-${idTabla})`}
              isAnimationActive={false}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {cliente.a.caidaDisfrazada && (
        <p
          className="mt-3 rounded-sm px-3 py-2 text-cuerpo"
          style={{ background: 'var(--riesgo-fondo)', color: 'var(--riesgo)' }}
        >
          <strong>Caída disfrazada de crecimiento:</strong> los pesos suben{' '}
          {pctPlano(cliente.a.tendenciaPesos)} y las unidades bajan{' '}
          {pctPlano(cliente.a.tendenciaUnidades)} en los últimos 90 días.
        </p>
      )}

      <details className="mt-3">
        <summary className="text-micro text-tinta-suave cursor-pointer">
          Ver los datos del gráfico en una tabla
        </summary>
        <table className="w-full mt-2 text-dato cifra">
          <caption className="sr-only">Compras mensuales en {unidad}</caption>
          <thead>
            <tr>
              <th className="encabezado-columna text-left py-1">Mes</th>
              <th className="encabezado-columna text-right py-1">
                {unidad === 'pesos' ? 'Facturado' : 'Bultos'}
              </th>
            </tr>
          </thead>
          <tbody>
            {cliente.serie.map((p) => (
              <tr key={p.mes} style={{ borderTop: '1px solid var(--pauta)' }}>
                <td className="py-1">{mesEtiqueta(p.mes)}</td>
                <td className="py-1 text-right">
                  {unidad === 'pesos' ? pesosARS(p.pesos) : num(p.unidades)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </section>
  )
}
