// public/sw.js  ← va en la raíz de /public (NO en /src)

self.addEventListener('install',  e => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))

// ── Recibir push del backend ──────────────────────────────────────────────
self.addEventListener('push', event => {
  let data = { title: '🛒 Nuevo pedido', body: 'Tienes un pedido nuevo en Fluxy.' }

  try {
    if (event.data) data = event.data.json()
  } catch (_) {}

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body:    data.body,
      icon:    '/logo.png',   // pon tu logo aquí
      badge:   '/logo.png',
      vibrate: [200, 100, 200],
      data:    { url: data.url || '/dashboard/orders' },
      actions: [
        { action: 'open',    title: 'Ver pedido' },
        { action: 'dismiss', title: 'Ignorar'    },
      ],
    })
  )
})

// ── Click en la notificación ──────────────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close()
  if (event.action === 'dismiss') return

  const target = event.notification.data?.url || '/dashboard/orders'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(target)
          return client.focus()
        }
      }
      return self.clients.openWindow(target)
    })
  )
})