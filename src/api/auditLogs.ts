/**
 * 审计日志相关 API
 */
import { get, post } from './client'

/**
 * 审计日志条目
 */
export interface AuditLogEntry {
  id: string
  organization_id: string
  user_id: string | null
  user_name: string | null
  action: string
  resource_type: string | null
  resource_id: string | null
  resource_name: string | null
  category: string | null
  ip_address: string | null
  user_agent: string | null
  request_method: string | null
  request_path: string | null
  request_params: Record<string, any> | null
  old_values: Record<string, any> | null
  new_values: Record<string, any> | null
  status: 'success' | 'failed'
  error_message: string | null
  duration_ms: number | null
  created_at: string
}

/**
 * 审计日志查询参数
 */
export interface AuditLogQueryParams {
  page?: number
  size?: number
  organization_id?: string
  user_id?: string
  action?: string
  resource_type?: string
  resource_id?: string
  category?: string
  status?: 'success' | 'failed'
  start_time?: string
  end_time?: string
  order_by?: string
  order_desc?: boolean
}

/**
 * 审计日志查询响应
 */
export interface AuditLogQueryResponse {
  records: AuditLogEntry[]
  total: number
  size: number
  page: number
  pages: number
}

/**
 * 审计日志导出请求
 */
export interface AuditLogExportRequest {
  organization_id?: string
  user_id?: string
  action?: string
  resource_type?: string
  resource_id?: string
  category?: string
  status?: 'success' | 'failed'
  start_time?: string
  end_time?: string
  format?: 'json' | 'csv'
}

/**
 * 审计日志导出响应
 */
export interface AuditLogExportResponse {
  content: string
  mime_type: string
  format: 'json' | 'csv'
}

/**
 * 查询审计日志列表
 */
export async function queryAuditLogs(
  params: AuditLogQueryParams
): Promise<AuditLogQueryResponse> {
  const queryParams = new URLSearchParams()
  
  if (params.page !== undefined) {
    queryParams.append('page', params.page.toString())
  }
  if (params.size !== undefined) {
    queryParams.append('size', params.size.toString())
  }
  if (params.organization_id) {
    queryParams.append('organization_id', params.organization_id)
  }
  if (params.user_id) {
    queryParams.append('user_id', params.user_id)
  }
  if (params.action) {
    queryParams.append('action', params.action)
  }
  if (params.resource_type) {
    queryParams.append('resource_type', params.resource_type)
  }
  if (params.resource_id) {
    queryParams.append('resource_id', params.resource_id)
  }
  if (params.category) {
    queryParams.append('category', params.category)
  }
  if (params.status) {
    queryParams.append('status', params.status)
  }
  if (params.start_time) {
    queryParams.append('start_time', params.start_time)
  }
  if (params.end_time) {
    queryParams.append('end_time', params.end_time)
  }
  if (params.order_by) {
    queryParams.append('order_by', params.order_by)
  }
  if (params.order_desc !== undefined) {
    queryParams.append('order_desc', params.order_desc.toString())
  }

  const queryString = queryParams.toString()
  const url = queryString
    ? `/api/foundation/audit-logs?${queryString}`
    : '/api/foundation/audit-logs'

  const result = await get<AuditLogQueryResponse>(url)
  return result.data!
}

/**
 * 查询审计日志详情
 */
export async function getAuditLogDetail(auditLogId: string): Promise<AuditLogEntry> {
  const result = await get<AuditLogEntry>(`/api/foundation/audit-logs/${auditLogId}`)
  return result.data!
}

/**
 * 查询用户审计日志
 */
export async function getUserAuditLogs(
  userId: string,
  params?: {
    page?: number
    size?: number
    start_time?: string
    end_time?: string
  }
): Promise<AuditLogQueryResponse> {
  const queryParams = new URLSearchParams()
  
  if (params?.page !== undefined) {
    queryParams.append('page', params.page.toString())
  }
  if (params?.size !== undefined) {
    queryParams.append('size', params.size.toString())
  }
  if (params?.start_time) {
    queryParams.append('start_time', params.start_time)
  }
  if (params?.end_time) {
    queryParams.append('end_time', params.end_time)
  }

  const queryString = queryParams.toString()
  const url = queryString
    ? `/api/foundation/audit-logs/users/${userId}?${queryString}`
    : `/api/foundation/audit-logs/users/${userId}`

  const result = await get<AuditLogQueryResponse>(url)
  return result.data!
}

/**
 * 查询资源审计日志
 */
export async function getResourceAuditLogs(
  resourceType: string,
  resourceId: string,
  params?: {
    page?: number
    size?: number
    start_time?: string
    end_time?: string
  }
): Promise<AuditLogQueryResponse> {
  const queryParams = new URLSearchParams()
  
  if (params?.page !== undefined) {
    queryParams.append('page', params.page.toString())
  }
  if (params?.size !== undefined) {
    queryParams.append('size', params.size.toString())
  }
  if (params?.start_time) {
    queryParams.append('start_time', params.start_time)
  }
  if (params?.end_time) {
    queryParams.append('end_time', params.end_time)
  }

  const queryString = queryParams.toString()
  const url = queryString
    ? `/api/foundation/audit-logs/resources/${resourceType}/${resourceId}?${queryString}`
    : `/api/foundation/audit-logs/resources/${resourceType}/${resourceId}`

  const result = await get<AuditLogQueryResponse>(url)
  return result.data!
}

/**
 * 导出审计日志
 */
export async function exportAuditLogs(
  exportRequest: AuditLogExportRequest
): Promise<void> {
  const result = await post<AuditLogExportResponse>(
    '/api/foundation/audit-logs/export',
    exportRequest
  )
  
  const data = result.data!
  
  // 创建 Blob 并下载文件
  const blob = new Blob([data.content], {
    type: data.mime_type,
  })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `audit_logs_${new Date().toISOString()}.${data.format}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}
