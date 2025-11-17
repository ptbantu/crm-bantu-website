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

// 用户列表查询参数
export interface UserListParams {
  page?: number
  size?: number
  username?: string
  email?: string
  organization_id?: string
  role_id?: string
  is_active?: boolean
}

// 用户列表项
export interface UserListItem {
  id: string
  username: string
  email: string | null
  display_name: string | null
  primary_organization_id?: string | null
  primary_organization_name?: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
  roles?: Array<{
    id: string
    code: string
    name: string
  }>
}

// 分页响应
export interface PaginatedResponse<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

// 用户详情（完整信息）
export interface UserDetail {
  id: string
  username: string
  email: string | null
  phone: string | null
  display_name: string | null
  avatar_url: string | null
  bio: string | null
  gender: string | null
  address: string | null
  contact_phone: string | null
  whatsapp: string | null
  wechat: string | null
  primary_organization_id: string | null
  primary_organization_name: string | null
  is_active: boolean
  last_login_at: string | null
  roles: Array<{
    id: string
    code: string
    name: string
  }>
  created_at: string
  updated_at: string
}

// 组织列表查询参数
export interface OrganizationListParams {
  page?: number
  size?: number
  name?: string
  code?: string
  organization_type?: 'internal' | 'vendor' | 'agent'
  is_active?: boolean
}

// 组织信息（列表项）
export interface Organization {
  id: string
  name: string
  code: string
  organization_type: 'internal' | 'vendor' | 'agent'
  email?: string | null
  phone?: string | null
  website?: string | null
  logo_url?: string | null
  description?: string | null
  is_active: boolean
  is_locked?: boolean
  is_verified?: boolean
  employees_count?: number
  created_at?: string
  updated_at?: string
}

// 组织详情（完整信息）
export interface OrganizationDetail extends Organization {
  external_id?: string | null
  parent_id?: string | null
  website?: string | null
  logo_url?: string | null
  description?: string | null
  street?: string | null
  city?: string | null
  state_province?: string | null
  postal_code?: string | null
  country?: string | null
  country_code?: string | null
  company_size?: string | null
  company_nature?: string | null
  company_type?: string | null
  industry?: string | null
  registration_number?: string | null
  tax_id?: string | null
  legal_representative?: string | null
  is_locked?: boolean
  is_verified?: boolean
}

// 角色信息
export interface Role {
  id: string
  code: string
  name: string
  description: string | null
}

