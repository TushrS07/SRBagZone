import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api'

const inputClass =
  'px-[14px] py-3 border border-line rounded-[12px] font-sans text-sm text-ink bg-white outline-none focus:border-accent max-sm:text-base'

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()

  const [step, setStep] = useState('code') // 'code' | 'password'
  const [email, setEmail] = useState(location.state?.email || '')
  const [code, setCode] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const verifyCode = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { reset_token } = await api.verifyResetOtp(email.trim().toLowerCase(), code.trim())
      setResetToken(reset_token)
      setStep('password')
    } catch (err) {
      setError(err.message || 'Invalid or expired code')
    } finally {
      setLoading(false)
    }
  }

  const savePassword = async (e) => {
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
      await api.resetPassword(resetToken, password)
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err.message || 'Reset failed — the code may have expired')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="max-w-[460px] mx-auto mt-[60px] mb-20 px-5">
      {step === 'code' ? (
        <form onSubmit={verifyCode} className="bg-surface border border-line rounded-lg p-9 flex flex-col gap-3.5 shadow-sm">
          <h1 className="font-serif text-[30px] m-0 tracking-[-0.3px]">Enter reset code</h1>
          <p className="text-muted text-sm mt-[-4px]">
            We emailed a 6-digit code. Enter it below to continue.
          </p>
          <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
            <span>Email</span>
            <input className={inputClass} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} autoComplete="email" />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
            <span>Reset code</span>
            <input
              className={`${inputClass} tracking-[8px] text-center text-lg`}
              type="text"
              inputMode="numeric"
              pattern="\d{6}"
              maxLength={6}
              required
              placeholder="––––––"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              disabled={loading}
              autoComplete="one-time-code"
            />
          </label>
          {error && <p className="text-danger text-[13px]">⚠ {error}</p>}
          <button type="submit" className="p-4 bg-ink text-[#ffffff] rounded-full font-semibold text-[15px] transition-colors hover:enabled:bg-accent-deep disabled:opacity-60 disabled:cursor-not-allowed w-full" disabled={loading || code.length !== 6}>
            {loading ? 'Verifying…' : 'Continue'}
          </button>
          <Link to="/forgot-password" className="text-[13px] text-muted text-center hover:underline">
            Request a new code
          </Link>
        </form>
      ) : (
        <form onSubmit={savePassword} className="bg-surface border border-line rounded-lg p-9 flex flex-col gap-3.5 shadow-sm">
          <h1 className="font-serif text-[30px] m-0 tracking-[-0.3px]">Choose a new password</h1>
          <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
            <span>New password</span>
            <input className={inputClass} type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} autoComplete="new-password" />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
            <span>Confirm password</span>
            <input className={inputClass} type="password" required minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} disabled={loading} autoComplete="new-password" />
          </label>
          {error && <p className="text-danger text-[13px]">⚠ {error}</p>}
          <button type="submit" className="p-4 bg-ink text-[#ffffff] rounded-full font-semibold text-[15px] transition-colors hover:enabled:bg-accent-deep disabled:opacity-60 disabled:cursor-not-allowed w-full" disabled={loading}>
            {loading ? 'Saving…' : 'Reset password'}
          </button>
        </form>
      )}
    </main>
  )
}
