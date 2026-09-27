// src/modules/invoicing/components/DocumentDetailModal.jsx
// Detalle de un comprobante: estado e historial, receptor, ítems, archivos, correo, impresión,
// enlace público y nota de crédito.
import { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import Icon from '@/components/Icon'
import useApi from '@/hooks/useApi'
import useAccess from '@/hooks/useAccess'
import { newIdempotencyKey } from '@/app/session'
import { dateTime, money } from '@/app/format'
import { ConfirmDialog, ErrorState, Modal } from '@/modules/dashboard/components/ui'
import {
  createCreditNote, downloadDocumentFile, getDocument, openDocumentPdf, resendEmail, retryDocument, revokePublicLink,
} from '../api/invoicingApi'
import { CREDIT_REASONS, DOC_STATUS, DOC_TYPES, EMAIL_STATUS, EVENT_LABELS, ID_TYPES } from '../lib/invoicingFormat'
import { printTicket } from './printTicket'

const WORKING = ['PENDING', 'PROCESSING', 'CANCEL_PENDING']

export default function DocumentDetailModal({ documentId, paperWidth = 80, autoPrint = false, onClose, onChanged, onOpenDocument }) {
  const access = useAccess()
  const { data: doc, error, reload, setData } = useApi(() => getDocument(documentId), [documentId])
  const [busy, setBusy] = useState('')
  const [emailOpen, setEmailOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [creditOpen, setCreditOpen] = useState(false)
  const [reason, setReason] = useState('ANULACION')
  const [description, setDescription] = useState('')
  const [width, setWidth] = useState(paperWidth)
  const creditKey = useRef(newIdempotencyKey('nota'))
  const actions = new Set(doc?.actions || [])

  // Mientras se envía, se consulta de nuevo cada 2 s (sin volver a pedir la emisión).
  const polls = useRef(0)
  useEffect(() => {
    if (!doc || !WORKING.includes(doc.status) || polls.current > 30) return undefined
    const timer = setTimeout(() => { polls.current += 1; reload({ silent: true }) }, 2000)
    return () => clearTimeout(timer)
  }, [doc, reload])

  // Recién emitido con "imprimir al emitir": se abre el ticket apenas lo aceptan.
  const printed = useRef(false)
  useEffect(() => {
    if (!autoPrint || printed.current || doc?.status !== 'ACCEPTED') return
    printed.current = true
    try { printTicket(doc, width) } catch (e) { toast.error(e.message) }
  }, [autoPrint, doc, width])

  const run = async (name, action, success) => {
    setBusy(name)
    try {
      const updated = await action()
      if (updated && typeof updated === 'object' && updated.id) setData(updated)
      if (success) toast.success(success)
      onChanged?.()
      return updated
    } catch (e) {
      toast.error(e.message)
      return null
    } finally {
      setBusy('')
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(doc.publicUrl)
      toast.success('Enlace copiado')
    } catch {
      toast.error('No se pudo copiar el enlace.')
    }
  }

  const status = doc ? DOC_STATUS[doc.status] : null

  return (
    <>
      <Modal
        title={doc ? `${DOC_TYPES[doc.type]?.label} ${doc.fullNumber}` : 'Comprobante'}
        subtitle={doc ? `Emitido ${dateTime(doc.issuedAt)}${doc.orderId ? ` · Pedido #${doc.orderId}` : ''}` : undefined}
        onClose={onClose}
        width={760}
      >
        {error && <ErrorState error={error} onRetry={reload} />}
        {!doc && !error && <div className="fx-skeleton" style={{ height: 220 }} />}
        {doc && (
          <>
            <div className="fx-row fx-row--between" style={{ flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
              <div className="fx-row" style={{ gap: 6, flexWrap: 'wrap' }}>
                <span className={`fx-badge ${status?.badge || ''}`}>{WORKING.includes(doc.status) && <span className="fx-spinner" style={{ width: 10, height: 10 }} />}{status?.label || doc.status}</span>
                {doc.test && <span className="fx-badge fx-badge--warn">Prueba · sin valor tributario</span>}
                {doc.emailStatus !== 'NOT_REQUESTED' && <span className="fx-badge"><Icon name="mail" size={12} /> {EMAIL_STATUS[doc.emailStatus]}</span>}
              </div>
              <span className="fx-num" style={{ fontSize: 20, fontWeight: 700 }}>{money(doc.total)}</span>
            </div>

            {doc.status === 'REJECTED' && (
              <div className="fx-alert fx-alert--error" style={{ marginBottom: 14 }}>
                <Icon name="alert" size={16} />
                <span>Rechazado: {doc.providerMessage || 'sin detalle del proveedor'}. Corregí los datos y emití un comprobante nuevo desde el pedido.</span>
              </div>
            )}
            {doc.status === 'ERROR' && (
              <div className="fx-alert fx-alert--error" style={{ marginBottom: 14, alignItems: 'center' }}>
                <Icon name="alert" size={16} />
                <span style={{ flex: 1 }}>{doc.lastError || 'No se pudo enviar.'}{doc.nextAttemptAt ? ` Próximo intento: ${dateTime(doc.nextAttemptAt)}.` : ''}</span>
                {actions.has('RETRY') && access.can('INVOICE_CREATE') && (
                  <button type="button" className="fx-btn fx-btn--secondary fx-btn--sm" disabled={Boolean(busy)}
                    onClick={() => run('retry', () => retryDocument(doc.id), 'Reintento en curso')}>
                    <Icon name="refresh" size={14} /> Reintentar
                  </button>
                )}
              </div>
            )}
            {doc.creditNote && (
              <div className="fx-alert fx-alert--warn" style={{ marginBottom: 14, alignItems: 'center' }}>
                <Icon name="undo" size={16} />
                <span style={{ flex: 1 }}>Nota de crédito {doc.creditNote.fullNumber} · {DOC_STATUS[doc.creditNote.status]?.label}</span>
                {onOpenDocument && <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" onClick={() => onOpenDocument(doc.creditNote.id)}>Ver</button>}
              </div>
            )}

            <div className="fx-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(min(250px, 100%), 1fr))', gap: 20 }}>
              <section>
                <p className="fx-eyebrow" style={{ marginBottom: 8 }}>Cliente</p>
                <dl className="fx-deflist">
                  <div><dt>Nombre</dt><dd>{doc.customerName}</dd></div>
                  {doc.customerDocumentNumber && <div><dt>{ID_TYPES[doc.customerDocumentType]}</dt><dd>{doc.customerDocumentNumber}</dd></div>}
                  {doc.customerAddress && <div><dt>Dirección</dt><dd>{doc.customerAddress}</dd></div>}
                  {doc.customerEmail && <div><dt>Correo</dt><dd>{doc.customerEmail}</dd></div>}
                </dl>
              </section>
              <section>
                <p className="fx-eyebrow" style={{ marginBottom: 8 }}>Emisor</p>
                <dl className="fx-deflist">
                  <div><dt>Razón social</dt><dd>{doc.issuerName}</dd></div>
                  <div><dt>RUC</dt><dd>{doc.issuerRuc}</dd></div>
                  {doc.related && (
                    <div><dt>Modifica</dt><dd>
                      {onOpenDocument ? <button type="button" className="fx-link" onClick={() => onOpenDocument(doc.related.id)}>{doc.related.fullNumber}</button> : doc.related.fullNumber}
                      {' · '}{doc.creditReasonLabel}
                    </dd></div>
                  )}
                </dl>
              </section>
            </div>

            <p className="fx-eyebrow" style={{ margin: '20px 0 8px' }}>Detalle</p>
            <div className="fx-table-wrap" style={{ border: '1px solid var(--fx-line)', borderRadius: 'var(--fx-r)' }}>
              <table className="fx-table">
                <tbody>
                  {doc.items.map((i) => (
                    <tr key={i.line}>
                      <td className="fx-table__strong">{i.description}</td>
                      <td className="fx-table__num">{Number(i.quantity)} × {money(i.unitPrice)}</td>
                      <td className="fx-table__num fx-table__strong">{money(i.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="fx-totals">
              {Number(doc.discount) > 0 && <div><span>Descuentos (incluidos)</span><span className="fx-num">{money(doc.discount)}</span></div>}
              <div><span>Op. {doc.taxAffectation === 'GRAVADO' ? 'gravada' : doc.taxAffectation === 'EXONERADO' ? 'exonerada' : 'inafecta'}</span><span className="fx-num">{money(doc.subtotal)}</span></div>
              <div><span>IGV{doc.taxAffectation === 'GRAVADO' ? ' 18%' : ''}</span><span className="fx-num">{money(doc.tax)}</span></div>
              <div className="is-total"><span>Total</span><span className="fx-num">{money(doc.total)}</span></div>
            </div>
            <p className="fx-hint" style={{ marginTop: 6, fontSize: 12.5 }}>Son: {doc.amountInWords}</p>

            {actions.has('PDF') && (
              <div className="fx-row" style={{ gap: 8, flexWrap: 'wrap', marginTop: 18 }}>
                <button type="button" className="fx-btn fx-btn--secondary fx-btn--sm" disabled={Boolean(busy)}
                  onClick={() => run('pdf', () => openDocumentPdf(doc.id))}><Icon name="file" size={14} /> Ver PDF</button>
                <button type="button" className="fx-btn fx-btn--secondary fx-btn--sm" disabled={Boolean(busy)}
                  onClick={() => run('xml', () => downloadDocumentFile(doc.id, 'xml'))}><Icon name="download" size={14} /> XML</button>
                <div className="fx-row" style={{ gap: 4 }}>
                  <button type="button" className="fx-btn fx-btn--secondary fx-btn--sm" onClick={() => {
                    try { printTicket(doc, width) } catch (e) { toast.error(e.message) }
                  }}><Icon name="receipt" size={14} /> Imprimir ticket</button>
                  <select className="fx-select fx-select--sm" style={{ width: 96 }} value={width} onChange={(e) => setWidth(Number(e.target.value))} aria-label="Ancho del ticket">
                    <option value={80}>80 mm</option>
                    <option value={58}>58 mm</option>
                  </select>
                </div>
                {actions.has('RESEND_EMAIL') && access.can('INVOICE_RESEND') && (
                  <button type="button" className="fx-btn fx-btn--secondary fx-btn--sm" onClick={() => { setEmail(doc.customerEmail || ''); setEmailOpen((v) => !v) }}>
                    <Icon name="mail" size={14} /> {doc.emailStatus === 'SENT' ? 'Reenviar correo' : 'Enviar por correo'}
                  </button>
                )}
                {actions.has('CREDIT_NOTE') && access.can('INVOICE_CREDIT_NOTE') && (
                  <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" style={{ color: 'var(--fx-danger)' }} onClick={() => setCreditOpen(true)}>
                    <Icon name="undo" size={14} /> Nota de crédito
                  </button>
                )}
              </div>
            )}

            {emailOpen && (
              <form className="fx-row" style={{ gap: 8, marginTop: 12, flexWrap: 'wrap' }} onSubmit={async (e) => {
                e.preventDefault()
                if (await run('email', () => resendEmail(doc.id, email.trim()), 'Correo en camino')) setEmailOpen(false)
              }}>
                <input type="email" className="fx-input" style={{ flex: 1, minWidth: 200 }} value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@cliente.com" required maxLength={150} aria-label="Correo" />
                <button type="submit" className="fx-btn fx-btn--primary fx-btn--sm" disabled={busy === 'email'}>
                  {busy === 'email' ? <span className="fx-spinner" /> : 'Enviar'}
                </button>
              </form>
            )}

            {doc.publicUrl && (
              <div style={{ marginTop: 16, padding: '10px 12px', border: '1px solid var(--fx-line)', borderRadius: 10 }}>
                <p className="fx-label" style={{ marginBottom: 6 }}>Enlace público (también va en el QR)</p>
                <div className="fx-row" style={{ gap: 8, flexWrap: 'wrap' }}>
                  <input className="fx-input fx-input--sm" style={{ flex: 1, minWidth: 200 }} readOnly value={doc.publicUrl} onFocus={(e) => e.target.select()} />
                  <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" onClick={copyLink}><Icon name="copy" size={13} /> Copiar</button>
                  {access.can('INVOICE_CREATE') && (
                    <button type="button" className="fx-btn fx-btn--ghost fx-btn--sm" disabled={Boolean(busy)} title="El enlace y el QR anteriores dejan de funcionar"
                      onClick={() => run('revoke', () => revokePublicLink(doc.id), 'Enlace renovado: el anterior ya no funciona')}>
                      <Icon name="refresh" size={13} /> Renovar
                    </button>
                  )}
                </div>
              </div>
            )}

            <p className="fx-eyebrow" style={{ margin: '22px 0 10px' }}>Historial</p>
            <ol className="fx-timeline">
              {doc.history.map((h, i) => (
                <li key={i}>
                  <div className="fx-timeline__title">{EVENT_LABELS[h.type] || h.type}</div>
                  <div className="fx-timeline__meta">{dateTime(h.createdAt)}{h.actor ? ` · ${h.actor}` : ''}{h.message ? ` · ${h.message}` : ''}</div>
                </li>
              ))}
            </ol>
          </>
        )}
      </Modal>

      {creditOpen && doc && (
        <ConfirmDialog
          title={`Nota de crédito para ${doc.fullNumber}`}
          text="Anula el comprobante por el total. Queda anulado cuando la nota sea aceptada; si la rechazan, sigue vigente."
          confirmLabel="Emitir nota de crédito"
          danger
          busy={busy === 'credit'}
          onClose={() => setCreditOpen(false)}
          onConfirm={async () => {
            const note = await run('credit', () => createCreditNote(doc.id, { reason, description: description.trim() || null }, creditKey.current),
              'Nota de crédito emitida')
            if (note) {
              setCreditOpen(false)
              creditKey.current = newIdempotencyKey('nota')
              reload({ silent: true })
            }
          }}
        >
          <div className="fx-field" style={{ marginTop: 12 }}>
            <label className="fx-label" htmlFor="cn-reason">Motivo</label>
            <select id="cn-reason" className="fx-select" value={reason} onChange={(e) => setReason(e.target.value)}>
              {Object.entries(CREDIT_REASONS).filter(([k]) => k !== 'ERROR_RUC' || doc.type === 'FACTURA')
                .map(([k, label]) => <option key={k} value={k}>{label}</option>)}
            </select>
          </div>
          <div className="fx-field">
            <label className="fx-label" htmlFor="cn-desc">Detalle (opcional)</label>
            <input id="cn-desc" className="fx-input" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={250} />
          </div>
        </ConfirmDialog>
      )}
    </>
  )
}
