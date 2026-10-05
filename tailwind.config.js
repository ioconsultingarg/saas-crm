/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/index.html', './app/src/**/*.{ts,tsx}'],
  theme: {
    // Los tokens viven en estilos.css como variables CSS; Tailwind solo los expone.
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      papel: 'var(--papel)',
      superficie: 'var(--superficie)',
      tinta: 'var(--tinta)',
      'tinta-suave': 'var(--tinta-suave)',
      pauta: 'var(--pauta)',
      control: 'var(--borde-control)',
      marca: 'var(--marca)',
      'marca-texto': 'var(--marca-texto)',
      critico: 'var(--critico)',
      'critico-fondo': 'var(--critico-fondo)',
      riesgo: 'var(--riesgo)',
      'riesgo-fondo': 'var(--riesgo-fondo)',
      sano: 'var(--sano)',
      'sano-fondo': 'var(--sano-fondo)',
      ocre: 'var(--ocre)',
    },
    spacing: {
      0: '0', px: '1px', 0.5: '2px', 1: '4px', 2: '8px', 3: '12px',
      4: '16px', 5: '24px', 6: '32px', 7: '48px', 8: '64px',
    },
    borderRadius: { none: '0', sm: '2px', DEFAULT: '4px', md: '6px', full: '9999px' },
    fontFamily: {
      // SF Pro no se puede servir como fuente web: la licencia de Apple lo
      // prohibe. Se la nombra en la pila para que la use quien la tenga (en
      // Apple viene con el sistema; en Windows, si el usuario la instalo), y
      // detras va la fuente de interfaz nativa de cada plataforma.
      // Optica por tamano, igual que hace SF: la variante Text esta pensada
      // para cuerpo y tablas, la Display para titulos. Windows tiene la misma
      // division en Segoe UI Variable, asi que la pila la respeta en los dos.
      sans: [
        '-apple-system', 'BlinkMacSystemFont',
        '"SF Pro Text"', '"SF Pro"',
        '"Segoe UI Variable Text"', '"Segoe UI Variable"', '"Segoe UI"',
        'Roboto', 'ui-sans-serif', 'system-ui', 'sans-serif',
      ],
      titulo: [
        '-apple-system', 'BlinkMacSystemFont',
        '"SF Pro Display"', '"SF Pro"',
        '"Segoe UI Variable Display"', '"Segoe UI Variable"', '"Segoe UI"',
        'Roboto', 'ui-sans-serif', 'system-ui', 'sans-serif',
      ],
      display: ['"Newsreader Variable"', 'Newsreader', 'Georgia', 'serif'],
      mono: [
        'ui-monospace', 'SFMono-Regular', '"SF Mono"',
        '"Cascadia Mono"', 'Menlo', 'Consolas', 'monospace',
      ],
    },
    fontSize: {
      micro: ['13px', { lineHeight: '18px' }],
      columna: ['12px', { lineHeight: '16px', letterSpacing: '.04em' }],
      dato: ['14px', { lineHeight: '20px' }],
      cuerpo: ['15px', { lineHeight: '22px' }],
      subtitulo: ['16px', { lineHeight: '24px' }],
      titulo: ['22px', { lineHeight: '30px' }],
      display: ['34px', { lineHeight: '38px' }],
    },
    extend: {
      boxShadow: { panel: '0 1px 2px rgba(0,0,0,.06), 0 8px 24px rgba(0,0,0,.08)' },
      transitionTimingFunction: { propia: 'cubic-bezier(.2,0,0,1)' },
      screens: { tablet: '768px', escritorio: '1024px', ancho: '1440px' },
    },
  },
  plugins: [],
}
