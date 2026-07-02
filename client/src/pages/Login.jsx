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
    <main className="flex-1 flex items-center justify-center px-5 py-10 max-sm:items-start max-sm:pt-8 max-sm:pb-10">
      <form onSubmit={submit} className="w-full max-w-[520px] bg-surface border border-line rounded-xl p-10 flex flex-col gap-4 shadow-md max-sm:p-7">
        <Link to="/" className="sm:hidden text-[12px] text-muted hover:text-accent-deep flex items-center gap-1 -mb-1">
          ← Back to shop
        </Link>
        <h1 className="font-serif text-[30px] m-0 tracking-[-0.3px]">Sign in</h1>
        <p className="text-muted text-sm mt-[-4px]">
          New here?{' '}
          <Link to="/signup" state={{ from: redirectTo }} className="text-accent-deep font-semibold hover:underline">
            Create an account
          </Link>
        </p>
        <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
          <span>Email</span>
          <input className="px-[14px] py-3 border border-line rounded-[12px] font-sans text-sm text-ink bg-white outline-none focus:border-accent max-sm:text-base" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} autoComplete="email" />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
          <span>Password</span>
          <input className="px-[14px] py-3 border border-line rounded-[12px] font-sans text-sm text-ink bg-white outline-none focus:border-accent max-sm:text-base" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} autoComplete="current-password" />
        </label>
        <Link to="/forgot-password" className="text-[13px] text-accent-deep font-medium text-right hover:underline">
          Forgot your password?
        </Link>
        {error && <p className="text-danger text-[13px]">⚠ {error}</p>}
        <button type="submit" className="p-4 bg-ink text-[#ffffff] rounded-full font-semibold text-[15px] transition-colors hover:enabled:bg-accent-deep disabled:opacity-60 disabled:cursor-not-allowed w-full" disabled={loading}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  )
}
