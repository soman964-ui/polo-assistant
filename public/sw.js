/// <reference lib="webworker" />
/* Polo Assistant — офлайн-кэш приложения (полностью same-origin, внешних запросов нет) */
const CACHE = 'polo-assistant-v3'
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  // Только same-origin запросы: всё приложение самодостаточно
  if (!request.url.startsWith(self.location.origin)) return

  // Навигация: сеть → при офлайне кэшированный index.html
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/index.html')))
    return
  }

  // Статика: кэш → сеть (и докэшировать) → понятная ошибка офлайна
  event.respondWith(
    caches
      .match(request)
      .then(
        (hit) =>
          hit ||
          fetch(request).then((resp) => {
            if (resp.ok || resp.type === 'opaque') {
              const copy = resp.clone()
              caches.open(CACHE).then((c) => c.put(request, copy))
            }
            return resp
          }),
      )
      .catch(() =>
        new Response('Офлайн: ресурс недоступен', {
          status: 503,
          statusText: 'Offline',
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        }),
      ),
  )
})
