import { useApp } from '../useApp'

export default function Toast() {
  const { toast } = useApp()
  return (
    <div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite">
      <span className="toast-check">✓</span>
      {toast}
    </div>
  )
}
