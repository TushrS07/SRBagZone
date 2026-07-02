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
      <main className="max-w-[460px] mx-auto mt-[60px] mb-20 px-5">
        <div className="bg-surface border border-line rounded-lg p-9 flex flex-col gap-3.5 shadow-sm text-center">
          <h1 className="font-serif text-[30px] m-0 tracking-[-0.3px] text-danger">Invalid reset link</h1>
          <p className="text-muted">The reset link is missing or malformed.</p>
          <Link to="/forgot-password" className="p-4 bg-ink text-[#ffffff] rounded-full font-semibold text-[15px] transition-colors hover:bg-accent-deep w-full no-underline text-center">
            Request a new link
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-[460px] mx-auto mt-[60px] mb-20 px-5">
      <form onSubmit={submit} className="bg-surface border border-line rounded-lg p-9 flex flex-col gap-3.5 shadow-sm">
        <h1 className="font-serif text-[30px] m-0 tracking-[-0.3px]">Choose a new password</h1>
        <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
          <span>New password</span>
          <input className="px-[14px] py-3 border border-line rounded-[12px] font-sans text-sm text-ink bg-white outline-none focus:border-accent max-sm:text-base" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} autoComplete="new-password" />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
          <span>Confirm password</span>
          <input className="px-[14px] py-3 border border-line rounded-[12px] font-sans text-sm text-ink bg-white outline-none focus:border-accent max-sm:text-base" type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={loading} autoComplete="new-password" />
        </label>
        {error && <p className="text-danger text-[13px]">⚠ {error}</p>}
        <button type="submit" className="p-4 bg-ink text-[#ffffff] rounded-full font-semibold text-[15px] transition-colors hover:enabled:bg-accent-deep disabled:opacity-60 disabled:cursor-not-allowed w-full" disabled={loading}>
          {loading ? 'Saving…' : 'Reset password'}
        </button>
      </form>
    </main>
  )
}
