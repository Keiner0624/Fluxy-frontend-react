import Icon from '@/components/Icon'

export default function CategoryPanel({ categories = [], selected, onSelect }) {
  if (!categories.length) return null

  return (
    <aside className="store-categories" aria-label="Categorías del catálogo">
      <div className="store-categories__heading">
        <span>Categorías</span>
        <small>{categories.length}</small>
      </div>
      <div className="store-categories__list">
        <button
          type="button"
          className={!selected ? 'is-active' : ''}
          onClick={() => onSelect(null)}
          aria-pressed={!selected}
        >
          <Icon name="store" size={16} />
          <span>Todos los productos</span>
        </button>
        {categories.map(category => (
          <button
            type="button"
            key={category.id}
            className={selected === category.id ? 'is-active' : ''}
            onClick={() => onSelect(category.id)}
            aria-pressed={selected === category.id}
          >
            <Icon name="tag" size={16} />
            <span>{category.name}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
