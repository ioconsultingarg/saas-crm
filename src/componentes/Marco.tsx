import type { ReactNode } from 'react'
import { BarChart3, Download, FileText, Moon, Sun, Upload, Users } from 'lucide-react'
import type { Vista } from '../hooks/useRutaHash'
import { FECHA_ULTIMO_DATO } from '../data/seed'
import { fecha } from '../lib/formato'

const DESTINOS: { vista: Vista; texto: string; Icono: typeof Users }[] = [
  { vista: 'lista', texto: 'Lista del lunes', Icono: FileText },
  { vista: 'cartera', texto: 'Cartera', Icono: Users },
  { vista: 'parte', texto: 'Parte', Icono: BarChart3 },
  { vista: 'importar', texto: 'Importar', Icono: Upload },
]

interface Props {
  vista: Vista
  irA: (v: Vista) => void
  esOscuro: boolean
  alternarTema: () => void
  puedeInstalar: boolean
  instalar: () => void
  children: ReactNode
}

export function Marco({
  vista,
  irA,
  esOscuro,
  alternarTema,
  puedeInstalar,
  instalar,
  children,
}: Props) {
  return (
    <div className="min-h-screen escritorio:flex">
      <a className="enlace-salto" href="#contenido">
        Ir al contenido
      </a>

      {/* Navegacion lateral: riel en tablet, barra completa en escritorio */}
      <nav
        aria-label="Principal"
        className="hidden tablet:flex tablet:flex-col shrink-0 border-r border-pauta bg-superficie inset-arriba no-imprimir"
        style={{ width: 72 }}
      >
        <div className="px-3 py-4 escritorio:px-4">
          <span
            translate="no"
            className="font-display text-titulo leading-none tracking-tight"
            style={{ color: 'var(--marca)' }}
          >
            IO
          </span>
        </div>
        <ul className="flex-1 grid gap-1 px-2">
          {DESTINOS.map((d) => (
            <li key={d.vista}>
              <button
                type="button"
                onClick={() => irA(d.vista)}
                aria-current={vista === d.vista ? 'page' : undefined}
                title={d.texto}
                className="w-full grid justify-items-center gap-1 rounded py-2 text-micro"
                style={{
                  background: vista === d.vista ? 'var(--papel)' : 'transparent',
                  color: vista === d.vista ? 'var(--marca)' : 'var(--tinta-suave)',
                  minHeight: 56,
                  transition: 'color var(--mov-corto) var(--curva)',
                }}
              >
                <d.Icono size={20} strokeWidth={1.5} aria-hidden="true" />
                <span className="text-columna">{d.texto.split(' ')[0]}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-papel border-b border-pauta inset-arriba no-imprimir">
          <div className="flex items-center gap-3 px-4 escritorio:px-6" style={{ minHeight: 56 }}>
            <span
              translate="no"
              className="tablet:hidden font-display text-subtitulo"
              style={{ color: 'var(--marca)' }}
            >
              IO-CRM
            </span>
            <p className="hidden tablet:block text-micro text-tinta-suave">
              {`Último dato importado: ${fecha(FECHA_ULTIMO_DATO)}`}
            </p>
            <div className="ml-auto flex items-center gap-1">
              {puedeInstalar && (
                <button type="button" className="boton boton-secundario" onClick={instalar}>
                  <Download size={18} strokeWidth={1.5} aria-hidden="true" />
                  Instalar
                </button>
              )}
              <button
                type="button"
                className="boton boton-sutil"
                onClick={alternarTema}
                aria-label={esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {esOscuro ? (
                  <Sun size={20} strokeWidth={1.5} aria-hidden="true" />
                ) : (
                  <Moon size={20} strokeWidth={1.5} aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </header>

        <main
          id="contenido"
          className="flex-1 px-4 py-4 tablet:px-5 escritorio:px-6 escritorio:py-5"
          style={{ paddingBottom: 96 }}
        >
          <div className="mx-auto w-full" style={{ maxWidth: 1280 }}>
            {children}
          </div>
        </main>
      </div>

      {/* Barra inferior: solo en movil */}
      <nav
        aria-label="Principal"
        className="tablet:hidden fixed bottom-0 inset-x-0 z-40 bg-superficie border-t border-pauta inset-abajo no-imprimir"
      >
        <ul className="grid grid-cols-4">
          {DESTINOS.map((d) => (
            <li key={d.vista}>
              <button
                type="button"
                onClick={() => irA(d.vista)}
                aria-current={vista === d.vista ? 'page' : undefined}
                className="w-full grid justify-items-center gap-1 py-2"
                style={{
                  minHeight: 56,
                  color: vista === d.vista ? 'var(--marca)' : 'var(--tinta-suave)',
                }}
              >
                <d.Icono size={22} strokeWidth={1.5} aria-hidden="true" />
                <span className="text-columna">{d.texto.split(' ')[0]}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
