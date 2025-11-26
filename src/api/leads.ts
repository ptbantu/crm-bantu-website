/**
 * 线索管理相关 API
 */
import { get, post, put, del } from './client'
import { API_PATHS } from './config'
import {
  LeadListParams,
  Lead,
  PaginatedResponse,
  CreateLeadRequest,
  UpdateLeadRequest,
  LeadAssignRequest,
  LeadMoveToPoolRequest,
  LeadDuplicateCheckRequest,
  LeadDuplicateCheckResponse,
  LeadFollowUp,
  LeadFollowUpCreateRequest,
  LeadNote,
  LeadNoteCreateRequest,
} from './types'

/**
 * 获取线索列表
 */
export async function getLeadList(
  params: LeadListParams = {}
): Promise<PaginatedResponse<Lead>> {
  const queryParams = new URLSearchParams()
  
  if (params.page !== undefined) {
    queryParams.append('page', params.page.toString())
  }
  if (params.size !== undefined) {
    queryParams.append('size', params.size.toString())
  }
  if (params.owner_user_id) {
    queryParams.append('owner_user_id', params.owner_user_id)
  }
  if (params.status) {
    queryParams.append('status', params.status)
  }
  if (params.is_in_public_pool !== undefined) {
    queryParams.append('is_in_public_pool', params.is_in_public_pool.toString())
  }
  if (params.customer_id) {
    queryParams.append('customer_id', params.customer_id)
  }
  if (params.company_name) {
    queryParams.append('company_name', params.company_name)
  }
  if (params.phone) {
    queryParams.append('phone', params.phone)
  }
  if (params.email) {
    queryParams.append('email', params.email)
  }

  const queryString = queryParams.toString()
  const url = queryString
    ? `${API_PATHS.LEADS.BASE}?${queryString}`
    : API_PATHS.LEADS.BASE

  const result = await get<{ items: Lead[]; total: number; page: number; size: number }>(url)
  // 转换响应格式为统一的 PaginatedResponse
  const data = result.data || { items: [], total: 0, page: 1, size: 20 }
  return {
    records: data.items || [],
    total: data.total || 0,
    current: data.page || 1,
    pages: data.total && data.size ? Math.ceil(data.total / data.size) : 0,
    size: data.size || 20,
  }
}

/**
 * 获取线索详情
 */
export async function getLeadDetail(id: string): Promise<Lead> {
  const result = await get<Lead>(API_PATHS.LEADS.BY_ID(id))
  return result.data!
}

/**
 * 创建线索
 */
export async function createLead(data: CreateLeadRequest): Promise<Lead> {
  const result = await post<Lead>(API_PATHS.LEADS.BASE, data)
  return result.data!
}

/**
 * 更新线索
 */
export async function updateLead(id: string, data: UpdateLeadRequest): Promise<Lead> {
  const result = await put<Lead>(API_PATHS.LEADS.BY_ID(id), data)
  return result.data!
}

/**
 * 删除线索
 */
export async function deleteLead(id: string): Promise<void> {
  await del(API_PATHS.LEADS.BY_ID(id))
}

/**
 * 分配线索
 */
export async function assignLead(id: string, data: LeadAssignRequest): Promise<Lead> {
  const result = await post<Lead>(API_PATHS.LEADS.ASSIGN(id), data)
  return result.data!
}

/**
 * 移入公海池
 */
export async function moveLeadToPool(id: string, data: LeadMoveToPoolRequest): Promise<Lead> {
  const result = await post<Lead>(API_PATHS.LEADS.MOVE_TO_POOL(id), data)
  return result.data!
}

/**
 * 线索查重
 */
export async function checkLeadDuplicate(data: LeadDuplicateCheckRequest): Promise<LeadDuplicateCheckResponse> {
  const result = await post<LeadDuplicateCheckResponse>(API_PATHS.LEADS.CHECK_DUPLICATE, data)
  return result.data!
}

/**
 * 获取线索跟进记录列表
 */
export async function getLeadFollowUps(leadId: string): Promise<LeadFollowUp[]> {
  const result = await get<LeadFollowUp[]>(API_PATHS.LEADS.FOLLOW_UPS(leadId))
  return result.data || []
}

/**
 * 创建跟进记录
 */
export async function createLeadFollowUp(leadId: string, data: LeadFollowUpCreateRequest): Promise<LeadFollowUp> {
  const result = await post<LeadFollowUp>(API_PATHS.LEADS.FOLLOW_UPS(leadId), data)
  return result.data!
}

/**
 * 获取线索备注列表
 */
export async function getLeadNotes(leadId: string): Promise<LeadNote[]> {
  const result = await get<LeadNote[]>(API_PATHS.LEADS.NOTES(leadId))
  return result.data || []
}

/**
 * 创建备注
 */
export async function createLeadNote(leadId: string, data: LeadNoteCreateRequest): Promise<LeadNote> {
  const result = await post<LeadNote>(API_PATHS.LEADS.NOTES(leadId), data)
  return result.data!
}

/**
 * 转换线索为客户
 */
export async function convertLeadToCustomer(leadId: string, data: { customer_name?: string; contact_name?: string }): Promise<{ customer_id: string; customer: any }> {
  const result = await post<{ customer_id: string; customer: any }>(API_PATHS.LEADS.CONVERT_TO_CUSTOMER(leadId), data)
  return result.data!
}

/**
 * 转换线索为商机
 */
export async function convertLeadToOpportunity(leadId: string, data: { opportunity_name?: string; amount?: number }): Promise<{ opportunity_id: string; opportunity: any }> {
  const result = await post<{ opportunity_id: string; opportunity: any }>(API_PATHS.LEADS.CONVERT_TO_OPPORTUNITY(leadId), data)
  return result.data!
}

// 导出类型
export type {
  CreateLeadRequest,
  UpdateLeadRequest,
  LeadAssignRequest,
  LeadMoveToPoolRequest,
  LeadDuplicateCheckRequest,
  LeadDuplicateCheckResponse,
  LeadFollowUpCreateRequest,
  LeadNoteCreateRequest,
}

