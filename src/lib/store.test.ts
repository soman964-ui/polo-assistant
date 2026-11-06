import { describe, expect, it } from 'vitest'
import { averageConsumption } from './store'

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
