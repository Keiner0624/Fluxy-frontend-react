# Fluxy Frontend

Frontend de **Fluxy**, una plataforma SaaS para crear tiendas online de forma simple.  
Esta aplicación permite a los clientes visualizar productos, agregar artículos al carrito y realizar pedidos desde una interfaz web moderna.

El frontend está desarrollado con **React + Vite**.

## Tecnologías utilizadas

- React 19
- Vite 8
- JavaScript
- React Router 7
- react-hot-toast
- CSS
- Vercel

## Características principales

- Landing page de Fluxy
- Vista pública de tienda
- Catálogo de productos
- Detalle de productos
- Carrito de compras
- Creación de pedidos
- Integración con backend en Spring Boot
- Soporte para tiendas por `slug`
- Diseño responsive para móviles y escritorio

## Puesta en marcha

```bash
npm install
```

Copiá `.env.example` a `.env` y ajustá las variables:

| Variable | Descripción |
| --- | --- |
| `VITE_API_URL` | URL del backend. En local: `http://localhost:8080` |
| `VITE_APP_URL` | URL pública de este frontend. En local: `http://localhost:5173` |
| `VITE_CLOUDINARY_CLOUD` | Cloud name de Cloudinary |
| `VITE_CLOUDINARY_PRESET` | Upload preset sin firmar |

```bash
npm run dev
```

## Scripts

| Script | Qué hace |
| --- | --- |
| `npm run dev` | Servidor de desarrollo (puerto 5173) |
| `npm run build` | Build de producción a `dist/` |
| `npm run preview` | Sirve el build de producción |
| `npm run lint` | ESLint sobre todo el proyecto |

## Estructura del proyecto

```
src/
├── app/                  Shell de la aplicación
│   ├── router.jsx        Definición de rutas
│   ├── ProtectedRoute    Guard de sesión
│   ├── config.js         Env vars y helpers de URL
│   ├── authFetch.js      Wrapper de fetch autenticado
│   ├── tokenUtils.js     Manejo de tokens
│   └── NotFoundPage.jsx  404 global
│
├── components/           UI compartida entre módulos
│   ├── BrandLogo.jsx
│   ├── PlanGate.jsx
│   └── Skeleton.jsx
│
├── hooks/                Hooks compartidos
│   ├── useCurrency.js
│   ├── usePlan.js
│   ├── usePushNotifications.js
│   └── useTranslation.js
│
├── modules/              Un directorio por dominio
│   ├── admin/pages/
│   ├── auth/pages/       Login, registro, recuperación de contraseña
│   ├── dashboard/        Panel del vendedor
│   │   ├── components/   DashboardLayout
│   │   └── pages/        Productos, pedidos, métricas, planes, cupones…
│   ├── landing/pages/    Landing pública y términos
│   └── store/            Tienda pública (/store/:slug)
│       ├── api/          storeApi.js
│       ├── components/   Header, Hero, ProductGrid, Cart, Checkout…
│       ├── hooks/        useCart, useStore
│       └── pages/        StorePage
│
├── styles/globals.css    Estilos globales (único CSS importado)
├── App.jsx               Monta el RouterProvider
└── main.jsx              Punto de entrada
```

### Convenciones

- **Alias `@`** → `src/`. Todos los imports entre carpetas usan el alias; los
  relativos (`./`) quedan solo para archivos del mismo directorio.

  ```js
  import BrandLogo from '@/components/BrandLogo'
  import { API_URL } from '@/app/config'
  ```

  Configurado en `vite.config.js` (build) y `jsconfig.json` (autocompletado del IDE).

- **Módulos**: un módulo agrupa `pages/`, y si hace falta sus propios
  `components/`, `hooks/` y `api/`. Si algo lo usan dos o más módulos, sube a
  `src/components/` o `src/hooks/`.

- **Estilos**: inline styles en los componentes; `styles/globals.css` para
  variables CSS, reset y tipografía.
