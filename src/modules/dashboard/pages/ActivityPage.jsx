// src/modules/dashboard/pages/ActivityPage.jsx
// Registro de auditoría: quién hizo qué y cuándo en el negocio.
import { useState } from 'react'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import { EmptyState, ErrorState, NoAccess, Pagination } from '@/modules/dashboard/components/ui'
import { api } from '@/app/api'
import { dateTime } from '@/app/format'
import useApi from '@/hooks/useApi'
import useAccess from '@/hooks/useAccess'
import Icon from '@/components/Icon'

const ACTIONS = {
  LOGIN_SUCCESS: ['Inició sesión', 'user'],
  LOGIN_FAILED: ['Intento de acceso fallido', 'alert'],
  LOGOUT: ['Cerró sesión', 'logout'],
  SESSION_REVOKED: ['Cerró una sesión', 'shield'],
  SESSIONS_REVOKED_ALL: ['Cerró todas las sesiones', 'shield'],
  REFRESH_REUSE_DETECTED: ['Sesión cerrada por uso sospechoso', 'warning'],
  REAUTHENTICATED: ['Confirmó su identidad', 'shield'],
  ACCOUNT_CREATED: ['Creó la cuenta', 'building'],
  EMAIL_VERIFIED: ['Verificó el correo', 'mail'],
  PHONE_VERIFIED: ['Verificó el celular', 'phone'],
  EMAIL_CHANGED: ['Cambió el correo', 'mail'],
  PHONE_CHANGED: ['Cambió el celular', 'phone'],
  PASSWORD_CHANGED: ['Cambió la contraseña', 'lock'],
  PASSWORD_RESET_REQUESTED: ['Pidió recuperar la contraseña', 'lock'],
  PASSWORD_RESET_COMPLETED: ['Restableció la contraseña', 'lock'],
  IDENTITY_LINKED: ['Vinculó una cuenta', 'globe'],
  IDENTITY_UNLINKED: ['Desvinculó una cuenta', 'globe'],
  TEAM_INVITED: ['Invitó a alguien al equipo', 'team'],
  TEAM_INVITE_REVOKED: ['Revocó una invitación', 'team'],
  TEAM_MEMBER_JOINED: ['Se sumó al equipo', 'team'],
  TEAM_MEMBER_UPDATED: ['Cambió permisos o acceso', 'team'],
  OWNERSHIP_TRANSFER_STARTED: ['Propuso transferir la propiedad', 'building'],
  OWNERSHIP_TRANSFER_CANCELLED: ['Canceló la transferencia', 'building'],
  OWNERSHIP_TRANSFERRED: ['Transfirió la propiedad', 'building'],
  PLAN_CHANGED: ['Cambió el plan', 'plans'],
  SETTINGS_UPDATED: ['Actualizó la configuración', 'settings'],
  INTEGRATION_UPDATED: ['Actualizó una integración', 'plug'],
  COMPANY_STATUS_CHANGED: ['Cambió el estado del negocio', 'info'],
  COMPANY_DELETION_REQUESTED: ['Programó la eliminación del negocio', 'trash'],
  COMPANY_DELETION_CANCELLED: ['Canceló la eliminación del negocio', 'undo'],
  DATA_EXPORTED: ['Exportó los datos', 'download'],
  ORDER_CREATED: ['Registró un pedido', 'orders'],
  ORDER_CANCELLED: ['Canceló un pedido', 'orders'],
  PAYMENT_REFUNDED: ['Reembolsó un cobro', 'payments'],
  INVENTORY_ADJUSTED: ['Ajustó stock', 'inventory'],
  PRODUCT_DELETED: ['Eliminó un producto', 'products'],
  PRODUCTS_BULK_CHANGED: ['Cambió productos en lote', 'products'],
  CATEGORY_DELETED: ['Eliminó una categoría', 'categories'],
  COUPON_DELETED: ['Eliminó un cupón', 'coupons'],
}

const DETAIL_LABELS = { method: 'Método', from: 'De', to: 'A', by: 'Origen', provider: 'Proveedor', revoked: 'Sesiones', sessionsRevoked: 'Sesiones cerradas', total: 'Total', months: 'Meses', flow: 'Flujo', updated: 'Actualizados', deleted: 'Eliminados', name: 'Nombre', device: 'Dispositivo' }

function details(metadata) {
  if (!metadata) return ''
  return Object.entries(metadata)
    .filter(([key]) => DETAIL_LABELS[key])
    .map(([key, value]) => `${DETAIL_LABELS[key]}: ${value}`)
    .join(' · ')
}

export default function ActivityPage() {
  const access = useAccess()
  const canView = access.can('AUDIT_VIEW')
  const [filters, setFilters] = useState({ action: '', from: '', to: '' })
  const [page, setPage] = useState(0)
  const actions = useApi(() => api.get('/audit/actions'), [], { enabled: canView })
  const { data, loading, error, reload } = useApi(
    () => api.get('/audit', { ...filters, page, size: 25 }),
    [filters.action, filters.from, filters.to, page],
    { enabled: canView },
  )

  if (access.ready && !canView) return <DashboardLayout><NoAccess module="Actividad" /></DashboardLayout>

  const setFilter = (key, value) => { setFilters((f) => ({ ...f, [key]: value })); setPage(0) }
  const rows = data?.content || []

  return (
    <DashboardLayout>
      <div className="fx-page-head">
        <div>
          <h1>Actividad</h1>
          <p>Accesos, cambios de equipo y operaciones sensibles del negocio. Se guarda un año.</p>
        </div>
      </div>

      <div className="fx-card" style={{ marginBottom: 14 }}>
        <div className="fx-card__body fx-row" style={{ gap: 10, flexWrap: 'wrap' }}>
          <select className="fx-input" style={{ maxWidth: 280 }} value={filters.action} onChange={(e) => setFilter('action', e.target.value)} aria-label="Acción">
            <option value="">Todas las acciones</option>
            {(actions.data || []).map((a) => <option key={a} value={a}>{ACTIONS[a]?.[0] || a}</option>)}
          </select>
          <input className="fx-input" type="date" style={{ maxWidth: 170 }} value={filters.from} onChange={(e) => setFilter('from', e.target.value)} aria-label="Desde" />
          <input className="fx-input" type="date" style={{ maxWidth: 170 }} value={filters.to} onChange={(e) => setFilter('to', e.target.value)} aria-label="Hasta" />
        </div>
      </div>

      {error && <div style={{ marginBottom: 14 }}><ErrorState error={error} onRetry={reload} /></div>}

      <div className="fx-card">
        {loading && !data ? (
          <div className="fx-card__body">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="fx-skeleton" style={{ height: 40, marginBottom: 8 }} />)}</div>
        ) : rows.length === 0 ? (
          <EmptyState icon="history" title="Sin actividad" text="Cuando alguien del equipo inicie sesión o haga cambios importantes, aparecerá acá." />
        ) : (
          <>
            <ul className="fx-list" style={{ padding: '4px 20px' }}>
              {rows.map((row) => {
                const [label, icon] = ACTIONS[row.action] || [row.action, 'info']
                const warn = row.action === 'LOGIN_FAILED' || row.action === 'REFRESH_REUSE_DETECTED'
                return (
                  <li key={row.id} className="fx-list__row" style={{ alignItems: 'flex-start', gap: 12 }}>
                    <span className={`fx-auth__mark${warn ? ' fx-auth__mark--danger' : ''}`} style={{ width: 32, height: 32, margin: 0, flexShrink: 0 }}>
                      <Icon name={icon} size={15} />
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: 'var(--fx-ink)', fontSize: 13.5 }}>
                        <strong style={{ fontWeight: 600 }}>{row.actorLabel || 'Sistema'}</strong> · {label}
                      </div>
                      {details(row.metadata) && <div className="fx-hint" style={{ fontSize: 12 }}>{details(row.metadata)}</div>}
                    </div>
                    <span className="fx-hint" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{dateTime(row.createdAt)}</span>
                  </li>
                )
              })}
            </ul>
            <Pagination page={data.page} totalPages={data.totalPages} totalElements={data.totalElements} size={data.size} onChange={setPage} noun="registros" />
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
