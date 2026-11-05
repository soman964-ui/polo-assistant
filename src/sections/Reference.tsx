import { AlertTriangle, BookOpen, Cog, Cpu, Droplets, ExternalLink, Gauge, Package, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { BODY_INFO, COMMON_PARTS, ENGINES, FLUIDS, GEARBOXES, SOURCES, SPECS, TRIMS, type AnalogPart, type PartInfo } from '@/data/polo'

export default function Reference() {
  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold md:text-xl">Справочник Polo</h2>
        <p className="text-sm text-muted-foreground">{BODY_INFO.sedan}. {BODY_INFO.liftback}.</p>
      </div>

      <Tabs defaultValue="engines" className="w-full">
        <TabsList className="grid w-full grid-cols-2 gap-1 sm:grid-cols-5">
          <TabsTrigger value="engines">Двигатели</TabsTrigger>
          <TabsTrigger value="gearboxes">Коробки</TabsTrigger>
          <TabsTrigger value="trims">Комплектации</TabsTrigger>
          <TabsTrigger value="fluids">Жидкости</TabsTrigger>
          <TabsTrigger value="sources">Источники</TabsTrigger>
        </TabsList>

        {/* ── Двигатели ─────────────────────────────── */}
        <TabsContent value="engines" className="mt-4 space-y-4">
          <Accordion type="single" collapsible className="space-y-3">
            {ENGINES.map((e) => (
              <AccordionItem key={e.code} value={e.code} className="card-glow rounded-xl border border-border bg-card px-4 md:px-5">
                <AccordionTrigger className="py-4 hover:no-underline">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-left">
                    <span className="font-display text-base font-semibold text-primary">{e.code}</span>
                    <span className="text-sm font-semibold">{e.name} · {e.power.split('(')[0].trim()}</span>
                    <span className="text-xs text-muted-foreground">{e.family} · {e.years}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-5">
                  <div className="space-y-5">
                    {/* Характеристики */}
                    <dl className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                      <Spec label="Мощность" value={e.power} />
                      <Spec label="Крутящий момент" value={e.torque} />
                      <Spec label="Привод ГРМ" value={e.timing} />
                      <Spec label="Топливо" value={e.fuel} />
                      <Spec label="Степень сжатия" value={e.compression} />
                      <Spec label="Годы установки" value={e.years} />
                    </dl>

                    {/* Особенности */}
                    <ul className="space-y-1.5">
                      {e.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <Cpu className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {/* Масло */}
                    <div className="rounded-lg border border-primary/25 bg-primary/5 p-3.5">
                      <p className="flex items-center gap-2 text-sm font-semibold">
                        <Droplets className="h-4 w-4 text-primary" aria-hidden="true" />
                        Моторное масло
                      </p>
                      <p className="mt-1.5 text-sm text-muted-foreground">
                        Допуск: <span className="font-medium text-foreground">{e.oilSpec}</span> · вязкость: {e.oilViscosity} · объём: {e.oilVolume}
                      </p>
                    </div>

                    {/* Расходники */}
                    <div>
                      <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                        <Package className="h-4 w-4 text-primary" aria-hidden="true" />
                        Расходники и аналоги
                      </p>
                      <div className="space-y-3">
                        {e.parts.map((p) => (
                          <PartCard key={p.name} part={p} />
                        ))}
                      </div>
                    </div>

                    {/* Типичные неисправности */}
                    <div>
                      <p className="mb-2 flex items-center gap-2 text-sm font-semibold">
                        <AlertTriangle className="h-4 w-4 text-[hsl(38_95%_55%)]" aria-hidden="true" />
                        Типичные неисправности
                      </p>
                      <ul className="space-y-2">
                        {e.issues.map((i) => (
                          <li key={i.title} className="rounded-lg border border-border bg-secondary/40 p-3">
                            <p className="text-sm font-medium">{i.title}</p>
                            <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{i.text}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </TabsContent>

        {/* ── Коробки ───────────────────────────────── */}
        <TabsContent value="gearboxes" className="mt-4 space-y-3">
          {GEARBOXES.map((g) => (
            <Card key={g.code} className="card-glow">
              <CardContent className="p-4 md:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Cog className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h3 className="text-sm font-semibold md:text-base">{g.name}</h3>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                    g.kind === 'Механика' ? 'bg-secondary text-secondary-foreground' : 'bg-primary/15 text-primary'
                  }`}>
                    {g.kind}
                  </span>
                  <span className="text-xs text-muted-foreground">{g.years}</span>
                </div>
                <dl className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                  <Spec label="Жидкость" value={g.fluid} />
                  <Spec label="Оригинальный артикул" value={g.fluidOem} />
                  <Spec label="Объём" value={g.volume} />
                  <Spec label="Интервал обслуживания" value={g.interval} />
                </dl>
                <ul className="mt-3 space-y-1.5">
                  {g.notes.map((n) => (
                    <li key={n} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                      {n}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* ── Комплектации ──────────────────────────── */}
        <TabsContent value="trims" className="mt-4 space-y-3">
          {(['Седан', 'Лифтбэк'] as const).map((body) => (
            <div key={body}>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Polo {body === 'Седан' ? 'Sedan (2010–2020)' : 'Liftback (2020–2022)'}
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {TRIMS.filter((t) => t.body === body).map((t) => (
                  <Card key={t.name} className="card-glow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-[hsl(38_95%_55%)]" aria-hidden="true" />
                        <h4 className="text-sm font-semibold">{t.name}</h4>
                        <span className="ml-auto text-xs text-muted-foreground">{t.years}</span>
                      </div>
                      <ul className="mt-2.5 space-y-1.5">
                        {t.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* ── Жидкости и общие расходники ───────────── */}
        <TabsContent value="fluids" className="mt-4 space-y-4">
          <Card className="card-glow">
            <CardContent className="p-4 md:p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Droplets className="h-4 w-4 text-primary" aria-hidden="true" />
                Рабочие жидкости (вся гамма)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 pr-3 font-medium">Жидкость</th>
                      <th className="py-2 pr-3 font-medium">Спецификация / артикул</th>
                      <th className="py-2 pr-3 font-medium">Объём</th>
                      <th className="py-2 font-medium">Интервал</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {FLUIDS.map((f) => (
                      <tr key={f.name}>
                        <td className="py-2.5 pr-3 font-medium">{f.name}</td>
                        <td className="py-2.5 pr-3 font-mono text-xs text-muted-foreground">{f.spec}</td>
                        <td className="py-2.5 pr-3 text-muted-foreground">{f.volume}</td>
                        <td className="py-2.5 text-muted-foreground">{f.interval}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="card-glow">
            <CardContent className="p-4 md:p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Package className="h-4 w-4 text-primary" aria-hidden="true" />
                Общие расходники (для всех моторов)
              </h3>
              <div className="space-y-3">
                {COMMON_PARTS.map((p) => (
                  <PartCard key={p.name} part={p} />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Общие ТТХ */}
          <Card className="card-glow">
            <CardContent className="p-4 md:p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <Gauge className="h-4 w-4 text-primary" aria-hidden="true" />
                Общие характеристики
              </h3>
              <dl className="grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
                {(Object.keys(SPECS) as (keyof typeof SPECS)[]).map((k) => (
                  <Spec key={k} label={SPEC_LABELS[k]} value={SPECS[k]} />
                ))}
              </dl>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Источники ─────────────────────────────── */}
        <TabsContent value="sources" className="mt-4">
          <Card className="card-glow">
            <CardContent className="p-4 md:p-5">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <BookOpen className="h-4 w-4 text-primary" aria-hidden="true" />
                Источники данных
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                Артикулы, объёмы и допуски собраны из сервисной документации VAG и специализированных каталогов.
                Перед покупкой сверяйте применимость по VIN — в разные годы артикулы менялись.
              </p>
              <ul className="space-y-2">
                {SOURCES.map((s) => (
                  <li key={s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 py-2.5 text-sm transition-colors hover:border-primary/50 hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <ExternalLink className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <span className="group-hover:underline">{s.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

const SPEC_LABELS: Record<keyof typeof SPECS, string> = {
  engine: 'Двигатели',
  power: 'Мощность',
  torque: 'Крутящий момент',
  fuel: 'Топливо',
  tank: 'Топливный бак',
  consumption: 'Расход (паспорт)',
  drive: 'Привод',
  gearbox: 'Коробки передач',
  body: 'Кузов',
  tires: 'Шины',
  boltPattern: 'Разболтовка',
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border/60 pb-2.5">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value}</dd>
    </div>
  )
}

const TAG_STYLE: Record<AnalogPart['tag'], string> = {
  оптимум: 'bg-[hsl(152_60%_45%/0.15)] text-[hsl(152_60%_60%)]',
  бюджет: 'bg-secondary text-muted-foreground',
  премиум: 'bg-[hsl(38_95%_55%/0.15)] text-[hsl(38_95%_62%)]',
}

function PartCard({ part }: { part: PartInfo }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/30 p-3">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <p className="text-sm font-semibold">{part.name}</p>
        <span className="text-xs text-muted-foreground">{part.interval}</span>
      </div>
      <p className="mt-1 font-mono text-xs text-primary">{part.oem}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {part.analogs.map((a) => (
          <span
            key={a.brand + a.number}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${TAG_STYLE[a.tag]}`}
            title={`${a.brand} ${a.number} — ${a.tag} по соотношению цена/качество`}
          >
            <span className="font-medium">{a.brand}</span>
            <span className="font-mono">{a.number}</span>
            <span className="text-[10px] uppercase tracking-wide opacity-75">{a.tag}</span>
          </span>
        ))}
      </div>
    </div>
  )
}
