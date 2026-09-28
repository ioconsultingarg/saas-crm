import { useCallback, useEffect, useMemo, useState } from 'react'
import { Marco } from './componentes/Marco'
import { Aviso } from './componentes/Aviso'
import { ListaDelLunes } from './vistas/ListaDelLunes'
import { FichaCliente } from './vistas/FichaCliente'
import { Cartera } from './vistas/Cartera'
import { ParteDeCartera } from './vistas/ParteDeCartera'
import { Importar } from './vistas/Importar'
import { useRutaHash } from './hooks/useRutaHash'
import { useTema } from './hooks/useTema'
import { useGestiones } from './hooks/useGestiones'
import { analizarTodos, conAlerta } from './lib/calculos'
import { CLIENTES, TOTAL_EN_RIESGO } from './data'
import type { ResultadoGestion } from './tipos'

interface EventoInstalacion extends Event {
  prompt: () => Promise<void>
}

export default function App() {
  const { ruta, navegar, abrirCliente, cerrarCliente } = useRutaHash()
  const { esOscuro, alternar } = useTema()
  const { gestiones, registrar, deshacer, reiniciar } = useGestiones()
  const [aviso, setAviso] = useState<{ texto: string; clienteId?: string } | null>(null)
  const [instalador, setInstalador] = useState<EventoInstalacion | null>(null)
  const [ayudaIOS, setAyudaIOS] = useState(false)

  const clientes = useMemo(() => analizarTodos(CLIENTES), [])
  const enRiesgo = useMemo(() => conAlerta(clientes), [clientes])

  useEffect(() => {
    const alPoder = (e: Event) => {
      e.preventDefault()
      setInstalador(e as EventoInstalacion)
    }
    window.addEventListener('beforeinstallprompt', alPoder)

    // iOS no dispara el evento: se explica una sola vez y no se insiste.
    const esIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
    const instalada = window.matchMedia('(display-mode: standalone)').matches
    let yaVisto = false
    try {
      yaVisto = localStorage.getItem('io-crm:ayuda-ios') === '1'
    } catch {
      yaVisto = true
    }
    if (esIOS && !instalada && !yaVisto) setAyudaIOS(true)

    return () => window.removeEventListener('beforeinstallprompt', alPoder)
  }, [])

  const instalar = useCallback(() => {
    void instalador?.prompt()
    setInstalador(null)
  }, [instalador])

  const cerrarAyudaIOS = () => {
    setAyudaIOS(false)
    try {
      localStorage.setItem('io-crm:ayuda-ios', '1')
    } catch {
      /* si no se puede guardar, simplemente se vuelve a mostrar */
    }
  }

  const alRegistrar = (id: string, r: ResultadoGestion, nota?: string) => {
    registrar(id, r, nota)
    const c = clientes.find((x) => x.id === id)
    setAviso({ texto: `${c?.razonSocial ?? 'Cliente'}: ${r}`, clienteId: id })
  }

  const clienteAbierto = ruta.cliente ? clientes.find((c) => c.id === ruta.cliente) : undefined

  return (
    <Marco
      vista={ruta.vista}
      irA={(v) => navegar({ vista: v, cliente: undefined })}
      esOscuro={esOscuro}
      alternarTema={alternar}
      puedeInstalar={Boolean(instalador)}
      instalar={instalar}
    >
      {ayudaIOS && (
        <div className="panel p-3 mb-4 flex items-start gap-3 no-imprimir">
          <p className="text-cuerpo flex-1">
            Para instalar IO-CRM en el iPhone: tocá <strong>Compartir</strong> y después{' '}
            <strong>Agregar a inicio</strong>.
          </p>
          <button type="button" className="boton boton-sutil" onClick={cerrarAyudaIOS}>
            Entendido
          </button>
        </div>
      )}

      {clienteAbierto ? (
        <FichaCliente c={clienteAbierto} volver={cerrarCliente} />
      ) : ruta.vista === 'lista' ? (
        <ListaDelLunes
          enRiesgo={enRiesgo}
          totalEnRiesgo={TOTAL_EN_RIESGO}
          gestiones={gestiones}
          registrar={alRegistrar}
          abrirCliente={abrirCliente}
          filtroVendedor={ruta.vendedor}
          filtroZona={ruta.zona}
          alFiltrar={(cambio) => navegar(cambio)}
        />
      ) : ruta.vista === 'cartera' ? (
        <Cartera
          clientes={clientes}
          abrirCliente={abrirCliente}
          filtroSegmento={ruta.segmento}
          alFiltrar={(cambio) => navegar(cambio)}
        />
      ) : ruta.vista === 'parte' ? (
        <ParteDeCartera />
      ) : (
        <Importar />
      )}

      <footer className="mt-6 pt-4 border-t border-pauta text-micro text-tinta-suave flex flex-wrap items-center gap-3 no-imprimir">
        <span>
          IO-CRM · demo con datos ficticios de Distribuidora Demo S.R.L.
        </span>
        {gestiones.length > 0 && (
          <button
            type="button"
            className="boton boton-sutil"
            onClick={() => {
              reiniciar()
              setAviso({ texto: 'Demo reiniciada' })
            }}
          >
            Reiniciar demo
          </button>
        )}
      </footer>

      {aviso && (
        <Aviso
          texto={aviso.texto}
          alCerrar={() => setAviso(null)}
          alDeshacer={
            aviso.clienteId
              ? () => {
                  deshacer(aviso.clienteId!)
                  setAviso(null)
                }
              : undefined
          }
        />
      )}
    </Marco>
  )
}
