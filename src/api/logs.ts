/**
 * 系统日志相关 API
 */
import { get, post } from './client'

/**
 * 日志条目
 */
export interface LogEntry {
  id: string
  timestamp: string
  level: string
  message: string
  service: string
  name?: string
  function?: string
  line?: number
  file?: string
  module?: string
  thread?: number
  process?: number
  exception?: string | null
  extra?: any
}

/**
 * 日志查询参数
 */
export interface LogQueryParams {
  services?: string[]
  levels?: string[]
  start_time?: string
  end_time?: string
  keyword?: string
  file?: string
  function?: string
  page: number
  page_size: number
}

/**
 * 日志查询响应
 */
export interface LogQueryResponse {
  logs: LogEntry[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

/**
 * 日志统计响应
 */
export interface LogStatistics {
  total_logs: number
  by_level: Record<string, number>
  by_service: Record<string, number>
  error_count: number
  warning_count: number
  time_range: {
    start: string
    end: string
  }
}

/**
 * 查询日志（POST）
 */
export async function queryLogs(params: LogQueryParams): Promise<LogQueryResponse> {
  const result = await post<LogQueryResponse>(
    '/api/analytics-monitoring/logs/query',
    params
  )
  return result.data!
}

/**
 * 查询日志（GET）
 */
export async function queryLogsGet(params: Partial<LogQueryParams>): Promise<LogQueryResponse> {
  const queryParams = new URLSearchParams()
  
  if (params.services && params.services.length > 0) {
    queryParams.append('services', params.services.join(','))
  }
  if (params.levels && params.levels.length > 0) {
    queryParams.append('levels', params.levels.join(','))
  }
  if (params.start_time) {
    queryParams.append('start_time', params.start_time)
  }
  if (params.end_time) {
    queryParams.append('end_time', params.end_time)
  }
  if (params.keyword) {
    queryParams.append('keyword', params.keyword)
  }
  if (params.file) {
    queryParams.append('file', params.file)
  }
  if (params.function) {
    queryParams.append('function', params.function)
  }
  if (params.page) {
    queryParams.append('page', params.page.toString())
  }
  if (params.page_size) {
    queryParams.append('page_size', params.page_size.toString())
  }

  const queryString = queryParams.toString()
  const url = queryString
    ? `/api/analytics-monitoring/logs/query?${queryString}`
    : '/api/analytics-monitoring/logs/query'

  const result = await get<LogQueryResponse>(url)
  return result.data!
}

/**
 * 获取日志统计
 */
export async function getLogStatistics(params: {
  services?: string[]
  start_time?: string
  end_time?: string
}): Promise<LogStatistics> {
  const queryParams = new URLSearchParams()
  
  if (params.services && params.services.length > 0) {
    queryParams.append('services', params.services.join(','))
  }
  if (params.start_time) {
    queryParams.append('start_time', params.start_time)
  }
  if (params.end_time) {
    queryParams.append('end_time', params.end_time)
  }

  const queryString = queryParams.toString()
  const url = queryString
    ? `/api/analytics-monitoring/logs/statistics?${queryString}`
    : '/api/analytics-monitoring/logs/statistics'

  const result = await get<LogStatistics>(url)
  return result.data!
}

