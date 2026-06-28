import { useEffect, useMemo, useState } from 'react'
import { api } from '../../api'
import { useAdminPage } from '../../components/admin/useAdminPage'

export default function AdminCategories() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [busyId, setBusyId] = useState(null)

  const headerRight = useMemo(
    () => (
      <button type="button" className="btn btn-primary" onClick={() => setEditing({})}>
        + Add category
      </button>
    ),
    [],
  )
  useAdminPage({
    title: 'Categories',
    subtitle: 'Buckets your customers use to browse the catalog.',
    right: headerRight,
  })

  const load = async () => {
    try {
      setItems(await api.listCategories())
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
    if (!window.confirm('Delete this category?')) return
    setBusyId(id)
    try {
      await api.adminDeleteCategory(id)
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
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id}>
                <td><strong>{c.name}</strong></td>
                <td>{c.description || '—'}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" onClick={() => setEditing(c)} disabled={busyId === c.id}>Edit</button>
                    <button type="button" className="danger" onClick={() => del(c.id)} disabled={busyId === c.id}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>
                No categories yet.
              </td></tr>
            )}
          </tbody>
        </table>
        </div>
      )}
      {editing && (
        <CategoryForm
          category={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={async () => { setEditing(null); await load() }}
        />
      )}
    </div>
  )
}

function CategoryForm({ category, onClose, onSaved }) {
  const isEdit = Boolean(category?.id)
  const [form, setForm] = useState({
    name: category?.name || '',
    description: category?.description || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const body = {
        name: form.name,
        description: form.description || null,
      }
      if (isEdit) await api.adminUpdateCategory(category.id, body)
      else await api.adminCreateCategory(body)
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
          <h2>{isEdit ? 'Edit category' : 'Add category'}</h2>
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
