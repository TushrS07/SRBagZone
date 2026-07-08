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
      <main className="max-w-[1240px] mx-auto mt-[70px] px-7 max-sm:px-4">
        <h1 className="font-serif text-[42px] font-medium m-0 tracking-[-0.5px]">Checkout</h1>
        <p className="text-muted">Your cart is empty.</p>
        <Link to="/" className="mt-4 inline-block px-[26px] py-[14px] rounded-full bg-accent text-[#ffffff] font-semibold text-[14.5px] tracking-[0.3px]">
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
      setToast('Verification code sent — check your inbox.')
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
    <main className="max-w-[1240px] mx-auto mt-[40px] px-7 max-sm:px-4">
      <h1 className="font-serif text-[42px] font-medium m-0 tracking-[-0.5px] mb-6">Checkout</h1>
      {user && !user.is_verified && (
        <div className="bg-[#fff5e6] border border-[#f4d4a3] text-[#6b3f0a] px-5 py-3.5 rounded-md mb-5 flex justify-between items-center gap-4 text-sm max-sm:flex-col max-sm:items-start">
          <span>
            <strong>Verify your email</strong> — we sent a 6-digit code to{' '}
            <strong>{user.email}</strong>. Verify before placing an order.
          </span>
          <div className="flex items-center gap-2 max-sm:w-full">
            <button type="button"
              onClick={() => navigate('/verify-email', { state: { email: user.email, from: '/checkout' } })}
              className="bg-ink text-[#ffffff] px-4 py-2 rounded-full font-semibold text-[13px] whitespace-nowrap">
              Verify now
            </button>
            <button type="button" onClick={resendVerification} disabled={resending}
              className="text-[#6b3f0a] px-2 py-2 font-semibold text-[13px] whitespace-nowrap underline disabled:opacity-60">
              {resending ? 'Sending…' : 'Resend'}
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 gap-8 items-start tablet:grid-cols-[1.4fr_1fr]">
        <form className="flex flex-col gap-3.5 bg-surface border border-line rounded-lg p-7" onSubmit={submit}>
          <h3 className="m-0 font-serif text-[22px]">Shipping address</h3>
          {!addrLoading && addresses.length > 0 && (
            <>
              <label className="flex flex-row items-center gap-2 text-sm text-ink">
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
                  className="px-[14px] py-3 border border-line rounded-[12px] font-sans text-sm text-ink bg-white outline-none focus:border-accent"
                >
                  {addresses.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.full_name} · {a.address_line1}, {a.city} — {a.pincode}
                    </option>
                  ))}
                </select>
              )}
              <label className="flex flex-row items-center gap-2 text-sm text-ink">
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
              <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
                <span>Full name</span>
                <input type="text" required value={form.full_name} onChange={onChange('full_name')} disabled={placing}
                  className="px-[14px] py-3 border border-line rounded-[12px] font-sans text-sm text-ink bg-white outline-none resize-y focus:border-accent disabled:bg-bg disabled:text-muted" />
              </label>
              <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
                <span>Phone</span>
                <input type="tel" required pattern="[\d\s+\-()]{7,}" value={form.phone} onChange={onChange('phone')} disabled={placing}
                  className="px-[14px] py-3 border border-line rounded-[12px] font-sans text-sm text-ink bg-white outline-none resize-y focus:border-accent disabled:bg-bg disabled:text-muted" />
              </label>
              <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
                <span>Address line 1</span>
                <input type="text" required value={form.address_line1} onChange={onChange('address_line1')} disabled={placing}
                  className="px-[14px] py-3 border border-line rounded-[12px] font-sans text-sm text-ink bg-white outline-none resize-y focus:border-accent disabled:bg-bg disabled:text-muted" />
              </label>
              <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
                <span>Address line 2 (optional)</span>
                <input type="text" value={form.address_line2} onChange={onChange('address_line2')} disabled={placing}
                  className="px-[14px] py-3 border border-line rounded-[12px] font-sans text-sm text-ink bg-white outline-none resize-y focus:border-accent disabled:bg-bg disabled:text-muted" />
              </label>
              <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
                <span>City</span>
                <input type="text" required value={form.city} onChange={onChange('city')} disabled={placing}
                  className="px-[14px] py-3 border border-line rounded-[12px] font-sans text-sm text-ink bg-white outline-none resize-y focus:border-accent disabled:bg-bg disabled:text-muted" />
              </label>
              <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
                <span>State</span>
                <input type="text" required value={form.state} onChange={onChange('state')} disabled={placing}
                  className="px-[14px] py-3 border border-line rounded-[12px] font-sans text-sm text-ink bg-white outline-none resize-y focus:border-accent disabled:bg-bg disabled:text-muted" />
              </label>
              <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
                <span>Pincode</span>
                <input type="text" required value={form.pincode} onChange={onChange('pincode')} disabled={placing} pattern="\d{5,6}"
                  className="px-[14px] py-3 border border-line rounded-[12px] font-sans text-sm text-ink bg-white outline-none resize-y focus:border-accent disabled:bg-bg disabled:text-muted" />
              </label>
            </>
          )}
          {error && <p className="text-danger text-[13px]">⚠ {error}</p>}
          <button type="submit" className="p-4 bg-ink text-[#ffffff] rounded-full font-semibold text-[15px] transition-colors hover:enabled:bg-accent-deep disabled:opacity-60 disabled:cursor-not-allowed" disabled={placing}>
            {placing ? 'Placing order…' : `Place order · ${formatINR(total)}`}
          </button>
        </form>

        <aside className="bg-surface border border-line rounded-lg p-6 flex flex-col gap-3 static tablet:sticky tablet:top-[90px]">
          <h3 className="m-0 mb-2 font-serif text-[22px]">Order summary</h3>
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between text-sm text-ink-soft">
              <span>{item.name} × {item.qty}</span>
              <span>{formatINR(item.price * item.qty)}</span>
            </div>
          ))}
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
        </aside>
      </div>
    </main>
  )
}
