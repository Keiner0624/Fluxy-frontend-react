// src/modules/store/hooks/useCart.js
// Carrito de la tienda. Se guarda por tienda en el navegador: recargar la
// página o volver más tarde no hace perder el pedido armado.
import { useEffect, useMemo, useState } from 'react'
import { stockOf } from '../lib/storeFormat'

const key = (slug) => `fluxy_cart_${slug}`

function readCart(slug) {
  if (!slug) return []
  try {
    const saved = JSON.parse(localStorage.getItem(key(slug)) || '[]')
    return Array.isArray(saved) ? saved.filter((i) => i?.product?.id && i.quantity > 0) : []
  } catch {
    return []
  }
}

export function useCart(slug, products) {
  const [cart, setCart] = useState(() => readCart(slug))

  useEffect(() => { setCart(readCart(slug)) }, [slug])

  useEffect(() => {
    if (!slug) return
    try {
      localStorage.setItem(key(slug), JSON.stringify(cart.map(({ product, quantity }) => ({
        quantity,
        product: { id: product.id, name: product.name, price: product.price, stock: product.stock, imageUrl: product.imageUrl },
      }))))
    } catch {
      // Sin almacenamiento el carrito sigue funcionando en esta visita.
    }
  }, [slug, cart])

  // Con el catálogo cargado, el carrito guardado toma precio y stock actuales.
  useEffect(() => {
    if (!products?.length) return
    const byId = new Map(products.map((p) => [p.id, p]))
    setCart((prev) => {
      const next = prev
        .filter((item) => byId.has(item.product.id))
        .map((item) => {
          const product = byId.get(item.product.id)
          return { product, quantity: Math.min(item.quantity, stockOf(product)) }
        })
        .filter((item) => item.quantity > 0)
      const same = next.length === prev.length && next.every((item, i) =>
        item.quantity === prev[i].quantity && item.product.price === prev[i].product.price && item.product.stock === prev[i].product.stock)
      return same ? prev : next
    })
  }, [products])

  const setQuantity = (product, quantity) => {
    const stock = stockOf(product)
    setCart((prev) => {
      const wanted = Math.max(0, Math.min(stock, quantity))
      const exists = prev.some((i) => i.product.id === product.id)
      if (wanted === 0) return prev.filter((i) => i.product.id !== product.id)
      if (exists) return prev.map((i) => (i.product.id === product.id ? { ...i, quantity: wanted } : i))
      return [...prev, { product, quantity: wanted }]
    })
  }

  const quantityOf = (productId) => cart.find((i) => i.product.id === productId)?.quantity || 0
  const add = (product, amount = 1) => setQuantity(product, quantityOf(product.id) + amount)
  const remove = (productId) => setCart((prev) => prev.filter((i) => i.product.id !== productId))
  const clear = () => setCart([])

  const totals = useMemo(() => ({
    total: cart.reduce((sum, i) => sum + Number(i.product.price || 0) * i.quantity, 0),
    count: cart.reduce((sum, i) => sum + i.quantity, 0),
  }), [cart])

  return { cart, add, setQuantity, quantityOf, remove, clear, ...totals }
}
