import { useMemo, useState } from 'react'
import { CalendarPlus, History, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import GaugeRing from '@/components/GaugeRing'
import { MAINTENANCE_SCHEDULE } from '@/data/polo'
import { computeDue, STATUS_META } from '@/lib/maintenance'
import { formatDate, formatKm, formatRub, useStore } from '@/lib/store'
import { toast } from 'sonner'

const CUSTOM_ID = 'custom'

export default function Maintenance() {
  const store = useStore()
  const { profile, maintenance } = store
  const [addOpen, setAddOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const due = useMemo(() => computeDue(maintenance, profile.mileage), [maintenance, profile.mileage])

  const history = useMemo(
    () => [...maintenance].sort((a, b) => (a.date !== b.date ? b.date.localeCompare(a.date) : b.mileage - a.mileage)),
    [maintenance],
  )

  const overdueCount = due.filter((d) => d.status === 'overdue').length
  const soonCount = due.filter((d) => d.status === 'soon').length

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold md:text-xl">Обслуживание</h2>
          <p className="text-sm text-muted-foreground">
            {overdueCount > 0 && <span className="font-medium text-[hsl(4_78%_62%)]">Просрочено: {overdueCount} · </span>}
            {soonCount > 0 && <span className="font-medium text-[hsl(38_95%_60%)]">Скоро: {soonCount} · </span>}
            Регламент для 1.6 MPI
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" aria-hidden="true" /> Добавить запись
        </Button>
      </div>

      {/* Регламент со статусами */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {due.map((d) => {
          const meta = STATUS_META[d.status]
          return (
            <Card key={d.type.id} className="card-glow">
              <CardContent className="flex gap-4 p-4">
                <GaugeRing progress={d.progress} tone={d.status} size={64} stroke={6}>
                  <span className={`text-[9px] font-bold uppercase ${meta.className}`}>{meta.label}</span>
                </GaugeRing>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold leading-snug">{d.type.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {d.last ? (
                      <>
                        Было: {formatDate(d.last.date)} · {formatKm(d.last.mileage)}
                      </>
                    ) : (
                      'Записей нет'
                    )}
                  </p>
                  <p className={`mt-0.5 text-xs font-medium ${meta.className}`}>
                    {d.status === 'unknown' && 'Отметьте выполнение, чтобы видеть прогноз'}
                    {d.kmLeft != null && (d.kmLeft > 0 ? `Осталось ${formatKm(d.kmLeft)}` : `Просрочено на ${formatKm(-d.kmLeft)}`)}
                    {d.kmLeft == null && d.daysLeft != null && (d.daysLeft > 0 ? `Осталось ${d.daysLeft} дн.` : `Просрочено на ${-d.daysLeft} дн.`)}
                    {d.kmLeft != null && d.daysLeft != null && ` · по времени: ${d.daysLeft > 0 ? d.daysLeft + ' дн.' : 'просрочено'}`}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground/80">{d.type.note}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* История */}
      <Card className="card-glow">
        <CardContent className="p-4 md:p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <History className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
            Журнал работ
          </h3>
          {history.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <CalendarPlus className="h-10 w-10 text-muted-foreground/50" aria-hidden="true" />
              <p className="max-w-sm text-sm text-muted-foreground">
                Здесь появится история обслуживания. Добавьте первую запись — например, последнюю замену масла.
              </p>
              <Button variant="outline" onClick={() => setAddOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" aria-hidden="true" /> Добавить запись
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {history.map((r) => {
                const type = MAINTENANCE_SCHEDULE.find((t) => t.id === r.typeId)
                return (
                  <li key={r.id} className="flex items-start gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{type?.name ?? 'Прочие работы'}</p>
                      {r.note && <p className="mt-0.5 text-sm text-muted-foreground">{r.note}</p>}
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDate(r.date)} · {formatKm(r.mileage)}
                        {r.cost > 0 && ` · ${formatRub(r.cost)}`}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteId(r.id)}
                      aria-label="Удалить запись"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <AddMaintenanceDialog open={addOpen} onOpenChange={setAddOpen} defaultMileage={profile.mileage} />

      <AlertDialog open={deleteId != null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить запись?</AlertDialogTitle>
            <AlertDialogDescription>Запись об обслуживании будет удалена безвозвратно.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) store.removeMaintenance(deleteId)
                setDeleteId(null)
                toast.success('Запись удалена')
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

function AddMaintenanceDialog({
  open,
  onOpenChange,
  defaultMileage,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  defaultMileage: number
}) {
  const store = useStore()
  const [typeId, setTypeId] = useState(MAINTENANCE_SCHEDULE[0].id)
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [mileage, setMileage] = useState(String(defaultMileage))
  const [cost, setCost] = useState('')
  const [note, setNote] = useState('')

  const submit = () => {
    const km = parseInt(mileage.replace(/\D/g, ''), 10)
    if (!Number.isFinite(km) || km < 0 || km > 2_000_000) {
      toast.error('Введите корректный пробег')
      return
    }
    if (!date) {
      toast.error('Укажите дату')
      return
    }
    store.addMaintenance({
      typeId,
      date,
      mileage: km,
      cost: Math.max(0, parseFloat(cost.replace(',', '.')) || 0),
      note: note.trim(),
    })
    toast.success('Запись добавлена')
    onOpenChange(false)
    setCost('')
    setNote('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Запись об обслуживании</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="m-type">Вид работ</Label>
            <Select value={typeId} onValueChange={setTypeId}>
              <SelectTrigger id="m-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MAINTENANCE_SCHEDULE.map((t) => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
                <SelectItem value={CUSTOM_ID}>Прочие работы</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="m-date">Дата</Label>
              <Input id="m-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-mileage">Пробег, км</Label>
              <Input id="m-mileage" inputMode="numeric" value={mileage} onChange={(e) => setMileage(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-cost">Стоимость, ₽ (необязательно)</Label>
            <Input id="m-cost" inputMode="decimal" placeholder="0" value={cost} onChange={(e) => setCost(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-note">Комментарий (необязательно)</Label>
            <Textarea
              id="m-note"
              rows={2}
              placeholder="Например: масло Shell Helix HX8 5W-30, фильтр Mann"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button onClick={submit}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
