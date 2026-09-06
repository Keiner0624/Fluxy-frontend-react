import { useEffect, useMemo, useState } from 'react'
import Icon from '@/components/Icon'

function getProductImages(product) {
  let images = []
  try {
    if (Array.isArray(product.images)) images = product.images
    else if (product.images) images = JSON.parse(product.images)
  } catch {
    images = []
  }
  if (!Array.isArray(images)) images = []
  if (product.imageUrl && !images.includes(product.imageUrl)) images.unshift(product.imageUrl)
  return images.filter(Boolean)
}

export default function ProductDetailModal({ product, onClose, onAddToCart, company }) {
  const [adding, setAdding] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState(0)
  const images = useMemo(() => getProductImages(product), [product])
  const stock = Number(product.stock) || 0
  const isOut = stock <= 0
  const isLow = stock > 0 && stock <= 5
  const phone = company?.phone?.replace(/[^0-9]/g, '')
  const waMsg = encodeURIComponent(
    `Hola, estoy interesado en ${product.name} de la tienda ${company?.name || ''}. ¿Está disponible?`
  )

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    const onKeyDown = event => {
      if (event.key === 'Escape') onClose()
      if (images.length > 1 && event.key === 'ArrowLeft') setActiveImage(index => (index - 1 + images.length) % images.length)
      if (images.length > 1 && event.key === 'ArrowRight') setActiveImage(index => (index + 1) % images.length)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [images.length, onClose])

  const handleAdd = () => {
    if (isOut) return
    for (let index = 0; index < quantity; index += 1) onAddToCart(product)
    setAdding(true)
    window.setTimeout(onClose, 700)
  }

  const showPrevious = event => {
    event.stopPropagation()
    setActiveImage(index => (index - 1 + images.length) % images.length)
  }

  const showNext = event => {
    event.stopPropagation()
    setActiveImage(index => (index + 1) % images.length)
  }

  return (
    <div className="store-modal-layer" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <article className="store-product-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title">
        <div className="store-product-modal__gallery">
          <button type="button" className="store-icon-button store-product-modal__close" onClick={onClose} aria-label="Cerrar detalle">
            <Icon name="close" size={19} />
          </button>
          {images.length > 0 ? (
            <img src={images[activeImage]} alt={product.name} />
          ) : (
            <span className="store-product-modal__placeholder"><Icon name="package" size={48} /></span>
          )}
          {isLow && <span className="store-product__badge">Quedan {stock} unidades</span>}
          {images.length > 1 && (
            <>
              <button type="button" className="store-gallery-control is-previous" onClick={showPrevious} aria-label="Imagen anterior"><Icon name="arrowLeft" size={17} /></button>
              <button type="button" className="store-gallery-control is-next" onClick={showNext} aria-label="Imagen siguiente"><Icon name="arrowRight" size={17} /></button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="store-product-modal__thumbs" aria-label="Galería del producto">
            {images.map((source, index) => (
              <button type="button" key={source} className={index === activeImage ? 'is-active' : ''} onClick={() => setActiveImage(index)} aria-label={`Ver imagen ${index + 1}`}>
                <img src={source} alt="" />
              </button>
            ))}
          </div>
        )}

        <div className="store-product-modal__content">
          <div className="store-product-modal__heading">
            <div>
              {product.category?.name && <span className="store-section-label">{product.category.name}</span>}
              <h2 id="product-modal-title">{product.name}</h2>
            </div>
            <strong>S/ {Number(product.price || 0).toFixed(2)}</strong>
          </div>

          <div className="store-product__availability">
            <span className={isOut ? 'is-out' : isLow ? 'is-low' : ''} />
            {isOut ? 'Sin stock disponible' : isLow ? `Solo ${stock} unidades disponibles` : `${stock} unidades disponibles`}
          </div>

          {product.description && <p className="store-product-modal__description">{product.description}</p>}

          {!isOut && (
            <div className="store-product-modal__purchase">
              <div>
                <span>Cantidad</span>
                <div className="store-quantity">
                  <button type="button" onClick={() => setQuantity(value => Math.max(1, value - 1))} disabled={quantity <= 1} aria-label="Reducir cantidad">−</button>
                  <strong>{quantity}</strong>
                  <button type="button" onClick={() => setQuantity(value => Math.min(stock, value + 1))} disabled={quantity >= stock} aria-label="Aumentar cantidad">+</button>
                </div>
              </div>
              <span>Total <strong>S/ {(Number(product.price || 0) * quantity).toFixed(2)}</strong></span>
            </div>
          )}

          <div className="store-product-modal__actions">
            <button type="button" className="store-button store-button--primary" onClick={handleAdd} disabled={isOut || adding}>
              <Icon name={adding ? 'check' : 'plus'} size={17} />
              {isOut ? 'Sin disponibilidad' : adding ? 'Agregado al carrito' : `Agregar${quantity > 1 ? ` ${quantity} unidades` : ' al carrito'}`}
            </button>
            {phone && company?.plan !== 'FREE' && (
              <a className="store-button store-button--secondary" href={`https://wa.me/${phone}?text=${waMsg}`} target="_blank" rel="noreferrer">
                <Icon name="message" size={17} />
                Consultar
              </a>
            )}
          </div>
        </div>
      </article>
    </div>
  )
}
