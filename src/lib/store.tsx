import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { CarProfile, ExpenseRecord, FuelRecord, MaintenanceRecord } from '@/types'

const STORAGE_KEY = 'polo-assistant-v1'

export const DEFAULT_PROFILE: CarProfile = {
  year: 2016,
  engine: 'CWVA',
  transmission: '09G',
  plate: '',
  vin: '',
  mileage: 60000,
  purchaseDate: '',
}

/** Миграция старых текстовых значений профиля в коды двигателя/коробки */
function migrateProfile(p: Partial<CarProfile> | undefined): CarProfile {
  const merged = { ...DEFAULT_PROFILE, ...p }
  const engineMap: [RegExp, string][] = [
    [/CFNA/i, 'CFNA'],
    [/CFNB/i, 'CFNB'],
    [/CLSA/i, 'CLSA'],
    [/CWVB|90 л\.с\./i, 'CWVB'],
    [/CWVA|110 л\.с\./i, 'CWVA'],
    [/CZCA|TSI/i, 'CZCA'],
  ]
  for (const [re, code] of engineMap) {
    if (re.test(merged.engine)) {
      merged.engine = code
      break
    }
  }
  const gbMap: [RegExp, string][] = [
    [/09G|АКПП \(Aisin|6АКПП/i, '09G'],
    [/DSG|DQ200/i, 'DQ200'],
    [/6МКПП|6-ступ.*мех/i, 'MQ200-6'],
    [/5МКПП|МКПП|мех/i, 'MQ200-5'],
  ]
  for (const [re, code] of gbMap) {
    if (re.test(merged.transmission)) {
      merged.transmission = code
      break
    }
  }
  return merged
}

interface AppData {
  profile: CarProfile
  maintenance: MaintenanceRecord[]
  fuel: FuelRecord[]
  expenses: ExpenseRecord[]
}

interface Store extends AppData {
  setProfile: (p: CarProfile) => void
  addMaintenance: (r: Omit<MaintenanceRecord, 'id'>) => void
  removeMaintenance: (id: string) => void
  addFuel: (r: Omit<FuelRecord, 'id'>) => void
  removeFuel: (id: string) => void
  addExpense: (r: Omit<ExpenseRecord, 'id'>) => void
  removeExpense: (id: string) => void
  exportData: () => string
  importData: (json: string) => boolean
  resetAll: () => void
}

const StoreContext = createContext<Store | null>(null)

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function load(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<AppData>
      return {
        profile: migrateProfile(parsed.profile),
        maintenance: parsed.maintenance ?? [],
        fuel: parsed.fuel ?? [],
        expenses: parsed.expenses ?? [],
      }
    }
  } catch {
    /* повреждённые данные — начинаем с чистого листа */
  }
  return { profile: DEFAULT_PROFILE, maintenance: [], fuel: [], expenses: [] }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(load)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  const setProfile = useCallback((p: CarProfile) => setData((d) => ({ ...d, profile: p })), [])

  const addMaintenance = useCallback(
    (r: Omit<MaintenanceRecord, 'id'>) =>
      setData((d) => ({
        ...d,
        maintenance: [...d.maintenance, { ...r, id: uid() }],
        profile: r.mileage > d.profile.mileage ? { ...d.profile, mileage: r.mileage } : d.profile,
      })),
    [],
  )
  const removeMaintenance = useCallback(
    (id: string) => setData((d) => ({ ...d, maintenance: d.maintenance.filter((r) => r.id !== id) })),
    [],
  )

  const addFuel = useCallback(
    (r: Omit<FuelRecord, 'id'>) =>
      setData((d) => ({
        ...d,
        fuel: [...d.fuel, { ...r, id: uid() }],
        profile: r.mileage > d.profile.mileage ? { ...d.profile, mileage: r.mileage } : d.profile,
      })),
    [],
  )
  const removeFuel = useCallback(
    (id: string) => setData((d) => ({ ...d, fuel: d.fuel.filter((r) => r.id !== id) })),
    [],
  )

  const addExpense = useCallback(
    (r: Omit<ExpenseRecord, 'id'>) => setData((d) => ({ ...d, expenses: [...d.expenses, { ...r, id: uid() }] })),
    [],
  )
  const removeExpense = useCallback(
    (id: string) => setData((d) => ({ ...d, expenses: d.expenses.filter((r) => r.id !== id) })),
    [],
  )

  const exportData = useCallback(() => JSON.stringify(data, null, 2), [data])

  const importData = useCallback((json: string) => {
    try {
      const parsed = JSON.parse(json) as Partial<AppData>
      if (typeof parsed !== 'object' || parsed === null) return false
      setData({
        profile: migrateProfile(parsed.profile),
        maintenance: Array.isArray(parsed.maintenance) ? parsed.maintenance : [],
        fuel: Array.isArray(parsed.fuel) ? parsed.fuel : [],
        expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
      })
      return true
    } catch {
      return false
    }
  }, [])

  const resetAll = useCallback(() => {
    setData({ profile: DEFAULT_PROFILE, maintenance: [], fuel: [], expenses: [] })
  }, [])

  const value = useMemo<Store>(
    () => ({
      ...data,
      setProfile,
      addMaintenance,
      removeMaintenance,
      addFuel,
      removeFuel,
      addExpense,
      removeExpense,
      exportData,
      importData,
      resetAll,
    }),
    [data, setProfile, addMaintenance, removeMaintenance, addFuel, removeFuel, addExpense, removeExpense, exportData, importData, resetAll],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}

/** Расчёт среднего расхода по полным заправкам: л/100 км */
export function averageConsumption(fuel: FuelRecord[]): number | null {
  const sorted = [...fuel].sort((a, b) => a.mileage - b.mileage)
  let lastFull: FuelRecord | null = null
  let litersSince = 0
  let totalLiters = 0
  let totalKm = 0
  for (const r of sorted) {
    if (!lastFull) {
      if (r.fullTank) lastFull = r
      continue
    }
    litersSince += r.liters
    if (r.fullTank) {
      const km = r.mileage - lastFull.mileage
      if (km > 0) {
        totalKm += km
        totalLiters += litersSince
      }
      lastFull = r
      litersSince = 0
    }
  }
  if (totalKm <= 0 || totalLiters <= 0) return null
  return (totalLiters / totalKm) * 100
}

/** Расходы между соседними полными заправками для графика */
export function consumptionPoints(fuel: FuelRecord[]): { date: string; value: number }[] {
  const sorted = [...fuel].sort((a, b) => a.mileage - b.mileage)
  const points: { date: string; value: number }[] = []
  let lastFull: FuelRecord | null = null
  let litersSince = 0
  for (const r of sorted) {
    if (!lastFull) {
      if (r.fullTank) lastFull = r
      continue
    }
    litersSince += r.liters
    if (r.fullTank) {
      const km = r.mileage - lastFull.mileage
      if (km > 0) points.push({ date: r.date, value: +((litersSince / km) * 100).toFixed(1) })
      lastFull = r
      litersSince = 0
    }
  }
  return points
}

export function formatRub(n: number): string {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n) + ' ₽'
}

export function formatKm(n: number): string {
  return new Intl.NumberFormat('ru-RU').format(n) + ' км'
}

export function formatDate(iso: string): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}
