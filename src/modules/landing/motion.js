// src/modules/landing/motion.js
// Movimiento del landing: intro de entrada (una vez por sesión) y aparición de secciones al hacer scroll.
import { useEffect } from 'react'

const INTRO_KEY = 'fluxy_intro_played'

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)

/** intro: animación completa · enter: solo la entrada del hero · done: sin animación. */
export function initialPhase() {
  if (typeof window === 'undefined' || prefersReducedMotion()) return 'done'
  try {
    return sessionStorage.getItem(INTRO_KEY) ? 'enter' : 'intro'
  } catch {
    return 'enter'
  }
}

export function markIntroPlayed() {
  try { sessionStorage.setItem(INTRO_KEY, '1') } catch { /* sin almacenamiento: se vuelve a mostrar */ }
}

/** Las secciones aparecen al hacer scroll solo si el navegador puede avisar cuándo entran en pantalla. */
export const canReveal = () =>
  typeof window !== 'undefined' && 'IntersectionObserver' in window && !prefersReducedMotion()

/**
 * Agrega is-revealed a cada [data-reveal] cuando entra en pantalla. La clase can-reveal la pone
 * el componente según canReveal(): sin ella el contenido se ve desde el inicio.
 */
export function useReveal(rootRef, enabled) {
  useEffect(() => {
    const root = rootRef.current
    if (!root || !enabled) return undefined
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-revealed')
        observer.unobserve(entry.target)
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 })
    root.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [rootRef, enabled])
}
