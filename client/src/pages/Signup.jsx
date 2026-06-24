import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { setUserAuth, getUser } from '../userAuth'
import { useApp } from '../useApp'

export default function Signup() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/'
  const { setToast } = useApp()

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (getUser()) {
    navigate(redirectTo, { replace: true })
    return null
  }

  const set = (k) => (e) => setForm((prev) => ({ ...prev, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { user, token } = await api.register({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim() || null,
        password: form.password,
      })
      setUserAuth(user, token)
      setToast(`Welcome, ${user.name}! Check your email to verify your account.`)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.message || 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <form onSubmit={submit} className="auth-form">
        <h1>Create your account</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: -4 }}>
          Already a member?{' '}
          <Link to="/login" state={{ from: redirectTo }} style={{ color: 'var(--accent-deep)', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
        <label>
          <span>Full name</span>
          <input type="text" required value={form.name} onChange={set('name')} disabled={loading} autoComplete="name" />
        </label>
        <label>
          <span>Email</span>
          <input type="email" required value={form.email} onChange={set('email')} disabled={loading} autoComplete="email" />
        </label>
        <label>
          <span>Phone (optional)</span>
          <input type="tel" value={form.phone} onChange={set('phone')} disabled={loading} autoComplete="tel" pattern="[\d\s+\-()]{7,}" />
        </label>
        <label>
          <span>Password</span>
          <input type="password" required minLength={6} value={form.password} onChange={set('password')} disabled={loading} autoComplete="new-password" />
        </label>
        {error && <p style={{ color: '#c0392b', fontSize: 13 }}>⚠ {error}</p>}
        <button type="submit" className="checkout-btn" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </main>
  )
}
