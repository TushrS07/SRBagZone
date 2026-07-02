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
    <div className="fixed inset-0 bg-ink/50 grid place-items-center z-[200] p-5 overflow-y-auto" onClick={onClose}>
      <div className="bg-surface rounded-lg w-full max-w-[640px] max-h-[calc(100vh-40px)] overflow-y-auto shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-line flex justify-between items-center">
          <h2 className="m-0 font-serif text-2xl">{isEdit ? 'Edit product' : 'Add product'}</h2>
          <button type="button" className="bg-transparent border-none text-[28px] leading-none text-muted cursor-pointer" onClick={onClose} aria-label="Close">×</button>
        </div>
        <form onSubmit={submit} className="p-6 flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
            <span>Name *</span>
            <input type="text" required value={form.name} onChange={set('name')} disabled={saving} className="px-[14px] py-[11px] border border-line rounded-[10px] font-sans text-sm text-ink bg-white outline-none focus:border-accent" />
          </label>
          <div className="grid grid-cols-2 gap-3.5 max-sm:grid-cols-1">
            <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
              <span>Price (₹) *</span>
              <input type="number" step="0.01" required value={form.price} onChange={set('price')} disabled={saving} className="px-[14px] py-[11px] border border-line rounded-[10px] font-sans text-sm text-ink bg-white outline-none focus:border-accent" />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
              <span>Stock quantity</span>
              <input type="number" value={form.stock_quantity} onChange={set('stock_quantity')} disabled={saving} className="px-[14px] py-[11px] border border-line rounded-[10px] font-sans text-sm text-ink bg-white outline-none focus:border-accent" />
            </label>
            <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
              <span>Category</span>
              <select value={form.category_id} onChange={set('category_id')} disabled={saving} className="px-[14px] py-[11px] border border-line rounded-[10px] font-sans text-sm text-ink bg-white outline-none focus:border-accent">
                <option value="">— none —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
              <span>Brand</span>
              <select value={form.brand_id} onChange={set('brand_id')} disabled={saving} className="px-[14px] py-[11px] border border-line rounded-[10px] font-sans text-sm text-ink bg-white outline-none focus:border-accent">
                <option value="">— none —</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
            <span>Description</span>
            <textarea rows={3} value={form.description} onChange={set('description')} disabled={saving} className="px-[14px] py-[11px] border border-line rounded-[10px] font-sans text-sm text-ink bg-white outline-none focus:border-accent" />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
            <span>Images {isEdit && '(adds to existing)'}</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setFiles(Array.from(e.target.files || []))}
              disabled={saving}
              className="px-[14px] py-[11px] border border-line rounded-[10px] font-sans text-sm text-ink bg-white outline-none focus:border-accent"
            />
          </label>
          {error && <p className="text-danger text-[13px]">⚠ {error}</p>}
          <div className="flex justify-end gap-2.5 mt-2 max-sm:flex-col-reverse max-sm:gap-2">
            <button type="button" className="px-[22px] py-[11px] rounded-full border border-line bg-surface font-semibold text-sm max-sm:w-full max-sm:min-h-[46px]" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="px-[22px] py-[11px] rounded-full bg-ink text-white border-0 font-semibold text-sm hover:enabled:bg-accent-deep max-sm:w-full max-sm:min-h-[46px]" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
