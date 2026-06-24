import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { api } from '../api'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    setLoading(true)
    try {
      await api.resetPassword(token, password)
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err.message || 'Reset failed — the link may have expired')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <main className="auth-page">
        <div className="auth-form" style={{ textAlign: 'center' }}>
          <h1 style={{ color: '#c0392b' }}>Invalid reset link</h1>
          <p style={{ color: 'var(--muted)' }}>The reset link is missing or malformed.</p>
          <Link to="/forgot-password" className="checkout-btn" style={{ textDecoration: 'none', textAlign: 'center' }}>
            Request a new link
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="auth-page">
      <form onSubmit={submit} className="auth-form">
        <h1>Choose a new password</h1>
        <label>
          <span>New password</span>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} autoComplete="new-password" />
        </label>
        <label>
          <span>Confirm password</span>
          <input type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={loading} autoComplete="new-password" />
        </label>
        {error && <p style={{ color: '#c0392b', fontSize: 13 }}>⚠ {error}</p>}
        <button type="submit" className="checkout-btn" disabled={loading}>
          {loading ? 'Saving…' : 'Reset password'}
        </button>
      </form>
    </main>
  )
}
