import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { useApp } from '../useApp'
import { useUser } from '../useUser'
import { getUser, setUserAuth } from '../userAuth'
import Skeleton from '../components/Skeleton'

const fieldClass =
  'px-[14px] py-3 border border-line rounded-[12px] font-sans text-sm bg-bg text-muted outline-none'

export default function Account() {
  const { setToast } = useApp()
  const user = useUser()
  const [loading, setLoading] = useState(true)
  const [resending, setResending] = useState(false)

  // Refresh the profile from the server so verification status / phone stay
  // current even if another device changed them.
  useEffect(() => {
    let cancelled = false
    api
      .me()
      .then((fresh) => {
        if (cancelled) return
        const current = getUser()
        setUserAuth({ ...current, ...fresh })
      })
      .catch(() => { /* fall back to cached profile */ })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const resend = async () => {
    setResending(true)
    try {
      await api.resendVerification()
      setToast('Verification code sent — check your inbox.')
    } catch (err) {
      setToast(err.message || 'Could not resend the code')
    } finally {
      setResending(false)
    }
  }

  if (loading || !user) {
    return (
      <main className="max-w-[760px] mx-auto mt-[70px] px-7 max-sm:px-4">
        <Skeleton className="h-10 w-60 mb-7" />
        <div className="p-6 bg-surface border border-line rounded-md flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </main>
    )
  }

  return (
    <main className="max-w-[760px] mx-auto mt-[70px] mb-20 px-7 max-sm:px-4">
      <div className="mb-7">
        <h1 className="font-serif text-[42px] font-medium m-0 tracking-[-0.5px]">My account</h1>
        <p className="text-muted text-sm mt-1.5">
          Your profile and account details.
        </p>
      </div>

      <section className="bg-surface border border-line rounded-lg p-7 flex flex-col gap-4 max-sm:p-5">
        <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
          <span>Full name</span>
          <input className={fieldClass} type="text" value={user.name || ''} readOnly disabled />
        </label>

        <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
          <span>Email</span>
          <input className={fieldClass} type="email" value={user.email || ''} readOnly disabled />
          <span className="text-[12px] text-muted">
            Your email is linked to your account and can't be changed.
          </span>
        </label>

        <label className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
          <span>Phone number</span>
          <input className={fieldClass} type="tel" value={user.phone || '—'} readOnly disabled />
        </label>

        <div className="flex flex-col gap-1.5 text-[13px] text-ink-soft">
          <span>Email verification</span>
          {user.is_verified ? (
            <span className="inline-flex items-center gap-2 text-[#2f7a3a] text-sm font-semibold">
              <span className="inline-grid place-items-center w-5 h-5 rounded-full bg-[#2f7a3a] text-[#ffffff] text-[12px]">✓</span>
              Verified
            </span>
          ) : (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-2 text-[#6b3f0a] text-sm font-semibold">
                <span className="inline-grid place-items-center w-5 h-5 rounded-full bg-[#f4d4a3] text-[#6b3f0a] text-[12px]">!</span>
                Not verified
              </span>
              <Link
                to="/verify-email"
                state={{ email: user.email, from: '/account' }}
                className="bg-ink text-[#ffffff] px-4 py-2 rounded-full font-semibold text-[13px]"
              >
                Verify now
              </Link>
              <button
                type="button"
                onClick={resend}
                disabled={resending}
                className="text-accent-deep font-semibold text-[13px] underline disabled:opacity-60"
              >
                {resending ? 'Sending…' : 'Resend code'}
              </button>
            </div>
          )}
        </div>
      </section>

      <div className="flex gap-3 mt-6 flex-wrap">
        <Link
          to="/my-orders"
          className="px-[26px] py-[13px] rounded-full border border-ink text-ink bg-transparent font-semibold text-[14.5px] hover:bg-ink hover:text-[#ffffff] transition-colors"
        >
          My orders
        </Link>
        <Link
          to="/addresses"
          className="px-[26px] py-[13px] rounded-full border border-ink text-ink bg-transparent font-semibold text-[14.5px] hover:bg-ink hover:text-[#ffffff] transition-colors"
        >
          My addresses
        </Link>
      </div>
    </main>
  )
}
