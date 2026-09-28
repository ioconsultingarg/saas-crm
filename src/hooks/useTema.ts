import { useCallback, useEffect, useState } from 'react'

export type Tema = 'sistema' | 'claro' | 'oscuro'
const CLAVE = 'io-crm:tema'

function leerGuardado(): Tema {
  try {
    const v = localStorage.getItem(CLAVE)
    if (v === 'claro' || v === 'oscuro' || v === 'sistema') return v
  } catch {
    /* modo privado o almacenamiento bloqueado: seguimos con el del sistema */
  }
  return 'sistema'
}

export function useTema() {
  const [tema, setTemaEstado] = useState<Tema>(leerGuardado)

  useEffect(() => {
    const raiz = document.documentElement
    if (tema === 'sistema') raiz.removeAttribute('data-tema')
    else raiz.setAttribute('data-tema', tema)
    try {
      localStorage.setItem(CLAVE, tema)
    } catch {
      /* sin persistencia, pero la app funciona igual */
    }
  }, [tema])

  const alternar = useCallback(() => {
    setTemaEstado((t) => {
      if (t === 'sistema') {
        const oscuroDelSistema = window.matchMedia('(prefers-color-scheme: dark)').matches
        return oscuroDelSistema ? 'claro' : 'oscuro'
      }
      return t === 'oscuro' ? 'claro' : 'oscuro'
    })
  }, [])

  const esOscuro =
    tema === 'oscuro' ||
    (tema === 'sistema' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  return { tema, esOscuro, alternar }
}
