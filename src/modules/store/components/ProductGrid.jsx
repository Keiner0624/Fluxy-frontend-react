import { useMemo, useState } from 'react'
import Icon from '@/components/Icon'
import ProductCard from './ProductCard'
import { useTranslation } from '@/hooks/useTranslation'

function normalizeSearch(value = '') {
  return value
    .toLocaleLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export default function ProductGrid({ products = [], loading, error, onAddToCart, onViewDetail, company, selectedCategory }) {
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const t = useTranslation()

  const byCategory = useMemo(() => {
    if (selectedCategory == null) return products
    return products.filter(product => {
      const categoryId = product.category?.id ?? product.categoryId
      return String(categoryId) === String(selectedCategory)
    })
  }, [products, selectedCategory])

  const availableCount = byCategory.filter(product => Number(product.stock) > 0).length
  const filtered = useMemo(() => {
    const query = normalizeSearch(search.trim())
    return byCategory.filter(product => {
      if (filter === 'available' && Number(product.stock) <= 0) return false
      if (!query) return true
      return normalizeSearch(`${product.name || ''} ${product.description || ''}`).includes(query)
    })
  }, [byCategory, filter, search])

  return (
    <section className="store-catalog" id="products">
      <div className="store-catalog__heading">
        <div>
          <span className="store-section-label">Catálogo</span>
          <h2>Encuentra lo que buscas</h2>
          <p>Explora la selección disponible y agrega tus productos al pedido.</p>
        </div>
        {!loading && products.length > 0 && (
          <div className="store-filter" aria-label="Filtrar productos">
            <button type="button" className={filter === 'all' ? 'is-active' : ''} onClick={() => setFilter('all')}>
              {t.all} <span>{byCategory.length}</span>
            </button>
            <button type="button" className={filter === 'available' ? 'is-active' : ''} onClick={() => setFilter('available')}>
              {t.available} <span>{availableCount}</span>
            </button>
          </div>
        )}
      </div>

      {!loading && products.length > 0 && (
        <label className="store-search">
          <Icon name="search" size={18} />
          <span className="sr-only">Buscar productos</span>
          <input
            type="search"
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder={t.searchPlaceholder}
          />
          {search && (
            <button type="button" onClick={() => setSearch('')} aria-label="Limpiar búsqueda">
              <Icon name="close" size={15} />
            </button>
          )}
        </label>
      )}

      {loading && (
        <div className="store-state" role="status">
          <span className="store-spinner" />
          <strong>Cargando productos</strong>
          <p>Estamos preparando el catálogo.</p>
        </div>
      )}

      {!loading && error && (
        <div className="store-state store-state--error" role="alert">
          <Icon name="alert" size={30} />
          <strong>No pudimos cargar el catálogo</strong>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="store-state">
          <Icon name="package" size={34} />
          <strong>{t.noProductsYet}</strong>
          <p>{t.comingSoon}</p>
        </div>
      )}

      {!loading && !error && products.length > 0 && filtered.length === 0 && (
        <div className="store-state">
          <Icon name="search" size={32} />
          <strong>{search ? `${t.noResults} “${search}”` : 'No hay productos disponibles en esta selección'}</strong>
          <p>{t.tryAnother}</p>
          {(search || filter !== 'all') && (
            <button type="button" className="store-button store-button--secondary" onClick={() => { setSearch(''); setFilter('all') }}>
              {t.seeAll}
            </button>
          )}
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <>
          {search && (
            <p className="store-results-count">
              {filtered.length} {filtered.length === 1 ? t.results : t.results_plural} para “{search}”
            </p>
          )}
          <div className="store-products-grid">
            {filtered.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                index={index}
                company={company}
                onAddToCart={onAddToCart}
                onViewDetail={onViewDetail}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
