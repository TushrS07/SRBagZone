import { Navigate, useLocation } from 'react-router-dom'
import { getUser } from '../../userAuth'

export default function RequireAuth({ children }) {
  const location = useLocation()
  const user = getUser()
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />
  }
  return children
}
