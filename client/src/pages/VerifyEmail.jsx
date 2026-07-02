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
    <main className="max-w-[460px] mx-auto mt-[60px] mb-20 px-5">
      <div className="bg-surface border border-line rounded-lg p-9 flex flex-col gap-3.5 shadow-sm text-center" style={{ gap: 16 }}>
        {state === 'pending' && <h1 className="font-serif text-[30px] m-0 tracking-[-0.3px]">Verifying…</h1>}
        {state === 'ok' && (
          <>
            <div className="w-16 h-16 rounded-full bg-[#2f7a3a] text-[#ffffff] inline-grid place-items-center text-[32px] mx-auto">✓</div>
            <h1 className="font-serif text-[30px] m-0 tracking-[-0.3px]">Email verified</h1>
            <p className="text-muted m-0">{message}</p>
            <Link to="/" className="p-4 bg-ink text-[#ffffff] rounded-full font-semibold text-[15px] transition-colors hover:bg-accent-deep w-full no-underline text-center">
              Continue shopping
            </Link>
          </>
        )}
        {state === 'error' && (
          <>
            <h1 className="font-serif text-[30px] m-0 tracking-[-0.3px] text-danger">Verification failed</h1>
            <p className="text-muted m-0">{message}</p>
            <Link to="/login" className="p-4 bg-ink text-[#ffffff] rounded-full font-semibold text-[15px] transition-colors hover:bg-accent-deep w-full no-underline text-center">
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </main>
  )
}
