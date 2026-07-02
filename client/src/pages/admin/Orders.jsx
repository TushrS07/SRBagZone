import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../../api'
import { formatINR } from '../../utils'
import { readCache, writeCache } from '../../cache'
import { useAdminPage } from '../../components/admin/useAdminPage'

const CACHE_KEY = 'admin:orders'

const STATUSES = ['pending', 'acknowledged', 'completed', 'cancelled']

function fmtDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

// Toggling a status off removes orders in that bucket from view.
const DEFAULT_STATUS_FILTER = Object.fromEntries(STATUSES.map((s) => [s, true]))

export default function AdminOrders() {
  const cached = readCache(CACHE_KEY)?.data
  const [orders, setOrders] = useState(cached || [])
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [expanded, setExpanded] = useState(null)

  // Filter state — all client-side over the already-loaded list.
  const [query, setQuery] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState(DEFAULT_STATUS_FILTER)

  const toggleStatusFilter = (s) =>
    setStatusFilter((prev) => ({ ...prev, [s]: !prev[s] }))

  const clearFilters = () => {
    setQuery('')
    setDateFrom('')
    setDateTo('')
    setStatusFilter(DEFAULT_STATUS_FILTER)
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    // Parse date inputs as local-day boundaries so a single-day range catches
    // orders placed at any time on that day.
    const fromMs = dateFrom ? new Date(dateFrom + 'T00:00:00').getTime() : null
    const toMs = dateTo ? new Date(dateTo + 'T23:59:59.999').getTime() : null
    return orders.filter((o) => {
      if (q) {
        const idStr = String(o.id).toLowerCase()
        const name = (o.address?.full_name || '').toLowerCase()
        if (!idStr.includes(q) && !name.includes(q)) return false
      }
      if (fromMs != null || toMs != null) {
        const t = o.created_at ? new Date(o.created_at).getTime() : null
        if (t == null) return false
        if (fromMs != null && t < fromMs) return false
        if (toMs != null && t > toMs) return false
      }
      if (!statusFilter[o.order_status]) return false
      return true
    })
  }, [orders, query, dateFrom, dateTo, statusFilter])

  const filtersActive =
    query.trim() !== '' ||
    dateFrom !== '' ||
    dateTo !== '' ||
    STATUSES.some((s) => !statusFilter[s])

  const load = useCallback(async (opts = {}) => {
    const { force = false } = opts
    if (!force) {
      const fresh = readCache(CACHE_KEY)?.data
      if (fresh) { setOrders(fresh); setLoading(false) }
    }
    try {
      const rows = await api.adminListOrders()
      setOrders(rows)
      writeCache(CACHE_KEY, rows)
      setError('')
    } catch (err) {
      const hadCached = !!readCache(CACHE_KEY)?.data
      if (!hadCached) setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const setStatus = async (id, order_status) => {
    setBusyId(id)
    try {
      await api.adminUpdateOrderStatus(id, order_status)
      await load({ force: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const del = async (id) => {
    if (!window.confirm('Delete this order? This cannot be undone.')) return
    setBusyId(id)
    try {
      await api.adminDeleteOrder(id)
      await load({ force: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const confirmPayment = async (paymentId) => {
    setBusyId(paymentId)
    try {
      await api.adminConfirmPayment(paymentId)
      await load({ force: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  useAdminPage({
    title: 'Orders',
    subtitle: filtersActive
      ? `Showing ${filtered.length} of ${orders.length} orders · filters active`
      : `${orders.length} ${orders.length === 1 ? 'order' : 'orders'} · click # to expand details`,
    onRefresh: load,
  })

  const rejectPayment = async (paymentId) => {
    const remarks = window.prompt('Reason for rejection?') || ''
    setBusyId(paymentId)
    try {
      await api.adminRejectPayment(paymentId, remarks)
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
              <th className="bg-bg px-3.5 py-3 text-left border-b border-line font-semibold text-xs uppercase tracking-[0.6px] text-ink-soft">#</th>
              <th className="bg-bg px-3.5 py-3 text-left border-b border-line font-semibold text-xs uppercase tracking-[0.6px] text-ink-soft">Date</th>
              <th className="bg-bg px-3.5 py-3 text-left border-b border-line font-semibold text-xs uppercase tracking-[0.6px] text-ink-soft">Customer</th>
              <th className="bg-bg px-3.5 py-3 text-left border-b border-line font-semibold text-xs uppercase tracking-[0.6px] text-ink-soft">Total</th>
              <th className="bg-bg px-3.5 py-3 text-left border-b border-line font-semibold text-xs uppercase tracking-[0.6px] text-ink-soft">Status</th>
              <th className="bg-bg px-3.5 py-3 text-left border-b border-line font-semibold text-xs uppercase tracking-[0.6px] text-ink-soft">Payment</th>
              <th className="bg-bg px-3.5 py-3 text-left border-b border-line font-semibold text-xs uppercase tracking-[0.6px] text-ink-soft">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <Fragment key={o.id}>
                <tr>
                  <td className="px-3.5 py-3 border-b border-line align-middle">
                    <button
                      type="button"
                      className="border-none bg-transparent text-accent-deep font-semibold p-0 cursor-pointer"
                      onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                    >
                      #{o.id} {expanded === o.id ? '▴' : '▾'}
                    </button>
                  </td>
                  <td className="px-3.5 py-3 border-b border-line align-middle">{fmtDate(o.created_at)}</td>
                  <td className="px-3.5 py-3 border-b border-line align-middle">
                    <div>{o.address?.full_name || '—'}</div>
                    <div className="text-[12px] text-muted">
                      {o.address?.phone || ''}
                    </div>
                  </td>
                  <td className="px-3.5 py-3 border-b border-line align-middle">{formatINR(o.total_amount)}</td>
                  <td className="px-3.5 py-3 border-b border-line align-middle">
                    <select
                      value={o.order_status}
                      onChange={(e) => setStatus(o.id, e.target.value)}
                      disabled={busyId === o.id}
                      className="px-2.5 py-1.5 border border-line rounded-[8px] bg-surface text-[13px] font-sans"
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-3.5 py-3 border-b border-line align-middle">
                    <div className="flex items-center gap-2.5 min-w-[220px]">
                      {o.payment?.screenshot_url && (
                        <a
                          href={o.payment.screenshot_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="Open screenshot"
                        >
                          <img src={o.payment.screenshot_url} alt="Screenshot" className="w-14 h-14 object-cover rounded-[8px] border border-line bg-bg cursor-zoom-in shrink-0 hover:border-accent" />
                        </a>
                      )}
                      <div>
                        <div>{o.payment?.payment_status || o.payment_status || '—'}</div>
                        {o.payment?.upi_reference_number && (
                          <div className="text-[11px] text-muted">
                            ref: {o.payment.upi_reference_number}
                          </div>
                        )}
                        {o.payment?.payment_status === 'pending_confirmation' && (
                          <div className="mt-1 flex gap-1">
                            <button
                              type="button"
                              className="px-2.5 py-1.5 border border-line rounded-[8px] bg-surface text-ink text-[13px] font-medium hover:enabled:bg-bg"
                              onClick={() => confirmPayment(o.payment.id)}
                              disabled={busyId === o.payment.id}
                            >
                              ✓ Confirm
                            </button>
                            <button
                              type="button"
                              className="px-2.5 py-1.5 border border-[#e7c2bd] rounded-[8px] bg-surface text-danger text-[13px] font-medium hover:enabled:bg-[#fbe9e7]"
                              onClick={() => rejectPayment(o.payment.id)}
                              disabled={busyId === o.payment.id}
                            >
                              ✗ Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-3.5 py-3 border-b border-line align-middle">
                    <button
                      type="button"
                      className="px-2.5 py-1.5 border border-[#e7c2bd] rounded-[8px] bg-surface text-danger text-[13px] font-medium hover:enabled:bg-[#fbe9e7]"
                      onClick={() => del(o.id)}
                      disabled={busyId === o.id}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
                {expanded === o.id && (
                  <tr className="bg-bg">
                    <td colSpan={7} className="px-3.5 py-3 border-b border-line align-middle">
                      <div className="grid grid-cols-3 gap-6 py-4 max-[960px]:grid-cols-1">
                        <div>
                          <h4 className="m-0 mb-2 text-[13px] uppercase tracking-[0.6px] text-ink-soft">Items</h4>
                          <ul className="list-none p-0 m-0 flex flex-col gap-1 text-[13px]">
                            {o.items.map((i) => (
                              <li key={i.id}>
                                {i.quantity} × {i.product_name} — {formatINR(i.subtotal)}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="m-0 mb-2 text-[13px] uppercase tracking-[0.6px] text-ink-soft">Shipping address</h4>
                          {o.address ? (
                            <div className="text-[13px]">
                              {o.address.full_name}<br />
                              {o.address.phone}<br />
                              {o.address.address_line1}<br />
                              {o.address.address_line2 && <>{o.address.address_line2}<br /></>}
                              {o.address.city}, {o.address.state} — {o.address.pincode}
                            </div>
                          ) : '—'}
                        </div>
                        {o.payment?.remarks && (
                          <div>
                            <h4 className="m-0 mb-2 text-[13px] uppercase tracking-[0.6px] text-ink-soft">Remarks</h4>
                            <p className="text-[13px]">{o.payment.remarks}</p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={7} className="px-3.5 py-6 border-b-0 text-center text-muted">
                No orders yet.
              </td></tr>
            )}
          </tbody>
        </table>
        </div>
      )}
    </div>
  )
}
