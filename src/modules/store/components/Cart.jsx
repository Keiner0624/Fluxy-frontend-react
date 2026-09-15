// Carrito lateral.
import { useEffect } from 'react'
import Icon from '@/components/Icon'
import { ProductPlaceholder, QuantityStepper } from './ProductCard'
import { money, productImages, stockOf } from '../lib/storeFormat'

export default function Cart({ open, cart, total, count, ordersPaused, onClose, onSetQuantity, onRemove, onCheckout, onShop, onOpenProduct }) {
  useEffect(() => {
    if (!open) return undefined
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="sf-drawer-layer">
      <button type="button" className="sf-backdrop" onClick={onClose} aria-label="Cerrar carrito" />
      <aside className="sf-drawer" role="dialog" aria-modal="true" aria-labelledby="sf-cart-title">
        <header className="sf-drawer__head">
          <div>
            <h2 id="sf-cart-title">Tu carrito</h2>
            <p>{count} {count === 1 ? 'producto' : 'productos'}</p>
          </div>
          <button type="button" className="sf-icon-btn" onClick={onClose} aria-label="Cerrar carrito"><Icon name="close" size={20} /></button>
        </header>

        {cart.length === 0 ? (
          <div className="sf-empty sf-empty--drawer">
            <span className="sf-empty__icon"><Icon name="cart" size={30} /></span>
            <strong>Tu carrito está vacío</strong>
            <p>Agregá productos del catálogo y armá tu pedido.</p>
            <button type="button" className="sf-btn sf-btn--primary" onClick={onShop}>Ver productos <Icon name="arrowRight" size={16} /></button>
          </div>
        ) : (
          <>
            <ul className="sf-drawer__items">
              {cart.map(({ product, quantity }) => {
                const image = productImages(product)[0]
                return (
                  <li key={product.id} className="sf-line">
                    <button type="button" className="sf-line__img" onClick={() => onOpenProduct(product)} aria-label={`Ver ${product.name}`}>
                      {image ? <img src={image} alt="" /> : <ProductPlaceholder product={product} size={24} />}
                    </button>
                    <div className="sf-line__info">
                      <div className="sf-line__top">
                        <strong>{product.name}</strong>
                        <button type="button" className="sf-line__remove" onClick={() => onRemove(product.id)} aria-label={`Quitar ${product.name}`}>
                          <Icon name="trash" size={15} />
                        </button>
                      </div>
                      <small>{money(product.price)} c/u</small>
                      <div className="sf-line__bottom">
                        <QuantityStepper size="sm" value={quantity} max={stockOf(product)} onChange={(next) => onSetQuantity(product, next)} label={`Cantidad de ${product.name}`} />
                        <strong>{money(Number(product.price) * quantity)}</strong>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>

            <footer className="sf-drawer__foot">
              <div className="sf-summary-row"><span>Subtotal</span><strong>{money(total)}</strong></div>
              <div className="sf-summary-row sf-summary-row--muted"><span>Entrega</span><span>Se coordina con el negocio</span></div>
              {ordersPaused && (
                <p className="sf-note sf-note--warn"><Icon name="info" size={15} /> La tienda no está recibiendo pedidos por ahora.</p>
              )}
              <button type="button" className="sf-btn sf-btn--primary sf-btn--lg sf-btn--block" onClick={onCheckout} disabled={ordersPaused}>
                Continuar con el pedido <Icon name="arrowRight" size={18} />
              </button>
              <button type="button" className="sf-btn sf-btn--text sf-btn--block" onClick={onShop}>Seguir comprando</button>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
