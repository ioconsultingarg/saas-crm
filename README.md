# IO-CRM

CRM de recompra para PyMEs y distribuidoras argentinas. **Demo vendible del Módulo 1 (Cartera).**

> Tu sistema ya sabe quién te está dejando de comprar. Nosotros te lo decimos el lunes a la mañana.

La distribuidora argentina pierde clientes de a uno y en silencio: el almacén que compraba cada 12 días y hace 41 que no aparece. No hay un evento, no llama para darse de baja, simplemente deja de estar en la facturación. IO-CRM lee el historial de ventas que la empresa ya factura en su sistema de gestión, detecta el desvío contra el patrón propio de cada cliente y entrega una lista corta de a quién llamar, ordenada por la plata que hay en juego.

## Qué es esta demo

Una **web app instalable (PWA)** que corre entera en el navegador, **sin backend y sin conexión**, con datos ficticios de una distribuidora de consumo masivo. Es la pieza que se le muestra a un prospecto en tres minutos, no el producto final.

- 412 clientes, 23 con alerta abierta, $4.180.000 de facturación mensual en juego.
- Los números no están escritos a mano: salen de `src/lib/calculos.ts` sobre los datos semilla, y hay tests que verifican que cierren.

## El recorrido de la demo

1. **Lista del lunes.** Arriba, la plata en riesgo. Abajo, diez clientes ordenados por monto.
2. **Supermercado El Trébol** ($728.000): compraba cada 21 días, hace 63 que no aparece.
3. **Almacén Don Pedro** — *el momento que vende el producto*. Compró hace 9 días, o sea que parece sano. Pero el gráfico en **pesos sube 18%** y al tocar el interruptor las **unidades bajan 31%**. Es una fuga disfrazada de crecimiento, y con inflación ningún reporte en pesos la muestra.
4. **Registrar una gestión** en dos clics, con deshacer.
5. **Parte de cartera**: la semana pasada, 18 gestionados, 7 volvieron a comprar, $960.000 recuperados.
6. **Importar**: arrastrar un CSV de ventas real y ver el informe de salud de datos.

## Cómo correrlo

```bash
npm install
npm run dev
```

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Sitio estático en `dist/`, con service worker |
| `npm run preview` | Sirve `dist/` para probar la instalación y el modo sin conexión |
| `npm test` | Verifica que los totales de la demo cierren |

## Publicación

Cada push a `main` dispara el workflow de GitHub Actions (`.github/workflows/pages.yml`), que corre los tests, construye y publica en GitHub Pages:

**https://ioconsultingarg.github.io/saas-crm/**

El subdirectorio se deriva solo del nombre del repositorio, así que no hay nada que configurar. Para reproducir ese build localmente:

```bash
BASE_PATH=saas-crm npm run build
```

`BASE_PATH` va **sin barras** a propósito: con `/saas-crm/`, Git Bash en Windows lo convierte en una ruta de disco y el build sale roto.

## Decisiones que conviene no revertir

- **El CRM no se carga a mano.** Todo lo que el sistema sabe sale de la facturación. Lo único que una persona escribe es el resultado de una gestión, y sólo cuando hay una alerta que lo justifica. Los CRMs mueren en las PyMEs porque nadie llena formularios.
- **No hay embudo.** Ni oportunidades, ni etapas, ni pronóstico. Una distribuidora no vende proyectos, vende recompra.
- **Se mide en unidades, no sólo en pesos.** Con inflación, los pesos mienten.
- **El umbral de alerta es relativo al patrón de cada cliente**, nunca un "45 días" fijo para todos.
- **Esto mide clientes, no personas.** Sin geolocalización, sin recorridos, sin horarios de actividad, sin ranking de vendedores. Es una decisión de producto: un vendedor que se siente vigilado boicotea la carga, y en Argentina el monitoreo de empleados tiene jurisprudencia en contra.
- **La única lógica real es la importación de CSV.** Todo lo demás se alimenta de datos semilla, y la pantalla lo dice.

## Cómo está hecho

React 18 + TypeScript + Vite + Tailwind, Recharts para el gráfico, papaparse para el CSV, `vite-plugin-pwa` para el service worker. Sin backend, sin router externo (el estado vive en la URL con enrutado por hash, así el botón atrás funciona), sin state manager. Fechas e importes con `Intl` y locale `es-AR`.

```
src/
  data/       datos semilla: 10 clientes escritos a mano + 402 generados con semilla fija
  lib/        calculos.ts (cadencia, riesgo, segmento) · formato.ts · csv.ts
  vistas/     ListaDelLunes · FichaCliente · Cartera · ParteDeCartera · Importar
  componentes/
  hooks/      useRutaHash · useTema · useGestiones
```

## Diseño

Dirección **"el remito bien hecho"**: papel cálido, tinta oscura, líneas de pauta, un azul de sello y estados terrosos. No se parece a un dashboard de SaaS, se parece a la mejor versión del papelerío que la distribuidora ya usa. Newsreader (serif) para la cifra grande y los títulos; Archivo, de la fundición argentina Omnibus-Type, para la interfaz y los datos; JetBrains Mono para códigos.

Modo claro y oscuro reales, contrastes verificados contra WCAG AA, foco de teclado visible, áreas táctiles de 44 px, `prefers-reduced-motion` respetado y áreas seguras contempladas con la app instalada.

---

Datos ficticios. Distribuidora Demo S.R.L. no existe.
