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
    <main className="max-w-[460px] mx-auto mt-[60px] mb-20 px-5">
      <form onSubmit={submit} className="bg-surface border border-line rounded-lg p-9 flex flex-col gap-3.5 shadow-sm">
        <h1 className="font-serif text-[30px] m-0 tracking-[-0.3px]">Reset your password</h1>
        {sent ? (
          <>
            <p className="text-ink-soft text-sm mt-[-4px]">
              If <strong>{email}</strong> is registered, a reset link has been sent. Check your inbox.
            </p>
            <Link to="/login" className="p-4 bg-ink text-[#ffffff] rounded-full font-semibold text-[15px] transition-colors hover:bg-accent-deep w-full no-underline text-center">
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <p className="text-muted text-sm mt-[-4px]">
              Enter your email and we'll send you a link to set a new password.
            </p>
            <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
              <span>Email</span>
              <input className="px-[14px] py-3 border border-line rounded-[12px] font-sans text-sm text-ink bg-white outline-none focus:border-accent max-sm:text-base" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} autoComplete="email" />
            </label>
            {error && <p className="text-danger text-[13px]">⚠ {error}</p>}
            <button type="submit" className="p-4 bg-ink text-[#ffffff] rounded-full font-semibold text-[15px] transition-colors hover:enabled:bg-accent-deep disabled:opacity-60 disabled:cursor-not-allowed w-full" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
            <Link to="/login" className="text-[13px] text-muted text-center hover:underline">
              Back to sign in
            </Link>
          </>
        )}
      </form>
    </main>
  )
}
