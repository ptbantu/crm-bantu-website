/**
 * 选项配置 API
 * 用于获取各种下拉选项，如客户分级、跟进状态等
 */
import { get } from './client'
import { API_PATHS } from './config'

/**
 * 客户分级选项
 */
export interface CustomerLevelOption {
  code: string
  name_zh: string
  name_id: string
  name: string  // 根据 lang 参数返回对应语言
  description_zh?: string | null
  description_id?: string | null
  sort_order: number
}

/**
 * 跟进状态选项
 */
export interface FollowUpStatusOption {
  code: string
  name_zh: string
  name_id: string
  name: string  // 根据 lang 参数返回对应语言
  description_zh?: string | null
  description_id?: string | null
  sort_order: number
}

/**
 * 行业选项
 */
export interface IndustryOption {
  id: string
  code: string
  name_zh: string
  name_id: string
  name: string  // 根据 lang 参数返回对应语言
  description_zh?: string | null
  description_id?: string | null
  sort_order: number
  is_active: boolean
}

/**
 * 获取客户分级选项列表
 * @param lang 语言代码：'zh'（中文）或 'id'（印尼语），默认为 'zh'
 */
export async function getCustomerLevelOptions(lang: 'zh' | 'id' = 'zh'): Promise<CustomerLevelOption[]> {
  const result = await get<CustomerLevelOption[]>(`${API_PATHS.OPTIONS.CUSTOMER_LEVELS}?lang=${lang}`)
  return result.data || []
}

/**
 * 获取跟进状态选项列表
 * @param lang 语言代码：'zh'（中文）或 'id'（印尼语），默认为 'zh'
 */
export async function getFollowUpStatusOptions(lang: 'zh' | 'id' = 'zh'): Promise<FollowUpStatusOption[]> {
  const result = await get<FollowUpStatusOption[]>(`${API_PATHS.OPTIONS.FOLLOW_UP_STATUSES}?lang=${lang}`)
  return result.data || []
}

/**
 * 获取行业选项列表
 * @param lang 语言代码：'zh'（中文）或 'id'（印尼语），默认为 'zh'
 */
export async function getIndustryOptions(lang: 'zh' | 'id' = 'zh'): Promise<IndustryOption[]> {
  // 暂时使用 service-management 的 industries 端点，后续可能需要移到 options API
  const result = await get<IndustryOption[]>(`/api/service-management/industries?lang=${lang}&is_active=true`)
  return result.data || []
}

