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
    <div className="min-h-screen grid place-items-center bg-bg p-6">
      <form onSubmit={submit} className="bg-surface p-9 rounded-lg shadow-md w-full max-w-[380px] flex flex-col gap-3.5">
        <h1 className="font-serif text-[28px] m-0">SR Bagz Zone Admin</h1>
        <p className="text-muted text-[14px] mb-6">
          Sign in to manage products and orders.
        </p>
        <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
          <span>Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="username"
            className="px-[14px] py-[11px] border border-line rounded-[10px] font-sans text-sm text-ink bg-white outline-none focus:border-accent"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
          <span>Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="current-password"
            className="px-[14px] py-[11px] border border-line rounded-[10px] font-sans text-sm text-ink bg-white outline-none focus:border-accent"
          />
        </label>
        {error && <p className="text-danger text-[13px]">⚠ {error}</p>}
        <button
          type="submit"
          className="px-[22px] py-[11px] rounded-full bg-ink text-white border-0 font-semibold text-sm hover:enabled:bg-accent-deep disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
