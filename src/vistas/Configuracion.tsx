import { useState } from 'react'
import { Check, Plug, ShieldCheck, Workflow } from 'lucide-react'
import type { RolUsuario } from '../tipos-crm'
import { INTEGRACIONES, REGLAS, USUARIOS } from '../data/crm'
import { Avatar, Panel } from '../componentes/Piezas'

const PERMISOS: { nombre: string; roles: Record<RolUsuario, boolean> }[] = [
  { nombre: 'Ver todo el pipeline', roles: { administrador: true, supervisor: true, vendedor: false } },
  { nombre: 'Mover oportunidades propias', roles: { administrador: true, supervisor: true, vendedor: true } },
  { nombre: 'Editar listas de precios', roles: { administrador: true, supervisor: false, vendedor: false } },
  { nombre: 'Ver reportes del equipo', roles: { administrador: true, supervisor: true, vendedor: false } },
  { nombre: 'Importar ventas del sistema', roles: { administrador: true, supervisor: false, vendedor: false } },
  { nombre: 'Gestionar usuarios e integraciones', roles: { administrador: true, supervisor: false, vendedor: false } },
]

const ROLES: RolUsuario[] = ['administrador', 'supervisor', 'vendedor']

export function Configuracion() {
  const [integraciones, setIntegraciones] = useState(INTEGRACIONES)
  const [reglas, setReglas] = useState(REGLAS)

  return (
    <div className="grid gap-4">
      <header>
        <h1 className="font-display text-titulo">Configuración</h1>
        <p className="text-tinta-suave text-cuerpo">Usuarios, permisos, integraciones y automatizaciones.</p>
      </header>

      <Panel titulo="Usuarios">
        <div className="overflow-x-auto">
          <table className="w-full text-dato" style={{ minWidth: 620 }}>
            <caption className="sr-only">Usuarios de la cuenta</caption>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--pauta)' }}>
                <th scope="col" className="text-left p-2 encabezado-columna">Usuario</th>
                <th scope="col" className="text-left p-2 encabezado-columna">Correo</th>
                <th scope="col" className="text-left p-2 encabezado-columna">Rol</th>
                <th scope="col" className="text-left p-2 encabezado-columna">Zona</th>
                <th scope="col" className="text-left p-2 encabezado-columna">Estado</th>
              </tr>
            </thead>
            <tbody>
              {USUARIOS.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--pauta)' }}>
                  <td className="p-2">
                    <span className="flex items-center gap-2">
                      <Avatar iniciales={u.iniciales} />
                      <span className="font-semibold truncate">{u.nombre}</span>
                    </span>
                  </td>
                  <td className="p-2 text-tinta-suave truncate">{u.email}</td>
                  <td className="p-2 capitalize">{u.rol}</td>
                  <td className="p-2 text-tinta-suave">{u.zona ?? '—'}</td>
                  <td className="p-2">
                    <span
                      className="inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-micro font-semibold"
                      style={{
                        color: u.activo ? 'var(--sano)' : 'var(--tinta-suave)',
                        background: u.activo ? 'var(--sano-fondo)' : 'var(--papel)',
                      }}
                    >
                      <span aria-hidden="true" style={{ width: 6, height: 6, borderRadius: 99, background: 'currentColor' }} />
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel titulo="Permisos por rol">
        <div className="overflow-x-auto">
          <table className="w-full text-dato" style={{ minWidth: 560 }}>
            <caption className="sr-only">Permisos por rol</caption>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--pauta)' }}>
                <th scope="col" className="text-left p-2 encabezado-columna">Permiso</th>
                {ROLES.map((r) => (
                  <th key={r} scope="col" className="text-center p-2 encabezado-columna">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISOS.map((p) => (
                <tr key={p.nombre} style={{ borderBottom: '1px solid var(--pauta)' }}>
                  <td className="p-2">{p.nombre}</td>
                  {ROLES.map((r) => (
                    <td key={r} className="p-2 text-center">
                      {p.roles[r] ? (
                        <>
                          <Check size={16} strokeWidth={2} aria-hidden="true" style={{ color: 'var(--sano)', display: 'inline' }} />
                          <span className="sr-only">Permitido</span>
                        </>
                      ) : (
                        <>
                          <span aria-hidden="true" className="text-tinta-suave">—</span>
                          <span className="sr-only">No permitido</span>
                        </>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-micro text-tinta-suave mt-3 flex items-start gap-2">
          <ShieldCheck size={14} strokeWidth={1.5} aria-hidden="true" className="shrink-0 mt-0.5" />
          El vendedor siempre ve sus propios números completos. No existe permiso para ver la
          ubicación ni los horarios de otra persona: el producto no los registra.
        </p>
      </Panel>

      <Panel titulo="Integraciones">
        <ul className="grid gap-2 tablet:grid-cols-2">
          {integraciones.map((i) => (
            <li key={i.id} className="rounded p-3 flex items-start gap-3" style={{ border: '1px solid var(--pauta)' }}>
              <Plug size={18} strokeWidth={1.5} aria-hidden="true" className="shrink-0 mt-1 text-tinta-suave" />
              <div className="min-w-0 flex-1">
                <p className="text-cuerpo font-semibold">{i.nombre}</p>
                <p className="text-micro text-tinta-suave">{i.descripcion}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={i.conectada}
                aria-label={`${i.conectada ? 'Desconectar' : 'Conectar'} ${i.nombre}`}
                onClick={() =>
                  setIntegraciones((xs) => xs.map((x) => (x.id === i.id ? { ...x, conectada: !x.conectada } : x)))
                }
                className="shrink-0 rounded-full relative"
                style={{
                  width: 44,
                  height: 26,
                  background: i.conectada ? 'var(--marca)' : 'var(--borde-control)',
                  transition: 'background-color var(--mov-corto) var(--curva)',
                }}
              >
                <span
                  aria-hidden="true"
                  className="absolute rounded-full"
                  style={{
                    width: 20,
                    height: 20,
                    top: 3,
                    left: i.conectada ? 21 : 3,
                    background: 'var(--superficie)',
                    transition: 'left var(--mov-corto) var(--curva)',
                  }}
                />
              </button>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel titulo="Automatizaciones">
        <ul className="grid gap-2">
          {reglas.map((r) => (
            <li key={r.id} className="rounded p-3 flex items-start gap-3" style={{ border: '1px solid var(--pauta)' }}>
              <Workflow size={18} strokeWidth={1.5} aria-hidden="true" className="shrink-0 mt-1 text-tinta-suave" />
              <div className="min-w-0 flex-1">
                <p className="text-cuerpo">
                  <span className="encabezado-columna">cuando</span> {r.cuando}
                </p>
                <p className="text-cuerpo">
                  <span className="encabezado-columna">entonces</span> {r.entonces}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={r.activa}
                aria-label={`${r.activa ? 'Desactivar' : 'Activar'} la regla`}
                onClick={() => setReglas((xs) => xs.map((x) => (x.id === r.id ? { ...x, activa: !x.activa } : x)))}
                className="shrink-0 rounded-full relative"
                style={{
                  width: 44,
                  height: 26,
                  background: r.activa ? 'var(--marca)' : 'var(--borde-control)',
                  transition: 'background-color var(--mov-corto) var(--curva)',
                }}
              >
                <span
                  aria-hidden="true"
                  className="absolute rounded-full"
                  style={{
                    width: 20,
                    height: 20,
                    top: 3,
                    left: r.activa ? 21 : 3,
                    background: 'var(--superficie)',
                    transition: 'left var(--mov-corto) var(--curva)',
                  }}
                />
              </button>
            </li>
          ))}
        </ul>
        <p className="text-micro text-tinta-suave mt-3">
          En la demo los interruptores cambian de estado pero no ejecutan nada.
        </p>
      </Panel>
    </div>
  )
}
