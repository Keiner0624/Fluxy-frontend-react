import { useCallback, useEffect, useState } from 'react'
import { getCategories, getCompanyInfo, getProducts } from '@/modules/store/api/storeApi'

/** Tienda, catálogo y categorías de un slug. */
export function useStore(slug) {
  const [company, setCompany] = useState(null)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return undefined
    let active = true
    setLoading(true)
    setError(null)

    Promise.all([getCompanyInfo(slug), getProducts(slug), getCategories(slug).catch(() => [])])
      .then(([info, items, cats]) => {
        if (!active) return
        setCompany(info)
        setProducts(Array.isArray(items) ? items : [])
        setCategories(Array.isArray(cats) ? cats : [])
      })
      .catch((e) => {
        if (!active) return
        setCompany(null)
        setProducts([])
        setCategories([])
        setError(e.message)
      })
      .finally(() => { if (active) setLoading(false) })

    return () => { active = false }
  }, [slug])

  /** Actualiza stock y precios sin volver a mostrar la carga (por ejemplo, después de un pedido). */
  const refresh = useCallback(async () => {
    if (!slug) return
    try {
      const items = await getProducts(slug)
      setProducts(Array.isArray(items) ? items : [])
    } catch {
      // Se conserva el catálogo que ya se veía.
    }
  }, [slug])

  return { company, products, categories, loading, error, refresh }
}
