import { describe, expect, it } from 'vitest'
import {
  ENGINES,
  GEARBOXES,
  MAINTENANCE_SCHEDULE,
  engineByCode,
  engineLabel,
  gearboxByCode,
} from './polo'

describe('VW Polo reference data', () => {
  it('finds engines and returns undefined for an unknown code', () => {
    expect(engineByCode('CWVA')).toMatchObject({
      code: 'CWVA',
      name: '1.6 MPI',
      family: 'EA211',
      power: expect.stringContaining('110 л.с.'),
    })
    expect(engineByCode('UNKNOWN')).toBeUndefined()
  })

  it('finds gearboxes by code', () => {
    expect(gearboxByCode('09G')).toMatchObject({
      code: '09G',
      kind: 'Автомат',
    })
    expect(gearboxByCode('UNKNOWN')).toBeUndefined()
  })

  it('formats engine labels for known and unknown codes', () => {
    expect(engineLabel('CWVA')).toBe('CWVA 1.6 MPI · 110 л.с.')
    expect(engineLabel('CUSTOM')).toBe('CUSTOM')
  })

  it('keeps all engine gearbox references resolvable', () => {
    const gearboxCodes = new Set(GEARBOXES.map((gearbox) => gearbox.code))

    for (const engine of ENGINES) {
      for (const gearboxCode of engine.gearboxes) {
        expect(gearboxCodes.has(gearboxCode), `${engine.code} -> ${gearboxCode}`).toBe(true)
      }
    }
  })

  it('keeps maintenance schedule ids unique and fully populated', () => {
    const ids = MAINTENANCE_SCHEDULE.map((item) => item.id)

    expect(new Set(ids).size).toBe(ids.length)
    expect(MAINTENANCE_SCHEDULE.length).toBeGreaterThan(5)
    expect(MAINTENANCE_SCHEDULE.every((item) => item.name && item.note)).toBe(true)
  })
})
