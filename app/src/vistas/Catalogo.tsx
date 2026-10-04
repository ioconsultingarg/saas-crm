import { useMemo, useState } from 'react'
import { Minus, Plus, Search, ShoppingCart, Tag, TriangleAlert, X } from 'lucide-react'
import type { Articulo, UnidadLogistica } from '../tipos-calle'
import { ETIQUETA_UNIDAD } from '../tipos-calle'
import { ARTICULOS, CATEGORIAS, MARCAS } from '../data/calle'
import { empresaDe } from '../data/crm'
import { estadoLote, estadoStock, loteMasProximo, sugeridosPara } from '../lib/calle'
import { num, pesosARS } from '../lib/formato'
import type { Carrito } from '../hooks/useCalle'

const TONOS = {
  critico: { c: 'var(--critico)', f: 'var(--critico-fondo)' },
  riesgo: { c: 'var(--riesgo)', f: 'var(--riesgo-fondo)' },
  sano: { c: 'var(--sano)', f: 'var(--sano-fondo)' },
}

interface Props {
  carrito: Carrito | null
  agregar: (articuloId: string, unidad: UnidadLogistica, cantidad?: number) => void
  irAlCarrito: () => void
}

export function Catalogo({ carrito, agregar, irAlCarrito }: Props) {
  const [q, setQ] = useState('')
  const [categoria, setCategoria] = useState('')
  const [marca, setMarca] = useState('')
  const [soloOfertas, setSoloOfertas] = useState(false)
  const [abierto, setAbierto] = useState<Articulo | null>(null)
  const [unidad, setUnidad] = useState<UnidadLogistica>('bulto')
  const [cantidad, setCantidad] = useState(1)

  const sugeridos = useMemo(
    () => (carrito ? sugeridosPara(carrito.empresaId).map((s) => s.articulo.id) : []),
    [carrito],
  )

  const filtrados = useMemo(() => {
    const t = q.trim().toLowerCase()
    return ARTICULOS.filter(
      (a) =>
        (!t || a.nombre.toLowerCase().includes(t) || a.codigo.toLowerCase().includes(t) || a.ean.includes(t)) &&
        (!categoria || a.categoria === categoria) &&
        (!marca || a.marca === marca) &&
        (!soloOfertas || a.enOferta),
    )
  }, [q, categoria, marca, soloOfertas])

  const enCarrito = carrito?.lineas.reduce((a, l) => a + l.cantidad, 0) ?? 0

  const abrir = (a: Articulo) => {
    setAbierto(a)
    setUnidad('bulto')
    setCantidad(1)
  }

  return (
    <div className="grid gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-titulo">Catálogo</h1>
          <p className="text-tinta-suave text-cuerpo">
            {carrito ? empresaDe(carrito.empresaId)?.razonSocial : 'Sin pedido abierto'} ·{' '}
            <span className="cifra">{num(filtrados.length)}</span> artículos
          </p>
        </div>
        {carrito && (
          <button type="button" className="boton boton-primario" onClick={irAlCarrito}>
            <ShoppingCart size={18} strokeWidth={1.5} aria-hidden="true" />
            Ver pedido ({num(enCarrito)})
          </button>
        )}
      </header>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1" style={{ minWidth: 200 }}>
          <Search size={16} strokeWidth={1.5} aria-hidden="true" className="absolute left-2 top-1/2 -translate-y-1/2 text-tinta-suave" />
          <label className="sr-only" htmlFor="bq">Buscar artículo, código o código de barras</label>
          <input
            id="bq" type="search" className="campo w-full" style={{ paddingLeft: 30 }}
            placeholder="Buscar artículo, código o EAN…"
            value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" spellCheck={false}
          />
        </div>
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
          type="button" aria-pressed={soloOfertas}
          onClick={() => setSoloOfertas(!soloOfertas)}
          className="boton boton-secundario"
          style={soloOfertas ? { borderColor: 'var(--marca)', color: 'var(--marca)' } : undefined}
        >
          <Tag size={16} strokeWidth={1.5} aria-hidden="true" />
          Ofertas
        </button>
      </div>

      <ul className="grid gap-2 tablet:grid-cols-2 escritorio:grid-cols-3">
        {filtrados.map((a) => {
          const st = estadoStock(a)
          const lote = loteMasProximo(a)
          const el = lote ? estadoLote(lote) : null
          const bulto = a.presentaciones.find((p) => p.unidad === 'bulto') ?? a.presentaciones[0]
          return (
            <li key={a.id}>
              <article className="panel p-3 grid gap-2 h-full">
                <div className="flex items-start gap-2">
                  <h2 className="text-cuerpo font-semibold leading-tight flex-1 min-w-0">{a.nombre}</h2>
                  {a.enOferta && (
                    <span className="text-micro font-semibold rounded-sm px-1.5 py-0.5 shrink-0"
                      style={{ color: 'var(--marca)', background: 'color-mix(in srgb, var(--marca) 12%, transparent)' }}>
                      Oferta
                    </span>
                  )}
                </div>
                <p className="text-micro text-tinta-suave">{a.marca} · {a.categoria} · <span className="font-mono">{a.codigo}</span></p>

                <p className="cifra font-semibold" style={{ fontSize: 16 }}>
                  {pesosARS(bulto.precio)}
                  <span className="text-micro text-tinta-suave font-normal"> / {ETIQUETA_UNIDAD[bulto.unidad].toLowerCase()}</span>
                </p>

                <div className="flex flex-wrap gap-1">
                  <span className="text-micro font-semibold rounded-sm px-1.5 py-0.5"
                    style={{ color: TONOS[st.tono].c, background: TONOS[st.tono].f }}>
                    {st.texto}
                  </span>
                  {el && el.tono !== 'sano' && (
                    <span className="text-micro font-semibold rounded-sm px-1.5 py-0.5 inline-flex items-center gap-1"
                      style={{ color: TONOS[el.tono].c, background: TONOS[el.tono].f }}>
                      <TriangleAlert size={11} strokeWidth={2} aria-hidden="true" />
                      Lote {el.texto.toLowerCase()}
                    </span>
                  )}
                  {sugeridos.includes(a.id) && (
                    <span className="text-micro font-semibold rounded-sm px-1.5 py-0.5"
                      style={{ color: 'var(--sano)', background: 'var(--sano-fondo)' }}>
                      Sugerido
                    </span>
                  )}
                </div>

                <button
                  type="button" className="boton boton-secundario mt-auto" style={{ minHeight: 44 }}
                  onClick={() => abrir(a)}
                  disabled={a.stock === 0}
                >
                  {a.stock === 0 ? 'Sin stock' : 'Ver y agregar'}
                </button>
              </article>
            </li>
          )
        })}
      </ul>

      {/* Detalle del artículo */}
      {abierto && (
        <div className="fixed inset-0 z-50 flex items-end tablet:items-center tablet:justify-center" style={{ overscrollBehavior: 'contain' }}>
          <button type="button" aria-label="Cerrar" className="absolute inset-0" style={{ background: 'rgba(0,0,0,.45)' }} onClick={() => setAbierto(null)} />
          <div className="relative w-full inset-abajo p-2 tablet:p-0" style={{ maxWidth: 480 }}>
            <div className="panel shadow-panel p-4 grid gap-3" role="dialog" aria-label={abierto.nombre}>
              <div className="flex items-start gap-2">
                <h2 className="text-subtitulo font-semibold flex-1">{abierto.nombre}</h2>
                <button type="button" className="boton boton-sutil" onClick={() => setAbierto(null)} aria-label="Cerrar">
                  <X size={20} strokeWidth={1.5} aria-hidden="true" />
                </button>
              </div>

              <p className="text-micro text-tinta-suave">
                {abierto.marca} · {abierto.categoria} · <span className="font-mono">{abierto.codigo}</span> · EAN{' '}
                <span className="font-mono">{abierto.ean}</span> · IVA {abierto.iva}%
              </p>

              {abierto.lotes && (
                <div>
                  <p className="encabezado-columna">Lotes</p>
                  <ul className="grid gap-1">
                    {abierto.lotes.map((l) => {
                      const e = estadoLote(l)
                      return (
                        <li key={l.codigo} className="flex items-center justify-between gap-2 text-micro">
                          <span className="font-mono">{l.codigo}</span>
                          <span className="cifra text-tinta-suave">{num(l.cantidad)} u.</span>
                          <span className="font-semibold" style={{ color: TONOS[e.tono].c }}>{e.texto}</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}

              <fieldset>
                <legend className="encabezado-columna mb-1">Unidad</legend>
                <div className="grid grid-cols-3 gap-1">
                  {abierto.presentaciones.map((p) => (
                    <button
                      key={p.unidad} type="button" aria-pressed={unidad === p.unidad}
                      onClick={() => setUnidad(p.unidad)}
                      className="rounded border px-2 py-2 text-center"
                      style={{
                        minHeight: 56,
                        borderColor: unidad === p.unidad ? 'var(--marca)' : 'var(--borde-control)',
                        background: unidad === p.unidad ? 'color-mix(in srgb, var(--marca) 8%, transparent)' : 'transparent',
                      }}
                    >
                      <span className="block text-cuerpo font-semibold">{ETIQUETA_UNIDAD[p.unidad]}</span>
                      <span className="block text-micro text-tinta-suave cifra">{pesosARS(p.precio)}</span>
                      <span className="block text-micro text-tinta-suave">×{p.equivale}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="flex items-center gap-2">
                <span className="encabezado-columna flex-1">Cantidad</span>
                <button type="button" className="boton boton-secundario" style={{ minWidth: 48 }} onClick={() => setCantidad(Math.max(1, cantidad - 1))} aria-label="Restar uno">
                  <Minus size={18} strokeWidth={1.5} aria-hidden="true" />
                </button>
                <span className="cifra text-subtitulo font-semibold w-10 text-center">{cantidad}</span>
                <button type="button" className="boton boton-secundario" style={{ minWidth: 48 }} onClick={() => setCantidad(cantidad + 1)} aria-label="Sumar uno">
                  <Plus size={18} strokeWidth={1.5} aria-hidden="true" />
                </button>
              </div>

              <button
                type="button" className="boton boton-primario" style={{ minHeight: 48 }}
                disabled={!carrito}
                onClick={() => { agregar(abierto.id, unidad, cantidad); setAbierto(null) }}
              >
                <ShoppingCart size={18} strokeWidth={1.5} aria-hidden="true" />
                {carrito ? 'Agregar al pedido' : 'Abrí un pedido desde la ruta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
