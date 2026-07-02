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
    <aside
      className={`w-60 bg-ink text-white flex flex-col fixed top-0 left-0 bottom-0 z-30 transition-transform duration-[250ms] max-[960px]:shadow-lg ${open ? 'translate-x-0' : 'max-[960px]:-translate-x-full'}`}
      aria-label="Admin navigation"
    >
      <div className="px-5 py-[22px] pb-[18px] border-b border-white/[0.08] flex items-center justify-between gap-2.5">
        <div className="font-serif text-[19px] tracking-[-0.3px] flex items-center gap-2.5">
          <span className="inline-grid place-items-center w-8 h-8 rounded-[9px] bg-[linear-gradient(135deg,var(--color-accent),var(--color-accent-deep))] text-white font-sans font-bold text-[13px] tracking-[0.5px]">SR</span>
          <span>Bagz Zone</span>
        </div>
        <button
          type="button"
          className="hidden max-[960px]:inline-flex bg-transparent border-none text-white/60 text-[22px] leading-none px-2 py-1 cursor-pointer hover:text-white"
          onClick={onClose}
          aria-label="Close menu"
        >
          ✕
        </button>
      </div>
      <nav className="flex flex-col gap-0.5 p-3 py-3.5 flex-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm font-medium transition-colors hover:text-white hover:bg-white/[0.06] ${isActive ? 'bg-accent text-white' : 'text-white/[0.68]'}`
            }
          >
            <span className="text-base w-5 inline-grid place-items-center shrink-0" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
            {item.badgeKey === 'inquiries' && unreadInquiries > 0 && (
              <span className="ml-auto bg-accent text-white text-[11px] font-bold px-[7px] py-[2px] rounded-full min-w-[20px] text-center">{unreadInquiries}</span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-3.5 pb-4 border-t border-white/[0.08] flex flex-col gap-2">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-[10px] bg-white/[0.04]">
          <div className="w-8 h-8 rounded-full bg-accent-soft text-accent-deep grid place-items-center font-bold text-[13px] shrink-0">{initial}</div>
          <div className="min-w-0 flex flex-col leading-[1.2]">
            <strong className="text-[13px] text-white overflow-hidden text-ellipsis whitespace-nowrap">{user?.name || 'Admin'}</strong>
            <span className="text-[11px] text-white/50">{user?.email || 'Administrator'}</span>
          </div>
        </div>
        <button
          type="button"
          className="px-3 py-2.5 rounded-[10px] bg-transparent text-[rgba(255,195,187,0.92)] text-[13px] font-medium text-left flex items-center gap-2.5 border-none cursor-pointer hover:bg-[rgba(255,90,70,0.12)] hover:text-[#ffb1a6]"
          onClick={onLogout}
        >
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
      <div className="flex min-h-screen bg-bg">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          unreadInquiries={unreadInquiries}
          onLogout={logout}
          user={user}
        />
        <div
          className={`fixed inset-0 bg-ink/50 backdrop-blur-sm z-[25] transition-opacity ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
        <div className="flex-1 ml-60 flex flex-col min-w-0 max-[960px]:ml-0">
          <header className="sticky top-0 z-20 bg-white/[0.92] backdrop-blur-[8px] border-b border-line px-8 py-3.5 flex items-center justify-between gap-3.5 min-h-16 max-[960px]:px-4 max-[960px]:min-h-[60px]">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                className="hidden max-[960px]:inline-flex border border-line rounded-[10px] w-[38px] h-[38px] items-center justify-center text-ink-soft hover:text-ink hover:bg-bg"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>
              <div className="min-w-0 flex flex-col gap-0.5">
                <h1 className="font-serif text-[22px] font-semibold tracking-[-0.3px] m-0 text-ink overflow-hidden text-ellipsis whitespace-nowrap max-[960px]:text-[18px]">{header.title}</h1>
                {header.subtitle && <p className="text-[12.5px] text-muted m-0 max-[960px]:hidden">{header.subtitle}</p>}
              </div>
            </div>
            {header.right && (
              <div className="flex items-center gap-2.5 shrink-0">{header.right}</div>
            )}
          </header>
          <div className="p-8 pb-12 flex-1 max-[960px]:p-5 max-[960px]:pb-10">
            <Outlet />
          </div>
        </div>
      </div>
    </AdminUIContext.Provider>
  )
}
