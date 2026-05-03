// src/modules/landing/pages/LandingPage.jsx
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '../../../components/BrandLogo'

// ─── Animación de contador ────────────────────────────────────────────────────
function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime = null
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [start, target, duration])
  return count
}

// ─── Intersection Observer hook ───────────────────────────────────────────────
function useInView(threshold = 0.2) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [threshold])
  return [ref, inView]
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      padding: '0 24px',
      background: scrolled ? 'rgba(6,6,15,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <BrandLogo size={34} textSize={18} />
        </Link>

        {/* Desktop nav */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {[
            { label: 'Características', href: '#features' },
            { label: 'Cómo funciona', href: '#how' },
            { label: 'Planes', href: '#pricing' },
          ].map(item => (
            <a key={item.href} href={item.href} style={{
              fontSize: 14, color: 'var(--text-soft)', textDecoration: 'none',
              transition: 'color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'white'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-soft)'}
            >{item.label}</a>
          ))}
        </div>

        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/login" style={{
            fontSize: 14, color: 'var(--text-soft)', textDecoration: 'none',
            padding: '9px 20px', borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.08)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-soft)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
          >Iniciar sesión</Link>
          <Link to="/register-business" style={{
            fontSize: 14, fontWeight: 600, color: 'white', textDecoration: 'none',
            padding: '9px 20px', borderRadius: 10,
            background: 'linear-gradient(135deg, #7c83fd, #4f46e5)',
            boxShadow: '0 4px 16px rgba(124,131,253,0.3)',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >Crear mi tienda gratis →</Link>
        </div>

        {/* Mobile menu button */}
        <button className="hide-desktop" onClick={() => setMobileOpen(!mobileOpen)} style={{
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 8, padding: '8px 12px', color: 'white', fontSize: 18, cursor: 'pointer',
        }}>☰</button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div style={{
          background: 'rgba(6,6,15,0.98)', backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16,
        }}>
          {[
            { label: 'Características', href: '#features' },
            { label: 'Cómo funciona', href: '#how' },
            { label: 'Planes', href: '#pricing' },
          ].map(item => (
            <a key={item.href} href={item.href} onClick={() => setMobileOpen(false)} style={{
              fontSize: 16, color: 'var(--text-soft)', textDecoration: 'none',
            }}>{item.label}</a>
          ))}
          <Link to="/login" onClick={() => setMobileOpen(false)} style={{
            fontSize: 15, color: 'var(--text-soft)', textDecoration: 'none',
          }}>Iniciar sesión</Link>
          <Link to="/register-business" onClick={() => setMobileOpen(false)} style={{
            fontSize: 15, fontWeight: 600, color: 'white', textDecoration: 'none',
            padding: '13px', borderRadius: 12, textAlign: 'center',
            background: 'linear-gradient(135deg, #7c83fd, #4f46e5)',
          }}>Crear mi tienda gratis →</Link>
        </div>
      )}
    </nav>
  )
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setTimeout(() => setMounted(true), 100) }, [])

  return (
    <section style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '120px 24px 80px', textAlign: 'center',
      position: 'relative',
    }}>
      {/* Badge */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'rgba(124,131,253,0.1)',
        border: '1px solid rgba(124,131,253,0.25)',
        borderRadius: 50, padding: '6px 16px', marginBottom: 32,
        opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s ease 0.1s',
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34d399', animation: 'pulse 2s infinite' }}/>
        <span style={{ fontSize: 13, color: '#7c83fd', fontWeight: 600 }}>Plataforma nueva en crecimiento para negocios peruanos</span>
      </div>

      {/* Título */}
      <h1 style={{
        fontFamily: "'Fraunces', serif",
        fontSize: 'clamp(36px, 7vw, 80px)',
        fontWeight: 900, lineHeight: 1.05,
        color: 'white', marginBottom: 24,
        maxWidth: 900, letterSpacing: '-2px',
        opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.7s ease 0.2s',
      }}>
        Tu tienda online,{' '}
        <span style={{
          background: 'linear-gradient(135deg, #7c83fd, #a78bfa, #34d399)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>lista en minutos</span>
      </h1>

      {/* Subtítulo */}
      <p style={{
        fontSize: 'clamp(16px, 2.5vw, 20px)',
        color: 'var(--text-soft)', lineHeight: 1.7,
        maxWidth: 620, marginBottom: 44,
        opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.7s ease 0.35s',
      }}>
        Crea tu catálogo, recibe pedidos por WhatsApp y empieza a vender hoy sin conocimientos técnicos.
      </p>

      {/* CTAs */}
      <div style={{
        display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center',
        opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.7s ease 0.5s',
      }}>
        <Link to="/register-business" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(135deg, #7c83fd, #4f46e5)',
          color: 'white', textDecoration: 'none',
          padding: '16px 32px', borderRadius: 14,
          fontSize: 16, fontWeight: 700,
          boxShadow: '0 8px 32px rgba(124,131,253,0.4)',
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,131,253,0.5)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,131,253,0.4)' }}
        >
          Crear mi tienda gratis
        </Link>
        <a href="#how" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          color: 'var(--text-soft)', textDecoration: 'none',
          padding: '16px 28px', borderRadius: 14,
          fontSize: 15, fontWeight: 500,
          border: '1px solid rgba(255,255,255,0.1)',
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-soft)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
        >
          Ver ejemplo real de tienda ↓
        </a>
      </div>

      {/* Social proof */}
      <div style={{
        marginTop: 56, display: 'flex', alignItems: 'center', gap: 16,
        flexWrap: 'wrap', justifyContent: 'center',
        opacity: mounted ? 1 : 0, transition: 'all 0.7s ease 0.7s',
      }}>
        <div style={{ display: 'flex' }}>
          {['🧑🏽', '👩🏼', '🧑🏾', '👩🏻', '🧑🏿'].map((e, i) => (
            <div key={i} style={{
              width: 34, height: 34, borderRadius: '50%',
              background: `hsl(${220 + i * 30}, 70%, 45%)`,
              border: '2px solid #06060f',
              marginLeft: i > 0 ? -10 : 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
            }}>{e}</div>
          ))}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>
          <strong style={{ color: 'white' }}>Fluxy está creciendo</strong> junto a negocios peruanos
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          <span style={{ color: '#fbbf24', fontSize: 12, fontWeight: 700 }}>Nuevo • Simple • Rápido</span>
        </div>
      </div>

      {/* Preview del dashboard */}
      <div style={{
        marginTop: 72, width: '100%', maxWidth: 900,
        opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(40px)',
        transition: 'all 0.9s ease 0.8s',
      }}>
        <div style={{
          background: 'rgba(13,13,26,0.9)',
          border: '1px solid rgba(124,131,253,0.2)',
          borderRadius: 20, overflow: 'hidden',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(124,131,253,0.1)',
        }}>
          {/* Barra de browser */}
          <div style={{
            background: 'rgba(8,8,20,0.9)', padding: '10px 16px',
            display: 'flex', alignItems: 'center', gap: 8,
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['#f87171', '#fbbf24', '#34d399'].map(c => (
                <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }}/>
              ))}
            </div>
            <div style={{
              flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 6,
              padding: '4px 12px', fontSize: 11, color: 'var(--text-muted)',
              textAlign: 'center',
            }}>fluxyweb.vercel.app/dashboard</div>
          </div>

          {/* Dashboard preview */}
          <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, minHeight: 320 }}>
            {/* Sidebar */}
            <div style={{ background: 'rgba(8,8,20,0.8)', borderRadius: 12, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ padding: '8px 10px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 24, height: 24, borderRadius: 6, background: 'linear-gradient(135deg, #7c83fd, #4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'white' }}>F</div>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'white' }}>Mi Negocio</span>
              </div>
              {[
                { icon: '📊', label: 'Resumen', active: true },
                { icon: '📦', label: 'Productos' },
                { icon: '🛒', label: 'Pedidos' },
                { icon: '📈', label: 'Métricas' },
                { icon: '⚙️', label: 'Config' },
              ].map(item => (
                <div key={item.label} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 10px', borderRadius: 8,
                  background: item.active ? 'rgba(124,131,253,0.15)' : 'transparent',
                  border: item.active ? '1px solid rgba(124,131,253,0.2)' : '1px solid transparent',
                }}>
                  <span style={{ fontSize: 13 }}>{item.icon}</span>
                  <span style={{ fontSize: 12, color: item.active ? '#7c83fd' : 'rgba(255,255,255,0.4)' }}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Main content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { label: 'Ventas', value: 'S/ 2,840', color: '#7c83fd', icon: '💰' },
                  { label: 'Pedidos', value: '47', color: '#34d399', icon: '🛒' },
                  { label: 'Productos', value: '23', color: '#fbbf24', icon: '📦' },
                ].map(stat => (
                  <div key={stat.label} style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 10, padding: '12px',
                  }}>
                    <div style={{ fontSize: 16, marginBottom: 6 }}>{stat.icon}</div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Chart simulado */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '14px', flex: 1 }}>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 12 }}>Ventas últimos 7 días</div>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 60 }}>
                  {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: '4px 4px 0 0', background: `linear-gradient(to top, #7c83fd, #4f46e5)`, opacity: 0.7 + (i * 0.04) }}/>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── Stats ────────────────────────────────────────────────────────────────────
function Stats() {
  const [ref, inView] = useInView()
  const minutes = useCounter(5, 1200, inView)

  return (
    <section ref={ref} style={{
      padding: '60px 24px',
      borderTop: '1px solid rgba(255,255,255,0.04)',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40 }}>
        {[
          { value: 'Gratis', label: 'Empieza hoy', sub: 'sin tarjeta para iniciar' },
          { value: `<${minutes} min`, label: 'Configuración rápida', sub: 'para lanzar tu tienda' },
          { value: 'Simple', label: 'Sin programar', sub: 'pensado para pequeños negocios' },
        ].map((stat, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 48, fontWeight: 900,
              background: 'linear-gradient(135deg, #7c83fd, #a78bfa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', lineHeight: 1,
              marginBottom: 8,
            }}>{stat.value}</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 4 }}>{stat.label}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{stat.sub}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ─── Features ─────────────────────────────────────────────────────────────────
function Features() {
  const [ref, inView] = useInView(0.1)

  const features = [
    { icon: '⚡', title: 'Publica productos en minutos', desc: 'Sube tus productos, agrega fotos, precios y descripciones para tener tu catálogo listo rápidamente.', color: '#7c83fd' },
    { icon: '💬', title: 'Recibe pedidos directo por WhatsApp', desc: 'Tus clientes eligen sus productos y tú recibes el pedido con los detalles necesarios por WhatsApp.', color: '#25d366' },
    { icon: '🧭', title: 'Gestiona tu negocio desde un solo lugar', desc: 'Organiza tu catálogo, revisa pedidos y administra la información principal de tu tienda desde una plataforma simple.', color: '#34d399' },
    { icon: '🛠️', title: 'No necesitas saber programar', desc: 'Fluxy está pensado para pequeños negocios que quieren empezar a vender online sin conocimientos técnicos.', color: '#a78bfa' },
  ]

  return (
    <section id="features" style={{ padding: '100px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#7c83fd', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 16 }}>
            Beneficios clave
          </div>
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800,
            color: 'white', marginBottom: 16, letterSpacing: '-1px',
          }}>
            Vende online de forma simple y rápida
          </h2>
          <p style={{ fontSize: 17, color: 'var(--text-soft)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
            Una plataforma diseñada para pequeños negocios peruanos que quieren publicar productos, recibir pedidos y empezar sin complicaciones.
          </p>
        </div>

        <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
          {features.map((f, i) => (
            <div key={i} style={{
              background: 'rgba(13,13,26,0.8)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20, padding: '28px',
              transition: 'all 0.3s',
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(30px)',
              transitionDelay: `${i * 0.08}s`,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${f.color}30`; e.currentTarget.style.transform = 'translateY(-4px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: `${f.color}15`, border: `1px solid ${f.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, marginBottom: 20,
              }}>{f.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Cómo funciona ────────────────────────────────────────────────────────────
function HowItWorks() {
  const [ref, inView] = useInView(0.1)

  const steps = [
    { num: '01', title: 'Crea tu tienda gratis', desc: 'Empieza sin tarjeta y configura la información principal de tu negocio en pocos minutos.', icon: '✍️' },
    { num: '02', title: 'Publica tus productos', desc: 'Agrega fotos, precios y descripciones para armar tu catálogo online de manera sencilla.', icon: '📦' },
    { num: '03', title: 'Comparte tu tienda', desc: 'Usa el enlace de tu tienda para mostrar tus productos en WhatsApp, redes sociales o a tus clientes directos.', icon: '🔗' },
    { num: '04', title: 'Recibe pedidos por WhatsApp', desc: 'Tus clientes eligen lo que necesitan y tú recibes la información del pedido para atenderlos rápidamente.', icon: '🛒' },
  ]

  return (
    <section id="how" style={{ padding: '100px 24px', background: 'rgba(124,131,253,0.03)', borderTop: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#7c83fd', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 16 }}>
            Cómo funciona
          </div>
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800,
            color: 'white', letterSpacing: '-1px',
          }}>
            Lanza tu tienda en minutos
          </h2>
        </div>

        <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
          {steps.map((step, i) => (
            <div key={i} style={{
              textAlign: 'center', padding: '32px 24px',
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(30px)',
              transition: `all 0.6s ease ${i * 0.15}s`,
            }}>
              {/* Número */}
              <div style={{
                width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
                background: 'linear-gradient(135deg, rgba(124,131,253,0.2), rgba(79,70,229,0.1))',
                border: '1px solid rgba(124,131,253,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative',
              }}>
                <span style={{ fontSize: 28 }}>{step.icon}</span>
                <div style={{
                  position: 'absolute', top: -8, right: -8,
                  width: 24, height: 24, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c83fd, #4f46e5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 800, color: 'white',
                }}>{i + 1}</div>
              </div>
              <div style={{ fontSize: 11, color: '#7c83fd', fontWeight: 700, letterSpacing: '1px', marginBottom: 10 }}>{step.num}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 10 }}>{step.title}</h3>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Testimonios ──────────────────────────────────────────────────────────────
function Testimonials() {
  const [ref, inView] = useInView(0.1)

  const testimonials = [
    { name: 'Negocios reales', business: 'Fluxy en crecimiento', text: 'Negocios reales ya están comenzando a usar Fluxy para vender online de forma más simple.', emoji: '🏪', stars: 0 },
    { name: 'Primeros usuarios', business: 'Prueba temprana', text: 'Sé de los primeros en probar la plataforma y lanzar tu tienda online en minutos.', emoji: '🚀', stars: 0 },
    { name: 'Hecho para Perú', business: 'Pequeños negocios', text: 'Diseñada para negocios peruanos que quieren vender online de forma simple, rápida y sin conocimientos técnicos.', emoji: '🇵🇪', stars: 0 },
  ]

  return (
    <section style={{ padding: '100px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#7c83fd', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 16 }}>Credibilidad</div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: 800, color: 'white', letterSpacing: '-1px' }}>
            Una plataforma nueva, clara y realista
          </h2>
        </div>

        <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{
              background: 'rgba(13,13,26,0.8)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20, padding: '28px',
              opacity: inView ? 1 : 0,
              transform: inView ? 'translateY(0)' : 'translateY(30px)',
              transition: `all 0.6s ease ${i * 0.15}s`,
            }}>
              <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
                {[...Array(t.stars)].map((_, i) => <span key={i} style={{ color: '#fbbf24', fontSize: 16 }}>★</span>)}
              </div>
              <p style={{ fontSize: 15, color: '#e5e7eb', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>
                "{t.text}"
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #7c83fd, #4f46e5)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                }}>{t.emoji}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{t.business}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Pricing ──────────────────────────────────────────────────────────────────
function Pricing() {
  const [ref, inView] = useInView(0.1)

  const plans = [
    {
      name: 'Free', price: 'S/ 0', period: 'Sin tarjeta',
      color: '#9ca3af', border: 'rgba(255,255,255,0.08)',
      features: ['Publica productos en minutos', 'Tienda pública con link', 'Recepción de pedidos', 'Configuración simple'],
      cta: 'Empezar gratis', ctaLink: '/register-business', featured: false,
    },
    {
      name: 'Pro', price: 'S/ 19', period: '/mes',
      color: '#7c83fd', border: 'rgba(124,131,253,0.4)',
      badge: 'Más popular',
      features: ['Más productos para tu catálogo', 'Pedidos por WhatsApp', 'Estadísticas para gestionar', 'Personalización avanzada', 'Soporte por email'],
      cta: 'Empezar con Pro', ctaLink: '/register-business', featured: true,
    },
    {
      name: 'Business', price: 'S/ 39', period: '/mes',
      color: '#34d399', border: 'rgba(52,211,153,0.25)',
      features: ['Catálogo ampliado', 'Todo lo del plan Pro', 'Dominio personalizado', 'Sin branding Fluxy', 'Soporte prioritario'],
      cta: 'Empezar con Business', ctaLink: '/register-business', featured: false,
    },
  ]

  return (
    <section id="pricing" style={{ padding: '100px 24px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#7c83fd', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 16 }}>Planes y precios</div>
          <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, color: 'white', marginBottom: 16, letterSpacing: '-1px' }}>
            Elige el plan perfecto para ti
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-soft)', maxWidth: 480, margin: '0 auto' }}>
            Empieza gratis, sin tarjeta, y escala cuando tu negocio lo necesite.
          </p>
        </div>

        <div ref={ref} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20, alignItems: 'start' }}>
          {plans.map((plan, i) => (
            <div key={i} style={{
              background: plan.featured ? 'rgba(124,131,253,0.08)' : 'rgba(13,13,26,0.8)',
              border: `1px solid ${plan.border}`,
              borderRadius: 24, padding: '32px',
              position: 'relative', overflow: 'hidden',
              boxShadow: plan.featured ? '0 0 0 1px rgba(124,131,253,0.2), 0 20px 60px rgba(124,131,253,0.15)' : 'none',
              transform: plan.featured ? 'scale(1.03)' : 'scale(1)',
              opacity: inView ? 1 : 0,
              transitionDelay: `${i * 0.15}s`,
              transition: 'opacity 0.6s ease, transform 0.6s ease',
            }}>
              {plan.badge && (
                <div style={{
                  position: 'absolute', top: 20, right: 20,
                  background: plan.color, color: 'white',
                  borderRadius: 20, padding: '3px 12px',
                  fontSize: 11, fontWeight: 700,
                }}>{plan.badge}</div>
              )}

              <div style={{ fontSize: 13, fontWeight: 700, color: plan.color, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12 }}>{plan.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 4 }}>
                <span style={{ fontFamily: "'Fraunces', serif", fontSize: 42, fontWeight: 900, color: 'white' }}>{plan.price}</span>
                <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>{plan.period}</span>
              </div>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '24px 0' }}/>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 18, height: 18, borderRadius: '50%', background: `${plan.color}20`, border: `1px solid ${plan.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: plan.color, flexShrink: 0 }}>✓</div>
                    <span style={{ fontSize: 14, color: '#e5e7eb' }}>{f}</span>
                  </div>
                ))}
              </div>

              <Link to={plan.ctaLink} style={{
                display: 'block', textAlign: 'center', padding: '14px',
                borderRadius: 12, fontSize: 14, fontWeight: 700, textDecoration: 'none',
                background: plan.featured
                  ? 'linear-gradient(135deg, #7c83fd, #4f46e5)'
                  : 'rgba(255,255,255,0.06)',
                color: 'white',
                border: plan.featured ? 'none' : '1px solid rgba(255,255,255,0.1)',
                boxShadow: plan.featured ? '0 8px 24px rgba(124,131,253,0.3)' : 'none',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >{plan.cta}</Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── CTA Final ────────────────────────────────────────────────────────────────
function CTASection() {
  const [ref, inView] = useInView()

  return (
    <section style={{ padding: '80px 24px 120px' }}>
      <div ref={ref} style={{
        maxWidth: 800, margin: '0 auto', textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(124,131,253,0.12), rgba(79,70,229,0.08))',
        border: '1px solid rgba(124,131,253,0.2)',
        borderRadius: 28, padding: 'clamp(40px, 8vw, 72px) clamp(24px, 6vw, 60px)',
        position: 'relative', overflow: 'hidden',
        opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all 0.7s ease',
      }}>
        {/* Glow */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, height: 400, background: 'radial-gradient(circle, rgba(124,131,253,0.15) 0%, transparent 65%)', pointerEvents: 'none' }}/>

        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>🚀</div>
          <h2 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800,
            color: 'white', marginBottom: 16, letterSpacing: '-1px',
          }}>
            Empieza hoy gratis
          </h2>
          <p style={{ fontSize: 17, color: 'var(--text-soft)', lineHeight: 1.7, marginBottom: 36, maxWidth: 480, margin: '0 auto 36px' }}>
            Empieza hoy gratis y lanza tu tienda en minutos. Crea tu catálogo, recibe pedidos por WhatsApp y vende online de forma simple.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register-business" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'linear-gradient(135deg, #7c83fd, #4f46e5)',
              color: 'white', textDecoration: 'none',
              padding: '16px 32px', borderRadius: 14,
              fontSize: 16, fontWeight: 700,
              boxShadow: '0 8px 32px rgba(124,131,253,0.4)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,131,253,0.5)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,131,253,0.4)' }}
            >
              Crear mi tienda gratis →
            </Link>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center',
              color: 'var(--text-soft)', textDecoration: 'none',
              padding: '16px 24px', borderRadius: 14,
              fontSize: 15, border: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-soft)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            >Ya tengo cuenta</Link>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 20 }}>
            Sin tarjeta · Configuración en menos de 5 minutos
          </p>
        </div>
      </div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{ borderTop: '1px solid rgba(255,255,255,0.04)', padding: '48px 24px 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40, marginBottom: 48 }}>
          <div>
            <BrandLogo size={32} textSize={17} style={{ marginBottom: 16 }} />
            <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 240 }}>
              Plataforma nueva en crecimiento para negocios peruanos que quieren vender online de forma simple y rápida.
            </p>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>Producto</div>
            {['Características', 'Planes y precios', 'Cómo funciona'].map(item => (
              <div key={item} style={{ marginBottom: 10 }}>
                <a href="#" style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'white'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >{item}</a>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>Cuenta</div>
            {[
              { label: 'Iniciar sesión', to: '/login' },
              { label: 'Crear tienda gratis', to: '/register-business' },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: 10 }}>
                <Link to={item.to} style={{ fontSize: 14, color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'white'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >{item.label}</Link>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            © {new Date().getFullYear()} Fluxy. Todos los derechos reservados.
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Hecho con ❤️ para negocios peruanos 🇵🇪
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Background animado ───────────────────────────────────────────────────────
function AnimatedBackground() {
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, zIndex: -2, background: '#06060f' }}/>
      <div style={{
        position: 'fixed', inset: 0, zIndex: -1,
        background: `
          radial-gradient(ellipse 80% 60% at 20% 10%, rgba(124,131,253,0.08) 0%, transparent 55%),
          radial-gradient(ellipse 60% 50% at 80% 80%, rgba(79,70,229,0.06) 0%, transparent 50%),
          radial-gradient(ellipse 40% 40% at 50% 50%, rgba(52,211,153,0.04) 0%, transparent 45%)
        `,
        animation: 'bgPulse 15s ease infinite alternate',
      }}/>
      <div style={{
        position: 'fixed', inset: 0, zIndex: -1,
        backgroundImage: `
          linear-gradient(rgba(124,131,253,0.025) 1px, transparent 1px),
          linear-gradient(90deg, rgba(124,131,253,0.025) 1px, transparent 1px)
        `,
        backgroundSize: '72px 72px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 30%, black 30%, transparent 100%)',
      }}/>
      <style>{`
        @keyframes bgPulse {
          0%   { opacity: 0.8; transform: scale(1); }
          50%  { opacity: 1; transform: scale(1.03); }
          100% { opacity: 0.8; transform: scale(1); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(0.85); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-12px); }
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </>
  )
}

// ─── LandingPage principal ────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', color: 'white', fontFamily: 'DM Sans, sans-serif' }}>
      <AnimatedBackground />
      <Navbar />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Pricing />
      <CTASection />
      <Footer />
    </div>
  )
}
