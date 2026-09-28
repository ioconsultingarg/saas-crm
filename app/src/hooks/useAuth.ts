import { useCallback, useEffect, useState } from 'react'
import type { Usuario } from '../tipos-crm'
import { USUARIOS } from '../data/crm'

const CLAVE = 'io-crm:sesion'

/**
 * Sesión simulada de demo: no hay backend ni credenciales reales.
 * Se entra eligiendo un usuario de ejemplo; no se pide ni se guarda
 * ninguna contraseña.
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
