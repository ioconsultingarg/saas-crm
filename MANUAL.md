# Manual de uso — IO-CRM

Guía de la demo publicada en **https://ioconsultingarg.github.io/saas-crm/**

Está escrita en el orden en que se usa el producto, no en el orden en que está construido. Cada sección describe lo que la aplicación hace hoy; lo que todavía no hace está marcado como tal.

> **Todos los datos son ficticios.** Distribuidora Demo S.R.L., sus clientes, sus vendedores y sus pedidos no existen. No hay servidor: todo corre en el navegador y nada se envía a ningún lado.

---

## 1. Instalarlo

IO-CRM es una aplicación web instalable. No se baja de ninguna tienda.

**En el celular (Android):** abrí el link en Chrome. Aparece un botón **Instalar** arriba a la derecha; también se puede desde el menú del navegador, en *Agregar a pantalla de inicio*.

**En el iPhone:** Safari no ofrece el botón. Tocá **Compartir** y después **Agregar a inicio**.

**En la computadora:** Chrome o Edge muestran un ícono de instalación en la barra de direcciones.

Una vez instalada abre en ventana propia, sin barra de navegador, y **funciona sin conexión**. Conviene abrirla una vez con wifi antes de salir a la calle.

---

## 2. Entrar

La demo no pide contraseña: se elige con qué usuario mirarla.

| Usuario | Rol | Qué ve |
|---|---|---|
| Gonzalo Bravo | Administrador | Todo: pipeline completo, reportes del equipo, configuración |
| Vanina Coria | Supervisor | El pipeline y los reportes de su equipo |
| Marcela Ruiz, Diego Sosa, Hernán Prieto, Lucas Bianchi | Vendedor | Su cartera, su ruta y sus propios números |

El rol cambia qué se ve, no cómo se ve. Los permisos exactos están en **Configuración → Permisos por rol**.

---

## 3. El día del vendedor en la calle

Esta es la parte que se usa parado en la vereda, con una mano y con apuro. Todas estas pantallas están pensadas primero para el celular.

### 3.1 Preparar el día

**En la calle → Preparar el día.** Antes de salir, con wifi, el teléfono se descarga la ruta, las fichas de clientes, el catálogo con precios y el stock con sus lotes. Cuando los cuatro paquetes están listos se habilita **Empezar la ruta**.

A partir de ahí la aplicación funciona sin señal.

### 3.2 Mi ruta de hoy

La lista de comercios del día, en orden. Arriba se ve el cumplimiento: cuántos visitaste, cuántos no estaban y cuántos faltan.

Cada comercio muestra el **semáforo de crédito**, que es lo primero que hay que mirar antes de ofrecer nada:

| Etiqueta | Qué significa |
|---|---|
| Crédito disponible | Se puede vender sin problema |
| Cerca del límite | Queda poco margen; conviene medir el pedido |
| Límite agotado | Llegó al tope de crédito |
| Con deuda vencida | Tiene facturas impagas; se puede tomar el pedido pero queda retenido |

**Llegué al local** marca la llegada. La visita pasa a *En curso* y quedan dos caminos: **Tomar pedido** o **No vendí**, que pide el motivo (local cerrado, no estaba el encargado, pidió volver mañana, no compra hoy).

> **Sobre la ubicación.** Se guardan las coordenadas en dos momentos: cuando marcás la llegada y cuando cerrás la visita. Nada más. No se registra el recorrido, ni la velocidad, ni el tiempo entre visitas, ni dónde estás cuando la app está cerrada. Es una decisión de producto, explicada en la sección 7.

### 3.3 Ficha del comercio

Lo que hay que saber antes de vender, en una pantalla:

- **Cuenta corriente**: cuánto hay disponible hoy, el límite, el saldo, lo vencido y la condición de pago.
- **Cómo viene comprando**: cada cuántos días compra, cuándo fue la última vez, cuánto factura por mes y qué suele llevar.
- **Sugerido**: artículos que el cliente lleva habitualmente y hace más tiempo del normal que no pide. Es aritmética sobre su historial, no una predicción.
- **Contactos**, con botón para llamar y para abrir WhatsApp.

**Tomar pedido** abre el pedido y lleva al catálogo.

### 3.4 Catálogo

Búsqueda por nombre, código interno o código de barras, y filtros por categoría, marca y ofertas.

Cada artículo muestra el stock y, si corresponde, un aviso de **lote por vencer**. Los artículos marcados **Sugerido** son los de la ficha del cliente.

Al tocar un artículo se elige la **unidad**: unidad suelta, pack o bulto, cada una con su precio y su equivalencia. Después la cantidad, y **Agregar al pedido**.

### 3.5 El pedido

Muestra cada línea con su unidad y su precio, permite cambiar cantidades, aplicar descuento por línea y quitar artículos.

Abajo, el **resumen**: neto, descuentos, IVA y total.

Y el **control de crédito**, que compara el total contra lo disponible. Si no alcanza, o si el cliente tiene deuda vencida, aparece el aviso y el botón de cierre cambia a **Cerrar para autorización**: el pedido se toma igual, pero queda retenido esperando que la oficina lo apruebe.

### 3.6 Cerrar la visita

Resumen de lo que se envía, y el espacio para que el comerciante **firme con el dedo**. La firma es opcional.

Al confirmar se genera el comprobante con su número. Si no hay señal, queda guardado en el teléfono: en la pantalla de ruta aparece el aviso de *pedidos guardados esperando señal*, con el botón **Sincronizar ahora**.

---

## 4. La oficina

### 4.1 Panel del día

**Operación → Panel del día.** Lo facturado, el cumplimiento de rutas, cuántos pedidos están retenidos y cuántos siguen sin sincronizar.

El gráfico por zona muestra **cuántos clientes hay y cuánto facturan**. No muestra dónde están los vendedores.

### 4.2 Aprobación de pedidos

La bandeja de los pedidos retenidos en la calle. Cada uno trae el motivo de la retención y la cuenta corriente del cliente a la vista: límite, saldo, disponible y vencido. Se puede abrir el detalle línea por línea y después **Aprobar** o **Rechazar**.

### 4.3 Stock y lotes

El catálogo completo con stock valorizado, artículos sin stock o con stock bajo, y los **lotes que vencen dentro de los 30 días** — lo que en droguería y alimentos no se puede pasar por alto.

Incluye la actualización masiva de precios por porcentaje sobre la vista filtrada.

### 4.4 Cuentas corrientes

Límites de crédito, plazos de pago, listas de precios asignadas y la composición de la cartera entre cuentas al día, cerca del límite y bloqueadas. Se ordena por deuda vencida.

### 4.5 Rutas y preventistas

Las rutas por zona y día de la semana, con los comercios de cada una. Permite **reasignar** una ruta a otro vendedor ante una ausencia.

No hay optimización automática de recorrido: el preventista conoce su zona mejor que un algoritmo, y además eso exigiría rastrearlo.

---

## 5. Lo comercial

### 5.1 Panel

El embudo de ventas con las cinco etapas y la conversión de una a otra, las tareas del día, la recompra en riesgo, el rendimiento del equipo y la actividad reciente.

### 5.2 Pipeline

El tablero de oportunidades. Las tarjetas se **arrastran** de una columna a otra, y también se mueven con el botón **Mover**, que existe para que se pueda operar con el teclado y sin gesto de arrastre.

Cada tarjeta avisa si la oportunidad lleva más de 15 días sin actividad.

### 5.3 Empresas y contactos

El directorio de cuentas con búsqueda por nombre, contacto o CUIT. La ficha reúne contactos, oportunidades abiertas e historial de comunicación.

### 5.4 Reportes

Proyección de ingresos ponderada por la probabilidad de cada etapa, conversión por etapa, productividad por vendedor, motivos de pérdida y rendimiento por origen.

---

## 6. Recompra

El módulo que diferencia a IO-CRM de un CRM genérico. Un CRM clásico sigue oportunidades nuevas; una distribuidora vive de que el cliente **vuelva a comprar**.

### 6.1 La lista del lunes

Diez clientes, ordenados por la plata que hay en juego. Cada uno con su teléfono, hace cuánto que no compra contra su cadencia habitual, y qué compraba.

La alerta no salta a los 45 días para todos: salta cuando **ese** cliente se sale de **su** ritmo. Uno que compra cada 7 días y hace 26 que no aparece está en problemas; otro que compra cada 45 no.

El resultado de la gestión se registra en dos toques: compró, atendido, no atendió, posponer o no compra más. Hay **Deshacer** durante seis segundos.

### 6.2 Cartera

Los 412 clientes segmentados: activo frecuente, activo esporádico, en riesgo, nuevo, dormido y perdido. Filtrable y exportable a Excel.

### 6.3 Parte semanal

El informe de la semana: cuántos clientes estaban en riesgo, cuántos se gestionaron, cuántos volvieron a comprar y **cuánta facturación se recuperó**. Se imprime o se guarda como PDF.

### 6.4 Importar ventas

Se arrastra el CSV que exporta el sistema de gestión. La aplicación detecta las columnas sola, muestra lo que entendió antes de aplicar nada, y después entrega el **informe de salud de los datos**: filas con fecha inválida, comprobantes sin cliente, importes negativos y clientes duplicados probables.

Hay un archivo de ejemplo para probarlo sin datos propios.

---

## 7. Lo que IO-CRM no hace, a propósito

- **No rastrea a las personas.** Sin recorridos, sin posición en vivo, sin tiempos entre visitas, sin mapa de calor de vendedores y sin ranking individual atado a evaluación. Se mide la cartera y su resultado. Hay dos razones: en Argentina el monitoreo de empleados en relación de dependencia tiene jurisprudencia en contra, y un vendedor que se siente vigilado deja de cargar datos, con lo cual el sistema entero se vuelve inútil.
- **No factura ni administra la cuenta corriente.** Eso vive en el sistema de gestión. IO-CRM la muestra, con la fecha del dato.
- **No optimiza recorridos automáticamente.**
- **No usa modelos entrenados.** El sugerido es aritmética sobre el historial, y por eso se puede explicar en una línea.

---

## 8. Límites de la demo

| Qué | Estado |
|---|---|
| Datos | Ficticios y fijos. Se reinician con **Reiniciar demo** al pie |
| Sesión | Sin contraseñas ni servidor |
| Importación de CSV | **Real**: parsea de verdad el archivo que le des, pero no modifica la cartera de ejemplo |
| Interruptores de integraciones y automatizaciones | Cambian de estado, no ejecutan nada |
| Aprobaciones de pedidos | Las decisiones viven sólo en la sesión actual |
| Actualización masiva de precios | Previsualiza, no guarda |

---

## 9. Glosario

**Cadencia** — cada cuántos días compra habitualmente un cliente.
**Monto en riesgo** — lo que ese cliente facturaba por período, proyectado al tiempo que lleva sin comprar.
**Pedido retenido** — tomado en la calle pero frenado por crédito o descuento, a la espera de autorización.
**Proyección ponderada** — el valor del pipeline abierto multiplicado por la probabilidad de cada etapa.
**Unidad logística** — la forma en que se vende un artículo: unidad suelta, pack o bulto.
**Sello de ubicación** — las coordenadas del instante del check-in o del check-out. No hay nada registrado entre uno y otro.

---

*Versión de la demo correspondiente al repositorio [ioconsultingarg/saas-crm](https://github.com/ioconsultingarg/saas-crm).*
