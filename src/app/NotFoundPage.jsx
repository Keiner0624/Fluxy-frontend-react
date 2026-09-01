// src/app/NotFoundPage.jsx
import { useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import BrandLogo from '@/components/BrandLogo'
import Icon from '@/components/Icon'

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
    <div className="fx fx-auth">
      <header className="fx-auth__top">
        <Link to="/">
          <BrandLogo size={28} textSize={18} textColor="var(--fx-ink)" />
        </Link>
      </header>

      <main className="fx-auth__main">
        <div className="fx-auth__panel" style={{ textAlign: 'center' }}>
          <p className="fx-notfound__code">404</p>
          <h1 className="fx-h1" style={{ marginBottom: 8 }}>Esta página no existe</h1>
          <p className="fx-hint" style={{ marginBottom: 26 }}>
            La dirección que buscás no existe o fue movida a otro lugar.
          </p>

          <div className="fx-row" style={{ justifyContent: 'center', gap: 9 }}>
            <Link to="/" className="fx-btn fx-btn--primary">Ir al inicio</Link>
            <Link to="/dashboard" className="fx-btn fx-btn--secondary">
              <Icon name="overview" size={15} />
              Mi panel
            </Link>
          </div>

          <p className="fx-hint" style={{ marginTop: 24, fontSize: 12.5 }}>
            Te llevamos al inicio en {count} {count === 1 ? 'segundo' : 'segundos'}.
          </p>
        </div>
      </main>
    </div>
  )
}
