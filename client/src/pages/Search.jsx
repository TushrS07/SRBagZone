import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts } from '../hooks/useProducts'
import { useDebounce } from '../hooks/useDebounce'
import { searchProducts } from '../utils'
import ProductCard from '../components/ProductCard'
import ProductGridSkeleton from '../components/ProductCardSkeleton'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('q') || '')
  const debounced = useDebounce(query, 250)
  const { products, loading } = useProducts()
  const inputRef = useRef(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Keep the URL's ?q in sync with the debounced query (shareable / back-button).
  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    const q = debounced.trim()
    if (q) next.set('q', q)
    else next.delete('q')
    setSearchParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced])

  const results = useMemo(() => searchProducts(products, debounced), [products, debounced])
  const trimmed = debounced.trim()

  return (
    <main className="max-w-[1240px] mx-auto mt-10 px-7 pb-24 max-tablet:mt-8 max-tablet:px-[22px] max-sm:mt-6 max-sm:px-4 max-sm:pb-16">
      <h1 className="font-serif text-[42px] font-medium m-0 tracking-[-0.5px] max-sm:text-[30px]">Search</h1>

      {/* Search field */}
      <div className="relative mt-5 max-w-[560px]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search bags, categories…"
          aria-label="Search products"
          autoComplete="off"
          className="w-full pl-11 pr-4 py-3.5 border border-line rounded-full bg-surface text-[15px] text-ink outline-none transition-colors focus:border-accent"
        />
      </div>

      <p className="text-muted text-sm mt-5" aria-live="polite">
        {trimmed === ''
          ? 'Type above to search the collection.'
          : `${results.length} result${results.length === 1 ? '' : 's'} for “${trimmed}”`}
      </p>

      <div className="mt-6">
        {loading && trimmed !== '' ? (
          <ProductGridSkeleton count={8} />
        ) : trimmed !== '' && results.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-serif text-[24px] text-ink mb-1">No matches</p>
            <p className="text-muted text-sm">Try a different name, category, or keyword.</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-4 gap-[22px] max-lg:grid-cols-3 max-sm:grid-cols-2 max-sm:gap-3 max-xs:grid-cols-1">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : null}
      </div>
    </main>
  )
}
