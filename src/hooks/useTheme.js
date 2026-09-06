// src/hooks/useTheme.js
import { useCallback, useState } from 'react'
import { flushSync } from 'react-dom'
import { getStoredTheme, applyTheme, prefersReducedMotion } from '@/app/theme'

const DURATION = 480

/**
 * Tema del panel con la transición de revelado circular: un círculo crece
 * desde el punto donde se pulsó, como el cambio de tema de Telegram.
 *
 * Se apoya en la View Transitions API. Donde no exista, o si el usuario pidió
 * menos movimiento, el cambio es instantáneo.
 */
export function useTheme() {
  const [theme, setTheme] = useState(getStoredTheme)

  const toggleTheme = useCallback((event) => {
    const next = theme === 'dark' ? 'light' : 'dark'

    const commit = () => {
      applyTheme(next)
      setTheme(next)
    }

    // Con el documento oculto el navegador no ejecuta el callback de la
    // transición, así que el tema se aplica directamente.
    const canAnimate = typeof document.startViewTransition === 'function'
      && !prefersReducedMotion()
      && document.visibilityState === 'visible'

    if (!canAnimate) {
      commit()
      return
    }

    // Origen del círculo: el botón pulsado, o el centro como respaldo.
    const rect = event?.currentTarget?.getBoundingClientRect()
    const x = rect ? rect.left + rect.width  / 2 : window.innerWidth  / 2
    const y = rect ? rect.top  + rect.height / 2 : window.innerHeight / 2

    // Radio necesario para cubrir la esquina más lejana.
    const endRadius = Math.hypot(
      Math.max(x, window.innerWidth  - x),
      Math.max(y, window.innerHeight - y),
    )

    const root = document.documentElement
    root.dataset.themeAnim = next

    const transition = document.startViewTransition(() => {
      flushSync(commit)
    })

    // Si el navegador descarta la transición, el tema igual debe cambiar.
    transition.updateCallbackDone.catch(() => { commit() })

    transition.ready.then(() => {
      const from = `circle(0px at ${x}px ${y}px)`
      const to   = `circle(${endRadius}px at ${x}px ${y}px)`

      // Al ir a oscuro, el tema nuevo crece por encima.
      // Al volver a claro, el oscuro se encoge y deja ver el claro debajo,
      // que es como se siente el cambio inverso en Telegram.
      const goingDark = next === 'dark'

      root.animate(
        { clipPath: goingDark ? [from, to] : [to, from] },
        {
          duration: DURATION,
          easing: 'cubic-bezier(.4, 0, .2, 1)',
          pseudoElement: goingDark
            ? '::view-transition-new(root)'
            : '::view-transition-old(root)',
        },
      )
    })
    .catch(() => { /* transición descartada: sin animación, el tema ya cambió */ })

    transition.finished
      .catch(() => {})
      .finally(() => { delete root.dataset.themeAnim })
  }, [theme])

  return { theme, toggleTheme }
}

export default useTheme
