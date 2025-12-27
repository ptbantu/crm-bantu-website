/**
 * 天眼查 API 客户端
 */
import { post } from './client'
import { API_PATHS } from './config'

export interface ShareholderInfo {
  name?: string
  type?: string
  capital?: string
  capital_actual?: string
  ratio?: string
}

export interface EnterpriseInfo {
  name?: string
  credit_code?: string
  registration_number?: string
  legal_representative?: string
  registered_capital?: string
  establishment_date?: string
  business_status?: string
  company_type?: string
  industry?: string
  address?: string
  business_scope?: string
  shareholders?: ShareholderInfo[]
  extra_data?: Record<string, any>
}

export interface EnterpriseQueryResponse {
  success: boolean
  message?: string
  data?: EnterpriseInfo
  raw_data?: Record<string, any>
}

export interface EnterpriseQueryRequest {
  keyword: string
}

export interface EnterpriseListItem {
  id?: string
  name?: string
  credit_code?: string
  registration_number?: string
  legal_representative?: string
  registered_capital?: string
  establishment_date?: string
  business_status?: string
  address?: string
}

export interface EnterpriseSearchRequest {
  keyword: string
  page_num?: number
  page_size?: number
}

export interface EnterpriseSearchResponse {
  success: boolean
  message?: string
  data?: EnterpriseListItem[]
  total?: number
  page_num?: number
  page_size?: number
  raw_data?: Record<string, any>
}

export interface EnterpriseDetailRequest {
  enterprise_id: string
}

export interface EnterpriseDetailResponse {
  success: boolean
  message?: string
  data?: EnterpriseInfo
  raw_data?: Record<string, any>
}

/**
 * 查询企业信息（已废弃，保留用于兼容）
 */
export async function queryEnterprise(keyword: string): Promise<EnterpriseQueryResponse> {
  const response = await post<EnterpriseQueryResponse>(
    `${API_PATHS.FOUNDATION}/tianyancha/enterprise/query`,
    { keyword }
  )
  return response.data || { success: false, message: '查询失败' }
}

/**
 * 搜索企业列表（816接口）
 */
export async function searchEnterprises(
  keyword: string,
  pageNum: number = 1,
  pageSize: number = 10
): Promise<EnterpriseSearchResponse> {
  const response = await post<EnterpriseSearchResponse>(
    `${API_PATHS.FOUNDATION}/tianyancha/enterprise/search`,
    { keyword, page_num: pageNum, page_size: pageSize }
  )
  return response.data || { success: false, message: '搜索失败', data: [], total: 0 }
}

/**
 * 获取企业详细信息（818接口）
 */
export async function getEnterpriseDetail(enterpriseId: string): Promise<EnterpriseDetailResponse> {
  const response = await post<EnterpriseDetailResponse>(
    `${API_PATHS.FOUNDATION}/tianyancha/enterprise/detail`,
    { enterprise_id: enterpriseId }
  )
  return response.data || { success: false, message: '查询失败' }
}
