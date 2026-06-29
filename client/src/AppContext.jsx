import { createContext, useEffect, useMemo, useState } from 'react'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from './utils'

// eslint-disable-next-line react-refresh/only-export-components
export const AppCtx = createContext(null)

export function AppProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem('srbag_cart')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  const [cartOpen, setCartOpen] = useState(false)
  const [recentlyAdded, setRecentlyAdded] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem('srbag_cart', JSON.stringify(cart))
    } catch {
      // localStorage unavailable, ignore
    }
  }, [cart])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2400)
    return () => clearTimeout(t)
  }, [toast])

  useEffect(() => {
    if (!recentlyAdded) return
    const t = setTimeout(() => setRecentlyAdded(null), 1400)
    return () => clearTimeout(t)
  }, [recentlyAdded])

  useEffect(() => {
    document.body.style.overflow = cartOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [cartOpen])

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i))
      }
      return [...prev, { ...product, qty: 1 }]
    })
    setRecentlyAdded(product.id)
    setToast(`${product.name} added to cart`)
  }

  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    )
  }

  const removeItem = (id) => setCart((prev) => prev.filter((i) => i.id !== id))
  const clearCart = () => setCart([])

  const value = useMemo(() => {
    const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)
    const subtotal = cart.reduce((sum, i) => sum + i.qty * i.price, 0)
    const shipping =
      subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
    const total = subtotal + shipping
    return {
      cart,
      cartCount,
      subtotal,
      shipping,
      total,
      cartOpen,
      setCartOpen,
      recentlyAdded,
      toast,
      setToast,
      addToCart,
      changeQty,
      removeItem,
      clearCart,
    }
     
  }, [cart, cartOpen, recentlyAdded, toast])

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}
