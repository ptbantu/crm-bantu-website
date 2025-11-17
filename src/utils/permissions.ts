/**
 * 权限工具函数
 */
import { Permission } from '@/config/permissions'

/**
 * 检查用户是否拥有指定权限
 * @param userPermissions 用户拥有的权限列表
 * @param requiredPermission 需要的权限（单个或数组）
 * @returns 是否拥有权限
 */
export const checkPermission = (
  userPermissions: string[],
  requiredPermission: Permission | Permission[]
): boolean => {
  if (!userPermissions || userPermissions.length === 0) {
    return false
  }

  if (Array.isArray(requiredPermission)) {
    // 需要满足所有权限（AND）
    return requiredPermission.every(p => userPermissions.includes(p))
  }
  
  return userPermissions.includes(requiredPermission)
}

/**
 * 检查用户是否拥有任一指定权限（OR）
 * @param userPermissions 用户拥有的权限列表
 * @param requiredPermissions 需要的权限列表
 * @returns 是否拥有任一权限
 */
export const checkAnyPermission = (
  userPermissions: string[],
  requiredPermissions: Permission[]
): boolean => {
  if (!userPermissions || userPermissions.length === 0) {
    return false
  }
  
  // 满足任一权限即可（OR）
  return requiredPermissions.some(p => userPermissions.includes(p))
}

/**
 * 检查用户是否拥有指定角色
 * @param userRoles 用户拥有的角色列表
 * @param requiredRole 需要的角色（单个或数组）
 * @returns 是否拥有角色
 */
export const checkRole = (
  userRoles: string[],
  requiredRole: string | string[]
): boolean => {
  if (!userRoles || userRoles.length === 0) {
    return false
  }

  if (Array.isArray(requiredRole)) {
    // 满足任一角色即可（OR）
    return requiredRole.some(role => userRoles.includes(role))
  }
  
  return userRoles.includes(requiredRole)
}

/**
 * 检查用户是否为管理员
 * @param userRoles 用户拥有的角色列表
 * @returns 是否为管理员
 */
export const isAdmin = (userRoles: string[]): boolean => {
  return checkRole(userRoles, 'ADMIN')
}

