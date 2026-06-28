import { useEffect, useMemo, useState } from 'react'
import { api } from '../../api'
import { FALLBACK_IMG, formatINR } from '../../utils'
import { useAdminPage } from '../../components/admin/useAdminPage'
import ProductForm from './ProductForm'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // null | {} | product
  const [busyId, setBusyId] = useState(null)

  const headerRight = useMemo(
    () => (
      <button type="button" className="btn btn-primary" onClick={() => setEditing({})}>
        + Add product
      </button>
    ),
    [],
  )
  useAdminPage({
    title: 'Products',
    subtitle: 'Manage your catalog — visibility, stock, pricing.',
    right: headerRight,
  })

  const load = async () => {
    try {
      const rows = await api.adminListProducts()
      setProducts(rows)
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // setState only happens after `await api.adminListProducts()` resolves
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
     
  }, [])

  const onToggle = async (id) => {
    setBusyId(id)
    try {
      await api.adminToggleProduct(id)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const onDelete = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    setBusyId(id)
    try {
      await api.adminDeleteProduct(id)
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

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="admin-card admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className={!p.is_active ? 'inactive' : ''}>
                <td>
                  <img src={p.image || FALLBACK_IMG} alt={p.name} className="admin-thumb" />
                </td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{p.brand}</td>
                <td>{formatINR(p.price)}</td>
                <td>{p.stock_quantity ?? p.stock ?? 0}</td>
                <td>
                  <button
                    type="button"
                    className={`pill pill-toggle ${p.is_active ? 'pill-on' : 'pill-off'}`}
                    onClick={() => onToggle(p.id)}
                    disabled={busyId === p.id}
                    title={p.is_active ? 'Click to hide this product' : 'Click to make this product active'}
                  >
                    {busyId === p.id ? '…' : p.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td>
                  <div className="row-actions">
                    <button type="button" onClick={() => setEditing(p)} disabled={busyId === p.id}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => onDelete(p.id)}
                      disabled={busyId === p.id}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>
                No products yet — click <strong>+ Add product</strong> to create your first.
              </td></tr>
            )}
          </tbody>
        </table>
        </div>
      )}

      {editing && (
        <ProductForm
          product={editing.id ? editing : null}
          onClose={() => setEditing(null)}
          onSaved={async () => {
            setEditing(null)
            await load()
          }}
        />
      )}
    </div>
  )
}
