import { describe, expect, it } from 'vitest'
import { averageConsumption, consumptionPoints, formatDate, formatKm, formatRub } from './store'

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
