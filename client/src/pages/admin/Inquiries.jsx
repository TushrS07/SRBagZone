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
      <span className="inline-flex items-center gap-2 px-3.5 py-[7px] bg-accent-soft text-accent-deep rounded-full text-[13px] font-semibold">
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
    return <p className="text-muted">Loading inquiries…</p>
  }

  return (
    <div>
      {error && <p className="text-danger mb-3">⚠ {error}</p>}

      <div className="flex gap-2 flex-wrap mb-4" role="tablist" aria-label="Filter inquiries">
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
            className={`px-[18px] py-[9px] rounded-full border text-[13.5px] font-medium transition-all ${filter === f.id ? 'bg-ink text-white border-ink' : 'bg-surface border-line text-ink-soft hover:border-accent hover:text-accent-deep'}`}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center text-center py-16 px-5 bg-surface border border-line rounded-md">
          <div className="w-16 h-16 rounded-[18px] bg-accent-soft text-accent-deep grid place-items-center text-[28px] mb-3.5">💬</div>
          <h2 className="font-serif text-[22px] m-0 mb-1.5">
            {inquiries.length === 0 ? 'No inquiries yet' : 'Nothing here'}
          </h2>
          <p className="text-muted text-[14px] max-w-[320px] m-0">
            {inquiries.length === 0
              ? 'Customer messages submitted via the contact form will appear here.'
              : 'Try switching the filter above to see other inquiries.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((inq) => (
            <article
              key={inq.id}
              className={`bg-surface border rounded-md px-5 py-[18px] transition-colors flex gap-4 items-start max-sm:flex-col ${inq.is_read ? 'border-line' : 'border-accent/[0.32] bg-[rgba(184,114,43,0.04)]'}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                  {!inq.is_read && <span className="w-2 h-2 rounded-full bg-accent shrink-0" aria-hidden="true" />}
                  <span className="text-[15px] font-semibold text-ink">{inq.name}</span>
                  {inq.phone && (
                    <>
                      <span className="text-line">·</span>
                      <a href={`tel:${inq.phone}`} className="text-[13.5px] text-accent-deep font-medium no-underline hover:underline">
                        {inq.phone}
                      </a>
                    </>
                  )}
                  {inq.email && (
                    <>
                      <span className="text-line">·</span>
                      <a href={`mailto:${inq.email}`} className="text-[13.5px] text-accent-deep font-medium no-underline hover:underline">
                        {inq.email}
                      </a>
                    </>
                  )}
                </div>
                <span className="inline-block bg-accent-soft text-accent-deep text-[11.5px] font-semibold px-2.5 py-[3px] rounded-full mb-2 uppercase tracking-[0.4px]">{inq.requirement}</span>
                <p className="text-[14px] text-ink-soft leading-[1.55] whitespace-pre-wrap m-0 mb-2">{inq.message}</p>
                <span className="text-[12px] text-muted">{formatDate(inq.created_at)}</span>
              </div>
              <div className="flex flex-col gap-1.5 shrink-0 max-sm:flex-row max-sm:w-full">
                <button
                  type="button"
                  className={`px-3.5 py-[7px] rounded-[10px] border text-[12.5px] font-semibold cursor-pointer transition-colors disabled:opacity-60 ${inq.is_read ? 'border-line bg-surface text-ink-soft hover:enabled:bg-bg hover:enabled:text-ink' : 'border-transparent bg-accent-soft text-accent-deep hover:enabled:bg-[#ecd6b6]'}`}
                  onClick={() => toggleRead(inq.id)}
                  disabled={busyId === inq.id}
                >
                  {inq.is_read ? 'Mark unread' : 'Mark read'}
                </button>
                <button
                  type="button"
                  className="px-3.5 py-[7px] rounded-[10px] border border-[#f1d6d2] bg-surface text-danger text-[12.5px] font-semibold cursor-pointer transition-colors hover:enabled:bg-[#fbe9e7] disabled:opacity-60 max-sm:flex-1"
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
