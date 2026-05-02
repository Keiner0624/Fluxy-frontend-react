// src/app/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom'

export default function ProtectedRoute({ children }) {
  const token   = localStorage.getItem('token')
  const company = localStorage.getItem('company')

  if (!token || !company) {
    return <Navigate to="/login" replace />
  }

  return children
}