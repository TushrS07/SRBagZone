import { Navigate, useLocation } from 'react-router-dom'
import { getUser } from '../userAuth'

export default function RequireCustomerAuth({ children }) {
  const location = useLocation()
  const user = getUser()
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  }
  return children
}
