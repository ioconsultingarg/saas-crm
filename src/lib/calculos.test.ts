import { describe, expect, it } from 'vitest'
import { analizarTodos, conAlerta, contarSegmentos } from './calculos'
import { CLIENTES } from '../data'
import { TOTAL_ALERTAS, TOTAL_EN_RIESGO, EMPRESA } from '../data/seed'

const analizados = analizarTodos(CLIENTES)
const alertas = conAlerta(analizados)
const buscar = (id: string) => analizados.find((c) => c.id === id)!

describe('los totales de la demo cierran', () => {
  it('hay exactamente 412 clientes', () => {
    expect(analizados).toHaveLength(EMPRESA.clientesActivos)
  })

  it('hay 23 clientes con alerta', () => {
    expect(alertas).toHaveLength(TOTAL_ALERTAS)
  })

  it('la suma del monto en riesgo da $4.180.000 exactos', () => {
    const suma = alertas.reduce((a, c) => a + c.a.montoEnRiesgo, 0)
    expect(suma).toBe(TOTAL_EN_RIESGO)
  })

  it('los segmentos suman el total de clientes', () => {
    const c = contarSegmentos(analizados)
    const suma = Object.values(c).reduce((a, b) => a + b, 0)
    expect(suma).toBe(EMPRESA.clientesActivos)
  })
})

describe('los diez clientes de la lista del lunes', () => {
  const esperado: [string, number, number][] = [
    // id, dias sin comprar, monto en riesgo
    ['c-trebol', 63, 728_000],
    ['c-maxi24', 26, 196_333],
    ['c-paz', 33, 187_833],
    ['c-esquina', 41, 179_800],
    ['c-muniz', 55, 162_800],
    ['c-rosa', 39, 145_833],
    ['c-santarita', 44, 85_067],
    ['c-parada', 30, 44_800],
    ['c-rivadavia', 38, 42_000],
    ['c-donpedro', 9, 29_450],
  ]

  it.each(esperado)('%s: %i días sin comprar, monto correcto', (id, dias, monto) => {
    const c = buscar(id)
    expect(c.a.diasSinComprar).toBe(dias)
    expect(c.a.montoEnRiesgo).toBe(monto)
  })

  it('los diez suman 1.801.916', () => {
    const suma = esperado.reduce((a, [id]) => a + buscar(id).a.montoEnRiesgo, 0)
    expect(suma).toBe(1_801_916)
  })
})

describe('el caso trampa de Almacén Don Pedro', () => {
  const c = () => buscar('c-donpedro')

  it('compró hace pocos días, así que no es "dejó de comprar"', () => {
    expect(c().a.diasSinComprar).toBeLessThan(c().cadencia! * 1.5)
    expect(c().a.alerta).toBe('compra menos')
  })

  it('los pesos suben y las unidades bajan', () => {
    expect(c().a.tendenciaPesos).toBeGreaterThan(0)
    expect(c().a.tendenciaUnidades).toBeLessThan(-0.25)
    expect(c().a.caidaDisfrazada).toBe(true)
  })
})

describe('reglas que evitan falsas alertas', () => {
  it('ningún cliente dormido o perdido genera alerta', () => {
    const malos = analizados.filter(
      (c) => (c.a.segmento === 'dormido' || c.a.segmento === 'perdido') && c.a.alerta !== null,
    )
    expect(malos).toHaveLength(0)
  })

  it('ningún activo frecuente genera alerta', () => {
    const malos = analizados.filter((c) => c.a.segmento === 'activo frecuente' && c.a.alerta)
    expect(malos).toHaveLength(0)
  })

  it('el cliente con una sola compra no tiene cadencia calculada', () => {
    expect(buscar('c-rivadavia').cadencia).toBeNull()
    expect(buscar('c-rivadavia').a.alerta).toBe('cliente nuevo sin segunda compra')
  })
})
