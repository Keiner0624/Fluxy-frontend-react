// Tarjeta de producto: foto, favorito, precio y agregar al carrito sin salir del catálogo.
import Icon from '@/components/Icon'
import { money, productImages, stockOf } from '../lib/storeFormat'

export function QuantityStepper({ value, max, onChange, size = 'md', label }) {
  return (
    <div className={`sf-stepper sf-stepper--${size}`} role="group" aria-label={label || 'Cantidad'}>
      <button type="button" onClick={() => onChange(value - 1)} aria-label="Quitar uno">
        <Icon name={value <= 1 && size !== 'lg' ? 'trash' : 'minus'} size={size === 'sm' ? 14 : 16} />
      </button>
      <output aria-live="polite">{value}</output>
      <button type="button" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Agregar uno">
        <Icon name="plus" size={size === 'sm' ? 14 : 16} />
      </button>
    </div>
  )
}

export function ProductPlaceholder({ product, size = 40 }) {
  const emoji = product?.category?.emoji
  return (
    <span className="sf-placeholder" aria-hidden="true">
      {emoji ? <span style={{ fontSize: size }}>{emoji}</span> : <Icon name="package" size={size} strokeWidth={1.3} />}
    </span>
  )
}

export default function ProductCard({ product, quantity, favorite, ordersPaused, onOpen, onAdd, onSetQuantity, onToggleFavorite }) {
  const stock = stockOf(product)
  const isOut = stock <= 0
  const isLow = !isOut && stock <= 5
  const image = productImages(product)[0]

  return (
    <article className={`sf-card${isOut ? ' is-out' : ''}`}>
      <div className="sf-card__media">
        <button type="button" className="sf-card__open" onClick={() => onOpen(product)} aria-label={`Ver ${product.name}`}>
          {image ? <img src={image} alt="" loading="lazy" /> : <ProductPlaceholder product={product} />}
        </button>
        <button type="button" className={`sf-fav${favorite ? ' is-on' : ''}`} onClick={() => onToggleFavorite(product.id)}
          aria-pressed={favorite} aria-label={favorite ? `Quitar ${product.name} de favoritos` : `Guardar ${product.name} en favoritos`}>
          <Icon name="heart" size={17} strokeWidth={2} />
        </button>
        {isOut && <span className="sf-badge sf-badge--muted">Agotado</span>}
        {isLow && <span className="sf-badge">Últimas {stock}</span>}
      </div>

      <div className="sf-card__body">
        <button type="button" className="sf-card__title" onClick={() => onOpen(product)}>{product.name}</button>
        <p className="sf-card__desc">{product.description || product.category?.name || ' '}</p>
        <div className="sf-card__price">{money(product.price)}</div>

        {quantity > 0 ? (
          <QuantityStepper value={quantity} max={stock} onChange={(next) => onSetQuantity(product, next)} label={`Cantidad de ${product.name}`} />
        ) : (
          <button type="button" className="sf-btn sf-btn--primary sf-btn--block sf-card__add" onClick={() => onAdd(product)}
            disabled={isOut || ordersPaused}>
            <Icon name="cart" size={16} />
            {isOut ? 'Sin stock' : ordersPaused ? 'No disponible' : 'Agregar'}
          </button>
        )}
      </div>
    </article>
  )
}
