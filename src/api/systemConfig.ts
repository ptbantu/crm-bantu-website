/**
 * 系统配置管理相关 API
 */
import { get, post, put } from './client'
import { API_PATHS } from './config'

export type ConfigType = 'oss' | 'ai' | 'sms' | 'email'

export interface OSSConfig {
  endpoint: string
  access_key_id: string
  access_key_secret: string
  bucket_name: string
  region?: string
  is_enabled: boolean
}

export interface AIConfig {
  provider: string
  api_key: string
  api_base?: string
  model?: string
  temperature?: number
  max_tokens?: number
  is_enabled: boolean
}

export interface SMSConfig {
  provider: string
  access_key_id: string
  access_key_secret: string
  sign_name?: string
  template_code?: string
  region?: string
  is_enabled: boolean
}

export interface EmailConfig {
  smtp_host: string
  smtp_port: number
  smtp_user: string
  smtp_password: string
  use_tls: boolean
  from_email: string
  from_name?: string
  is_enabled: boolean
}

export interface SystemStatus {
  version: string
  uptime: string
  database_status: string
  redis_status: string
  mongodb_status: string
  cpu_usage?: number
  memory_usage?: number
  disk_usage?: number
  active_users?: number
  total_requests?: number
}

export interface TestConnectionResponse {
  success: boolean
  message: string
  details?: Record<string, any>
}

export interface ConfigHistoryItem {
  id: string
  config_id: string
  old_value?: Record<string, any>
  new_value: Record<string, any>
  changed_by: string
  changed_at: string
  change_reason?: string
}

export interface ConfigHistoryList {
  records: ConfigHistoryItem[]
  total: number
  page: number
  size: number
}

/**
 * 获取系统配置
 */
export async function getSystemConfig(configType: ConfigType): Promise<any> {
  const response = await get(`${API_PATHS.FOUNDATION}/system-config/${configType}`)
  return response.data || {}
}

/**
 * 更新系统配置
 */
export async function updateSystemConfig(
  configType: ConfigType,
  data: OSSConfig | AIConfig | SMSConfig | EmailConfig,
  changeReason?: string
): Promise<any> {
  const payload = { ...data, change_reason: changeReason }
  const response = await put(`${API_PATHS.FOUNDATION}/system-config/${configType}`, payload)
  return response.data || {}
}

/**
 * 测试连接
 */
export async function testConnection(configType: ConfigType): Promise<TestConnectionResponse> {
  const response = await post(`${API_PATHS.FOUNDATION}/system-config/${configType}/test`, {})
  return response.data || { success: false, message: '未知错误' }
}

/**
 * 获取系统状态
 */
export async function getSystemStatus(): Promise<SystemStatus> {
  const response = await get(`${API_PATHS.FOUNDATION}/system-config/status/system`)
  return response.data || {} as SystemStatus
}

/**
 * 获取配置历史
 */
export async function getConfigHistory(
  configId?: string,
  page: number = 1,
  size: number = 20
): Promise<ConfigHistoryList> {
  const params = new URLSearchParams()
  if (configId) params.append('config_id', configId)
  params.append('page', page.toString())
  params.append('size', size.toString())
  
  const response = await get(`${API_PATHS.FOUNDATION}/system-config/history?${params.toString()}`)
  return response.data || { records: [], total: 0, page, size }
}
