import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import { readCache, writeCache } from '../cache'
import ProductCard from '../components/ProductCard'
import ProductGridSkeleton from '../components/ProductCardSkeleton'

const PRODUCTS_KEY = 'home:products'

const CATEGORY_META = {
  Handbags: {
    sectionTitle: 'Handbags',
    sectionSub: 'Crafted leather and fabric bags for every mood and moment.',
  },
  Backpacks: {
    sectionTitle: 'Backpacks',
    sectionSub: 'Lightweight yet spacious packs for every adventure.',
  },
  'School Bags': {
    sectionTitle: 'School Bags',
    sectionSub: 'Smart bags that keep students organised all day.',
  },
  Travel: {
    sectionTitle: 'Travel Bags',
    sectionSub: 'Bags that go the distance, just like you.',
  },
}

export default function CategoryPage({ category }) {
  const meta = CATEGORY_META[category] || {}
  const cachedProducts = readCache(PRODUCTS_KEY)?.data
  const [products, setProducts] = useState(cachedProducts || [])
  const [loading, setLoading] = useState(!cachedProducts)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    api
      .listProducts()
      .then((rows) => {
        if (cancelled) return
        setProducts(rows)
        writeCache(PRODUCTS_KEY, rows)
        setError('')
      })
      .catch((err) => {
        if (cancelled) return
        if (!cachedProducts) setError(err.message || 'Could not load products')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(
    () => products.filter((p) => p.category === category),
    [products, category],
  )

  return (
    <main>
      <section className="max-w-[1240px] mx-auto mt-10 px-7 max-tablet:mt-14 max-tablet:px-[22px] max-sm:mt-11 max-sm:px-4" id="shop">
        <div className="flex items-end justify-between gap-6 mb-7 flex-wrap max-tablet:items-start max-tablet:flex-col">
          <div>
            <h2 className="font-serif text-[42px] font-medium m-0 tracking-[-0.5px] max-lg:text-[36px] max-sm:text-[28px] max-xs:text-[26px]">{meta.sectionTitle}</h2>
            <p className="text-muted text-[15px] mt-1.5 max-sm:text-sm">{meta.sectionSub}</p>
          </div>
        </div>

        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : error ? (
          <p style={{ color: '#c0392b', marginTop: 12, fontSize: 13 }}>⚠ {error}</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted py-6">
            No bags found in {meta.sectionTitle}.
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-[22px] max-lg:grid-cols-3 max-sm:grid-cols-2 max-sm:gap-3 max-xs:grid-cols-1">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
