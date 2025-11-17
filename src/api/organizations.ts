/**
 * 组织管理相关 API
 */
import { get, post, put, del } from './client'
import { API_PATHS } from './config'
import {
  OrganizationListParams,
  Organization,
  OrganizationDetail,
  PaginatedResponse,
} from './types'

/**
 * 获取组织列表
 */
export async function getOrganizationList(
  params: OrganizationListParams = {}
): Promise<PaginatedResponse<Organization>> {
  // 构建查询参数
  const queryParams = new URLSearchParams()
  
  if (params.page !== undefined) {
    queryParams.append('page', params.page.toString())
  }
  if (params.size !== undefined) {
    queryParams.append('size', params.size.toString())
  }
  if (params.name) {
    queryParams.append('name', params.name)
  }
  if (params.code) {
    queryParams.append('code', params.code)
  }
  if (params.organization_type) {
    queryParams.append('organization_type', params.organization_type)
  }
  if (params.is_active !== undefined) {
    queryParams.append('is_active', params.is_active.toString())
  }

  const queryString = queryParams.toString()
  const url = queryString
    ? `${API_PATHS.ORGANIZATIONS.BASE}?${queryString}`
    : API_PATHS.ORGANIZATIONS.BASE

  const result = await get<PaginatedResponse<Organization>>(url)
  return result.data!
}

/**
 * 获取组织详情
 */
export async function getOrganizationDetail(id: string): Promise<OrganizationDetail> {
  const result = await get<OrganizationDetail>(API_PATHS.ORGANIZATIONS.BY_ID(id))
  return result.data!
}

/**
 * 创建组织
 */
export interface CreateOrganizationRequest {
  name: string
  code?: string
  organization_type: 'internal' | 'vendor' | 'agent'
  email?: string
  phone?: string
  is_active?: boolean
}

export async function createOrganization(data: CreateOrganizationRequest): Promise<Organization> {
  const result = await post<Organization>(API_PATHS.ORGANIZATIONS.BASE, data)
  return result.data!
}

/**
 * 更新组织
 */
export interface UpdateOrganizationRequest {
  name?: string
  code?: string
  email?: string
  phone?: string
  is_active?: boolean
}

export async function updateOrganization(
  id: string,
  data: UpdateOrganizationRequest
): Promise<Organization> {
  const result = await put<Organization>(API_PATHS.ORGANIZATIONS.BY_ID(id), data)
  return result.data!
}

/**
 * 删除组织（禁用）
 */
export async function deleteOrganization(id: string): Promise<void> {
  await del(API_PATHS.ORGANIZATIONS.BY_ID(id))
}

/**
 * 恢复组织
 */
export async function restoreOrganization(id: string): Promise<void> {
  await put<Organization>(API_PATHS.ORGANIZATIONS.BY_ID(id) + '/restore', {})
}

