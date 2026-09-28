import type {
  Actividad,
  ContactoCRM,
  Empresa,
  Etapa,
  Integracion,
  Oportunidad,
  ReglaAutomatica,
  Tarea,
  TipoActividad,
  Usuario,
} from '../tipos-crm'
import { HOY } from './seed'

const MS_DIA = 86_400_000
const iso = (d: Date) => d.toISOString().slice(0, 10)
const masDias = (n: number) => iso(new Date(HOY.getTime() + n * MS_DIA))

/** Semilla fija: la demo da siempre los mismos numeros. */
function mulberry32(a: number) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rnd = mulberry32(31415926)
const elegir = <T,>(xs: readonly T[]): T => xs[Math.floor(rnd() * xs.length)]
const entre = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1))

/* --------------------------------------------------------------- usuarios */

export const USUARIOS: Usuario[] = [
  { id: 'u-gb', nombre: 'Gonzalo Bravo', email: 'gonzalo@distribuidorademo.com.ar', rol: 'administrador', iniciales: 'GB', activo: true },
  { id: 'u-mr', nombre: 'Marcela Ruiz', email: 'marcela@distribuidorademo.com.ar', rol: 'vendedor', iniciales: 'MR', activo: true, zona: 'CABA Sur' },
  { id: 'u-ds', nombre: 'Diego Sosa', email: 'diego@distribuidorademo.com.ar', rol: 'vendedor', iniciales: 'DS', activo: true, zona: 'Quilmes' },
  { id: 'u-vc', nombre: 'Vanina Coria', email: 'vanina@distribuidorademo.com.ar', rol: 'supervisor', iniciales: 'VC', activo: true, zona: 'Avellaneda' },
  { id: 'u-hp', nombre: 'Hernán Prieto', email: 'hernan@distribuidorademo.com.ar', rol: 'vendedor', iniciales: 'HP', activo: true, zona: 'La Matanza' },
  { id: 'u-lb', nombre: 'Lucas Bianchi', email: 'lucas@distribuidorademo.com.ar', rol: 'vendedor', iniciales: 'LB', activo: true, zona: 'Lomas de Zamora' },
  { id: 'u-rf', nombre: 'Rocío Ferrari', email: 'rocio@distribuidorademo.com.ar', rol: 'vendedor', iniciales: 'RF', activo: false, zona: 'Lanús' },
]

export const VENDEDORES_ACTIVOS = USUARIOS.filter((u) => u.rol !== 'administrador' && u.activo)

/* --------------------------------------------------------------- empresas */

const PREFIJOS = ['Distribuidora', 'Autoservicio', 'Supermercado', 'Almacén', 'Maxikiosco', 'Minimercado', 'Despensa', 'Mayorista']
const NOMBRES = [
  'San Cayetano', 'La Perla', 'Don Alberto', 'Las Flores', 'El Ceibo', 'Los Andes', 'Santa Clara',
  'El Progreso', 'Nueva Estrella', 'Doña Marta', 'El Rincón', 'La Amistad', 'San Jorge', 'Los Pinos',
  'El Trigal', 'La Esperanza', 'Don Julio', 'El Molino', 'Nueva Era', 'El Sol', 'La Estación',
  'San Martín', 'Los Robles', 'El Puente', 'La Colonia', 'Doña Ana', 'El Faro', 'La Paz',
  'Don Ramón', 'La Central', 'Santa Rosa', 'El Abasto', 'La Familia', 'El Ombú', 'San Pedro',
  'El Galpón', 'La Terminal', 'El Mirador', 'Don Nico', 'El Cruce',
]
const RUBROS = ['Consumo masivo', 'Bebidas', 'Golosinas', 'Limpieza', 'Perfumería', 'Almacén general']
const CANALES = ['kiosco', 'maxikiosco', 'almacén', 'autoservicio', 'minimercado', 'supermercado']
const ZONAS = ['Lomas de Zamora', 'Lanús', 'Avellaneda', 'Quilmes', 'La Matanza', 'CABA Sur']
const LOCALIDADES = ['Banfield', 'Temperley', 'Gerli', 'Wilde', 'Bernal', 'Ramos Mejía', 'Pompeya', 'Barracas', 'Sarandí', 'Valentín Alsina']
const APELLIDOS = ['Gómez', 'Fernández', 'Rodríguez', 'López', 'Martínez', 'Sosa', 'Romero', 'Álvarez', 'Torres', 'Benítez', 'Acosta', 'Medina', 'Herrera', 'Aguirre', 'Cabrera', 'Godoy', 'Molina', 'Ojeda', 'Quiroga', 'Peralta']
const PILAS = ['Carlos', 'Ana', 'Jorge', 'Silvia', 'Marcos', 'Laura', 'Rubén', 'Nadia', 'Walter', 'Elsa', 'Mauro', 'Brian', 'Paula', 'Diego', 'Verónica', 'Ezequiel']
const CARGOS = ['Dueño', 'Dueña', 'Encargado de compras', 'Encargada de compras', 'Gerente', 'Responsable de depósito', 'Administración']

const usados = new Set<string>()
function razonSocial(): string {
  for (let i = 0; i < 80; i++) {
    const r = `${elegir(PREFIJOS)} ${elegir(NOMBRES)}`
    if (!usados.has(r)) {
      usados.add(r)
      return r
    }
  }
  return `Comercio ${usados.size}`
}

const CANT_EMPRESAS = 42

export const EMPRESAS: Empresa[] = Array.from({ length: CANT_EMPRESAS }, (_, i) => ({
  id: `e-${i}`,
  razonSocial: razonSocial(),
  cuit: `${elegir(['20', '23', '27', '30'])}${entre(10_000_000, 44_999_999)}${entre(0, 9)}`,
  rubro: elegir(RUBROS),
  canal: elegir(CANALES),
  zona: elegir(ZONAS),
  localidad: elegir(LOCALIDADES),
  empleados: entre(2, 45),
  propietario: elegir(VENDEDORES_ACTIVOS).id,
}))

/* -------------------------------------------------------------- contactos */

export const CONTACTOS: ContactoCRM[] = EMPRESAS.flatMap((e, i) => {
  const cuantos = rnd() < 0.35 ? 2 : 1
  return Array.from({ length: cuantos }, (_, j) => {
    const nombre = `${elegir(PILAS)} ${elegir(APELLIDOS)}`
    return {
      id: `c-${i}-${j}`,
      empresaId: e.id,
      nombre,
      cargo: j === 0 ? elegir(CARGOS.slice(0, 4)) : elegir(CARGOS.slice(4)),
      email: `${nombre.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '.')}@${e.razonSocial.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '').slice(0, 14)}.com.ar`,
      telefono: `11${entre(30_000_000, 69_999_999)}`,
      whatsapp: rnd() < 0.85,
      principal: j === 0,
    }
  })
})

/* ----------------------------------------------------------- oportunidades */

const TITULOS = [
  'Alta de cuenta y primer pedido',
  'Ampliación de línea de bebidas',
  'Acuerdo anual de reposición',
  'Cambio de proveedor de limpieza',
  'Incorporación de línea de golosinas',
  'Reactivación de cuenta',
  'Apertura de segunda sucursal',
  'Acuerdo de exhibición y volumen',
  'Pase a cuenta corriente 30 días',
  'Compra de temporada',
]
const ORIGENES = ['Visita en frío', 'Referido', 'WhatsApp entrante', 'Recompra detectada', 'Feria del rubro', 'Campaña de mail']
const MOTIVOS_PERDIDA = ['Precio', 'Se quedó con el proveedor actual', 'Sin respuesta', 'Problema de logística', 'Condiciones de pago']

/** Reparto elegido para que el embudo se lea bien en la demo. */
const REPARTO: [Etapa, number][] = [
  ['prospecto', 14],
  ['contactado', 11],
  ['propuesta', 8],
  ['negociacion', 6],
  ['ganado', 12],
  ['perdido', 7],
]

let contadorOp = 0
export const OPORTUNIDADES: Oportunidad[] = REPARTO.flatMap(([etapa, cantidad]) =>
  Array.from({ length: cantidad }, () => {
    const empresa = elegir(EMPRESAS)
    const contacto = CONTACTOS.find((c) => c.empresaId === empresa.id && c.principal)!
    const cerrada = etapa === 'ganado' || etapa === 'perdido'
    const diasCreada = entre(15, 150)
    return {
      id: `o-${contadorOp++}`,
      titulo: elegir(TITULOS),
      empresaId: empresa.id,
      contactoId: contacto.id,
      valor: entre(9, 140) * 10_000,
      etapa,
      cierreEstimado: cerrada ? masDias(-entre(1, 40)) : masDias(entre(3, 75)),
      creada: masDias(-diasCreada),
      cerrada: cerrada ? masDias(-entre(1, 40)) : undefined,
      propietario: empresa.propietario,
      motivoPerdida: etapa === 'perdido' ? elegir(MOTIVOS_PERDIDA) : undefined,
      origen: elegir(ORIGENES),
    } satisfies Oportunidad
  }),
)

/* ------------------------------------------------------------- actividades */

const RESUMENES: Record<TipoActividad, string[]> = {
  llamada: ['Llamada de seguimiento, pide volver a llamar la semana próxima', 'Atendió el encargado, pasa la propuesta al dueño', 'Sin respuesta, se deja mensaje', 'Confirma interés, pide lista actualizada'],
  email: ['Se envía propuesta comercial con lista de precios', 'Se reenvía la cotización con el descuento por volumen', 'Responde pidiendo condiciones de pago a 30 días', 'Se manda el catálogo de temporada'],
  'reunión': ['Reunión en el local, recorrida de góndola', 'Reunión con el dueño y la encargada de compras', 'Presentación de la línea nueva'],
  whatsapp: ['Consulta por stock de bebidas', 'Manda foto de la lista del competidor', 'Confirma recepción del pedido', 'Pide adelantar la entrega'],
  nota: ['Compra fuerte en quincena, conviene visitarlo los martes', 'Tiene cuenta corriente con otro proveedor', 'Va a abrir una sucursal en tres meses'],
}
const TIPOS: TipoActividad[] = ['llamada', 'email', 'reunión', 'whatsapp', 'nota']

export const ACTIVIDADES: Actividad[] = Array.from({ length: 160 }, (_, i) => {
  const op = elegir(OPORTUNIDADES)
  const tipo = elegir(TIPOS)
  return {
    id: `a-${i}`,
    tipo,
    fecha: masDias(-entre(0, 60)),
    resumen: elegir(RESUMENES[tipo]),
    empresaId: op.empresaId,
    contactoId: op.contactoId,
    oportunidadId: op.id,
    usuario: op.propietario,
  }
}).sort((a, b) => b.fecha.localeCompare(a.fecha))

/* ------------------------------------------------------------------ tareas */

const TITULOS_TAREA = [
  'Llamar para confirmar el pedido',
  'Enviar propuesta actualizada',
  'Pasar a buscar el cheque',
  'Recordar vencimiento de la promoción',
  'Coordinar entrega de la semana',
  'Cargar la lista nueva del proveedor',
  'Visitar para relevar góndola',
  'Reunión de cierre',
  'Mandar comprobante de la última entrega',
  'Revisar cuenta corriente vencida',
]

export const TAREAS: Tarea[] = Array.from({ length: 16 }, (_, i) => {
  const op = elegir(OPORTUNIDADES.filter((o) => o.etapa !== 'ganado' && o.etapa !== 'perdido'))
  const desvio = i < 6 ? 0 : entre(-3, 9)
  return {
    id: `t-${i}`,
    titulo: elegir(TITULOS_TAREA),
    vence: masDias(desvio),
    usuario: op.propietario,
    empresaId: op.empresaId,
    oportunidadId: op.id,
    hecha: rnd() < 0.2,
    prioridad: desvio < 0 ? 'alta' : desvio === 0 ? 'alta' : rnd() < 0.4 ? 'media' : 'baja',
  } satisfies Tarea
})

/* ------------------------------------------------- integraciones y reglas */

export const INTEGRACIONES: Integracion[] = [
  { id: 'i-wa', nombre: 'WhatsApp Business', descripcion: 'Recibir consultas y pedidos en la ficha del cliente.', categoria: 'comunicación', conectada: true },
  { id: 'i-mail', nombre: 'Correo electrónico', descripcion: 'Registrar automáticamente los mails enviados y recibidos.', categoria: 'comunicación', conectada: true },
  { id: 'i-mp', nombre: 'Mercado Pago', descripcion: 'Cobros con QR y link de pago asociados a la oportunidad.', categoria: 'cobros', conectada: false },
  { id: 'i-tango', nombre: 'Tango Gestión', descripcion: 'Importar clientes, artículos y ventas desde el sistema de gestión.', categoria: 'gestión', conectada: true },
  { id: 'i-contabilium', nombre: 'Contabilium', descripcion: 'Sincronizar facturación y cuenta corriente.', categoria: 'gestión', conectada: false },
  { id: 'i-afip', nombre: 'Padrón ARCA', descripcion: 'Completar razón social y condición de IVA a partir del CUIT.', categoria: 'datos', conectada: false },
]

export const REGLAS: ReglaAutomatica[] = [
  { id: 'r-1', cuando: 'Una oportunidad pasa a Propuesta enviada', entonces: 'Crear tarea de seguimiento a 3 días para el propietario', activa: true },
  { id: 'r-2', cuando: 'Un cliente supera su cadencia de compra', entonces: 'Abrir alerta de recompra y sumarlo a la Lista del lunes', activa: true },
  { id: 'r-3', cuando: 'Una oportunidad se marca como Ganada', entonces: 'Notificar al supervisor de la zona', activa: true },
  { id: 'r-4', cuando: 'Una oportunidad lleva 15 días sin actividad', entonces: 'Avisar al propietario y marcarla como estancada', activa: false },
  { id: 'r-5', cuando: 'Se registra un saldo vencido mayor a 30 días', entonces: 'Bloquear nuevas propuestas para esa empresa', activa: false },
]

/* ------------------------------------------------------------------ util */

export const empresaDe = (id: string) => EMPRESAS.find((e) => e.id === id)
export const contactoDe = (id: string) => CONTACTOS.find((c) => c.id === id)
export const usuarioDe = (id: string) => USUARIOS.find((u) => u.id === id)
