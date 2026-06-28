import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api'
import { setUserAuth, getUser } from '../../userAuth'

// Admins always land on the Products page after sign-in, regardless of where
// they were bounced from. Simpler mental model than "remember the deep link".
const ADMIN_HOME = '/admin/products'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const current = getUser()
  if (current?.role === 'admin') {
    navigate(ADMIN_HOME, { replace: true })
    return null
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user, token } = await api.login(email, password)
      if (user.role !== 'admin') {
        setError('That account is not an admin.')
        await api.logout().catch(() => {})
        return
      }
      setUserAuth(user, token)
      navigate(ADMIN_HOME, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <form onSubmit={submit}>
        <h1>SR Bagz Zone Admin</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 24 }}>
          Sign in to manage products and orders.
        </p>
        <label>
          <span>Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="username"
          />
        </label>
        <label>
          <span>Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
          />
        </label>
        {error && <p style={{ color: '#c0392b', fontSize: 13 }}>⚠ {error}</p>}
        <button type="submit" className="checkout-btn" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
