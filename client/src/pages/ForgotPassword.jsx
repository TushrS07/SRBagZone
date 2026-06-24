import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.forgotPassword(email.trim().toLowerCase())
      setSent(true)
    } catch (err) {
      setError(err.message || 'Could not send reset email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <form onSubmit={submit} className="auth-form">
        <h1>Reset your password</h1>
        {sent ? (
          <>
            <p style={{ color: 'var(--ink-soft)', fontSize: 14, marginTop: -4 }}>
              If <strong>{email}</strong> is registered, a reset link has been sent. Check your inbox.
            </p>
            <Link to="/login" className="checkout-btn" style={{ textDecoration: 'none', textAlign: 'center' }}>
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <p style={{ color: 'var(--muted)', fontSize: 14, marginTop: -4 }}>
              Enter your email and we'll send you a link to set a new password.
            </p>
            <label>
              <span>Email</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} autoComplete="email" />
            </label>
            {error && <p style={{ color: '#c0392b', fontSize: 13 }}>⚠ {error}</p>}
            <button type="submit" className="checkout-btn" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
            <Link to="/login" style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>
              Back to sign in
            </Link>
          </>
        )}
      </form>
    </main>
  )
}
