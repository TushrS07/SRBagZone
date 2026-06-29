import { useEffect, useState } from 'react'
import { getUser, onAuthChange } from './userAuth'

export function useUser() {
  const [user, setUser] = useState(() => getUser())
  useEffect(() => {
    const refresh = () => setUser(getUser())
    return onAuthChange(refresh)
  }, [])
  return user
}
