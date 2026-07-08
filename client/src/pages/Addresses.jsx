import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useApp } from '../useApp'
import Skeleton from '../components/Skeleton'

export default function Addresses() {
  const { setToast } = useApp()
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // null | {} (new) | address (edit)
  const [busyId, setBusyId] = useState(null)

  const load = async () => {
    try {
      setAddresses(await api.listMyAddresses())
      setError('')
    } catch (err) {
      setError(err.message || 'Could not load addresses')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [])

  const remove = async (id) => {
    if (!window.confirm('Delete this address?')) return
    setBusyId(id)
    try {
      await api.deleteAddress(id)
      setToast('Address deleted')
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const setDefault = async (a) => {
    setBusyId(a.id)
    try {
      await api.updateAddress(a.id, { is_default: true })
      setToast(`${a.full_name}'s address set as default`)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return (
      <main className="max-w-[1240px] mx-auto mt-[70px] px-7 max-sm:px-4">
        <Skeleton className="h-10 w-60 mb-7" />
        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="p-5 bg-surface border border-line rounded-md flex flex-col gap-3">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-[1240px] mx-auto mt-[70px] px-7 max-sm:px-4">
      <div className="flex justify-between items-start gap-5 mb-7 flex-wrap">
        <div>
          <h1 className="font-serif text-[42px] font-medium m-0 tracking-[-0.5px]">My addresses</h1>
          <p className="text-muted text-sm mt-1.5">
            Saved addresses are available at checkout.
          </p>
        </div>
        <button type="button" className="px-[26px] py-[14px] rounded-full bg-accent text-[#ffffff] font-semibold text-[14.5px] tracking-[0.3px] hover:bg-[#d18638] transition-colors" onClick={() => setEditing({})}>
          + Add address
        </button>
      </div>

      {error && <p className="text-danger">⚠ {error}</p>}

      {addresses.length === 0 ? (
        <div className="py-[50px] text-center text-muted">
          <p className="text-base mb-4">You haven't saved any addresses yet.</p>
          <Link to="/" className="inline-block px-[28px] py-[14px] rounded-full border border-ink text-ink bg-transparent font-semibold text-[15px] hover:bg-ink hover:text-[#ffffff] transition-colors">Continue shopping</Link>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
          {addresses.map((a) => (
            <article
              key={a.id}
              className={`relative bg-surface border rounded-md p-[22px] pb-[18px] flex flex-col gap-1.5 transition-colors hover:border-accent hover:shadow-sm ${
                a.is_default
                  ? 'border-accent bg-[linear-gradient(180deg,var(--color-accent-soft)_0%,white_25%)]'
                  : 'border-line'
              }`}
            >
              {a.is_default && (
                <span className="absolute top-3.5 right-4 bg-accent text-[#ffffff] px-2.5 py-[3px] rounded-full text-[11px] font-semibold uppercase tracking-[0.4px]">
                  Default
                </span>
              )}
              <div className="font-bold text-base text-ink">{a.full_name}</div>
              <div className="text-[13px] text-ink-soft mb-1.5">{a.phone}</div>
              <div className="text-sm text-ink-soft leading-[1.5] flex-1">
                {a.address_line1}
                {a.address_line2 && (<><br />{a.address_line2}</>)}
                <br />
                {a.city}, {a.state} — {a.pincode}
              </div>
              <div className="flex gap-2 flex-wrap mt-3.5 pt-3.5 border-t border-line">
                {!a.is_default && (
                  <button
                    type="button"
                    onClick={() => setDefault(a)}
                    disabled={busyId === a.id}
                    className="px-3 py-1.5 border border-line rounded-lg bg-surface text-ink text-[13px] font-medium hover:enabled:bg-bg hover:enabled:border-accent disabled:opacity-60"
                  >
                    Set as default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditing(a)}
                  disabled={busyId === a.id}
                  className="px-3 py-1.5 border border-line rounded-lg bg-surface text-ink text-[13px] font-medium hover:enabled:bg-bg hover:enabled:border-accent disabled:opacity-60"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => remove(a.id)}
                  disabled={busyId === a.id}
                  className="px-3 py-1.5 border border-[#e7c2bd] rounded-lg bg-surface text-danger text-[13px] font-medium hover:enabled:bg-[#fbe9e7] disabled:opacity-60"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && (
        <AddressForm
          address={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null)
            await load()
          }}
          onToast={setToast}
        />
      )}
    </main>
  )
}

function AddressForm({ address, onClose, onSaved, onToast }) {
  const isEdit = Boolean(address?.id)
  const [form, setForm] = useState({
    full_name: address?.full_name || '',
    phone: address?.phone || '',
    address_line1: address?.address_line1 || '',
    address_line2: address?.address_line2 || '',
    city: address?.city || '',
    state: address?.state || '',
    pincode: address?.pincode || '',
    is_default: address?.is_default ?? false,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => {
    const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [k]: v }))
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const body = {
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        address_line1: form.address_line1.trim(),
        address_line2: form.address_line2.trim() || null,
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        is_default: form.is_default,
      }
      if (isEdit) {
        await api.updateAddress(address.id, body)
        onToast?.('Address updated')
      } else {
        await api.createAddress(body)
        onToast?.('Address added')
      }
      onSaved()
    } catch (err) {
      setError(err.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-[rgba(26,22,18,0.5)] grid place-items-center z-[200] p-5 overflow-y-auto" onClick={onClose}>
      <div className="bg-surface rounded-lg w-full max-w-[640px] max-h-[calc(100vh-40px)] overflow-y-auto shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-line flex justify-between items-center">
          <h2 className="m-0 font-serif text-2xl">{isEdit ? 'Edit address' : 'Add address'}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="text-[28px] leading-none text-muted">×</button>
        </div>
        <form onSubmit={submit} className="p-6 flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
            <span>Full name *</span>
            <input type="text" required value={form.full_name} onChange={set('full_name')} disabled={saving} autoComplete="name"
              className="px-[14px] py-[11px] border border-line rounded-[10px] font-sans text-sm max-sm:text-base text-ink bg-white outline-none focus:border-accent disabled:bg-bg disabled:text-muted" />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
            <span>Phone *</span>
            <input type="tel" required pattern="[\d\s+\-()]{7,}" value={form.phone} onChange={set('phone')} disabled={saving} autoComplete="tel"
              className="px-[14px] py-[11px] border border-line rounded-[10px] font-sans text-sm max-sm:text-base text-ink bg-white outline-none focus:border-accent disabled:bg-bg disabled:text-muted" />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
            <span>Address line 1 *</span>
            <input type="text" required value={form.address_line1} onChange={set('address_line1')} disabled={saving} autoComplete="address-line1"
              className="px-[14px] py-[11px] border border-line rounded-[10px] font-sans text-sm max-sm:text-base text-ink bg-white outline-none focus:border-accent disabled:bg-bg disabled:text-muted" />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
            <span>Address line 2</span>
            <input type="text" value={form.address_line2} onChange={set('address_line2')} disabled={saving} autoComplete="address-line2"
              className="px-[14px] py-[11px] border border-line rounded-[10px] font-sans text-sm max-sm:text-base text-ink bg-white outline-none focus:border-accent disabled:bg-bg disabled:text-muted" />
          </label>
          <div className="grid grid-cols-2 gap-3.5">
            <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
              <span>City *</span>
              <input type="text" required value={form.city} onChange={set('city')} disabled={saving} autoComplete="address-level2"
                className="px-[14px] py-[11px] border border-line rounded-[10px] font-sans text-sm max-sm:text-base text-ink bg-white outline-none focus:border-accent disabled:bg-bg disabled:text-muted" />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
              <span>State *</span>
              <input type="text" required value={form.state} onChange={set('state')} disabled={saving} autoComplete="address-level1"
                className="px-[14px] py-[11px] border border-line rounded-[10px] font-sans text-sm max-sm:text-base text-ink bg-white outline-none focus:border-accent disabled:bg-bg disabled:text-muted" />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
              <span>Pincode *</span>
              <input type="text" required pattern="\d{5,6}" value={form.pincode} onChange={set('pincode')} disabled={saving} autoComplete="postal-code"
                className="px-[14px] py-[11px] border border-line rounded-[10px] font-sans text-sm max-sm:text-base text-ink bg-white outline-none focus:border-accent disabled:bg-bg disabled:text-muted" />
            </label>
          </div>
          <label className="flex flex-row items-center gap-2 text-sm text-ink">
            <input type="checkbox" checked={form.is_default} onChange={set('is_default')} />
            Set as default address
          </label>
          {error && <p className="text-danger">⚠ {error}</p>}
          <div className="flex justify-end gap-2.5 mt-2">
            <button type="button" onClick={onClose} disabled={saving}
              className="px-[22px] py-[11px] rounded-full border border-line bg-surface font-semibold text-sm disabled:opacity-60">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="px-[22px] py-[11px] rounded-full bg-ink text-[#ffffff] font-semibold text-sm transition-colors hover:enabled:bg-accent-deep disabled:opacity-60 disabled:cursor-not-allowed">
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
