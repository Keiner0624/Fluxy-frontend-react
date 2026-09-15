// Detalle del producto: galería, cantidad, entrega y productos relacionados.
import { useEffect, useMemo, useRef, useState } from 'react'
import Icon from '@/components/Icon'
import { ProductPlaceholder, QuantityStepper } from './ProductCard'
import { mapsLink, money, productImages, stockOf, whatsappLink } from '../lib/storeFormat'

export default function ProductDetail({ product, company, related, inCart, favorite, ordersPaused, whatsappAllowed, onAdd, onOpen, onToggleFavorite, onClose, onViewCart }) {
  const images = useMemo(() => productImages(product), [product])
  const stock = stockOf(product)
  const isOut = stock <= 0
  const available = Math.max(0, stock - inCart)
  const [active, setActive] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const panel = useRef(null)

  useEffect(() => {
    setActive(0)
    setQuantity(1)
    setAdded(false)
    panel.current?.scrollTo?.({ top: 0 })
  }, [product.id])

  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
      if (images.length > 1 && event.key === 'ArrowRight') setActive((i) => (i + 1) % images.length)
      if (images.length > 1 && event.key === 'ArrowLeft') setActive((i) => (i - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      window.removeEventListener('keydown', onKey)
    }
  }, [images.length, onClose])

  const add = () => {
    if (isOut || ordersPaused || available <= 0) return
    onAdd(product, Math.min(quantity, available))
    setAdded(true)
  }

  const consult = whatsappAllowed
    ? whatsappLink(company, `Hola, quiero consultar por "${product.name}" de ${company?.name || 'la tienda'}.`)
    : ''

  return (
    <div className="sf-overlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <article ref={panel} className="sf-detail" role="dialog" aria-modal="true" aria-labelledby="sf-detail-title">
        <button type="button" className="sf-icon-btn sf-detail__close" onClick={onClose} aria-label="Cerrar">
          <Icon name="close" size={20} />
        </button>

        <div className="sf-detail__grid">
          <div className="sf-detail__gallery">
            <div className="sf-detail__main">
              {images.length ? <img src={images[active]} alt={product.name} /> : <ProductPlaceholder product={product} size={72} />}
              {images.length > 1 && (
                <>
                  <button type="button" className="sf-gallery-nav is-prev" onClick={() => setActive((i) => (i - 1 + images.length) % images.length)} aria-label="Foto anterior"><Icon name="arrowLeft" size={18} /></button>
                  <button type="button" className="sf-gallery-nav is-next" onClick={() => setActive((i) => (i + 1) % images.length)} aria-label="Foto siguiente"><Icon name="arrowRight" size={18} /></button>
                </>
              )}
              <button type="button" className={`sf-fav${favorite ? ' is-on' : ''}`} onClick={() => onToggleFavorite(product.id)} aria-pressed={favorite}
                aria-label={favorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}>
                <Icon name="heart" size={18} strokeWidth={2} />
              </button>
            </div>
            {images.length > 1 && (
              <div className="sf-detail__thumbs">
                {images.map((src, index) => (
                  <button key={src} type="button" className={index === active ? 'is-active' : ''} onClick={() => setActive(index)} aria-label={`Ver foto ${index + 1}`}>
                    <img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="sf-detail__info">
            {product.category?.name && <span className="sf-chip">{product.category.emoji ? `${product.category.emoji} ` : ''}{product.category.name}</span>}
            <h2 id="sf-detail-title">{product.name}</h2>
            <div className="sf-detail__price">{money(product.price)}</div>
            <p className={`sf-stock${isOut ? ' is-out' : stock <= 5 ? ' is-low' : ''}`}>
              <span />
              {isOut ? 'Sin stock por ahora' : stock <= 5 ? `¡Quedan ${stock}!` : 'Disponible'}
            </p>
            {product.description && <p className="sf-detail__desc">{product.description}</p>}

            {!isOut && (
              <div className="sf-detail__buy">
                <QuantityStepper size="lg" value={quantity} max={Math.max(1, available)} onChange={(v) => setQuantity(Math.max(1, v))} />
                <button type="button" className="sf-btn sf-btn--primary sf-btn--lg" onClick={add} disabled={ordersPaused || available <= 0}>
                  <Icon name="cart" size={18} />
                  {ordersPaused ? 'Pedidos pausados' : available <= 0 ? 'Ya tenés todo el stock' : `Agregar · ${money(Number(product.price) * Math.min(quantity, available))}`}
                </button>
              </div>
            )}

            {added && (
              <div className="sf-detail__added" role="status">
                <Icon name="checkCircle" size={18} />
                <span>Agregado al carrito{inCart ? ` · ${inCart} en total` : ''}</span>
                <button type="button" className="sf-link" onClick={onViewCart}>Ver carrito <Icon name="arrowRight" size={14} /></button>
              </div>
            )}

            <ul className="sf-detail__perks">
              <li><Icon name="truck" size={18} /><div><strong>Entrega coordinada</strong><small>Después de confirmar, el negocio te contacta para acordar la entrega.</small></div></li>
              {company?.address && (
                <li><Icon name="mapPin" size={18} /><div><strong>Recojo disponible</strong><small><a href={mapsLink(company.address)} target="_blank" rel="noreferrer">{company.address}</a></small></div></li>
              )}
              {consult ? (
                <li><Icon name="whatsapp" size={18} /><div><strong>¿Tenés dudas?</strong><small><a href={consult} target="_blank" rel="noreferrer">Consultá por WhatsApp</a></small></div></li>
              ) : (
                <li><Icon name="shield" size={18} /><div><strong>Compra protegida</strong><small>Tus datos solo se usan para gestionar tu pedido.</small></div></li>
              )}
            </ul>
          </div>
        </div>

        {related.length > 0 && (
          <section className="sf-detail__related" aria-labelledby="sf-related-title">
            <h3 id="sf-related-title">También te puede gustar</h3>
            <div className="sf-related">
              {related.map((item) => {
                const image = productImages(item)[0]
                return (
                  <button key={item.id} type="button" className="sf-related__item" onClick={() => onOpen(item)}>
                    <span className="sf-related__img">{image ? <img src={image} alt="" loading="lazy" /> : <ProductPlaceholder product={item} size={28} />}</span>
                    <span className="sf-related__name">{item.name}</span>
                    <strong>{money(item.price)}</strong>
                  </button>
                )
              })}
            </div>
          </section>
        )}
      </article>
    </div>
  )
}
