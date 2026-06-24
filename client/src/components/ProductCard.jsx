import { Link } from 'react-router-dom'
import { useApp } from '../useApp'
import { FALLBACK_IMG, formatINR } from '../utils'

function Stars({ rating }) {
  const full = Math.round(rating || 0)
  return (
    <span className="stars" aria-label={`${rating} out of 5`}>
      {'★'.repeat(full)}
      {'☆'.repeat(5 - full)}
    </span>
  )
}

export default function ProductCard({ product }) {
  const { cart, addToCart, changeQty } = useApp()
  const inCart = cart.find((i) => i.id === product.id)

  return (
    <article className="product-card">
      <Link to={`/product/${product.id}`} className="product-media">
        <img
          src={product.image || FALLBACK_IMG}
          alt={product.name}
          loading="lazy"
          onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
        />
        {product.badge && (
          <span className={`product-badge ${product.badge === 'Sale' ? 'sale' : ''}`}>
            {product.badge}
          </span>
        )}
      </Link>
      <button className="product-fav" aria-label="Save to wishlist" type="button">
        ♡
      </button>
      <div className="product-info">
        <span className="product-cat">{product.category}</span>
        <h3 className="product-name">
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        <div className="product-rating">
          <Stars rating={product.rating} />
          <span>({product.reviews})</span>
        </div>
        <div className="product-foot">
          <div className="price">
            <span className="price-now">{formatINR(product.price)}</span>
            {product.was && <span className="price-was">{formatINR(product.was)}</span>}
          </div>
          {inCart ? (
            <div className="qty add-qty" aria-label="Quantity in cart">
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
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="add-btn"
              onClick={() => addToCart(product)}
            >
              + Add
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
