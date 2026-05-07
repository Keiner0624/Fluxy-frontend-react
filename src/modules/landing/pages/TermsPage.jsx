// src/modules/landing/pages/TermsPage.jsx
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

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
• Plan PRO: S/ 19.00 soles peruanos por mes, con hasta 100 productos y funciones avanzadas.
• Plan BUSINESS: S/ 39.00 soles peruanos por mes, con productos ilimitados y todas las funciones.

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
• Railway — hospedaje del servidor
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

export default function TermsPage() {
  const [tab, setTab] = useState('terms')
  const [active, setActive] = useState(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setTimeout(() => setMounted(true), 80)
    window.scrollTo(0, 0)
  }, [])

  const sections = SECTIONS[tab]

  return (
    <div style={{
      minHeight: '100vh', background: '#06060f',
      fontFamily: 'DM Sans, sans-serif', color: 'white',
    }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .section-item { transition: all 0.2s; }
        .section-item:hover { background: rgba(124,131,253,0.04) !important; }
      `}</style>

      {/* Fondo */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(124,131,253,0.07) 0%, transparent 60%)' }}/>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: 'linear-gradient(rgba(124,131,253,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(124,131,253,0.025) 1px, transparent 1px)', backgroundSize: '60px 60px' }}/>

      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(6,6,15,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 24px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #7c83fd, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: 'white' }}>F</div>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>Fluxy</span>
          </Link>
          <Link to="/" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.color = 'white'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >← Volver al inicio</Link>
        </div>
      </nav>

      <div style={{
        maxWidth: 900, margin: '0 auto', padding: '48px 24px 80px',
        position: 'relative', zIndex: 1,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s ease',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,131,253,0.08)', border: '1px solid rgba(124,131,253,0.2)', borderRadius: 50, padding: '5px 16px', marginBottom: 20 }}>
            <span style={{ fontSize: 12, color: '#7c83fd', fontWeight: 600 }}>Documentos legales</span>
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 900, color: 'white', letterSpacing: '-1px', marginBottom: 12 }}>
            Términos legales de Fluxy
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7 }}>
            Última actualización: {LAST_UPDATED}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 32, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: 6 }}>
          {[
            { key: 'terms',   label: '📋 Términos y condiciones' },
            { key: 'privacy', label: '🔒 Política de privacidad' },
          ].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key); setActive(null) }} style={{
              flex: 1, padding: '10px 16px', borderRadius: 10,
              background: tab === t.key ? 'rgba(124,131,253,0.15)' : 'transparent',
              border: tab === t.key ? '1px solid rgba(124,131,253,0.3)' : '1px solid transparent',
              color: tab === t.key ? '#7c83fd' : 'rgba(255,255,255,0.4)',
              fontSize: 13, fontWeight: tab === t.key ? 700 : 400,
              cursor: 'pointer', transition: 'all 0.2s',
              fontFamily: 'DM Sans, sans-serif',
            }}>{t.label}</button>
          ))}
        </div>

        {/* Secciones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {sections.map((section) => (
            <div key={section.id} className="section-item" style={{
              background: active === section.id ? 'rgba(124,131,253,0.06)' : 'rgba(13,13,26,0.8)',
              border: active === section.id ? '1px solid rgba(124,131,253,0.2)' : '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16, overflow: 'hidden', cursor: 'pointer',
            }}
              onClick={() => setActive(active === section.id ? null : section.id)}
            >
              {/* Header sección */}
              <div style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: active === section.id ? '#7c83fd' : 'white', lineHeight: 1.3 }}>
                  {section.title}
                </h3>
                <div style={{
                  width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                  background: active === section.id ? 'rgba(124,131,253,0.15)' : 'rgba(255,255,255,0.05)',
                  border: active === section.id ? '1px solid rgba(124,131,253,0.3)' : '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, color: active === section.id ? '#7c83fd' : 'rgba(255,255,255,0.3)',
                  transition: 'all 0.2s',
                  transform: active === section.id ? 'rotate(180deg)' : 'rotate(0)',
                }}>▾</div>
              </div>

              {/* Contenido */}
              {active === section.id && (
                <div style={{ padding: '0 24px 22px' }}>
                  <div style={{ height: 1, background: 'rgba(124,131,253,0.1)', marginBottom: 18 }}/>
                  {section.content.split('\n').map((line, i) => (
                    line.trim() === '' ? <br key={i}/> : (
                      <p key={i} style={{
                        fontSize: 14, color: line.startsWith('•') ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.5)',
                        lineHeight: 1.8, marginBottom: 4,
                        paddingLeft: line.startsWith('•') ? 8 : 0,
                      }}>{line}</p>
                    )
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 48, padding: '24px', background: 'rgba(124,131,253,0.05)', border: '1px solid rgba(124,131,253,0.12)', borderRadius: 16, textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, marginBottom: 12 }}>
            ¿Tienes preguntas sobre estos documentos?
          </p>
          <a href="mailto:pkeinerr.e13@gmail.com" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(124,131,253,0.1)', border: '1px solid rgba(124,131,253,0.25)',
            borderRadius: 10, padding: '9px 20px', fontSize: 13, fontWeight: 600, color: '#7c83fd',
            textDecoration: 'none', transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,131,253,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(124,131,253,0.1)'}
          >
            ✉️ pkeinerr.e13@gmail.com
          </a>
        </div>
      </div>
    </div>
  )
}