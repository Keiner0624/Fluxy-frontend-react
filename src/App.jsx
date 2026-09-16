import { RouterProvider } from 'react-router-dom'
import { router } from './app/router'
import CookieConsent from './components/CookieConsent'

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <CookieConsent />
    </>
  )
}
