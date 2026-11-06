import { useRef, useState } from 'react'
import { Download, Settings2, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { ENGINES, GEARBOXES } from '@/data/polo'
import { useStore } from '@/lib/store'
import { toast } from 'sonner'

export default function SettingsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const store = useStore()
  const [resetOpen, setResetOpen] = useState(false)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        {/* Содержимое монтируется заново при каждом открытии — поля всегда показывают актуальный профиль */}
        {open && <SettingsForm onOpenChange={onOpenChange} onResetRequest={() => setResetOpen(true)} />}
      </Dialog>

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Сбросить все данные?</AlertDialogTitle>
            <AlertDialogDescription>
              Будут удалены профиль, журнал ТО, заправки и расходы. Действие нельзя отменить — сделайте экспорт заранее.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                store.resetAll()
                setResetOpen(false)
                onOpenChange(false)
                toast.success('Все данные сброшены')
              }}
            >
              Сбросить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function SettingsForm({
  onOpenChange,
  onResetRequest,
}: {
  onOpenChange: (o: boolean) => void
  onResetRequest: () => void
}) {
  const store = useStore()
  const { profile } = store
  const [year, setYear] = useState(String(profile.year))
  const [engine, setEngine] = useState(profile.engine)
  const [transmission, setTransmission] = useState(profile.transmission)
  const [plate, setPlate] = useState(profile.plate)
  const [vin, setVin] = useState(profile.vin)
  const fileRef = useRef<HTMLInputElement>(null)

  const selectedEngine = ENGINES.find((e) => e.code === engine)
  const manualBoxes = GEARBOXES.filter((g) => g.kind === 'Механика')
  const autoBoxes = GEARBOXES.filter((g) => g.kind === 'Автомат')

  const save = () => {
    const y = parseInt(year, 10)
    if (!Number.isFinite(y) || y < 2012 || y > 2022) {
      toast.error('Polo для рынка РФ выпускался в 2012–2022 гг. Проверьте год.')
      return
    }
    const vinNormalized = vin.trim().toUpperCase()
    if (vinNormalized && !/^[A-HJ-NPR-Z0-9]{17}$/.test(vinNormalized)) {
      toast.error('VIN должен состоять из 17 символов без букв I, O, Q. Проверьте, пожалуйста.')
      return
    }
    if (selectedEngine && !selectedEngine.gearboxes.includes(transmission)) {
      toast.error(`Коробка недоступна для ${selectedEngine.code}. Доступные: ${selectedEngine.gearboxes.join(', ')}`)
      return
    }
    store.setProfile({ ...profile, year: y, engine, transmission, plate: plate.trim().toUpperCase(), vin: vinNormalized })
    toast.success('Профиль сохранён')
    onOpenChange(false)
  }

  const doExport = () => {
    const blob = new Blob([store.exportData()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `polo-assistant-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    toast.success('Резервная копия скачана. Файл содержит VIN и госномер — храните его в надёжном месте.')
  }

  const doImport = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Файл больше 5 МБ — похоже, это не резервная копия Polo Assistant.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const ok = store.importData(String(reader.result))
      if (ok) toast.success('Данные восстановлены')
      else toast.error('Не удалось прочитать файл')
    }
    reader.readAsText(file)
  }

  return (
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5 text-primary" aria-hidden="true" />
              Настройки
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Автомобиль</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="s-year">Год выпуска</Label>
                <Input id="s-year" inputMode="numeric" placeholder="2012–2022" value={year} onChange={(e) => setYear(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-plate">Госномер</Label>
                <Input id="s-plate" placeholder="А123БВ777" value={plate} onChange={(e) => setPlate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-engine">Двигатель</Label>
              <Select value={engine} onValueChange={setEngine}>
                <SelectTrigger id="s-engine">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ENGINES.map((e) => (
                    <SelectItem key={e.code} value={e.code}>
                      {e.code} {e.name} · {e.power.split('(')[0].trim()} · {e.years}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedEngine && (
                <p className="text-xs text-muted-foreground">
                  {selectedEngine.family} · {selectedEngine.timing}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-trans">Коробка передач</Label>
              <Select value={transmission} onValueChange={setTransmission}>
                <SelectTrigger id="s-trans">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <p className="px-2 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Механика</p>
                  {manualBoxes.map((g) => {
                    const ok = !selectedEngine || selectedEngine.gearboxes.includes(g.code)
                    return (
                      <SelectItem key={g.code} value={g.code} disabled={!ok}>
                        {g.name}{!ok && ' — недоступна для этого мотора'}
                      </SelectItem>
                    )
                  })}
                  <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Автомат</p>
                  {autoBoxes.map((g) => {
                    const ok = !selectedEngine || selectedEngine.gearboxes.includes(g.code)
                    return (
                      <SelectItem key={g.code} value={g.code} disabled={!ok}>
                        {g.name}{!ok && ' — недоступна для этого мотора'}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-vin">VIN (необязательно)</Label>
              <Input id="s-vin" placeholder="XW8..." maxLength={17} value={vin} onChange={(e) => setVin(e.target.value)} />
            </div>

            <h3 className="pt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Данные</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={doExport} className="gap-2">
                <Download className="h-4 w-4" aria-hidden="true" /> Экспорт JSON
              </Button>
              <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-2">
                <Upload className="h-4 w-4" aria-hidden="true" /> Импорт
              </Button>
              <Button variant="outline" size="sm" onClick={onResetRequest} className="gap-2 text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4" aria-hidden="true" /> Сбросить всё
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) doImport(f)
                  e.target.value = ''
                }}
              />
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Данные хранятся локально на этом устройстве (localStorage) и никуда не отправляются. Экспортируйте резервную
              копию, чтобы перенести их на другое устройство или не потерять при очистке браузера.
            </p>
            <p className="rounded-lg border border-[hsl(38_95%_55%/0.35)] bg-[hsl(38_95%_55%/0.08)] px-3 py-2 text-xs leading-relaxed text-[hsl(38_95%_68%)]">
              Резервная копия содержит VIN и госномер в открытом виде. Не передавайте файл посторонним,
              удаляйте его с временных устройств.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Отмена</Button>
            <Button onClick={save}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
  )
}
