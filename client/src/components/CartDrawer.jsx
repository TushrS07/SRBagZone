import { Link } from 'react-router-dom'
import { useApp } from '../useApp'
import SmartImage from './SmartImage'
import { formatINR } from '../utils'

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
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-ink/45 backdrop-blur-sm z-90 transition-opacity duration-[250ms] ${cartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setCartOpen(false)}
        aria-hidden={!cartOpen}
      />

      {/* Drawer panel */}
      <aside
        className={`fixed inset-y-0 right-0 w-full max-w-[440px] bg-bg z-100 flex flex-col shadow-lg transition-transform duration-[320ms] [transition-timing-function:cubic-bezier(0.22,0.61,0.36,1)] max-sm:max-w-full ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`}
        aria-hidden={!cartOpen}
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-[26px] py-[22px] border-b border-line max-sm:px-[18px] max-sm:py-[18px]">
          <h3 className="m-0 font-serif text-2xl font-medium">Your Cart</h3>
          <button
            type="button"
            onClick={() => setCartOpen(false)}
            className="w-9 h-9 rounded-full grid place-items-center text-ink-soft bg-surface border border-line text-lg transition-colors duration-200 hover:bg-ink hover:text-[#ffffff]"
            aria-label="Close cart"
          >
            ×
          </button>
        </div>

        {/* Body — only the product list scrolls */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-[26px] py-[18px] flex flex-col gap-[14px] max-sm:px-[18px] max-sm:py-[14px]">
          {cart.length === 0 ? (
            <div className="text-center py-[60px] px-5 text-muted">
              <div className="text-5xl mb-[14px] opacity-50">🛍</div>
              <p>Your cart is empty.</p>
              <p className="text-[13px] mt-2">
                Browse our collection to find your next favorite bag.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="grid grid-cols-[78px_1fr_auto] gap-[14px] bg-surface border border-line rounded-md p-3 max-sm:grid-cols-[64px_1fr_auto] max-sm:gap-[10px] max-sm:p-[10px]">
                <SmartImage
                  src={item.image}
                  alt={item.name}
                  className="w-[78px] h-[78px] rounded-[10px] max-sm:w-16 max-sm:h-16"
                />
                <div className="flex flex-col justify-between min-w-0">
                  <div>
                    <h4 className="font-serif text-[17px] font-medium m-0 leading-[1.2] max-sm:text-[15px]">{item.name}</h4>
                    <div className="text-xs text-muted mt-0.5">{item.category}</div>
                  </div>
                  {/* Qty pill */}
                  <div className="inline-flex items-center border border-line rounded-full overflow-hidden bg-white mt-2 w-fit" aria-label="Quantity">
                    <button type="button" onClick={() => changeQty(item.id, -1)} aria-label="Decrease" className="w-7 h-7 text-sm text-ink-soft hover:bg-accent-soft hover:text-accent-deep transition-colors duration-[180ms]">−</button>
                    <span className="min-w-[26px] text-center text-sm font-semibold">{item.qty}</span>
                    <button type="button" onClick={() => changeQty(item.id, 1)} aria-label="Increase" className="w-7 h-7 text-sm text-ink-soft hover:bg-accent-soft hover:text-accent-deep transition-colors duration-[180ms]">+</button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <div className="font-bold text-[15px]">{formatINR(item.price * item.qty)}</div>
                  <button
                    type="button"
                    className="text-xs text-muted underline transition-colors duration-[180ms] hover:text-danger"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer — summary + checkout, pinned to the bottom */}
        {cart.length > 0 && (
          <div className="shrink-0 px-[26px] py-[22px] border-t border-line bg-surface flex flex-col gap-[14px] max-sm:px-[18px] max-sm:py-[18px]">
            <div className="flex justify-between text-sm text-ink-soft">
              <span>Subtotal</span>
              <span>{formatINR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-ink-soft">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : formatINR(shipping)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-ink pt-2 border-t border-line">
              <span>Total</span>
              <span>{formatINR(total)}</span>
            </div>
            <Link
              to="/checkout"
              className="block py-4 bg-ink text-[#ffffff] rounded-full font-semibold text-[15px] text-center transition-colors duration-200 hover:bg-accent-deep disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={() => setCartOpen(false)}
            >
              Checkout · {formatINR(total)}
            </Link>
          </div>
        )}
      </aside>
    </>
  )
}
