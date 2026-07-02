import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../../api'
import { FALLBACK_IMG } from '../../utils'
import { readCache, writeCache } from '../../cache'
import { useAdminPage } from '../../components/admin/useAdminPage'

const CACHE_KEY = 'admin:brands'

export default function AdminBrands() {
  const cached = readCache(CACHE_KEY)?.data
  const [brands, setBrands] = useState(cached || [])
  const [loading, setLoading] = useState(!cached)
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

  const load = useCallback(async (opts = {}) => {
    const { force = false } = opts
    if (!force) {
      const fresh = readCache(CACHE_KEY)?.data
      if (fresh) { setBrands(fresh); setLoading(false) }
    }
    try {
      const rows = await api.listBrands()
      setBrands(rows)
      writeCache(CACHE_KEY, rows)
      setError('')
    } catch (err) {
      const hadCached = !!readCache(CACHE_KEY)?.data
      if (!hadCached) setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useAdminPage({
    title: 'Brands',
    subtitle: 'Manufacturers and labels carried in your store.',
    right: headerRight,
    onRefresh: load,
  })

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const del = async (id) => {
    if (!window.confirm('Delete this brand?')) return
    setBusyId(id)
    try {
      await api.adminDeleteBrand(id)
      await load({ force: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      {error && <p className="text-danger">⚠ {error}</p>}
      {loading ? <p>Loading…</p> : (
        <div className="bg-surface border border-line rounded-md shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full border-separate border-spacing-0 bg-surface border border-line rounded-md overflow-hidden text-sm">
          <thead>
            <tr>
              <th className="bg-bg px-3.5 py-3 text-left border-b border-line font-semibold text-xs uppercase tracking-[0.6px] text-ink-soft">Logo</th>
              <th className="bg-bg px-3.5 py-3 text-left border-b border-line font-semibold text-xs uppercase tracking-[0.6px] text-ink-soft">Name</th>
              <th className="bg-bg px-3.5 py-3 text-left border-b border-line font-semibold text-xs uppercase tracking-[0.6px] text-ink-soft">Description</th>
              <th className="bg-bg px-3.5 py-3 text-left border-b border-line font-semibold text-xs uppercase tracking-[0.6px] text-ink-soft">Status</th>
              <th className="bg-bg px-3.5 py-3 text-left border-b border-line font-semibold text-xs uppercase tracking-[0.6px] text-ink-soft">Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b) => (
              <tr key={b.id} className={!b.is_active ? 'opacity-55' : ''}>
                <td className="px-3.5 py-3 border-b border-line align-middle"><img src={b.logo_url || FALLBACK_IMG} alt={b.name} className="w-14 h-14 object-cover rounded-[8px] bg-bg" /></td>
                <td className="px-3.5 py-3 border-b border-line align-middle"><strong>{b.name}</strong></td>
                <td className="px-3.5 py-3 border-b border-line align-middle">{b.description || '—'}</td>
                <td className="px-3.5 py-3 border-b border-line align-middle">
                  <span className={`inline-block px-2.5 py-1 text-xs rounded-full font-semibold ${b.is_active ? 'bg-[#e6f3e9] text-[#2f7a3a]' : 'bg-[#efe6dd] text-muted'}`}>
                    {b.is_active ? 'Active' : 'Hidden'}
                  </span>
                </td>
                <td className="px-3.5 py-3 border-b border-line align-middle">
                  <div className="flex gap-1.5 flex-wrap">
                    <button type="button" className="px-2.5 py-1.5 border border-line rounded-[8px] bg-surface text-ink text-[13px] font-medium hover:enabled:bg-bg" onClick={() => setEditing(b)} disabled={busyId === b.id}>Edit</button>
                    <button type="button" className="px-2.5 py-1.5 border border-[#e7c2bd] rounded-[8px] bg-surface text-danger text-[13px] font-medium hover:enabled:bg-[#fbe9e7]" onClick={() => del(b.id)} disabled={busyId === b.id}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {brands.length === 0 && (
              <tr><td colSpan={5} className="px-3.5 py-6 border-b-0 text-center text-muted">
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
          onSaved={async () => { setEditing(null); await load({ force: true }) }}
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
    <div className="fixed inset-0 bg-ink/50 grid place-items-center z-[200] p-5 overflow-y-auto" onClick={onClose}>
      <div className="bg-surface rounded-lg w-full max-w-[640px] max-h-[calc(100vh-40px)] overflow-y-auto shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-5 border-b border-line flex justify-between items-center">
          <h2 className="m-0 font-serif text-2xl">{isEdit ? 'Edit brand' : 'Add brand'}</h2>
          <button type="button" className="bg-transparent border-none text-[28px] leading-none text-muted cursor-pointer" onClick={onClose}>×</button>
        </div>
        <form onSubmit={submit} className="p-6 flex flex-col gap-3.5">
          <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
            <span>Name *</span>
            <input type="text" required value={form.name} onChange={set('name')} disabled={saving} className="px-[14px] py-[11px] border border-line rounded-[10px] font-sans text-sm text-ink bg-white outline-none focus:border-accent" />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
            <span>Description</span>
            <textarea rows={3} value={form.description} onChange={set('description')} disabled={saving} className="px-[14px] py-[11px] border border-line rounded-[10px] font-sans text-sm text-ink bg-white outline-none focus:border-accent" />
          </label>
          {isEdit && (
            <label className="flex flex-row items-center gap-2 text-[14px] text-ink">
              <input type="checkbox" checked={form.is_active} onChange={set('is_active')} />
              Active
            </label>
          )}
          {!isEdit && (
            <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
              <span>Logo (optional)</span>
              <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} disabled={saving} className="px-[14px] py-[11px] border border-line rounded-[10px] font-sans text-sm text-ink bg-white outline-none focus:border-accent" />
            </label>
          )}
          {error && <p className="text-danger text-[13px]">⚠ {error}</p>}
          <div className="flex justify-end gap-2.5 mt-2 max-sm:flex-col-reverse max-sm:gap-2">
            <button type="button" className="px-[22px] py-[11px] rounded-full border border-line bg-surface font-semibold text-sm max-sm:w-full max-sm:min-h-[46px]" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="px-[22px] py-[11px] rounded-full bg-ink text-white border-0 font-semibold text-sm hover:enabled:bg-accent-deep max-sm:w-full max-sm:min-h-[46px]" disabled={saving}>
              {saving ? 'Saving…' : isEdit ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
