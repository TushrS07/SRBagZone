import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import { formatINR } from '../utils'

const STATUS_LABELS = {
  pending: 'Awaiting confirmation',
  acknowledged: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const PAYMENT_LABELS = {
  pending: 'Awaiting payment',
  pending_confirmation: 'Screenshot uploaded — awaiting admin review',
  confirmed: 'Payment confirmed',
  rejected: 'Payment rejected — please upload again',
}

export default function OrderConfirm() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)
  const [upiRef, setUpiRef] = useState('')
  const fileInput = useRef(null)

  useEffect(() => {
    let cancelled = false
    api
      .getOrder(id)
      .then((o) => {
        if (!cancelled) {
          setOrder(o)
          setError('')
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Order not found')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const uploadScreenshot = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await api.submitPayment(id, file, upiRef || null)
      const refreshed = await api.getOrder(id)
      setOrder(refreshed)
      setUpiRef('')
    } catch (err) {
      setError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  if (loading)
    return <main className="section"><p style={{ color: 'var(--muted)' }}>Loading…</p></main>
  if (error || !order)
    return (
      <main className="section">
        <p style={{ color: '#c0392b' }}>⚠ {error || 'Order not found'}</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-block' }}>
          Back to shop
        </Link>
      </main>
    )

  const paymentStatus = order.payment?.payment_status || order.payment_status
  const screenshotUrl = order.payment?.screenshot_url

  return (
    <main className="section order-confirm">
      <div className="order-confirm-head">
        <div className="order-check">✓</div>
        <h1>Thanks{order.address?.full_name ? `, ${order.address.full_name}` : ''}!</h1>
        <p>
          Your order <strong>#{order.id}</strong> is{' '}
          <strong>{STATUS_LABELS[order.order_status] || order.order_status}</strong>.
        </p>
      </div>

      <div className="order-card">
        <h3>Order summary</h3>
        {order.items.map((item) => (
          <div key={item.id} className="summary-row">
            <span>{item.product_name} × {item.quantity}</span>
            <span>{formatINR(item.subtotal)}</span>
          </div>
        ))}
        <div className="summary-row total">
          <span>Total</span>
          <span>{formatINR(order.total_amount)}</span>
        </div>
      </div>

      {order.address && (
        <div className="order-card">
          <h3>Shipping to</h3>
          <div>{order.address.full_name}</div>
          <div style={{ color: 'var(--ink-soft)', fontSize: 14 }}>
            {order.address.address_line1}
            {order.address.address_line2 ? `, ${order.address.address_line2}` : ''}<br />
            {order.address.city}, {order.address.state} — {order.address.pincode}<br />
            {order.address.phone}
          </div>
        </div>
      )}

      <div className="order-card">
        <h3>Payment</h3>
        <p>{PAYMENT_LABELS[paymentStatus] || paymentStatus}</p>
        {!screenshotUrl && (
          <p style={{ color: 'var(--muted)', marginBottom: 12, fontSize: 14 }}>
            Pay <strong>{formatINR(order.total_amount)}</strong> via UPI to <strong>srbagzone@upi</strong>,
            then upload the screenshot below (and the UPI reference number if you have it).
          </p>
        )}
        {screenshotUrl && (
          <img
            src={screenshotUrl}
            alt="Payment screenshot"
            style={{ maxWidth: 260, marginTop: 12, borderRadius: 12 }}
          />
        )}
        {paymentStatus !== 'confirmed' && (
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input
              type="text"
              placeholder="UPI reference number (optional)"
              value={upiRef}
              onChange={(e) => setUpiRef(e.target.value)}
              disabled={uploading}
              style={{ padding: 12, borderRadius: 12, border: '1px solid var(--line)' }}
            />
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              onChange={uploadScreenshot}
              disabled={uploading}
            />
            {uploading && <p style={{ fontSize: 13, color: 'var(--muted)' }}>Uploading…</p>}
          </div>
        )}
      </div>

      <Link to="/" className="btn btn-ghost-dark" style={{ marginTop: 24, display: 'inline-block' }}>
        Back to shop
      </Link>
    </main>
  )
}
