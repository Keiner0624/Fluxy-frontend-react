import { useParams, useSearchParams } from 'react-router-dom'

export default function StorePage() {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const slug = searchParams.get('store') || params.slug || ''

  return (
    <div style={{ color: 'white', padding: 40 }}>
      {slug ? `Tienda ${slug} — próximamente` : 'Tienda — próximamente'}
    </div>
  )
}
