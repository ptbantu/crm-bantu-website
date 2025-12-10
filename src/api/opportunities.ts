/**
 * 商机管理相关 API
 */
import { get, post, put, del } from './client'
import { API_PATHS } from './config'
import {
  OpportunityListParams,
  Opportunity,
  PaginatedResponse,
  CreateOpportunityRequest,
  UpdateOpportunityRequest,
  OpportunityAssignRequest,
  OpportunityConvertRequest,
  OpportunityFollowUp,
  OpportunityFollowUpCreateRequest,
  OpportunityNote,
  OpportunityNoteCreateRequest,
  OpportunityStageUpdateRequest,
} from './types'

/**
 * 获取商机列表
 */
export async function getOpportunityList(
  params: OpportunityListParams = {}
): Promise<PaginatedResponse<Opportunity>> {
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
  if (params.stage) {
    queryParams.append('stage', params.stage)
  }
  if (params.status) {
    queryParams.append('status', params.status)
  }
  if (params.customer_id) {
    queryParams.append('customer_id', params.customer_id)
  }
  if (params.name) {
    queryParams.append('name', params.name)
  }
  if (params.min_amount !== undefined) {
    queryParams.append('min_amount', params.min_amount.toString())
  }
  if (params.max_amount !== undefined) {
    queryParams.append('max_amount', params.max_amount.toString())
  }

  const queryString = queryParams.toString()
  const url = queryString
    ? `${API_PATHS.OPPORTUNITIES.BASE}?${queryString}`
    : API_PATHS.OPPORTUNITIES.BASE

  const result = await get<{ items: Opportunity[]; total: number; page: number; size: number }>(url)
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
 * 获取商机详情
 */
export async function getOpportunityDetail(id: string): Promise<Opportunity> {
  const result = await get<Opportunity>(API_PATHS.OPPORTUNITIES.BY_ID(id))
  return result.data!
}

/**
 * 创建商机
 */
export async function createOpportunity(data: CreateOpportunityRequest): Promise<Opportunity> {
  const result = await post<Opportunity>(API_PATHS.OPPORTUNITIES.BASE, data)
  return result.data!
}

/**
 * 更新商机
 */
export async function updateOpportunity(id: string, data: UpdateOpportunityRequest): Promise<Opportunity> {
  const result = await put<Opportunity>(API_PATHS.OPPORTUNITIES.BY_ID(id), data)
  return result.data!
}

/**
 * 删除商机
 */
export async function deleteOpportunity(id: string): Promise<void> {
  await del(API_PATHS.OPPORTUNITIES.BY_ID(id))
}

/**
 * 分配商机
 */
export async function assignOpportunity(id: string, data: OpportunityAssignRequest): Promise<Opportunity> {
  const result = await post<Opportunity>(API_PATHS.OPPORTUNITIES.ASSIGN(id), data)
  return result.data!
}

/**
 * 更新商机阶段（拖拽）
 */
export async function updateOpportunityStage(id: string, data: OpportunityStageUpdateRequest): Promise<Opportunity> {
  const result = await post<Opportunity>(API_PATHS.OPPORTUNITIES.UPDATE_STAGE(id), data)
  return result.data!
}

/**
 * 转换商机为订单
 */
export async function convertOpportunity(id: string, data: OpportunityConvertRequest): Promise<Opportunity> {
  const result = await post<Opportunity>(API_PATHS.OPPORTUNITIES.CONVERT(id), data)
  return result.data!
}

/**
 * 获取商机跟进记录列表
 */
export async function getOpportunityFollowUps(opportunityId: string): Promise<OpportunityFollowUp[]> {
  const result = await get<OpportunityFollowUp[]>(API_PATHS.OPPORTUNITIES.FOLLOW_UPS(opportunityId))
  return result.data || []
}

/**
 * 创建跟进记录
 */
export async function createOpportunityFollowUp(opportunityId: string, data: OpportunityFollowUpCreateRequest): Promise<OpportunityFollowUp> {
  const result = await post<OpportunityFollowUp>(API_PATHS.OPPORTUNITIES.FOLLOW_UPS(opportunityId), data)
  return result.data!
}

/**
 * 获取商机备注列表
 */
export async function getOpportunityNotes(opportunityId: string): Promise<OpportunityNote[]> {
  const result = await get<OpportunityNote[]>(API_PATHS.OPPORTUNITIES.NOTES(opportunityId))
  return result.data || []
}

/**
 * 创建备注
 */
export async function createOpportunityNote(opportunityId: string, data: OpportunityNoteCreateRequest): Promise<OpportunityNote> {
  const result = await post<OpportunityNote>(API_PATHS.OPPORTUNITIES.NOTES(opportunityId), data)
  return result.data!
}

/**
 * 线索转化商机
 */
export interface LeadConvertToOpportunityRequest {
  name: string
  stage?: string
  description?: string
  products?: Array<{
    product_id: string
    quantity?: number
    unit_price?: number
    execution_order?: number
  }>
}

export async function convertLeadToOpportunity(leadId: string, data: LeadConvertToOpportunityRequest): Promise<Opportunity> {
  const result = await post<Opportunity>(`/api/order-workflow/opportunities/convert-from-lead/${leadId}`, data)
  return result.data!
}

// 导出类型
export type {
  CreateOpportunityRequest,
  UpdateOpportunityRequest,
  OpportunityAssignRequest,
  OpportunityConvertRequest,
  OpportunityFollowUpCreateRequest,
  OpportunityNoteCreateRequest,
  OpportunityStageUpdateRequest,
}

