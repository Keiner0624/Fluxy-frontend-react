// src/modules/dashboard/pages/StorePage.jsx
import { useParams, useSearchParams } from 'react-router-dom'
import { useState, useEffect, useMemo } from 'react'
import { Toaster } from 'react-hot-toast'
import { useStore } from '../../../hooks/useStore'
import { useCart } from '../../../hooks/useCart'
import Header from '../../../components/Header'
import Hero from '../../../components/Hero'
import ProductGrid from '../../../components/ProductGrid'
import Cart from '../../../components/Cart'
import CheckoutModal from '../../../components/CheckoutModal'
import ProductDetailModal from '../../../components/ProductDetailModal'
import TrustSection from '../../../components/TrustSection'
import Footer from '../../../components/Footer'

const DEFAULT_STYLE = {
  primary: '#7c83fd',
  colors: ['#06060f', '#1a0a2e', '#0d1a3e'],
  animation: 'mesh',
}

function applyStoreStyle(storeStyle) {
  try {
    const style = typeof storeStyle === 'string'
      ? JSON.parse(storeStyle)
      : storeStyle
    if (!style) return DEFAULT_STYLE
    return { ...DEFAULT_STYLE, ...style }
  } catch {
    return DEFAULT_STYLE
  }
}

function getSavedStoreStyle(slug) {
  if (typeof window === 'undefined') return null

  const keys = slug ? [`storeStyle_${slug}`, 'storeStyle'] : ['storeStyle']
  for (const key of keys) {
    const saved = localStorage.getItem(key)
    if (saved) return applyStoreStyle(saved)
  }

  return null
}

function applyPrimaryColor(style) {
  if (typeof document === 'undefined') return
  document.documentElement.style.setProperty('--primary', style.primary || DEFAULT_STYLE.primary)
}

function StoreBackground({ style }) {
  const bg = style.colors?.length > 1
    ? `linear-gradient(135deg, ${style.colors.join(', ')})`
    : style.colors?.[0] || '#06060f'

  const glowColor = style.primary || '#7c83fd'

  return (
    <>
      {/* Fondo base */}
 <div style={{
  position: 'fixed', inset: 0, zIndex: -2,
  background: style.bgImage ? 'transparent' : bg,
  transition: 'background 1s ease',
}}>
  {style.bgImage && (
    <>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `url(${style.bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}/>
      <div style={{
        position: 'absolute', inset: 0,
        background: bg,
        opacity: style.bgOverlay ?? 0.5,
      }}/>
    </>
  )}
</div>

      {/* Animación según tipo */}
      {style.animation === 'mesh' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: -1,
          background: `
            radial-gradient(ellipse 80% 60% at 20% 30%, ${glowColor}15 0%, transparent 55%),
            radial-gradient(ellipse 60% 50% at 80% 70%, ${glowColor}10 0%, transparent 50%),
            radial-gradient(ellipse 50% 40% at 50% 100%, ${glowColor}08 0%, transparent 45%)
          `,
          animation: 'meshMove 12s ease infinite alternate',
        }}/>
      )}

      {style.animation === 'wave' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: -1,
          background: `radial-gradient(ellipse 100% 60% at 50% 50%, ${glowColor}12 0%, transparent 60%)`,
          animation: 'waveFloat 8s ease infinite',
        }}/>
      )}

      {style.animation === 'pulse' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: -1,
          background: `radial-gradient(circle 600px at 50% 40%, ${glowColor}15 0%, transparent 70%)`,
          animation: 'pulseGlow 4s ease infinite',
        }}/>
      )}

      {style.animation === 'flow' && (
        <>
          <div style={{
            position: 'fixed', top: '-20%', left: '-10%', width: '60%', height: '60%', zIndex: -1,
            background: `radial-gradient(circle, ${glowColor}12 0%, transparent 60%)`,
            animation: 'flowOrb1 15s ease infinite',
            borderRadius: '50%',
          }}/>
          <div style={{
            position: 'fixed', bottom: '-20%', right: '-10%', width: '50%', height: '50%', zIndex: -1,
            background: `radial-gradient(circle, ${glowColor}10 0%, transparent 60%)`,
            animation: 'flowOrb2 18s ease infinite',
            borderRadius: '50%',
          }}/>
        </>
      )}

      {/* Grid decorativo */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: -1,
        backgroundImage: `
          linear-gradient(${glowColor}08 1px, transparent 1px),
          linear-gradient(90deg, ${glowColor}08 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)',
      }}/>

      <style>{`
        @keyframes meshMove {
          0%   { opacity: 0.8; transform: scale(1) rotate(0deg); }
          50%  { opacity: 1;   transform: scale(1.05) rotate(2deg); }
          100% { opacity: 0.8; transform: scale(1) rotate(0deg); }
        }
        @keyframes waveFloat {
          0%, 100% { transform: translateY(0) scaleX(1); opacity: 0.8; }
          50%       { transform: translateY(-30px) scaleX(1.1); opacity: 1; }
        }
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1);    opacity: 0.6; }
          50%       { transform: scale(1.15); opacity: 1; }
        }
        @keyframes flowOrb1 {
          0%   { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(10%, 15%) scale(1.1); }
          66%  { transform: translate(-5%, 10%) scale(0.95); }
          100% { transform: translate(0, 0) scale(1); }
        }
        @keyframes flowOrb2 {
          0%   { transform: translate(0, 0) scale(1); }
          33%  { transform: translate(-10%, -15%) scale(1.1); }
          66%  { transform: translate(5%, -8%) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
      `}</style>
    </>
  )
}

export default function StorePage() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const storeSlug = slug || searchParams.get('store')

  const { company, products, loading, error, reload } = useStore(storeSlug)
  const { cart, addToCart, increaseQty, decreaseQty, clearCart, total, count } = useCart()

  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const companyStoreStyle = company?.storeStyle

  const storeStyle = useMemo(() => {
    if (companyStoreStyle) return applyStoreStyle(companyStoreStyle)
    return getSavedStoreStyle(storeSlug) || DEFAULT_STYLE
  }, [companyStoreStyle, storeSlug])

  useEffect(() => {
    applyPrimaryColor(storeStyle)
  }, [storeStyle])

  useEffect(() => {
    if (!companyStoreStyle) return
    try {
      const payload = JSON.stringify(storeStyle)
      if (storeSlug) localStorage.setItem(`storeStyle_${storeSlug}`, payload)
      localStorage.setItem('storeStyle', payload)
    } catch { /* localStorage puede estar bloqueado */ }
  }, [companyStoreStyle, storeSlug, storeStyle])

  if (!storeSlug) return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#06060f',
      color: '#5a5a7a', gap: 12,
    }}>
      <div style={{ fontSize: 48 }}>🏪</div>
      <div style={{ fontSize: 16 }}>No se especificó ninguna tienda</div>
      <code style={{ color: 'var(--primary)', fontSize: 13 }}>/store/nombre-de-tienda</code>
    </div>
  )

  return (
    <>
      {/* Fondo dinámico */}
      <StoreBackground style={storeStyle} />

      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#111120', color: 'white',
            border: `1px solid ${storeStyle.primary}40`,
            borderRadius: 12, fontSize: 14,
          },
          duration: 2000,
        }}
      />

      <Header
        company={company}
        cartCount={count}
        onCartOpen={() => setCartOpen(true)}
      />

      <Hero
        company={company}
        loading={loading}
        cartOpen={cartOpen}
      />

      <ProductGrid
        products={products}
        loading={loading}
        error={error}
        company={company}
        onAddToCart={addToCart}
        onViewDetail={setSelectedProduct}
      />

      <TrustSection />
      <Footer company={company} />

      <Cart
        open={cartOpen}
        cart={cart}
        total={total}
        onClose={() => setCartOpen(false)}
        onIncrease={increaseQty}
        onDecrease={decreaseQty}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true) }}
      />

      <CheckoutModal
        open={checkoutOpen}
        cart={cart}
        total={total}
        company={company}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={() => { clearCart(); reload() }}
      />

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          company={company}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(p) => { addToCart(p); setSelectedProduct(null) }}
        />
      )}
    </>
  )
}
