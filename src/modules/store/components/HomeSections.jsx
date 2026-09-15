// Secciones de la portada de la tienda.
import Icon from '@/components/Icon'
import ProductCard, { ProductPlaceholder } from './ProductCard'
import { BrandMark } from './StoreHeader'
import { PAYMENT_LABELS, money, paymentMethods, productImages, stockOf } from '../lib/storeFormat'

export function Hero({ company, banner, heroProduct, productCount, categoryCount, whatsapp, onShop, onOpenProduct, onAdd, ordersPaused }) {
  const heroImage = banner || productImages(heroProduct)[0]
  return (
    <section className="sf-hero" aria-labelledby="sf-hero-title">
      <div className="sf-hero__copy">
        <span className="sf-chip"><span className="sf-chip__dot" /> Tienda oficial{company?.address ? ` · ${company.address.split(',').slice(-1)[0].trim()}` : ''}</span>
        <h1 id="sf-hero-title">{company?.name}</h1>
        <p>{company?.description || 'Elegí tus productos, armá tu pedido en un minuto y coordiná la entrega directamente con nosotros.'}</p>
        <div className="sf-hero__actions">
          <button type="button" className="sf-btn sf-btn--primary sf-btn--lg" onClick={onShop}>
            Ver productos <Icon name="arrowRight" size={18} />
          </button>
          {whatsapp && (
            <a className="sf-btn sf-btn--ghost sf-btn--lg" href={whatsapp} target="_blank" rel="noreferrer">
              <Icon name="whatsapp" size={18} /> Escribinos
            </a>
          )}
        </div>
        <dl className="sf-hero__stats">
          <div><dt>Productos</dt><dd>{productCount}</dd></div>
          {categoryCount > 0 && <div><dt>Categorías</dt><dd>{categoryCount}</dd></div>}
          <div><dt>Tu pedido</dt><dd>en 1 minuto</dd></div>
        </dl>
      </div>

      <div className="sf-hero__visual">
        {heroImage ? (
          <img className="sf-hero__image" src={heroImage} alt="" />
        ) : (
          <div className="sf-hero__identity"><BrandMark company={company} size={120} /></div>
        )}
        {heroProduct && (
          <div className="sf-hero__tag">
            <button type="button" className="sf-hero__tag-info" onClick={() => onOpenProduct(heroProduct)}>
              <small>Destacado</small>
              <strong>{heroProduct.name}</strong>
              <span>{money(heroProduct.price)}</span>
            </button>
            <button type="button" className="sf-btn sf-btn--primary sf-btn--icon" onClick={() => onAdd(heroProduct)}
              disabled={ordersPaused || stockOf(heroProduct) <= 0} aria-label={`Agregar ${heroProduct.name} al carrito`}>
              <Icon name="plus" size={18} />
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export function TrustStrip({ company, whatsapp }) {
  const methods = paymentMethods(company).map((key) => PAYMENT_LABELS[key] || key)
  const items = [
    { icon: 'truck', title: 'Entrega coordinada', text: company?.address ? 'Delivery o recojo, como prefieras' : 'Te contactamos para coordinar' },
    { icon: 'shield', title: 'Compra protegida', text: 'Tus datos solo se usan para tu pedido' },
    whatsapp
      ? { icon: 'whatsapp', title: 'Atención directa', text: 'Escribinos por WhatsApp' }
      : { icon: 'message', title: 'Atención directa', text: 'Te respondemos personalmente' },
    { icon: 'card', title: 'Pagá como prefieras', text: methods.length ? methods.slice(0, 3).join(', ') : 'Coordinás el pago al confirmar' },
  ]
  return (
    <section className="sf-trust" aria-label="Por qué comprar acá">
      {items.map((item) => (
        <div key={item.title} className="sf-trust__item">
          <span className="sf-trust__icon"><Icon name={item.icon} size={22} /></span>
          <div>
            <strong>{item.title}</strong>
            <small>{item.text}</small>
          </div>
        </div>
      ))}
    </section>
  )
}

export function CategoryTiles({ categories, products, onPick }) {
  const counts = new Map()
  products.forEach((p) => { if (p.category?.id) counts.set(p.category.id, (counts.get(p.category.id) || 0) + 1) })
  const visible = categories.filter((c) => counts.get(c.id))
  if (visible.length === 0) return null
  return (
    <section className="sf-section" aria-labelledby="sf-cats-title">
      <div className="sf-section__head">
        <h2 id="sf-cats-title">Explorá por categoría</h2>
      </div>
      <div className="sf-tiles">
        {visible.map((category) => {
          const cover = products.find((p) => p.category?.id === category.id && p.imageUrl)?.imageUrl
          return (
            <button key={category.id} type="button" className="sf-tile" onClick={() => onPick(category.id)}>
              <span className="sf-tile__icon">
                {cover ? <img src={cover} alt="" loading="lazy" /> : category.emoji ? <span>{category.emoji}</span> : <Icon name="tag" size={22} />}
              </span>
              <strong>{category.name}</strong>
              <small>{counts.get(category.id)} {counts.get(category.id) === 1 ? 'producto' : 'productos'}</small>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export function ProductSection({ id, title, subtitle, products, action, cardProps }) {
  if (!products.length) return null
  return (
    <section className="sf-section" aria-labelledby={id}>
      <div className="sf-section__head">
        <div>
          <h2 id={id}>{title}</h2>
          {subtitle && <p>{subtitle}</p>}
        </div>
        {action && (
          <button type="button" className="sf-link" onClick={action.onClick}>
            {action.label} <Icon name="arrowRight" size={16} />
          </button>
        )}
      </div>
      <div className="sf-grid">
        {products.map((product) => <ProductCard key={product.id} product={product} {...cardProps(product)} />)}
      </div>
    </section>
  )
}

/**
 * Banner con la categoría más completa: el negocio no carga promociones, así
 * que se destaca lo que tiene más variedad y su precio de entrada.
 */
export function PromoBanner({ categories, products, onPick }) {
  const groups = categories
    .map((category) => ({ category, items: products.filter((p) => p.category?.id === category.id && stockOf(p) > 0) }))
    .filter((group) => group.items.length >= 2)
    .sort((a, b) => b.items.length - a.items.length)
  const group = groups[0] || (products.length >= 2 ? { category: null, items: products.filter((p) => stockOf(p) > 0) } : null)
  if (!group || group.items.length < 2) return null

  const from = Math.min(...group.items.map((p) => Number(p.price) || 0))
  const images = group.items.map((p) => productImages(p)[0]).filter(Boolean).slice(0, 3)
  const name = group.category?.name || 'todo el catálogo'

  return (
    <section className="sf-promo" aria-labelledby="sf-promo-title">
      <div className="sf-promo__copy">
        <span className="sf-chip sf-chip--light"><Icon name="sparkles" size={14} /> Selección de la casa</span>
        <h2 id="sf-promo-title">{group.category ? group.category.name : 'Todo el catálogo'}</h2>
        <p>{group.items.length} opciones disponibles para elegir hoy{group.category?.description ? `. ${group.category.description}` : '.'}</p>
        <button type="button" className="sf-btn sf-btn--primary" onClick={() => onPick(group.category?.id ?? null)}>
          Ver {name.toLocaleLowerCase('es')} <Icon name="arrowRight" size={17} />
        </button>
      </div>
      <div className="sf-promo__visual" aria-hidden="true">
        {images.length > 0
          ? images.map((src, i) => <img key={src} src={src} alt="" className={`sf-promo__img sf-promo__img--${i}`} loading="lazy" />)
          : <div className="sf-promo__img sf-promo__img--0"><ProductPlaceholder product={group.items[0]} size={64} /></div>}
        <span className="sf-promo__badge"><small>Desde</small>{money(from)}</span>
      </div>
    </section>
  )
}

export function AboutSection({ company, whatsapp }) {
  const methods = paymentMethods(company).map((key) => PAYMENT_LABELS[key] || key)
  const reasons = [
    { icon: 'star', title: 'Productos seleccionados', text: 'Lo que ves es lo que tenemos: stock actualizado al momento.' },
    { icon: whatsapp ? 'whatsapp' : 'message', title: 'Atención personalizada', text: 'Hablás directamente con el negocio, sin intermediarios.' },
    { icon: 'card', title: 'Pagos flexibles', text: methods.length ? `Aceptamos ${methods.join(', ')}.` : 'Coordinás la forma de pago al confirmar.' },
    { icon: 'heart', title: 'Compra sin vueltas', text: 'Sin crear cuentas: elegís, confirmás y listo.' },
  ]
  return (
    <section className="sf-about" id="nosotros" aria-labelledby="sf-about-title">
      <div className="sf-about__intro">
        <span className="sf-eyebrow">Nosotros</span>
        <h2 id="sf-about-title">¿Por qué elegir {company?.name}?</h2>
        <p>{company?.description || 'Somos un negocio local que atiende cada pedido de forma personal. Elegí tus productos y nosotros nos encargamos del resto.'}</p>
      </div>
      <div className="sf-about__grid">
        {reasons.map((reason) => (
          <div key={reason.title} className="sf-about__item">
            <span className="sf-trust__icon"><Icon name={reason.icon} size={20} /></span>
            <strong>{reason.title}</strong>
            <p>{reason.text}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
