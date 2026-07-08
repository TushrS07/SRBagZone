import { useState } from 'react'
import { api } from '../api'
import { useApp } from '../useApp'

const REQUIREMENT_OPTIONS = [
  'General Inquiry',
  'Wholesale Order',
  'Bulk / Corporate Gifting',
  'Custom Order',
  'Returns & Support',
]

const PHONE_RE = /^[6-9]\d{9}$/
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateField(name, value) {
  switch (name) {
    case 'name':
      return value.trim() ? '' : 'Please tell us your name.'
    case 'phone': {
      const v = value.replace(/[\s-]/g, '')
      if (!v) return 'Phone number is required.'
      if (!/^\d+$/.test(v)) return 'Digits only — no letters or symbols.'
      if (v.length < 10) return `${10 - v.length} more digit${10 - v.length === 1 ? '' : 's'} to go.`
      if (v.length > 10) return 'Phone must be exactly 10 digits.'
      if (!PHONE_RE.test(v)) return 'Indian mobile numbers start with 6, 7, 8, or 9.'
      return ''
    }
    case 'email':
      if (!value.trim()) return ''
      return EMAIL_RE.test(value.trim()) ? '' : 'Enter a valid email like name@example.com.'
    case 'message':
      return value.trim() ? '' : 'Please share a few details.'
    default:
      return ''
  }
}

const inputCls = "px-[14px] py-3 border border-line rounded-[12px] font-sans text-sm max-sm:text-base text-ink bg-white outline-none transition-colors focus:border-accent focus:shadow-[0_0_0_3px_rgba(184,114,43,0.12)] w-full"
const labelCls = "flex flex-col gap-1.5 text-[13px] text-ink-soft"

export default function Contact() {
  const { setToast } = useApp()
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    requirement: 'General Inquiry',
    message: '',
  })
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')

  const setFieldError = (name, value) => {
    setErrors((er) => ({ ...er, [name]: validateField(name, value) || undefined }))
  }

  const update = (k) => (e) => {
    let val = e.target.value
    if (k === 'phone') val = val.replace(/\D/g, '').slice(0, 10)
    setForm((f) => ({ ...f, [k]: val }))
    if (touched[k]) setFieldError(k, val)
  }

  const handleBlur = (k) => () => {
    setTouched((t) => ({ ...t, [k]: true }))
    setFieldError(k, form[k])
  }

  const validateAll = () => {
    const next = {}
    for (const k of ['name', 'phone', 'email', 'message']) {
      const msg = validateField(k, form[k])
      if (msg) next[k] = msg
    }
    return next
  }

  const submit = async (e) => {
    e.preventDefault()
    setServerError('')
    const v = validateAll()
    if (Object.keys(v).length) {
      setErrors(v)
      setTouched((t) => ({ ...t, ...Object.fromEntries(Object.keys(v).map((k) => [k, true])) }))
      return
    }
    setSubmitting(true)
    try {
      await api.submitInquiry({
        name: form.name.trim(),
        phone: form.phone.replace(/[\s-]/g, ''),
        email: form.email.trim() || undefined,
        requirement: form.requirement,
        message: form.message.trim(),
      })
      setSubmitted(true)
      setToast("Thanks! We've received your inquiry and will be in touch soon.")
    } catch (err) {
      setServerError(err.message || 'Could not send your inquiry. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const sendAnother = () => {
    setForm({ name: '', phone: '', email: '', requirement: 'General Inquiry', message: '' })
    setErrors({})
    setTouched({})
    setSubmitted(false)
    setServerError('')
  }

  return (
    <main className="max-w-[1140px] mx-auto pt-10 px-8 pb-20 max-tablet:pt-9 max-tablet:px-[18px] max-tablet:pb-[60px]">
      <section className="max-w-[720px] mb-10">
        <span className="hero-eyebrow">Get in touch</span>
        <h1 className="font-serif text-[clamp(34px,5vw,50px)] leading-[1.1] mt-2 mb-3 tracking-[-0.5px]">How can we help?</h1>
        <p className="text-ink-soft leading-[1.6]">
          Questions about a product, a bulk order for your school or business, or
          help with a recent purchase — drop us a note and we'll respond within
          one working day.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 items-start tablet:grid-cols-[320px_1fr] tablet:gap-8">
        {/* Left — contact info cards */}
        <aside className="flex flex-col gap-3.5">
          <div className="bg-surface border border-line rounded-md px-[22px] py-5 shadow-sm">
            <h3 className="font-serif text-[18px] font-medium m-0 mb-1.5 tracking-[-0.2px]">Customer support</h3>
            <p className="text-sm text-ink mt-1">
              <a href="tel:+918890308955" className="hover:text-accent-deep transition-colors">+91 88903 08955</a>
            </p>
            <p className="text-muted text-[13px] mt-0.5">Mon – Sat, 10am to 7pm IST</p>
          </div>
          <div className="bg-surface border border-line rounded-md px-[22px] py-5 shadow-sm">
            <h3 className="font-serif text-[18px] font-medium m-0 mb-1.5 tracking-[-0.2px]">Wholesale</h3>
            <p className="text-sm text-ink mt-1">
              <a href="mailto:srbagzzone@gmail.com" className="hover:text-accent-deep transition-colors">srbagzzone@gmail.com</a>
            </p>
          </div>
          <div className="bg-surface border border-line rounded-md px-[22px] py-5 shadow-sm">
            <h3 className="font-serif text-[18px] font-medium m-0 mb-1.5 tracking-[-0.2px]">Visit us</h3>
            <p className="text-sm text-ink mt-1">SR Bagz Zone, Sangria, Hanumangarh, Rajasthan</p>
          </div>
        </aside>

        {/* Right — inquiry form */}
        <div className="bg-surface border border-line rounded-lg shadow-md px-8 py-9 max-tablet:px-[22px] max-tablet:py-[26px]">
          {submitted ? (
            <div className="flex flex-col items-center text-center py-8 gap-4">
              <div className="w-16 h-16 rounded-full bg-accent-soft text-accent-deep grid place-items-center text-[32px] font-bold">✓</div>
              <h2 className="font-serif text-[26px] font-medium m-0">Thanks for reaching out</h2>
              <p className="text-ink-soft leading-[1.6] max-w-[380px]">
                Your inquiry is in. Someone from our team will follow up at the number you shared.
              </p>
              <button
                type="button"
                className="mt-2 px-[22px] py-[11px] rounded-full border border-ink text-ink font-semibold text-sm transition-colors hover:bg-ink hover:text-[#ffffff]"
                onClick={sendAnother}
              >
                Send another inquiry
              </button>
            </div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={submit} noValidate>
              <h2 className="font-serif text-[24px] font-medium m-0 mb-1">Send us an inquiry</h2>
              {serverError && (
                <p className="text-danger text-[13px] bg-[#fff0f0] border border-[#fcc] rounded-lg px-4 py-3">⚠ {serverError}</p>
              )}

              <label className={labelCls}>
                <span>Full name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={update('name')}
                  onBlur={handleBlur('name')}
                  placeholder="e.g. Riya Sharma"
                  autoComplete="name"
                  disabled={submitting}
                  aria-invalid={!!errors.name}
                  className={inputCls}
                />
                {errors.name && <small className="text-danger text-xs font-medium">{errors.name}</small>}
              </label>

              <div className="grid grid-cols-2 gap-3.5 max-tablet:grid-cols-1">
                <label className={labelCls}>
                  <span>Phone</span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[6-9][0-9]{9}"
                    value={form.phone}
                    onChange={update('phone')}
                    onBlur={handleBlur('phone')}
                    placeholder="10-digit mobile"
                    maxLength={10}
                    autoComplete="tel"
                    disabled={submitting}
                    aria-invalid={!!errors.phone}
                    className={inputCls}
                  />
                  {errors.phone && <small className="text-danger text-xs font-medium">{errors.phone}</small>}
                </label>

                <label className={labelCls}>
                  <span>Email <span className="text-muted font-normal">(optional)</span></span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={update('email')}
                    onBlur={handleBlur('email')}
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={submitting}
                    aria-invalid={!!errors.email}
                    className={inputCls}
                  />
                  {errors.email && <small className="text-danger text-xs font-medium">{errors.email}</small>}
                </label>
              </div>

              <label className={labelCls}>
                <span>Your requirement</span>
                <select
                  value={form.requirement}
                  onChange={update('requirement')}
                  disabled={submitting}
                  className={inputCls}
                >
                  {REQUIREMENT_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </label>

              <label className={labelCls}>
                <span>Message</span>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={update('message')}
                  onBlur={handleBlur('message')}
                  placeholder="Tell us about your requirement — quantity, deadline, customization, etc."
                  disabled={submitting}
                  aria-invalid={!!errors.message}
                  className={`${inputCls} resize-y`}
                />
                {errors.message && <small className="text-danger text-xs font-medium">{errors.message}</small>}
              </label>

              <button
                type="submit"
                className="p-4 bg-ink text-[#ffffff] rounded-full font-semibold text-[15px] transition-colors hover:bg-accent-deep disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={submitting}
              >
                {submitting ? 'Sending…' : 'Send inquiry'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
