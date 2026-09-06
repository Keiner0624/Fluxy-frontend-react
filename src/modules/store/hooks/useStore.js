import { useEffect, useState } from 'react'
import { getCompanyInfo, getProducts } from '@/modules/store/api/storeApi'

export function useStore(slug) {
  const [company, setCompany] = useState(null)
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return
    let active = true

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const [comp, prods] = await Promise.all([
          getCompanyInfo(slug),
          getProducts(slug),
        ])
        if (!active) return
        setCompany(comp)
        setProducts(Array.isArray(prods) ? prods : [])
      } catch (e) {
        if (active) {
          setCompany(null)
          setProducts([])
          setError(e.message)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => { active = false }
  }, [slug])

  const reload = async () => {
    if (!slug) return
    setLoading(true)
    setError(null)
    try {
      const refreshedProducts = await getProducts(slug)
      setProducts(Array.isArray(refreshedProducts) ? refreshedProducts : [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return { company, products, loading, error, reload }
}
