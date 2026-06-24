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

  if (loading) return <main className="section"><p style={{ color: 'var(--muted)' }}>Loading…</p></main>

  return (
    <main className="section">
      <h1 className="section-title" style={{ marginBottom: 24 }}>My orders</h1>
      {error && <p style={{ color: '#c0392b' }}>⚠ {error}</p>}
      {orders.length === 0 ? (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)' }}>
          <p style={{ fontSize: 16 }}>You haven't placed any orders yet.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-block' }}>
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((o) => (
            <Link key={o.id} to={`/order/${o.id}`} className="order-row">
              <div>
                <div className="order-row-num">Order #{o.id}</div>
                <div className="order-row-date">{fmtDate(o.created_at)}</div>
              </div>
              <div className="order-row-items">
                {(o.items || []).slice(0, 3).map((i) => (
                  <span key={i.id}>
                    {i.quantity} × {i.product_name}
                  </span>
                ))}
                {(o.items?.length || 0) > 3 && <span>+{o.items.length - 3} more</span>}
              </div>
              <div className="order-row-status">
                <span className={`pill ${o.order_status === 'completed' ? 'pill-on' : 'pill-off'}`}>
                  {STATUS_LABELS[o.order_status] || o.order_status}
                </span>
                {o.payment_status && (
                  <span style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
                    Payment: {o.payment_status}
                  </span>
                )}
              </div>
              <div className="order-row-total">{formatINR(o.total_amount)}</div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
