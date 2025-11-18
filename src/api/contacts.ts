/**
 * 联系人管理相关 API
 */
import { get, post, put, del } from './client'
import { API_PATHS } from './config'
import {
  ContactListParams,
  Contact,
  PaginatedResponse,
} from './types'

/**
 * 获取联系人列表（根据客户ID）
 */
export async function getContactListByCustomer(
  customerId: string,
  params: ContactListParams = {}
): Promise<PaginatedResponse<Contact>> {
  const queryParams = new URLSearchParams()
  
  if (params.page !== undefined) {
    queryParams.append('page', params.page.toString())
  }
  if (params.size !== undefined) {
    queryParams.append('size', params.size.toString())
  }
  if (params.is_primary !== undefined) {
    queryParams.append('is_primary', params.is_primary.toString())
  }
  if (params.is_active !== undefined) {
    queryParams.append('is_active', params.is_active.toString())
  }

  const queryString = queryParams.toString()
  const url = queryString
    ? `${API_PATHS.CONTACTS.BY_CUSTOMER(customerId)}?${queryString}`
    : API_PATHS.CONTACTS.BY_CUSTOMER(customerId)

  const result = await get<{ items: Contact[]; total: number; page: number; size: number }>(url)
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
 * 获取联系人详情
 */
export async function getContactDetail(id: string): Promise<Contact> {
  const result = await get<Contact>(API_PATHS.CONTACTS.BY_ID(id))
  return result.data!
}

/**
 * 创建联系人
 */
export interface CreateContactRequest {
  customer_id: string
  first_name: string
  last_name: string
  email?: string | null
  phone?: string | null
  mobile?: string | null
  wechat_id?: string | null
  position?: string | null
  department?: string | null
  contact_role?: string | null
  is_primary?: boolean
  is_decision_maker?: boolean
  address?: string | null
  city?: string | null
  province?: string | null
  country?: string | null
  postal_code?: string | null
  preferred_contact_method?: string | null
  is_active?: boolean
  notes?: string | null
}

export async function createContact(data: CreateContactRequest): Promise<Contact> {
  const result = await post<Contact>(API_PATHS.CONTACTS.BASE, data)
  return result.data!
}

/**
 * 更新联系人
 */
export interface UpdateContactRequest {
  first_name?: string
  last_name?: string
  email?: string | null
  phone?: string | null
  mobile?: string | null
  wechat_id?: string | null
  position?: string | null
  department?: string | null
  contact_role?: string | null
  is_primary?: boolean
  is_decision_maker?: boolean
  address?: string | null
  city?: string | null
  province?: string | null
  country?: string | null
  postal_code?: string | null
  preferred_contact_method?: string | null
  is_active?: boolean
  notes?: string | null
}

export async function updateContact(
  id: string,
  data: UpdateContactRequest
): Promise<Contact> {
  const result = await put<Contact>(API_PATHS.CONTACTS.BY_ID(id), data)
  return result.data!
}

/**
 * 删除联系人
 */
export async function deleteContact(id: string): Promise<void> {
  await del(API_PATHS.CONTACTS.BY_ID(id))
}

