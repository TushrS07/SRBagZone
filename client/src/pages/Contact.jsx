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
// Same RFC-ish shape the browser uses for type="email" — covers the common
// cases without dragging in a library.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Per-field validators — return an error string or '' when valid.
// Centralised so onChange, onBlur, and submit all stay in sync.
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
      if (!value.trim()) return '' // optional
      return EMAIL_RE.test(value.trim()) ? '' : 'Enter a valid email like name@example.com.'
    case 'message':
      return value.trim() ? '' : 'Please share a few details.'
    default:
      return ''
  }
}

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
  // Track which fields the user has touched (blurred). We don't surface
  // "please tell us your name" before they've even left the field.
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')

  const setFieldError = (name, value) => {
    setErrors((er) => ({ ...er, [name]: validateField(name, value) || undefined }))
  }

  const update = (k) => (e) => {
    let val = e.target.value
    // Strip non-digits live in the phone field so the user can't even type
    // letters or symbols. Keeps the input self-correcting.
    if (k === 'phone') val = val.replace(/\D/g, '').slice(0, 10)
    setForm((f) => ({ ...f, [k]: val }))
    // Once the field has been touched (blurred once), keep validation live so
    // the error message disappears as soon as the input becomes valid.
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
      // Mark every invalid field as touched so the errors show on submit too.
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
    <main className="contact-page">
      <section className="contact-hero">
        <span className="hero-eyebrow">Get in touch</span>
        <h1>How can we help?</h1>
        <p>
          Questions about a product, a bulk order for your school or business, or
          help with a recent purchase — drop us a note and we'll respond within
          one working day.
        </p>
      </section>

      <section className="contact-grid">
        <aside className="contact-info">
          <div className="contact-info-card">
            <h3>Customer support</h3>
            <p>
              <a href="tel:+918890308955">+91 88903 08955</a>
            </p>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>
              Mon – Sat, 10am to 7pm IST
            </p>
          </div>
          <div className="contact-info-card">
            <h3>Wholesale</h3>
            <p>
              <a href="mailto:wholesale@srbagzzone.com">wholesale@srbagzzone.com</a>
            </p>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>
              Minimum order 50 units. Custom branding available.
            </p>
          </div>
          <div className="contact-info-card">
            <h3>Visit us</h3>
            <p>SR Bagz Zone, Jaipur, Rajasthan</p>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>
              Showroom open by appointment.
            </p>
          </div>
        </aside>

        <div className="contact-form-card">
          {submitted ? (
            <div className="contact-success">
              <div className="contact-success-icon">✓</div>
              <h2>Thanks for reaching out</h2>
              <p>
                Your inquiry is in. Someone from our team will follow up at the
                number you shared.
              </p>
              <button type="button" className="btn btn-ghost" onClick={sendAnother}>
                Send another inquiry
              </button>
            </div>
          ) : (
            <form className="contact-form" onSubmit={submit} noValidate>
              <h2>Send us an inquiry</h2>
              {serverError && (
                <p className="contact-server-error">⚠ {serverError}</p>
              )}
              <label>
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
                />
                {errors.name && <small className="field-error">{errors.name}</small>}
              </label>

              <div className="contact-row">
                <label>
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
                  />
                  {errors.phone && <small className="field-error">{errors.phone}</small>}
                </label>

                <label>
                  <span>Email <span className="optional">(optional)</span></span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={update('email')}
                    onBlur={handleBlur('email')}
                    placeholder="you@example.com"
                    autoComplete="email"
                    disabled={submitting}
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && <small className="field-error">{errors.email}</small>}
                </label>
              </div>

              <label>
                <span>Your requirement</span>
                <select
                  value={form.requirement}
                  onChange={update('requirement')}
                  disabled={submitting}
                >
                  {REQUIREMENT_OPTIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </label>

              <label>
                <span>Message</span>
                <textarea
                  rows={5}
                  value={form.message}
                  onChange={update('message')}
                  onBlur={handleBlur('message')}
                  placeholder="Tell us about your requirement — quantity, deadline, customization, etc."
                  disabled={submitting}
                  aria-invalid={!!errors.message}
                />
                {errors.message && <small className="field-error">{errors.message}</small>}
              </label>

              <button type="submit" className="checkout-btn" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send inquiry'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
