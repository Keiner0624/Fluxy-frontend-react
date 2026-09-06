import Icon from '@/components/Icon'
import { useTranslation } from '@/hooks/useTranslation'

const PAYMENT_NAMES = {
  efectivo: 'Efectivo',
  yape: 'Yape',
  plin: 'Plin',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia',
}

function getPaymentMethods(company) {
  try {
    const raw = company?.paymentMethods
    if (!raw) return ['efectivo', 'yape', 'plin']
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    return Array.isArray(parsed) ? parsed.filter(key => PAYMENT_NAMES[key]) : []
  } catch {
    return ['efectivo', 'yape', 'plin']
  }
}

export default function Hero({ company, loading, cartOpen, featuredProduct }) {
  const t = useTranslation()
  const phone = company?.phone?.replace(/[^0-9]/g, '')
  const waMsg = encodeURIComponent(
    `Hola, vi la tienda ${company?.name || ''} y quisiera recibir ayuda con un pedido.`
  )
  const acceptedPayments = getPaymentMethods(company)

  return (
    <section className="store-hero" id="top">
      <div className="store-container store-hero__grid">
        <div className="store-hero__content">
          <div className="store-eyebrow">
            <span className="store-eyebrow__dot" />
            {t.storeOfficial}
          </div>

          <h1 className="store-hero__title">
            {loading ? 'Preparando la tienda' : (company?.name || 'Una tienda para descubrir')}
          </h1>
          <p className="store-hero__description">
            {company?.description || 'Productos seleccionados y atención directa para que compres con tranquilidad.'}
          </p>

          <div className="store-hero__actions">
            <a className="store-button store-button--primary" href="#products">
              Explorar catálogo
              <Icon name="arrowRight" size={17} />
            </a>
            {phone && company?.plan !== 'FREE' && (
              <a
                className="store-button store-button--secondary"
                href={`https://wa.me/${phone}?text=${waMsg}`}
                target="_blank"
                rel="noreferrer"
              >
                <Icon name="message" size={17} />
                Hablar con el vendedor
              </a>
            )}
          </div>

          <div className="store-hero__assurances" aria-label="Beneficios de la tienda">
            <span><Icon name="checkCircle" size={17} /> Negocio verificado</span>
            <span><Icon name="message" size={17} /> Atención directa</span>
            <span><Icon name="shield" size={17} /> Compra protegida</span>
          </div>
        </div>

        <div className="store-showcase">
          {featuredProduct?.imageUrl ? (
            <div className="store-showcase__image-wrap">
              <img src={featuredProduct.imageUrl} alt={featuredProduct.name} className="store-showcase__image" />
              <div className="store-showcase__caption">
                <span>Selección destacada</span>
                <strong>{featuredProduct.name}</strong>
                <small>S/ {Number(featuredProduct.price || 0).toFixed(2)}</small>
              </div>
            </div>
          ) : (
            <div className="store-showcase__identity">
              {company?.logoUrl ? (
                <img src={company.logoUrl} alt="" />
              ) : (
                <span>{company?.name?.[0]?.toUpperCase() || 'T'}</span>
              )}
              <div>
                <small>Compra directamente en</small>
                <strong>{company?.name || 'la tienda'}</strong>
              </div>
            </div>
          )}

          <div className="store-showcase__details">
            <div className="store-showcase__detail">
              <Icon name={company?.address ? 'mapPin' : 'clock'} size={18} />
              <span>
                <small>{company?.address ? 'Ubicación' : 'Atención'}</small>
                <strong>{company?.address || 'Respuesta directa del vendedor'}</strong>
              </span>
            </div>
            {acceptedPayments.length > 0 && (
              <div className="store-showcase__payments">
                <span>Métodos de pago</span>
                <div>
                  {acceptedPayments.map(key => <small key={key}>{PAYMENT_NAMES[key]}</small>)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {phone && company?.plan !== 'FREE' && !cartOpen && (
        <a
          className="store-whatsapp"
          href={`https://wa.me/${phone}?text=${waMsg}`}
          target="_blank"
          rel="noreferrer"
          aria-label="Hablar con el vendedor por WhatsApp"
        >
          <Icon name="message" size={19} />
          <span>¿Necesitas ayuda?</span>
        </a>
      )}
    </section>
  )
}
