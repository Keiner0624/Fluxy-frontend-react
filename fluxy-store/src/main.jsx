import ReactDOM from 'react-dom/client'
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import App from './App'
import './index.css'

function StoreRoute() {
  const { slug } = useParams()
  return <App slugFromRoute={slug} />
}

function buildFallbackStoreParam(searchParams) {
  const directStore = searchParams.get('store')
  if (directStore) return directStore

  const externalReference = searchParams.get('external_reference')
  if (externalReference) return externalReference

  if (typeof window !== 'undefined') {
    try {
      const company = JSON.parse(localStorage.getItem('company') || '{}') || {}
      if (company.slug) return company.slug
    } catch {
      return ''
    }
  }

  return ''
}

function PaymentReturnRoute() {
  const { status: statusFromPath } = useParams()
  const [searchParams] = useSearchParams()

  const rawStatus = searchParams.get('payment')
    || searchParams.get('status')
    || searchParams.get('collection_status')
    || statusFromPath
    || 'pending'

  const normalizedStatus = {
    approved: 'success',
    rejected: 'failure',
    cancelled: 'failure',
    in_process: 'pending',
    in_mediation: 'pending',
  }[rawStatus] || rawStatus

  const store = buildFallbackStoreParam(searchParams)
  const targetParams = new URLSearchParams({ payment: normalizedStatus })

  if (store) targetParams.set('store', store)

  return <Navigate to={`/?${targetParams.toString()}`} replace />
}

const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/store/:slug', element: <StoreRoute /> },
  { path: '/payment/:status', element: <PaymentReturnRoute /> },
  { path: '/payments/:status', element: <PaymentReturnRoute /> },
  { path: '/dashboard', element: <PaymentReturnRoute /> },
  { path: '*', element: <App /> },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
