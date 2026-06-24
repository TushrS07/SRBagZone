import { Link } from 'react-router-dom'
import { useApp } from '../useApp'
import { FALLBACK_IMG, formatINR } from '../utils'

export default function Cart() {
  const { cart, subtotal, shipping, total, changeQty, removeItem } = useApp()

  if (cart.length === 0) {
    return (
      <main className="section">
        <h1 className="section-title">Your cart</h1>
        <div className="cart-empty" style={{ padding: 60 }}>
          <div className="cart-empty-icon">🛍</div>
          <p>Your cart is empty.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-block' }}>
            Continue shopping
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="section">
      <h1 className="section-title" style={{ marginBottom: 24 }}>Your cart</h1>
      <div className="cart-page">
        <div className="cart-page-list">
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <img
                src={item.image || FALLBACK_IMG}
                alt={item.name}
                onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
              />
              <div className="cart-item-info">
                <div>
                  <Link to={`/product/${item.id}`}>
                    <h4 className="cart-item-name">{item.name}</h4>
                  </Link>
                  <div className="cart-item-cat">{item.category}</div>
                </div>
                <div className="qty">
                  <button type="button" onClick={() => changeQty(item.id, -1)}>−</button>
                  <span>{item.qty}</span>
                  <button type="button" onClick={() => changeQty(item.id, 1)}>+</button>
                </div>
              </div>
              <div className="cart-item-side">
                <div className="cart-item-price">{formatINR(item.price * item.qty)}</div>
                <button type="button" className="cart-remove" onClick={() => removeItem(item.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <aside className="cart-summary">
          <h3>Order summary</h3>
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
          <Link to="/checkout" className="checkout-btn" style={{ textAlign: 'center', textDecoration: 'none' }}>
            Checkout · {formatINR(total)}
          </Link>
        </aside>
      </div>
    </main>
  )
}
