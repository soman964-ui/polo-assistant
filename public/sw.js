/// <reference lib="webworker" />
/* Polo Assistant — офлайн-кэш приложения */
const CACHE = 'polo-assistant-v2'
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

  // Навигация: сеть → при офлайне кэшированный index.html
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/index.html')))
    return
  }

  // Статика: кэш → сеть (и докэшировать)
  event.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ||
        fetch(request).then((resp) => {
          if (resp.ok || resp.type === 'opaque') {
            const copy = resp.clone()
            caches.open(CACHE).then((c) => c.put(request, copy))
          }
          return resp
        }),
    ),
  )
})
