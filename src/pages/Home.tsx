import { useState } from 'react'
import { BookOpen, CarFront, Fuel, LayoutDashboard, Settings2, Wallet, Wrench } from 'lucide-react'
import Overview from '@/sections/Overview'
import Maintenance from '@/sections/Maintenance'
import FuelSection from '@/sections/Fuel'
import Expenses from '@/sections/Expenses'
import Reference from '@/sections/Reference'
import SettingsDialog from '@/components/SettingsDialog'
import { Button } from '@/components/ui/button'

const TABS = [
  { id: 'overview', label: 'Обзор', icon: LayoutDashboard },
  { id: 'maintenance', label: 'Обслуживание', icon: Wrench },
  { id: 'fuel', label: 'Топливо', icon: Fuel },
  { id: 'expenses', label: 'Расходы', icon: Wallet },
  { id: 'reference', label: 'Справочник', icon: BookOpen },
] as const

type TabId = (typeof TABS)[number]['id']

export default function Home() {
  const [tab, setTab] = useState<TabId>('overview')
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="dash-bg min-h-dvh bg-background text-foreground">
      {/* Шапка */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
              <CarFront className="h-5 w-5 text-primary" aria-hidden="true" />
            </span>
            <div className="min-w-0 leading-tight">
              <p className="font-display truncate text-sm font-semibold">Polo Assistant</p>
              <p className="truncate text-[11px] text-muted-foreground">VW Polo Sedan · 1.6 MPI</p>
            </div>
          </div>

          {/* Навигация — десктоп */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Разделы">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                aria-current={tab === t.id ? 'page' : undefined}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  tab === t.id ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <t.icon className="h-4 w-4" aria-hidden="true" />
                {t.label}
              </button>
            ))}
          </nav>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            aria-label="Настройки"
            className="h-9 w-9 shrink-0"
          >
            <Settings2 className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </header>

      {/* Контент */}
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-4 md:pb-10 md:pt-6">
        {tab === 'overview' && <Overview goTo={(id) => setTab(id as TabId)} />}
        {tab === 'maintenance' && <Maintenance />}
        {tab === 'fuel' && <FuelSection />}
        {tab === 'expenses' && <Expenses />}
        {tab === 'reference' && <Reference />}

        <footer className="mt-10 text-center text-xs text-muted-foreground/70">
          Polo Assistant — локальный журнал вашего автомобиля. Данные не покидают браузер.
        </footer>
      </main>

      {/* Нижняя навигация — мобильная */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur-md md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Разделы"
      >
        <div className="mx-auto grid max-w-md grid-cols-5">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? 'page' : undefined}
              className={`flex min-h-[56px] flex-col items-center justify-center gap-0.5 py-1.5 text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
                tab === t.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <t.icon className="h-5 w-5" aria-hidden="true" />
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
}
