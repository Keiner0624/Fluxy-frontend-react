import { useState } from 'react'
import { Link } from 'react-router-dom'
import './LandingPage.css'

const features = [
  {
    icon: 'bag',
    title: 'Pedidos bajo control',
    description: 'Recibe, organiza y actualiza cada pedido desde un panel simple y centralizado.',
  },
  {
    icon: 'tag',
    title: 'Catálogo que vende',
    description: 'Publica productos, precios, stock y promociones sin depender de terceros.',
  },
  {
    icon: 'users',
    title: 'Clientes más cerca',
    description: 'Conoce quién te compra y mantén una comunicación clara en cada entrega.',
  },
  {
    icon: 'chart',
    title: 'Decisiones con datos',
    description: 'Mide ventas y productos destacados con reportes fáciles de entender.',
  },
]

const plans = [
  {
    name: 'Free',
    price: 'S/ 0',
    description: 'Para comenzar a vender online.',
    features: ['Hasta 10 productos', 'Tienda pública', 'Pedidos y métricas básicas'],
    cta: 'Comenzar gratis',
  },
  {
    name: 'Pro',
    price: 'S/ 39',
    description: 'Para negocios que quieren crecer.',
    features: ['Hasta 100 productos', 'WhatsApp y notificaciones', 'Métricas y personalización avanzada'],
    cta: 'Elegir Pro',
    featured: true,
  },
  {
    name: 'Business',
    price: 'S/ 59',
    description: 'Para marcas que necesitan más control.',
    features: ['Productos ilimitados', 'Dominio personalizado', 'Sin branding y soporte prioritario'],
    cta: 'Elegir Business',
  },
]

function Icon({ name, size = 22 }) {
  const paths = {
    bag: (
      <>
        <path d="M6 8h12l1 12H5L6 8Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
      </>
    ),
    tag: (
      <>
        <path d="M20 13 13 20l-9-9V4h7l9 9Z" />
        <path d="M8.5 8.5h.01" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    chart: (
      <>
        <path d="M4 19V9M10 19V5M16 19v-7M22 19V3" />
        <path d="m3 13 7-6 6 3 6-7" />
      </>
    ),
    orders: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" />
      </>
    ),
    store: (
      <>
        <path d="M3 10h18l-2-6H5l-2 6Z" />
        <path d="M5 10v10h14V10M9 20v-6h6v6" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    play: <path d="m9 7 8 5-8 5V7Z" />,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    spark: (
      <>
        <path d="m12 3 1.4 4.1L17.5 8.5l-4.1 1.4L12 14l-1.4-4.1-4.1-1.4 4.1-1.4L12 3Z" />
        <path d="m18.5 14 .8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" />
      </>
    ),
  }

  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  )
}

function BrandMark({ compact = false }) {
  return (
    <span className="landing-brand">
      <span className="landing-brand__icon"><Icon name="bag" size={compact ? 19 : 22} /></span>
      <span>Fluxy</span>
    </span>
  )
}

function Navbar() {
  const [open, setOpen] = useState(false)
  const links = [
    ['Características', '#features'],
    ['Cómo funciona', '#how'],
    ['Beneficios', '#benefits'],
    ['Precios', '#pricing'],
  ]

  return (
    <header className="landing-nav">
      <div className="landing-shell landing-nav__inner">
        <Link to="/" aria-label="Fluxy, página principal"><BrandMark /></Link>

        <nav className="landing-nav__links" aria-label="Navegación principal">
          {links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}
        </nav>

        <div className="landing-nav__actions">
          <Link className="landing-login" to="/login">Iniciar sesión</Link>
          <Link className="landing-button landing-button--small" to="/register-business">
            Comenzar gratis
          </Link>
        </div>

        <button
          className="landing-menu"
          type="button"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
          onClick={() => setOpen(value => !value)}
        >
          <Icon name={open ? 'close' : 'menu'} />
        </button>
      </div>

      {open && (
        <div className="landing-mobile-nav">
          {links.map(([label, href]) => (
            <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>
          ))}
          <Link to="/login" onClick={() => setOpen(false)}>Iniciar sesión</Link>
          <Link className="landing-button" to="/register-business" onClick={() => setOpen(false)}>
            Comenzar gratis
          </Link>
        </div>
      )}
    </header>
  )
}

function MetricCard({ label, value, change }) {
  return (
    <article className="dashboard-metric">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{change} <span>↗</span></small>
    </article>
  )
}

function DashboardPreview() {
  const orders = [
    ['#FLX-1048', 'Andrea López', 'S/ 120', 'Entregado'],
    ['#FLX-1047', 'Carlos Ramírez', 'S/ 85', 'En camino'],
    ['#FLX-1046', 'María García', 'S/ 150', 'Pendiente'],
    ['#FLX-1045', 'Juan Pérez', 'S/ 60', 'Entregado'],
  ]

  return (
    <div className="dashboard-preview" aria-label="Vista previa del panel de Fluxy">
      <aside className="dashboard-sidebar">
        <BrandMark compact />
        <div className="dashboard-sidebar__items">
          {[
            ['chart', 'Resumen'],
            ['orders', 'Pedidos'],
            ['tag', 'Productos'],
            ['users', 'Clientes'],
            ['store', 'Mi tienda'],
          ].map(([icon, label], index) => (
            <span className={index === 0 ? 'is-active' : ''} key={label}>
              <Icon name={icon} size={15} /> {label}
            </span>
          ))}
        </div>
        <div className="dashboard-sidebar__store">
          <span>FS</span>
          <div><strong>Fluxy Store</strong><small>Plan Pro</small></div>
        </div>
      </aside>

      <div className="dashboard-content">
        <div className="dashboard-topbar">
          <div><strong>Resumen</strong><small>Miércoles, 1 de septiembre</small></div>
          <span className="dashboard-avatar">KM</span>
        </div>

        <div className="dashboard-metrics">
          <MetricCard label="Ventas totales" value="S/ 24,580" change="+12.5%" />
          <MetricCard label="Pedidos" value="352" change="+8.3%" />
          <MetricCard label="Clientes" value="1,248" change="+15.2%" />
        </div>

        <div className="dashboard-panels">
          <article className="dashboard-chart">
            <div className="dashboard-panel-heading">
              <div><strong>Ventas</strong><small>Últimos 30 días</small></div>
              <span>S/ 8,240</span>
            </div>
            <div className="dashboard-chart__body">
              <span>S/ 4k</span><span>S/ 3k</span><span>S/ 2k</span><span>S/ 1k</span>
              <svg viewBox="0 0 430 180" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="chartArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#1769e0" stopOpacity=".2" />
                    <stop offset="1" stopColor="#1769e0" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path className="chart-area" d="M0 157 C24 153 33 128 60 132 S87 103 114 112 146 82 173 92 202 36 232 58 260 120 285 81 309 111 333 66 358 91 382 40 430 27 L430 180 L0 180 Z" />
                <path className="chart-line" d="M0 157 C24 153 33 128 60 132 S87 103 114 112 146 82 173 92 202 36 232 58 260 120 285 81 309 111 333 66 358 91 382 40 430 27" />
              </svg>
              <div className="dashboard-chart__dates"><span>01</span><span>05</span><span>10</span><span>15</span><span>20</span><span>25</span><span>30</span></div>
            </div>
          </article>

          <article className="dashboard-orders">
            <div className="dashboard-panel-heading">
              <div><strong>Pedidos recientes</strong><small>Actualizados ahora</small></div>
              <button type="button">Ver todos</button>
            </div>
            <div>
              {orders.map(([id, customer, total, status]) => (
                <div className="dashboard-order" key={id}>
                  <div><strong>{id}</strong><small>{customer}</small></div>
                  <span>{total}</span>
                  <em className={`status-${status.toLowerCase().replace(' ', '-')}`}>{status}</em>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <main>
      <section className="landing-hero">
        <div className="landing-shell landing-hero__grid">
          <div className="landing-hero__copy">
            <div className="landing-eyebrow"><span><Icon name="spark" size={15} /></span> Sistema de ventas para tu negocio</div>
            <h1>Gestiona tu tienda.<br /><span>Vende más. Fácil.</span></h1>
            <p>
              Centraliza tus productos, pedidos y clientes en un solo lugar.
              Fluxy te ayuda a vender online sin procesos complicados.
            </p>
            <div className="landing-hero__actions">
              <Link className="landing-button landing-button--hero" to="/register-business">
                Comenzar gratis <Icon name="arrow" size={18} />
              </Link>
              <a className="landing-button landing-button--ghost" href="#how">
                <span className="landing-play"><Icon name="play" size={15} /></span>
                Ver cómo funciona
              </a>
            </div>
            <div className="landing-assurances">
              {['Sin tarjeta de crédito', 'Configura en minutos', 'Soporte incluido'].map(item => (
                <span key={item}><Icon name="check" size={16} /> {item}</span>
              ))}
            </div>
          </div>
          <div className="landing-hero__visual">
            <div className="landing-hero__glow" />
            <DashboardPreview />
            <div className="floating-card floating-card--order">
              <span><Icon name="orders" size={18} /></span>
              <div><small>Nuevo pedido</small><strong>#FLX-1049 · S/ 180</strong></div>
            </div>
            <div className="floating-card floating-card--growth">
              <span>↗</span>
              <div><small>Ventas este mes</small><strong>+12.5%</strong></div>
            </div>
          </div>
        </div>
      </section>

      <AudienceStrip />
      <Features />
      <Benefits />
      <HowItWorks />
      <Pricing />
      <FinalCta />
    </main>
  )
}

function AudienceStrip() {
  const audiences = [
    ['bag', 'Moda y accesorios'],
    ['spark', 'Belleza'],
    ['tag', 'Tecnología'],
    ['store', 'Hogar y diseño'],
    ['users', 'Servicios'],
  ]
  return (
    <section className="landing-audience" aria-label="Tipos de negocio">
      <div className="landing-shell">
        <p>Una plataforma flexible para negocios que venden todos los días</p>
        <div>
          {audiences.map(([icon, label]) => (
            <span key={label}><Icon name={icon} size={20} /> {label}</span>
          ))}
        </div>
      </div>
    </section>
  )
}

function SectionHeading({ eyebrow, title, description, align = 'center' }) {
  return (
    <header className={`landing-section-heading landing-section-heading--${align}`}>
      <span>{eyebrow}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </header>
  )
}

function Features() {
  return (
    <section className="landing-section" id="features">
      <div className="landing-shell">
        <SectionHeading
          eyebrow="Todo en un solo lugar"
          title="Lo que necesitas para gestionar tu tienda"
          description="Herramientas claras para trabajar mejor hoy y crecer mañana."
        />
        <div className="landing-features">
          {features.map((feature, index) => (
            <article key={feature.title}>
              <span className={`feature-icon feature-icon--${index + 1}`}><Icon name={feature.icon} /></span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <a href="#benefits">Conocer más <Icon name="arrow" size={15} /></a>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function OrderFlowCard() {
  return (
    <div className="benefit-order-card">
      <div className="benefit-order-card__top">
        <div><small>Pedidos de hoy</small><strong>24 pedidos</strong></div>
        <span>En vivo</span>
      </div>
      {[
        ['María García', '2 productos', 'S/ 150', 'Nuevo'],
        ['Diego Torres', '1 producto', 'S/ 85', 'Preparando'],
        ['Laura Ríos', '3 productos', 'S/ 240', 'Listo'],
      ].map(([name, items, price, status], index) => (
        <div className="benefit-order-row" key={name}>
          <span>{name.split(' ').map(part => part[0]).join('')}</span>
          <div><strong>{name}</strong><small>{items}</small></div>
          <strong>{price}</strong>
          <em className={`flow-status flow-status--${index + 1}`}>{status}</em>
        </div>
      ))}
      <div className="benefit-order-card__summary">
        <span><small>Ingresos de hoy</small><strong>S/ 2,840</strong></span>
        <span><small>Ticket promedio</small><strong>S/ 118</strong></span>
      </div>
    </div>
  )
}

function StorePhone() {
  return (
    <div className="store-phone">
      <div className="store-phone__speaker" />
      <div className="store-phone__header">
        <span>NUA</span><div><i /><i /><i /></div>
      </div>
      <div className="store-phone__hero">
        <small>Nueva colección</small><strong>Esenciales para<br />todos los días.</strong><button type="button">Comprar ahora</button>
      </div>
      <div className="store-phone__products">
        <div><span>01</span><strong>Bolso Nómada</strong><small>S/ 129</small></div>
        <div><span>02</span><strong>Mini Aura</strong><small>S/ 89</small></div>
      </div>
    </div>
  )
}

function Benefits() {
  return (
    <section className="landing-benefits" id="benefits">
      <div className="landing-shell">
        <div className="benefit-row">
          <div className="benefit-visual benefit-visual--orders"><OrderFlowCard /></div>
          <div className="benefit-copy">
            <span className="benefit-number">01</span>
            <SectionHeading
              align="left"
              eyebrow="Operación ordenada"
              title="Cada pedido, justo donde debe estar"
              description="Deja de buscar ventas entre chats y hojas de cálculo. Mira el estado, el cliente y el total de cada pedido en segundos."
            />
            <ul>
              <li><Icon name="check" size={17} /> Estados claros y actualizados</li>
              <li><Icon name="check" size={17} /> Stock sincronizado con tus ventas</li>
              <li><Icon name="check" size={17} /> Avisos por WhatsApp y notificaciones</li>
            </ul>
          </div>
        </div>

        <div className="benefit-row benefit-row--reverse">
          <div className="benefit-copy">
            <span className="benefit-number">02</span>
            <SectionHeading
              align="left"
              eyebrow="Tu marca online"
              title="Una tienda lista para vender desde cualquier pantalla"
              description="Crea un catálogo rápido, profesional y adaptable a móvil. Personaliza colores, logo, métodos de pago y dominio."
            />
            <ul>
              <li><Icon name="check" size={17} /> Sin conocimientos técnicos</li>
              <li><Icon name="check" size={17} /> Diseño responsive y personalizable</li>
              <li><Icon name="check" size={17} /> Comparte tu tienda con un enlace</li>
            </ul>
          </div>
          <div className="benefit-visual benefit-visual--store">
            <div className="store-backdrop-card store-backdrop-card--one" />
            <div className="store-backdrop-card store-backdrop-card--two" />
            <StorePhone />
          </div>
        </div>
      </div>
    </section>
  )
}

function HowItWorks() {
  const steps = [
    ['01', 'Crea tu cuenta', 'Registra tu negocio y elige el nombre de tu tienda.'],
    ['02', 'Publica tus productos', 'Agrega fotos, precios, stock y métodos de pago.'],
    ['03', 'Comparte y vende', 'Envía tu enlace y administra todos los pedidos desde Fluxy.'],
  ]
  return (
    <section className="landing-section landing-how" id="how">
      <div className="landing-shell">
        <SectionHeading
          eyebrow="Simple desde el inicio"
          title="Tu tienda online en tres pasos"
          description="Empieza sin instalaciones, contratos ni configuraciones difíciles."
        />
        <div className="landing-steps">
          {steps.map(([number, title, text], index) => (
            <article key={number}>
              <div><span>{number}</span>{index < steps.length - 1 && <i />}</div>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Pricing() {
  return (
    <section className="landing-section landing-pricing" id="pricing">
      <div className="landing-shell">
        <SectionHeading
          eyebrow="Planes transparentes"
          title="Empieza gratis. Crece a tu ritmo."
          description="Sin costos ocultos. Cambia de plan cuando tu negocio lo necesite."
        />
        <div className="pricing-grid">
          {plans.map(plan => (
            <article className={plan.featured ? 'is-featured' : ''} key={plan.name}>
              {plan.featured && <span className="pricing-badge">Más popular</span>}
              <h3>{plan.name}</h3>
              <p>{plan.description}</p>
              <div className="pricing-price"><strong>{plan.price}</strong><span>/ mes</span></div>
              <ul>
                {plan.features.map(feature => <li key={feature}><Icon name="check" size={17} /> {feature}</li>)}
              </ul>
              <Link className={`landing-button ${plan.featured ? '' : 'landing-button--outline'}`} to="/register-business">
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
        <p className="pricing-note">Precios en soles peruanos. Puedes cancelar o cambiar de plan cuando quieras.</p>
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="landing-final-cta">
      <div className="landing-shell">
        <div>
          <span><Icon name="spark" size={18} /> Tu próxima venta puede empezar hoy</span>
          <h2>Haz que gestionar tu tienda se sienta fácil.</h2>
          <p>Crea tu cuenta, publica tus productos y comienza a recibir pedidos.</p>
          <div>
            <Link className="landing-button landing-button--light" to="/register-business">
              Crear mi tienda gratis <Icon name="arrow" size={18} />
            </Link>
            <Link className="landing-final-login" to="/login">Ya tengo una cuenta</Link>
          </div>
        </div>
        <div className="landing-final-graphic" aria-hidden="true">
          <span className="graphic-card graphic-card--one"><Icon name="orders" /> <i>12 pedidos nuevos</i></span>
          <span className="graphic-card graphic-card--two"><b>+28%</b><i>ventas este mes</i></span>
          <span className="graphic-card graphic-card--three"><Icon name="store" size={28} /></span>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="landing-footer">
      <div className="landing-shell">
        <div className="landing-footer__main">
          <div>
            <BrandMark />
            <p>La forma simple de crear, vender y gestionar tu tienda online.</p>
          </div>
          <div>
            <strong>Producto</strong>
            <a href="#features">Características</a>
            <a href="#pricing">Planes y precios</a>
            <a href="#how">Cómo funciona</a>
          </div>
          <div>
            <strong>Cuenta</strong>
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/register-business">Crear tienda gratis</Link>
          </div>
          <div>
            <strong>Legal</strong>
            <Link to="/terms">Términos y condiciones</Link>
            <Link to="/terms">Privacidad</Link>
          </div>
        </div>
        <div className="landing-footer__bottom">
          <span>© {new Date().getFullYear()} Fluxy. Todos los derechos reservados.</span>
          <span>Hecho para negocios que quieren crecer.</span>
        </div>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <div className="landing-page">
      <Navbar />
      <Hero />
      <Footer />
    </div>
  )
}
