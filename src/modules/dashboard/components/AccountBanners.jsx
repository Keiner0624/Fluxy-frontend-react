// src/modules/dashboard/components/AccountBanners.jsx
// Avisos que afectan a toda la cuenta: correo sin verificar y tienda frenada
// por inactividad o con la eliminación programada.
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { api } from '@/app/api'
import { date } from '@/app/format'
import Icon from '@/components/Icon'

const LIFECYCLE = {
  INACTIVE: { tone: 'warn', icon: 'clock', text: 'Tu tienda lleva un tiempo sin movimiento. Sigue abierta: cualquier cambio o venta la mantiene activa.' },
  SUSPENDED: { tone: 'error', icon: 'alert', text: 'Tu tienda no está recibiendo pedidos por inactividad. Los clientes ven el catálogo, pero no pueden comprar.' },
  ARCHIVED: { tone: 'error', icon: 'alert', text: 'Tu tienda está archivada y fuera de línea. Tus datos siguen guardados.' },
}

export default function AccountBanners({ me, onChange }) {
  const [lifecycle, setLifecycle] = useState(null)
  const [busy, setBusy] = useState(false)
  const status = lifecycle?.status || me?.companyStatus

  const reactivate = async () => {
    setBusy(true)
    try {
      setLifecycle(await api.post('/company-account/lifecycle/reactivate'))
      toast.success('Tu tienda está activa de nuevo.')
      onChange?.()
    } catch (err) {
      toast.error(err.message)
    } finally {
      setBusy(false)
    }
  }

  const needsDetail = me?.companyStatus === 'DELETION_PENDING'
  useEffect(() => {
    if (!needsDetail) return
    let vigente = true
    api.get('/company-account/lifecycle').then((data) => { if (vigente) setLifecycle(data) }).catch(() => {})
    return () => { vigente = false }
  }, [needsDetail])

  const banners = []

  if (status && LIFECYCLE[status]) {
    const info = LIFECYCLE[status]
    const canReactivate = me?.permissions?.includes('SETTINGS_MANAGE')
    banners.push(
      <div key="lifecycle" className={`fx-alert fx-alert--${info.tone}`} role="status" style={{ marginBottom: 14, alignItems: 'center' }}>
        <Icon name={info.icon} size={16} />
        <span style={{ flex: 1 }}>{info.text}</span>
        {status !== 'INACTIVE' && canReactivate && (
          <button type="button" className="fx-btn fx-btn--primary fx-btn--sm" onClick={reactivate} disabled={busy}>
            {busy ? <span className="fx-spinner" /> : 'Reactivar tienda'}
          </button>
        )}
      </div>,
    )
  }

  if (status === 'DELETION_PENDING') {
    banners.push(
      <div key="deletion" className="fx-alert fx-alert--error" role="status" style={{ marginBottom: 14, alignItems: 'center' }}>
        <Icon name="trash" size={16} />
        <span style={{ flex: 1 }}>
          La eliminación del negocio está programada{lifecycle?.deletionScheduledAt ? ` para el ${date(lifecycle.deletionScheduledAt)}` : ''}. La tienda está fuera de línea.
        </span>
        {me?.role === 'OWNER' && <Link to="/dashboard/security#negocio" className="fx-btn fx-btn--secondary fx-btn--sm">Revisar</Link>}
      </div>,
    )
  }

  if (me && me.emailVerified === false) {
    banners.push(
      <div key="email" className="fx-alert fx-alert--warn" role="status" style={{ marginBottom: 14, alignItems: 'center' }}>
        <Icon name="mail" size={16} />
        <span style={{ flex: 1 }}>Verificá tu correo para poder recuperar tu cuenta si olvidás la contraseña.</span>
        <Link to="/dashboard/security#correo" className="fx-btn fx-btn--secondary fx-btn--sm">Verificar</Link>
      </div>,
    )
  }

  return banners.length ? <div>{banners}</div> : null
}
