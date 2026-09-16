import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { openCookiePreferences } from '@/app/consent'
import { CURRENT_PROVIDER, legalUrl } from '../legal/documents'
import { canReveal, initialPhase, markIntroPlayed, useReveal } from '../motion'
import waves1024 from '../assets/waves-1024.webp'
import waves1672 from '../assets/waves-1672.webp'
import glass1024 from '../assets/glass-1024.webp'
import glass1672 from '../assets/glass-1672.webp'
import earth1024 from '../assets/earth-1024.webp'
import earth1672 from '../assets/earth-1672.webp'
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
    chat: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" />,
    wallet: (
      <>
        <path d="M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z" />
        <path d="M4 7V6a2 2 0 0 1 2-2h10v3M16 13h4" />
      </>
    ),
    box: (
      <>
        <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
        <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
      </>
    ),
    shield: (
      <>
        <path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3Z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
    heart: <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" />,
    pin: (
      <>
        <path d="M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z" />
        <circle cx="12" cy="9" r="2.5" />
      </>
    ),
    plus: <path d="M12 5v14M5 12h14" />,
    book: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" />
        <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5M9 7h7M9 11h5" />
      </>
    ),
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
    ['Nosotros', '#about'],
    ['Para qué sirve', '#uses'],
    ['Características', '#features'],
    ['Precios', '#pricing'],
    ['Preguntas', '#faq'],
  ]

  useEffect(() => {
    if (!open) return undefined
    const onKey = (event) => { if (event.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      {open && <button className="landing-mobile-backdrop" type="button" aria-label="Cerrar menú" onClick={() => setOpen(false)} />}
      <header className="landing-nav" data-enter style={{ '--enter': 0 }}>
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
    </>
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
                {/* Cada tramo de S necesita grupos de 4 números (x2 y2 x y) */}
                <path className="chart-area" d="M0 157 C24 153 33 128 60 132 S87 103 114 112 146 82 173 92 202 36 232 58 260 120 285 81 309 111 333 66 358 91 382 40 410 30 430 27 L430 180 L0 180 Z" />
                <path className="chart-line" d="M0 157 C24 153 33 128 60 132 S87 103 114 112 146 82 173 92 202 36 232 58 260 120 285 81 309 111 333 66 358 91 382 40 410 30 430 27" />
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
        <div className="landing-hero__bg" aria-hidden="true">
          <img src={waves1672} srcSet={`${waves1024} 1024w, ${waves1672} 1672w`} sizes="100vw" alt="" fetchPriority="high" />
        </div>
        <div className="landing-shell landing-hero__grid">
          <div className="landing-hero__copy">
            <div className="landing-eyebrow" data-enter style={{ '--enter': 1 }}><span><Icon name="spark" size={15} /></span> Sistema de ventas para tu negocio</div>
            <h1>
              <span className="landing-hero__line" data-enter style={{ '--enter': 2 }}>Gestiona tu tienda.</span><br />
              <span data-enter style={{ '--enter': 3 }}>Vende más. Fácil.</span>
            </h1>
            <p data-enter style={{ '--enter': 4 }}>
              Centraliza tus productos, pedidos y clientes en un solo lugar.
              Fluxy te ayuda a vender online sin procesos complicados.
            </p>
            <div className="landing-hero__actions" data-enter style={{ '--enter': 5 }}>
              <Link className="landing-button landing-button--hero" to="/register-business">
                Comenzar gratis <Icon name="arrow" size={18} />
              </Link>
              <a className="landing-button landing-button--ghost" href="#how">
                <span className="landing-play"><Icon name="play" size={15} /></span>
                Ver cómo funciona
              </a>
            </div>
            <div className="landing-assurances" data-enter style={{ '--enter': 6 }}>
              {['Sin tarjeta de crédito', 'Configura en minutos', 'Soporte incluido'].map(item => (
                <span key={item}><Icon name="check" size={16} /> {item}</span>
              ))}
            </div>
          </div>
          <div className="landing-hero__visual" data-enter="rise" style={{ '--enter': 3 }}>
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
      <About />
      <UseCases />
      <Features />
      <Benefits />
      <HowItWorks />
      <Pricing />
      <Faq />
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
    <header className={`landing-section-heading landing-section-heading--${align}`} data-reveal>
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
            <article key={feature.title} data-reveal style={{ '--reveal': `${index * 90}ms` }}>
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
          <div className="benefit-visual benefit-visual--orders" data-reveal><OrderFlowCard /></div>
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
          <div className="benefit-visual benefit-visual--store" data-reveal>
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
            <article key={number} data-reveal style={{ '--reveal': `${index * 120}ms` }}>
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
        <div className="pricing-grid" data-reveal>
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

function About() {
  const values = [
    ['heart', 'Simple de verdad', 'Si sabes usar WhatsApp, sabes usar Fluxy. Sin instalaciones, sin contratos y sin programadores.'],
    ['shield', 'Seguro por diseño', 'Verificación de cuenta, permisos por persona y registro de cada cambio importante de tu negocio.'],
    ['pin', 'Hecho para el Perú', 'Precios en soles, cobros por Yape, Plin o transferencia y un Libro de Reclamaciones propio.'],
  ]
  return (
    <section className="landing-about" id="about">
      <div className="landing-about__bg" aria-hidden="true">
        <img src={glass1672} srcSet={`${glass1024} 1024w, ${glass1672} 1672w`} sizes="100vw" alt="" loading="lazy" decoding="async" />
      </div>
      <div className="landing-shell landing-about__grid">
        <div className="landing-about__copy">
          <SectionHeading
            align="left"
            eyebrow="Quiénes somos"
            title="Tecnología peruana para negocios que quieren crecer"
            description="Fluxy nació para que emprendedores y comercios vendan online sin depender de herramientas complicadas. Reunimos tu tienda, tus pedidos, tus cobros, tu inventario y tus clientes en una sola plataforma."
          />
          <p className="landing-about__mission" data-reveal style={{ '--reveal': '120ms' }}>
            <strong>Nuestra misión:</strong> que vender por internet sea tan simple como abrir la puerta de tu tienda.
            Fluxy es un producto de {CURRENT_PROVIDER.name}.
          </p>
        </div>
        <div className="landing-about__values">
          {values.map(([icon, title, text], index) => (
            <article key={title} data-reveal style={{ '--reveal': `${120 + index * 110}ms` }}>
              <span><Icon name={icon} size={20} /></span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function UseCases() {
  const uses = [
    ['chat', 'Vender por WhatsApp y redes', 'Comparte el enlace de tu tienda y recibe cada pedido ordenado, con los datos del cliente y el total.'],
    ['wallet', 'Registrar tus cobros', 'Anota pagos por Yape, Plin, transferencia, tarjeta o efectivo y mira qué falta cobrar.'],
    ['box', 'Controlar tu stock', 'Entradas, salidas y avisos de stock bajo para no vender lo que ya no tienes.'],
    ['users', 'Trabajar en equipo', 'Invita a tu equipo con permisos por rol: ventas, almacén o solo lectura.'],
    ['heart', 'Conocer a tus clientes', 'Historial de compras, etiquetas y notas de cada cliente en un solo lugar.'],
    ['chart', 'Decidir con datos', 'Métricas, reportes de ventas y cupones de descuento para vender más.', 'Pro'],
  ]
  return (
    <section className="landing-section landing-uses" id="uses">
      <div className="landing-shell">
        <SectionHeading
          eyebrow="¿Para qué sirve Fluxy?"
          title="Todo lo que pasa en tu negocio, en orden"
          description="Desde el primer mensaje del cliente hasta el cobro y la entrega."
        />
        <div className="landing-uses__grid">
          {uses.map(([icon, title, text, badge], index) => (
            <article key={title} data-reveal style={{ '--reveal': `${(index % 3) * 90}ms` }}>
              <span className="landing-uses__icon"><Icon name={icon} size={21} /></span>
              <h3>{title}{badge && <em>Desde {badge}</em>}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

const FAQ = [
  ['¿Necesito saber de tecnología?', 'No. Creas tu cuenta, cargas tus productos con fotos y precios, y compartes el enlace de tu tienda. Todo se maneja desde el panel, en el celular o en la computadora.'],
  ['¿Puedo empezar gratis?', 'Sí. El plan Free no pide tarjeta e incluye tu tienda pública con hasta 10 productos, pedidos y métricas básicas. Cambias de plan cuando lo necesites.'],
  ['¿Fluxy cobra comisión por mis ventas?', 'No. Pagas solo tu plan. El dinero de tus ventas lo recibes directamente por los medios de pago que tú elijas.'],
  ['¿Cómo me pagan mis clientes?', 'Tú decides los medios: Yape, Plin, transferencia, efectivo o tarjeta con tu proveedor. En Fluxy registras cada cobro y ves qué pedidos faltan pagar.'],
  ['¿Los planes se renuevan solos?', 'No. Los planes se renuevan de forma manual y no hacemos cobros automáticos. Si no renuevas, tu cuenta pasa al plan Free y conservas tu información.'],
  ['¿Puedo usar mi propio dominio?', 'Sí, con el plan Business puedes conectar un dominio propio a tu tienda.'],
  ['¿Mis datos están seguros?', 'Verificamos cada cuenta, cada persona de tu equipo tiene solo los permisos que le das y las acciones importantes quedan registradas.', true],
]

function Faq() {
  return (
    <section className="landing-section landing-faq" id="faq">
      <div className="landing-shell landing-faq__grid">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Preguntas frecuentes"
            title="Lo que más nos preguntan"
            description="¿Tienes otra duda? Escríbenos y te respondemos."
          />
          <a className="landing-faq__mail" href={`mailto:${CURRENT_PROVIDER.supportEmail}`} data-reveal>
            <Icon name="chat" size={17} /> {CURRENT_PROVIDER.supportEmail}
          </a>
        </div>
        <div className="landing-faq__list" data-reveal style={{ '--reveal': '120ms' }}>
          {FAQ.map(([question, answer, privacyLink]) => (
            <details key={question}>
              <summary>{question}<span aria-hidden="true"><Icon name="plus" size={18} /></span></summary>
              <p>
                {answer}
                {privacyLink && <> Los detalles están en la <Link to={legalUrl('privacy')}>Política de Privacidad</Link>.</>}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

function FinalCta() {
  return (
    <section className="landing-final-cta">
      <div className="landing-shell">
        <div className="landing-final-cta__card" data-reveal>
          <img
            className="landing-final-cta__bg"
            src={earth1672}
            srcSet={`${earth1024} 1024w, ${earth1672} 1672w`}
            sizes="(max-width: 1340px) 100vw, 1340px"
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
          />
          <div className="landing-final-cta__content">
            <span><Icon name="spark" size={18} /> Tu próxima venta puede empezar hoy</span>
            <h2>Lleva tu negocio a todo el Perú.</h2>
            <p>Crea tu tienda en minutos, compártela con un enlace y recibe pedidos desde cualquier lugar.</p>
            <div>
              <Link className="landing-button landing-button--light" to="/register-business">
                Crear mi tienda gratis <Icon name="arrow" size={18} />
              </Link>
              <Link className="landing-final-login" to="/login">Ya tengo una cuenta</Link>
            </div>
          </div>
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
            <strong>Fluxy</strong>
            <a href="#about">Quiénes somos</a>
            <a href="#uses">Para qué sirve</a>
            <a href="#features">Características</a>
            <a href="#pricing">Planes y precios</a>
            <a href="#faq">Preguntas frecuentes</a>
          </div>
          <div>
            <strong>Cuenta</strong>
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/register-business">Crear tienda gratis</Link>
          </div>
          <div>
            <strong>Legal</strong>
            <Link to={legalUrl('terms')}>Términos y condiciones</Link>
            <Link to={legalUrl('privacy')}>Privacidad</Link>
            <button type="button" className="landing-footer__link" onClick={openCookiePreferences}>Cookies</button>
            <Link to={CURRENT_PROVIDER.complaintsPath} className="landing-footer__complaints">
              <Icon name="book" size={16} /> Libro de Reclamaciones
            </Link>
          </div>
        </div>
        <div className="landing-footer__bottom">
          <span>© {new Date().getFullYear()} Fluxy · {CURRENT_PROVIDER.name}. Todos los derechos reservados.</span>
          <span>Hecho para negocios que quieren crecer.</span>
        </div>
      </div>
    </footer>
  )
}

function Intro({ onDone }) {
  const [leaving, setLeaving] = useState(false)
  const onDoneRef = useRef(onDone)
  useEffect(() => { onDoneRef.current = onDone })

  useEffect(() => {
    let finished = false
    const timers = []
    const finish = (delay) => {
      if (finished) return
      finished = true
      setLeaving(true)
      timers.push(setTimeout(() => onDoneRef.current(), delay))
    }
    timers.push(setTimeout(() => finish(800), 1900))
    // Cualquier interacción la adelanta: nadie debería esperar para usar la página.
    const skip = () => finish(450)
    const events = ['pointerdown', 'keydown', 'wheel', 'touchstart']
    events.forEach((name) => window.addEventListener(name, skip, { passive: true }))
    const root = document.documentElement
    const previous = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      timers.forEach(clearTimeout)
      events.forEach((name) => window.removeEventListener(name, skip))
      root.style.overflow = previous
    }
  }, [])

  return (
    <div className={`landing-intro${leaving ? ' is-leaving' : ''}`} aria-hidden="true">
      <div className="landing-intro__stage">
        <span className="landing-intro__mark"><Icon name="bag" size={40} /></span>
        <strong className="landing-intro__word">
          {'Fluxy'.split('').map((letter, index) => <span key={index} style={{ '--i': index }}>{letter}</span>)}
        </strong>
        <span className="landing-intro__tag">Vende más. Fácil.</span>
      </div>
    </div>
  )
}

export default function LandingPage() {
  const rootRef = useRef(null)
  const [phase, setPhase] = useState(initialPhase)
  const [reveal] = useState(canReveal)

  useEffect(() => {
    if (phase !== 'enter') return undefined
    const timer = setTimeout(() => setPhase('done'), 1800)
    return () => clearTimeout(timer)
  }, [phase])

  useReveal(rootRef, reveal && phase !== 'intro')

  const introDone = () => {
    markIntroPlayed()
    setPhase('enter')
  }

  return (
    <div ref={rootRef} className={`landing-page is-${phase}${reveal ? ' can-reveal' : ''}`}>
      {phase === 'intro' && <Intro onDone={introDone} />}
      <Navbar />
      <Hero />
      <Footer />
    </div>
  )
}
