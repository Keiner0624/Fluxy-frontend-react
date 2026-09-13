// src/modules/dashboard/pages/IntegrationsPage.jsx
// Conexiones externas, separadas de la configuración general de la tienda.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import Icon from '@/components/Icon'
import { api } from '@/app/api'
import useApi from '@/hooks/useApi'
import useAccess from '@/hooks/useAccess'
import { ErrorState, NoAccess } from '@/modules/dashboard/components/ui'

function Status({ on, labelOn = 'Conectado', labelOff = 'No conectado' }) {
  return on
    ? <span className="fx-badge fx-badge--ok"><span className="fx-dot" />{labelOn}</span>
    : <span className="fx-badge">{labelOff}</span>
}

function IntegrationCard({ icon, title, status, children, foot }) {
  return (
    <div className="fx-card fx-integration">
      <div className="fx-card__head">
        <div className="fx-row" style={{ gap: 11 }}>
          <span className="fx-integration__logo"><Icon name={icon} size={18} /></span>
          <h2 className="fx-h3">{title}</h2>
        </div>
        {status}
      </div>
      <div className="fx-card__body">{children}</div>
      {foot && <div className="fx-modal__foot" style={{ position: 'static', borderRadius: '0 0 var(--fx-r-lg) var(--fx-r-lg)' }}>{foot}</div>}
    </div>
  )
}

function TrackingCard({ icon, title, description, placeholder, help, value, endpoint, canManage, onSaved }) {
  const [id, setId] = useState(value || '')
  const [saving, setSaving] = useState(false)

  const save = async (next) => {
    setSaving(true)
    try {
      const data = await api.put(endpoint, { id: next })
      setId(next)
      toast.success(next ? `${title} conectado.` : `${title} desconectado.`)
      onSaved(data)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const changed = (id || '') !== (value || '')
  return (
    <IntegrationCard icon={icon} title={title} status={<Status on={Boolean(value)} />}
      foot={canManage && (
        <>
          {value && <button type="button" className="fx-btn fx-btn--ghost" disabled={saving} onClick={() => save('')}>Desconectar</button>}
          <button type="button" className="fx-btn fx-btn--primary" disabled={saving || !changed || !id.trim()} onClick={() => save(id.trim())}>
            {saving ? <span className="fx-spinner" /> : 'Guardar'}
          </button>
        </>
      )}>
      <p className="fx-hint" style={{ marginBottom: 12 }}>{description}</p>
      <label className="fx-label" htmlFor={endpoint}>ID</label>
      <input id={endpoint} className="fx-input" value={id} placeholder={placeholder} readOnly={!canManage}
        onChange={(e) => setId(e.target.value.toUpperCase())} maxLength={32} />
      <p className="fx-hint" style={{ marginTop: 6, fontSize: 12.5 }}>{help}</p>
    </IntegrationCard>
  )
}

export default function IntegrationsPage() {
  const access = useAccess()
  const canView = access.can('INTEGRATION_VIEW')
  const canManage = access.can('INTEGRATION_MANAGE')
  const { data, error, reload, setData } = useApi(() => api.get('/integrations'), [], { enabled: canView })
  const [number, setNumber] = useState(null)
  const [savingWa, setSavingWa] = useState(false)

  const saveWhatsApp = async (body, message) => {
    setSavingWa(true)
    try {
      setData(await api.put('/integrations/whatsapp', body))
      setNumber(null)
      toast.success(message)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSavingWa(false)
    }
  }

  if (access.ready && !canView) return <DashboardLayout><NoAccess module="Integraciones" /></DashboardLayout>

  const wa = data?.whatsapp
  const waNumber = number ?? wa?.number ?? ''

  return (
    <DashboardLayout>
      <div className="fx-page-head">
        <div>
          <h1>Integraciones</h1>
          <p>Conectá tu tienda con las herramientas que ya usás</p>
        </div>
      </div>

      {error && <div style={{ marginBottom: 14 }}><ErrorState error={error} onRetry={reload} /></div>}
      {!data && !error && (
        <div className="fx-integrations">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="fx-skeleton" style={{ height: 230, borderRadius: 14 }} />)}</div>
      )}

      {data && (
        <div className="fx-integrations">
          <IntegrationCard icon="message" title="WhatsApp"
            status={<Status on={wa.connected} labelOn="Activo" labelOff={wa.enabled ? 'Sin número' : 'Pausado'} />}
            foot={canManage && (
              <>
                <button type="button" className="fx-btn fx-btn--ghost" disabled={savingWa}
                  onClick={() => saveWhatsApp({ enabled: !wa.enabled }, wa.enabled ? 'Avisos por WhatsApp pausados.' : 'Avisos por WhatsApp activados.')}>
                  {wa.enabled ? 'Pausar' : 'Activar'}
                </button>
                <button type="button" className="fx-btn fx-btn--primary" disabled={savingWa || waNumber === (wa.number || '')}
                  onClick={() => saveWhatsApp({ number: waNumber }, 'Número de WhatsApp guardado.')}>
                  {savingWa ? <span className="fx-spinner" /> : 'Guardar número'}
                </button>
              </>
            )}>
            <p className="fx-hint" style={{ marginBottom: 12 }}>
              Al confirmar un pedido, el cliente recibe un enlace para enviarte el resumen por WhatsApp y vos recibís el aviso.
            </p>
            <label className="fx-label" htmlFor="wa-number">Número del negocio</label>
            <input id="wa-number" className="fx-input" value={waNumber} readOnly={!canManage} placeholder="+51 987 654 321"
              onChange={(e) => setNumber(e.target.value)} maxLength={20} />
            {!wa.planIncludesAutomation && (
              <p className="fx-hint" style={{ marginTop: 8, fontSize: 12.5 }}>
                El mensaje automático está incluido desde el plan Pro. <Link className="fx-link" to="/dashboard/plans">Ver planes</Link>
              </p>
            )}
          </IntegrationCard>

          <IntegrationCard icon="card" title="Mercado Pago"
            status={<Status on={data.mercadoPago.platformBillingConfigured} labelOn="Planes activos" labelOff="No configurado" />}>
            <p className="fx-hint" style={{ marginBottom: 12 }}>
              Hoy Mercado Pago procesa el pago de tu plan de Fluxy. Los cobros de tus pedidos se registran en Pagos con su referencia de operación.
            </p>
            <dl className="fx-kv">
              <dt>Cobro del plan</dt><dd>{data.mercadoPago.platformBillingConfigured ? 'Disponible' : 'No disponible'}</dd>
              <dt>Checkout en tu tienda</dt><dd>Próximamente</dd>
            </dl>
            {access.can('PAYMENT_VIEW') && (
              <Link className="fx-btn fx-btn--secondary fx-btn--sm" to="/dashboard/payments" style={{ marginTop: 14 }}>
                <Icon name="payments" size={14} /> Ir a Pagos
              </Link>
            )}
          </IntegrationCard>

          <TrackingCard
            key={`ga-${data.googleAnalytics.id}`}
            icon="metrics"
            title="Google Analytics"
            description="Medí visitas, fuentes de tráfico y comportamiento en tu tienda."
            placeholder="G-XXXXXXXXXX"
            help="Lo encontrás en Analytics › Administrar › Flujos de datos."
            value={data.googleAnalytics.id}
            endpoint="/integrations/google-analytics"
            canManage={canManage}
            onSaved={setData}
          />

          <TrackingCard
            key={`px-${data.metaPixel.id}`}
            icon="globe"
            title="Meta Pixel"
            description="Medí conversiones y armá públicos para tus anuncios de Facebook e Instagram."
            placeholder="123456789012345"
            help="Lo encontrás en el Administrador de eventos de Meta."
            value={data.metaPixel.id}
            endpoint="/integrations/meta-pixel"
            canManage={canManage}
            onSaved={setData}
          />

          <IntegrationCard icon="code" title="API y webhooks" status={<span className="fx-badge">Próximamente</span>}>
            <p className="fx-hint">
              Vas a poder conectar tu sistema contable, tu ERP o automatizaciones para recibir pedidos y pagos en tiempo real.
            </p>
          </IntegrationCard>
        </div>
      )}
    </DashboardLayout>
  )
}
