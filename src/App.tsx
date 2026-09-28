import { useCallback, useEffect, useMemo, useState } from 'react'
import { Marco } from './componentes/Marco'
import { Aviso } from './componentes/Aviso'
import { Login } from './vistas/Login'
import { Dashboard } from './vistas/Dashboard'
import { Pipeline } from './vistas/Pipeline'
import { Empresas } from './vistas/Empresas'
import { Reportes } from './vistas/Reportes'
import { Configuracion } from './vistas/Configuracion'
import { ListaDelLunes } from './vistas/ListaDelLunes'
import { FichaCliente } from './vistas/FichaCliente'
import { Cartera } from './vistas/Cartera'
import { ParteDeCartera } from './vistas/ParteDeCartera'
import { Importar } from './vistas/Importar'
import { useRutaHash } from './hooks/useRutaHash'
import { useTema } from './hooks/useTema'
import { useGestiones } from './hooks/useGestiones'
import { useAuth } from './hooks/useAuth'
import { usePipeline } from './hooks/usePipeline'
import { analizarTodos, conAlerta } from './lib/calculos'
import { CLIENTES, TOTAL_EN_RIESGO } from './data'
import type { ResultadoGestion } from './tipos'

interface EventoInstalacion extends Event {
  prompt: () => Promise<void>
}

export default function App() {
  const { ruta, navegar, abrirCliente, abrirEmpresa, volver } = useRutaHash()
  const { esOscuro, alternar } = useTema()
  const { usuario, entrar, salir } = useAuth()
  const { gestiones, registrar, deshacer, reiniciar } = useGestiones()
  const { oportunidades, mover, deshacer: deshacerMov, ultimo } = usePipeline()
  const [aviso, setAviso] = useState<{ texto: string; deshacer?: () => void } | null>(null)
  const [instalador, setInstalador] = useState<EventoInstalacion | null>(null)

  const clientes = useMemo(() => analizarTodos(CLIENTES), [])
  const enRiesgo = useMemo(() => conAlerta(clientes), [clientes])

  useEffect(() => {
    const alPoder = (e: Event) => {
      e.preventDefault()
      setInstalador(e as EventoInstalacion)
    }
    window.addEventListener('beforeinstallprompt', alPoder)
    return () => window.removeEventListener('beforeinstallprompt', alPoder)
  }, [])

  const instalar = useCallback(() => {
    void instalador?.prompt()
    setInstalador(null)
  }, [instalador])

  if (!usuario) return <Login entrar={entrar} />

  const alRegistrar = (id: string, r: ResultadoGestion, nota?: string) => {
    registrar(id, r, nota)
    const c = clientes.find((x) => x.id === id)
    setAviso({ texto: `${c?.razonSocial ?? 'Cliente'}: ${r}`, deshacer: () => deshacer(id) })
  }

  const alMover = (id: string, etapa: Parameters<typeof mover>[1]) => {
    mover(id, etapa)
    setAviso({ texto: 'Oportunidad movida', deshacer: deshacerMov })
  }

  const clienteAbierto = ruta.cliente ? clientes.find((c) => c.id === ruta.cliente) : undefined

  const contenido = () => {
    if (clienteAbierto) return <FichaCliente c={clienteAbierto} volver={volver} />
    if (ruta.empresa || ruta.vista === 'empresas')
      return (
        <Empresas
          oportunidades={oportunidades}
          empresaAbierta={ruta.empresa}
          abrirEmpresa={abrirEmpresa}
          cerrarEmpresa={volver}
        />
      )

    switch (ruta.vista) {
      case 'pipeline':
        return <Pipeline oportunidades={oportunidades} mover={alMover} abrirEmpresa={abrirEmpresa} />
      case 'reportes':
        return <Reportes oportunidades={oportunidades} />
      case 'configuracion':
        return <Configuracion />
      case 'lista':
        return (
          <ListaDelLunes
            enRiesgo={enRiesgo}
            totalEnRiesgo={TOTAL_EN_RIESGO}
            gestiones={gestiones}
            registrar={alRegistrar}
            abrirCliente={abrirCliente}
            filtroVendedor={ruta.vendedor}
            filtroZona={ruta.zona}
            alFiltrar={(c) => navegar(c)}
          />
        )
      case 'cartera':
        return (
          <Cartera
            clientes={clientes}
            abrirCliente={abrirCliente}
            filtroSegmento={ruta.segmento}
            alFiltrar={(c) => navegar(c)}
          />
        )
      case 'parte':
        return <ParteDeCartera />
      case 'importar':
        return <Importar />
      default:
        return (
          <Dashboard
            oportunidades={oportunidades}
            clientes={clientes}
            irAPipeline={() => navegar({ vista: 'pipeline' })}
            irACartera={() => navegar({ vista: 'lista' })}
            abrirEmpresa={abrirEmpresa}
          />
        )
    }
  }

  return (
    <Marco
      vista={ruta.vista}
      irA={(v) => navegar({ vista: v, cliente: undefined, empresa: undefined })}
      usuario={usuario}
      salir={salir}
      esOscuro={esOscuro}
      alternarTema={alternar}
      puedeInstalar={Boolean(instalador)}
      instalar={instalar}
    >
      {contenido()}

      <footer className="mt-6 pt-4 text-micro text-tinta-suave flex flex-wrap items-center gap-3 no-imprimir" style={{ borderTop: '1px solid var(--pauta)' }}>
        <span>IO-CRM · demo con datos ficticios de Distribuidora Demo S.R.L.</span>
        {(gestiones.length > 0 || ultimo) && (
          <button
            type="button"
            className="boton boton-sutil"
            onClick={() => { reiniciar(); setAviso({ texto: 'Demo reiniciada' }) }}
          >
            Reiniciar demo
          </button>
        )}
      </footer>

      {aviso && (
        <Aviso
          texto={aviso.texto}
          alCerrar={() => setAviso(null)}
          alDeshacer={aviso.deshacer ? () => { aviso.deshacer!(); setAviso(null) } : undefined}
        />
      )}
    </Marco>
  )
}
