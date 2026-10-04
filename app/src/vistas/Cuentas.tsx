import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { CUENTAS } from '../data/calle'
import { EMPRESAS, empresaDe } from '../data/crm'
import { Barra, Kpi, Panel } from '../componentes/Piezas'
import { num, pct, pesosARS } from '../lib/formato'

const TONO = {
  rojo: { c: 'var(--critico)', f: 'var(--critico-fondo)', t: 'Bloqueado' },
  amarillo: { c: 'var(--riesgo)', f: 'var(--riesgo-fondo)', t: 'Cerca del límite' },
  verde: { c: 'var(--sano)', f: 'var(--sano-fondo)', t: 'Al día' },
}

export function Cuentas({ abrirEmpresa }: { abrirEmpresa: (id: string) => void }) {
  const [q, setQ] = useState('')
  const [semaforo, setSemaforo] = useState('')

  const filtradas = useMemo(() => {
    const t = q.trim().toLowerCase()
    return CUENTAS.filter((c) => {
      const e = empresaDe(c.empresaId)
      return (
        (!t || e?.razonSocial.toLowerCase().includes(t)) &&
        (!semaforo || c.semaforo === semaforo)
      )
    }).sort((a, b) => b.vencido - a.vencido || b.saldo - a.saldo)
  }, [q, semaforo])

  const totalVencido = CUENTAS.reduce((a, c) => a + c.vencido, 0)
  const totalSaldo = CUENTAS.reduce((a, c) => a + c.saldo, 0)
  const bloqueadas = CUENTAS.filter((c) => c.semaforo === 'rojo').length
  const expuesto = CUENTAS.reduce((a, c) => a + Math.max(0, c.saldo - c.limiteCredito), 0)

  return (
    <div className="grid gap-4">
      <header>
        <h1 className="font-display text-titulo">Clientes y cuentas corrientes</h1>
        <p className="text-tinta-suave text-cuerpo">
          Límites de crédito, plazos y listas de precios de {num(EMPRESAS.length)} cuentas.
        </p>
      </header>

      <div className="grid gap-3 grid-cols-2 escritorio:grid-cols-4">
        <Kpi etiqueta="Saldo total" valor={pesosARS(totalSaldo)} destacado />
        <Kpi etiqueta="Vencido" valor={pesosARS(totalVencido)} nota="deuda exigible" />
        <Kpi etiqueta="Cuentas bloqueadas" valor={num(bloqueadas)} nota="no pueden comprar" />
        <Kpi etiqueta="Por encima del límite" valor={pesosARS(expuesto)} nota="exceso otorgado" />
      </div>

      <Panel titulo="Composición de la cartera">
        <ul className="grid gap-3">
          {(['verde', 'amarillo', 'rojo'] as const).map((s) => {
            const cuantas = CUENTAS.filter((c) => c.semaforo === s).length
            return (
              <li key={s} className="grid gap-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-cuerpo font-semibold" style={{ color: TONO[s].c }}>{TONO[s].t}</span>
                  <span className="text-micro text-tinta-suave">
                    <span className="cifra">{num(cuantas)}</span> cuentas · {pct(cuantas / CUENTAS.length)}
                  </span>
                </div>
                <Barra valor={cuantas} maximo={CUENTAS.length} color={TONO[s].c} />
              </li>
            )
          })}
        </ul>
      </Panel>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1" style={{ minWidth: 200 }}>
          <Search size={16} strokeWidth={1.5} aria-hidden="true" className="absolute left-2 top-1/2 -translate-y-1/2 text-tinta-suave" />
          <label className="sr-only" htmlFor="qc">Buscar cuenta</label>
          <input id="qc" type="search" className="campo w-full" style={{ paddingLeft: 30 }}
            placeholder="Buscar comercio…" value={q} onChange={(e) => setQ(e.target.value)}
            autoComplete="off" spellCheck={false} />
        </div>
        <label className="sr-only" htmlFor="sem">Estado</label>
        <select id="sem" className="campo" value={semaforo} onChange={(e) => setSemaforo(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="verde">Al día</option>
          <option value="amarillo">Cerca del límite</option>
          <option value="rojo">Bloqueado</option>
        </select>
      </div>

      <div className="panel overflow-x-auto">
        <table className="w-full text-dato" style={{ minWidth: 860 }}>
          <caption className="sr-only">Cuentas corrientes</caption>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--pauta)' }}>
              <th scope="col" className="text-left p-2 encabezado-columna">Comercio</th>
              <th scope="col" className="text-right p-2 encabezado-columna">Límite</th>
              <th scope="col" className="text-right p-2 encabezado-columna">Saldo</th>
              <th scope="col" className="text-right p-2 encabezado-columna">Disponible</th>
              <th scope="col" className="text-right p-2 encabezado-columna">Vencido</th>
              <th scope="col" className="text-left p-2 encabezado-columna">Plazo</th>
              <th scope="col" className="text-left p-2 encabezado-columna">Lista</th>
              <th scope="col" className="text-left p-2 encabezado-columna">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((c) => {
              const e = empresaDe(c.empresaId)
              const disp = c.limiteCredito - c.saldo
              return (
                <tr key={c.empresaId} style={{ borderBottom: '1px solid var(--pauta)' }} className="hover:bg-papel">
                  <td className="p-2">
                    <button type="button" className="text-left font-semibold hover:underline" onClick={() => abrirEmpresa(c.empresaId)}>
                      {e?.razonSocial}
                    </button>
                    <span className="block text-micro text-tinta-suave">{e?.zona}</span>
                  </td>
                  <td className="p-2 text-right cifra">{pesosARS(c.limiteCredito)}</td>
                  <td className="p-2 text-right cifra">{pesosARS(c.saldo)}</td>
                  <td className="p-2 text-right cifra" style={{ color: disp < 0 ? 'var(--critico)' : undefined }}>
                    {pesosARS(disp)}
                  </td>
                  <td className="p-2 text-right cifra" style={{ color: c.vencido > 0 ? 'var(--critico)' : 'var(--tinta-suave)' }}>
                    {c.vencido > 0 ? pesosARS(c.vencido) : '—'}
                  </td>
                  <td className="p-2 text-tinta-suave">{c.diasPlazo === 0 ? 'Contado' : `${c.diasPlazo} días`}</td>
                  <td className="p-2 text-tinta-suave truncate">{c.listaPrecios}</td>
                  <td className="p-2">
                    <span className="text-micro font-semibold rounded-sm px-2 py-0.5 whitespace-nowrap"
                      style={{ color: TONO[c.semaforo].c, background: TONO[c.semaforo].f }}>
                      {TONO[c.semaforo].t}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
