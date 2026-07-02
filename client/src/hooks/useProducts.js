import { useEffect, useState } from 'react'
import { api } from '../api'
import { readCache, writeCache } from '../cache'

// Shares the same cache key Home uses, so search reuses already-loaded products.
const PRODUCTS_KEY = 'home:products'

/**
 * Stale-while-revalidate loader for the full active-product list. Returns
 * cached products immediately (if present) and refreshes in the background.
 */
export function useProducts() {
  const cached = readCache(PRODUCTS_KEY)?.data
  const [products, setProducts] = useState(cached || [])
  const [loading, setLoading] = useState(!cached)

  useEffect(() => {
    let cancelled = false
    api
      .listProducts()
      .then((rows) => {
        if (cancelled) return
        setProducts(rows)
        writeCache(PRODUCTS_KEY, rows)
      })
      .catch(() => {
        /* keep cached/empty list on error */
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { products, loading }
}
