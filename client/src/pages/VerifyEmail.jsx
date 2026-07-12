import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api'
import { getUser, setUserAuth } from '../userAuth'
import { useCooldown } from '../hooks/useCooldown'

const RESEND_COOLDOWN_SECONDS = 60

const inputClass =
  'px-[14px] py-3 border border-line rounded-[12px] font-sans text-sm text-ink bg-white outline-none focus:border-accent max-sm:text-base'

export default function VerifyEmail() {
  const navigate = useNavigate()
  const location = useLocation()
  const redirectTo = location.state?.from || '/'
  const currentUser = getUser()

  const initialEmail = location.state?.email || currentUser?.email || ''
  const [email, setEmail] = useState(initialEmail)
  // The email is bound to the account and cannot be changed here — once we know
  // which address to verify, lock the field. A dedicated change-email flow would
  // be the only way to alter it.
  const emailLocked = Boolean(initialEmail)
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [done, setDone] = useState(false)
  const { remaining, active: cooldownActive, start: startCooldown } = useCooldown(RESEND_COOLDOWN_SECONDS)

  // A code was just sent (during signup, or the resend that led here), so open
  // with the cooldown already running to prevent an immediate duplicate send.
  useEffect(() => {
    startCooldown()
  }, [startCooldown])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    setLoading(true)
    try {
      await api.verifyEmail(email.trim().toLowerCase(), code.trim())
      const u = getUser()
      if (u) setUserAuth({ ...u, is_verified: true })
      setDone(true)
    } catch (err) {
      setError(err.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    setError('')
    setNotice('')
    setResending(true)
    try {
      await api.resendVerification()
      startCooldown()
      setNotice('A new code has been sent to your email.')
    } catch (err) {
      setError(err.message || 'Could not resend the code')
    } finally {
      setResending(false)
    }
  }

  if (done) {
    return (
      <main className="max-w-[460px] mx-auto mt-[60px] mb-20 px-5">
        <div className="bg-surface border border-line rounded-lg p-9 flex flex-col gap-4 shadow-sm text-center">
          <div className="w-16 h-16 rounded-full bg-[#2f7a3a] text-[#ffffff] inline-grid place-items-center text-[32px] mx-auto">✓</div>
          <h1 className="font-serif text-[30px] m-0 tracking-[-0.3px]">Email verified</h1>
          <p className="text-muted m-0">Your account is now verified.</p>
          <button
            onClick={() => navigate(redirectTo, { replace: true })}
            className="p-4 bg-ink text-[#ffffff] rounded-full font-semibold text-[15px] transition-colors hover:bg-accent-deep w-full text-center"
          >
            Continue shopping
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-[460px] mx-auto mt-[60px] mb-20 px-5">
      <form onSubmit={submit} className="bg-surface border border-line rounded-lg p-9 flex flex-col gap-3.5 shadow-sm">
        <h1 className="font-serif text-[30px] m-0 tracking-[-0.3px]">Verify your email</h1>
        <p className="text-muted text-sm mt-[-4px]">
          We emailed a 6-digit code to your address. Enter it below to verify your account.
        </p>
        <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
          <span>Email</span>
          <input
            className={`${inputClass} ${emailLocked ? 'bg-bg text-muted cursor-not-allowed' : ''}`}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            readOnly={emailLocked}
            autoComplete="email"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
          <span>Verification code</span>
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
        {notice && <p className="text-[#2f7a3a] text-[13px]">{notice}</p>}
        <button
          type="submit"
          className="p-4 bg-ink text-[#ffffff] rounded-full font-semibold text-[15px] transition-colors hover:enabled:bg-accent-deep disabled:opacity-60 disabled:cursor-not-allowed w-full"
          disabled={loading || code.length !== 6}
        >
          {loading ? 'Verifying…' : 'Verify email'}
        </button>
        {currentUser ? (
          <button
            type="button"
            onClick={resend}
            disabled={resending || cooldownActive}
            className="text-[13px] text-muted text-center hover:underline disabled:opacity-60 disabled:no-underline"
          >
            {resending
              ? 'Sending…'
              : cooldownActive
                ? `Resend code in ${remaining}s`
                : "Didn't get a code? Resend"}
          </button>
        ) : (
          <Link to="/login" className="text-[13px] text-muted text-center hover:underline">
            Back to sign in
          </Link>
        )}
      </form>
    </main>
  )
}
