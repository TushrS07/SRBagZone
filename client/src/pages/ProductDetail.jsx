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
    return <main className="section"><p style={{ color: 'var(--muted)' }}>Loading…</p></main>
  }
  if (error || !product) {
    return (
      <main className="section">
        <p style={{ color: '#c0392b' }}>⚠ {error || 'Product not found'}</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-block' }}>
          Back to shop
        </Link>
      </main>
    )
  }

  const media = product.media?.length ? product.media : [{ url: FALLBACK_IMG }]
  const inCart = cart.find((i) => i.id === product.id)

  return (
    <main className="section product-detail">
      <Link to="/" className="back-link">← Back</Link>
      <div className="product-detail-grid">
        <div className="product-detail-media">
          <img
            src={media[activeImage]?.url || FALLBACK_IMG}
            alt={product.name}
            onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
          />
          {media.length > 1 && (
            <div className="thumb-row">
              {media.map((m, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`thumb ${idx === activeImage ? 'active' : ''}`}
                  onClick={() => setActiveImage(idx)}
                  aria-label={`Image ${idx + 1}`}
                >
                  <img src={m.url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="product-detail-info">
          <span className="product-cat">{product.category} · {product.brand}</span>
          <h1 className="product-detail-title">{product.name}</h1>
          <div className="product-rating">
            <span className="stars">{'★'.repeat(Math.round(product.rating || 0))}{'☆'.repeat(5 - Math.round(product.rating || 0))}</span>
            <span>({product.reviews} reviews)</span>
          </div>
          <div className="product-detail-price">
            <span className="price-now">{formatINR(product.price)}</span>
            {product.was && <span className="price-was">{formatINR(product.was)}</span>}
          </div>
          {product.description && (
            <p className="product-detail-desc">{product.description}</p>
          )}
          {typeof product.stock === 'number' && (
            <p className="product-detail-stock">
              {product.stock > 0 ? `In stock (${product.stock} left)` : 'Out of stock'}
            </p>
          )}
          <div className="product-detail-actions">
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
                className="btn btn-primary"
                onClick={() => addToCart(product)}
              >
                Add to cart
              </button>
            )}
            <Link to="/checkout" className="btn btn-ghost-dark">
              Buy now
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
