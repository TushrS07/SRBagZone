import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { useApp } from '../useApp'
import { useUser } from '../useUser'
import SmartImage from '../components/SmartImage'
import Skeleton from '../components/Skeleton'
import { FALLBACK_IMG, formatINR } from '../utils'

/* Two-digit index label, e.g. 1 -> "01" */
const pad = (n) => String(n).padStart(2, '0')

function StockPill({ stock }) {
  if (typeof stock !== 'number') return null
  const out = stock === 0
  const low = stock > 0 && stock < 10
  const label = out ? 'Out of stock' : low ? `Only ${stock} left` : 'In stock'
  const tone = out ? 'text-danger' : low ? 'text-accent-deep' : 'text-ink-soft'
  const dot = out ? 'bg-danger' : low ? 'bg-accent' : 'bg-[#5f8a4e]'
  return (
    <span className={`inline-flex items-center gap-2 text-[12.5px] font-medium uppercase tracking-[1.5px] ${tone}`}>
      <span className={`relative flex w-1.5 h-1.5`}>
        {!out && <span className={`absolute inset-0 rounded-full ${dot} opacity-60 animate-ping`} />}
        <span className={`relative w-1.5 h-1.5 rounded-full ${dot}`} />
      </span>
      {label}
    </span>
  )
}

const ASSURANCES = [
  {
    title: 'Free shipping',
    sub: 'On orders over ₹2,000',
    icon: (
      <path d="M1 3h13v10H1zM14 6h4l3 3v4h-7M5.5 18.5A1.5 1.5 0 1 0 5.5 15.5a1.5 1.5 0 0 0 0 3zM18.5 18.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
    ),
  },
  {
    title: '6-month warranty',
    sub: 'Craftsmanship guaranteed',
    icon: <path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5zM9 12l2 2 4-4" />,
  },
  {
    title: '30-day returns',
    sub: 'Easy & hassle-free',
    icon: <path d="M3 12a9 9 0 1 0 3-6.7M3 3v4h4" />,
  },
]

const DETAIL_SECTIONS = [
  {
    id: 'shipping',
    title: 'Shipping & Delivery',
    body: 'Complimentary shipping on orders over ₹2,000. Every order is dispatched within 24–48 hours and arrives in 3–6 business days across India, carefully packed in signature SR Bagz Zone wrapping.',
  },
]

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImage, setActiveImage] = useState(0)
  const [openSection, setOpenSection] = useState('shipping')
  const { cart, addToCart, changeQty } = useApp()
  const user = useUser()
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    let cancelled = false
    setActiveImage(0)
    api
      .getProduct(id)
      .then((p) => {
        if (!cancelled) {
          setProduct(p)
          setError('')
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Product not found')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <main className="max-w-[1280px] mx-auto mt-11 px-7 max-tablet:mt-9 max-tablet:px-[22px] max-sm:mt-4 max-sm:px-4">
        <Skeleton className="h-3.5 w-40 mb-8" />
        <div className="grid grid-cols-1 gap-10 items-start tablet:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] tablet:gap-16">
          <Skeleton rounded="rounded-[20px]" className="w-full aspect-square" />
          <div className="flex flex-col gap-5 tablet:pt-6">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-12 w-4/5" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-20 w-full" />
            <div className="flex gap-3 mt-2">
              <Skeleton rounded="rounded-full" className="h-14 flex-1" />
              <Skeleton rounded="rounded-full" className="h-14 w-32" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="max-w-[1280px] mx-auto mt-24 px-7 text-center max-sm:mt-16 max-sm:px-4">
        <p className="font-serif text-[32px] text-ink mb-2">Bag not found</p>
        <p className="text-muted mb-6 text-sm">{error || 'This piece may have wandered off.'}</p>
        <Link to="/" className="inline-block py-[14px] px-[26px] rounded-full bg-ink text-white text-[14.5px] font-semibold hover:bg-accent-deep hover:-translate-y-px transition-all">
          Back to the collection
        </Link>
      </main>
    )
  }

  const media = product.media?.length ? product.media : [{ url: FALLBACK_IMG }]
  const inCart = cart.find((i) => i.id === product.id)
  const hasMulti = media.length > 1
  const discount =
    product.was && product.was > product.price
      ? Math.round(((product.was - product.price) / product.was) * 100)
      : 0
  const soldOut = product.stock === 0

  return (
    <main className="max-w-[1280px] mx-auto mt-11 px-7 pb-24 max-tablet:mt-9 max-tablet:px-[22px] max-sm:mt-4 max-sm:px-4 max-sm:pb-16">
      {/* Breadcrumb */}
      <nav className="pdp-rise flex items-center gap-2.5 text-[11.5px] uppercase tracking-[1.8px] text-muted mb-8 max-sm:mb-6">
        <Link to="/" className="hover:text-accent-deep transition-colors">Shop</Link>
        <span className="text-line">—</span>
        <span className="text-ink-soft truncate max-w-[55vw]">{product.category}</span>
      </nav>

      <div className="grid grid-cols-1 gap-10 items-start tablet:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] tablet:gap-16">
        {/* ─── Gallery ─── */}
        <div className="pdp-media">
          <div className={`grid gap-3 tablet:gap-4 ${hasMulti ? 'tablet:grid-cols-[74px_minmax(0,1fr)]' : ''}`}>
            {/* Thumbnails — horizontal on mobile, vertical filmstrip on desktop */}
            {hasMulti && (
              <div className="pdp-thumbs order-2 tablet:order-1 flex gap-2.5 overflow-x-auto tablet:flex-col tablet:gap-3 tablet:overflow-visible">
                {media.map((m, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    aria-label={`View image ${idx + 1}`}
                    aria-current={idx === activeImage}
                    className={`relative shrink-0 w-[64px] h-[64px] tablet:w-full tablet:h-auto tablet:aspect-square rounded-[13px] overflow-hidden bg-surface transition-all duration-300 ${
                      idx === activeImage
                        ? 'ring-2 ring-accent ring-offset-2 ring-offset-bg'
                        : 'ring-1 ring-line opacity-65 hover:opacity-100'
                    }`}
                  >
                    <SmartImage src={m.url} alt="" className="w-full h-full" />
                  </button>
                ))}
              </div>
            )}

            {/* Main image */}
            <div className="order-1 tablet:order-2 relative">
              <div className="relative aspect-square rounded-[20px] overflow-hidden bg-surface shadow-[0_30px_60px_-24px_rgba(26,22,18,0.35)] ring-1 ring-line/70">
                <SmartImage
                  key={activeImage}
                  src={media[activeImage]?.url}
                  alt={product.name}
                  eager
                  className="w-full h-full"
                  imgClassName="w-full h-full object-cover"
                />
                {product.was && discount > 0 && (
                  <span className="absolute top-4 left-4 bg-ink text-white text-[11px] font-bold tracking-[0.5px] uppercase py-1.5 px-3 rounded-full">
                    −{discount}%
                  </span>
                )}
                {hasMulti && (
                  <span className="absolute bottom-4 right-4 bg-bg/85 backdrop-blur-sm text-ink-soft text-[11px] font-semibold tracking-[1.5px] py-1.5 px-3 rounded-full tabular-nums">
                    {pad(activeImage + 1)} — {pad(media.length)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Info ─── */}
        <div className="tablet:pt-4">
          <p className="pdp-rise text-[11.5px] uppercase tracking-[2px] text-accent-deep font-semibold" style={{ animationDelay: '0.05s' }}>
            {product.brand ? `${product.brand} · ` : ''}{product.category}
          </p>

          <h1 className="pdp-rise font-serif font-medium text-[clamp(34px,4.6vw,56px)] leading-[1.02] tracking-[-0.5px] text-ink mt-3 mb-5" style={{ animationDelay: '0.1s' }}>
            {product.name}
          </h1>

          <div className="pdp-rise h-px w-full bg-line" style={{ animationDelay: '0.15s' }} />

          {/* Price */}
          <div className="pdp-rise flex items-center flex-wrap gap-x-4 gap-y-2 mt-6" style={{ animationDelay: '0.2s' }}>
            <span className="font-serif text-[40px] leading-none text-ink max-sm:text-[32px]">{formatINR(product.price)}</span>
            {product.was && (
              <span className="text-[16px] text-muted line-through">MRP {formatINR(product.was)}</span>
            )}
            {discount > 0 && (
              <span className="text-[12px] font-semibold uppercase tracking-[1px] text-accent-deep bg-accent-soft px-2.5 py-1 rounded-full">
                {discount}% off
              </span>
            )}
          </div>

          <div className="pdp-rise mt-4" style={{ animationDelay: '0.24s' }}>
            <StockPill stock={product.stock} />
          </div>

          {product.description && (
            <p className="pdp-rise text-ink-soft leading-[1.8] text-[15.5px] mt-6 max-w-[46ch]" style={{ animationDelay: '0.28s' }}>
              {product.description}
            </p>
          )}

          {/* Actions */}
          {!isAdmin && (
            <div className="pdp-rise flex flex-wrap items-center gap-3 mt-8" style={{ animationDelay: '0.32s' }}>
              {inCart ? (
                <div className="qty product-detail-qty" aria-label="Quantity in cart">
                  <button
                    type="button"
                    onClick={() => changeQty(product.id, -1)}
                    aria-label={inCart.qty === 1 ? 'Remove from cart' : 'Decrease quantity'}
                  >
                    −
                  </button>
                  <span>{inCart.qty}</span>
                  <button
                    type="button"
                    onClick={() => changeQty(product.id, 1)}
                    aria-label="Increase quantity"
                    disabled={typeof product.stock === 'number' && inCart.qty >= product.stock}
                  >
                    +
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={soldOut}
                  className="group flex-1 min-w-[200px] inline-flex items-center justify-center gap-2.5 py-[17px] px-8 rounded-full text-[14.5px] font-semibold tracking-[0.3px] bg-ink text-white transition-all duration-300 hover:bg-accent-deep hover:-translate-y-0.5 hover:shadow-[0_16px_30px_-12px_rgba(138,83,28,0.6)] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:bg-ink disabled:hover:shadow-none max-sm:w-full max-sm:flex-none"
                  onClick={() => addToCart(product)}
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:-translate-y-px" aria-hidden="true">
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    <path d="M3 6h18M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  {soldOut ? 'Sold out' : 'Add to cart'}
                </button>
              )}
              <Link
                to="/checkout"
                className="inline-flex items-center justify-center py-[17px] px-8 rounded-full border border-ink text-ink bg-transparent font-semibold text-[14.5px] tracking-[0.3px] transition-all duration-300 hover:bg-ink hover:text-white max-sm:w-full"
              >
                Buy now
              </Link>
            </div>
          )}

          {/* Assurances */}
          <ul className="pdp-rise grid grid-cols-3 gap-0 mt-9 border-y border-line max-sm:grid-cols-1 max-sm:divide-y max-sm:divide-line" style={{ animationDelay: '0.36s' }}>
            {ASSURANCES.map((a, i) => (
              <li
                key={a.title}
                className={`flex items-start gap-3 py-4 max-sm:py-3.5 ${i > 0 ? 'sm:pl-5 sm:border-l sm:border-line max-sm:pl-0' : ''} ${i < 2 ? 'sm:pr-3' : ''}`}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent-deep shrink-0 mt-0.5" aria-hidden="true">
                  {a.icon}
                </svg>
                <span className="flex flex-col leading-tight">
                  <span className="text-[13px] font-semibold text-ink">{a.title}</span>
                  <span className="text-[12px] text-muted mt-0.5">{a.sub}</span>
                </span>
              </li>
            ))}
          </ul>

          {/* Accordions */}
          <div className="pdp-rise mt-2" style={{ animationDelay: '0.4s' }}>
            {DETAIL_SECTIONS.map((s) => {
              const open = openSection === s.id
              return (
                <div key={s.id} className="border-b border-line">
                  <button
                    type="button"
                    onClick={() => setOpenSection(open ? '' : s.id)}
                    aria-expanded={open}
                    className="w-full flex items-center justify-between gap-4 py-4 text-left group"
                  >
                    <span className="font-serif text-[19px] text-ink">{s.title}</span>
                    <span className={`shrink-0 grid place-items-center w-7 h-7 rounded-full border border-line text-ink-soft transition-all duration-300 group-hover:border-accent group-hover:text-accent-deep ${open ? 'rotate-45' : ''}`} aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </button>
                  <div className={`grid transition-all duration-[350ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden">
                      <p className="text-ink-soft leading-[1.75] text-[14.5px] pb-5 max-w-[52ch]">{s.body}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
