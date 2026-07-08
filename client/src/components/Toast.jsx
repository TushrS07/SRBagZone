import { useApp } from '../useApp'

export default function Toast() {
  const { toast } = useApp()
  return (
    <div
      className={`fixed bottom-7 left-1/2 -translate-x-1/2 bg-ink text-white px-[22px] py-3 rounded-full text-sm font-medium shadow-md z-[120] flex items-center gap-2 transition-[transform,visibility] duration-300 [transition-timing-function:cubic-bezier(0.22,0.61,0.36,1)] max-sm:left-4 max-sm:right-4 max-sm:bottom-4 max-sm:translate-x-0 max-sm:rounded-md max-sm:px-[18px] max-sm:text-[13.5px] ${toast ? 'translate-y-0 visible pointer-events-auto' : 'translate-y-[120%] invisible pointer-events-none'}`}
      role="status"
      aria-live="polite"
    >
      <span className="w-5 h-5 rounded-full bg-[#2f7a3a] grid place-items-center text-xs">✓</span>
      {toast}
    </div>
  )
}
