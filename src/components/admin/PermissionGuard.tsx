/**
 * 权限守卫组件
 * 用于保护需要特定权限或角色的路由和组件
 */
import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Permission } from '@/config/permissions'

interface PermissionGuardProps {
  children: ReactNode
  permission?: Permission | Permission[]
  role?: string | string[]
  fallback?: ReactNode
}

export const PermissionGuard = ({
  children,
  permission,
  role,
  fallback,
}: PermissionGuardProps) => {
  const { isAuthenticated, checkPermission, checkRole } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (permission && !checkPermission(permission)) {
    return fallback || <Navigate to="/dashboard" replace />
  }

  if (role && !checkRole(role)) {
    return fallback || <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

