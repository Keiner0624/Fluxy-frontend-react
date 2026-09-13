// src/hooks/useAccess.js
// Rol y permisos de quien usa el panel. Solo decide qué se muestra: el backend
// valida cada permiso de nuevo en cada petición.
import { useEffect, useState } from 'react'
import { getMe, peekMe } from '@/app/account'

function toAccess(me) {
  const permissions = new Set(me?.permissions || [])
  return { role: me?.role || null, permissions, ready: Boolean(me) }
}

export default function useAccess() {
  const [access, setAccess] = useState(() => toAccess(peekMe()))

  useEffect(() => {
    let vigente = true
    getMe()
      .then((me) => { if (vigente) setAccess(toAccess(me)) })
      .catch(() => { if (vigente) setAccess((prev) => ({ ...prev, ready: true })) })
    return () => { vigente = false }
  }, [])

  return {
    ...access,
    isOwner: access.role === 'OWNER',
    can: (permission) => access.permissions.has(permission),
    canAny: (...permissions) => permissions.some((p) => access.permissions.has(p)),
  }
}
