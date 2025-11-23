/**
 * 角色管理相关 API
 */
import { get, post, put, del } from './client'
import { API_PATHS } from './config'

/**
 * 角色信息
 */
export interface Role {
  id: string
  code: string
  name: string
  name_zh?: string
  name_id?: string
  description?: string
  description_zh?: string
  description_id?: string
  permissions?: Array<{
    id: string
    code: string
    name_zh: string
    name_id: string
    resource_type: string
    action: string
  }>
  created_at?: string
  updated_at?: string
}

/**
 * 创建角色请求
 */
export interface CreateRoleRequest {
  code: string
  name: string
  name_zh?: string
  name_id?: string
  description?: string
  description_zh?: string
  description_id?: string
}

/**
 * 更新角色请求
 */
export interface UpdateRoleRequest {
  name?: string
  name_zh?: string
  name_id?: string
  description?: string
  description_zh?: string
  description_id?: string
}

/**
 * 获取角色列表
 */
export async function getRoleList(): Promise<Role[]> {
  const result = await get<Role[]>(API_PATHS.ROLES.BASE)
  return result.data || []
}

/**
 * 获取角色详情
 */
export async function getRoleDetail(id: string): Promise<Role> {
  const result = await get<Role>(API_PATHS.ROLES.BY_ID(id))
  return result.data!
}

/**
 * 创建角色
 */
export async function createRole(data: CreateRoleRequest): Promise<Role> {
  const result = await post<Role>(API_PATHS.ROLES.BASE, data)
  return result.data!
}

/**
 * 更新角色
 */
export async function updateRole(id: string, data: UpdateRoleRequest): Promise<Role> {
  const result = await put<Role>(API_PATHS.ROLES.BY_ID(id), data)
  return result.data!
}

/**
 * 删除角色
 */
export async function deleteRole(id: string): Promise<void> {
  await del(API_PATHS.ROLES.BY_ID(id))
}

