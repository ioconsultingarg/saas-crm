import { useMemo, useState } from 'react'
import { Download, Percent, TriangleAlert } from 'lucide-react'
import { ETIQUETA_UNIDAD } from '../tipos-calle'
import { ARTICULOS, CATEGORIAS, LOTES_POR_VENCER, MARCAS } from '../data/calle'
import { estadoLote, estadoStock, loteMasProximo } from '../lib/calle'
import { Kpi, Panel } from '../componentes/Piezas'
import { num, pesosARS } from '../lib/formato'

const TONOS = {
  critico: { c: 'var(--critico)', f: 'var(--critico-fondo)' },
  riesgo: { c: 'var(--riesgo)', f: 'var(--riesgo-fondo)' },
  sano: { c: 'var(--sano)', f: 'var(--sano-fondo)' },
}

export function Stock() {
  const [categoria, setCategoria] = useState('')
  const [marca, setMarca] = useState('')
  const [soloProblemas, setSoloProblemas] = useState(false)
  const [ajuste, setAjuste] = useState(0)

  const filtrados = useMemo(
    () =>
      ARTICULOS.filter((a) => {
        const st = estadoStock(a)
        const lote = loteMasProximo(a)
        const problema = st.tono !== 'sano' || (lote && estadoLote(lote).tono === 'critico')
        return (
          (!categoria || a.categoria === categoria) &&
          (!marca || a.marca === marca) &&
          (!soloProblemas || problema)
        )
      }),
    [categoria, marca, soloProblemas],
  )

  const sinStock = ARTICULOS.filter((a) => a.stock === 0).length
  const bajos = ARTICULOS.filter((a) => a.stock > 0 && a.stock < 24).length
  const valorizado = ARTICULOS.reduce(
    (acc, a) => acc + a.stock * (a.presentaciones[0]?.precio ?? 0),
    0,
  )

  return (
    <div className="grid gap-4">
      <header>
        <h1 className="font-display text-titulo">Catálogo, stock y lotes</h1>
        <p className="text-tinta-suave text-cuerpo">
          <span className="cifra">{num(ARTICULOS.length)}</span> artículos ·{' '}
          <span className="cifra">{num(filtrados.length)}</span> en la vista
        </p>
      </header>

      <div className="grid gap-3 grid-cols-2 escritorio:grid-cols-4">
        <Kpi etiqueta="Stock valorizado" valor={pesosARS(valorizado)} destacado />
        <Kpi etiqueta="Sin stock" valor={num(sinStock)} nota="artículos" />
        <Kpi etiqueta="Stock bajo" valor={num(bajos)} nota="menos de 24 unidades" />
        <Kpi etiqueta="Lotes por vencer" valor={num(LOTES_POR_VENCER.length)} nota="dentro de 30 días" />
      </div>

      {LOTES_POR_VENCER.length > 0 && (
        <Panel titulo="Vencimientos próximos">
          <ul className="grid gap-2">
            {LOTES_POR_VENCER.map(({ articulo, lote }) => {
              const e = estadoLote(lote)
              return (
                <li key={lote.codigo} className="flex flex-wrap items-center gap-2" style={{ borderTop: '1px solid var(--pauta)', paddingTop: 8 }}>
                  <TriangleAlert size={16} strokeWidth={1.5} aria-hidden="true" style={{ color: TONOS[e.tono].c }} className="shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-cuerpo truncate">{articulo.nombre}</span>
                    <span className="block text-micro text-tinta-suave font-mono">
                      Lote {lote.codigo} · {num(lote.cantidad)} unidades
                    </span>
                  </span>
                  <span className="text-micro font-semibold rounded-sm px-2 py-0.5 shrink-0" style={{ color: TONOS[e.tono].c, background: TONOS[e.tono].f }}>
                    {e.texto}
                  </span>
                </li>
              )
            })}
          </ul>
          <p className="text-micro text-tinta-suave mt-3">
            Trazabilidad por lote: imprescindible en droguería y alimentos.
          </p>
        </Panel>
      )}

      <Panel
        titulo="Actualización masiva de precios"
        accion={
          <button type="button" className="boton boton-secundario">
            <Download size={16} strokeWidth={1.5} aria-hidden="true" />
            Exportar lista
          </button>
        }
      >
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="encabezado-columna block" htmlFor="aj">Ajuste a aplicar</label>
            <div className="flex items-center gap-2">
              <input
                id="aj" type="number" className="campo" style={{ width: 110 }}
                value={ajuste} onChange={(e) => setAjuste(Number(e.target.value))}
                inputMode="decimal" step="0.5"
              />
              <Percent size={16} strokeWidth={1.5} aria-hidden="true" className="text-tinta-suave" />
            </div>
          </div>
          <p className="text-micro text-tinta-suave flex-1" style={{ minWidth: 200 }}>
            Se aplicaría a <span className="cifra">{num(filtrados.length)}</span> artículos de la vista
            actual. En la demo la previsualización se muestra pero no se guarda.
          </p>
          <button type="button" className="boton boton-primario" disabled={ajuste === 0}>
            Previsualizar
          </button>
        </div>
      </Panel>

      <div className="flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="cat">Categoría</label>
        <select id="cat" className="campo" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          <option value="">Todas las categorías</option>
          {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <label className="sr-only" htmlFor="mar">Marca</label>
        <select id="mar" className="campo" value={marca} onChange={(e) => setMarca(e.target.value)}>
          <option value="">Todas las marcas</option>
          {MARCAS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <button
          type="button" aria-pressed={soloProblemas} onClick={() => setSoloProblemas(!soloProblemas)}
          className="boton boton-secundario"
          style={soloProblemas ? { borderColor: 'var(--marca)', color: 'var(--marca)' } : undefined}
        >
          Sólo con problemas
        </button>
      </div>

      <div className="panel overflow-x-auto">
        <table className="w-full text-dato" style={{ minWidth: 860 }}>
          <caption className="sr-only">Catálogo con stock y lotes</caption>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--pauta)' }}>
              <th scope="col" className="text-left p-2 encabezado-columna">Artículo</th>
              <th scope="col" className="text-left p-2 encabezado-columna">Código</th>
              <th scope="col" className="text-left p-2 encabezado-columna">Presentaciones</th>
              <th scope="col" className="text-right p-2 encabezado-columna">Stock</th>
              <th scope="col" className="text-left p-2 encabezado-columna">Lote próximo</th>
              <th scope="col" className="text-right p-2 encabezado-columna">IVA</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((a) => {
              const st = estadoStock(a)
              const lote = loteMasProximo(a)
              const el = lote ? estadoLote(lote) : null
              return (
                <tr key={a.id} style={{ borderBottom: '1px solid var(--pauta)' }} className="hover:bg-papel">
                  <td className="p-2">
                    <span className="block font-semibold truncate">{a.nombre}</span>
                    <span className="block text-micro text-tinta-suave">{a.marca} · {a.categoria}</span>
                  </td>
                  <td className="p-2 font-mono text-micro">{a.codigo}</td>
                  <td className="p-2 text-micro text-tinta-suave">
                    {a.presentaciones.map((p) => `${ETIQUETA_UNIDAD[p.unidad]} ${pesosARS(p.precio)}`).join(' · ')}
                  </td>
                  <td className="p-2 text-right">
                    <span className="text-micro font-semibold rounded-sm px-1.5 py-0.5" style={{ color: TONOS[st.tono].c, background: TONOS[st.tono].f }}>
                      {st.texto}
                    </span>
                  </td>
                  <td className="p-2">
                    {lote && el ? (
                      <span className="text-micro" style={{ color: el.tono === 'sano' ? 'var(--tinta-suave)' : TONOS[el.tono].c }}>
                        <span className="font-mono">{lote.codigo}</span> · {el.texto}
                      </span>
                    ) : (
                      <span className="text-micro text-tinta-suave">Sin trazabilidad</span>
                    )}
                  </td>
                  <td className="p-2 text-right cifra">{a.iva}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
