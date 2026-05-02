import { useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import FluxyStoreApp from '../../../../fluxy-store/src/App.jsx'

export default function StorePage() {
  const { slug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    if (!slug) return
    if (searchParams.get('store') === slug) return

    const next = new URLSearchParams(searchParams)
    next.set('store', slug)
    setSearchParams(next, { replace: true })
  }, [slug, searchParams, setSearchParams])

  console.log('[StorePage] Rendering with slug:', slug)

  return <FluxyStoreApp slugFromRoute={slug} />
}
