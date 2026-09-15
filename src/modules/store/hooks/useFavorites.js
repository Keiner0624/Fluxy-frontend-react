// src/modules/store/hooks/useFavorites.js
// Favoritos del comprador, guardados por tienda en su navegador.
import { useCallback, useEffect, useState } from 'react'

const key = (slug) => `fluxy_favorites_${slug}`

function read(slug) {
  if (!slug) return []
  try {
    const saved = JSON.parse(localStorage.getItem(key(slug)) || '[]')
    return Array.isArray(saved) ? saved.filter((id) => Number.isFinite(id)) : []
  } catch {
    return []
  }
}

export function useFavorites(slug) {
  const [ids, setIds] = useState(() => read(slug))

  useEffect(() => { setIds(read(slug)) }, [slug])

  const toggle = useCallback((productId) => {
    setIds((prev) => {
      const next = prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
      try { localStorage.setItem(key(slug), JSON.stringify(next)) } catch { /* solo en esta visita */ }
      return next
    })
  }, [slug])

  return { favorites: ids, isFavorite: (id) => ids.includes(id), toggle }
}
