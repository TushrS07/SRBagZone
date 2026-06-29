import { useContext } from 'react'
import { AppCtx } from './AppContext'

export function useApp() {
  const ctx = useContext(AppCtx)
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>')
  return ctx
}
