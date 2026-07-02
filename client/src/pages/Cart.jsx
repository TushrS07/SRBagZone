import { Link } from 'react-router-dom'
import { useApp } from '../useApp'
import SmartImage from '../components/SmartImage'
import { formatINR } from '../utils'

export default function Cart() {
  const { cart, subtotal, shipping, total, changeQty, removeItem } = useApp()

  if (cart.length === 0) {
    return (
      <main className="max-w-[1240px] mx-auto mt-[70px] px-7 max-sm:px-4">
        <h1 className="font-serif text-[42px] font-medium m-0 tracking-[-0.5px]">Your cart</h1>
        <div className="text-center py-[60px] text-muted">
          <div className="text-[48px] mb-3.5 opacity-50">🛍</div>
          <p>Your cart is empty.</p>
          <Link to="/" className="mt-4 inline-block px-[26px] py-[14px] rounded-full bg-accent text-[#ffffff] font-semibold text-[14.5px] tracking-[0.3px]">
            Continue shopping
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-[1240px] mx-auto mt-[70px] px-7 max-sm:px-4">
      <h1 className="font-serif text-[42px] font-medium m-0 tracking-[-0.5px] mb-6">Your cart</h1>
      <div className="grid grid-cols-1 gap-8 items-start tablet:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-3">
          {cart.map((item) => (
            <div key={item.id} className="grid grid-cols-[78px_1fr_auto] gap-3.5 bg-surface border border-line rounded-md p-3">
              <SmartImage
                src={item.image}
                alt={item.name}
                className="w-[78px] h-[78px] rounded-[10px] shrink-0"
              />
              <div className="flex flex-col justify-between min-w-0">
                <div>
                  <Link to={`/product/${item.id}`}>
                    <h4 className="font-serif text-[17px] font-medium m-0 leading-[1.2]">{item.name}</h4>
                  </Link>
                  <div className="text-xs text-muted mt-0.5">{item.category}</div>
                </div>
                <div className="inline-flex items-center border border-line rounded-full overflow-hidden bg-white mt-2 w-fit">
                  <button type="button" className="w-7 h-7 text-sm text-ink-soft hover:bg-accent-soft hover:text-accent-deep transition-colors" onClick={() => changeQty(item.id, -1)}>−</button>
                  <span className="min-w-[26px] text-center text-sm font-semibold">{item.qty}</span>
                  <button type="button" className="w-7 h-7 text-sm text-ink-soft hover:bg-accent-soft hover:text-accent-deep transition-colors" onClick={() => changeQty(item.id, 1)}>+</button>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <div className="font-bold text-[15px]">{formatINR(item.price * item.qty)}</div>
                <button type="button" className="text-xs text-muted underline hover:text-danger transition-colors" onClick={() => removeItem(item.id)}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <aside className="bg-surface border border-line rounded-lg p-6 flex flex-col gap-3 static tablet:sticky tablet:top-[90px]">
          <h3 className="m-0 mb-2 font-serif text-[22px]">Order summary</h3>
          <div className="flex justify-between text-sm text-ink-soft">
            <span>Subtotal</span>
            <span>{formatINR(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-ink-soft">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : formatINR(shipping)}</span>
          </div>
          <div className="flex justify-between text-sm text-ink-soft text-xl font-bold text-ink pt-2 border-t border-line">
            <span>Total</span>
            <span>{formatINR(total)}</span>
          </div>
          <Link to="/checkout" className="p-4 bg-ink text-[#ffffff] rounded-full font-semibold text-[15px] transition-colors hover:bg-accent-deep text-center no-underline">
            Checkout · {formatINR(total)}
          </Link>
        </aside>
      </div>
    </main>
  )
}
