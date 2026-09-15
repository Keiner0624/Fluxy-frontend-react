// Catálogo: categorías, búsqueda, orden y filtros.
import { useMemo } from 'react'
import Icon from '@/components/Icon'
import ProductCard from './ProductCard'
import { SORTS, matchesSearch, sortProducts, stockOf } from '../lib/storeFormat'

export default function CatalogView({ products, categories, filters, favorites, onChange, onHome, cardProps }) {
  const { q, sort, available, onlyFavorites } = filters

  const counts = useMemo(() => {
    const map = new Map()
    products.forEach((p) => { if (p.category?.id) map.set(p.category.id, (map.get(p.category.id) || 0) + 1) })
    return map
  }, [products])

  const visibleCategories = categories.filter((c) => counts.get(c.id))
  const activeCategory = categories.find((c) => String(c.id) === String(filters.category))
  // Un enlace viejo con una categoría que ya no existe muestra todo el catálogo.
  const category = activeCategory ? activeCategory.id : null

  const list = useMemo(() => {
    const filtered = products.filter((p) => {
      if (category && String(p.category?.id) !== String(category)) return false
      if (available && stockOf(p) <= 0) return false
      if (onlyFavorites && !favorites.includes(p.id)) return false
      return matchesSearch(p, q || '')
    })
    return sortProducts(filtered, sort)
  }, [products, category, available, onlyFavorites, favorites, q, sort])

  const title = onlyFavorites ? 'Tus favoritos' : activeCategory?.name || (q ? 'Resultados' : 'Productos')
  const hasFilters = Boolean(category || q || available || onlyFavorites)

  return (
    <div className="sf-catalog">
      <nav className="sf-breadcrumb" aria-label="Ubicación">
        <button type="button" onClick={onHome}>Inicio</button>
        <Icon name="chevronRight" size={14} />
        <button type="button" onClick={() => onChange({ category: null, onlyFavorites: false })} aria-current={!activeCategory ? 'page' : undefined}>Productos</button>
        {activeCategory && <><Icon name="chevronRight" size={14} /><span aria-current="page">{activeCategory.name}</span></>}
      </nav>

      <div className="sf-catalog__layout">
        <aside className="sf-filters" aria-label="Filtros">
          <p className="sf-filters__title">Categorías</p>
          <div className="sf-filters__list">
            <button type="button" className={!category && !onlyFavorites ? 'is-active' : ''}
              onClick={() => onChange({ category: null, onlyFavorites: false })}>
              <span className="sf-filters__emoji"><Icon name="grid" size={16} /></span>
              <span className="sf-filters__name">Todos</span>
              <small>{products.length}</small>
            </button>
            {visibleCategories.map((c) => (
              <button type="button" key={c.id} className={String(category) === String(c.id) && !onlyFavorites ? 'is-active' : ''}
                onClick={() => onChange({ category: c.id, onlyFavorites: false })}>
                <span className="sf-filters__emoji">{c.emoji || <Icon name="tag" size={16} />}</span>
                <span className="sf-filters__name">{c.name}</span>
                <small>{counts.get(c.id)}</small>
              </button>
            ))}
            <button type="button" className={onlyFavorites ? 'is-active' : ''} onClick={() => onChange({ onlyFavorites: !onlyFavorites, category: null })}>
              <span className="sf-filters__emoji"><Icon name="heart" size={16} /></span>
              <span className="sf-filters__name">Favoritos</span>
              <small>{favorites.length}</small>
            </button>
          </div>
          <label className="sf-switch">
            <input type="checkbox" checked={Boolean(available)} onChange={(e) => onChange({ available: e.target.checked })} />
            <span className="sf-switch__track" aria-hidden="true" />
            Solo con stock
          </label>
        </aside>

        <section className="sf-catalog__main" aria-labelledby="sf-catalog-title">
          <div className="sf-catalog__head">
            <div>
              <h1 id="sf-catalog-title">{title}</h1>
              <p>{list.length} {list.length === 1 ? 'producto' : 'productos'}{q ? ` para “${q}”` : ''}</p>
            </div>
            <div className="sf-catalog__tools">
              <label className="sf-inline-search">
                <Icon name="search" size={16} />
                <input type="search" value={q || ''} placeholder="Buscar en el catálogo" aria-label="Buscar en el catálogo"
                  onChange={(e) => onChange({ q: e.target.value }, { replace: true })} />
              </label>
              <label className="sf-select">
                <span className="sr-only">Ordenar por</span>
                <select value={sort || 'featured'} onChange={(e) => onChange({ sort: e.target.value })}>
                  {Object.entries(SORTS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
                </select>
                <Icon name="chevronDown" size={15} />
              </label>
            </div>
          </div>

          {hasFilters && (
            <div className="sf-active-filters">
              {activeCategory && <button type="button" onClick={() => onChange({ category: null })}>{activeCategory.name} <Icon name="close" size={13} /></button>}
              {q && <button type="button" onClick={() => onChange({ q: '' })}>“{q}” <Icon name="close" size={13} /></button>}
              {available && <button type="button" onClick={() => onChange({ available: false })}>Con stock <Icon name="close" size={13} /></button>}
              {onlyFavorites && <button type="button" onClick={() => onChange({ onlyFavorites: false })}>Favoritos <Icon name="close" size={13} /></button>}
              <button type="button" className="sf-link" onClick={() => onChange({ category: null, q: '', available: false, onlyFavorites: false })}>Limpiar todo</button>
            </div>
          )}

          {list.length === 0 ? (
            <div className="sf-empty">
              <span className="sf-empty__icon"><Icon name={onlyFavorites ? 'heart' : 'search'} size={28} /></span>
              <strong>{onlyFavorites ? 'Todavía no guardaste favoritos' : 'No encontramos productos'}</strong>
              <p>{onlyFavorites ? 'Tocá el corazón de un producto para tenerlo a mano.' : 'Probá con otra palabra o quitá algún filtro.'}</p>
              {hasFilters && <button type="button" className="sf-btn sf-btn--ghost" onClick={() => onChange({ category: null, q: '', available: false, onlyFavorites: false })}>Ver todo el catálogo</button>}
            </div>
          ) : (
            <div className="sf-grid sf-grid--catalog">
              {list.map((product) => <ProductCard key={product.id} product={product} {...cardProps(product)} />)}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
