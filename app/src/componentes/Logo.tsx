/**
 * Marca IO-CRM: monograma I + O con la línea de crecimiento atravesándolo.
 * Reconstruido como SVG para que escale a 24 px, funcione sobre el campo
 * azul y sirva como ícono maskable. Sin degradados ni glow: a tamaño chico
 * se convierten en una mancha.
 *
 * Azul del monograma: 9,19:1 sobre papel. Verde de la línea: 4,10:1 sobre
 * papel y 6,89:1 sobre el campo azul, ambos por encima del 3:1 que exige
 * un elemento gráfico.
 */
export function Logo({
  tono = 'oscuro',
  compacto,
}: {
  tono?: 'claro' | 'oscuro'
  compacto?: boolean
}) {
  const claro = tono === 'claro'
  const trazo = claro ? 'currentColor' : 'var(--marca)'
  const linea = claro ? '#6FDCA6' : '#1F8A57'
  const lado = compacto ? 26 : 30

  return (
    <span className="inline-flex items-center gap-2" translate="no">
      <svg width={lado} height={lado} viewBox="0 0 48 48" role="img" aria-label="IO-CRM" style={{ flexShrink: 0 }}>
        {/* I */}
        <rect x="7" y="12" width="5" height="24" rx="1.5" fill={trazo} />
        {/* O */}
        <circle cx="30" cy="24" r="11" fill="none" stroke={trazo} strokeWidth="5" />
        {/* Línea de crecimiento, por encima del monograma */}
        <path
          d="M10 30 L19 22 L25 27 L38 12"
          fill="none"
          stroke={linea}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M31 11 L39 11 L39 19" fill="none" stroke={linea} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {!compacto && (
        <span
          className="font-semibold"
          style={{
            fontSize: 19,
            letterSpacing: '-.015em',
            color: claro ? 'currentColor' : 'var(--tinta)',
          }}
        >
          IO-CRM
        </span>
      )}
    </span>
  )
}
