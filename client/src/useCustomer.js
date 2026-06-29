import { useEffect, useState } from 'react'
import { getCustomer, onCustomerChange } from './customerAuth'

export function useCustomer() {
  const [customer, setCustomer] = useState(() => getCustomer())
  useEffect(() => {
    const refresh = () => setCustomer(getCustomer())
    return onCustomerChange(refresh)
  }, [])
  return customer
}
