// @vitest-environment jsdom
/*
 * Сентинел приватности: приложение обязано стартовать без единого сетевого запроса
 * и без белого экрана. Любой fetch() на старте = тест падает.
 */
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { act, createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router'
import App from './App'

const fetchCalls: string[] = []

beforeAll(() => {
  ;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia

  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver

  globalThis.fetch = vi.fn(async (input: RequestInfo | URL) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
    fetchCalls.push(url)
    throw new Error(`network call attempted: ${url}`)
  }) as unknown as typeof fetch
})

describe('приватность: старт приложения', () => {
  it('рендерит оболочку без crash и без сетевых запросов', async () => {
    document.body.innerHTML = '<div id="root"></div>'
    const container = document.getElementById('root')
    if (!container) throw new Error('root container missing')
    await act(async () => {
      createRoot(container).render(createElement(MemoryRouter, null, createElement(App)))
    })
    const text = document.body.textContent ?? ''
    expect(text).toContain('Polo Assistant')
    expect(fetchCalls).toEqual([])
  })
})
