import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../../api'
import { FALLBACK_IMG, formatINR } from '../../utils'
import { readCache, writeCache } from '../../cache'
import { useAdminPage } from '../../components/admin/useAdminPage'
import RowsSkeleton from '../../components/RowsSkeleton'
import ProductForm from './ProductForm'

const CACHE_KEY = 'admin:products'

export default function AdminProducts() {
  const cached = readCache(CACHE_KEY)?.data
  const [products, setProducts] = useState(cached || [])
  // No loader spinner on a re-visit if we already have something to show.
  const [loading, setLoading] = useState(!cached)
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
  const load = useCallback(async (opts = {}) => {
    const { force = false } = opts
    if (!force) {
      const fresh = readCache(CACHE_KEY)?.data
      if (fresh) {
        setProducts(fresh)
        setLoading(false)
        // Still fall through to refetch in the background so cache stays warm.
      }
    }
    try {
      const rows = await api.adminListProducts()
      setProducts(rows)
      writeCache(CACHE_KEY, rows)
      setError('')
    } catch (err) {
      // If we had cached data on screen, swallow the error — UI stays usable.
      const hadCached = !!readCache(CACHE_KEY)?.data
      if (!hadCached) setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useAdminPage({
    title: 'Products',
    subtitle: 'Manage your catalog — visibility, stock, pricing.',
    right: headerRight,
    onRefresh: load,
  })

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()

  }, [])

  const onToggle = async (id) => {
    setBusyId(id)
    try {
      await api.adminToggleProduct(id)
      await load({ force: true })
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
      await load({ force: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const totalCount = products.length
  const activeCount = products.filter((p) => p.is_active).length
  const inactiveCount = totalCount - activeCount

  return (
    <div>
      {error && <p className="text-danger">⚠ {error}</p>}

      {/* Product count summary */}
      {!loading && (
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2 bg-surface border border-line rounded-[10px] shadow-sm">
            <span className="text-[22px] font-bold text-ink font-serif">{totalCount}</span>
            <span className="text-[13px] text-muted font-medium">Total Products</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#e2efe5] border border-[#b9d9c0] rounded-[10px]">
            <span className="w-2 h-2 rounded-full bg-[#2f7a3a] inline-block" />
            <span className="text-[13px] font-semibold text-[#2f7a3a]">{activeCount} Active</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[#fbe4e0] border border-[#f0c4bc] rounded-[10px]">
            <span className="w-2 h-2 rounded-full bg-[#c0392b] inline-block" />
            <span className="text-[13px] font-semibold text-danger">{inactiveCount} Inactive</span>
          </div>
        </div>
      )}

      {loading ? (
        <RowsSkeleton rows={6} />
      ) : (
        <div className="bg-surface border border-line rounded-md shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full border-separate border-spacing-0 bg-surface border border-line rounded-md overflow-hidden text-sm">
          <thead>
            <tr>
              <th className="bg-bg px-3.5 py-3 text-left border-b border-line font-semibold text-xs uppercase tracking-[0.6px] text-ink-soft">Image</th>
              <th className="bg-bg px-3.5 py-3 text-left border-b border-line font-semibold text-xs uppercase tracking-[0.6px] text-ink-soft">Name</th>
              <th className="bg-bg px-3.5 py-3 text-left border-b border-line font-semibold text-xs uppercase tracking-[0.6px] text-ink-soft">Category</th>
              <th className="bg-bg px-3.5 py-3 text-left border-b border-line font-semibold text-xs uppercase tracking-[0.6px] text-ink-soft">Brand</th>
              <th className="bg-bg px-3.5 py-3 text-left border-b border-line font-semibold text-xs uppercase tracking-[0.6px] text-ink-soft">Price</th>
              <th className="bg-bg px-3.5 py-3 text-left border-b border-line font-semibold text-xs uppercase tracking-[0.6px] text-ink-soft">Stock</th>
              <th className="bg-bg px-3.5 py-3 text-left border-b border-line font-semibold text-xs uppercase tracking-[0.6px] text-ink-soft">Status</th>
              <th className="bg-bg px-3.5 py-3 text-left border-b border-line font-semibold text-xs uppercase tracking-[0.6px] text-ink-soft">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className={!p.is_active ? 'opacity-55' : ''}>
                <td className="px-3.5 py-3 border-b border-line align-middle">
                  <img src={p.image || FALLBACK_IMG} alt={p.name} loading="lazy" decoding="async" className="w-14 h-14 object-cover rounded-[8px] bg-bg" />
                </td>
                <td className="px-3.5 py-3 border-b border-line align-middle">{p.name}</td>
                <td className="px-3.5 py-3 border-b border-line align-middle">{p.category}</td>
                <td className="px-3.5 py-3 border-b border-line align-middle">{p.brand}</td>
                <td className="px-3.5 py-3 border-b border-line align-middle">{formatINR(p.price)}</td>
                <td className="px-3.5 py-3 border-b border-line align-middle">{p.stock_quantity ?? p.stock ?? 0}</td>
                <td className="px-3.5 py-3 border-b border-line align-middle">
                  <button
                    type="button"
                    className={`border-none cursor-pointer transition-all font-sans text-[13px] font-semibold px-[26px] py-2 rounded-full min-w-24 disabled:opacity-60 disabled:cursor-wait active:scale-[0.97] ${p.is_active ? 'bg-[#e2efe5] text-[#2f7a3a] hover:enabled:bg-[#d3e7d8]' : 'bg-[#fbe4e0] text-danger hover:enabled:bg-[#f6cec6]'}`}
                    onClick={() => onToggle(p.id)}
                    disabled={busyId === p.id}
                    title={p.is_active ? 'Click to hide this product' : 'Click to make this product active'}
                  >
                    {busyId === p.id ? '…' : p.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-3.5 py-3 border-b border-line align-middle">
                  <div className="flex gap-1.5 flex-wrap">
                    <button
                      type="button"
                      className="px-2.5 py-1.5 border border-line rounded-[8px] bg-surface text-ink text-[13px] font-medium hover:enabled:bg-bg"
                      onClick={() => setEditing(p)}
                      disabled={busyId === p.id}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="px-2.5 py-1.5 border border-[#e7c2bd] rounded-[8px] bg-surface text-danger text-[13px] font-medium hover:enabled:bg-[#fbe9e7]"
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
              <tr><td colSpan={8} className="px-3.5 py-6 border-b-0 text-center text-muted">
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
            await load({ force: true })
          }}
        />
      )}
    </div>
  )
}
