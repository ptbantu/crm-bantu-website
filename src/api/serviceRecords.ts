/**
 * 服务记录管理相关 API
 */
import { get, post, put, del } from './client'
import { API_PATHS } from './config'
import {
  ServiceRecordListParams,
  ServiceRecord,
  PaginatedResponse,
} from './types'

/**
 * 获取服务记录列表
 */
export async function getServiceRecordList(
  params: ServiceRecordListParams = {}
): Promise<PaginatedResponse<ServiceRecord>> {
  const queryParams = new URLSearchParams()
  
  if (params.page !== undefined) {
    queryParams.append('page', params.page.toString())
  }
  if (params.size !== undefined) {
    queryParams.append('size', params.size.toString())
  }
  if (params.customer_id) {
    queryParams.append('customer_id', params.customer_id)
  }
  if (params.service_type_id) {
    queryParams.append('service_type_id', params.service_type_id)
  }
  if (params.product_id) {
    queryParams.append('product_id', params.product_id)
  }
  if (params.contact_id) {
    queryParams.append('contact_id', params.contact_id)
  }
  if (params.sales_user_id) {
    queryParams.append('sales_user_id', params.sales_user_id)
  }
  if (params.status) {
    queryParams.append('status', params.status)
  }
  if (params.priority) {
    queryParams.append('priority', params.priority)
  }
  if (params.referral_customer_id) {
    queryParams.append('referral_customer_id', params.referral_customer_id)
  }

  const queryString = queryParams.toString()
  const url = queryString
    ? `${API_PATHS.SERVICE_RECORDS.BASE}?${queryString}`
    : API_PATHS.SERVICE_RECORDS.BASE

  const result = await get<{ items: ServiceRecord[]; total: number; page: number; size: number }>(url)
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
 * 根据客户ID获取服务记录列表
 */
export async function getServiceRecordListByCustomer(
  customerId: string,
  params: Omit<ServiceRecordListParams, 'customer_id'> = {}
): Promise<PaginatedResponse<ServiceRecord>> {
  const queryParams = new URLSearchParams()
  
  if (params.page !== undefined) {
    queryParams.append('page', params.page.toString())
  }
  if (params.size !== undefined) {
    queryParams.append('size', params.size.toString())
  }
  if (params.status) {
    queryParams.append('status', params.status)
  }
  if (params.priority) {
    queryParams.append('priority', params.priority)
  }

  const queryString = queryParams.toString()
  const url = queryString
    ? `${API_PATHS.SERVICE_RECORDS.BY_CUSTOMER(customerId)}?${queryString}`
    : API_PATHS.SERVICE_RECORDS.BY_CUSTOMER(customerId)

  const result = await get<{ items: ServiceRecord[]; total: number; page: number; size: number }>(url)
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
 * 获取服务记录详情
 */
export async function getServiceRecordDetail(id: string): Promise<ServiceRecord> {
  const result = await get<ServiceRecord>(API_PATHS.SERVICE_RECORDS.BY_ID(id))
  return result.data!
}

/**
 * 创建服务记录
 */
export interface CreateServiceRecordRequest {
  customer_id: string
  service_type_id?: string | null
  product_id?: string | null
  service_name?: string | null
  service_description?: string | null
  service_code?: string | null
  contact_id?: string | null
  sales_user_id?: string | null
  referral_customer_id?: string | null
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold'
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  status_description?: string | null
  expected_start_date?: string | null
  expected_completion_date?: string | null
  deadline?: string | null
  estimated_price?: number | null
  final_price?: number | null
  currency_code?: string
  price_notes?: string | null
  quantity?: number
  unit?: string | null
  requirements?: string | null
  customer_requirements?: string | null
  internal_notes?: string | null
  customer_notes?: string | null
  required_documents?: string | null
  attachments?: string[]
  next_follow_up_at?: string | null
  follow_up_notes?: string | null
  tags?: string[]
}

export async function createServiceRecord(data: CreateServiceRecordRequest): Promise<ServiceRecord> {
  const result = await post<ServiceRecord>(API_PATHS.SERVICE_RECORDS.BASE, data)
  return result.data!
}

/**
 * 更新服务记录
 */
export interface UpdateServiceRecordRequest {
  service_type_id?: string | null
  product_id?: string | null
  service_name?: string | null
  service_description?: string | null
  service_code?: string | null
  contact_id?: string | null
  sales_user_id?: string | null
  referral_customer_id?: string | null
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold'
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  status_description?: string | null
  expected_start_date?: string | null
  expected_completion_date?: string | null
  actual_start_date?: string | null
  actual_completion_date?: string | null
  deadline?: string | null
  estimated_price?: number | null
  final_price?: number | null
  currency_code?: string
  price_notes?: string | null
  quantity?: number
  unit?: string | null
  requirements?: string | null
  customer_requirements?: string | null
  internal_notes?: string | null
  customer_notes?: string | null
  required_documents?: string | null
  attachments?: string[]
  last_follow_up_at?: string | null
  next_follow_up_at?: string | null
  follow_up_notes?: string | null
  tags?: string[]
}

export async function updateServiceRecord(
  id: string,
  data: UpdateServiceRecordRequest
): Promise<ServiceRecord> {
  const result = await put<ServiceRecord>(API_PATHS.SERVICE_RECORDS.BY_ID(id), data)
  return result.data!
}

/**
 * 删除服务记录
 */
export async function deleteServiceRecord(id: string): Promise<void> {
  await del(API_PATHS.SERVICE_RECORDS.BY_ID(id))
}

