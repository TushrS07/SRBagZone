import { Link } from 'react-router-dom'
import { useApp } from '../useApp'
import { useUser } from '../useUser'
import SmartImage from './SmartImage'
import { formatINR } from '../utils'

// function Stars({ rating }) {
//   const full = Math.round(rating || 0)
//   return (
//     <span className="text-[#e3a92a] tracking-[1px] text-[13px]" aria-label={`${rating} out of 5`}>
//       {'★'.repeat(full)}
//       {'☆'.repeat(5 - full)}
//     </span>
//   )
// }

export default function ProductCard({ product }) {
  const { cart, addToCart, changeQty } = useApp()
  const user = useUser()
  const isAdmin = user?.role === 'admin'
  const inCart = cart.find((i) => i.id === product.id)
  const soldOut = product.stock === 0

  return (
    <article className={`group bg-surface rounded-md overflow-hidden border border-line transition-[transform,box-shadow] duration-250 flex flex-col ${soldOut ? 'opacity-80' : 'hover:-translate-y-1 hover:shadow-md'}`}>
      {/* Media */}
      <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-accent-soft block">
        <SmartImage
          src={product.image}
          alt={product.name}
          className="absolute inset-0"
          imgClassName={`w-full h-full object-cover transition-transform duration-500 ease-[ease] ${soldOut ? 'grayscale opacity-60' : 'group-hover:scale-[1.06]'}`}
        />
        {soldOut && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end justify-center pb-5">
            <span className="text-white text-[13px] font-bold uppercase tracking-[1.5px] bg-black/60 px-4 py-2 rounded-full">Out of Stock</span>
          </div>
        )}
        {!soldOut && product.badge && (
          <span className={`absolute top-3 left-3 text-[#ffffff] text-[11px] font-bold tracking-[0.6px] uppercase py-[6px] px-[10px] rounded-full max-sm:text-[10px] max-sm:py-[5px] max-sm:px-2 ${product.badge === 'Sale' ? 'bg-danger' : 'bg-ink'}`}>
            {product.badge}
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="px-[18px] pt-[18px] pb-5 flex flex-col gap-2 flex-1 max-sm:px-[14px] max-sm:pt-[14px] max-sm:pb-4 max-sm:gap-[6px]">
        <span className="text-[11.5px] uppercase tracking-[1.2px] text-muted font-semibold max-sm:text-[10.5px]">{product.category}</span>
        <h3 className="font-serif text-[21px] font-medium m-0 tracking-[-0.2px] leading-[1.2] max-sm:text-base">
          <Link to={`/product/${product.id}`}>{product.name}</Link>
        </h3>
        <div className="mt-auto flex items-center justify-between gap-[10px] pt-[10px] max-sm:flex-col max-sm:items-start max-sm:gap-[10px]">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xl font-bold text-ink max-sm:text-base">{formatINR(product.price)}</span>
            {product.was && <span className="text-[13px] text-muted line-through max-sm:text-xs">{formatINR(product.was)}</span>}
            {product.was && product.was > product.price && (
              <span className="text-[11px] font-semibold text-accent-deep bg-accent-soft px-2 py-0.5 rounded-full">
                {Math.round(((product.was - product.price) / product.was) * 100)}% off
              </span>
            )}
          </div>
          {!isAdmin && (soldOut ? (
            <span className="text-[12px] font-semibold text-danger uppercase tracking-[0.5px]">Out of Stock</span>
          ) : inCart ? (
            <div className="inline-flex items-center border border-transparent rounded-full overflow-hidden bg-accent-soft" aria-label="Quantity in cart">
              <button
                type="button"
                onClick={() => changeQty(product.id, -1)}
                aria-label={inCart.qty === 1 ? 'Remove from cart' : 'Decrease quantity'}
                className="w-[30px] h-8 text-base text-accent-deep font-bold hover:bg-accent hover:text-[#ffffff] transition-colors duration-[180ms] max-sm:w-[38px] max-sm:h-[38px] max-sm:text-[17px]"
              >
                −
              </button>
              <span className="min-w-[22px] text-center text-sm font-semibold text-accent-deep">{inCart.qty}</span>
              <button
                type="button"
                onClick={() => changeQty(product.id, 1)}
                aria-label="Increase quantity"
                disabled={typeof product.stock === 'number' && inCart.qty >= product.stock}
                className="w-[30px] h-8 text-base text-accent-deep font-bold hover:bg-accent hover:text-[#ffffff] transition-colors duration-[180ms] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-accent-deep max-sm:w-[38px] max-sm:h-[38px] max-sm:text-[17px]"
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="py-[9px] px-4 bg-ink text-[#ffffff] rounded-full text-[13px] font-semibold transition-[background,transform] duration-200 inline-flex items-center gap-[6px] hover:bg-accent hover:-translate-y-px max-sm:py-[10px] max-sm:px-5 max-sm:text-[12.5px]"
              onClick={() => addToCart(product)}
            >
              + Add
            </button>
          ))}
        </div>
      </div>
    </article>
  )
}
