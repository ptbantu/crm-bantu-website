/**
 * 客户管理相关 API
 */
import { get, post, put, del } from './client'
import { API_PATHS } from './config'
import {
  CustomerListParams,
  Customer,
  PaginatedResponse,
} from './types'

/**
 * 获取客户列表
 */
export async function getCustomerList(
  params: CustomerListParams = {}
): Promise<PaginatedResponse<Customer>> {
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
  if (params.customer_type) {
    queryParams.append('customer_type', params.customer_type)
  }
  if (params.customer_source_type) {
    queryParams.append('customer_source_type', params.customer_source_type)
  }
  if (params.parent_customer_id) {
    queryParams.append('parent_customer_id', params.parent_customer_id)
  }
  if (params.owner_user_id) {
    queryParams.append('owner_user_id', params.owner_user_id)
  }
  if (params.agent_id) {
    queryParams.append('agent_id', params.agent_id)
  }
  if (params.source_id) {
    queryParams.append('source_id', params.source_id)
  }
  if (params.channel_id) {
    queryParams.append('channel_id', params.channel_id)
  }
  if (params.industry_id) {
    queryParams.append('industry_id', params.industry_id)
  }
  if (params.is_locked !== undefined) {
    queryParams.append('is_locked', params.is_locked.toString())
  }
  if (params.view_type) {
    queryParams.append('view_type', params.view_type)
  }

  const queryString = queryParams.toString()
  const url = queryString
    ? `${API_PATHS.CUSTOMERS.BASE}?${queryString}`
    : API_PATHS.CUSTOMERS.BASE

  const result = await get<{ items: Customer[]; total: number; page: number; size: number }>(url)
  // 转换响应格式为统一的 PaginatedResponse
  return {
    records: result.data!.items,
    total: result.data!.total,
    current: result.data!.page,
    pages: Math.ceil(result.data!.total / result.data!.size),
    size: result.data!.size,
  }
}

/**
 * 获取客户详情
 */
export async function getCustomerDetail(id: string): Promise<Customer> {
  const result = await get<Customer>(API_PATHS.CUSTOMERS.BY_ID(id))
  return result.data!
}

/**
 * 创建客户
 */
export interface CreateCustomerRequest {
  name: string
  code?: string | null  // 可选，如果不提供则自动生成
  customer_type?: 'B' | 'C'  // B (B端), C (C端)
  customer_source_type?: 'own' | 'agent'
  parent_customer_id?: string | null
  owner_user_id?: string | null
  agent_user_id?: string | null
  agent_id?: string | null
  source_id?: string | null
  channel_id?: string | null
  level?: string | null
  industry_id?: string | null  // 改为 industry_id
  description?: string | null
  tags?: string[]
  is_locked?: boolean
  customer_requirements?: string | null
}

export async function createCustomer(data: CreateCustomerRequest): Promise<Customer> {
  const result = await post<Customer>(API_PATHS.CUSTOMERS.BASE, data)
  return result.data!
}

/**
 * 更新客户
 */
export interface UpdateCustomerRequest {
  name?: string
  code?: string | null
  customer_type?: 'B' | 'C'  // B (B端), C (C端)
  customer_source_type?: 'own' | 'agent'
  parent_customer_id?: string | null
  owner_user_id?: string | null
  agent_user_id?: string | null
  agent_id?: string | null
  source_id?: string | null
  channel_id?: string | null
  level?: string | null
  industry_id?: string | null  // 改为 industry_id
  description?: string | null
  tags?: string[]
  is_locked?: boolean
  customer_requirements?: string | null
}

export async function updateCustomer(
  id: string,
  data: UpdateCustomerRequest
): Promise<Customer> {
  const result = await put<Customer>(API_PATHS.CUSTOMERS.BY_ID(id), data)
  return result.data!
}

/**
 * 删除客户
 */
export async function deleteCustomer(id: string): Promise<void> {
  await del(API_PATHS.CUSTOMERS.BY_ID(id))
}

