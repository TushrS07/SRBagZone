import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useApp } from '../useApp'
import { useUser } from '../useUser'
import { formatINR } from '../utils'

export default function Checkout() {
  const navigate = useNavigate()
  const { cart, subtotal, shipping, total, clearCart, setToast } = useApp()
  const user = useUser()

  const [addresses, setAddresses] = useState([])
  const [addrLoading, setAddrLoading] = useState(true)
  const [selectedAddressId, setSelectedAddressId] = useState('')
  const [useNewAddress, setUseNewAddress] = useState(false)
  const [form, setForm] = useState({
    full_name: user?.name || '',
    phone: user?.phone || '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    pincode: '',
  })

  const [placing, setPlacing] = useState(false)
  const [error, setError] = useState('')
  const [resending, setResending] = useState(false)

  useEffect(() => {
    let cancelled = false
    api
      .listMyAddresses()
      .then((rows) => {
        if (cancelled) return
        setAddresses(rows)
        if (rows.length === 0) {
          setUseNewAddress(true)
        } else {
          const defaultAddr = rows.find((a) => a.is_default) || rows[0]
          setSelectedAddressId(defaultAddr.id)
        }
      })
      .catch(() => {
        if (!cancelled) setUseNewAddress(true)
      })
      .finally(() => {
        if (!cancelled) setAddrLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (cart.length === 0 && !placing) {
    return (
      <main className="section">
        <h1 className="section-title">Checkout</h1>
        <p style={{ color: 'var(--muted)' }}>Your cart is empty.</p>
        <Link to="/" className="btn btn-primary" style={{ marginTop: 16, display: 'inline-block' }}>
          Continue shopping
        </Link>
      </main>
    )
  }

  const onChange = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }))

  const resendVerification = async () => {
    setResending(true)
    try {
      await api.resendVerification()
      setToast('Verification email sent — check your inbox.')
    } catch (err) {
      setToast(err.message || 'Could not resend')
    } finally {
      setResending(false)
    }
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setPlacing(true)
    try {
      const payload = {
        items: cart.map((i) => ({ product_id: Number(i.id), quantity: i.qty })),
      }
      if (useNewAddress) {
        payload.address = {
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
          address_line1: form.address_line1.trim(),
          address_line2: form.address_line2.trim() || null,
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
        }
      } else {
        payload.address_id = Number(selectedAddressId)
      }
      const order = await api.placeOrder(payload)
      clearCart()
      setToast(`Order #${order.id} placed!`)
      navigate(`/order/${order.id}`, { replace: true })
    } catch (err) {
      setError(err.message || 'Could not place order — try again.')
    } finally {
      setPlacing(false)
    }
  }

  return (
    <main className="section">
      <h1 className="section-title" style={{ marginBottom: 24 }}>Checkout</h1>
      {user && !user.is_verified && (
        <div className="verify-banner">
          <span>
            <strong>Verify your email</strong> — we sent a link to{' '}
            <strong>{user.email}</strong>. Open it before placing an order.
          </span>
          <button type="button" onClick={resendVerification} disabled={resending}>
            {resending ? 'Sending…' : 'Resend'}
          </button>
        </div>
      )}
      <div className="checkout-page">
        <form className="checkout-form-page" onSubmit={submit}>
          <h3>Shipping address</h3>
          {!addrLoading && addresses.length > 0 && (
            <>
              <label className="row-check">
                <input
                  type="radio"
                  checked={!useNewAddress}
                  onChange={() => setUseNewAddress(false)}
                />
                <span>Use a saved address</span>
              </label>
              {!useNewAddress && (
                <select
                  value={selectedAddressId}
                  onChange={(e) => setSelectedAddressId(e.target.value)}
                  disabled={placing}
                  style={{ padding: 12, borderRadius: 12, border: '1px solid var(--line)' }}
                >
                  {addresses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.full_name} · {a.address_line1}, {a.city} — {a.pincode}
                    </option>
                  ))}
                </select>
              )}
              <label className="row-check">
                <input
                  type="radio"
                  checked={useNewAddress}
                  onChange={() => setUseNewAddress(true)}
                />
                <span>Ship to a new address</span>
              </label>
            </>
          )}
          {useNewAddress && (
            <>
              <label>
                <span>Full name</span>
                <input type="text" required value={form.full_name} onChange={onChange('full_name')} disabled={placing} />
              </label>
              <label>
                <span>Phone</span>
                <input type="tel" required pattern="[\d\s+\-()]{7,}" value={form.phone} onChange={onChange('phone')} disabled={placing} />
              </label>
              <label>
                <span>Address line 1</span>
                <input type="text" required value={form.address_line1} onChange={onChange('address_line1')} disabled={placing} />
              </label>
              <label>
                <span>Address line 2 (optional)</span>
                <input type="text" value={form.address_line2} onChange={onChange('address_line2')} disabled={placing} />
              </label>
              <label>
                <span>City</span>
                <input type="text" required value={form.city} onChange={onChange('city')} disabled={placing} />
              </label>
              <label>
                <span>State</span>
                <input type="text" required value={form.state} onChange={onChange('state')} disabled={placing} />
              </label>
              <label>
                <span>Pincode</span>
                <input type="text" required value={form.pincode} onChange={onChange('pincode')} disabled={placing} pattern="\d{5,6}" />
              </label>
            </>
          )}
          {error && <p style={{ color: '#c0392b', fontSize: 13 }}>⚠ {error}</p>}
          <button type="submit" className="checkout-btn" disabled={placing}>
            {placing ? 'Placing order…' : `Place order · ${formatINR(total)}`}
          </button>
        </form>

        <aside className="cart-summary">
          <h3>Order summary</h3>
          {cart.map((item) => (
            <div key={item.id} className="summary-row">
              <span>{item.name} × {item.qty}</span>
              <span>{formatINR(item.price * item.qty)}</span>
            </div>
          ))}
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
        </aside>
      </div>
    </main>
  )
}
