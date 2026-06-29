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
      <div
        className={`drawer-overlay ${open ? 'open' : ''}`}
        onClick={close}
        aria-hidden={!open}
      />
      <aside
        className={`mobile-menu ${open ? 'open' : ''}`}
        aria-hidden={!open}
        aria-label="Menu"
      >
        <div className="mobile-menu-head">
          <span className="mobile-menu-title">Menu</span>
          <button type="button" onClick={close} aria-label="Close menu">×</button>
        </div>

        {user && (
          <div className="mobile-menu-user">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
        )}

        <nav className="mobile-menu-nav" onClick={close}>
          <Link to="/">Shop</Link>
          <Link to="/?cat=Handbags">Handbags</Link>
          <Link to="/?cat=Backpacks">Backpacks</Link>
          <Link to="/?cat=School Bags">School Bags</Link>
          <Link to="/?cat=Laptop Bags">Laptop Bags</Link>
          <Link to="/?cat=Travel">Travel</Link>
          <Link to="/contact">Contact</Link>
        </nav>

        <div className="mobile-menu-divider" />

        <div className="mobile-menu-nav" onClick={close}>
          {user ? (
            <>
              {isAdmin ? (
                <Link to="/admin/products">Admin panel</Link>
              ) : (
                <>
                  <Link to="/my-orders">My orders</Link>
                  <Link to="/addresses">My addresses</Link>
                </>
              )}
            </>
          ) : (
            <>
              <Link to="/login">Sign in</Link>
              <Link to="/signup" className="signup-mobile">Create account</Link>
            </>
          )}
        </div>

        {user && (
          <button type="button" className="mobile-menu-logout" onClick={logout}>
            Sign out
          </button>
        )}
      </aside>
    </>
  )
}
