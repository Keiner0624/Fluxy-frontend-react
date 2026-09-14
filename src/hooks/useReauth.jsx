// src/hooks/useReauth.jsx
// Acciones sensibles: si el backend responde REAUTH_REQUIRED, pide confirmar la
// identidad y reintenta la acción.
import { useCallback, useRef, useState } from 'react'
import ReauthDialog from '@/modules/dashboard/components/Reauth'

/**
 * const { run, dialog } = useReauth(hasPassword)
 * await run(() => api.post('/me/email/change', {...}))
 */
export default function useReauth(hasPassword = true) {
  const [pending, setPending] = useState(null)
  const resolver = useRef(null)

  const run = useCallback(async (action) => {
    try {
      return await action()
    } catch (err) {
      if (err.code !== 'REAUTH_REQUIRED') throw err
      await new Promise((resolve, reject) => {
        resolver.current = { resolve, reject }
        setPending(true)
      })
      return action()
    }
  }, [])

  const dialog = pending ? (
    <ReauthDialog hasPassword={hasPassword}
      onDone={() => { setPending(null); resolver.current?.resolve() }}
      onClose={() => {
        setPending(null)
        const cancelled = new Error('Cancelaste la confirmación.')
        cancelled.code = 'REAUTH_CANCELLED'
        resolver.current?.reject(cancelled)
      }} />
  ) : null

  return { run, dialog }
}
