/**
 * 认证上下文
 * 管理用户认证状态、权限、角色
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { UserInfo } from '@/api/types'
import { Permission } from '@/config/permissions'
import { storage } from '@/utils/storage'
import { checkPermission, checkRole } from '@/utils/permissions'

interface AuthState {
  user: UserInfo | null
  token: string | null
  permissions: string[]
  roles: string[]
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  login: (token: string, user: UserInfo) => void
  logout: () => void
  refreshUserInfo: () => Promise<void>
  checkPermission: (permission: Permission | Permission[]) => boolean
  checkRole: (role: string | string[]) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    permissions: [],
    roles: [],
    isAuthenticated: false,
    isLoading: true,
  })

  // 初始化：从 localStorage 恢复状态
  useEffect(() => {
    const initAuth = async () => {
      const token = storage.getToken()
      const user = storage.getUserInfo()
      
      if (token && user) {
        try {
          // TODO: 验证 token 并获取最新用户信息
          // 目前先使用存储的用户信息
          setState({
            user,
            token,
            permissions: user.permissions || [],
            roles: user.roles || [],
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          // Token 无效，清除状态
          storage.clear()
          setState(prev => ({ ...prev, isLoading: false }))
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }

    initAuth()
  }, [])

  const login = (token: string, user: UserInfo) => {
    setState({
      user,
      token,
      permissions: user.permissions || [],
      roles: user.roles || [],
      isAuthenticated: true,
      isLoading: false,
    })
  }

  const logout = () => {
    storage.clear()
    setState({
      user: null,
      token: null,
      permissions: [],
      roles: [],
      isAuthenticated: false,
      isLoading: false,
    })
  }

  const refreshUserInfo = async () => {
    if (!state.token) return
    
    try {
      // TODO: 调用 API 获取最新用户信息
      // const userInfo = await getUserInfo()
      // setState(prev => ({
      //   ...prev,
      //   user: userInfo,
      //   permissions: userInfo.permissions || [],
      //   roles: userInfo.roles || [],
      // }))
    } catch (error) {
      logout()
    }
  }

  const checkUserPermission = (permission: Permission | Permission[]): boolean => {
    return checkPermission(state.permissions, permission)
  }

  const checkUserRole = (role: string | string[]): boolean => {
    return checkRole(state.roles, role)
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshUserInfo,
        checkPermission: checkUserPermission,
        checkRole: checkUserRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

