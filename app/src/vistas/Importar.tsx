import { useRef, useState } from 'react'
import { AlertTriangle, FileUp, Info } from 'lucide-react'
import {
  analizarFilas,
  detectarColumnas,
  parsearCSV,
  type Columna,
  type Informe,
  type Mapeo,
} from '../lib/csv'
import { num, pesosARS } from '../lib/formato'

const COLUMNAS: Columna[] = ['fecha', 'cliente', 'comprobante', 'articulo', 'cantidad', 'importe']

type Etapa = 'vacio' | 'revisando' | 'listo'

export function Importar() {
  const [etapa, setEtapa] = useState<Etapa>('vacio')
  const [nombre, setNombre] = useState('')
  const [encabezados, setEncabezados] = useState<string[]>([])
  const [filas, setFilas] = useState<Record<string, string>[]>([])
  const [mapeo, setMapeo] = useState<Mapeo>({})
  const [informe, setInforme] = useState<Informe | null>(null)
  const [error, setError] = useState('')
  const [arrastrando, setArrastrando] = useState(false)
  const entrada = useRef<HTMLInputElement>(null)

  const procesarTexto = (texto: string, archivo: string) => {
    setError('')
    const { encabezados: h, filas: f } = parsearCSV(texto)
    if (h.length === 0 || f.length === 0) {
      setError('No pude leer filas en ese archivo. ¿Está separado por comas o punto y coma?')
      return
    }
    setNombre(archivo)
    setEncabezados(h)
    setFilas(f)
    setMapeo(detectarColumnas(h))
    setEtapa('revisando')
    setInforme(null)
  }

  const tomarArchivo = async (file: File) => {
    if (!/\.(csv|txt)$/i.test(file.name)) {
      setError('Por ahora la demo acepta CSV. El Excel y el PDF escaneado llegan en la versión completa.')
      return
    }
    procesarTexto(await file.text(), file.name)
  }

  const usarEjemplo = async () => {
    const r = await fetch(`${import.meta.env.BASE_URL}ejemplo-ventas.csv`)
    procesarTexto(await r.text(), 'ejemplo-ventas.csv')
  }

  const confirmar = () => {
    setInforme(analizarFilas(filas, mapeo))
    setEtapa('listo')
  }

  const vistaPrevia = etapa !== 'vacio' ? analizarFilas(filas.slice(0, 10), mapeo).muestra : []

  return (
    <div className="grid gap-4">
      <header>
        <h1 className="font-display text-titulo">Importar ventas</h1>
        <p className="text-tinta-suave text-cuerpo">
          Subí el archivo tal como lo exporta tu sistema. No hace falta prepararlo.
        </p>
      </header>

      <p
        className="panel p-3 text-cuerpo flex items-start gap-2"
        style={{ background: 'var(--riesgo-fondo)', color: 'var(--riesgo)' }}
      >
        <Info size={18} strokeWidth={1.5} aria-hidden="true" className="shrink-0 mt-0.5" />
        Demo: los datos importados se analizan en tu navegador y no modifican la cartera de ejemplo.
      </p>

      {etapa === 'vacio' && (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setArrastrando(true) }}
            onDragLeave={() => setArrastrando(false)}
            onDrop={(e) => {
              e.preventDefault()
              setArrastrando(false)
              const f = e.dataTransfer.files[0]
              if (f) void tomarArchivo(f)
            }}
            className="rounded-md p-6 text-center grid gap-3 justify-items-center"
            style={{
              border: `2px dashed ${arrastrando ? 'var(--marca)' : 'var(--borde-control)'}`,
              background: 'var(--superficie)',
              transition: 'border-color var(--mov-corto) var(--curva)',
            }}
          >
            <FileUp size={32} strokeWidth={1.5} aria-hidden="true" style={{ color: 'var(--tinta-suave)' }} />
            <p className="text-cuerpo">Arrastrá acá el CSV de ventas</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <button type="button" className="boton boton-primario" onClick={() => entrada.current?.click()}>
                Elegir archivo
              </button>
              <button type="button" className="boton boton-secundario" onClick={usarEjemplo}>
                Usar el archivo de ejemplo
              </button>
            </div>
            <label className="sr-only" htmlFor="archivo">Archivo CSV de ventas</label>
            <input
              id="archivo"
              ref={entrada}
              type="file"
              accept=".csv,text/csv"
              className="sr-only"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void tomarArchivo(f) }}
            />
          </div>
          {error && (
            <p role="alert" className="text-cuerpo" style={{ color: 'var(--critico)' }}>
              {error}
            </p>
          )}
        </>
      )}

      {etapa !== 'vacio' && (
        <section className="panel p-4 grid gap-3">
          <h2 className="text-subtitulo font-semibold">
            {nombre} · <span className="cifra">{num(filas.length)}</span> filas
          </h2>

          <div className="grid gap-2 tablet:grid-cols-3">
            {COLUMNAS.map((col) => (
              <div key={col}>
                <label className="encabezado-columna block" htmlFor={`map-${col}`}>
                  {col}
                </label>
                <select
                  id={`map-${col}`}
                  className="campo w-full"
                  value={mapeo[col] ?? ''}
                  onChange={(e) => setMapeo({ ...mapeo, [col]: e.target.value || undefined })}
                >
                  <option value="">(sin asignar)</option>
                  {encabezados.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-dato" style={{ minWidth: 620 }}>
              <caption className="sr-only">Primeras filas: crudo e interpretado</caption>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--pauta)' }}>
                  <th scope="col" className="text-left p-2 encabezado-columna">Tal como vino</th>
                  <th scope="col" className="text-left p-2 encabezado-columna">Interpretado</th>
                </tr>
              </thead>
              <tbody>
                {vistaPrevia.map((m, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--pauta)' }}>
                    <td className="p-2 font-mono text-micro text-tinta-suave">
                      {Object.values(m.crudo).slice(0, 6).join(' | ')}
                    </td>
                    <td className="p-2">
                      <span className="cifra">{m.interpretado.fecha}</span> ·{' '}
                      {m.interpretado.cliente} · <span className="cifra">{pesosARS(m.interpretado.importe)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {etapa === 'revisando' && (
            <div className="flex gap-2">
              <button type="button" className="boton boton-primario" onClick={confirmar}>
                Confirmar e importar
              </button>
              <button type="button" className="boton boton-secundario" onClick={() => setEtapa('vacio')}>
                Cancelar
              </button>
            </div>
          )}
        </section>
      )}

      {informe && (
        <section className="panel p-4 grid gap-3" aria-live="polite">
          <h2 className="text-subtitulo font-semibold">Salud de los datos</h2>
          <dl className="grid grid-cols-3 gap-3">
            <div><dt className="encabezado-columna">Filas leídas</dt><dd className="cifra text-cuerpo">{num(informe.filasLeidas)}</dd></div>
            <div><dt className="encabezado-columna">Filas válidas</dt><dd className="cifra text-cuerpo">{num(informe.filasValidas)}</dd></div>
            <div><dt className="encabezado-columna">Clientes distintos</dt><dd className="cifra text-cuerpo">{num(informe.clientesDistintos)}</dd></div>
          </dl>

          {informe.problemas.length === 0 ? (
            <p className="text-cuerpo" style={{ color: 'var(--sano)' }}>
              Sin problemas detectados.
            </p>
          ) : (
            <ul className="grid gap-2">
              {informe.problemas.map((p) => (
                <li
                  key={p.clase}
                  className="rounded-sm p-3 flex items-start gap-2"
                  style={{
                    background: p.gravedad === 'crítico' ? 'var(--critico-fondo)' : 'var(--riesgo-fondo)',
                    color: p.gravedad === 'crítico' ? 'var(--critico)' : 'var(--riesgo)',
                  }}
                >
                  <AlertTriangle size={18} strokeWidth={1.5} aria-hidden="true" className="shrink-0 mt-0.5" />
                  <span className="text-cuerpo">
                    <strong>{p.clase}</strong> · <span className="cifra">{num(p.cantidad)}</span>{' '}
                    {p.cantidad === 1 ? 'caso' : 'casos'}. Ejemplo: {p.ejemplo}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}
