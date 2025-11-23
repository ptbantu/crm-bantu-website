/**
 * 用户管理相关 API
 */
import { get, post, put, del } from './client'
import { API_PATHS } from './config'
import {
  UserListParams,
  UserListItem,
  PaginatedResponse,
  UserDetail,
  Organization,
  Role,
} from './types'

/**
 * 获取用户列表
 */
export async function getUserList(
  params: UserListParams = {}
): Promise<PaginatedResponse<UserListItem>> {
  // 构建查询参数
  const queryParams = new URLSearchParams()
  
  if (params.page !== undefined) {
    queryParams.append('page', params.page.toString())
  }
  if (params.size !== undefined) {
    queryParams.append('size', params.size.toString())
  }
  if (params.username) {
    queryParams.append('username', params.username)
  }
  if (params.email) {
    queryParams.append('email', params.email)
  }
  if (params.organization_id) {
    queryParams.append('organization_id', params.organization_id)
  }
  if (params.role_id) {
    queryParams.append('role_id', params.role_id)
  }
  if (params.is_active !== undefined) {
    queryParams.append('is_active', params.is_active.toString())
  }

  const queryString = queryParams.toString()
  const url = queryString
    ? `${API_PATHS.USERS.BASE}?${queryString}`
    : API_PATHS.USERS.BASE

  const result = await get<PaginatedResponse<UserListItem>>(url)
  return result.data!
}

/**
 * 获取用户详情
 */
export async function getUserDetail(id: string): Promise<UserDetail> {
  const result = await get<UserDetail>(API_PATHS.USERS.BY_ID(id))
  return result.data!
}

/**
 * 获取组织列表（用于下拉选择）
 * @deprecated 使用 @/api/organizations 中的 getOrganizationList
 */
export async function getOrganizationList(): Promise<Organization[]> {
  const result = await get<PaginatedResponse<Organization>>(API_PATHS.ORGANIZATIONS.BASE)
  return result.data?.records || []
}

/**
 * 获取角色列表（用于下拉选择）
 */
export async function getRoleList(): Promise<Role[]> {
  const result = await get<Role[]>(API_PATHS.ROLES.BASE)
  return result.data || []
}

/**
 * 创建用户
 */
export interface CreateUserRequest {
  username?: string
  email?: string
  password?: string
  display_name?: string
  organization_id?: string
  role_ids?: string[]
  is_active?: boolean
}

export async function createUser(data: CreateUserRequest): Promise<UserListItem> {
  const result = await post<UserListItem>(API_PATHS.USERS.BASE, data)
  return result.data!
}

/**
 * 更新用户
 */
export interface UpdateUserRequest {
  email?: string
  phone?: string
  display_name?: string
  gender?: string
  organization_id?: string
  role_ids?: string[]
  is_active?: boolean
}

export async function updateUser(id: string, data: UpdateUserRequest): Promise<UserListItem> {
  const result = await put<UserListItem>(API_PATHS.USERS.BY_ID(id), data)
  return result.data!
}

/**
 * 删除用户（禁用）
 */
export async function deleteUser(id: string): Promise<void> {
  await del(API_PATHS.USERS.BY_ID(id))
}

