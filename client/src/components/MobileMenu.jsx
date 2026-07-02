import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { useApp } from '../useApp'
import { useUser } from '../useUser'
import { clearUser } from '../userAuth'

export default function MobileMenu({ open, onClose }) {
  const { setToast } = useApp()
  const user = useUser()
  const isAdmin = user?.role === 'admin'
  const navigate = useNavigate()

  const close = () => onClose?.()

  const logout = async () => {
    try { await api.logout() } catch { /* best effort */ }
    clearUser()
    close()
    setToast('Signed out')
    navigate('/')
  }

  return (
    <>
      {/* Shared overlay — keep class names so cart drawer CSS still applies */}
      <div
        className={`drawer-overlay ${open ? 'open' : ''}`}
        onClick={close}
        aria-hidden={!open}
      />
      <aside
        className={`fixed inset-y-0 left-0 w-[86vw] max-w-[320px] bg-surface z-[200] flex flex-col shadow-lg p-[18px_18px_24px] transition-transform duration-[280ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] ${open ? 'translate-x-0' : '-translate-x-full'}`}
        aria-hidden={!open}
        aria-label="Menu"
      >
        {/* Header row */}
        <div className="flex justify-between items-center pb-3 border-b border-line mb-3">
          <span className="font-serif text-[22px] font-medium tracking-[-0.3px]">Menu</span>
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="w-10 h-10 text-[28px] leading-none text-muted bg-transparent rounded-full hover:bg-bg"
          >
            ×
          </button>
        </div>

        {user && (
          <div className="flex flex-col px-3 py-[14px] bg-bg rounded-xl mb-3">
            <strong className="text-[15px] text-ink">{user.name}</strong>
            <span className="text-[12.5px] text-muted">{user.email}</span>
          </div>
        )}

        <nav className="flex flex-col gap-0.5" onClick={close}>
          <Link to="/" className="block px-3 py-[14px] rounded-[10px] text-[15px] font-medium text-ink min-h-[44px] transition-colors duration-150 hover:bg-bg">Shop</Link>
          <Link to="/handbags" className="block px-3 py-[14px] rounded-[10px] text-[15px] font-medium text-ink min-h-[44px] transition-colors duration-150 hover:bg-bg">Handbags</Link>
          <Link to="/backpacks" className="block px-3 py-[14px] rounded-[10px] text-[15px] font-medium text-ink min-h-[44px] transition-colors duration-150 hover:bg-bg">Backpacks</Link>
          <Link to="/school" className="block px-3 py-[14px] rounded-[10px] text-[15px] font-medium text-ink min-h-[44px] transition-colors duration-150 hover:bg-bg">School Bags</Link>
          <Link to="/travel" className="block px-3 py-[14px] rounded-[10px] text-[15px] font-medium text-ink min-h-[44px] transition-colors duration-150 hover:bg-bg">Travel</Link>
          <Link to="/contact" className="block px-3 py-[14px] rounded-[10px] text-[15px] font-medium text-ink min-h-[44px] transition-colors duration-150 hover:bg-bg">Contact</Link>
        </nav>

        {/* Divider */}
        <div className="h-px bg-line my-4" />

        <div className="flex flex-col gap-0.5" onClick={close}>
          {user ? (
            <>
              {isAdmin ? (
                <Link to="/admin/products" className="block px-3 py-[14px] rounded-[10px] text-[15px] font-medium text-ink min-h-[44px] transition-colors duration-150 hover:bg-bg">Admin panel</Link>
              ) : (
                <>
                  <Link to="/my-orders" className="block px-3 py-[14px] rounded-[10px] text-[15px] font-medium text-ink min-h-[44px] transition-colors duration-150 hover:bg-bg">My orders</Link>
                  <Link to="/addresses" className="block px-3 py-[14px] rounded-[10px] text-[15px] font-medium text-ink min-h-[44px] transition-colors duration-150 hover:bg-bg">My addresses</Link>
                </>
              )}
            </>
          ) : (
            <>
              <Link to="/login" className="block px-3 py-[14px] rounded-[10px] text-[15px] font-medium text-ink min-h-[44px] transition-colors duration-150 hover:bg-bg">Sign in</Link>
              <Link to="/signup" className="block px-3 py-[14px] rounded-[10px] text-[15px] font-medium min-h-[44px] mt-1 text-center bg-ink text-[#ffffff] transition-colors duration-150 hover:bg-accent-deep hover:text-[#ffffff]">Create account</Link>
            </>
          )}
        </div>

        {user && (
          <button
            type="button"
            className="mt-auto px-[14px] py-[14px] bg-bg text-ink rounded-xl text-[14px] font-semibold border border-line min-h-[48px] hover:bg-line"
            onClick={logout}
          >
            Sign out
          </button>
        )}
      </aside>
    </>
  )
}
