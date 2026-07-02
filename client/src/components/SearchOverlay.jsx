import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from '../hooks/useDebounce'
import { useProducts } from '../hooks/useProducts'
import SmartImage from './SmartImage'
import { searchProducts, formatINR } from '../utils'

const MAX_PREVIEW = 6

export default function SearchOverlay({ open, onClose }) {
  const [query, setQuery] = useState('')
  const debounced = useDebounce(query, 220)
  const { products } = useProducts()
  const navigate = useNavigate()
  const inputRef = useRef(null)

  // Reset query, focus input, and lock page scroll while open.
  useEffect(() => {
    if (!open) return
    setQuery('')
    const t = setTimeout(() => inputRef.current?.focus(), 40)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const results = useMemo(() => searchProducts(products, debounced), [products, debounced])
  const trimmed = debounced.trim()
  const preview = results.slice(0, MAX_PREVIEW)

  const go = (to) => {
    onClose()
    navigate(to)
  }
  const viewAll = (e) => {
    e?.preventDefault()
    if (trimmed) go(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[110]" role="dialog" aria-modal="true" aria-label="Search products">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-[640px] px-4 mt-[13vh] max-sm:mt-0 max-sm:px-0 max-sm:h-full">
        <div className="pdp-media bg-bg rounded-2xl shadow-lg ring-1 ring-line overflow-hidden flex flex-col max-h-[74vh] max-sm:rounded-none max-sm:ring-0 max-sm:max-h-none max-sm:h-full">
          {/* Search field */}
          <form onSubmit={viewAll} className="flex items-center gap-3 px-5 py-4 border-b border-line shrink-0">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted shrink-0" aria-hidden="true">
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
              className="flex-1 min-w-0 bg-transparent outline-none text-[16px] text-ink placeholder:text-muted"
            />
            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="shrink-0 text-[11px] font-semibold uppercase tracking-[1px] text-muted border border-line rounded-md px-2 py-1 hover:text-ink hover:border-ink transition-colors max-sm:text-base max-sm:border-0 max-sm:px-1"
            >
              <span className="max-sm:hidden">Esc</span>
              <span className="hidden max-sm:inline" aria-hidden="true">✕</span>
            </button>
          </form>

          {/* Results */}
          <div className="overflow-y-auto overscroll-contain flex-1">
            {trimmed === '' ? (
              <p className="px-5 py-10 text-center text-muted text-sm">
                Start typing to search the collection.
              </p>
            ) : preview.length === 0 ? (
              <p className="px-5 py-10 text-center text-muted text-sm">
                No bags match “<span className="text-ink-soft font-medium">{trimmed}</span>”.
              </p>
            ) : (
              <ul>
                {preview.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => go(`/product/${p.id}`)}
                      className="w-full flex items-center gap-3.5 px-5 py-3 text-left transition-colors hover:bg-surface"
                    >
                      <SmartImage src={p.image} alt="" className="w-12 h-12 rounded-[10px] shrink-0" />
                      <span className="flex-1 min-w-0">
                        <span className="block font-serif text-[16px] text-ink leading-tight truncate">{p.name}</span>
                        <span className="block text-[11px] text-muted uppercase tracking-[1px] mt-0.5">{p.category}</span>
                      </span>
                      <span className="font-semibold text-[14px] text-ink shrink-0">{formatINR(p.price)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* View-all footer */}
          {trimmed !== '' && results.length > 0 && (
            <button
              type="button"
              onClick={viewAll}
              className="shrink-0 border-t border-line px-5 py-3.5 text-[13px] font-semibold text-accent-deep text-center transition-colors hover:bg-surface"
            >
              View all {results.length} result{results.length > 1 ? 's' : ''} →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
