import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '../../contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthContext()

  // Wait for session restore before deciding to redirect
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-neo">
        <div className="border-neo-thick border-dark shadow-neo bg-primary px-6 py-4 font-black text-lg">
          Loading…
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
