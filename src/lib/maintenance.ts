import { MAINTENANCE_SCHEDULE } from '@/data/polo'
import { parseISODateLocal } from '@/lib/dates'
import type { MaintenanceRecord, MaintenanceType } from '@/types'

export type DueStatus = 'overdue' | 'soon' | 'ok' | 'unknown'

export interface DueInfo {
  type: MaintenanceType
  status: DueStatus
  /** осталось км (null — нет пробегового интервала) */
  kmLeft: number | null
  /** осталось дней (null — нет временного интервала) */
  daysLeft: number | null
  last: MaintenanceRecord | null
  /** 0..1 прогресс износа интервала (для кольца) */
  progress: number
}

const MS_DAY = 24 * 60 * 60 * 1000
const SOON_KM = 1500
const SOON_DAYS = 30

function worst(a: DueStatus, b: DueStatus): DueStatus {
  const rank: Record<DueStatus, number> = { overdue: 3, soon: 2, unknown: 1, ok: 0 }
  return rank[a] >= rank[b] ? a : b
}

export function computeDue(
  records: MaintenanceRecord[],
  mileage: number,
  now: Date = new Date(),
): DueInfo[] {
  return MAINTENANCE_SCHEDULE.map((type) => {
    const last =
      records
        .filter((r) => r.typeId === type.id)
        .sort((a, b) => (a.mileage !== b.mileage ? b.mileage - a.mileage : b.date.localeCompare(a.date)))[0] ?? null

    let kmLeft: number | null = null
    let daysLeft: number | null = null
    let status: DueStatus = 'unknown'
    let progress = 0

    if (last) {
      let kmStatus: DueStatus = 'ok'
      let timeStatus: DueStatus = 'ok'

      if (type.intervalKm != null) {
        kmLeft = type.intervalKm - (mileage - last.mileage)
        kmStatus = kmLeft <= 0 ? 'overdue' : kmLeft <= SOON_KM ? 'soon' : 'ok'
        progress = Math.max(progress, Math.min(1, (mileage - last.mileage) / type.intervalKm))
      }
      if (type.intervalMonths != null) {
        const dueAt = parseISODateLocal(last.date)
        dueAt.setMonth(dueAt.getMonth() + type.intervalMonths)
        daysLeft = Math.ceil((dueAt.getTime() - now.getTime()) / MS_DAY)
        timeStatus = daysLeft <= 0 ? 'overdue' : daysLeft <= SOON_DAYS ? 'soon' : 'ok'
        const totalDays = type.intervalMonths * 30.4
        progress = Math.max(progress, Math.min(1, 1 - daysLeft / totalDays))
      }
      status = worst(kmStatus, timeStatus)
    }

    return { type, status, kmLeft, daysLeft, last, progress }
  })
}

export const STATUS_META: Record<DueStatus, { label: string; className: string; dot: string }> = {
  overdue: { label: 'Просрочено', className: 'text-[hsl(4_78%_62%)]', dot: 'bg-[hsl(4_78%_56%)]' },
  soon: { label: 'Скоро', className: 'text-[hsl(38_95%_60%)]', dot: 'bg-[hsl(38_95%_55%)]' },
  ok: { label: 'В норме', className: 'text-[hsl(152_60%_55%)]', dot: 'bg-[hsl(152_60%_45%)]' },
  unknown: { label: 'Нет данных', className: 'text-muted-foreground', dot: 'bg-muted-foreground/50' },
}
