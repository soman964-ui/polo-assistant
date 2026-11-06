import { describe, expect, it } from 'vitest'
import { averageConsumption, consumptionPoints, formatDate, formatKm, formatRub, sanitizeAppData, DEFAULT_PROFILE } from './store'

describe('averageConsumption', () => {
  it('calculates consumption between full-tank records', () => {
    const result = averageConsumption([
      {
        id: 'start',
        date: '2026-01-01',
        mileage: 60_000,
        liters: 40,
        pricePerLiter: 60,
        fullTank: true,
      },
      {
        id: 'middle',
        date: '2026-01-15',
        mileage: 60_400,
        liters: 20,
        pricePerLiter: 60,
        fullTank: false,
      },
      {
        id: 'end',
        date: '2026-02-01',
        mileage: 60_500,
        liters: 10,
        pricePerLiter: 60,
        fullTank: true,
      },
    ])

    expect(result).toBe(6)
  })

  it('returns null when there are not enough full-tank records', () => {
    expect(
      averageConsumption([
        {
          id: 'only-record',
          date: '2026-01-01',
          mileage: 60_000,
          liters: 40,
          pricePerLiter: 60,
          fullTank: true,
        },
      ]),
    ).toBeNull()
  })
})

describe('consumptionPoints', () => {
  it('returns one point for each completed full-tank interval', () => {
    const points = consumptionPoints([
      { id: 'first', date: '2026-01-01', mileage: 60_000, liters: 40, pricePerLiter: 60, fullTank: true },
      { id: 'middle', date: '2026-01-15', mileage: 60_400, liters: 20, pricePerLiter: 60, fullTank: false },
      { id: 'second', date: '2026-02-01', mileage: 60_500, liters: 10, pricePerLiter: 60, fullTank: true },
      { id: 'third', date: '2026-02-15', mileage: 61_000, liters: 25, pricePerLiter: 60, fullTank: true },
    ])

    expect(points).toEqual([
      { date: '2026-02-01', value: 6 },
      { date: '2026-02-15', value: 5 },
    ])
  })
})

describe('formatters', () => {
  it('formats amounts, mileage and dates for the Russian locale', () => {
    expect(formatRub(12_345)).toBe('12 345 ₽')
    expect(formatKm(60_000)).toBe('60 000 км')
    expect(formatDate('2026-01-15')).toContain('2026')
    expect(formatDate('')).toBe('—')
  })
})

describe('sanitizeAppData', () => {
  it('returns null for non-object input', () => {
    expect(sanitizeAppData(null)).toBeNull()
    expect(sanitizeAppData('broken')).toBeNull()
    expect(sanitizeAppData([1, 2, 3])).toBeNull()
  })

  it('passes through a valid export (versioned format)', () => {
    const input = {
      version: 1,
      exportedAt: '2026-11-06T00:00:00.000Z',
      profile: { ...DEFAULT_PROFILE, mileage: 75_000, plate: 'А123БВ777' },
      maintenance: [{ id: 'm1', date: '2026-01-10', mileage: 70_000, typeId: 'oil', note: 'масло', cost: 4500 }],
      fuel: [{ id: 'f1', date: '2026-02-01', mileage: 74_000, liters: 40, pricePerLiter: 55.5, fullTank: true }],
      expenses: [{ id: 'e1', date: '2026-02-02', category: 'wash', description: 'мойка', amount: 800 }],
    }
    const out = sanitizeAppData(input)
    expect(out).not.toBeNull()
    expect(out?.profile.mileage).toBe(75_000)
    expect(out?.profile.plate).toBe('А123БВ777')
    expect(out?.maintenance).toHaveLength(1)
    expect(out?.fuel[0].liters).toBe(40)
    expect(out?.expenses[0].category).toBe('wash')
  })

  it('drops invalid records but keeps valid ones', () => {
    const input = {
      profile: DEFAULT_PROFILE,
      maintenance: [
        { id: 'ok', date: '2026-01-10', mileage: 70_000, typeId: 'oil', note: '', cost: 1000 },
        { id: 'bad', date: '10.01.2026', mileage: 70_000, typeId: 'oil', note: '', cost: 1000 },
      ],
      fuel: [
        { id: 'ok', date: '2026-02-01', mileage: 74_000, liters: 40, pricePerLiter: 55.5, fullTank: true },
        { id: 'bad', date: '2026-02-01', mileage: 74_000, liters: null, pricePerLiter: 55.5, fullTank: true },
        { id: 'bad2', date: '2026-02-02', mileage: 74_100, liters: -3, pricePerLiter: 55.5, fullTank: true },
      ],
      expenses: 'not-an-array',
    }
    const out = sanitizeAppData(input)
    expect(out?.maintenance.map((r) => r.id)).toEqual(['ok'])
    expect(out?.fuel.map((r) => r.id)).toEqual(['ok'])
    expect(out?.expenses).toEqual([])
  })

  it('coerces numeric strings and falls back per-field for profile', () => {
    const input = {
      profile: { year: '2018', engine: 12345, mileage: '80000', plate: 777, vin: 'XW8ZZZ4G0AG000001' },
      maintenance: [],
      fuel: [],
      expenses: [],
    }
    const out = sanitizeAppData(input)
    expect(out?.profile.year).toBe(2018)
    expect(out?.profile.mileage).toBe(80_000)
    expect(out?.profile.engine).toBe(DEFAULT_PROFILE.engine)
    expect(out?.profile.plate).toBe('')
    expect(out?.profile.vin).toBe('XW8ZZZ4G0AG000001')
  })

  it('defaults a completely broken profile', () => {
    const out = sanitizeAppData({ profile: 'junk', maintenance: [], fuel: [], expenses: [] })
    expect(out?.profile).toEqual(DEFAULT_PROFILE)
  })
})
