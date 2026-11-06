import { useAuth, Role } from '../context/AuthContext'

export function RoleGate({ allow, children, fallback = null }: {
  allow: Role[]; children: React.ReactNode; fallback?: React.ReactNode
}) {
  const { profile } = useAuth()
  const role: Role = profile?.role ?? 'guest'
  return allow.includes(role) ? <>{children}</> : <>{fallback}</>
}