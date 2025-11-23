/**
 * 权限管理相关 API
 */
import { get, post, put } from './client'
import { API_PATHS } from './config'

/**
 * 权限信息
 */
export interface Permission {
  id: string
  code: string
  name_zh: string
  name_id: string
  description_zh?: string
  description_id?: string
  resource_type: string
  action: string
  display_order?: number
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

/**
 * 获取权限列表
 */
export interface GetPermissionListParams {
  resource_type?: string
  is_active?: boolean
}

export async function getPermissionList(
  params: GetPermissionListParams = {}
): Promise<Permission[]> {
  const queryParams = new URLSearchParams()
  if (params.resource_type) {
    queryParams.append('resource_type', params.resource_type)
  }
  if (params.is_active !== undefined) {
    queryParams.append('is_active', params.is_active.toString())
  }

  const queryString = queryParams.toString()
  const url = queryString
    ? `${API_PATHS.PERMISSIONS.BASE}?${queryString}`
    : API_PATHS.PERMISSIONS.BASE

  const result = await get<Permission[]>(url)
  return result.data || []
}

/**
 * 获取角色的权限列表
 */
export async function getRolePermissions(roleId: string): Promise<Permission[]> {
  const result = await get<Permission[]>(
    `${API_PATHS.PERMISSIONS.BASE}/roles/${roleId}`
  )
  return result.data || []
}

/**
 * 为角色分配权限
 */
export interface AssignRolePermissionsRequest {
  permission_ids: string[]
}

export async function assignRolePermissions(
  roleId: string,
  data: AssignRolePermissionsRequest
): Promise<void> {
  await post(
    `${API_PATHS.PERMISSIONS.BASE}/roles/${roleId}/assign`,
    data
  )
}

