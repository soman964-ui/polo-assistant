import { useMemo, useState } from 'react'
import { AlertTriangle, CalendarClock, ChevronRight, Fuel, Gauge, Pencil, Wallet, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import GaugeRing from '@/components/GaugeRing'
import { averageConsumption, formatDate, formatKm, formatRub, useStore } from '@/lib/store'
import { computeDue, STATUS_META, type DueInfo } from '@/lib/maintenance'
import { engineLabel, gearboxByCode, MAINTENANCE_SCHEDULE } from '@/data/polo'
import { toast } from 'sonner'

interface OverviewProps {
  goTo: (tab: string) => void
}

export default function Overview({ goTo }: OverviewProps) {
  const store = useStore()
  const { profile, maintenance, fuel, expenses } = store
  const [odoOpen, setOdoOpen] = useState(false)
  const [odoValue, setOdoValue] = useState(String(profile.mileage))

  const due = useMemo(() => computeDue(maintenance, profile.mileage), [maintenance, profile.mileage])
  const nextDue = useMemo(() => {
    const ranked = due
      .filter((d) => d.status !== 'unknown')
      .sort((a, b) => {
        const rank = { overdue: 0, soon: 1, ok: 2 } as const
        if (rank[a.status as keyof typeof rank] !== rank[b.status as keyof typeof rank])
          return rank[a.status as keyof typeof rank] - rank[b.status as keyof typeof rank]
        return (a.kmLeft ?? Infinity) - (b.kmLeft ?? Infinity)
      })
    return ranked[0] ?? null
  }, [due])

  const avgConsumption = useMemo(() => averageConsumption(fuel), [fuel])

  const monthExpenses = useMemo(() => {
    const now = new Date()
    return expenses
      .filter((e) => {
        const d = new Date(e.date)
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      })
      .reduce((s, e) => s + e.amount, 0)
  }, [expenses])

  const totalExpenses = useMemo(() => {
    const service = maintenance.reduce((s, r) => s + r.cost, 0)
    const fuelCost = fuel.reduce((s, r) => s + r.liters * r.pricePerLiter, 0)
    const other = expenses.reduce((s, r) => s + r.amount, 0)
    return service + fuelCost + other
  }, [maintenance, fuel, expenses])

  const upcoming = useMemo(
    () =>
      due
        .filter((d) => d.status === 'overdue' || d.status === 'soon')
        .sort((a, b) => (a.status === 'overdue' ? 0 : 1) - (b.status === 'overdue' ? 0 : 1))
        .slice(0, 3),
    [due],
  )

  const activity = useMemo(() => {
    const items = [
      ...maintenance.map((r) => ({
        date: r.date,
        icon: Wrench,
        text: MAINTENANCE_SCHEDULE.find((t) => t.id === r.typeId)?.name ?? r.note,
        sub: `${formatKm(r.mileage)}${r.cost ? ' · ' + formatRub(r.cost) : ''}`,
      })),
      ...fuel.map((r) => ({
        date: r.date,
        icon: Fuel,
        text: `Заправка ${r.liters.toFixed(1)} л`,
        sub: `${formatKm(r.mileage)} · ${formatRub(r.liters * r.pricePerLiter)}`,
      })),
      ...expenses.map((r) => ({
        date: r.date,
        icon: Wallet,
        text: r.description,
        sub: formatRub(r.amount),
      })),
    ]
    return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6)
  }, [maintenance, fuel, expenses])

  const saveOdo = () => {
    const v = parseInt(odoValue.replace(/\D/g, ''), 10)
    if (!Number.isFinite(v) || v < 0 || v > 2_000_000) {
      toast.error('Введите корректный пробег')
      return
    }
    store.setProfile({ ...profile, mileage: v })
    setOdoOpen(false)
    toast.success('Пробег обновлён')
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Герой: автомобиль + одометр */}
      <Card className="card-glow border-border/70 bg-card">
        <CardContent className="flex flex-col gap-6 p-5 md:flex-row md:items-center md:justify-between md:p-7">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Volkswagen Polo Sedan</p>
            <h2 className="font-display mt-2 text-xl font-semibold leading-snug md:text-2xl">
              {engineLabel(profile.engine)}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {[profile.year + ' г.', gearboxByCode(profile.transmission)?.name ?? profile.transmission, profile.plate].filter(Boolean).map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-secondary-foreground"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setOdoValue(String(profile.mileage))
              setOdoOpen(true)
            }}
            className="group flex items-center gap-4 self-start rounded-xl border border-border bg-secondary/40 px-5 py-4 text-left transition-colors hover:border-primary/50 hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:self-auto"
            aria-label="Изменить пробег"
          >
            <Gauge className="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <p className="text-xs text-muted-foreground">Пробег</p>
              <p className="font-display odo text-2xl font-semibold tabular md:text-3xl">
                {new Intl.NumberFormat('ru-RU').format(profile.mileage)}
                <span className="ml-1 text-sm font-medium text-muted-foreground">км</span>
              </p>
            </div>
            <Pencil className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden="true" />
          </button>
        </CardContent>
      </Card>

      {/* Статистика */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <Card className="card-glow col-span-2 md:col-span-1">
          <CardContent className="flex items-center gap-4 p-4 md:p-5">
            {nextDue ? (
              <>
                <GaugeRing progress={nextDue.progress} tone={nextDue.status} size={72} stroke={7}>
                  <span className={`text-[10px] font-bold uppercase ${STATUS_META[nextDue.status].className}`}>
                    {STATUS_META[nextDue.status].label}
                  </span>
                </GaugeRing>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Ближайшее ТО</p>
                  <p className="truncate text-sm font-semibold">{nextDue.type.name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {nextDue.kmLeft != null && nextDue.kmLeft > 0 && `осталось ${formatKm(nextDue.kmLeft)}`}
                    {nextDue.kmLeft != null && nextDue.kmLeft <= 0 && `просрочено на ${formatKm(-nextDue.kmLeft)}`}
                    {nextDue.kmLeft == null && nextDue.daysLeft != null && (nextDue.daysLeft > 0 ? `осталось ${nextDue.daysLeft} дн.` : `просрочено на ${-nextDue.daysLeft} дн.`)}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <CalendarClock className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                <div>
                  <p className="text-xs text-muted-foreground">Ближайшее ТО</p>
                  <p className="text-sm font-semibold">Добавьте первую запись</p>
                  <button type="button" onClick={() => goTo('maintenance')} className="mt-0.5 text-xs font-semibold text-primary hover:underline">
                    Открыть обслуживание
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <StatTile
          icon={<Fuel className="h-5 w-5" aria-hidden="true" />}
          label="Средний расход"
          value={avgConsumption != null ? avgConsumption.toFixed(1) : '—'}
          unit="л/100 км"
          onClick={() => goTo('fuel')}
        />
        <StatTile
          icon={<Wallet className="h-5 w-5" aria-hidden="true" />}
          label="Расходы за месяц"
          value={formatRub(monthExpenses)}
          onClick={() => goTo('expenses')}
        />
        <StatTile
          icon={<Wrench className="h-5 w-5" aria-hidden="true" />}
          label="Всего вложено"
          value={formatRub(totalExpenses)}
          onClick={() => goTo('expenses')}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Что требует внимания */}
        <Card className="card-glow">
          <CardContent className="p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <AlertTriangle className="h-4 w-4 text-[hsl(38_95%_55%)]" aria-hidden="true" />
                Требует внимания
              </h3>
              <Button variant="ghost" size="sm" onClick={() => goTo('maintenance')} className="h-8 gap-1 text-xs">
                Все работы <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </div>
            {upcoming.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">
                {due.every((d) => d.status === 'unknown')
                  ? 'Записей об обслуживании пока нет — добавьте первое ТО, чтобы видеть прогноз.'
                  : 'Всё в порядке, просроченных работ нет.'}
              </p>
            ) : (
              <ul className="space-y-2">
                {upcoming.map((d: DueInfo) => (
                  <li key={d.type.id} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_META[d.status].dot}`} aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{d.type.name}</p>
                      <p className={`text-xs ${STATUS_META[d.status].className}`}>
                        {d.kmLeft != null
                          ? d.kmLeft > 0
                            ? `осталось ${formatKm(d.kmLeft)}`
                            : `просрочено на ${formatKm(-d.kmLeft)}`
                          : d.daysLeft != null
                            ? d.daysLeft > 0
                              ? `осталось ${d.daysLeft} дн.`
                              : `просрочено на ${-d.daysLeft} дн.`
                            : ''}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Лента событий */}
        <Card className="card-glow">
          <CardContent className="p-4 md:p-5">
            <h3 className="mb-3 text-sm font-semibold">Последние записи</h3>
            {activity.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">
                Пока пусто. Добавьте заправку, расход или запись о ТО — они появятся здесь.
              </p>
            ) : (
              <ul className="space-y-1">
                {activity.map((item, i) => (
                  <li key={i} className="flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-secondary/50">
                    <item.icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">{item.text}</p>
                      <p className="text-xs text-muted-foreground">{item.sub}</p>
                    </div>
                    <time className="shrink-0 text-xs text-muted-foreground">{formatDate(item.date)}</time>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Одометр */}
      <Dialog open={odoOpen} onOpenChange={setOdoOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Текущий пробег</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="odo">Пробег, км</Label>
            <Input
              id="odo"
              inputMode="numeric"
              value={odoValue}
              onChange={(e) => setOdoValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveOdo()}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">Пробег автоматически растёт при добавлении записей с большим значением.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOdoOpen(false)}>Отмена</Button>
            <Button onClick={saveOdo}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatTile({
  icon,
  label,
  value,
  unit,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  value: string
  unit?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="card-glow rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:p-5"
    >
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="font-display odo mt-2 truncate text-lg font-semibold tabular md:text-xl">
        {value}
        {unit && <span className="ml-1 text-xs font-medium text-muted-foreground">{unit}</span>}
      </p>
    </button>
  )
}
