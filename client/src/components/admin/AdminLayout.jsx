import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { clearUser } from '../../userAuth'

export default function AdminLayout() {
  const navigate = useNavigate()
  const logout = async () => {
    try {
      await api.logout()
    } catch {
      // best-effort cookie clear
    }
    clearUser()
    navigate('/admin/login', { replace: true })
  }
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">SR Bag Zone · Admin</div>
        <nav className="admin-nav">
          <NavLink to="/admin/products">Products</NavLink>
          <NavLink to="/admin/orders">Orders</NavLink>
          <NavLink to="/admin/brands">Brands</NavLink>
          <NavLink to="/admin/categories">Categories</NavLink>
        </nav>
        <button type="button" className="admin-logout" onClick={logout}>
          Log out
        </button>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  )
}
