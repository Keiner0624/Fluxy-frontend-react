// src/components/Icon.jsx
// Set de iconos de línea. Reemplaza los emojis que se usaban antes.
// Uso: <Icon name="orders" size={18} />

const PATHS = {
  // Navegación
  overview:   <><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></>,
  products:   <><path d="m21 8-9-5-9 5v8l9 5 9-5z"/><path d="m3 8 9 5 9-5"/><path d="M12 13v8"/></>,
  orders:     <><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></>,
  metrics:    <><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="m7 15 4-5 3 3 4-6"/></>,
  plans:      <><path d="M12 2 4 6v6c0 5 3.4 8.9 8 10 4.6-1.1 8-5 8-10V6z"/><path d="m9 12 2 2 4-4"/></>,
  coupons:    <><path d="M3 9V6a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v3a2.5 2.5 0 0 0 0 5v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a2.5 2.5 0 0 0 0-5z"/><path d="M13 6v2"/><path d="M13 11v2"/><path d="M13 16v2"/></>,
  settings:   <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2 2 2 0 1 1-4 0 1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 15a2 2 0 1 1 0-4 1.7 1.7 0 0 0 1.2-2.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 10 4.6a2 2 0 1 1 4 0 1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 21 11a2 2 0 1 1 0 4z"/></>,
  style:      <><circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2a10 10 0 0 0 0 20 2 2 0 0 0 2-2 2 2 0 0 1 2-2h2a4 4 0 0 0 4-4 10 10 0 0 0-10-10z"/></>,
  store:      <><path d="M3 9h18l-1.5-5H4.5z"/><path d="M4 9v11h16V9"/><path d="M9 20v-6h6v6"/></>,

  // Acciones
  plus:       <><path d="M12 5v14"/><path d="M5 12h14"/></>,
  edit:       <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z"/></>,
  trash:      <><path d="M3 6h18"/><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M10 11v6"/><path d="M14 11v6"/></>,
  search:     <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/></>,
  close:      <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>,
  check:      <><path d="M20 6 9 17l-5-5"/></>,
  copy:       <><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
  download:   <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/></>,
  upload:     <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m17 8-5-5-5 5"/><path d="M12 3v12"/></>,
  image:      <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-4.6-4.6a2 2 0 0 0-2.8 0L4 20"/></>,
  refresh:    <><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 3v6h-6"/></>,
  filter:     <><path d="M3 5h18"/><path d="M7 12h10"/><path d="M11 19h2"/></>,

  // Dirección
  chevronDown:  <><path d="m6 9 6 6 6-6"/></>,
  chevronRight: <><path d="m9 6 6 6-6 6"/></>,
  arrowLeft:    <><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></>,
  arrowRight:   <><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></>,
  arrowUp:      <><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></>,
  arrowDown:    <><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></>,
  external:     <><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></>,
  menu:         <><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></>,

  // Cuenta
  user:       <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
  mail:       <><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></>,
  lock:       <><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  eye:        <><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></>,
  eyeOff:     <><path d="M10.7 5.1A9.9 9.9 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-2.8 3.7"/><path d="M6.3 6.3A17 17 0 0 0 2 12s3.6 7 10 7a9.7 9.7 0 0 0 5.1-1.4"/><path d="m2 2 20 20"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></>,
  logout:     <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></>,

  // Estado
  alert:      <><circle cx="12" cy="12" r="9"/><path d="M12 8v5"/><path d="M12 16.5h.01"/></>,
  info:       <><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><path d="M12 7.5h.01"/></>,
  checkCircle:<><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/></>,
  clock:      <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  inbox:      <><path d="M21 12h-6l-2 3h-2l-2-3H3"/><path d="M5.4 5.1 3 12v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6l-2.4-6.9A2 2 0 0 0 16.7 4H7.3a2 2 0 0 0-1.9 1.1z"/></>,

  // Negocio
  card:       <><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></>,
  money:      <><circle cx="12" cy="12" r="9"/><path d="M15 9.5a3 3 0 0 0-3-1.5c-1.7 0-2.5.9-2.5 2s1 1.7 2.5 2 2.5.7 2.5 2-1 2-2.5 2A3 3 0 0 1 9 14.5"/><path d="M12 6.5v11"/></>,
  bell:       <><path d="M18 8a6 6 0 1 0-12 0c0 6-3 7-3 7h18s-3-1-3-7"/><path d="M10.3 21a2 2 0 0 0 3.4 0"/></>,
  phone:      <><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/></>,
  mapPin:     <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="2.5"/></>,
  message:    <><path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.7-5.1A8 8 0 1 1 21 15z"/></>,
  package:    <><path d="m21 8-9-5-9 5 9 5z"/><path d="m3 8 9 5 9-5"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></>,
  building:   <><path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16"/><path d="M15 9h2a2 2 0 0 1 2 2v10"/><path d="M3 21h18"/><path d="M9 7h2"/><path d="M9 11h2"/><path d="M9 15h2"/></>,
  tag:        <><path d="M12.6 2.6a2 2 0 0 0-1.4-.6H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.2 8.2a2 2 0 0 0 2.8 0l7.2-7.2a2 2 0 0 0 0-2.8z"/><path d="M7 7h.01"/></>,
  truck:      <><path d="M14 17V5a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h1"/><path d="M14 8h4.6a1 1 0 0 1 .8.4L22 12v4a1 1 0 0 1-1 1h-1"/><circle cx="6" cy="17.5" r="2"/><circle cx="17" cy="17.5" r="2"/></>,
  shield:     <><path d="M12 2 4 6v6c0 5 3.4 8.9 8 10 4.6-1.1 8-5 8-10V6z"/></>,
  file:       <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></>,

  // Tema
  sun:        <><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.9 4.9 1.4 1.4"/><path d="m17.7 17.7 1.4 1.4"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.9 19.1 1.4-1.4"/><path d="m17.7 6.3 1.4-1.4"/></>,
  moon:       <><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></>,
}

export default function Icon({ name, size = 16, strokeWidth = 1.7, style, className }) {
  const path = PATHS[name]
  if (!path) return null

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ flexShrink: 0, display: 'block', ...style }}
    >
      {path}
    </svg>
  )
}
