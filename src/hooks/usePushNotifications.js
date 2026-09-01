// src/hooks/usePushNotifications.js
import { useEffect } from 'react'
import { API_URL } from '@/app/config'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BA-Zyy_5D3tqkl5M0IZY38Obs3RpAxGBe0I6qszh6W0T6APXzVrf7BVkjfURgp4F2MCgmlutNeZ4Xq4ufggTCxY'

function urlBase64ToUint8Array(base64String) {
  const padding  = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64   = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData  = atob(base64)
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

function getToken() {
  return localStorage.getItem('token') || ''
}

/**
 * Registra el service worker y suscribe al usuario a push notifications.
 * Llama a este hook dentro del DashboardLayout o App, solo si el usuario
 * ya está autenticado.
 */
export function usePushNotifications() {
  useEffect(() => {
    if (!VAPID_PUBLIC_KEY)                    return  // no configurado
    if (!('serviceWorker' in navigator))      return  // navegador no compatible
    if (!('PushManager'   in window))         return  // push no disponible
    if (!getToken())                           return  // no autenticado

    async function registerAndSubscribe() {
      try {
        // 1. Registrar (o reutilizar) service worker
        const registration = await navigator.serviceWorker.register('/sw.js')
        await navigator.serviceWorker.ready

        // 2. Pedir permiso
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return

        // 3. Suscribir al push
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly:      true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        })

        // 4. Enviar suscripción al backend
        await fetch(`${API_URL}/push/subscribe`, {
          method:  'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization:  `Bearer ${getToken()}`,
          },
          body: JSON.stringify(subscription),
        })

      } catch (err) {
        console.warn('[Push] Error al suscribirse:', err)
      }
    }

    registerAndSubscribe()
  }, [])
}