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
      {error && <p style={{ color: '#c0392b' }}>⚠ {error}</p>}

      <div className="orders-filters">
        <div className="orders-filters-row">
          <label className="orders-filter-field">
            <span>Search</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Order # or customer name"
              autoComplete="off"
            />
          </label>
          <label className="orders-filter-field">
            <span>From</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              max={dateTo || undefined}
            />
          </label>
          <label className="orders-filter-field">
            <span>To</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              min={dateFrom || undefined}
            />
          </label>
          {filtersActive && (
            <button type="button" className="btn btn-ghost orders-filter-clear" onClick={clearFilters}>
              Clear
            </button>
          )}
        </div>
        <div className="orders-status-row">
          <span className="orders-status-label">Show:</span>
          {STATUSES.map((s) => (
            <label key={s} className="orders-status-check">
              <input
                type="checkbox"
                checked={!!statusFilter[s]}
                onChange={() => toggleStatusFilter(s)}
              />
              <span>{s}</span>
            </label>
          ))}
        </div>
      </div>

      {loading ? <p>Loading…</p> : (
        <div className="admin-card admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <Fragment key={o.id}>
                <tr>
                  <td>
                    <button
                      type="button"
                      className="link"
                      onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                    >
                      #{o.id} {expanded === o.id ? '▴' : '▾'}
                    </button>
                  </td>
                  <td>{fmtDate(o.created_at)}</td>
                  <td>
                    <div>{o.address?.full_name || '—'}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                      {o.address?.phone || ''}
                    </div>
                  </td>
                  <td>{formatINR(o.total_amount)}</td>
                  <td>
                    <select
                      value={o.order_status}
                      onChange={(e) => setStatus(o.id, e.target.value)}
                      disabled={busyId === o.id}
                    >
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td>
                    <div className="payment-cell">
                      {o.payment?.screenshot_url && (
                        <a
                          href={o.payment.screenshot_url}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="Open screenshot"
                        >
                          <img src={o.payment.screenshot_url} alt="Screenshot" className="payment-thumb" />
                        </a>
                      )}
                      <div>
                        <div>{o.payment?.payment_status || o.payment_status || '—'}</div>
                        {o.payment?.upi_reference_number && (
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                            ref: {o.payment.upi_reference_number}
                          </div>
                        )}
                        {o.payment?.payment_status === 'pending_confirmation' && (
                          <div style={{ marginTop: 4, display: 'flex', gap: 4 }}>
                            <button type="button" onClick={() => confirmPayment(o.payment.id)} disabled={busyId === o.payment.id}>
                              ✓ Confirm
                            </button>
                            <button type="button" className="danger" onClick={() => rejectPayment(o.payment.id)} disabled={busyId === o.payment.id}>
                              ✗ Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <button type="button" className="danger" onClick={() => del(o.id)} disabled={busyId === o.id}>
                      Delete
                    </button>
                  </td>
                </tr>
                {expanded === o.id && (
                  <tr className="expanded-row">
                    <td colSpan={7}>
                      <div className="order-detail-grid">
                        <div>
                          <h4>Items</h4>
                          <ul>
                            {o.items.map((i) => (
                              <li key={i.id}>
                                {i.quantity} × {i.product_name} — {formatINR(i.subtotal)}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4>Shipping address</h4>
                          {o.address ? (
                            <div style={{ fontSize: 13 }}>
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
                            <h4>Remarks</h4>
                            <p style={{ fontSize: 13 }}>{o.payment.remarks}</p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>
                {orders.length === 0
                  ? 'No orders yet.'
                  : 'No orders match the current filters.'}
              </td></tr>
            )}
          </tbody>
        </table>
        </div>
      )}
    </div>
  )
}
