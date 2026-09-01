// src/app/NotFoundPage.jsx
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import BrandLogo from '@/components/BrandLogo'

export default function NotFoundPage() {
  const navigate   = useNavigate()
  const [count, setCount] = useState(10)

  // Cuenta regresiva y redirección automática
  useEffect(() => {
    if (count <= 0) { navigate('/'); return }
    const t = setTimeout(() => setCount(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [count, navigate])

  return (
    <div style={{
      minHeight: '100vh',
      background: '#06060f',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', textAlign: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @keyframes float { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-16px) } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        @keyframes glow   { 0%,100% { opacity:0.4 } 50% { opacity:0.7 } }
      `}</style>

      {/* Fondo */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: `
          radial-gradient(ellipse 60% 50% at 30% 30%, rgba(124,131,253,0.06) 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 70% 70%, rgba(79,70,229,0.04) 0%, transparent 55%)
        `,
      }}/>

      {/* Orbe difuso */}
      <div style={{
        position: 'absolute', top: '40%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,131,253,0.08) 0%, transparent 70%)',
        animation: 'glow 3s ease-in-out infinite', zIndex: 0,
      }}/>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ marginBottom: 40, animation: 'fadeUp 0.5s ease 0.1s both' }}>
          <BrandLogo size={36} textSize={20}/>
        </div>

        {/* 404 grande */}
        <div style={{
          fontSize: 'clamp(80px, 20vw, 140px)',
          fontFamily: "'Fraunces', serif",
          fontWeight: 900,
          lineHeight: 1,
          marginBottom: 8,
          background: 'linear-gradient(135deg, rgba(124,131,253,0.9), rgba(79,70,229,0.5))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animation: 'float 4s ease-in-out infinite',
        }}>404</div>

        {/* Texto */}
        <div style={{ animation: 'fadeUp 0.5s ease 0.3s both' }}>
          <h1 style={{
            fontFamily: "'Fraunces', serif",
            fontSize: 'clamp(20px, 4vw, 28px)',
            fontWeight: 700, color: 'white', marginBottom: 12,
          }}>
            Esta página no existe
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 380, margin: '0 auto 36px' }}>
            La URL que buscas no existe o fue movida a otro lugar.
            Volviendo al inicio en <strong style={{ color: 'var(--primary)' }}>{count}s</strong>...
          </p>
        </div>

        {/* Botones */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', animation: 'fadeUp 0.5s ease 0.5s both' }}>
          <button onClick={() => navigate('/')} style={{
            padding: '13px 28px',
            background: 'linear-gradient(135deg, #7c83fd, #4f46e5)',
            color: 'white', border: 'none', borderRadius: 12,
            fontSize: 14, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(124,131,253,0.3)',
            transition: 'transform 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            🏠 Ir al inicio
          </button>

          <button onClick={() => navigate('/dashboard')} style={{
            padding: '13px 28px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.7)', borderRadius: 12,
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
            📊 Mi dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
