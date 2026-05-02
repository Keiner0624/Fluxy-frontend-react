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
const PENDING_PLAN_KEY = 'fluxy_pending_plan_checkout'

function StoreRoute() {
  const { slug } = useParams()
  return <App slugFromRoute={slug} />
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

  const plan = searchParams.get('plan') || localStorage.getItem(PENDING_PLAN_KEY) || ''
  const targetParams = new URLSearchParams({ payment: normalizedStatus })

  if (plan) targetParams.set('plan', plan)

  return <Navigate to={`/dashboard?${targetParams.toString()}`} replace />
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
