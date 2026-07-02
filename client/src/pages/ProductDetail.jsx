import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { useApp } from '../useApp'
import { FALLBACK_IMG, formatINR } from '../utils'

export default function ProductDetail() {
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImage, setActiveImage] = useState(0)
  const { cart, addToCart, changeQty } = useApp()

  useEffect(() => {
    let cancelled = false
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
      <main className="max-w-[1240px] mx-auto mt-[70px] px-7 max-tablet:mt-14 max-tablet:px-[22px] max-sm:mt-11 max-sm:px-4">
        <p className="text-muted">Loading…</p>
      </main>
    )
  }
  if (error || !product) {
    return (
      <main className="max-w-[1240px] mx-auto mt-[70px] px-7 max-tablet:mt-14 max-tablet:px-[22px] max-sm:mt-11 max-sm:px-4">
        <p className="text-danger">⚠ {error || 'Product not found'}</p>
        <Link to="/" className="mt-4 inline-block py-[14px] px-[26px] rounded-full bg-accent text-[#ffffff] text-[14.5px] font-semibold hover:bg-[#d18638] hover:-translate-y-px transition-all">
          Back to shop
        </Link>
      </main>
    )
  }

  const media = product.media?.length ? product.media : [{ url: FALLBACK_IMG }]
  const inCart = cart.find((i) => i.id === product.id)

  return (
    <main className="max-w-[1240px] mx-auto mt-[70px] px-7 max-tablet:mt-14 max-tablet:px-[22px] max-sm:mt-11 max-sm:px-4">
      <Link to="/" className="inline-block mb-4 text-ink-soft text-sm hover:text-accent-deep">← Back</Link>
      <div className="grid grid-cols-1 gap-6 items-start tablet:grid-cols-[1.1fr_1fr] tablet:gap-10">
        <div>
          <div className="w-full aspect-square rounded-lg overflow-hidden bg-surface">
            <img
              src={media[activeImage]?.url || FALLBACK_IMG}
              alt={product.name}
              onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
              className="w-full h-full object-cover"
            />
          </div>
          {media.length > 1 && (
            <div className="flex gap-2.5 mt-3.5">
              {media.map((m, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`w-[70px] h-[70px] rounded-[12px] border-2 overflow-hidden p-0 bg-surface${idx === activeImage ? ' border-accent' : ' border-transparent'}`}
                  onClick={() => setActiveImage(idx)}
                  aria-label={`Image ${idx + 1}`}
                >
                  <img src={m.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <span className="text-[11.5px] uppercase tracking-[1.2px] text-muted font-semibold">{product.category} · {product.brand}</span>
          <h1 className="font-serif text-[38px] my-2 mb-3 tracking-[-0.4px] max-tablet:text-[30px] max-sm:text-[26px]">{product.name}</h1>
          <div className="flex items-center gap-1.5 text-[13px] text-ink-soft">
            <span className="text-[#e3a92a] tracking-[1px] text-[13px]">{'★'.repeat(Math.round(product.rating || 0))}{'☆'.repeat(5 - Math.round(product.rating || 0))}</span>
            <span>({product.reviews} reviews)</span>
          </div>
          <div className="flex items-baseline gap-3 my-4">
            <span className="text-[28px] font-bold text-ink max-sm:text-[22px]">{formatINR(product.price)}</span>
            {product.was && <span className="text-[13px] text-muted line-through">{formatINR(product.was)}</span>}
          </div>
          {product.description && (
            <p className="text-ink-soft leading-[1.6] my-4">{product.description}</p>
          )}
          {typeof product.stock === 'number' && (
            <p className="text-accent-deep font-semibold text-sm">
              {product.stock > 0 ? `In stock (${product.stock} left)` : 'Out of stock'}
            </p>
          )}
          <div className="flex gap-3 mt-6">
            {inCart ? (
              <div className="qty product-detail-qty" aria-label="Quantity in cart">
                <button
                  type="button"
                  onClick={() => changeQty(product.id, -1)}
                  aria-label={inCart.qty === 1 ? 'Remove from cart' : 'Decrease quantity'}
                >
                  −
                </button>
                <span>
                  {inCart.qty} <span className="qty-suffix">in cart</span>
                </span>
                <button
                  type="button"
                  onClick={() => changeQty(product.id, 1)}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="py-[14px] px-[26px] rounded-full text-[14.5px] font-semibold tracking-[0.3px] transition-all bg-accent text-[#ffffff] hover:bg-[#d18638] hover:-translate-y-px"
                onClick={() => addToCart(product)}
              >
                Add to cart
              </button>
            )}
            <Link to="/checkout" className="inline-block py-[14px] px-7 rounded-full border border-ink text-ink bg-transparent font-semibold text-[15px] hover:bg-ink hover:text-[#ffffff]">
              Buy now
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
