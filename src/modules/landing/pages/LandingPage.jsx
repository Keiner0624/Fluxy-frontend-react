// src/modules/landing/pages/LandingPage.jsx
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { buildStoreUrl } from '../../../app/config'
import BrandLogo from '../../../components/BrandLogo'

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const navigate = useNavigate()

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(6,6,15,0.85)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      padding: '0 24px',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: 64,
      }}>
        {/* Logo */}
        <BrandLogo
          size={34}
          textSize={20}
          imageStyle={{ boxShadow: '0 4px 16px rgba(124,131,253,0.35)' }}
        />

        {/* Links desktop */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {[
            { label: 'Cómo funciona', href: '#como-funciona' },
            { label: 'Beneficios',    href: '#beneficios' },
            { label: 'Demo',          href: '#demo' },
            { label: 'Planes',        href: '#planes' },
          ].map(link => (
            <a key={link.label} href={link.href} style={{
              fontSize: 14, color: 'var(--text-soft)',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.target.style.color = 'white'}
              onMouseLeave={e => e.target.style.color = 'var(--text-soft)'}
            >{link.label}</a>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={() => navigate('/login')} style={{
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '8px 18px',
            color: 'var(--text-soft)', fontSize: 14,
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
          >
            Iniciar sesión
          </button>
          <button onClick={() => navigate('/register-business')} style={{
            background: 'linear-gradient(135deg, #7c83fd, #4f46e5)',
            borderRadius: 10, padding: '8px 18px',
            color: 'white', fontSize: 14, fontWeight: 600,
            boxShadow: '0 4px 16px rgba(124,131,253,0.3)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Empezar gratis
          </button>
        </div>
      </div>
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection() {
  const navigate = useNavigate()

  return (
    <section style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      padding: '100px 24px 80px', position: 'relative', overflow: 'hidden',
    }}>
      {/* Fondo */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: `
          radial-gradient(ellipse 70% 60% at 50% 30%, rgba(124,131,253,0.15) 0%, transparent 65%),
          radial-gradient(ellipse 50% 40% at 80% 80%, rgba(79,70,229,0.08) 0%, transparent 55%),
          #06060f
        `,
      }}/>

      {/* Grid */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 40%, black 30%, transparent 100%)',
      }}/>

      <div style={{
        maxWidth: 1200, margin: '0 auto', width: '100%',
        position: 'relative', zIndex: 1, textAlign: 'center',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(124,131,253,0.1)',
          border: '1px solid rgba(124,131,253,0.25)',
          borderRadius: 50, padding: '6px 18px', marginBottom: 28,
          animation: 'fadeUp 0.6s ease both',
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--primary)',
            boxShadow: '0 0 10px var(--primary)',
            animation: 'pulse 2s infinite',
          }}/>
          <span style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, letterSpacing: '0.5px' }}>
            Plataforma SaaS para negocios en Perú
          </span>
        </div>

        {/* Título */}
        <h1 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 'clamp(40px, 7vw, 80px)',
          fontWeight: 700, lineHeight: 1.05,
          letterSpacing: '-2px', marginBottom: 24,
          animation: 'fadeUp 0.7s 0.1s ease both',
        }}>
          Crea tu tienda online{' '}
          <span style={{
            background: 'linear-gradient(135deg, #7c83fd 0%, #a78bfa 50%, #7c83fd 100%)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'gradientShift 4s ease infinite',
          }}>
            gratis en minutos
          </span>
        </h1>

        {/* Subtítulo */}
        <p style={{
          fontSize: 'clamp(16px, 2.5vw, 20px)',
          color: 'var(--text-soft)', lineHeight: 1.7,
          maxWidth: 560, margin: '0 auto 40px',
          fontWeight: 300,
          animation: 'fadeUp 0.7s 0.2s ease both',
        }}>
          Vende más rápido por WhatsApp. Sin complicaciones, sin instalaciones. Solo tú, tus productos y tus clientes.
        </p>

        {/* CTAs */}
        <div style={{
          display: 'flex', gap: 14, justifyContent: 'center',
          flexWrap: 'wrap', marginBottom: 60,
          animation: 'fadeUp 0.7s 0.3s ease both',
        }}>
          <button onClick={() => navigate('/register-business')} style={{
            background: 'linear-gradient(135deg, #7c83fd, #4f46e5)',
            color: 'white', padding: '16px 32px',
            borderRadius: 14, fontSize: 16, fontWeight: 700,
            boxShadow: '0 8px 32px rgba(124,131,253,0.4)',
            transition: 'all 0.3s',
            display: 'flex', alignItems: 'center', gap: 8,
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,131,253,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,131,253,0.4)' }}
          >
            Registrar mi negocio gratis
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>

          <a href="#demo" style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 14, padding: '16px 28px',
            fontSize: 15, color: 'var(--text-soft)',
            transition: 'all 0.3s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.09)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polygon points="10,8 16,12 10,16"/>
            </svg>
            Ver ejemplo de tienda
          </a>
        </div>

        {/* Social proof */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 40,
          flexWrap: 'wrap', animation: 'fadeUp 0.7s 0.4s ease both',
        }}>
          {[
            { value: 'Gratis', label: 'Para empezar' },
            { value: '5 min', label: 'Para configurar' },
            { value: 'WhatsApp', label: 'Integrado' },
          ].map(stat => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Fraunces', serif",
                fontSize: 28, fontWeight: 700, color: 'white',
                marginBottom: 4,
              }}>{stat.value}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Cómo funciona ────────────────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      icon: '📝',
      title: 'Registra tu negocio',
      desc: 'Crea tu cuenta en menos de 2 minutos. Solo necesitas el nombre de tu negocio y tu WhatsApp.',
    },
    {
      num: '02',
      icon: '📦',
      title: 'Agrega tus productos',
      desc: 'Sube fotos, precios y descripciones desde tu panel. Fácil como publicar en Instagram.',
    },
    {
      num: '03',
      icon: '🔗',
      title: 'Comparte tu tienda',
      desc: 'Recibes un link único como fluxy.com/store/tu-negocio. Compártelo por WhatsApp, Instagram o donde quieras.',
    },
    {
      num: '04',
      icon: '💬',
      title: 'Recibe pedidos',
      desc: 'Tus clientes eligen productos y te contactan directamente por WhatsApp. Sin intermediarios.',
    },
  ]

  return (
    <section id="como-funciona" style={{
      padding: '100px 24px',
      borderTop: '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{
            fontSize: 11, color: 'var(--primary)', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 12,
          }}>Cómo funciona</div>
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(30px, 5vw, 48px)',
            fontWeight: 700, letterSpacing: '-1px', color: 'white',
          }}>
            De cero a vendiendo en 4 pasos
          </h2>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 24,
        }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              background: 'rgba(13,13,26,0.8)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20, padding: '28px 24px',
              position: 'relative', overflow: 'hidden',
              transition: 'all 0.3s',
              animation: `fadeUp 0.6s ${i * 0.1}s ease both`,
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(124,131,253,0.3)'
                e.currentTarget.style.transform = 'translateY(-4px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {/* Número decorativo */}
              <div style={{
                position: 'absolute', top: 16, right: 20,
                fontFamily: "'Fraunces', serif",
                fontSize: 48, fontWeight: 700,
                color: 'rgba(124,131,253,0.08)',
                lineHeight: 1,
              }}>{step.num}</div>

              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: 'rgba(124,131,253,0.1)',
                border: '1px solid rgba(124,131,253,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, marginBottom: 18,
              }}>{step.icon}</div>

              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 10 }}>
                {step.title}
              </h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Beneficios ────────────────────────────────────────────────────────────────
function BenefitsSection() {
  const benefits = [
    { icon: '⚡', title: 'Listo en minutos', desc: 'Sin tecnicismos. Sin código. Sin dolores de cabeza. Solo crea y vende.' },
    { icon: '💬', title: 'WhatsApp integrado', desc: 'Cada producto tiene un botón que conecta directo con tu WhatsApp. Cero fricción.' },
    { icon: '📱', title: 'Perfecto en celular', desc: 'Diseñado primero para móvil. Tus clientes compran desde su teléfono, sin problemas.' },
    { icon: '🔗', title: 'Link único para tu tienda', desc: 'fluxy.com/store/tu-negocio. Fácil de recordar, fácil de compartir.' },
    { icon: '📦', title: 'Gestión de productos', desc: 'Agrega, edita y elimina productos cuando quieras. Controla tu stock en tiempo real.' },
    { icon: '🔒', title: 'Seguro y confiable', desc: 'Tu tienda siempre disponible. Backend profesional en la nube.' },
  ]

  return (
    <section id="beneficios" style={{
      padding: '100px 24px',
      background: 'rgba(13,13,26,0.5)',
      borderTop: '1px solid rgba(255,255,255,0.04)',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{
            fontSize: 11, color: 'var(--primary)', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 12,
          }}>Beneficios</div>
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(30px, 5vw, 48px)',
            fontWeight: 700, letterSpacing: '-1px', color: 'white', marginBottom: 16,
          }}>
            Todo lo que necesitas para vender
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto' }}>
            Sin suscripciones complicadas. Sin curva de aprendizaje. Solo resultados.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {benefits.map((b, i) => (
            <div key={i} style={{
              display: 'flex', gap: 16,
              padding: '20px 20px',
              background: 'rgba(17,17,34,0.8)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 16,
              transition: 'all 0.3s',
              animation: `fadeUp 0.6s ${i * 0.08}s ease both`,
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(124,131,253,0.2)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
            >
              <div style={{
                width: 44, height: 44, flexShrink: 0,
                borderRadius: 12, fontSize: 20,
                background: 'rgba(124,131,253,0.08)',
                border: '1px solid rgba(124,131,253,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{b.icon}</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'white', marginBottom: 6 }}>{b.title}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{b.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Demo ──────────────────────────────────────────────────────────────────────
function DemoSection() {
  const demoStoreUrl = buildStoreUrl('cafeteria')

  return (
    <section id="demo" style={{ padding: '100px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 60, alignItems: 'center',
        }}>
          {/* Texto */}
          <div>
            <div style={{
              fontSize: 11, color: 'var(--primary)', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 12,
            }}>Demo real</div>
            <h2 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 700, letterSpacing: '-1px', color: 'white',
              marginBottom: 20, lineHeight: 1.1,
            }}>
              Así luce la tienda de tus clientes
            </h2>
            <p style={{
              fontSize: 16, color: 'var(--text-muted)', lineHeight: 1.7,
              marginBottom: 32,
            }}>
              Cada negocio tiene su propia tienda personalizada con su nombre, productos y WhatsApp. Tus clientes la ven así desde cualquier dispositivo.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
              {[
                'Link único: fluxy.com/store/tu-negocio',
                'Catálogo de productos con imágenes',
                'Botón WhatsApp en cada producto',
                'Información del negocio y contacto',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: 'rgba(52,211,153,0.15)',
                    border: '1px solid rgba(52,211,153,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 10, color: '#34d399', flexShrink: 0,
                  }}>✓</div>
                  <span style={{ fontSize: 14, color: 'var(--text-soft)' }}>{item}</span>
                </div>
              ))}
            </div>

            <a href={demoStoreUrl}
              target="_blank" rel="noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(135deg, #7c83fd, #4f46e5)',
                color: 'white', padding: '13px 24px',
                borderRadius: 12, fontSize: 14, fontWeight: 600,
                boxShadow: '0 8px 24px rgba(124,131,253,0.3)',
              }}>
              Ver tienda de ejemplo
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
                <polyline points="15 3 21 3 21 9"/>
                <line x1="10" y1="14" x2="21" y2="3"/>
              </svg>
            </a>
          </div>

          {/* Preview de tienda */}
          <div style={{
            background: 'rgba(13,13,26,0.9)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 24, overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
            animation: 'float 6s ease infinite',
          }}>
            {/* Barra del "browser" */}
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              padding: '12px 16px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{ display: 'flex', gap: 6 }}>
                {['#f87171', '#fbbf24', '#34d399'].map(c => (
                  <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.6 }}/>
                ))}
              </div>
              <div style={{
                flex: 1, background: 'rgba(255,255,255,0.05)',
                borderRadius: 6, padding: '4px 12px',
                fontSize: 11, color: 'var(--text-muted)',
              }}>
                fluxy.com/store/cafeteria-luna
              </div>
            </div>

            {/* Contenido preview */}
            <div style={{ padding: '20px' }}>
              {/* Header */}
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7,
                    background: 'linear-gradient(135deg, #7c83fd, #4f46e5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: 'white',
                  }}>C</div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'white' }}>Cafetería Luna</div>
                    <div style={{ fontSize: 9, color: 'var(--text-muted)' }}>via Fluxy</div>
                  </div>
                </div>
                <div style={{
                  fontSize: 10, color: '#34d399',
                  background: 'rgba(52,211,153,0.1)',
                  border: '1px solid rgba(52,211,153,0.2)',
                  borderRadius: 50, padding: '3px 8px',
                }}>● Verificado</div>
              </div>

              {/* Productos */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { name: 'Café Americano', price: 'S/ 8.50', emoji: '☕' },
                  { name: 'Torta de Chocolate', price: 'S/ 15.00', emoji: '🍰' },
                ].map((p, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 12, overflow: 'hidden',
                  }}>
                    <div style={{
                      height: 70, background: 'linear-gradient(135deg, #0d0d1e, #1a1a35)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 28,
                    }}>{p.emoji}</div>
                    <div style={{ padding: '8px 10px' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'white', marginBottom: 3 }}>{p.name}</div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>{p.price}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* WhatsApp */}
              <div style={{
                marginTop: 14, padding: '10px 14px',
                background: 'linear-gradient(135deg, #25d366, #128c7e)',
                borderRadius: 10, textAlign: 'center',
                fontSize: 12, fontWeight: 600, color: 'white',
              }}>
                💬 Hablar con el vendedor
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Planes ────────────────────────────────────────────────────────────────────
function PricingSection() {
  const navigate = useNavigate()

  const plans = [
    {
      name: 'Gratis',
      price: 'S/ 0',
      period: '/mes para siempre',
      highlight: false,
      features: [
        'Tienda online propia',
        'Hasta 10 productos',
        'Botón WhatsApp',
        'Link único',
        'Soporte básico',
      ],
      cta: 'Empezar gratis',
      note: 'Sin tarjeta requerida',
    },
    {
      name: 'Pro',
      price: 'S/ 29',
      period: '/mes',
      highlight: true,
      badge: 'Más popular',
      features: [
        'Todo lo del plan gratis',
        'Productos ilimitados',
        'Gestión de pedidos',
        'Notificaciones por email',
        'Estadísticas de ventas',
        'Soporte prioritario',
      ],
      cta: 'Empezar Pro',
      note: '7 días gratis de prueba',
    },
  ]

  return (
    <section id="planes" style={{
      padding: '100px 24px',
      borderTop: '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{
            fontSize: 11, color: 'var(--primary)', fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 12,
          }}>Planes</div>
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(30px, 5vw, 48px)',
            fontWeight: 700, letterSpacing: '-1px', color: 'white', marginBottom: 14,
          }}>Simple y transparente</h2>
          <p style={{ fontSize: 16, color: 'var(--text-muted)' }}>
            Empieza gratis. Actualiza cuando estés listo.
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 20,
        }}>
          {plans.map((plan, i) => (
            <div key={i} style={{
              background: plan.highlight ? 'rgba(124,131,253,0.06)' : 'rgba(13,13,26,0.8)',
              border: plan.highlight
                ? '1px solid rgba(124,131,253,0.4)'
                : '1px solid rgba(255,255,255,0.06)',
              borderRadius: 24, padding: '32px 28px',
              position: 'relative', overflow: 'hidden',
              boxShadow: plan.highlight ? '0 0 40px rgba(124,131,253,0.1)' : 'none',
            }}>
              {/* Acento superior */}
              {plan.highlight && (
                <div style={{
                  position: 'absolute', top: 0, left: 20, right: 20, height: 2,
                  background: 'linear-gradient(to right, transparent, var(--primary), transparent)',
                }}/>
              )}

              {plan.badge && (
                <div style={{
                  display: 'inline-block',
                  background: 'var(--primary)', color: 'white',
                  borderRadius: 50, padding: '4px 14px',
                  fontSize: 11, fontWeight: 700, marginBottom: 16,
                }}>{plan.badge}</div>
              )}

              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8 }}>{plan.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize: 48, fontWeight: 700, color: 'white',
                  }}>{plan.price}</span>
                  <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{plan.period}</span>
                </div>
              </div>

              <div style={{ marginBottom: 28, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(52,211,153,0.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, color: '#34d399',
                    }}>✓</div>
                    <span style={{ fontSize: 14, color: 'var(--text-soft)' }}>{f}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => navigate('/register-business')} style={{
                width: '100%', padding: '13px',
                background: plan.highlight
                  ? 'linear-gradient(135deg, #7c83fd, #4f46e5)'
                  : 'rgba(255,255,255,0.06)',
                color: 'white', borderRadius: 12,
                fontSize: 15, fontWeight: 600,
                border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.2s',
                boxShadow: plan.highlight ? '0 8px 24px rgba(124,131,253,0.3)' : 'none',
                marginBottom: 10,
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >{plan.cta}</button>

              {plan.note && (
                <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                  {plan.note}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── FAQ ───────────────────────────────────────────────────────────────────────
function FAQSection() {
  const [open, setOpen] = useState(null)

  const faqs = [
    { q: '¿Necesito saber programar?', a: 'No. Fluxy está diseñado para cualquier persona. Si sabes usar WhatsApp, puedes usar Fluxy.' },
    { q: '¿Cuánto cuesta?', a: 'Puedes empezar completamente gratis con hasta 10 productos. El plan Pro cuesta S/ 29/mes con funciones avanzadas.' },
    { q: '¿Cómo recibo los pedidos?', a: 'Tus clientes hacen el pedido desde tu tienda y te contactan directamente por WhatsApp. También recibes una notificación por correo.' },
    { q: '¿Puedo cambiar el diseño de mi tienda?', a: 'Puedes personalizar el nombre, descripción, color y logo de tu tienda desde el panel de configuración.' },
    { q: '¿Qué pasa con mis datos?', a: 'Tus datos están seguros en nuestra infraestructura en la nube. Nunca los vendemos ni compartimos.' },
  ]

  return (
    <section style={{
      padding: '80px 24px 100px',
      borderTop: '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 700, color: 'white', marginBottom: 12,
          }}>Preguntas frecuentes</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {faqs.map((faq, i) => (
            <div key={i} style={{
              background: 'rgba(13,13,26,0.8)',
              border: `1px solid ${open === i ? 'rgba(124,131,253,0.3)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 14, overflow: 'hidden',
              transition: 'all 0.3s',
            }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{
                width: '100%', padding: '18px 20px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'transparent', color: 'white',
                fontSize: 15, fontWeight: 500, textAlign: 'left',
              }}>
                {faq.q}
                <span style={{
                  fontSize: 18, color: 'var(--text-muted)',
                  transition: 'transform 0.3s',
                  transform: open === i ? 'rotate(45deg)' : 'rotate(0)',
                }}>+</span>
              </button>
              {open === i && (
                <div style={{
                  padding: '0 20px 18px',
                  fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7,
                  animation: 'fadeIn 0.2s ease',
                }}>{faq.a}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA Final ─────────────────────────────────────────────────────────────────
function FinalCTASection() {
  const navigate = useNavigate()

  return (
    <section style={{
      padding: '80px 24px',
      borderTop: '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{
        maxWidth: 700, margin: '0 auto', textAlign: 'center',
        background: 'rgba(124,131,253,0.06)',
        border: '1px solid rgba(124,131,253,0.2)',
        borderRadius: 28, padding: '56px 32px',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: '20%', right: '20%', height: 2,
          background: 'linear-gradient(to right, transparent, var(--primary), transparent)',
        }}/>

        <div style={{ fontSize: 48, marginBottom: 20 }}>🚀</div>
        <h2 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: 'clamp(28px, 5vw, 44px)',
          fontWeight: 700, color: 'white', marginBottom: 16,
          letterSpacing: '-0.5px',
        }}>
          Empieza a vender hoy mismo
        </h2>
        <p style={{
          fontSize: 16, color: 'var(--text-muted)', marginBottom: 36,
          lineHeight: 1.7, maxWidth: 420, margin: '0 auto 36px',
        }}>
          Sin tarjeta. Sin contratos. Sin complicaciones. Solo tú y tus clientes.
        </p>

        <button onClick={() => navigate('/register-business')} style={{
          background: 'linear-gradient(135deg, #7c83fd, #4f46e5)',
          color: 'white', padding: '16px 36px',
          borderRadius: 14, fontSize: 16, fontWeight: 700,
          boxShadow: '0 8px 32px rgba(124,131,253,0.4)',
          transition: 'all 0.3s',
          display: 'inline-flex', alignItems: 'center', gap: 10,
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,131,253,0.5)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,131,253,0.4)' }}
        >
          Crear mi tienda gratis
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </section>
  )
}

// ─── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      padding: '40px 24px',
      borderTop: '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 16,
      }}>
        <BrandLogo size={28} textSize={16} />

        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} Fluxy. Todos los derechos reservados.
        </div>

        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacidad', 'Términos', 'Contacto'].map(link => (
            <a key={link} href="#" style={{ fontSize: 13, color: 'var(--text-muted)', transition: 'color 0.2s' }}
              onMouseEnter={e => e.target.style.color = 'white'}
              onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
            >{link}</a>
          ))}
        </div>
      </div>
    </footer>
  )
}

// ─── LandingPage ───────────────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <BenefitsSection />
      <DemoSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
      <Footer />
    </>
  )
}
