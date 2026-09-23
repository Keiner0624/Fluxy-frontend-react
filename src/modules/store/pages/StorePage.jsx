// src/modules/store/pages/StorePage.jsx
// Tienda pública del negocio: portada, catálogo, detalle, carrito y pedido.
//
// La vista, los filtros y el producto abierto viven en la URL: se pueden
// compartir, y el botón Atrás del celular cierra el detalle en vez de salir.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import toast, { Toaster } from 'react-hot-toast'
import Icon from '@/components/Icon'
import Cart from '@/modules/store/components/Cart'
import CatalogView from '@/modules/store/components/CatalogView'
import CheckoutModal from '@/modules/store/components/CheckoutModal'
import ProductDetail from '@/modules/store/components/ProductDetail'
import StoreHeader from '@/modules/store/components/StoreHeader'
import { FloatingWhatsapp, MobileNav, StoreFooter } from '@/modules/store/components/StoreFooter'
import { AboutSection, CategoryTiles, Hero, ProductSection, PromoBanner, TrustStrip } from '@/modules/store/components/HomeSections'
import { useCart } from '@/modules/store/hooks/useCart'
import { useFavorites } from '@/modules/store/hooks/useFavorites'
import { useStore } from '@/modules/store/hooks/useStore'
import { useStoreScheme } from '@/modules/store/hooks/useStoreScheme'
import { useStoreTracking } from '@/modules/store/hooks/useStoreTracking'
import { canUseWhatsapp, money, productImages, sortProducts, stockOf, whatsappLink } from '@/modules/store/lib/storeFormat'
import { storeBanner, storeMode, storeThemeVars } from '@/modules/store/lib/storeTheme'
import './StorePage.css'

const FONT_ID = 'sf-font'
const PARAMS = { view: 'vista', category: 'categoria', q: 'q', sort: 'orden', available: 'stock', onlyFavorites: 'favoritos', product: 'producto' }

function useStoreFont() {
  useEffect(() => {
    if (document.getElementById(FONT_ID)) return
    const link = document.createElement('link')
    link.id = FONT_ID
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
    document.head.appendChild(link)
  }, [])
}

function StoreSkeleton() {
  return (
    <div className="sf-container sf-skeleton" aria-busy="true" aria-label="Cargando la tienda">
      <div className="sf-sk sf-sk--hero" />
      <div className="sf-sk sf-sk--strip" />
      <div className="sf-grid">{Array.from({ length: 8 }).map((_, i) => <div key={i} className="sf-sk sf-sk--card" />)}</div>
    </div>
  )
}

function StoreProblem({ title, text }) {
  return (
    <main className="sf-problem">
      <span className="sf-empty__icon"><Icon name="store" size={30} /></span>
      <h1>{title}</h1>
      <p>{text}</p>
      <a className="sf-btn sf-btn--ghost" href="/">Ir a Fluxy</a>
    </main>
  )
}

export default function StorePage() {
  const { slug } = useParams()
  const [params, setParams] = useSearchParams()
  const storeSlug = slug || params.get('store')
  const { company, products, categories, loading, error, refresh } = useStore(storeSlug)
  const { cart, add, setQuantity, quantityOf, remove, clear, total, count } = useCart(storeSlug, products)
  const { favorites, isFavorite, toggle: toggleFavorite } = useFavorites(storeSlug)
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  useStoreTracking(company)
  useStoreFont()

  const view = params.get(PARAMS.view) === 'productos' ? 'catalog' : 'home'
  const filters = {
    category: params.get(PARAMS.category),
    q: params.get(PARAMS.q) || '',
    sort: params.get(PARAMS.sort) || 'featured',
    available: params.get(PARAMS.available) === '1',
    onlyFavorites: params.get(PARAMS.onlyFavorites) === '1',
  }
  const openProductId = Number(params.get(PARAMS.product)) || null
  const openProduct = products.find((p) => p.id === openProductId) || null

  const ordersPaused = company?.acceptingOrders === false
  const whatsappAllowed = canUseWhatsapp(company)
  const contactLink = whatsappAllowed ? whatsappLink(company, `Hola ${company?.name}, vi su tienda y quiero hacer una consulta.`) : ''
  const scheme = useStoreScheme(storeMode(company?.storeStyle))
  const theme = useMemo(() => storeThemeVars(company?.storeStyle, scheme), [company?.storeStyle, scheme])

  // Fondo del documento y barra del navegador en el celular, del mismo tono que la tienda.
  useEffect(() => {
    const background = scheme === 'dark' ? '#101014' : '#f7f5f2'
    const root = document.documentElement
    const previous = { background: root.style.background, colorScheme: root.style.colorScheme }
    root.style.background = background
    root.style.colorScheme = scheme
    let meta = document.querySelector('meta[name="theme-color"]')
    const created = !meta
    if (created) {
      meta = document.createElement('meta')
      meta.name = 'theme-color'
      document.head.appendChild(meta)
    }
    const previousColor = meta.content
    meta.content = background
    return () => {
      root.style.background = previous.background
      root.style.colorScheme = previous.colorScheme
      if (created) meta.remove()
      else meta.content = previousColor
    }
  }, [scheme])

  useEffect(() => {
    if (!company?.name) return undefined
    const previous = document.title
    document.title = `${company.name} · Tienda online`
    return () => { document.title = previous }
  }, [company?.name])

  const patchParams = useCallback((changes, { replace = false } = {}) => {
    setParams((current) => {
      const next = new URLSearchParams(current)
      Object.entries(changes).forEach(([key, value]) => {
        const name = PARAMS[key] || key
        if (value === null || value === undefined || value === '' || value === false) next.delete(name)
        else next.set(name, value === true ? '1' : String(value))
      })
      return next
    }, { replace })
  }, [setParams])

  // Adónde ir después de cambiar de vista: arriba, o a una sección de la portada.
  const [scrollTarget, setScrollTarget] = useState(null)

  const navigate = useCallback((target, anchor, extra = {}) => {
    const reset = { category: null, q: null, sort: null, available: null, onlyFavorites: null, product: null }
    if (target === 'catalog') patchParams({ ...reset, view: 'productos', ...extra })
    else patchParams({ ...reset, view: null })
    setCartOpen(false)
    setScrollTarget({ anchor, view: target === 'catalog' ? 'catalog' : 'home' })
  }, [patchParams])

  useEffect(() => {
    // Espera a que la vista pedida esté en pantalla: la URL cambia en otro render.
    if (!scrollTarget || loading || scrollTarget.view !== view) return
    const element = scrollTarget.anchor && document.getElementById(scrollTarget.anchor)
    if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    else window.scrollTo({ top: 0 })
    setScrollTarget(null)
  }, [scrollTarget, view, loading])

  const openDetail = useCallback((product) => {
    setCartOpen(false)
    patchParams({ product: product.id })
  }, [patchParams])

  const closeDetail = useCallback(() => patchParams({ product: null }, { replace: true }), [patchParams])

  const addToCart = useCallback((product, amount = 1, { silent = false } = {}) => {
    if (ordersPaused || stockOf(product) <= 0) return
    if (quantityOf(product.id) >= stockOf(product)) {
      toast.error(`No hay más stock de ${product.name}.`)
      return
    }
    add(product, amount)
    if (silent) return
    const image = productImages(product)[0]
    toast.custom((t) => (
      <div className={`sf-toast${t.visible ? ' is-in' : ''}`} role="status">
        <span className="sf-toast__img">{image ? <img src={image} alt="" /> : <Icon name="checkCircle" size={20} />}</span>
        <span className="sf-toast__text"><strong>Agregado al carrito</strong><small>{product.name} · {money(product.price)}</small></span>
        <button type="button" onClick={() => { toast.dismiss(t.id); setCartOpen(true) }}>Ver carrito</button>
      </div>
    ), {
      id: 'sf-added',
      duration: 2600,
      // En el celular abajo están la barra del pedido y la navegación.
      position: window.matchMedia('(max-width: 720px)').matches ? 'top-center' : 'bottom-center',
    })
  }, [add, ordersPaused, quantityOf])

  const cardProps = useCallback((product) => ({
    quantity: quantityOf(product.id),
    favorite: isFavorite(product.id),
    ordersPaused,
    onOpen: openDetail,
    onAdd: addToCart,
    onSetQuantity: setQuantity,
    onToggleFavorite: toggleFavorite,
  }), [quantityOf, isFavorite, ordersPaused, openDetail, addToCart, setQuantity, toggleFavorite])

  const featured = useMemo(() => sortProducts(products.filter((p) => stockOf(p) > 0), 'featured').slice(0, 8), [products])
  const heroProduct = featured.find((p) => p.imageUrl) || featured[0]
  const related = useMemo(() => {
    if (!openProduct) return []
    const others = products.filter((p) => p.id !== openProduct.id && stockOf(p) > 0)
    const same = others.filter((p) => openProduct.category?.id && p.category?.id === openProduct.category.id)
    return [...same, ...others.filter((p) => !same.includes(p))].slice(0, 4)
  }, [openProduct, products])

  if (!storeSlug) {
    return <div className="sf-root" data-scheme={scheme} style={theme}><StoreProblem title="No se indicó una tienda" text="Abrí el enlace que te compartió el negocio." /></div>
  }

  if (!loading && error) {
    return (
      <div className="sf-root" data-scheme={scheme} style={theme}>
        <StoreProblem title="Esta tienda no está disponible" text={error.includes('conectar') ? error : 'Puede que el enlace esté mal escrito o que la tienda ya no esté en línea.'} />
      </div>
    )
  }

  return (
    <div className="sf-root" data-scheme={scheme} style={theme}>
      <Toaster toastOptions={{ className: 'sf-toast-base' }} containerStyle={{ top: 70, bottom: 24 }} />

      {ordersPaused && (
        <div className="sf-announcement" role="status">
          <Icon name="info" size={16} /> Esta tienda no está recibiendo pedidos por ahora. Podés ver el catálogo{whatsappAllowed ? ' y escribirle al negocio' : ''}.
        </div>
      )}

      <StoreHeader
        company={company}
        view={view}
        products={products}
        cartCount={count}
        onNavigate={navigate}
        onOpenProduct={openDetail}
        onSearch={(q) => navigate('catalog', null, { q })}
        onCartOpen={() => setCartOpen(true)}
      />

      {loading ? (
        <StoreSkeleton />
      ) : view === 'catalog' ? (
        <main className="sf-container sf-main">
          <CatalogView
            products={products}
            categories={categories}
            filters={filters}
            favorites={favorites}
            onHome={() => navigate('home')}
            onChange={(changes, options) => patchParams(changes, options)}
            cardProps={cardProps}
          />
        </main>
      ) : (
        <main className="sf-container sf-main">
          <Hero
            company={company}
            banner={storeBanner(company?.storeStyle)}
            heroProduct={heroProduct}
            productCount={products.length}
            categoryCount={categories.length}
            whatsapp={contactLink}
            ordersPaused={ordersPaused}
            onShop={() => navigate('catalog')}
            onOpenProduct={openDetail}
            onAdd={addToCart}
          />
          <TrustStrip company={company} whatsapp={contactLink} />
          <CategoryTiles categories={categories} products={products} onPick={(id) => navigate('catalog', null, { category: id })} />
          {products.length === 0 ? (
            <div className="sf-empty sf-empty--page">
              <span className="sf-empty__icon"><Icon name="package" size={30} /></span>
              <strong>Estamos preparando el catálogo</strong>
              <p>Muy pronto vas a poder hacer tu pedido acá.{contactLink ? ' Mientras tanto, escribinos.' : ''}</p>
              {contactLink && <a className="sf-btn sf-btn--whatsapp" href={contactLink} target="_blank" rel="noreferrer"><Icon name="whatsapp" size={17} /> Escribinos</a>}
            </div>
          ) : (
            <>
              <ProductSection
                id="sf-featured-title"
                title="Productos destacados"
                subtitle="Lo más elegido, listo para agregar a tu pedido."
                products={featured}
                action={{ label: 'Ver todo', onClick: () => navigate('catalog') }}
                cardProps={cardProps}
              />
              <PromoBanner categories={categories} products={products} onPick={(id) => navigate('catalog', null, { category: id })} />
            </>
          )}
          <AboutSection company={company} whatsapp={contactLink} />
        </main>
      )}

      {!loading && <StoreFooter company={company} whatsapp={contactLink} onNavigate={navigate} />}

      <MobileNav view={view} count={count} total={total} whatsapp={contactLink} cartOpen={cartOpen}
        onNavigate={navigate} onCartOpen={() => setCartOpen(true)} />
      <FloatingWhatsapp href={contactLink} hidden={cartOpen || checkoutOpen || Boolean(openProduct)} />

      <Cart
        open={cartOpen}
        cart={cart}
        total={total}
        count={count}
        ordersPaused={ordersPaused}
        onClose={() => setCartOpen(false)}
        onSetQuantity={setQuantity}
        onRemove={remove}
        onShop={() => { setCartOpen(false); if (view !== 'catalog') navigate('catalog') }}
        onOpenProduct={openDetail}
        onCheckout={() => {
          if (ordersPaused) return
          setCartOpen(false)
          setCheckoutOpen(true)
        }}
      />

      <CheckoutModal
        open={checkoutOpen}
        cart={cart}
        total={total}
        count={count}
        company={company}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={() => { clear(); refresh() }}
      />

      {openProduct && (
        <ProductDetail
          product={openProduct}
          company={company}
          related={related}
          inCart={quantityOf(openProduct.id)}
          favorite={isFavorite(openProduct.id)}
          ordersPaused={ordersPaused}
          whatsappAllowed={whatsappAllowed}
          onAdd={(product, amount) => addToCart(product, amount, { silent: true })}
          onOpen={openDetail}
          onToggleFavorite={toggleFavorite}
          onClose={closeDetail}
          onViewCart={() => { closeDetail(); setCartOpen(true) }}
        />
      )}
    </div>
  )
}
