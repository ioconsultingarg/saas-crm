import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import type { ClienteAnalizado, Segmento } from '../tipos'
import { EtiquetaSegmento } from '../componentes/EtiquetaEstado'
import { contarSegmentos } from '../lib/calculos'
import { fecha, num, pesosARS } from '../lib/formato'
import { CANALES, VENDEDORES, ZONAS } from '../data/seed'

type Columna = 'razonSocial' | 'ultimaCompra' | 'cadencia' | 'factMensual' | 'segmento'
const POR_PAGINA = 50

const SEGMENTOS: Segmento[] = [
  'activo frecuente',
  'activo esporádico',
  'en riesgo',
  'nuevo',
  'dormido',
  'perdido',
]

export function Cartera({
  clientes,
  abrirCliente,
  filtroSegmento,
  alFiltrar,
}: {
  clientes: ClienteAnalizado[]
  abrirCliente: (id: string) => void
  filtroSegmento?: string
  alFiltrar: (cambio: { segmento?: string }) => void
}) {
  const [busqueda, setBusqueda] = useState('')
  const [canal, setCanal] = useState('')
  const [zona, setZona] = useState('')
  const [vendedor, setVendedor] = useState('')
  const [orden, setOrden] = useState<{ col: Columna; asc: boolean }>({
    col: 'factMensual',
    asc: false,
  })
  const [pagina, setPagina] = useState(0)

  const conteos = useMemo(() => contarSegmentos(clientes), [clientes])

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    const r = clientes.filter(
      (c) =>
        (!q || c.razonSocial.toLowerCase().includes(q)) &&
        (!canal || c.canal === canal) &&
        (!zona || c.zona === zona) &&
        (!vendedor || c.vendedor === vendedor) &&
        (!filtroSegmento || c.a.segmento === filtroSegmento),
    )
    const dir = orden.asc ? 1 : -1
    return [...r].sort((a, b) => {
      switch (orden.col) {
        case 'razonSocial':
          return a.razonSocial.localeCompare(b.razonSocial, 'es') * dir
        case 'ultimaCompra':
          return a.ultimaCompra.localeCompare(b.ultimaCompra) * dir
        case 'cadencia':
          return ((a.cadencia ?? 999) - (b.cadencia ?? 999)) * dir
        case 'segmento':
          return a.a.segmento.localeCompare(b.a.segmento, 'es') * dir
        default:
          return (a.factMensual - b.factMensual) * dir
      }
    })
  }, [clientes, busqueda, canal, zona, vendedor, filtroSegmento, orden])

  const paginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA))
  const pag = Math.min(pagina, paginas - 1)
  const visibles = filtrados.slice(pag * POR_PAGINA, (pag + 1) * POR_PAGINA)

  const ordenarPor = (col: Columna) =>
    setOrden((o) => ({ col, asc: o.col === col ? !o.asc : col === 'razonSocial' }))

  const flecha = (col: Columna) => (orden.col === col ? (orden.asc ? ' ↑' : ' ↓') : '')

  const exportar = () => {
    const filas = [
      ['Razón social', 'CUIT', 'Canal', 'Zona', 'Vendedor', 'Última compra', 'Cadencia', 'Facturación mensual', 'Segmento'],
      ...filtrados.map((c) => [
        c.razonSocial, c.cuit, c.canal, c.zona, c.vendedor, c.ultimaCompra,
        String(c.cadencia ?? ''), String(c.factMensual), c.a.segmento,
      ]),
    ]
    const csv = filas.map((f) => f.map((v) => `"${v.replace(/"/g, '""')}"`).join(';')).join('\n')
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'cartera-io-crm.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <header className="mb-4">
        <h1 className="font-display text-titulo">Cartera</h1>
        <p className="text-tinta-suave text-cuerpo">
          {num(clientes.length)} clientes · {num(filtrados.length)} en la vista
        </p>
      </header>

      <div className="flex flex-wrap gap-2 mb-3 no-imprimir">
        {SEGMENTOS.map((s) => (
          <button
            key={s}
            type="button"
            aria-pressed={filtroSegmento === s}
            onClick={() => {
              alFiltrar({ segmento: filtroSegmento === s ? undefined : s })
              setPagina(0)
            }}
            className="rounded-sm px-2 py-1 text-micro border"
            style={{
              borderColor: filtroSegmento === s ? 'var(--marca)' : 'var(--borde-control)',
              color: filtroSegmento === s ? 'var(--marca)' : 'var(--tinta-suave)',
            }}
          >
            {s} · <span className="cifra">{conteos[s]}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-3 no-imprimir">
        <label className="sr-only" htmlFor="buscar">Buscar comercio</label>
        <input
          id="buscar"
          type="search"
          className="campo"
          placeholder="Buscar comercio…"
          value={busqueda}
          onChange={(e) => { setBusqueda(e.target.value); setPagina(0) }}
          autoComplete="off"
          spellCheck={false}
        />
        <label className="sr-only" htmlFor="c-canal">Canal</label>
        <select id="c-canal" className="campo" value={canal} onChange={(e) => { setCanal(e.target.value); setPagina(0) }}>
          <option value="">Todos los canales</option>
          {CANALES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <label className="sr-only" htmlFor="c-zona">Zona</label>
        <select id="c-zona" className="campo" value={zona} onChange={(e) => { setZona(e.target.value); setPagina(0) }}>
          <option value="">Todas las zonas</option>
          {ZONAS.map((z) => <option key={z} value={z}>{z}</option>)}
        </select>
        <label className="sr-only" htmlFor="c-vend">Vendedor</label>
        <select id="c-vend" className="campo" value={vendedor} onChange={(e) => { setVendedor(e.target.value); setPagina(0) }}>
          <option value="">Todos los vendedores</option>
          {VENDEDORES.map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
        <button type="button" className="boton boton-secundario" onClick={exportar}>
          <Download size={18} strokeWidth={1.5} aria-hidden="true" />
          Exportar
        </button>
      </div>

      <div className="panel overflow-x-auto">
        <table className="w-full text-dato" style={{ minWidth: 760 }}>
          <caption className="sr-only">Cartera de clientes</caption>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--pauta)' }}>
              <th scope="col" className="text-left p-2">
                <button type="button" className="encabezado-columna" onClick={() => ordenarPor('razonSocial')}>
                  Comercio{flecha('razonSocial')}
                </button>
              </th>
              <th scope="col" className="text-left p-2 encabezado-columna">Zona</th>
              <th scope="col" className="text-left p-2 encabezado-columna">Vendedor</th>
              <th scope="col" className="text-right p-2">
                <button type="button" className="encabezado-columna" onClick={() => ordenarPor('ultimaCompra')}>
                  Última compra{flecha('ultimaCompra')}
                </button>
              </th>
              <th scope="col" className="text-right p-2">
                <button type="button" className="encabezado-columna" onClick={() => ordenarPor('cadencia')}>
                  Cadencia{flecha('cadencia')}
                </button>
              </th>
              <th scope="col" className="text-right p-2">
                <button type="button" className="encabezado-columna" onClick={() => ordenarPor('factMensual')}>
                  Facturación{flecha('factMensual')}
                </button>
              </th>
              <th scope="col" className="text-left p-2">
                <button type="button" className="encabezado-columna" onClick={() => ordenarPor('segmento')}>
                  Segmento{flecha('segmento')}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {visibles.map((c) => (
              <tr
                key={c.id}
                style={{ borderBottom: '1px solid var(--pauta)' }}
                className="hover:bg-papel"
              >
                <td className="p-2">
                  <button
                    type="button"
                    className="text-left font-semibold hover:underline"
                    onClick={() => abrirCliente(c.id)}
                  >
                    {c.razonSocial}
                  </button>
                  <span className="block text-micro text-tinta-suave">{c.canal}</span>
                </td>
                <td className="p-2 text-tinta-suave">{c.zona}</td>
                <td className="p-2 text-tinta-suave">{c.vendedor}</td>
                <td className="p-2 text-right cifra">{fecha(c.ultimaCompra)}</td>
                <td className="p-2 text-right cifra">{c.cadencia ? `${c.cadencia} d` : '—'}</td>
                <td className="p-2 text-right cifra">{pesosARS(c.factMensual)}</td>
                <td className="p-2"><EtiquetaSegmento segmento={c.a.segmento} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-2 mt-3 no-imprimir">
        <p className="text-micro text-tinta-suave">
          Página {pag + 1} de {paginas}
        </p>
        <div className="flex gap-2">
          <button type="button" className="boton boton-secundario" disabled={pag === 0} onClick={() => setPagina(pag - 1)}>
            Anterior
          </button>
          <button type="button" className="boton boton-secundario" disabled={pag >= paginas - 1} onClick={() => setPagina(pag + 1)}>
            Siguiente
          </button>
        </div>
      </div>
    </>
  )
}
