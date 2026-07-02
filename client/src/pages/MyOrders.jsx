import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { formatINR } from '../utils'

const STATUS_LABELS = {
  pending: 'Awaiting confirmation',
  acknowledged: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

function fmtDate(iso) {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

export default function MyOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    api
      .listMyOrders()
      .then((rows) => {
        if (!cancelled) {
          setOrders(rows)
          setError('')
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load your orders')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <main className="max-w-[1240px] mx-auto mt-[70px] px-7 max-sm:px-4"><p className="text-muted">Loading…</p></main>

  return (
    <main className="max-w-[1240px] mx-auto mt-[70px] px-7 max-sm:px-4">
      <h1 className="font-serif text-[42px] font-medium m-0 tracking-[-0.5px] mb-6">My orders</h1>
      {error && <p className="text-danger">⚠ {error}</p>}
      {orders.length === 0 ? (
        <div className="py-10 text-center text-muted">
          <p className="text-base mb-4">You haven't placed any orders yet.</p>
          <Link to="/" className="inline-block px-[26px] py-[14px] rounded-full bg-accent text-[#ffffff] font-semibold text-[14.5px] tracking-[0.3px]">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((o) => (
            <Link
              key={o.id}
              to={`/order/${o.id}`}
              className="grid grid-cols-[1.2fr_1.6fr_1fr_0.7fr] gap-4 items-center px-[22px] py-5 bg-surface border border-line rounded-md transition-colors hover:border-accent hover:shadow-sm max-sm:grid-cols-2 max-sm:gap-2"
            >
              <div>
                <div className="font-semibold text-ink text-[15px]">Order #{o.id}</div>
                <div className="text-xs text-muted mt-0.5">{fmtDate(o.created_at)}</div>
              </div>
              <div className="flex flex-col gap-0.5 text-[13px] text-ink-soft">
                {(o.items || []).slice(0, 3).map((i) => (
                  <span key={i.id}>
                    {i.quantity} × {i.product_name}
                  </span>
                ))}
                {(o.items?.length || 0) > 3 && <span>+{o.items.length - 3} more</span>}
              </div>
              <div className="flex flex-col items-start">
                <span className={`inline-block px-2.5 py-1 text-xs rounded-full font-semibold ${o.order_status === 'completed' ? 'bg-[#e6f3e9] text-[#2f7a3a]' : 'bg-[#efe6dd] text-muted'}`}>
                  {STATUS_LABELS[o.order_status] || o.order_status}
                </span>
                {o.payment_status && (
                  <span className="text-xs text-muted mt-1">
                    Payment: {o.payment_status}
                  </span>
                )}
              </div>
              <div className="font-bold text-base text-ink text-right">{formatINR(o.total_amount)}</div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
