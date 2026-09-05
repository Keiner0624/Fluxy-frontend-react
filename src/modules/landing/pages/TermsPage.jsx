// src/modules/landing/pages/TermsPage.jsx
import { useState, useEffect, useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import BrandLogo from '@/components/BrandLogo'
import Icon from '@/components/Icon'

const LAST_UPDATED = '5 de mayo de 2026'

const SECTIONS = {
  terms: [
    {
      id: '1',
      title: '1. Aceptación de los términos',
      content: `Al acceder y utilizar la plataforma Fluxy disponible en fluxyweb.com, usted acepta estar legalmente vinculado por estos Términos y Condiciones. Si no está de acuerdo con alguno de estos términos, le pedimos que no utilice nuestros servicios.

Fluxy es operado por Keyner Eduardo Moreno Padilla (en adelante "Fluxy", "nosotros" o "el titular") a título personal. Nos reservamos el derecho de modificar estos términos en cualquier momento, notificando los cambios a través de la plataforma.`,
    },
    {
      id: '2',
      title: '2. Descripción del servicio',
      content: `Fluxy es una plataforma SaaS (Software como Servicio) que permite a emprendedores y negocios peruanos crear y gestionar tiendas online, recibir pedidos y administrar su catálogo de productos.

El servicio incluye:
• Creación de tienda online con URL pública personalizada
• Panel de gestión de productos y pedidos
• Estadísticas de ventas (planes PRO y BUSINESS)
• Notificaciones por WhatsApp (planes PRO y BUSINESS)
• Personalización de diseño de tienda
• Dominio personalizado (plan BUSINESS)`,
    },
    {
      id: '3',
      title: '3. Planes y pagos',
      content: `Fluxy ofrece tres planes de suscripción:

• Plan FREE: Gratuito, con hasta 10 productos y funciones básicas.
• Plan PRO: S/ 39.00 soles peruanos por mes, con hasta 100 productos y funciones avanzadas.
• Plan BUSINESS: S/ 59.00 soles peruanos por mes, con productos ilimitados y todas las funciones.

Los pagos se procesan a través de Mercado Pago. Al completar un pago, acepta los términos y condiciones de Mercado Pago. Fluxy no almacena datos de tarjetas de crédito ni información financiera sensible.

Los planes son de renovación manual mensual. Fluxy no realiza cobros automáticos recurrentes sin su consentimiento explícito. Si su plan vence y no lo renueva, su cuenta volverá automáticamente al plan FREE.`,
    },
    {
      id: '4',
      title: '4. Política de reembolsos',
      content: `Dado que Fluxy ofrece un plan gratuito para probar el servicio, no realizamos reembolsos por planes pagados una vez activados.

Sin embargo, evaluaremos casos excepcionales de manera individual. Para solicitar un reembolso contacte a pkeinerr.e13@gmail.com dentro de las 48 horas siguientes al pago, explicando el motivo de su solicitud.`,
    },
    {
      id: '5',
      title: '5. Uso aceptable',
      content: `Al usar Fluxy, usted se compromete a NO:

• Vender productos ilegales, falsificados o que infrinjan derechos de autor
• Publicar contenido ofensivo, engañoso o fraudulento
• Usar la plataforma para actividades que violen las leyes peruanas vigentes
• Intentar acceder a cuentas de otros usuarios
• Usar bots o scripts automatizados para explotar el servicio
• Revender o redistribuir el servicio sin autorización expresa

El incumplimiento de estas normas puede resultar en la suspensión inmediata de su cuenta sin derecho a reembolso.`,
    },
    {
      id: '6',
      title: '6. Propiedad intelectual',
      content: `El contenido de su tienda (fotos, descripciones, nombre de negocio) es de su exclusiva propiedad. Usted otorga a Fluxy una licencia limitada para mostrar dicho contenido en la plataforma con el único fin de prestar el servicio.

El código, diseño, marca y tecnología de Fluxy son propiedad de Keyner Eduardo Moreno Padilla. No está permitida su reproducción, distribución o uso comercial sin autorización escrita.`,
    },
    {
      id: '7',
      title: '7. Limitación de responsabilidad',
      content: `Fluxy se proporciona "tal cual" y no garantiza disponibilidad ininterrumpida del servicio. No somos responsables de:

• Pérdidas de ventas o ingresos derivadas de interrupciones del servicio
• Acciones de terceros (Mercado Pago, SendGrid, Vercel, Cloudinary)
• Contenido publicado por los usuarios en sus tiendas
• Disputas entre vendedores y sus clientes finales

Los vendedores son los únicos responsables de sus productos, precios, entregas y atención al cliente.`,
    },
    {
      id: '8',
      title: '8. Terminación del servicio',
      content: `Usted puede cancelar su cuenta en cualquier momento contactando a pkeinerr.e13@gmail.com. Fluxy se reserva el derecho de suspender o eliminar cuentas que violen estos términos, sin previo aviso ni reembolso.

En caso de cierre de la plataforma, notificaremos con al menos 30 días de anticipación.`,
    },
    {
      id: '9',
      title: '9. Ley aplicable',
      content: `Estos términos se rigen por las leyes de la República del Perú. Cualquier disputa será sometida a la jurisdicción de los tribunales competentes de la ciudad de Lima, Perú.`,
    },
    {
      id: '10',
      title: '10. Contacto',
      content: `Para cualquier consulta sobre estos Términos y Condiciones:

Email: pkeinerr.e13@gmail.com
Plataforma: fluxyweb.com
Titular: Keyner Eduardo Moreno Padilla`,
    },
  ],
  privacy: [
    {
      id: 'p1',
      title: '1. Datos que recopilamos',
      content: `Recopilamos la siguiente información cuando usa Fluxy:

Datos de registro:
• Nombre completo
• Correo electrónico
• Contraseña (almacenada de forma encriptada con BCrypt)
• Nombre del negocio

Datos de la tienda:
• Información del negocio (dirección, teléfono, descripción)
• Logo e imágenes de productos (almacenados en Cloudinary)
• Métodos de pago aceptados

Datos de uso:
• Pedidos recibidos en su tienda
• Estadísticas de ventas
• Dirección IP y dispositivo (a través de Google Analytics)`,
    },
    {
      id: 'p2',
      title: '2. Cómo usamos sus datos',
      content: `Usamos su información exclusivamente para:

• Proveer y mejorar el servicio de Fluxy
• Enviar notificaciones relacionadas con su cuenta (confirmación de plan, alertas de vencimiento, notificaciones de pedidos)
• Procesar pagos a través de Mercado Pago
• Analizar el uso de la plataforma para mejorar la experiencia
• Contactarle en caso de problemas con su cuenta

No vendemos, alquilamos ni compartimos su información personal con terceros para fines comerciales.`,
    },
    {
      id: 'p3',
      title: '3. Servicios de terceros',
      content: `Fluxy utiliza los siguientes servicios externos que tienen sus propias políticas de privacidad:

• Mercado Pago — procesamiento de pagos
• SendGrid — envío de correos electrónicos
• Cloudinary — almacenamiento de imágenes
• Vercel — hospedaje de la aplicación
• Google Analytics — análisis de tráfico web

Le recomendamos revisar las políticas de privacidad de cada servicio.`,
    },
    {
      id: 'p4',
      title: '4. Cookies y rastreo',
      content: `Fluxy utiliza Google Analytics para medir el tráfico y comportamiento en la plataforma. Esta herramienta puede usar cookies para recopilar información anónima sobre sus visitas.

Puede desactivar Google Analytics instalando la extensión oficial de exclusión de Google Analytics en su navegador.`,
    },
    {
      id: 'p5',
      title: '5. Seguridad de los datos',
      content: `Implementamos medidas de seguridad para proteger su información:

• Contraseñas encriptadas con BCrypt
• Comunicaciones protegidas con HTTPS/SSL
• Tokens JWT con expiración para autenticación
• Acceso restringido a datos sensibles

Sin embargo, ningún sistema es 100% seguro. Le recomendamos usar contraseñas fuertes y no compartir sus credenciales.`,
    },
    {
      id: 'p6',
      title: '6. Sus derechos',
      content: `De acuerdo con la Ley N° 29733 de Protección de Datos Personales del Perú, usted tiene derecho a:

• Acceder a sus datos personales almacenados
• Rectificar información incorrecta
• Solicitar la eliminación de su cuenta y datos
• Oponerse al tratamiento de sus datos

Para ejercer estos derechos, contacte a pkeinerr.e13@gmail.com.`,
    },
    {
      id: 'p7',
      title: '7. Retención de datos',
      content: `Conservamos sus datos mientras su cuenta esté activa. Si elimina su cuenta, eliminaremos sus datos personales en un plazo de 30 días, excepto aquellos que debamos conservar por obligaciones legales.

Los datos de pedidos pueden conservarse por hasta 1 año para fines de soporte.`,
    },
    {
      id: 'p8',
      title: '8. Contacto',
      content: `Para consultas sobre privacidad o para ejercer sus derechos:

Email: pkeinerr.e13@gmail.com
Responsable: Keyner Eduardo Moreno Padilla
Plataforma: fluxyweb.com`,
    },
  ],
}

const DOCS = [
  { key: 'terms',   label: 'Términos y condiciones' },
  { key: 'privacy', label: 'Política de privacidad' },
]

export default function TermsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const doc = searchParams.get('doc') === 'privacy' ? 'privacy' : 'terms'
  const [activeId, setActiveId] = useState(null)

  const sections = useMemo(() => SECTIONS[doc] ?? [], [doc])

  // Marca en el índice la sección visible al hacer scroll
  useEffect(() => {
    const nodes = sections
      .map((s) => document.getElementById(`sec-${s.id}`))
      .filter(Boolean)
    if (nodes.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visible) setActiveId(visible.target.id.replace('sec-', ''))
      },
      { rootMargin: '-88px 0px -70% 0px', threshold: 0 },
    )

    nodes.forEach((n) => observer.observe(n))
    return () => observer.disconnect()
  }, [sections])

  const selectDoc = (key) => {
    setSearchParams(key === 'terms' ? {} : { doc: key })
    setActiveId(null)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="fx fx-legal">
      <header className="fx-legal__nav">
        <div className="fx-legal__nav-inner">
          <Link to="/">
            <BrandLogo size={28} textSize={18} textColor="var(--fx-ink)" />
          </Link>
          <Link to="/" className="fx-btn fx-btn--ghost fx-btn--sm">
            <Icon name="arrowLeft" size={15} />
            Volver al inicio
          </Link>
        </div>
      </header>

      <div className="fx-legal__shell">
        <div className="fx-legal__header">
          <span className="fx-eyebrow">Documentos legales</span>
          <h1 className="fx-legal__title">{DOCS.find((d) => d.key === doc).label}</h1>
          <p className="fx-hint">Última actualización: {LAST_UPDATED}</p>
        </div>

        <div className="fx-legal__tabs" role="tablist">
          {DOCS.map((d) => (
            <button
              key={d.key}
              role="tab"
              aria-selected={doc === d.key}
              className={`fx-legal__tab${doc === d.key ? ' fx-legal__tab--on' : ''}`}
              onClick={() => selectDoc(d.key)}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div className="fx-legal__body">
          <nav className="fx-legal__toc" aria-label="Índice">
            <p className="fx-eyebrow" style={{ marginBottom: 12 }}>Contenido</p>
            <ol>
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#sec-${s.id}`}
                    className={activeId === s.id ? 'is-active' : undefined}
                    onClick={() => setActiveId(s.id)}
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="fx-legal__doc">
            {sections.map((s) => (
              <section key={s.id} id={`sec-${s.id}`} className="fx-legal__section">
                <h2>{s.title}</h2>
                {s.content.split('\n\n').map((block, i) => {
                  const lines = block.split('\n')
                  const isList = lines.every((l) => l.trim().startsWith('•'))
                  if (isList) {
                    return (
                      <ul key={i}>
                        {lines.map((l, j) => <li key={j}>{l.replace(/^\s*•\s*/, '')}</li>)}
                      </ul>
                    )
                  }
                  return <p key={i}>{block}</p>
                })}
              </section>
            ))}
          </article>
        </div>

        <footer className="fx-legal__foot">
          <p className="fx-hint">
            ¿Dudas sobre estos documentos? Escribinos a{' '}
            <a href="mailto:soporte@fluxyweb.com" className="fx-auth__link">soporte@fluxyweb.com</a>.
          </p>
          <Link to="/" className="fx-btn fx-btn--secondary fx-btn--sm">Volver al inicio</Link>
        </footer>
      </div>
    </div>
  )
}


