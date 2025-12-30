/**
 * 经营主体管理相关 API
 */
import { get, post, put, del } from './client'
import { API_PATHS } from './config'
import { PaginatedResponse } from './types'

/**
 * 经营主体
 */
export interface ContractEntity {
  id: string
  entity_code: string
  entity_name: string
  short_name: string
  legal_representative?: string | null
  tax_rate: number
  tax_id?: string | null
  bank_name?: string | null
  bank_account_no?: string | null
  bank_account_name?: string | null
  swift_code?: string | null
  currency: string
  address?: string | null
  contact_phone?: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  created_by?: string | null
  updated_by?: string | null
}

/**
 * 经营主体列表查询参数
 */
export interface ContractEntityListParams {
  page?: number
  size?: number
  entity_code?: string
  entity_name?: string
  short_name?: string
  currency?: string
  is_active?: boolean
}

/**
 * 创建经营主体请求
 */
export interface CreateContractEntityRequest {
  entity_code: string
  entity_name: string
  short_name: string
  legal_representative?: string
  tax_rate: number
  tax_id?: string
  bank_name?: string
  bank_account_no?: string
  bank_account_name?: string
  swift_code?: string
  currency: string
  address?: string
  contact_phone?: string
  is_active?: boolean
}

/**
 * 更新经营主体请求
 */
export interface UpdateContractEntityRequest {
  entity_code?: string
  entity_name?: string
  short_name?: string
  legal_representative?: string
  tax_rate?: number
  tax_id?: string
  bank_name?: string
  bank_account_no?: string
  bank_account_name?: string
  swift_code?: string
  currency?: string
  address?: string
  contact_phone?: string
  is_active?: boolean
}

/**
 * 获取经营主体列表
 */
export async function getContractEntityList(
  params: ContractEntityListParams = {}
): Promise<PaginatedResponse<ContractEntity>> {
  const queryParams = new URLSearchParams()
  
  if (params.page !== undefined) {
    queryParams.append('page', params.page.toString())
  }
  if (params.size !== undefined) {
    queryParams.append('size', params.size.toString())
  }
  if (params.entity_code) {
    queryParams.append('entity_code', params.entity_code)
  }
  if (params.entity_name) {
    queryParams.append('entity_name', params.entity_name)
  }
  if (params.short_name) {
    queryParams.append('short_name', params.short_name)
  }
  if (params.currency) {
    queryParams.append('currency', params.currency)
  }
  if (params.is_active !== undefined) {
    queryParams.append('is_active', params.is_active.toString())
  }

  const queryString = queryParams.toString()
  const url = queryString
    ? `${API_PATHS.CONTRACT_ENTITIES.BASE}?${queryString}`
    : API_PATHS.CONTRACT_ENTITIES.BASE

  const result = await get<PaginatedResponse<ContractEntity>>(url)
  return result.data!
}

/**
 * 获取经营主体详情
 */
export async function getContractEntityDetail(id: string): Promise<ContractEntity> {
  const result = await get<ContractEntity>(API_PATHS.CONTRACT_ENTITIES.BY_ID(id))
  return result.data!
}

/**
 * 创建经营主体
 */
export async function createContractEntity(
  data: CreateContractEntityRequest
): Promise<ContractEntity> {
  const result = await post<ContractEntity>(API_PATHS.CONTRACT_ENTITIES.BASE, data)
  return result.data!
}

/**
 * 更新经营主体
 */
export async function updateContractEntity(
  id: string,
  data: UpdateContractEntityRequest
): Promise<ContractEntity> {
  const result = await put<ContractEntity>(API_PATHS.CONTRACT_ENTITIES.BY_ID(id), data)
  return result.data!
}

/**
 * 删除经营主体（软删除）
 */
export async function deleteContractEntity(id: string): Promise<void> {
  await del(API_PATHS.CONTRACT_ENTITIES.BY_ID(id))
}
