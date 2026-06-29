import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { api } from '../api'
import { getUser, setUserAuth } from '../userAuth'

export default function VerifyEmail() {
  const [params] = useSearchParams()
  const token = params.get('token') || ''
  const [state, setState] = useState('pending') // 'pending' | 'ok' | 'error'
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!token) {
      // setState only happens once we know there's no token to verify
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState('error')
      setMessage('Missing verification token')
      return
    }
    api
      .verifyEmail(token)
      .then(() => {
        setState('ok')
        setMessage('Your email has been verified.')
        const u = getUser()
        if (u) setUserAuth({ ...u, is_verified: true })
      })
      .catch((err) => {
        setState('error')
        setMessage(err.message || 'Verification failed')
      })
  }, [token])

  return (
    <main className="auth-page">
      <div className="auth-form" style={{ textAlign: 'center', gap: 16 }}>
        {state === 'pending' && <h1 style={{ margin: 0 }}>Verifying…</h1>}
        {state === 'ok' && (
          <>
            <div className="order-check">✓</div>
            <h1 style={{ margin: 0 }}>Email verified</h1>
            <p style={{ color: 'var(--muted)', margin: 0 }}>{message}</p>
            <Link to="/" className="checkout-btn" style={{ textDecoration: 'none', textAlign: 'center' }}>
              Continue shopping
            </Link>
          </>
        )}
        {state === 'error' && (
          <>
            <h1 style={{ margin: 0, color: '#c0392b' }}>Verification failed</h1>
            <p style={{ color: 'var(--muted)', margin: 0 }}>{message}</p>
            <Link to="/login" className="checkout-btn" style={{ textDecoration: 'none', textAlign: 'center' }}>
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </main>
  )
}
