import { useState, type ReactNode } from 'react'
import {
  BarChart3, Building2, CalendarCheck, Download, KanbanSquare, LayoutDashboard,
  LogOut, Menu, Moon, Settings, Sun, Upload, Users, X,
} from 'lucide-react'
import type { Vista } from '../hooks/useRutaHash'
import type { Usuario } from '../tipos-crm'
import { FECHA_ULTIMO_DATO } from '../data/seed'
import { fecha } from '../lib/formato'
import { Logo } from './Logo'

interface Destino { vista: Vista; texto: string; corto: string; Icono: typeof Users }

const COMERCIAL: Destino[] = [
  { vista: 'panel', texto: 'Panel', corto: 'Panel', Icono: LayoutDashboard },
  { vista: 'pipeline', texto: 'Pipeline', corto: 'Pipeline', Icono: KanbanSquare },
  { vista: 'empresas', texto: 'Empresas y contactos', corto: 'Empresas', Icono: Building2 },
  { vista: 'reportes', texto: 'Reportes', corto: 'Reportes', Icono: BarChart3 },
]

const RECOMPRA: Destino[] = [
  { vista: 'lista', texto: 'Lista del lunes', corto: 'Lunes', Icono: CalendarCheck },
  { vista: 'cartera', texto: 'Cartera', corto: 'Cartera', Icono: Users },
  { vista: 'parte', texto: 'Parte semanal', corto: 'Parte', Icono: Download },
  { vista: 'importar', texto: 'Importar ventas', corto: 'Importar', Icono: Upload },
]

const AJUSTES: Destino[] = [
  { vista: 'configuracion', texto: 'Configuración', corto: 'Ajustes', Icono: Settings },
]

/** Los cinco destinos de la barra inferior en móvil. */
const MOVIL: Destino[] = [COMERCIAL[0], COMERCIAL[1], COMERCIAL[2], RECOMPRA[0], COMERCIAL[3]]

interface Props {
  vista: Vista
  irA: (v: Vista) => void
  usuario: Usuario
  salir: () => void
  esOscuro: boolean
  alternarTema: () => void
  puedeInstalar: boolean
  instalar: () => void
  children: ReactNode
}

export function Marco({ vista, irA, usuario, salir, esOscuro, alternarTema, puedeInstalar, instalar, children }: Props) {
  const [cajon, setCajon] = useState(false)

  const Grupo = ({ titulo, destinos }: { titulo: string; destinos: Destino[] }) => (
    <div className="grid gap-0.5">
      <p className="encabezado-columna px-3 pt-3 pb-1" style={{ color: 'rgba(255,255,255,.45)' }}>{titulo}</p>
      {destinos.map((d) => {
        const activo = vista === d.vista
        return (
          <button
            key={d.vista}
            type="button"
            onClick={() => { irA(d.vista); setCajon(false) }}
            aria-current={activo ? 'page' : undefined}
            className="flex items-center gap-3 px-3 text-cuerpo text-left rounded mx-1"
            style={{
              minHeight: 42,
              background: activo ? 'var(--campo-activo)' : 'transparent',
              color: activo ? '#fff' : 'var(--campo-texto)',
              transition: 'background-color var(--mov-corto) var(--curva)',
            }}
          >
            <d.Icono size={18} strokeWidth={1.5} aria-hidden="true" className="shrink-0" />
            <span className="truncate">{d.texto}</span>
          </button>
        )
      })}
    </div>
  )

  const barraLateral = (
    <div className="h-full flex flex-col" style={{ background: 'var(--campo)' }}>
      <div className="px-3 py-3 flex items-center justify-between" style={{ color: 'var(--campo-texto)' }}>
        <Logo tono="claro" />
        <button type="button" className="boton boton-sutil escritorio:hidden" style={{ color: 'inherit' }} onClick={() => setCajon(false)} aria-label="Cerrar menú">
          <X size={20} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>

      <nav aria-label="Principal" className="flex-1 overflow-y-auto pb-3">
        <Grupo titulo="Comercial" destinos={COMERCIAL} />
        <Grupo titulo="Recompra" destinos={RECOMPRA} />
        <Grupo titulo="Cuenta" destinos={AJUSTES} />
      </nav>

      <div className="p-3" style={{ borderTop: '1px solid var(--campo-borde)', color: 'var(--campo-texto)' }}>
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="inline-grid place-items-center rounded-full text-micro font-semibold shrink-0"
            style={{ width: 30, height: 30, background: 'rgba(255,255,255,.14)' }}
            aria-hidden="true"
          >
            {usuario.iniciales}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-cuerpo truncate">{usuario.nombre}</span>
            <span className="block text-micro capitalize" style={{ color: 'rgba(255,255,255,.55)' }}>{usuario.rol}</span>
          </span>
          <button type="button" onClick={salir} className="boton boton-sutil" style={{ color: 'inherit' }} aria-label="Cerrar sesión">
            <LogOut size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen escritorio:flex">
      <a className="enlace-salto" href="#contenido">Ir al contenido</a>

      {/* Barra lateral fija en escritorio */}
      <aside className="hidden escritorio:block shrink-0 inset-arriba no-imprimir" style={{ width: 232 }}>
        <div className="sticky top-0 h-screen">{barraLateral}</div>
      </aside>

      {/* Cajón en móvil y tablet */}
      {cajon && (
        <div className="escritorio:hidden fixed inset-0 z-50 flex" style={{ overscrollBehavior: 'contain' }}>
          <button type="button" aria-label="Cerrar menú" className="absolute inset-0" style={{ background: 'rgba(0,0,0,.45)' }} onClick={() => setCajon(false)} />
          <div className="relative inset-arriba" style={{ width: 272, maxWidth: '86vw' }}>{barraLateral}</div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-papel inset-arriba no-imprimir" style={{ borderBottom: '1px solid var(--pauta)' }}>
          <div className="flex items-center gap-2 px-4 escritorio:px-5" style={{ minHeight: 56 }}>
            <button type="button" className="boton boton-sutil escritorio:hidden" onClick={() => setCajon(true)} aria-label="Abrir menú">
              <Menu size={22} strokeWidth={1.5} aria-hidden="true" />
            </button>
            <span className="escritorio:hidden"><Logo compacto /></span>
            <p className="hidden escritorio:block text-micro text-tinta-suave">
              Último dato importado: {fecha(FECHA_ULTIMO_DATO)}
            </p>
            <div className="ml-auto flex items-center gap-1">
              {puedeInstalar && (
                <button type="button" className="boton boton-secundario" onClick={instalar}>
                  <Download size={18} strokeWidth={1.5} aria-hidden="true" />
                  <span className="hidden tablet:inline">Instalar</span>
                </button>
              )}
              <button type="button" className="boton boton-sutil" onClick={alternarTema} aria-label={esOscuro ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}>
                {esOscuro ? <Sun size={20} strokeWidth={1.5} aria-hidden="true" /> : <Moon size={20} strokeWidth={1.5} aria-hidden="true" />}
              </button>
            </div>
          </div>
        </header>

        <main id="contenido" className="flex-1 px-4 py-4 escritorio:px-5" style={{ paddingBottom: 96 }}>
          <div className="mx-auto w-full" style={{ maxWidth: 1360 }}>{children}</div>
        </main>
      </div>

      {/* Barra inferior: sólo móvil, cinco destinos como máximo */}
      <nav aria-label="Accesos rápidos" className="escritorio:hidden fixed bottom-0 inset-x-0 z-40 bg-superficie inset-abajo no-imprimir" style={{ borderTop: '1px solid var(--pauta)' }}>
        <ul className="grid grid-cols-5">
          {MOVIL.map((d) => {
            const activo = vista === d.vista
            return (
              <li key={d.vista}>
                <button
                  type="button"
                  onClick={() => irA(d.vista)}
                  aria-current={activo ? 'page' : undefined}
                  className="w-full grid justify-items-center gap-1 py-2"
                  style={{ minHeight: 56, color: activo ? 'var(--marca)' : 'var(--tinta-suave)' }}
                >
                  <d.Icono size={20} strokeWidth={1.5} aria-hidden="true" />
                  <span className="text-columna">{d.corto}</span>
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
