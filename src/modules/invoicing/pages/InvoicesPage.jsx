// src/modules/invoicing/pages/InvoicesPage.jsx
// Comprobantes electrónicos del negocio: boletas, facturas y notas de crédito.
import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import DashboardLayout from '@/modules/dashboard/components/DashboardLayout'
import { EmptyState, ErrorState, Modal, NoAccess, Pagination } from '@/modules/dashboard/components/ui'
import PlanGate from '@/components/PlanGate'
import Icon from '@/components/Icon'
import useAccess from '@/hooks/useAccess'
import useApi, { useDebounced } from '@/hooks/useApi'
import { api } from '@/app/api'
import { date, money } from '@/app/format'
import DocumentDetailModal from '../components/DocumentDetailModal'
import EmitDocumentModal from '../components/EmitDocumentModal'
import { getStatus, listDocuments } from '../api/invoicingApi'
import { CONFIG_STATUS, DOC_STATUS, DOC_TYPES, ID_TYPES } from '../lib/invoicingFormat'

const TABS = [
  { key: '', label: 'Todos' },
  { key: 'BOLETA', label: 'Boletas' },
  { key: 'FACTURA', label: 'Facturas' },
  { key: 'NOTA_CREDITO', label: 'Notas' },
]

export default function InvoicesPage() {
  const access = useAccess()
  if (access.ready && !access.can('INVOICE_VIEW')) {
    return <DashboardLayout><NoAccess module="Comprobantes" /></DashboardLayout>
  }
  return <InvoicesContent access={access} />
}

function InvoicesContent({ access }) {
  const status = useApi(getStatus, [])
  const [type, setType] = useState('')
  const [state, setState] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const [openId, setOpenId] = useState(null)
  const [justEmitted, setJustEmitted] = useState(null)
  const [emitOpen, setEmitOpen] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [emitOrder, setEmitOrder] = useState(null)
  const [lookingUp, setLookingUp] = useState(false)
  const q = useDebounced(query, 300)
  const docs = useApi(() => listDocuments({ type, status: state, q, page, size: 20 }), [type, state, q, page])
  const s = status.data
  const canConfigure = access.can('INVOICING_CONFIGURE')
  const active = s?.status === 'ACTIVE'

  const findOrder = async (e) => {
    e.preventDefault()
    const id = Number(orderNumber.replace(/\D/g, ''))
    if (!id) return
    setLookingUp(true)
    try {
      setEmitOrder(await api.get(`/orders/${id}/detail`))
      setEmitOpen(false)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setLookingUp(false)
    }
  }

  if (s && !s.planAllowed) {
    return <DashboardLayout><PlanGate currentPlan="FREE" requiredPlan="PRO" /></DashboardLayout>
  }

  return (
    <DashboardLayout>
      <div className="fx-page-head">
        <div>
          <h1>Comprobantes</h1>
          <p>Boletas, facturas y notas de crédito electrónicas de tus ventas.</p>
        </div>
        <div className="fx-page-head__actions">
          {canConfigure && (
            <Link to="/dashboard/invoices/settings" className="fx-btn fx-btn--secondary"><Icon name="settings" size={15} /> Configuración</Link>
          )}
          {active && access.can('INVOICE_CREATE') && access.can('ORDER_VIEW') && (
            <button type="button" className="fx-btn fx-btn--primary" onClick={() => setEmitOpen(true)}><Icon name="plus" size={16} /> Emitir comprobante</button>
          )}
        </div>
      </div>

      {status.error && <div style={{ marginBottom: 14 }}><ErrorState error={status.error} onRetry={status.reload} /></div>}
      {s && !active && (
        <div className="fx-alert fx-alert--warn" style={{ marginBottom: 16, alignItems: 'center' }}>
          <Icon name="info" size={16} />
          <span style={{ flex: 1 }}>
            La facturación electrónica está <b>{CONFIG_STATUS[s.status]?.label.toLowerCase() || s.status}</b>
            {s.statusReason ? `: ${s.statusReason}` : '.'} {canConfigure ? '' : 'Pedile al dueño que la configure.'}
          </span>
          {canConfigure && <Link to="/dashboard/invoices/settings" className="fx-btn fx-btn--secondary fx-btn--sm">Configurar</Link>}
        </div>
      )}
      {s && active && s.environment === 'TEST' && (
        <div className="fx-alert fx-alert--warn" style={{ marginBottom: 16 }}>
          <Icon name="info" size={16} />
          <span>Modo de prueba: los comprobantes se generan para probar el flujo y no se envían a SUNAT. Cuando conectes tu proveedor empiezan los reales, con otra numeración.</span>
        </div>
      )}

      <div className="fx-tabs" role="tablist" style={{ marginBottom: 12 }}>
        {TABS.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={type === t.key} className={`fx-tab${type === t.key ? ' fx-tab--on' : ''}`}
            onClick={() => { setType(t.key); setPage(0) }}>{t.label}</button>
        ))}
      </div>
      <div className="fx-toolbar">
        <div className="fx-search">
          <Icon name="search" size={15} />
          <input className="fx-input" placeholder="Número (B001-12), cliente o documento" value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(0) }} aria-label="Buscar comprobantes" />
        </div>
        <select className="fx-select" style={{ maxWidth: 200 }} value={state} onChange={(e) => { setState(e.target.value); setPage(0) }} aria-label="Estado">
          <option value="">Todos los estados</option>
          {Object.entries(DOC_STATUS).filter(([k]) => k !== 'DRAFT').map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="fx-card">
        {docs.error ? (
          <div className="fx-card__body"><ErrorState error={docs.error} onRetry={docs.reload} /></div>
        ) : docs.loading && !docs.data ? (
          <div className="fx-card__body">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="fx-skeleton" style={{ height: 42, marginBottom: 8 }} />)}</div>
        ) : !docs.data?.content?.length ? (
          <EmptyState icon="receipt" title={q || type || state ? 'No hay comprobantes con esos filtros' : 'Todavía no emitiste comprobantes'}
            text={active ? 'Emitilos desde un pedido o activá la emisión automática en la configuración.' : ''} />
        ) : (
          <>
            <div className="fx-table-wrap">
              <table className="fx-table fx-table--stack">
                <thead>
                  <tr>
                    <th>Documento</th>
                    <th>Cliente</th>
                    <th className="fx-hide-md">Fecha</th>
                    <th className="fx-table__num">Total</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {docs.data.content.map((d) => (
                    <tr key={d.id} className="is-clickable" style={{ cursor: 'pointer' }} onClick={() => setOpenId(d.id)}>
                      <td className="fx-cell--main">
                        <span className="fx-table__strong fx-num">{d.fullNumber}</span>
                        <span className="fx-hint" style={{ display: 'block', fontSize: 12.5 }}>
                          {DOC_TYPES[d.type]?.label}{d.test ? ' · prueba' : ''}{d.orderId ? ` · Pedido #${d.orderId}` : ''}
                        </span>
                      </td>
                      <td className="fx-hide-sm">
                        <span className="fx-truncate" style={{ display: 'block', maxWidth: 240 }}>{d.customerName}</span>
                        {d.customerDocumentNumber && <span className="fx-hint" style={{ fontSize: 12.5 }}>{ID_TYPES[d.customerDocumentType]} {d.customerDocumentNumber}</span>}
                      </td>
                      <td className="fx-hide-md" style={{ fontSize: 13 }}>{date(d.issuedAt)}</td>
                      <td className="fx-table__num fx-table__strong fx-cell--end">{d.type === 'NOTA_CREDITO' ? '− ' : ''}{money(d.total)}</td>
                      <td className="fx-cell--sub">
                        <span className={`fx-badge ${DOC_STATUS[d.status]?.badge || ''}`}><span className="fx-dot" />{DOC_STATUS[d.status]?.label || d.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination page={docs.data.page} totalPages={docs.data.totalPages} totalElements={docs.data.totalElements}
              size={docs.data.size} onChange={setPage} noun="comprobantes" />
          </>
        )}
      </div>

      {openId && (
        <DocumentDetailModal documentId={openId} paperWidth={s?.paperWidth || 80} autoPrint={Boolean(s?.printAutomatically) && justEmitted === openId}
          onClose={() => { setOpenId(null); setJustEmitted(null) }}
          onChanged={() => docs.refresh()} onOpenDocument={setOpenId} key={openId} />
      )}

      {emitOpen && (
        <Modal as="form" onSubmit={findOrder} title="Emitir comprobante" subtitle="Los comprobantes se emiten sobre un pedido." onClose={() => setEmitOpen(false)} width={420}
          footer={(
            <>
              <button type="button" className="fx-btn fx-btn--ghost" onClick={() => setEmitOpen(false)}>Cancelar</button>
              <button type="submit" className="fx-btn fx-btn--primary" disabled={lookingUp}>{lookingUp ? <span className="fx-spinner" /> : 'Continuar'}</button>
            </>
          )}>
          <div className="fx-field">
            <label className="fx-label" htmlFor="emit-order">Número de pedido</label>
            <input id="emit-order" className="fx-input" inputMode="numeric" placeholder="#128" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} autoFocus />
          </div>
          <p className="fx-hint">También podés emitirlo desde el detalle del pedido, en Pedidos.</p>
        </Modal>
      )}
      {emitOrder && (
        <EmitDocumentModal order={emitOrder} status={s} onClose={() => setEmitOrder(null)}
          onEmitted={(doc) => {
            setEmitOrder(null)
            toast.success(`Comprobante ${doc.fullNumber} registrado`)
            docs.refresh()
            setJustEmitted(doc.id)
            setOpenId(doc.id)
          }} />
      )}
    </DashboardLayout>
  )
}
