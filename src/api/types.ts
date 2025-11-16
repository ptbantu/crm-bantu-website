/**
 * API 响应类型定义
 */

// 统一响应格式
export interface ApiResult<T = any> {
  code: number
  message: string
  data: T | null
  timestamp?: string
}

// 登录请求
export interface LoginRequest {
  email: string
  password: string
}

// 用户信息
export interface UserInfo {
  id: string
  username: string
  email: string | null
  display_name: string | null
  primary_organization_id: string | null
  primary_organization_name: string | null
  roles: string[]
  permissions: string[]
}

// 登录响应
export interface LoginResponse {
  token: string
  refresh_token: string
  user: UserInfo
  expires_in: number
}

