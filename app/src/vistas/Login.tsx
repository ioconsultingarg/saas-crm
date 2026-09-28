import { useState } from 'react'
import { ArrowRight, ShieldCheck } from 'lucide-react'
import { USUARIOS } from '../data/crm'
import { EMPRESA } from '../data/seed'
import { Logo } from '../componentes/Logo'

export function Login({ entrar }: { entrar: (id: string) => void }) {
  const [elegido, setElegido] = useState(USUARIOS[0].id)
  const disponibles = USUARIOS.filter((u) => u.activo)

  return (
    <div className="min-h-screen grid escritorio:grid-cols-[1.1fr_1fr]">
      {/* Campo de marca: la mitad izquierda es el producto hablando */}
      <section
        className="relative flex flex-col justify-between p-5 escritorio:p-7 inset-arriba"
        style={{ background: 'var(--campo)', color: 'var(--campo-texto)' }}
      >
        {/* Pauta de fondo: textura de papel cuadriculado, muy sutil */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,.055) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.055) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(120% 90% at 20% 10%, #000 30%, transparent 80%)',
          }}
        />

        <div className="relative">
          <Logo tono="claro" />
        </div>

        <div className="relative max-w-lg py-6">
          <p className="encabezado-columna" style={{ color: 'rgba(255,255,255,.6)' }}>
            {EMPRESA.razonSocial}
          </p>
          <h1
            className="font-display"
            style={{ fontSize: 'clamp(28px, 4.2vw, 44px)', lineHeight: 1.12, marginTop: 8 }}
          >
            Quién te está dejando de comprar, cuánto vale y a quién llamar hoy.
          </h1>
          <p className="mt-3 text-cuerpo" style={{ color: 'rgba(255,255,255,.72)' }}>
            Embudo de ventas, cartera de clientes y recompra en un solo lugar, con los números de tu
            propio sistema de gestión.
          </p>
        </div>

        <ul className="relative grid gap-2 text-micro" style={{ color: 'rgba(255,255,255,.62)' }}>
          <li>Pipeline · Contactos · Reportes · Recompra</li>
          <li>Funciona sin conexión · Se instala en el celular</li>
        </ul>
      </section>

      {/* Acceso */}
      <section className="flex items-center justify-center p-5 escritorio:p-7">
        <div className="w-full" style={{ maxWidth: 380 }}>
          <h2 className="font-display text-titulo">Entrar</h2>
          <p className="text-cuerpo text-tinta-suave mt-1">
            Elegí con qué usuario querés ver la demo. Cada rol ve un alcance distinto.
          </p>

          <fieldset className="mt-4 grid gap-2">
            <legend className="encabezado-columna mb-2">Usuario</legend>
            {disponibles.map((u) => (
              <label
                key={u.id}
                className="flex items-center gap-3 rounded p-2 cursor-pointer"
                style={{
                  border: `1px solid ${elegido === u.id ? 'var(--marca)' : 'var(--borde-control)'}`,
                  background: elegido === u.id ? 'color-mix(in srgb, var(--marca) 7%, transparent)' : 'transparent',
                  transition: 'border-color var(--mov-corto) var(--curva), background-color var(--mov-corto) var(--curva)',
                  minHeight: 52,
                }}
              >
                <input
                  type="radio"
                  name="usuario"
                  value={u.id}
                  checked={elegido === u.id}
                  onChange={() => setElegido(u.id)}
                  style={{ accentColor: 'var(--marca)', width: 18, height: 18 }}
                />
                <span
                  className="inline-grid place-items-center rounded-full text-micro font-semibold shrink-0"
                  style={{
                    width: 32,
                    height: 32,
                    background: 'color-mix(in srgb, var(--marca) 14%, transparent)',
                    color: 'var(--marca)',
                  }}
                  aria-hidden="true"
                >
                  {u.iniciales}
                </span>
                <span className="min-w-0">
                  <span className="block text-cuerpo font-semibold truncate">{u.nombre}</span>
                  <span className="block text-micro text-tinta-suave capitalize">
                    {u.rol}
                    {u.zona ? ` · ${u.zona}` : ''}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>

          <button
            type="button"
            className="boton boton-primario w-full mt-4"
            style={{ minHeight: 48 }}
            onClick={() => entrar(elegido)}
          >
            Entrar a la demo
            <ArrowRight size={18} strokeWidth={1.5} aria-hidden="true" />
          </button>

          <p className="mt-4 text-micro text-tinta-suave flex items-start gap-2">
            <ShieldCheck size={16} strokeWidth={1.5} aria-hidden="true" className="shrink-0 mt-0.5" />
            Demo sin servidor: no hay contraseñas, no se envía nada a ningún lado y todos los datos
            son ficticios.
          </p>
        </div>
      </section>
    </div>
  )
}
