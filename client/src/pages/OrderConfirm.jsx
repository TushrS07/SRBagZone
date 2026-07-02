import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'
import SmartImage from '../components/SmartImage'
import Skeleton from '../components/Skeleton'
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
    return (
      <main className="max-w-[1240px] mx-auto mt-[70px] px-7 max-sm:px-4">
        <Skeleton className="h-10 w-64 mb-5" />
        <Skeleton rounded="rounded-lg" className="h-32 w-full mb-4" />
        <Skeleton rounded="rounded-lg" className="h-40 w-full" />
      </main>
    )
  if (error || !order)
    return (
      <main className="max-w-[1240px] mx-auto mt-[70px] px-7 max-sm:px-4">
        <p className="text-danger">⚠ {error || 'Order not found'}</p>
        <Link to="/" className="mt-4 inline-block px-[26px] py-[14px] rounded-full bg-accent text-[#ffffff] font-semibold text-[14.5px] tracking-[0.3px]">
          Back to shop
        </Link>
      </main>
    )

  const paymentStatus = order.payment?.payment_status || order.payment_status
  const screenshotUrl = order.payment?.screenshot_url

  return (
    <main className="max-w-[1240px] mx-auto mt-[70px] px-7 max-sm:px-4">
      <div className="text-center py-7">
        <div className="w-16 h-16 rounded-full bg-[#2f7a3a] text-[#ffffff] inline-grid place-items-center text-[32px]">✓</div>
        <h1 className="font-serif text-[34px] mt-3 mb-2">Thanks{order.address?.full_name ? `, ${order.address.full_name}` : ''}!</h1>
        <p>
          Your order <strong>#{order.id}</strong> is{' '}
          <strong>{STATUS_LABELS[order.order_status] || order.order_status}</strong>.
        </p>
      </div>

      <div className="bg-surface border border-line rounded-lg p-6 mt-4 flex flex-col gap-2">
        <h3 className="m-0 mb-2 font-serif text-[20px]">Order summary</h3>
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm text-ink-soft">
            <span>{item.product_name} × {item.quantity}</span>
            <span>{formatINR(item.subtotal)}</span>
          </div>
        ))}
        <div className="flex justify-between text-sm text-ink-soft text-xl font-bold text-ink pt-2 border-t border-line">
          <span>Total</span>
          <span>{formatINR(order.total_amount)}</span>
        </div>
      </div>

      {order.address && (
        <div className="bg-surface border border-line rounded-lg p-6 mt-4 flex flex-col gap-2">
          <h3 className="m-0 mb-2 font-serif text-[20px]">Shipping to</h3>
          <div>{order.address.full_name}</div>
          <div className="text-ink-soft text-sm">
            {order.address.address_line1}
            {order.address.address_line2 ? `, ${order.address.address_line2}` : ''}<br />
            {order.address.city}, {order.address.state} — {order.address.pincode}<br />
            {order.address.phone}
          </div>
        </div>
      )}

      <div className="bg-surface border border-line rounded-lg p-6 mt-4 flex flex-col gap-2">
        <h3 className="m-0 mb-2 font-serif text-[20px]">Payment</h3>
        <p>{PAYMENT_LABELS[paymentStatus] || paymentStatus}</p>
        {!screenshotUrl && (
          <p className="text-muted mb-3 text-sm">
            Pay <strong>{formatINR(order.total_amount)}</strong> via UPI to <strong>srbagzone@upi</strong>,
            then upload the screenshot below (and the UPI reference number if you have it).
          </p>
        )}
        {screenshotUrl && (
          <SmartImage
            src={screenshotUrl}
            alt="Payment screenshot"
            className="max-w-[260px] w-full min-h-[200px] mt-3 rounded-[12px]"
            imgClassName="w-full h-auto object-contain"
          />
        )}
        {paymentStatus !== 'confirmed' && (
          <div className="mt-3 flex flex-col gap-2.5">
            <input
              type="text"
              placeholder="UPI reference number (optional)"
              value={upiRef}
              onChange={(e) => setUpiRef(e.target.value)}
              disabled={uploading}
              className="px-[14px] py-3 border border-line rounded-[12px] font-sans text-sm text-ink bg-white outline-none focus:border-accent disabled:bg-bg disabled:text-muted"
            />
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              onChange={uploadScreenshot}
              disabled={uploading}
            />
            {uploading && <p className="text-[13px] text-muted">Uploading…</p>}
          </div>
        )}
      </div>

      <Link to="/" className="mt-6 inline-block px-[28px] py-[14px] rounded-full border border-ink text-ink bg-transparent font-semibold text-[15px] hover:bg-ink hover:text-[#ffffff] transition-colors">
        Back to shop
      </Link>
    </main>
  )
}
