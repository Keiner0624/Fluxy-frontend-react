// src/app/theme.js
// Tema claro/oscuro del panel. Se guarda por usuario en localStorage y se
// aplica como atributo data-theme en <html>, de donde cuelgan los tokens
// de styles/app.css.

const STORAGE_KEY = 'fluxy_theme'

export const THEMES = ['light', 'dark']

function systemPrefersDark() {
  return typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-color-scheme: dark)').matches
}

/** Tema guardado, o la preferencia del sistema si nunca eligió. */
export function getStoredTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (THEMES.includes(saved)) return saved
  } catch { /* localStorage no disponible */ }
  return systemPrefersDark() ? 'dark' : 'light'
}

export function applyTheme(theme) {
  const next = THEMES.includes(theme) ? theme : 'light'
  document.documentElement.dataset.theme = next
  try { localStorage.setItem(STORAGE_KEY, next) } catch { /* sin persistencia */ }
  return next
}

/**
 * Se llama antes del primer render para que la página no aparezca en claro
 * y salte a oscuro.
 */
export function initTheme() {
  const theme = getStoredTheme()
  document.documentElement.dataset.theme = theme
  return theme
}

export function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}
