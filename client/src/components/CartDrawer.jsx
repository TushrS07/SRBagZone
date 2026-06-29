import { Link } from 'react-router-dom'
import { useApp } from '../useApp'
import { FALLBACK_IMG, formatINR } from '../utils'

export default function CartDrawer() {
  const {
    cart,
    cartOpen,
    setCartOpen,
    subtotal,
    shipping,
    total,
    changeQty,
    removeItem,
  } = useApp()

  return (
    <>
      <div
        className={`drawer-overlay ${cartOpen ? 'open' : ''}`}
        onClick={() => setCartOpen(false)}
        aria-hidden={!cartOpen}
      />
      <aside
        className={`drawer ${cartOpen ? 'open' : ''}`}
        aria-hidden={!cartOpen}
        aria-label="Shopping cart"
      >
        <div className="drawer-head">
          <h3>Your Cart</h3>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="drawer-close"
            aria-label="Close cart"
          >
            ×
          </button>
        </div>
        <div className="drawer-body">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛍</div>
              <p>Your cart is empty.</p>
              <p style={{ fontSize: 13, marginTop: 8 }}>
                Browse our collection to find your next favorite bag.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="cart-item">
                <img
                  src={item.image || FALLBACK_IMG}
                  alt={item.name}
                  onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                />
                <div className="cart-item-info">
                  <div>
                    <h4 className="cart-item-name">{item.name}</h4>
                    <div className="cart-item-cat">{item.category}</div>
                  </div>
                  <div className="qty" aria-label="Quantity">
                    <button type="button" onClick={() => changeQty(item.id, -1)} aria-label="Decrease">−</button>
                    <span>{item.qty}</span>
                    <button type="button" onClick={() => changeQty(item.id, 1)} aria-label="Increase">+</button>
                  </div>
                </div>
                <div className="cart-item-side">
                  <div className="cart-item-price">{formatINR(item.price * item.qty)}</div>
                  <button
                    type="button"
                    className="cart-remove"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="drawer-foot">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatINR(shipping)}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
            <Link
              to="/checkout"
              className="checkout-btn"
              onClick={() => setCartOpen(false)}
              style={{ textAlign: 'center', textDecoration: 'none' }}
            >
              Checkout · {formatINR(total)}
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}
