import { useMemo, useState } from 'react'
import { PiggyBank, Plus, Trash2 } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
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
import { formatDate, formatRub, useStore } from '@/lib/store'
import type { ExpenseCategory } from '@/types'
import { toast } from 'sonner'

export const CATEGORY_META: Record<ExpenseCategory, string> = {
  service: 'Сервис и ремонт',
  parts: 'Запчасти и расходники',
  insurance: 'Страховка (ОСАГО/КАСКО)',
  tax: 'Налоги и госпошлины',
  parking: 'Парковка',
  wash: 'Мойка',
  tolls: 'Платные дороги',
  other: 'Прочее',
}

const CATEGORY_KEYS = Object.keys(CATEGORY_META) as ExpenseCategory[]

export default function Expenses() {
  const store = useStore()
  const { expenses } = store
  const [addOpen, setAddOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | ExpenseCategory>('all')

  const total = useMemo(() => expenses.reduce((s, r) => s + r.amount, 0), [expenses])

  const byCategory = useMemo(() => {
    const map = new Map<ExpenseCategory, number>()
    for (const e of expenses) map.set(e.category, (map.get(e.category) ?? 0) + e.amount)
    return CATEGORY_KEYS.filter((k) => map.has(k))
      .map((k) => ({ name: CATEGORY_META[k], value: map.get(k)! }))
      .sort((a, b) => b.value - a.value)
  }, [expenses])

  const history = useMemo(
    () =>
      [...expenses]
        .filter((e) => filter === 'all' || e.category === filter)
        .sort((a, b) => b.date.localeCompare(a.date)),
    [expenses, filter],
  )

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold md:text-xl">Расходы</h2>
          <p className="text-sm text-muted-foreground">
            Всего: <span className="font-semibold text-foreground">{formatRub(total)}</span> (топливо и ТО считаются в своих разделах)
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" aria-hidden="true" /> Добавить расход
        </Button>
      </div>

      {/* Диаграмма по категориям */}
      <Card className="card-glow">
        <CardContent className="p-4 md:p-5">
          <h3 className="mb-4 text-sm font-semibold">Структура расходов</h3>
          {byCategory.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
              <PiggyBank className="h-8 w-8 text-muted-foreground/40" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">Добавьте расходы, чтобы увидеть структуру.</p>
            </div>
          ) : (
            <div className="h-56 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={byCategory} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 8 }}>
                  <CartesianGrid stroke="hsl(220 13% 17%)" strokeDasharray="3 3" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: 'hsl(216 12% 62%)', fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 1000)}к` : String(v))}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={150}
                    tick={{ fill: 'hsl(213 22% 85%)', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    formatter={(v: number) => [formatRub(v), 'Сумма']}
                    contentStyle={{
                      background: 'hsl(222 20% 8%)',
                      border: '1px solid hsl(220 13% 17%)',
                      borderRadius: '0.75rem',
                      fontSize: 13,
                    }}
                  />
                  <Bar dataKey="value" fill="hsl(205 88% 55%)" radius={[0, 6, 6, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Журнал */}
      <Card className="card-glow">
        <CardContent className="p-4 md:p-5">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Журнал расходов</h3>
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="h-9 w-[190px]" aria-label="Фильтр по категории">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все категории</SelectItem>
                {CATEGORY_KEYS.map((k) => (
                  <SelectItem key={k} value={k}>{CATEGORY_META[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {history.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {filter === 'all' ? 'Пока ни одного расхода.' : 'В этой категории пока пусто.'}
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {history.map((r) => (
                <li key={r.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{r.description || CATEGORY_META[r.category]}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatDate(r.date)} · {CATEGORY_META[r.category]}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold tabular">{formatRub(r.amount)}</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => setDeleteId(r.id)}
                    aria-label="Удалить расход"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <AddExpenseDialog open={addOpen} onOpenChange={setAddOpen} />

      <AlertDialog open={deleteId != null} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить расход?</AlertDialogTitle>
            <AlertDialogDescription>Запись будет удалена безвозвратно.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) store.removeExpense(deleteId)
                setDeleteId(null)
                toast.success('Расход удалён')
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

function AddExpenseDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const store = useStore()
  const [category, setCategory] = useState<ExpenseCategory>('service')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  const submit = () => {
    const a = parseFloat(amount.replace(',', '.').replace(/\s/g, ''))
    if (!date) return toast.error('Укажите дату')
    if (!Number.isFinite(a) || a <= 0) return toast.error('Введите сумму')
    store.addExpense({ category, date, amount: a, description: description.trim() })
    toast.success('Расход добавлен')
    onOpenChange(false)
    setAmount('')
    setDescription('')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Новый расход</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="e-cat">Категория</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as ExpenseCategory)}>
              <SelectTrigger id="e-cat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_KEYS.map((k) => (
                  <SelectItem key={k} value={k}>{CATEGORY_META[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="e-date">Дата</Label>
              <Input id="e-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="e-amount">Сумма, ₽</Label>
              <Input id="e-amount" inputMode="decimal" placeholder="1500" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="e-desc">Описание</Label>
            <Input id="e-desc" placeholder="Например: ОСАГО на год" value={description} onChange={(e) => setDescription(e.target.value)} />
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
