import { useMemo, useState } from 'react'
import { Droplets, Fuel as FuelIcon, Plus, Trash2, TrendingDown } from 'lucide-react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { averageConsumption, consumptionPoints, formatDate, formatKm, formatRub, useStore } from '@/lib/store'
import { toast } from 'sonner'

export default function Fuel() {
  const store = useStore()
  const { profile, fuel } = store
  const [addOpen, setAddOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const avg = useMemo(() => averageConsumption(fuel), [fuel])
  const points = useMemo(() => consumptionPoints(fuel), [fuel])
  const totalLiters = useMemo(() => fuel.reduce((s, r) => s + r.liters, 0), [fuel])
  const totalCost = useMemo(() => fuel.reduce((s, r) => s + r.liters * r.pricePerLiter, 0), [fuel])

  const history = useMemo(
    () => [...fuel].sort((a, b) => (a.date !== b.date ? b.date.localeCompare(a.date) : b.mileage - a.mileage)),
    [fuel],
  )

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold md:text-xl">Топливо</h2>
          <p className="text-sm text-muted-foreground">Заправки и контроль расхода 1.6 MPI</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" aria-hidden="true" /> Добавить заправку
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <StatBox icon={<FuelIcon className="h-4 w-4" aria-hidden="true" />} label="Средний расход" value={avg != null ? avg.toFixed(1) : '—'} unit="л/100" />
        <StatBox icon={<Droplets className="h-4 w-4" aria-hidden="true" />} label="Всего заправлено" value={totalLiters > 0 ? totalLiters.toFixed(0) : '—'} unit="л" />
        <StatBox icon={<TrendingDown className="h-4 w-4" aria-hidden="true" />} label="Потрачено на бензин" value={totalCost > 0 ? formatRub(totalCost) : '—'} />
      </div>

      {/* График расхода */}
      <Card className="card-glow">
        <CardContent className="p-4 md:p-5">
          <h3 className="mb-1 text-sm font-semibold">Расход между полными заправками</h3>
          <p className="mb-4 text-xs text-muted-foreground">
            Отмечайте «полный бак» — расход считается от полного бака до полного бака.
          </p>
          {points.length < 1 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
              <FuelIcon className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
              <p className="max-w-sm text-sm text-muted-foreground">
                Добавьте минимум две заправки «до полного», и здесь появится график расхода.
              </p>
            </div>
          ) : (
            <div className="h-56 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                  <CartesianGrid stroke="hsl(220 13% 17%)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(d: string) => formatDate(d)}
                    tick={{ fill: 'hsl(216 12% 62%)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={['auto', 'auto']}
                    tick={{ fill: 'hsl(216 12% 62%)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    unit=" л"
                  />
                  <Tooltip
                    formatter={(v: number) => [`${v} л/100 км`, 'Расход']}
                    labelFormatter={(d: string) => formatDate(d)}
                    contentStyle={{
                      background: 'hsl(222 20% 8%)',
                      border: '1px solid hsl(220 13% 17%)',
                      borderRadius: '0.75rem',
                      fontSize: 13,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(205 88% 55%)"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: 'hsl(205 88% 55%)', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* История заправок */}
      <Card className="card-glow">
        <CardContent className="p-4 md:p-5">
          <h3 className="mb-3 text-sm font-semibold">История заправок</h3>
          {history.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Пока ни одной заправки.</p>
          ) : (
            <ul className="divide-y divide-border">
              {history.map((r) => (
                <li key={r.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {r.liters.toFixed(1)} л · {formatRub(r.liters * r.pricePerLiter)}
                      {r.fullTank && (
                        <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                          Полный бак
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDate(r.date)} · {formatKm(r.mileage)} · {r.pricePerLiter.toFixed(2)} ₽/л
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteId(r.id)}
                    aria-label="Удалить заправку"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <AddFuelDialog open={addOpen} onOpenChange={setAddOpen} defaultMileage={profile.mileage} />

      <AlertDialog open={deleteId != null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить заправку?</AlertDialogTitle>
            <AlertDialogDescription>Запись о заправке будет удалена безвозвратно.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) store.removeFuel(deleteId)
                setDeleteId(null)
                toast.success('Заправка удалена')
              }}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function StatBox({ icon, label, value, unit }: { icon: React.ReactNode; label: string; value: string; unit?: string }) {
  return (
    <div className="card-glow rounded-xl border border-border bg-card p-3 md:p-5">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="truncate text-xs">{label}</span>
      </div>
      <p className="font-display odo mt-2 truncate text-base font-semibold tabular md:text-xl">
        {value}
        {unit && <span className="ml-1 text-xs font-medium text-muted-foreground">{unit}</span>}
      </p>
    </div>
  )
}

function AddFuelDialog({
  open,
  onOpenChange,
  defaultMileage,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  defaultMileage: number
}) {
  const store = useStore()
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [mileage, setMileage] = useState(String(defaultMileage))
  const [liters, setLiters] = useState('')
  const [price, setPrice] = useState('')
  const [fullTank, setFullTank] = useState(true)

  const submit = () => {
    const km = parseInt(mileage.replace(/\D/g, ''), 10)
    const l = parseFloat(liters.replace(',', '.'))
    const p = parseFloat(price.replace(',', '.'))
    if (!date) return toast.error('Укажите дату')
    if (!Number.isFinite(km) || km < 0 || km > 2_000_000) return toast.error('Введите корректный пробег')
    if (!Number.isFinite(l) || l <= 0 || l > 200) return toast.error('Введите объём в литрах')
    if (!Number.isFinite(p) || p <= 0 || p > 1000) return toast.error('Введите цену за литр')

    store.addFuel({ date, mileage: km, liters: l, pricePerLiter: p, fullTank })
    toast.success('Заправка добавлена')
    onOpenChange(false)
    setLiters('')
    setPrice('')
  }

  const total = (parseFloat(liters.replace(',', '.')) || 0) * (parseFloat(price.replace(',', '.')) || 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новая заправка</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="f-date">Дата</Label>
              <Input id="f-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="f-mileage">Пробег, км</Label>
              <Input id="f-mileage" inputMode="numeric" value={mileage} onChange={(e) => setMileage(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="f-liters">Литры</Label>
              <Input id="f-liters" inputMode="decimal" placeholder="42,5" value={liters} onChange={(e) => setLiters(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="f-price">Цена за литр, ₽</Label>
              <Input id="f-price" inputMode="decimal" placeholder="58,90" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-border bg-secondary/40 px-3 py-2.5">
            <Checkbox id="f-full" checked={fullTank} onCheckedChange={(c) => setFullTank(c === true)} />
            <span className="text-sm">Заправка до полного бака</span>
          </label>
          {total > 0 && (
            <p className="text-sm text-muted-foreground">
              Итого: <span className="font-semibold text-foreground">{formatRub(total)}</span>
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button onClick={submit}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
