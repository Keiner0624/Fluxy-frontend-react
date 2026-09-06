import { useEffect, useState } from 'react'
import Icon from '@/components/Icon'

export default function ProductCard({ product, onAddToCart, onViewDetail, index, company }) {
  const [adding, setAdding] = useState(false)
  const stock = Number(product.stock) || 0
  const isOut = stock <= 0
  const isLowStock = stock > 0 && stock <= 5
  const phone = company?.phone?.replace(/[^0-9]/g, '')
  const waMsg = encodeURIComponent(
    `Hola, estoy interesado en ${product.name} de la tienda ${company?.name || ''}. ¿Está disponible?`
  )

  useEffect(() => {
    if (!adding) return undefined
    const timeout = window.setTimeout(() => setAdding(false), 900)
    return () => window.clearTimeout(timeout)
  }, [adding])

  const handleAdd = () => {
    if (isOut) return
    onAddToCart(product)
    setAdding(true)
  }

  return (
    <article className={`store-product${isOut ? ' is-out' : ''}`} style={{ '--product-order': index }}>
      <button type="button" className="store-product__media" onClick={() => onViewDetail(product)} aria-label={`Ver detalles de ${product.name}`}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} loading="lazy" />
        ) : (
          <span className="store-product__placeholder"><Icon name="package" size={36} /></span>
        )}
        {isLowStock && <span className="store-product__badge">Últimas {stock} unidades</span>}
        {isOut && <span className="store-product__badge store-product__badge--out">Agotado</span>}
        <span className="store-product__view">Ver producto <Icon name="arrowRight" size={15} /></span>
      </button>

      <div className="store-product__content">
        <div className="store-product__title-row">
          <div>
            {product.category?.name && <small>{product.category.name}</small>}
            <h3>{product.name}</h3>
          </div>
          <strong>S/ {Number(product.price || 0).toFixed(2)}</strong>
        </div>

        {product.description && <p>{product.description}</p>}

        <div className="store-product__availability">
          <span className={isOut ? 'is-out' : isLowStock ? 'is-low' : ''} />
          {isOut ? 'Sin disponibilidad' : isLowStock ? `Quedan ${stock} unidades` : `${stock} unidades disponibles`}
        </div>

        <div className="store-product__actions">
          <button type="button" className="store-product__add" onClick={handleAdd} disabled={isOut || adding}>
            <Icon name={adding ? 'check' : 'plus'} size={17} />
            {isOut ? 'No disponible' : adding ? 'Agregado' : 'Agregar al carrito'}
          </button>
          {phone && company?.plan !== 'FREE' && (
            <a
              href={`https://wa.me/${phone}?text=${waMsg}`}
              target="_blank"
              rel="noreferrer"
              className="store-product__consult"
              aria-label={`Consultar por ${product.name}`}
            >
              <Icon name="message" size={17} />
            </a>
          )}
        </div>
      </div>
    </article>
  )
}
