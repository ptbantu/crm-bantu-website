/**
 * 认证相关 API
 */
import { post } from './client'
import { API_PATHS } from './config'
import { LoginRequest, LoginResponse } from './types'
import { storage } from '@/utils/storage'

/**
 * 用户登录
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const requestData: LoginRequest = {
    email,
    password,
  }

  const result = await post<LoginResponse>(API_PATHS.AUTH.LOGIN, requestData, {
    skipAuth: true, // 登录接口不需要认证
  })

  if (result.data) {
    // 保存Token和用户信息
    storage.setToken(result.data.token)
    storage.setRefreshToken(result.data.refresh_token)
    storage.setUserInfo(result.data.user)
  }

  return result.data!
}

/**
 * 用户登出
 */
export function logout(): void {
  storage.clear()
}

/**
 * 检查是否已登录
 */
export function isAuthenticated(): boolean {
  return !!storage.getToken()
}

/**
 * 获取当前用户信息
 */
export function getCurrentUser() {
  return storage.getUserInfo()
}

/**
 * 获取用户信息（从 API）
 */
export async function getUserInfo(): Promise<UserInfo> {
  const { get } = await import('./client')
  const { API_PATHS } = await import('./config')
  const result = await get<UserInfo>(API_PATHS.AUTH.USER_INFO)
  return result.data!
}

