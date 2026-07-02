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
    <main className="flex-1 flex items-center justify-center px-5 py-10 max-sm:items-start max-sm:pt-8 max-sm:pb-10">
      <form onSubmit={submit} className="w-full max-w-[520px] bg-surface border border-line rounded-xl p-10 flex flex-col gap-4 shadow-md max-sm:p-7">
        <Link to="/" className="sm:hidden text-[12px] text-muted hover:text-accent-deep flex items-center gap-1 -mb-1">
          ← Back to shop
        </Link>
        <h1 className="font-serif text-[30px] m-0 tracking-[-0.3px]">Create your account</h1>
        <p className="text-muted text-sm mt-[-4px]">
          Already a member?{' '}
          <Link to="/login" state={{ from: redirectTo }} className="text-accent-deep font-semibold hover:underline">
            Sign in
          </Link>
        </p>
        <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
          <span>Full name</span>
          <input className="px-[14px] py-3 border border-line rounded-[12px] font-sans text-sm text-ink bg-white outline-none focus:border-accent max-sm:text-base" type="text" required value={form.name} onChange={set('name')} disabled={loading} autoComplete="name" />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
          <span>Email</span>
          <input className="px-[14px] py-3 border border-line rounded-[12px] font-sans text-sm text-ink bg-white outline-none focus:border-accent max-sm:text-base" type="email" required value={form.email} onChange={set('email')} disabled={loading} autoComplete="email" />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
          <span>Phone (optional)</span>
          <input className="px-[14px] py-3 border border-line rounded-[12px] font-sans text-sm text-ink bg-white outline-none focus:border-accent max-sm:text-base" type="tel" value={form.phone} onChange={set('phone')} disabled={loading} autoComplete="tel" pattern="[\d\s+\-()]{7,}" />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
          <span>Password</span>
          <input className="px-[14px] py-3 border border-line rounded-[12px] font-sans text-sm text-ink bg-white outline-none focus:border-accent max-sm:text-base" type="password" required minLength={6} value={form.password} onChange={set('password')} disabled={loading} autoComplete="new-password" />
        </label>
        {error && <p className="text-danger text-[13px]">⚠ {error}</p>}
        <button type="submit" className="p-4 bg-ink text-[#ffffff] rounded-full font-semibold text-[15px] transition-colors hover:enabled:bg-accent-deep disabled:opacity-60 disabled:cursor-not-allowed w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
    </main>
  )
}
