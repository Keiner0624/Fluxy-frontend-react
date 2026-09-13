// src/modules/dashboard/components/PermissionRoute.jsx
// Para páginas que no controlan permisos por su cuenta: si la persona no tiene
// acceso, muestra el motivo en vez de una pantalla que falla al cargar.
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import { NoAccess } from '@/modules/dashboard/components/ui'
import useAccess from '@/hooks/useAccess'

export default function PermissionRoute({ permission, module, children }) {
  const access = useAccess()
  if (access.ready && !access.can(permission)) {
    return <DashboardLayout><NoAccess module={module} /></DashboardLayout>
  }
  return children
}
