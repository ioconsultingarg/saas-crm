import { useEffect, useRef, useState } from 'react'
import { Check, Clock, PhoneOff, ShoppingCart, X } from 'lucide-react'
import type { ResultadoGestion } from '../tipos'

const OPCIONES: { valor: ResultadoGestion; texto: string; Icono: typeof Check }[] = [
  { valor: 'compró', texto: 'Compró', Icono: ShoppingCart },
  { valor: 'atendido', texto: 'Atendido', Icono: Check },
  { valor: 'no atendió', texto: 'No atendió', Icono: PhoneOff },
  { valor: 'pospuesto', texto: 'Posponer', Icono: Clock },
  { valor: 'no compra más', texto: 'No compra más', Icono: X },
]

interface Props {
  comercio: string
  alElegir: (r: ResultadoGestion, nota?: string) => void
  alCerrar: () => void
  /** en movil se muestra como hoja inferior; en escritorio como panel anclado */
  comoHoja: boolean
}

export function RegistrarGestion({ comercio, alElegir, alCerrar, comoHoja }: Props) {
  const [elegido, setElegido] = useState<ResultadoGestion | null>(null)
  const [nota, setNota] = useState('')
  const contenedor = useRef<HTMLDivElement>(null)
  const primerBoton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    primerBoton.current?.focus()
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === 'Escape') alCerrar()
    }
    document.addEventListener('keydown', alTeclear)
    return () => document.removeEventListener('keydown', alTeclear)
  }, [alCerrar])

  const confirmar = (r: ResultadoGestion) => {
    // La nota es opcional y aparece despues de elegir: nunca bloquea el cierre.
    if (r === 'pospuesto' || r === 'no compra más') {
      setElegido(r)
      return
    }
    alElegir(r)
  }

  const cuerpo = (
    <div
      ref={contenedor}
      role="dialog"
      aria-label={`Registrar gestión de ${comercio}`}
      className="panel shadow-panel p-4"
      style={{ transformOrigin: comoHoja ? 'bottom center' : 'top right' }}
    >
      <p className="text-micro text-tinta-suave mb-3">
        Registrar gestión · <span className="text-tinta font-semibold">{comercio}</span>
      </p>

      {!elegido ? (
        <div className={comoHoja ? 'grid gap-2' : 'grid gap-2 w-64'}>
          {OPCIONES.map((o, i) => (
            <button
              key={o.valor}
              ref={i === 0 ? primerBoton : undefined}
              type="button"
              className="boton boton-secundario justify-start"
              style={o.valor === 'no compra más' ? { color: 'var(--critico)' } : undefined}
              onClick={() => confirmar(o.valor)}
            >
              <o.Icono size={18} strokeWidth={1.5} aria-hidden="true" />
              {o.texto}
            </button>
          ))}
        </div>
      ) : (
        <div className="grid gap-3">
          <label className="text-micro text-tinta-suave" htmlFor="nota-gestion">
            Nota (opcional)
          </label>
          <input
            id="nota-gestion"
            className="campo"
            placeholder="Vuelve a pedir la semana que viene…"
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            autoComplete="off"
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="boton boton-primario flex-1"
              onClick={() => alElegir(elegido, nota || undefined)}
            >
              Guardar
            </button>
            <button type="button" className="boton boton-secundario" onClick={alCerrar}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )

  if (!comoHoja) return cuerpo

  return (
    <div className="fixed inset-0 z-50 flex items-end" style={{ overscrollBehavior: 'contain' }}>
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-tinta"
        style={{ opacity: 0.35 }}
        onClick={alCerrar}
      />
      <div className="relative w-full inset-abajo p-2">{cuerpo}</div>
    </div>
  )
}
