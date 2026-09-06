import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import Icon from '@/components/Icon'
import { API_URL } from '@/app/config'
import { useTranslation } from '@/hooks/useTranslation'
import { createOrder } from '@/modules/store/api/storeApi'

export default function CheckoutModal({ open, cart, total, company, onClose, onSuccess }) {
  const t = useTranslation()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [coupon, setCoupon] = useState('')
  const [couponData, setCouponData] = useState(null)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [loading, setLoading] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [whatsappUrl, setWhatsappUrl] = useState(null)

  const reset = () => {
    setName('')
    setPhone('')
    setAddress('')
    setCoupon('')
    setCouponData(null)
    setCouponError('')
    setOrderId(null)
    setWhatsappUrl(null)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    const onKeyDown = event => {
      if (event.key === 'Escape' && !loading) handleClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  // handleClose intentionally uses the latest form state only when Escape is pressed.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, loading])

  if (!open) return null

  const validateCoupon = async () => {
    if (!coupon.trim() || !company?.id) return
    setCouponLoading(true)
    setCouponError('')
    setCouponData(null)
    try {
      const params = new URLSearchParams({
        code: coupon.trim().toUpperCase(),
        companyId: String(company.id),
        orderTotal: String(total),
      })
      const response = await fetch(`${API_URL}/coupons/validate?${params.toString()}`)
      const data = await response.json()
      if (!response.ok || !data.valid) throw new Error(data.error || 'El cupón no es válido')
      setCouponData(data)
    } catch (error) {
      setCouponError(error.message || 'No se pudo validar el cupón')
    } finally {
      setCouponLoading(false)
    }
  }

  const handleConfirm = async event => {
    event.preventDefault()
    if (!name.trim()) {
      toast.error(t.fullName.replace(' *', ''))
      return
    }
    if (!company?.id || cart.length === 0) {
      toast.error('No se pudo preparar el pedido')
      return
    }

    setLoading(true)
    try {
      const data = await createOrder(company.id, {
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerAddress: address.trim(),
        items: cart.map(item => ({ productId: item.product.id, quantity: item.quantity })),
        couponCode: couponData?.code || null,
      })
      setOrderId(data.orderId || data.order?.id || data.id)
      setWhatsappUrl(data.whatsappUrl || null)
      onSuccess()
    } catch (error) {
      toast.error(error.message || 'No se pudo confirmar el pedido')
    } finally {
      setLoading(false)
    }
  }

  const finalTotal = Number(couponData?.finalTotal ?? total)

  return (
    <div className="store-modal-layer" role="presentation">
      <div className="store-checkout" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
        {orderId ? (
          <div className="store-confirmation">
            <span className="store-confirmation__icon"><Icon name="check" size={30} /></span>
            <span className="store-section-label">Pedido registrado</span>
            <h2 id="checkout-title">{t.orderConfirmed}</h2>
            <p>{t.sellerNotified}</p>
            <strong className="store-order-number">Pedido #{orderId}</strong>
            <div className="store-confirmation__actions">
              {whatsappUrl && (
                <a className="store-button store-button--primary" href={whatsappUrl} target="_blank" rel="noreferrer">
                  <Icon name="message" size={17} />
                  {t.coordinateWhatsApp}
                </a>
              )}
              <button type="button" className="store-button store-button--secondary" onClick={handleClose}>{t.keepShopping}</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirm}>
            <div className="store-modal-head">
              <div>
                <span className="store-section-label">Finalizar compra</span>
                <h2 id="checkout-title">{t.confirmOrder}</h2>
                <p>Completa tus datos para que el vendedor pueda contactarte.</p>
              </div>
              <button type="button" className="store-icon-button" onClick={handleClose} disabled={loading} aria-label="Cerrar">
                <Icon name="close" size={19} />
              </button>
            </div>

            <div className="store-checkout__body">
              <section className="store-order-summary" aria-label="Productos del pedido">
                <div className="store-order-summary__title">
                  <span>Tu pedido</span>
                  <small>{cart.reduce((sum, item) => sum + item.quantity, 0)} unidades</small>
                </div>
                {cart.map(item => (
                  <div className="store-order-summary__row" key={item.product.id}>
                    <span>{item.product.name} <small>× {item.quantity}</small></span>
                    <strong>S/ {(Number(item.product.price || 0) * item.quantity).toFixed(2)}</strong>
                  </div>
                ))}
              </section>

              <div className="store-form-grid">
                <label className="store-field store-field--full">
                  <span>{t.fullName}</span>
                  <input value={name} onChange={event => setName(event.target.value)} placeholder={t.namePlaceholder} autoComplete="name" required />
                </label>
                <label className="store-field">
                  <span>{t.phoneField}</span>
                  <input value={phone} onChange={event => setPhone(event.target.value)} placeholder={t.phonePlaceholder} autoComplete="tel" inputMode="tel" />
                </label>
                <label className="store-field">
                  <span>{t.deliveryAddress}</span>
                  <input value={address} onChange={event => setAddress(event.target.value)} placeholder={t.addressPlaceholder} autoComplete="street-address" />
                </label>
              </div>

              <div className="store-coupon">
                <label htmlFor="store-coupon">Cupón de descuento</label>
                <div>
                  <input
                    id="store-coupon"
                    value={coupon}
                    onChange={event => {
                      setCoupon(event.target.value.toUpperCase())
                      setCouponData(null)
                      setCouponError('')
                    }}
                    onKeyDown={event => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        validateCoupon()
                      }
                    }}
                    placeholder="Ejemplo: PROMO20"
                  />
                  <button type="button" onClick={validateCoupon} disabled={couponLoading || !coupon.trim()}>
                    {couponLoading ? 'Validando' : 'Aplicar'}
                  </button>
                </div>
                {couponError && <p className="store-coupon__message is-error"><Icon name="alert" size={14} /> {couponError}</p>}
                {couponData && <p className="store-coupon__message is-success"><Icon name="checkCircle" size={14} /> Cupón aplicado: ahorras S/ {Number(couponData.discount || 0).toFixed(2)}</p>}
              </div>
            </div>

            <div className="store-checkout__footer">
              <div className="store-checkout__total">
                <span>{t.totalToPay}</span>
                <div>
                  {couponData && <small>S/ {total.toFixed(2)}</small>}
                  <strong>S/ {finalTotal.toFixed(2)}</strong>
                </div>
              </div>
              <button type="submit" className="store-button store-button--primary" disabled={loading}>
                {loading ? t.processing : t.confirmBtn}
                {!loading && <Icon name="arrowRight" size={17} />}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
