/**
 * useMenu Hook
 * 根据用户权限过滤菜单项
 */
import { useMemo } from 'react'
import { useAuth } from './useAuth'
import { adminMenuItems, MenuItem } from '@/config/menu'
import { checkPermission, checkRole } from '@/utils/permissions'

export const useMenu = () => {
  const { permissions, roles } = useAuth()

  const filteredMenu = useMemo(() => {
    // 调试信息（开发环境）
    if (import.meta.env.DEV) {
      console.log('[useMenu] Current roles:', roles)
      console.log('[useMenu] Current permissions:', permissions)
    }

    const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
      return items
        .filter(item => {
          // 检查权限
          if (item.permission) {
            if (!checkPermission(permissions, item.permission)) {
              return false
            }
          }
          
          // 检查角色
          if (item.role) {
            // 将枚举值转换为字符串（Role.ADMIN -> 'ADMIN'）
            const roleValue = Array.isArray(item.role) 
              ? item.role.map(r => String(r))
              : String(item.role)
            
            if (!checkRole(roles, roleValue)) {
              if (import.meta.env.DEV) {
                console.log(`[useMenu] Filtered out menu item: ${item.key}, required role:`, roleValue, 'user roles:', roles)
              }
              return false
            }
          }
          
          return true
        })
        .map(item => {
          // 递归过滤子菜单
          if (item.children) {
            return {
              ...item,
              children: filterMenuItems(item.children),
            }
          }
          return item
        })
        .filter(item => {
          // 如果父菜单有子菜单，但子菜单全部被过滤，则隐藏父菜单
          if (item.children && item.children.length === 0) {
            return false
          }
          return true
        })
    }

    return filterMenuItems(adminMenuItems)
  }, [permissions, roles])

  return filteredMenu
}

