import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { setUserAuth, getUser } from '../userAuth'
import { useApp } from '../useApp'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/'
  const { setToast } = useApp()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (getUser()) {
    navigate(redirectTo, { replace: true })
    return null
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user, token } = await api.login(email.trim().toLowerCase(), password)
      setUserAuth(user, token)
      setToast(`Welcome back, ${user.name}!`)
      // Admins logging in via the customer login page get bounced to admin panel.
      const target = user.role === 'admin' ? '/admin/products' : redirectTo
      navigate(target, { replace: true })
    } catch (err) {
      setError(err.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <form onSubmit={submit} className="auth-form">
        <h1>Sign in</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: -4 }}>
          New here?{' '}
          <Link to="/signup" state={{ from: redirectTo }} style={{ color: 'var(--accent-deep)', fontWeight: 600 }}>
            Create an account
          </Link>
        </p>
        <label>
          <span>Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} autoComplete="email" />
        </label>
        <label>
          <span>Password</span>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} autoComplete="current-password" />
        </label>
        <Link to="/forgot-password" style={{ fontSize: 13, color: 'var(--accent-deep)', fontWeight: 500, textAlign: 'right' }}>
          Forgot your password?
        </Link>
        {error && <p style={{ color: '#c0392b', fontSize: 13 }}>⚠ {error}</p>}
        <button type="submit" className="checkout-btn" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
