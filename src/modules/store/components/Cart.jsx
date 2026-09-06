import { useEffect } from 'react'
import Icon from '@/components/Icon'

export default function Cart({ open, cart, total, onClose, onIncrease, onDecrease, onCheckout }) {
  useEffect(() => {
    if (!open) return undefined
    const previousOverflow = document.body.style.overflow
    const onKeyDown = event => {
      if (event.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null
  const count = cart.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="store-drawer-layer">
      <button className="store-drawer-backdrop" onClick={onClose} aria-label="Cerrar carrito" />
      <aside className="store-cart" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <div className="store-modal-head">
          <div>
            <span className="store-section-label">Resumen</span>
            <h2 id="cart-title">Tu carrito</h2>
            <p>{count} {count === 1 ? 'producto' : 'productos'}</p>
          </div>
          <button className="store-icon-button" onClick={onClose} aria-label="Cerrar carrito">
            <Icon name="close" size={19} />
          </button>
        </div>

        <div className="store-cart__items">
          {cart.length === 0 ? (
            <div className="store-state store-state--compact">
              <Icon name="orders" size={34} />
              <strong>Tu carrito está vacío</strong>
              <p>Agrega productos del catálogo para continuar.</p>
              <button type="button" className="store-button store-button--secondary" onClick={onClose}>Volver al catálogo</button>
            </div>
          ) : (
            cart.map(item => (
              <article className="store-cart-item" key={item.product.id}>
                <div className="store-cart-item__image">
                  {item.product.imageUrl
                    ? <img src={item.product.imageUrl} alt="" />
                    : <Icon name="package" size={22} />}
                </div>
                <div className="store-cart-item__info">
                  <h3>{item.product.name}</h3>
                  <span>S/ {Number(item.product.price || 0).toFixed(2)} por unidad</span>
                  <div className="store-quantity" aria-label={`Cantidad de ${item.product.name}`}>
                    <button type="button" onClick={() => onDecrease(item.product.id)} aria-label="Reducir cantidad">−</button>
                    <strong>{item.quantity}</strong>
                    <button
                      type="button"
                      onClick={() => onIncrease(item.product.id)}
                      disabled={item.quantity >= Number(item.product.stock)}
                      aria-label="Aumentar cantidad"
                    >+</button>
                  </div>
                </div>
                <strong className="store-cart-item__total">S/ {(Number(item.product.price || 0) * item.quantity).toFixed(2)}</strong>
              </article>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="store-cart__footer">
            <div className="store-cart__total">
              <span>Total del pedido</span>
              <strong>S/ {total.toFixed(2)}</strong>
            </div>
            <button type="button" className="store-button store-button--primary" onClick={onCheckout}>
              Continuar con el pedido
              <Icon name="arrowRight" size={17} />
            </button>
            <p>Revisa tus datos antes de confirmar. El vendedor coordinará la entrega contigo.</p>
          </div>
        )}
      </aside>
    </div>
  )
}
