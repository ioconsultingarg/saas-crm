import { useCallback, useEffect, useState } from 'react'
import type { Usuario } from '../tipos-crm'
import { USUARIOS } from '../data/crm'

const CLAVE = 'io-crm:sesion'

/**
 * Sesión simulada de demo: no hay backend ni credenciales reales.
 * Se entra eligiendo un usuario de ejemplo; no se pide ni se guarda
 * ninguna contraseña.
 *
 * ESTO NO PUEDE SOBREVIVIR AL BACKEND REAL.
 *
 * Acá el rol vive en localStorage, así que cualquiera lo edita y se pone
 * administrador. Es correcto para una demo con usuarios públicos y ficticios,
 * y es un agujero el día que haya datos de clientes de verdad. Cuando se
 * conecte Supabase:
 *
 *   - el rol va en el JWT y se aplica con Row Level Security en la base,
 *     nunca en el cliente;
 *   - el error de login es único ("Email o contraseña incorrectos"), para no
 *     permitir enumerar qué cuentas existen;
 *   - la sesión la maneja Supabase Auth, no este hook.
 */
export function useAuth() {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    try {
      const id = localStorage.getItem(CLAVE)
      return id ? (USUARIOS.find((u) => u.id === id) ?? null) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    try {
      if (usuario) localStorage.setItem(CLAVE, usuario.id)
      else localStorage.removeItem(CLAVE)
    } catch {
      /* sin persistencia: la sesión dura lo que dure la pestaña */
    }
  }, [usuario])

  const entrar = useCallback((id: string) => {
    setUsuario(USUARIOS.find((u) => u.id === id) ?? null)
  }, [])

  const salir = useCallback(() => setUsuario(null), [])

  return { usuario, entrar, salir }
}
