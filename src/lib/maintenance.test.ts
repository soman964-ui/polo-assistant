import { describe, expect, it } from 'vitest'
import { computeDue } from './maintenance'
import type { MaintenanceRecord } from '@/types'

const record = (overrides: Partial<MaintenanceRecord> = {}): MaintenanceRecord => ({
  id: 'record-1',
  date: '2026-01-01',
  mileage: 60_000,
  typeId: 'oil',
  note: '',
  cost: 0,
  ...overrides,
})

describe('computeDue', () => {
  it('marks maintenance without a record as unknown', () => {
    const [oil] = computeDue([], 60_000, new Date('2026-01-15'))

    expect(oil).toMatchObject({
      status: 'unknown',
      kmLeft: null,
      daysLeft: null,
      last: null,
      progress: 0,
    })
  })

  it('marks an interval as soon when the mileage threshold is near', () => {
    const [oil] = computeDue(
      [record({ mileage: 60_000, date: '2026-01-01' })],
      73_600,
      new Date('2026-01-15'),
    )

    expect(oil.status).toBe('soon')
    expect(oil.kmLeft).toBe(1_400)
    expect(oil.progress).toBeCloseTo(0.9067, 3)
  })

  it('prioritizes an overdue time interval over an otherwise valid mileage interval', () => {
    const [oil] = computeDue(
      [record({ mileage: 60_000, date: '2025-01-01' })],
      60_500,
      new Date('2026-02-01'),
    )

    expect(oil.status).toBe('overdue')
    expect(oil.kmLeft).toBe(14_500)
    expect(oil.daysLeft).toBeLessThanOrEqual(0)
  })

  it('caps progress at one and uses the newest record by mileage', () => {
    const [oil] = computeDue(
      [
        record({ id: 'old', mileage: 70_000, date: '2026-03-01' }),
        record({ id: 'new', mileage: 65_000, date: '2026-04-01' }),
      ],
      90_000,
      new Date('2026-05-01'),
    )

    expect(oil.last?.id).toBe('old')
    expect(oil.kmLeft).toBe(-5_000)
    expect(oil.progress).toBe(1)
  })

  it('returns a soon status for a time interval within thirty days', () => {
    const brakeFluid = computeDue(
      [record({ typeId: 'brake-fluid', date: '2024-01-01', mileage: 60_000 })],
      60_000,
      new Date('2025-12-10'),
    ).find((item) => item.type.id === 'brake-fluid')

    expect(brakeFluid).toBeDefined()
    expect(brakeFluid?.status).toBe('soon')
    expect(brakeFluid?.kmLeft).toBeNull()
    expect(brakeFluid?.daysLeft).toBeGreaterThan(0)
    expect(brakeFluid?.daysLeft).toBeLessThanOrEqual(30)
  })
})
