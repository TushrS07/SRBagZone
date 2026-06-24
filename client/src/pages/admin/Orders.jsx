import { Fragment, useEffect, useState } from 'react'
import { api } from '../../api'
import { formatINR } from '../../utils'

const STATUSES = ['pending', 'acknowledged', 'completed', 'cancelled']

function fmtDate(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return iso
  }
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [expanded, setExpanded] = useState(null)

  const load = async () => {
    try {
      setOrders(await api.adminListOrders())
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

  const setStatus = async (id, order_status) => {
    setBusyId(id)
    try {
      await api.adminUpdateOrderStatus(id, order_status)
      await load()
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
      await load()
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
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const rejectPayment = async (paymentId) => {
    const remarks = window.prompt('Reason for rejection?') || ''
    setBusyId(paymentId)
    try {
      await api.adminRejectPayment(paymentId, remarks)
      await load()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="admin-page-head">
        <h1>Orders</h1>
        <button type="button" onClick={load}>Refresh</button>
      </div>
      {error && <p style={{ color: '#c0392b' }}>⚠ {error}</p>}
      {loading ? <p>Loading…</p> : (
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
            {orders.map((o) => (
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
            {orders.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>
                No orders yet.
              </td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
