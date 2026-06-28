import { useEffect, useMemo, useState } from 'react'
import { api } from '../../api'
import { FALLBACK_IMG } from '../../utils'
import { useAdminPage } from '../../components/admin/useAdminPage'

export default function AdminBrands() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const headerRight = useMemo(
    () => (
      <button type="button" className="btn btn-primary" onClick={() => setEditing({})}>
        + Add brand
      </button>
    ),
    [],
  )
  useAdminPage({
    title: 'Brands',
    subtitle: 'Manufacturers and labels carried in your store.',
    right: headerRight,
  })

  const load = async () => {
    try {
      setBrands(await api.listBrands())
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [])

  const del = async (id) => {
    if (!window.confirm('Delete this brand?')) return
    setBusyId(id)
    try {
      await api.adminDeleteBrand(id)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      {error && <p style={{ color: '#c0392b' }}>⚠ {error}</p>}
      {loading ? <p>Loading…</p> : (
        <div className="admin-card admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Logo</th>
              <th>Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b) => (
              <tr key={b.id} className={!b.is_active ? 'inactive' : ''}>
                <td><img src={b.logo_url || FALLBACK_IMG} alt={b.name} className="admin-thumb" /></td>
                <td><strong>{b.name}</strong></td>
                <td>{b.description || '—'}</td>
                <td>
                  <span className={`pill ${b.is_active ? 'pill-on' : 'pill-off'}`}>
                    {b.is_active ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button type="button" onClick={() => setEditing(b)} disabled={busyId === b.id}>Edit</button>
                    <button type="button" className="danger" onClick={() => del(b.id)} disabled={busyId === b.id}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {brands.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>
                No brands yet.
              </td></tr>
            )}
          </tbody>
        </table>
        </div>
      )}
      {editing && (
        <BrandForm
          brand={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={async () => { setEditing(null); await load() }}
        />
      )}
    </div>
  )
}

function BrandForm({ brand, onClose, onSaved }) {
  const isEdit = Boolean(brand?.id)
  const [form, setForm] = useState({
    name: brand?.name || '',
    description: brand?.description || '',
    is_active: brand?.is_active ?? true,
  })
  const [file, setFile] = useState(null)
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
      if (isEdit) {
        await api.adminUpdateBrand(brand.id, {
          name: form.name,
          description: form.description || null,
          is_active: form.is_active,
        })
      } else {
        const fd = new FormData()
        fd.append('name', form.name)
        if (form.description) fd.append('description', form.description)
        if (file) fd.append('logo', file)
        await api.adminCreateBrand(fd)
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
          <h2>{isEdit ? 'Edit brand' : 'Add brand'}</h2>
          <button type="button" onClick={onClose}>×</button>
        </div>
        <form onSubmit={submit} className="modal-body">
          <label>
            <span>Name *</span>
            <input type="text" required value={form.name} onChange={set('name')} disabled={saving} />
          </label>
          <label>
            <span>Description</span>
            <textarea rows={3} value={form.description} onChange={set('description')} disabled={saving} />
          </label>
          {isEdit && (
            <label className="row-check">
              <input type="checkbox" checked={form.is_active} onChange={set('is_active')} />
              Active
            </label>
          )}
          {!isEdit && (
            <label>
              <span>Logo (optional)</span>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} disabled={saving} />
            </label>
          )}
          {error && <p style={{ color: '#c0392b' }}>⚠ {error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="checkout-btn" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
