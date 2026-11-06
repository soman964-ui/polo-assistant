import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Database, RotateCcw, TriangleAlert } from 'lucide-react'
import { STORAGE_KEY } from '@/lib/store'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

/**
 * Глобальный перехватчик ошибок рендера.
 * Даже при повреждённых данных пользователь не должен видеть белый экран:
 * ему даётся шанс скачать копию данных и/или сбросить локальное хранилище.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Сбой интерфейса:', error, info.componentStack)
  }

  private downloadBackup = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const blob = new Blob([raw], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `polo-assistant-emergency-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Не удалось скачать резервную копию:', error)
    }
  }

  private resetAndReload = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* хранилище недоступно — просто перезагружаемся */
    }
    window.location.reload()
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-background px-6 text-center text-foreground">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10">
          <TriangleAlert className="h-7 w-7 text-destructive" aria-hidden="true" />
        </span>
        <div className="max-w-md space-y-2">
          <h1 className="text-lg font-semibold">Что-то пошло не так</h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Приложение столкнулось с ошибкой. Чаще всего это признак повреждённых данных в локальном хранилище.
            Сначала скачайте резервную копию — затем можно стереть локальные данные и начать заново.
          </p>
          <p className="break-words rounded-lg border border-border bg-secondary/40 px-3 py-2 font-mono text-[11px] text-muted-foreground">
            {error.message}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={this.downloadBackup}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2.5 text-sm font-medium transition-colors hover:bg-secondary/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Database className="h-4 w-4" aria-hidden="true" /> Скачать данные
          </button>
          <button
            type="button"
            onClick={this.resetAndReload}
            className="inline-flex items-center gap-2 rounded-lg bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Стереть данные и перезапустить
          </button>
        </div>
        <p className="max-w-sm text-xs text-muted-foreground/70">
          Резервную копию можно затем импортировать через «Настройки → Импорт».
        </p>
      </div>
    )
  }
}
