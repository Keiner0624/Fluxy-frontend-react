// src/modules/invoicing/components/OrderInvoiceSection.jsx
// Comprobante de un pedido dentro de su detalle: verlo, emitirlo o avisar que falta anularlo.
import { useState } from 'react'
import toast from 'react-hot-toast'
import Icon from '@/components/Icon'
import useApi from '@/hooks/useApi'
import useAccess from '@/hooks/useAccess'
import { money } from '@/app/format'
import { getStatus, listDocuments } from '../api/invoicingApi'
import { DOC_STATUS, DOC_TYPES } from '../lib/invoicingFormat'
import DocumentDetailModal from './DocumentDetailModal'
import EmitDocumentModal from './EmitDocumentModal'

const BLOCKING = ['DRAFT', 'PENDING', 'PROCESSING', 'ACCEPTED', 'ERROR', 'CANCEL_PENDING']

export default function OrderInvoiceSection({ order }) {
  const access = useAccess()
  const canView = access.can('INVOICE_VIEW')
  const status = useApi(getStatus, [], { enabled: canView })
  const docs = useApi(() => listDocuments({ orderId: order.id, size: 10 }), [order.id], { enabled: canView })
  const [openId, setOpenId] = useState(null)
  const [emitting, setEmitting] = useState(false)
  const [justEmitted, setJustEmitted] = useState(null)
  if (!canView || !status.data?.planAllowed) return null

  const s = status.data
  const list = docs.data?.content || []
  const active = list.find((d) => d.type !== 'NOTA_CREDITO' && BLOCKING.includes(d.status))
  const canEmit = !active && order.status !== 'CANCELLED' && access.can('INVOICE_CREATE') && (s.canIssueReceipt || s.canIssueInvoice)
  const cancelledWithInvoice = order.status === 'CANCELLED' && list.some((d) => d.type !== 'NOTA_CREDITO' && d.status === 'ACCEPTED')

  if (!list.length && !canEmit && !order.invoiceRequest) return null

  return (
    <>
      <div className="fx-row fx-row--between" style={{ margin: '22px 0 8px' }}>
        <p className="fx-eyebrow">Comprobante</p>
        {canEmit && (
          <button type="button" className="fx-btn fx-btn--secondary fx-btn--sm" onClick={() => setEmitting(true)}>
            <Icon name="receipt" size={14} /> Emitir comprobante
          </button>
        )}
      </div>
      {cancelledWithInvoice && (
        <div className="fx-alert fx-alert--warn" style={{ marginBottom: 10 }}>
          <Icon name="alert" size={16} /><span>El pedido está cancelado pero su comprobante sigue vigente: anulalo con una nota de crédito.</span>
        </div>
      )}
      {list.length === 0 ? (
        <p className="fx-hint">
          {order.invoiceRequest?.type
            ? `El cliente pidió ${order.invoiceRequest.type === 'FACTURA' ? 'factura' : 'boleta'}${order.invoiceRequest.documentNumber ? ` (${order.invoiceRequest.documentNumber})` : ''}. Todavía no se emitió.`
            : 'Sin comprobante emitido.'}
          {s.status !== 'ACTIVE' && ' La facturación no está activa.'}
        </p>
      ) : (
        <ul className="fx-list">
          {list.map((d) => (
            <li key={d.id} className="fx-list__row" style={{ cursor: 'pointer' }} onClick={() => setOpenId(d.id)}>
              <Icon name="receipt" size={15} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className="fx-table__strong fx-num">{d.fullNumber}</span>
                <span className="fx-hint" style={{ marginLeft: 8, fontSize: 12.5 }}>{DOC_TYPES[d.type]?.label}{d.test ? ' · prueba' : ''} · {money(d.total)}</span>
              </div>
              <span className={`fx-badge ${DOC_STATUS[d.status]?.badge || ''}`}>{DOC_STATUS[d.status]?.label || d.status}</span>
            </li>
          ))}
        </ul>
      )}

      {emitting && (
        <EmitDocumentModal order={order} status={s} onClose={() => setEmitting(false)}
          onEmitted={(doc) => {
            setEmitting(false)
            toast.success(`Comprobante ${doc.fullNumber} registrado`)
            docs.refresh()
            setJustEmitted(doc.id)
            setOpenId(doc.id)
          }} />
      )}
      {openId && (
        <DocumentDetailModal documentId={openId} paperWidth={s.paperWidth} autoPrint={s.printAutomatically && justEmitted === openId}
          onClose={() => { setOpenId(null); setJustEmitted(null) }} onChanged={() => docs.refresh()} onOpenDocument={setOpenId} key={openId} />
      )}
    </>
  )
}
