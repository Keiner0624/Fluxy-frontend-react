import Icon from '@/components/Icon'
import { useTranslation } from '@/hooks/useTranslation'

export default function Footer({ company }) {
  const t = useTranslation()
  const showBranding = company?.plan !== 'BUSINESS'

  return (
    <footer className="store-footer" id="store-contact">
      <div className="store-container">
        <div className="store-footer__main">
          <div className="store-footer__identity">
            <div className="store-brand">
              {company?.logoUrl ? (
                <img className="store-brand__logo" src={company.logoUrl} alt="" />
              ) : (
                <span className="store-brand__mark">{company?.name?.[0]?.toUpperCase() || 'F'}</span>
              )}
              <span className="store-brand__copy">
                <strong>{company?.name || 'Tienda'}</strong>
                {showBranding && <small>{t.viaFluxy}</small>}
              </span>
            </div>
            <p>{company?.description || 'Productos seleccionados y atención directa.'}</p>
          </div>

          <div className="store-footer__contact">
            <span className="store-section-label">Contacto</span>
            {company?.address && <p><Icon name="mapPin" size={17} /> <span>{company.address}</span></p>}
            {company?.phone && <p><Icon name="phone" size={17} /> <a href={`tel:${company.phone}`}>{company.phone}</a></p>}
            {!company?.address && !company?.phone && <p>Consulta la disponibilidad desde cada producto.</p>}
          </div>

          <div className="store-footer__links">
            <span className="store-section-label">Tienda</span>
            <a href="#top">Inicio</a>
            <a href="#products">Catálogo</a>
            <a href="#store-confidence">Garantías</a>
          </div>
        </div>

        <div className="store-footer__bottom">
          <span>© {new Date().getFullYear()} {company?.name || 'Tienda'}. {t.allRightsReserved}</span>
          {showBranding && <span>{t.poweredBy} <strong>Fluxy</strong></span>}
        </div>
      </div>
    </footer>
  )
}
