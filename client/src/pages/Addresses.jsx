import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useApp } from '../useApp'

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
    return <main className="section"><p style={{ color: 'var(--muted)' }}>Loading…</p></main>
  }

  return (
    <main className="section">
      <div className="addresses-head">
        <div>
          <h1 className="section-title" style={{ margin: 0 }}>My addresses</h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: 6 }}>
            Saved addresses are available at checkout.
          </p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setEditing({})}>
          + Add address
        </button>
      </div>

      {error && <p style={{ color: '#c0392b' }}>⚠ {error}</p>}

      {addresses.length === 0 ? (
        <div style={{ padding: '50px 0', textAlign: 'center', color: 'var(--muted)' }}>
          <p style={{ fontSize: 16, marginBottom: 16 }}>You haven't saved any addresses yet.</p>
          <Link to="/" className="btn btn-ghost-dark">Continue shopping</Link>
        </div>
      ) : (
        <div className="address-grid">
          {addresses.map((a) => (
            <article key={a.id} className={`address-card ${a.is_default ? 'default' : ''}`}>
              {a.is_default && <span className="address-default-tag">Default</span>}
              <div className="address-name">{a.full_name}</div>
              <div className="address-phone">{a.phone}</div>
              <div className="address-body">
                {a.address_line1}
                {a.address_line2 && (<><br />{a.address_line2}</>)}
                <br />
                {a.city}, {a.state} — {a.pincode}
              </div>
              <div className="address-actions">
                {!a.is_default && (
                  <button
                    type="button"
                    onClick={() => setDefault(a)}
                    disabled={busyId === a.id}
                  >
                    Set as default
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditing(a)}
                  disabled={busyId === a.id}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => remove(a.id)}
                  disabled={busyId === a.id}
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2>{isEdit ? 'Edit address' : 'Add address'}</h2>
          <button type="button" onClick={onClose} aria-label="Close">×</button>
        </div>
        <form onSubmit={submit} className="modal-body">
          <label>
            <span>Full name *</span>
            <input type="text" required value={form.full_name} onChange={set('full_name')} disabled={saving} autoComplete="name" />
          </label>
          <label>
            <span>Phone *</span>
            <input type="tel" required pattern="[\d\s+\-()]{7,}" value={form.phone} onChange={set('phone')} disabled={saving} autoComplete="tel" />
          </label>
          <label>
            <span>Address line 1 *</span>
            <input type="text" required value={form.address_line1} onChange={set('address_line1')} disabled={saving} autoComplete="address-line1" />
          </label>
          <label>
            <span>Address line 2</span>
            <input type="text" value={form.address_line2} onChange={set('address_line2')} disabled={saving} autoComplete="address-line2" />
          </label>
          <div className="form-grid">
            <label>
              <span>City *</span>
              <input type="text" required value={form.city} onChange={set('city')} disabled={saving} autoComplete="address-level2" />
            </label>
            <label>
              <span>State *</span>
              <input type="text" required value={form.state} onChange={set('state')} disabled={saving} autoComplete="address-level1" />
            </label>
            <label>
              <span>Pincode *</span>
              <input type="text" required pattern="\d{5,6}" value={form.pincode} onChange={set('pincode')} disabled={saving} autoComplete="postal-code" />
            </label>
          </div>
          <label className="row-check">
            <input type="checkbox" checked={form.is_default} onChange={set('is_default')} />
            Set as default address
          </label>
          {error && <p style={{ color: '#c0392b' }}>⚠ {error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="checkout-btn" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
