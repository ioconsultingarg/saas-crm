import { Printer } from 'lucide-react'
import { PARTE_SEMANA_PASADA as P } from '../data/gestiones'
import { EMPRESA, FECHA_ULTIMO_DATO } from '../data/seed'
import { fecha, num, pesosARS } from '../lib/formato'

function Cifra({ etiqueta, valor, destacado }: { etiqueta: string; valor: string; destacado?: boolean }) {
  return (
    <div className="panel p-3">
      <p className="encabezado-columna">{etiqueta}</p>
      <p
        className={destacado ? 'font-display cifra' : 'cifra font-semibold'}
        style={destacado ? { fontSize: 28, lineHeight: '32px' } : { fontSize: 20 }}
      >
        {valor}
      </p>
    </div>
  )
}

export function ParteDeCartera() {
  return (
    <article className="grid gap-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-titulo">Parte de cartera</h1>
          <p className="text-tinta-suave text-cuerpo">
            {EMPRESA.razonSocial} · semana del {fecha(P.desde)} al {fecha(P.hasta)}
          </p>
        </div>
        <button type="button" className="boton boton-secundario no-imprimir" onClick={() => window.print()}>
          <Printer size={18} strokeWidth={1.5} aria-hidden="true" />
          Imprimir o guardar PDF
        </button>
      </header>

      <div className="grid gap-2 grid-cols-2 escritorio:grid-cols-4">
        <Cifra etiqueta="Recuperado" valor={pesosARS(P.montoRecuperado)} destacado />
        <Cifra etiqueta="Gestionados" valor={num(P.gestionados)} />
        <Cifra etiqueta="Volvieron a comprar" valor={num(P.recuperados)} />
        <Cifra etiqueta="En riesgo al cierre" valor={num(P.enRiesgoCierre)} />
      </div>

      <section className="panel p-4">
        <h2 className="text-subtitulo font-semibold mb-2">Cómo se movió la cartera</h2>
        <ul className="text-cuerpo grid gap-1">
          <li>En riesgo al inicio de la semana: <span className="cifra">{num(P.enRiesgoInicio)}</span></li>
          <li>Recuperados: <span className="cifra" style={{ color: 'var(--sano)' }}>−{num(P.recuperados)}</span></li>
          <li>Nuevos que entraron en riesgo: <span className="cifra" style={{ color: 'var(--critico)' }}>+{num(P.nuevosEnRiesgo)}</span></li>
          <li className="font-semibold">En riesgo al cierre: <span className="cifra">{num(P.enRiesgoCierre)}</span></li>
        </ul>
      </section>

      <section className="panel overflow-x-auto">
        <table className="w-full text-dato" style={{ minWidth: 640 }}>
          <caption className="sr-only">Gestiones de la semana</caption>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--pauta)' }}>
              <th scope="col" className="text-left p-2 encabezado-columna">Comercio</th>
              <th scope="col" className="text-left p-2 encabezado-columna">Vendedor</th>
              <th scope="col" className="text-right p-2 encabezado-columna">Fecha</th>
              <th scope="col" className="text-left p-2 encabezado-columna">Resultado</th>
              <th scope="col" className="text-right p-2 encabezado-columna">Recuperado</th>
            </tr>
          </thead>
          <tbody>
            {P.lineas.map((l) => (
              <tr key={l.comercio} style={{ borderBottom: '1px solid var(--pauta)' }}>
                <td className="p-2">{l.comercio}</td>
                <td className="p-2 text-tinta-suave">{l.vendedor}</td>
                <td className="p-2 text-right cifra">{fecha(l.fecha)}</td>
                <td
                  className="p-2"
                  style={{ color: l.resultado === 'compró' ? 'var(--sano)' : undefined }}
                >
                  {l.resultado}
                </td>
                <td className="p-2 text-right cifra">
                  {l.recuperado > 0 ? pesosARS(l.recuperado) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="text-micro text-tinta-suave grid gap-1">
        <p>Último dato importado: {fecha(FECHA_ULTIMO_DATO)}.</p>
        <p>{P.criterio}</p>
      </footer>
    </article>
  )
}
