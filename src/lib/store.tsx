import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import type { CarProfile, ExpenseRecord, FuelRecord, MaintenanceRecord } from '@/types'
import { parseISODateLocal } from '@/lib/dates'

export const STORAGE_KEY = 'polo-assistant-v1'
/** Максимальный размер JSON при импорте резервной копии (защита от зависания вкладки) */
export const IMPORT_MAX_BYTES = 5 * 1024 * 1024

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

export interface AppData {
  profile: CarProfile
  maintenance: MaintenanceRecord[]
  fuel: FuelRecord[]
  expenses: ExpenseRecord[]
}

/* ── Схемы валидации данных (localStorage / импорт JSON) ─────────── */

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'ожидается дата в формате ГГГГ-ММ-ДД')
const mileageValue = z.coerce.number().finite().min(0).max(2_000_000)
const moneyValue = z.coerce.number().finite().min(0).max(1_000_000_000)

const profileSchema = z.object({
  year: z.coerce.number().int().min(1990).max(2100).catch(DEFAULT_PROFILE.year),
  engine: z.string().max(24).catch(DEFAULT_PROFILE.engine),
  transmission: z.string().max(24).catch(DEFAULT_PROFILE.transmission),
  plate: z.string().max(16).catch(''),
  vin: z.string().max(17).catch(''),
  mileage: mileageValue.catch(DEFAULT_PROFILE.mileage),
  purchaseDate: z.string().max(10).catch(''),
})

const idValue = z.string().min(1).max(64).catch(() => uid())

const maintenanceSchema = z.object({
  id: idValue,
  date: isoDate,
  mileage: mileageValue,
  typeId: z.string().max(64).catch('custom'),
  note: z.string().max(2000).catch(''),
  cost: moneyValue.catch(0),
})

const fuelSchema = z.object({
  id: idValue,
  date: isoDate,
  mileage: mileageValue,
  liters: z.coerce.number().finite().gt(0).max(500),
  pricePerLiter: z.coerce.number().finite().gt(0).max(10_000),
  fullTank: z.boolean().catch(true),
})

const expenseSchema = z.object({
  id: idValue,
  date: isoDate,
  category: z.enum(['service', 'parts', 'insurance', 'tax', 'parking', 'wash', 'tolls', 'other']).catch('other'),
  description: z.string().max(500).catch(''),
  amount: moneyValue,
})

function sanitizeArray<S extends z.ZodTypeAny>(value: unknown, schema: S): z.output<S>[] {
  if (!Array.isArray(value)) return []
  const out: z.output<S>[] = []
  for (const item of value) {
    const result = schema.safeParse(item)
    if (result.success) {
      out.push(result.data)
    } else {
      console.warn('Пропущена повреждённая запись при чтении данных:', result.error.issues[0]?.message)
    }
  }
  return out
}

/**
 * Приводит недоверенные данные (localStorage / импортированный JSON)
 * к валидной структуре. Битые отдельные записи отбрасываются,
 * профиль деградирует до значений по умолчанию по полям.
 * Возвращает null только если вход вообще не объект.
 */
export function sanitizeAppData(parsed: unknown): AppData | null {
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null
  const record = parsed as Record<string, unknown>
  const profile = profileSchema.catch(DEFAULT_PROFILE).parse(record.profile)
  return {
    profile: migrateProfile(profile),
    maintenance: sanitizeArray(record.maintenance, maintenanceSchema),
    fuel: sanitizeArray(record.fuel, fuelSchema),
    expenses: sanitizeArray(record.expenses, expenseSchema),
  }
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
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function load(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const data = sanitizeAppData(JSON.parse(raw))
      if (data) return data
    }
  } catch {
    /* повреждённые данные — начинаем с чистого листа */
  }
  return { profile: DEFAULT_PROFILE, maintenance: [], fuel: [], expenses: [] }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(load)
  const quotaWarned = useRef(false)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Не удалось сохранить данные в localStorage:', error)
      if (!quotaWarned.current) {
        quotaWarned.current = true
        toast.error('Хранилище недоступно или переполнено — данные не сохранятся. Сделайте экспорт JSON в настройках.')
      }
    }
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

  const exportData = useCallback(
    () =>
      JSON.stringify(
        {
          version: 1,
          exportedAt: new Date().toISOString(),
          ...data,
        },
        null,
        2,
      ),
    [data],
  )

  const importData = useCallback((json: string) => {
    try {
      if (json.length > IMPORT_MAX_BYTES) return false
      const data = sanitizeAppData(JSON.parse(json))
      if (!data) return false
      setData(data)
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
  const d = parseISODateLocal(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' })
}
