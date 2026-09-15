// Confirmación del pedido: datos de contacto, pago, cupón y resumen.
import { useEffect, useRef, useState } from 'react'
import Icon from '@/components/Icon'
import { createOrder, validateCoupon } from '@/modules/store/api/storeApi'
import { trackPurchase } from '@/modules/store/hooks/useStoreTracking'
import { newIdempotencyKey } from '@/app/session'
import { ProductPlaceholder } from './ProductCard'
import { PAYMENT_LABELS, money, paymentMethods, productImages } from '../lib/storeFormat'

const BUYER_KEY = 'fluxy_buyer'

function readBuyer() {
  try {
    const saved = JSON.parse(localStorage.getItem(BUYER_KEY) || 'null')
    return saved && typeof saved === 'object' ? saved : null
  } catch {
    return null
  }
}

export default function CheckoutModal({ open, cart, total, count, company, onClose, onSuccess }) {
  const methods = paymentMethods(company)
  const orderKey = useRef(newIdempotencyKey('pedido'))
  const [form, setForm] = useState(() => {
    const saved = readBuyer()
    return { name: saved?.name || '', phone: saved?.phone || '', address: saved?.address || '', note: '' }
  })
  const [remember, setRemember] = useState(true)
  const [payment, setPayment] = useState('')
  const [coupon, setCoupon] = useState('')
  const [couponData, setCouponData] = useState(null)
  const [couponState, setCouponState] = useState({ loading: false, error: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [failure, setFailure] = useState('')
  const [order, setOrder] = useState(null)

  useEffect(() => {
    if (!open) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = previous }
  }, [open])

  const close = () => {
    setOrder(null)
    setFailure('')
    setErrors({})
    onClose()
  }

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => { if (event.key === 'Escape' && !submitting) close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // El cupón se validó contra otro total: se vuelve a aplicar.
  useEffect(() => { setCouponData(null) }, [total])

  if (!open) return null

  const set = (field) => (event) => {
    setForm((f) => ({ ...f, [field]: event.target.value }))
    setErrors((e) => ({ ...e, [field]: undefined }))
  }

  const applyCoupon = async () => {
    const code = coupon.trim().toUpperCase()
    if (!code || !company?.id) return
    setCouponState({ loading: true, error: '' })
    setCouponData(null)
    try {
      const data = await validateCoupon(company.id, code, total)
      if (!data?.valid) throw new Error(data?.error || 'El cupón no es válido')
      setCouponData(data)
      setCouponState({ loading: false, error: '' })
    } catch (error) {
      setCouponState({ loading: false, error: error.message })
    }
  }

  const submit = async (event) => {
    event.preventDefault()
    const found = {}
    if (form.name.trim().length < 2) found.name = 'Ingresá tu nombre.'
    if (form.phone.replace(/\D/g, '').length < 7) found.phone = 'Ingresá un número para coordinar la entrega.'
    if (methods.length > 0 && !payment) found.payment = 'Elegí cómo vas a pagar.'
    setErrors(found)
    if (Object.keys(found).length) {
      document.getElementById(`sf-checkout-${Object.keys(found)[0]}`)?.focus()
      return
    }

    setSubmitting(true)
    setFailure('')
    try {
      const address = [form.address.trim(), form.note.trim() && `Nota: ${form.note.trim()}`].filter(Boolean).join(' · ')
      const data = await createOrder(company.id, {
        customerName: form.name.trim(),
        customerPhone: form.phone.trim(),
        customerAddress: address.slice(0, 300),
        items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
        couponCode: couponData?.code || null,
        paymentMethod: payment || null,
      }, orderKey.current)
      orderKey.current = newIdempotencyKey('pedido')
      try {
        if (remember) localStorage.setItem(BUYER_KEY, JSON.stringify({ name: form.name.trim(), phone: form.phone.trim(), address: form.address.trim() }))
        else localStorage.removeItem(BUYER_KEY)
      } catch { /* sin almacenamiento */ }
      trackPurchase({ orderId: data.orderId, total: data.total, items: cart })
      setOrder({ id: data.orderId || data.order?.id, total: data.total, whatsappUrl: data.whatsappUrl })
      onSuccess()
    } catch (error) {
      setFailure(error.message || 'No se pudo confirmar el pedido. Intentá de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  const finalTotal = Number(couponData?.finalTotal ?? total)

  return (
    <div className="sf-overlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && !submitting && !order && close()}>
      <div className={`sf-checkout${order ? ' sf-checkout--done' : ''}`} role="dialog" aria-modal="true" aria-labelledby="sf-checkout-title">
        {order ? (
          <div className="sf-done">
            <span className="sf-done__icon"><Icon name="check" size={34} strokeWidth={2.4} /></span>
            <h2 id="sf-checkout-title">¡Pedido recibido!</h2>
            <p>{company?.name} ya tiene tu pedido y te va a contactar al <strong>{form.phone}</strong> para coordinar la entrega y el pago.</p>
            <div className="sf-done__ticket">
              <div><small>Pedido</small><strong>#{order.id}</strong></div>
              <div><small>Total</small><strong>{money(order.total)}</strong></div>
            </div>
            <div className="sf-done__actions">
              {order.whatsappUrl && (
                <a className="sf-btn sf-btn--whatsapp sf-btn--lg sf-btn--block" href={order.whatsappUrl} target="_blank" rel="noreferrer">
                  <Icon name="whatsapp" size={18} /> Enviar pedido por WhatsApp
                </a>
              )}
              <button type="button" className="sf-btn sf-btn--ghost sf-btn--lg sf-btn--block" onClick={close}>Seguir comprando</button>
            </div>
          </div>
        ) : (
          <form className="sf-checkout__form" onSubmit={submit} noValidate>
            <header className="sf-checkout__head">
              <div>
                <h2 id="sf-checkout-title">Finalizar pedido</h2>
                <p>Sin crear cuenta. El negocio te contacta para coordinar.</p>
              </div>
              <button type="button" className="sf-icon-btn" onClick={close} disabled={submitting} aria-label="Cerrar"><Icon name="close" size={20} /></button>
            </header>

            <div className="sf-checkout__body">
              <div className="sf-checkout__fields">
                <fieldset className="sf-fieldset">
                  <legend><span>1</span> Tus datos</legend>
                  <label className="sf-field">
                    <span>Nombre y apellido</span>
                    <input id="sf-checkout-name" value={form.name} onChange={set('name')} autoComplete="name" maxLength={150}
                      placeholder="Ej.: Ana Pérez" aria-invalid={Boolean(errors.name)} />
                    {errors.name && <em>{errors.name}</em>}
                  </label>
                  <label className="sf-field">
                    <span>WhatsApp o teléfono</span>
                    <input id="sf-checkout-phone" value={form.phone} onChange={set('phone')} autoComplete="tel" inputMode="tel" maxLength={30}
                      placeholder="999 888 777" aria-invalid={Boolean(errors.phone)} />
                    {errors.phone && <em>{errors.phone}</em>}
                  </label>
                  <label className="sf-field sf-field--full">
                    <span>Dirección de entrega <small>(opcional si recogés)</small></span>
                    <input value={form.address} onChange={set('address')} autoComplete="street-address" maxLength={220} placeholder="Av. Ejemplo 123, distrito" />
                  </label>
                  <label className="sf-field sf-field--full">
                    <span>Nota para el negocio <small>(opcional)</small></span>
                    <input value={form.note} onChange={set('note')} maxLength={70} placeholder="Referencia, horario, sin cebolla…" />
                  </label>
                </fieldset>

                {methods.length > 0 && (
                  <fieldset className="sf-fieldset">
                    <legend><span>2</span> ¿Cómo vas a pagar?</legend>
                    <div className="sf-pay">
                      {methods.map((key, index) => (
                        <label key={key} className={`sf-pay__option${payment === key ? ' is-on' : ''}`}>
                          <input id={index === 0 ? 'sf-checkout-payment' : undefined} type="radio" name="sf-payment" value={key}
                            checked={payment === key} onChange={() => { setPayment(key); setErrors((e) => ({ ...e, payment: undefined })) }} />
                          <Icon name={key === 'efectivo' ? 'money' : key === 'yape' || key === 'plin' ? 'phone' : 'card'} size={16} />
                          {PAYMENT_LABELS[key] || key}
                        </label>
                      ))}
                    </div>
                    {errors.payment && <em className="sf-field-error">{errors.payment}</em>}
                  </fieldset>
                )}
              </div>

              <aside className="sf-checkout__summary" aria-label="Resumen del pedido">
                <p className="sf-checkout__summary-title">Tu pedido <small>{count} {count === 1 ? 'producto' : 'productos'}</small></p>
                <ul>
                  {cart.map(({ product, quantity }) => {
                    const image = productImages(product)[0]
                    return (
                      <li key={product.id}>
                        <span className="sf-mini-img">{image ? <img src={image} alt="" /> : <ProductPlaceholder product={product} size={18} />}<b>{quantity}</b></span>
                        <span className="sf-mini-name">{product.name}</span>
                        <strong>{money(Number(product.price) * quantity)}</strong>
                      </li>
                    )
                  })}
                </ul>

                <div className="sf-coupon">
                  <input value={coupon} placeholder="Cupón de descuento" aria-label="Cupón de descuento"
                    onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponData(null); setCouponState({ loading: false, error: '' }) }}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyCoupon() } }} />
                  <button type="button" onClick={applyCoupon} disabled={couponState.loading || !coupon.trim()}>
                    {couponState.loading ? '…' : 'Aplicar'}
                  </button>
                </div>
                {couponState.error && <p className="sf-note sf-note--error"><Icon name="alert" size={14} /> {couponState.error}</p>}

                <div className="sf-summary-row"><span>Subtotal</span><span>{money(total)}</span></div>
                {couponData && <div className="sf-summary-row sf-summary-row--ok"><span>Cupón {couponData.code}</span><span>− {money(couponData.discount)}</span></div>}
                <div className="sf-summary-row sf-summary-row--muted"><span>Entrega</span><span>A coordinar</span></div>
                <div className="sf-summary-row sf-summary-row--total"><span>Total</span><strong>{money(finalTotal)}</strong></div>

                <label className="sf-check">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  Recordar mis datos en este dispositivo
                </label>

                {failure && <p className="sf-note sf-note--error" role="alert"><Icon name="alert" size={14} /> {failure}</p>}

                <button type="submit" className="sf-btn sf-btn--primary sf-btn--lg sf-btn--block" disabled={submitting || cart.length === 0}>
                  {submitting ? <><span className="sf-spinner" /> Enviando pedido…</> : <>Confirmar pedido · {money(finalTotal)}</>}
                </button>
                <p className="sf-checkout__legal"><Icon name="shield" size={13} /> Tus datos solo se comparten con {company?.name || 'el negocio'}.</p>
              </aside>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
