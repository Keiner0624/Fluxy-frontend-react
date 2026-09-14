// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/globals.css'
import './styles/app.css'
import { initTheme } from './app/theme'
import { installSessionInterceptor } from './app/session'

// Antes del primer render: evita que la página aparezca en claro y salte a oscuro.
initTheme()
// Renueva la sesión y reintenta ante un 401 en todas las llamadas al backend.
installSessionInterceptor()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
