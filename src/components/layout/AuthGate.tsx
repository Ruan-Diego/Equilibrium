import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'

type AuthGateProps = {
  /** When true, authenticated users are redirected away (e.g. login). */
  guestOnly?: boolean
  children?: ReactNode
}

export function AuthGate({ guestOnly = false, children }: AuthGateProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-muted-foreground flex items-center justify-center">
        Carregando…
      </div>
    )
  }

  if (guestOnly) {
    if (user) {
      return <Navigate to="/" replace />
    }
    return children ? <>{children}</> : <Outlet />
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return children ? <>{children}</> : <Outlet />
}
