import { useCallback, useEffect, useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { clearUser } from '../../userAuth'
import { useUser } from '../../useUser'
import { AdminUIContext } from './adminUI'
import { useUnreadInquiries } from './useUnreadInquiries'

const NAV_ITEMS = [
  { icon: '📦', label: 'Products', href: '/admin/products' },
  { icon: '🛒', label: 'Orders', href: '/admin/orders' },
  { icon: '💬', label: 'Inquiries', href: '/admin/inquiries', badgeKey: 'inquiries' },
  { icon: '🏷️', label: 'Brands', href: '/admin/brands' },
  { icon: '📁', label: 'Categories', href: '/admin/categories' },
]

function Sidebar({ open, onClose, unreadInquiries, onLogout, user }) {
  const initial = (user?.name?.trim()?.[0] || 'A').toUpperCase()
  return (
    <aside className={`admin-sidebar ${open ? 'open' : ''}`} aria-label="Admin navigation">
      <div className="admin-sidebar-head">
        <div className="admin-brand">
          <img src="/sr-logo.png" alt="" className="admin-brand-mark" />
          <span>SR Bagz Zone</span>
        </div>
        <button
          type="button"
          className="admin-sidebar-close"
          onClick={onClose}
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>
      <nav className="admin-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onClose}
            className={({ isActive }) => (isActive ? 'active' : undefined)}
          >
            <span className="admin-nav-icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
            {item.badgeKey === 'inquiries' && unreadInquiries > 0 && (
              <span className="admin-nav-badge">{unreadInquiries}</span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="admin-sidebar-foot">
        <div className="admin-user-pill">
          <div className="admin-user-avatar">{initial}</div>
          <div className="admin-user-meta">
            <strong>{user?.name || 'Admin'}</strong>
            <span>{user?.email || 'Administrator'}</span>
          </div>
        </div>
        <button type="button" className="admin-logout" onClick={onLogout}>
          <span aria-hidden="true">⎋</span>
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  )
}

export default function AdminLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = useUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [header, setHeader] = useState({ title: 'Admin', subtitle: '', right: null })
  // The active page registers a "bypass cache, refetch" function here. Stored
  // as a thunk (function-returning-function) so React's setState doesn't try
  // to invoke our handler with the previous state.
  const [refreshFn, setRefreshFn] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  // Fetched once on mount (via the hook) and again on demand whenever the
  // Inquiries page mutates a record. No route-change refetch — that was
  // hitting the endpoint on every admin navigation.
  const { count: unreadInquiries, refresh: refreshUnread } = useUnreadInquiries()

  const registerRefresh = useCallback((producer) => {
    // `producer` is a `() => fn | null` thunk; we store the resulting fn
    // (or null) so the next render can render or hide the button.
    setRefreshFn(() => producer())
  }, [])

  const handleRefresh = async () => {
    if (!refreshFn || refreshing) return
    setRefreshing(true)
    try {
      await refreshFn({ force: true })
    } finally {
      setRefreshing(false)
    }
  }

  // Close drawer on route change (mobile). This *is* a setState within an
  // effect — but it's a deliberate side effect of navigation, not derived
  // state, so it's the right shape.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSidebarOpen(false)
  }, [location.pathname])

  const logout = async () => {
    try { await api.logout() } catch { /* best effort */ }
    clearUser()
    navigate('/admin/login', { replace: true })
  }

  const ctxValue = useMemo(() => ({
    setHeader,
    openSidebar: () => setSidebarOpen(true),
    closeSidebar: () => setSidebarOpen(false),
    unreadInquiries,
    bumpInquiryUnread: refreshUnread,
    registerRefresh,
  }), [unreadInquiries, refreshUnread, registerRefresh])

  return (
    <AdminUIContext.Provider value={ctxValue}>
      <div className="admin-shell">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          unreadInquiries={unreadInquiries}
          onLogout={logout}
          user={user}
        />
        <div
          className={`admin-sidebar-overlay ${sidebarOpen ? 'open' : ''}`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
        <div className="admin-main">
          <header className="admin-topbar">
            <div className="admin-topbar-left">
              <button
                type="button"
                className="admin-hamburger"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <div className="admin-topbar-titles">
                <h1>{header.title}</h1>
                {header.subtitle && <p>{header.subtitle}</p>}
              </div>
            </div>
            <div className="admin-topbar-right">
              {refreshFn && (
                <button
                  type="button"
                  className="admin-refresh-btn"
                  onClick={handleRefresh}
                  disabled={refreshing}
                  title="Refresh (bypass cache)"
                  aria-label="Refresh data"
                >
                  <svg
                    width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                    className={refreshing ? 'spin' : undefined}
                    aria-hidden="true"
                  >
                    <polyline points="23 4 23 10 17 10" />
                    <polyline points="1 20 1 14 7 14" />
                    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                  </svg>
                  <span>{refreshing ? 'Refreshing…' : 'Refresh'}</span>
                </button>
              )}
              {header.right}
            </div>
          </header>
          <div className="admin-content">
            <Outlet />
          </div>
        </div>
      </div>
    </AdminUIContext.Provider>
  )
}
