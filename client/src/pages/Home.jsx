import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { readCache, writeCache } from '../cache'
import { FALLBACK_IMG } from '../utils'
import ProductCard from '../components/ProductCard'

const PRODUCTS_KEY = 'home:products'
const CATEGORIES_KEY = 'home:categories'

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialCat = searchParams.get('cat') || 'All'
  const [filter, setFilter] = useState(initialCat)
  // Seed from cache so navigation back to Home shows products instantly.
  const cachedProducts = readCache(PRODUCTS_KEY)?.data
  const cachedCategories = readCache(CATEGORIES_KEY)?.data
  const [products, setProducts] = useState(cachedProducts || [])
  const [categories, setCategories] = useState(cachedCategories || [])
  const [loading, setLoading] = useState(!cachedProducts)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    // Stale-while-revalidate: render from cache (above), but still fetch fresh
    // data in the background and silently update if it changed.
    Promise.all([api.listProducts(), api.listCategories()])
      .then(([rows, cats]) => {
        if (cancelled) return
        setProducts(rows)
        setCategories(cats)
        writeCache(PRODUCTS_KEY, rows)
        writeCache(CATEGORIES_KEY, cats)
        setError('')
      })
      .catch((err) => {
        if (cancelled) return
        // If we already have cached data on screen, don't surface a fetch error.
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

  const categoryNames = useMemo(() => ['All', ...categories.map((c) => c.name)], [categories])

  useEffect(() => {
    if (filter === 'All') {
      searchParams.delete('cat')
    } else {
      searchParams.set('cat', filter)
    }
    setSearchParams(searchParams, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const filtered = useMemo(
    () => (filter === 'All' ? products : products.filter((p) => p.category === filter)),
    [filter, products],
  )

  return (
    <main>
      <section className="hero">
        <div className="hero-card">
          <div className="hero-text">
            <span className="hero-eyebrow">Summer Drop · 2026</span>
            <h1 className="hero-title">
              Bags built for <em>every journey.</em>
            </h1>
            <p className="hero-sub">
              Handcrafted leather totes, sturdy school packs, and travel-ready duffels.
              Free shipping on orders over ₹2,000.
            </p>
            <div className="hero-actions">
              <Link to="/?cat=All#shop" className="btn btn-primary">
                Shop the Collection
              </Link>
              <Link to="/?cat=Handbags#shop" className="btn btn-ghost">
                View New Arrivals
              </Link>
            </div>
          </div>
          <div className="hero-image">
            <img
              src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80"
              alt="Featured handbag"
              onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
            />
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Customer benefits">
        <div className="trust-item">
          <span className="trust-icon">⛟</span>
          <div>
            <strong>Free Shipping</strong>
            On orders over ₹2,000
          </div>
        </div>
        <div className="trust-item">
          <span className="trust-icon">↺</span>
          <div>
            <strong>30-Day Returns</strong>
            Easy & hassle-free
          </div>
        </div>
        <div className="trust-item">
          <span className="trust-icon">★</span>
          <div>
            <strong>2-Year Warranty</strong>
            Built to last
          </div>
        </div>
        <div className="trust-item">
          <span className="trust-icon">♥</span>
          <div>
            <strong>Loved by 50k+</strong>
            4.8/5 average rating
          </div>
        </div>
      </section>

      <section className="section" id="shop">
        <div className="section-head">
          <div>
            <h2 className="section-title">Featured Bags</h2>
            <p className="section-sub">
              Hand-picked styles for school, work, and weekend escapes.
            </p>
          </div>
          <div className="filter-bar" role="tablist" aria-label="Filter by category">
            {categoryNames.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={filter === cat}
                className={`filter-pill ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p style={{ color: 'var(--muted)', padding: '24px 0' }}>Loading bags…</p>
        ) : filtered.length === 0 ? (
          <p style={{ color: 'var(--muted)', padding: '24px 0' }}>
            No bags found{filter !== 'All' ? ` in ${filter}` : ''}.
          </p>
        ) : (
          <div className="product-grid">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
        {error && (
          <p style={{ color: '#c0392b', marginTop: 12, fontSize: 13 }}>⚠ {error}</p>
        )}
      </section>

    </main>
  )
}
