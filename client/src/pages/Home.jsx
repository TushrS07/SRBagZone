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
      <section className="max-w-[1240px] mx-auto mt-10 px-7 max-sm:px-4 max-sm:mt-5">
        <div className="relative rounded-lg overflow-hidden bg-[linear-gradient(120deg,#1a1612_0%,#2d231a_60%,#4a3522_100%)] text-white grid grid-cols-[1.1fr_1fr] min-h-[440px] shadow-md max-lg:grid-cols-1 max-sm:rounded-[18px]">
          <div className="p-16 pb-14 px-14 flex flex-col justify-center gap-[22px] max-lg:px-9 max-lg:py-10 max-sm:px-[22px] max-sm:py-7 max-sm:pb-8 max-sm:gap-4">
            <span className="text-[13px] tracking-[3px] uppercase text-accent-soft font-semibold">Summer Drop · 2026</span>
            <h1 className="font-serif text-[62px] leading-[1.05] m-0 font-medium tracking-[-0.5px] max-lg:text-[46px] max-sm:text-[34px] max-xs:text-[30px]">
              Bags built for <em>every journey.</em>
            </h1>
            <p className="text-[17px] text-[#d8cfc4] max-w-[440px] leading-[1.55] max-sm:text-[15px]">
              Handcrafted leather totes, sturdy school packs, and travel-ready duffels.
              Free shipping on orders over ₹2,000.
            </p>
            <div className="flex gap-[14px] mt-1.5 max-sm:flex-col max-sm:gap-[10px]">
              <Link to="/?cat=All#shop" className="py-[14px] px-[26px] rounded-full text-[14.5px] font-semibold tracking-[0.3px] transition-all bg-accent text-[#ffffff] hover:bg-[#d18638] hover:-translate-y-px max-sm:w-full max-sm:text-center max-sm:py-[13px] max-sm:px-[22px]">
                Shop the Collection
              </Link>
              <Link to="/handbags#shop" className="py-[14px] px-[26px] rounded-full text-[14.5px] font-semibold tracking-[0.3px] transition-all bg-transparent text-[#ffffff] border border-white/30 hover:bg-white/[0.08] max-sm:w-full max-sm:text-center max-sm:py-[13px] max-sm:px-[22px]">
                View New Arrivals
              </Link>
            </div>
          </div>
          <div className="relative overflow-hidden max-lg:h-[300px] max-lg:order-first max-sm:h-[220px]">
            <img
              src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80"
              alt="Featured handbag"
              onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
              className="w-full h-full object-cover scale-[1.05]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(26,22,18,0.5)_0%,transparent_30%)] max-lg:bg-[linear-gradient(180deg,transparent_60%,rgba(26,22,18,0.4)_100%)]" />
          </div>
        </div>
      </section>

      <section className="max-w-[1240px] mx-auto mt-7 px-7 grid grid-cols-4 gap-[14px] max-lg:grid-cols-2 max-sm:grid-cols-1 max-sm:px-4 max-sm:mt-5" aria-label="Customer benefits">
        <div className="bg-surface border border-line rounded-md px-[22px] py-[18px] flex items-center gap-[14px] text-sm text-ink-soft max-sm:px-[18px] max-sm:py-3.5">
          <span className="w-[38px] h-[38px] rounded-[10px] bg-accent-soft text-accent-deep grid place-items-center text-lg shrink-0">⛟</span>
          <div className="flex flex-col gap-0.5">
            <strong className="text-ink font-semibold">Free Shipping</strong>
            <span>On orders over ₹2,000</span>
          </div>
        </div>
        <div className="bg-surface border border-line rounded-md px-[22px] py-[18px] flex items-center gap-[14px] text-sm text-ink-soft max-sm:px-[18px] max-sm:py-3.5">
          <span className="w-[38px] h-[38px] rounded-[10px] bg-accent-soft text-accent-deep grid place-items-center text-lg shrink-0">↺</span>
          <div className="flex flex-col gap-0.5">
            <strong className="text-ink font-semibold">30-Day Returns</strong>
            <span>Easy &amp; hassle-free</span>
          </div>
        </div>
        <div className="bg-surface border border-line rounded-md px-[22px] py-[18px] flex items-center gap-[14px] text-sm text-ink-soft max-sm:px-[18px] max-sm:py-3.5">
          <span className="w-[38px] h-[38px] rounded-[10px] bg-accent-soft text-accent-deep grid place-items-center text-lg shrink-0">★</span>
          <div className="flex flex-col gap-0.5">
            <strong className="text-ink font-semibold">2-Year Warranty</strong>
            <span>Built to last</span>
          </div>
        </div>
        <div className="bg-surface border border-line rounded-md px-[22px] py-[18px] flex items-center gap-[14px] text-sm text-ink-soft max-sm:px-[18px] max-sm:py-3.5">
          <span className="w-[38px] h-[38px] rounded-[10px] bg-accent-soft text-accent-deep grid place-items-center text-lg shrink-0">♥</span>
          <div className="flex flex-col gap-0.5">
            <strong className="text-ink font-semibold">Loved by 50k+</strong>
            <span>4.8/5 average rating</span>
          </div>
        </div>
      </section>

      <section className="max-w-[1240px] mx-auto mt-[70px] px-7 max-tablet:mt-14 max-tablet:px-[22px] max-sm:mt-11 max-sm:px-4" id="shop">
        <div className="flex items-end justify-between gap-6 mb-7 flex-wrap max-tablet:items-start max-tablet:flex-col">
          <div>
            <h2 className="font-serif text-[42px] font-medium m-0 tracking-[-0.5px] max-lg:text-[36px] max-sm:text-[28px] max-xs:text-[26px]">Featured Bags</h2>
            <p className="text-muted text-[15px] mt-1.5 max-sm:text-sm">
              Hand-picked styles for school, work, and weekend escapes.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap max-tablet:w-full max-tablet:overflow-x-auto max-tablet:flex-nowrap max-tablet:pb-1 max-tablet:[scrollbar-width:none] max-tablet:[&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Filter by category">
            {categoryNames.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={filter === cat}
                className={
                  filter === cat
                    ? 'px-[18px] py-[9px] rounded-full border text-[13.5px] font-semibold transition-all max-tablet:shrink-0 bg-ink border-ink text-[#ffffff]'
                    : 'px-[18px] py-[9px] rounded-full border text-[13.5px] font-medium transition-all max-tablet:shrink-0 bg-surface border-line text-ink-soft hover:border-accent hover:text-accent-deep'
                }
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-muted py-6">Loading bags…</p>
        ) : filtered.length === 0 ? (
          <p className="text-muted py-6">
            No bags found{filter !== 'All' ? ` in ${filter}` : ''}.
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-[22px] max-lg:grid-cols-3 max-sm:grid-cols-2 max-sm:gap-3 max-xs:grid-cols-1">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
        {error && (
          <p className="text-danger mt-3 text-[13px]">⚠ {error}</p>
        )}
      </section>

    </main>
  )
}
