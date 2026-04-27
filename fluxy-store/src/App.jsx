import { useSearchParams } from 'react-router-dom'
import { useStore } from './hooks/useStore'
import { useCart } from './hooks/useCart'
import { useState } from 'react'
import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import {
  ProductGrid,
  Cart,
  CheckoutModal,
  ProductDetailModal,
  TrustSection,
  Footer,
} from './components/Components.jsx'
import { Toaster } from 'react-hot-toast'

export default function App() {
  const [searchParams] = useSearchParams()
  const slug = searchParams.get('store')

  const { company, products, loading, error, reload } = useStore(slug)
  const { cart, addToCart, increaseQty, decreaseQty, clearCart, total, count } = useCart()

  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  if (!slug) return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: '#080810',
        color: '#5a5a7a', fontSize: 16, flexDirection: 'column', gap: 12
      }}>
        <div style={{ fontSize: 48 }}>🏪</div>
        <div>No se especificó ninguna tienda.</div>
        <code style={{ color: '#7c83fd' }}>?store=nombre-de-tienda</code>
      </div>
  )

  return (
      <>
        <Toaster position="bottom-center" toastOptions={{
          style: { background: '#111120', color: 'white', border: '1px solid #1e1e35' }
        }}/>

        <Header company={company} cartCount={count} onCartOpen={() => setCartOpen(true)}/>
        <Hero company={company} loading={loading}/>
        <ProductGrid
            products={products} loading={loading} error={error}
            company={company}
            onAddToCart={addToCart} onViewDetail={setSelectedProduct}
        />
        <TrustSection/>
        <Footer company={company}/>

        <Cart
            open={cartOpen} cart={cart} total={total}
            onClose={() => setCartOpen(false)}
            onIncrease={increaseQty} onDecrease={decreaseQty}
            onCheckout={() => { setCartOpen(false); setCheckoutOpen(true) }}
        />

        <CheckoutModal
            open={checkoutOpen} cart={cart} total={total} company={company}
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