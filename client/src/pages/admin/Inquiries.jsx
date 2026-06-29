import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../../api'
import { readCache, writeCache } from '../../cache'
import { useAdminPage } from '../../components/admin/useAdminPage'
import { useAdminUI } from '../../components/admin/adminUI'

const CACHE_KEY = 'admin:inquiries'

function formatDate(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return (
    d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) +
    ' · ' +
    d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
  )
}

export default function AdminInquiries() {
  const cached = readCache(CACHE_KEY)?.data
  const [inquiries, setInquiries] = useState(cached || [])
  const [loading, setLoading] = useState(!cached)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [filter, setFilter] = useState('all') // all | unread | read
  const { bumpInquiryUnread } = useAdminUI()

  const unreadCount = useMemo(
    () => inquiries.filter((i) => !i.is_read).length,
    [inquiries],
  )

  const filtered = useMemo(() => {
    if (filter === 'unread') return inquiries.filter((i) => !i.is_read)
    if (filter === 'read') return inquiries.filter((i) => i.is_read)
    return inquiries
  }, [inquiries, filter])

  const headerRight = useMemo(
    () => (
      <span className="admin-stat-pill">
        {unreadCount} unread · {inquiries.length} total
      </span>
    ),
    [unreadCount, inquiries.length],
  )

  const load = useCallback(async (opts = {}) => {
    const { force = false } = opts
    if (!force) {
      const fresh = readCache(CACHE_KEY)?.data
      if (fresh) { setInquiries(fresh); setLoading(false) }
    }
    try {
      const rows = await api.adminListInquiries()
      setInquiries(rows)
      writeCache(CACHE_KEY, rows)
      setError('')
    } catch (err) {
      const hadCached = !!readCache(CACHE_KEY)?.data
      if (!hadCached) setError(err.message || 'Failed to load inquiries.')
    } finally {
      setLoading(false)
    }
  }, [])

  useAdminPage({
    title: 'Inquiries',
    subtitle: 'Customer messages from the public contact form.',
    right: headerRight,
    onRefresh: load,
  })

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  const toggleRead = async (id) => {
    setBusyId(id)
    try {
      const updated = await api.adminToggleInquiryRead(id)
      setInquiries((prev) => prev.map((i) => (i.id === id ? updated : i)))
      bumpInquiryUnread()
    } catch (err) {
      setError(err.message || 'Could not update inquiry.')
    } finally {
      setBusyId(null)
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this inquiry permanently?')) return
    setBusyId(id)
    try {
      await api.adminDeleteInquiry(id)
      setInquiries((prev) => prev.filter((i) => i.id !== id))
      bumpInquiryUnread()
    } catch (err) {
      setError(err.message || 'Could not delete inquiry.')
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return <p style={{ color: 'var(--muted)' }}>Loading inquiries…</p>
  }

  return (
    <div>
      {error && <p style={{ color: '#c0392b', marginBottom: 12 }}>⚠ {error}</p>}

      <div className="filter-bar" role="tablist" aria-label="Filter inquiries" style={{ marginBottom: 16 }}>
        {[
          { id: 'all', label: `All (${inquiries.length})` },
          { id: 'unread', label: `Unread (${unreadCount})` },
          { id: 'read', label: `Read (${inquiries.length - unreadCount})` },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            className={`filter-pill ${filter === f.id ? 'active' : ''}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💬</div>
          <h2>
            {inquiries.length === 0 ? 'No inquiries yet' : 'Nothing here'}
          </h2>
          <p>
            {inquiries.length === 0
              ? 'Customer messages submitted via the contact form will appear here.'
              : 'Try switching the filter above to see other inquiries.'}
          </p>
        </div>
      ) : (
        <div className="inquiry-list">
          {filtered.map((inq) => (
            <article
              key={inq.id}
              className={`inquiry-card ${inq.is_read ? '' : 'unread'}`}
            >
              <div className="inquiry-body">
                <div className="inquiry-head">
                  {!inq.is_read && <span className="inquiry-unread-dot" aria-hidden="true" />}
                  <span className="inquiry-name">{inq.name}</span>
                  {inq.phone && (
                    <>
                      <span className="inquiry-divider">·</span>
                      <a href={`tel:${inq.phone}`} className="inquiry-contact">
                        {inq.phone}
                      </a>
                    </>
                  )}
                  {inq.email && (
                    <>
                      <span className="inquiry-divider">·</span>
                      <a href={`mailto:${inq.email}`} className="inquiry-contact">
                        {inq.email}
                      </a>
                    </>
                  )}
                </div>
                <span className="inquiry-requirement">{inq.requirement}</span>
                <p className="inquiry-message">{inq.message}</p>
                <span className="inquiry-date">{formatDate(inq.created_at)}</span>
              </div>
              <div className="inquiry-actions">
                <button
                  type="button"
                  className={`toggle-read ${inq.is_read ? '' : 'is-unread'}`}
                  onClick={() => toggleRead(inq.id)}
                  disabled={busyId === inq.id}
                >
                  {inq.is_read ? 'Mark unread' : 'Mark read'}
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => remove(inq.id)}
                  disabled={busyId === inq.id}
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
