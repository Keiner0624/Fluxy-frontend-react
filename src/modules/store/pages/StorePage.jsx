import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Icon from '@/components/Icon'
import { API_URL } from '@/app/config'
import Cart from '@/modules/store/components/Cart'
import CategoryPanel from '@/modules/store/components/CategoryPanel'
import CheckoutModal from '@/modules/store/components/CheckoutModal'
import Footer from '@/modules/store/components/Footer'
import Header from '@/modules/store/components/Header'
import Hero from '@/modules/store/components/Hero'
import ProductDetailModal from '@/modules/store/components/ProductDetailModal'
import ProductGrid from '@/modules/store/components/ProductGrid'
import TrustSection from '@/modules/store/components/TrustSection'
import { useCart } from '@/modules/store/hooks/useCart'
import { useStore } from '@/modules/store/hooks/useStore'
import './StorePage.css'

const DEFAULT_STYLE = {
  primary: '#7c83fd',
  colors: ['#06060f', '#1a0a2e', '#0d1a3e'],
  animation: 'mesh',
  bgImage: '',
  bgOverlay: 0.5,
}

function normalizeStoreStyle(storeStyle) {
  try {
    const style = typeof storeStyle === 'string' ? JSON.parse(storeStyle) : storeStyle
    return style && typeof style === 'object' ? { ...DEFAULT_STYLE, ...style } : DEFAULT_STYLE
  } catch {
    return DEFAULT_STYLE
  }
}

function getSavedStoreStyle(slug) {
  if (typeof window === 'undefined' || !slug) return null
  const saved = localStorage.getItem(`storeStyle_${slug}`)
  return saved ? normalizeStoreStyle(saved) : null
}

function getAccentContrast(color) {
  const hex = /^#([0-9a-f]{6})$/i.exec(color || '')
  if (!hex) return '#071019'
  const [r, g, b] = [0, 2, 4].map(offset => parseInt(hex[1].slice(offset, offset + 2), 16) / 255)
  const linear = [r, g, b].map(channel => channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4)
  const luminance = linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722
  return luminance > 0.46 ? '#071019' : '#ffffff'
}

function StoreBackground({ style }) {
  const colors = Array.isArray(style.colors) && style.colors.length ? style.colors : DEFAULT_STYLE.colors
  const background = colors.length > 1
    ? `linear-gradient(135deg, ${colors.join(', ')})`
    : colors[0]
  const accent = style.primary || DEFAULT_STYLE.primary

  return (
    <div className="store-background" aria-hidden="true">
      <div
        className="store-background__base"
        style={{
          backgroundColor: colors[0],
          backgroundImage: style.bgImage ? `url(${style.bgImage})` : background,
        }}
      />
      {style.bgImage && (
        <div className="store-background__overlay" style={{ background, opacity: style.bgOverlay ?? 0.5 }} />
      )}
      {style.animation !== 'none' && (
        <div className={`store-background__motion store-background__motion--${style.animation}`} style={{ '--motion-color': accent }} />
      )}
      <div className="store-background__texture" style={{ '--texture-color': accent }} />
    </div>
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
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)

  const companyStoreStyle = company?.storeStyle
  const storeStyle = useMemo(() => {
    if (companyStoreStyle) return normalizeStoreStyle(companyStoreStyle)
    return getSavedStoreStyle(storeSlug) || DEFAULT_STYLE
  }, [companyStoreStyle, storeSlug])

  const themeVariables = useMemo(() => ({
    '--primary': storeStyle.primary || DEFAULT_STYLE.primary,
    '--store-accent': storeStyle.primary || DEFAULT_STYLE.primary,
    '--store-accent-contrast': getAccentContrast(storeStyle.primary || DEFAULT_STYLE.primary),
  }), [storeStyle.primary])

  useEffect(() => {
    document.documentElement.style.setProperty('--primary', storeStyle.primary || DEFAULT_STYLE.primary)
    return () => document.documentElement.style.removeProperty('--primary')
  }, [storeStyle.primary])

  useEffect(() => {
    if (!companyStoreStyle || !storeSlug) return
    try {
      localStorage.setItem(`storeStyle_${storeSlug}`, JSON.stringify(storeStyle))
      localStorage.removeItem('storeStyle')
    } catch {
      // La tienda sigue funcionando cuando el navegador bloquea localStorage.
    }
  }, [companyStoreStyle, storeSlug, storeStyle])

  useEffect(() => {
    setSelectedCategory(null)
    if (!storeSlug) {
      setCategories([])
      return undefined
    }

    const controller = new AbortController()
    fetch(`${API_URL}/store/slug/${encodeURIComponent(storeSlug)}/categories`, { signal: controller.signal })
      .then(response => response.ok ? response.json() : [])
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(fetchError => {
        if (fetchError.name !== 'AbortError') setCategories([])
      })

    return () => controller.abort()
  }, [storeSlug])

  if (!storeSlug) {
    return (
      <main className="store-missing">
        <Icon name="store" size={34} />
        <h1>No se especificó una tienda</h1>
        <p>Abre el enlace público que te compartió el vendedor.</p>
        <code>/store/nombre-de-tienda</code>
      </main>
    )
  }

  const featuredProduct = products.find(product => product.imageUrl && Number(product.stock) > 0)

  return (
    <div className="store-root" style={themeVariables}>
      <StoreBackground style={storeStyle} />
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            background: '#141821',
            color: '#fff',
            border: '1px solid rgba(255,255,255,.12)',
            borderRadius: 12,
            fontSize: 13,
          },
          duration: 2400,
        }}
      />

      <Header company={company} cartCount={count} onCartOpen={() => setCartOpen(true)} />
      <main>
        <Hero company={company} loading={loading} cartOpen={cartOpen} featuredProduct={featuredProduct} />
        <div className="store-catalog-layout store-container">
          {categories.length > 0 && (
            <CategoryPanel
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          )}
          <ProductGrid
            products={products}
            loading={loading}
            error={error}
            company={company}
            onAddToCart={addToCart}
            onViewDetail={setSelectedProduct}
            selectedCategory={selectedCategory}
          />
        </div>
        <TrustSection />
      </main>
      <Footer company={company} />

      <Cart
        open={cartOpen}
        cart={cart}
        total={total}
        onClose={() => setCartOpen(false)}
        onIncrease={increaseQty}
        onDecrease={decreaseQty}
        onCheckout={() => {
          setCartOpen(false)
          setCheckoutOpen(true)
        }}
      />

      <CheckoutModal
        open={checkoutOpen}
        cart={cart}
        total={total}
        company={company}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={() => {
          clearCart()
          reload()
        }}
      />

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          company={company}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}
    </div>
  )
}
