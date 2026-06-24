import { useEffect, useState } from 'react'
import { api } from '../../api'

export default function ProductForm({ product, onClose, onSaved }) {
  const isEdit = Boolean(product?.id)
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [form, setForm] = useState({
    name: product?.name || '',
    price: product?.price ?? '',
    stock_quantity: product?.stock_quantity ?? product?.stock ?? '',
    description: product?.description || '',
    category_id: product?.category_id ? String(product.category_id) : '',
    brand_id: product?.brand_id ? String(product.brand_id) : '',
  })
  const [files, setFiles] = useState([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.listCategories(), api.listBrands()])
      .then(([cats, brs]) => {
        setCategories(cats)
        setBrands(brs)
      })
      .catch(() => {})
  }, [])

  const set = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('price', String(form.price))
      fd.append('stock_quantity', String(form.stock_quantity || 0))
      if (form.description) fd.append('description', form.description)
      if (form.category_id) fd.append('category_id', form.category_id)
      if (form.brand_id) fd.append('brand_id', form.brand_id)
      files.forEach((f) => fd.append('images', f))

      if (isEdit) await api.adminUpdateProduct(product.id, fd)
      else await api.adminCreateProduct(fd)
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
          <h2>{isEdit ? 'Edit product' : 'Add product'}</h2>
          <button type="button" onClick={onClose} aria-label="Close">×</button>
        </div>
        <form onSubmit={submit} className="modal-body">
          <label>
            <span>Name *</span>
            <input type="text" required value={form.name} onChange={set('name')} disabled={saving} />
          </label>
          <div className="form-grid">
            <label>
              <span>Price (₹) *</span>
              <input type="number" step="0.01" required value={form.price} onChange={set('price')} disabled={saving} />
            </label>
            <label>
              <span>Stock quantity</span>
              <input type="number" value={form.stock_quantity} onChange={set('stock_quantity')} disabled={saving} />
            </label>
            <label>
              <span>Category</span>
              <select value={form.category_id} onChange={set('category_id')} disabled={saving}>
                <option value="">— none —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label>
              <span>Brand</span>
              <select value={form.brand_id} onChange={set('brand_id')} disabled={saving}>
                <option value="">— none —</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </label>
          </div>
          <label>
            <span>Description</span>
            <textarea rows={3} value={form.description} onChange={set('description')} disabled={saving} />
          </label>
          <label>
            <span>Images {isEdit && '(adds to existing)'}</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              disabled={saving}
            />
          </label>
          {error && <p style={{ color: '#c0392b' }}>⚠ {error}</p>}
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="checkout-btn" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
