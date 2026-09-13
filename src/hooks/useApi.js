// src/hooks/useApi.js
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Carga datos y los recarga cuando cambian las dependencias. Descarta las
 * respuestas viejas: si el usuario cambia un filtro rápido, no pisa el
 * resultado nuevo con uno anterior que llegó tarde.
 */
export default function useApi(loader, deps = [], { enabled = true } = {}) {
  const [state, setState] = useState({ data: null, loading: enabled, error: null })
  const requestId = useRef(0)
  const loaderRef = useRef(loader)
  loaderRef.current = loader

  const run = useCallback(async ({ silent = false } = {}) => {
    const id = ++requestId.current
    if (!silent) setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const data = await loaderRef.current()
      if (id === requestId.current) setState({ data, loading: false, error: null })
      return data
    } catch (error) {
      if (id === requestId.current) setState((prev) => ({ ...prev, loading: false, error }))
      return undefined
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      setState((prev) => ({ ...prev, loading: false }))
      return
    }
    run()
    // Las dependencias las define quien llama.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, ...deps])

  return {
    ...state,
    reload: run,
    refresh: () => run({ silent: true }),
    setData: (updater) => setState((prev) => ({
      ...prev,
      data: typeof updater === 'function' ? updater(prev.data) : updater,
    })),
  }
}

/** Valor que se actualiza después de una pausa, para búsquedas mientras se escribe. */
export function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
