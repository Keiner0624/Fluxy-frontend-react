import { useEffect, useState } from 'react'

/** Cuenta regresiva para reenviar un código. */
export default function useCountdown(seconds) {
  const [left, setLeft] = useState(seconds)
  useEffect(() => {
    if (left <= 0) return undefined
    const timer = setTimeout(() => setLeft((s) => s - 1), 1000)
    return () => clearTimeout(timer)
  }, [left])
  return [left, setLeft]
}
