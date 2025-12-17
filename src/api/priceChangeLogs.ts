/**
 * 价格变更日志相关 API
 */
import { get } from './client'
import { PaginatedResponse } from './types'

// 价格变更日志
export interface PriceChangeLog {
  id: string
  product_id: string
  price_id?: string | null
  change_type: string  // create, update, delete, activate, deactivate
  price_type: string
  currency: string
  old_price?: number | null
  new_price?: number | null
  price_change_amount?: number | null
  price_change_percentage?: number | null
  old_effective_from?: string | null
  new_effective_from?: string | null
  old_effective_to?: string | null
  new_effective_to?: string | null
  change_reason?: string | null
  changed_by?: string | null
  changed_at: string
  affected_orders_count?: number | null
  impact_analysis?: any
  created_at: string
}

// 价格变更日志查询参数
export interface PriceChangeLogListParams {
  product_id?: string
  price_id?: string
  change_type?: string
  price_type?: string
  currency?: string
  start_date?: string
  end_date?: string
  page?: number
  size?: number
}

/**
 * 获取价格变更日志
 */
export async function getPriceChangeLogs(
  params: PriceChangeLogListParams = {}
): Promise<PaginatedResponse<PriceChangeLog>> {
  const queryParams = new URLSearchParams()
  if (params.product_id) queryParams.append('product_id', params.product_id)
  if (params.price_id) queryParams.append('price_id', params.price_id)
  if (params.change_type) queryParams.append('change_type', params.change_type)
  if (params.price_type) queryParams.append('price_type', params.price_type)
  if (params.currency) queryParams.append('currency', params.currency)
  if (params.start_date) queryParams.append('start_date', params.start_date)
  if (params.end_date) queryParams.append('end_date', params.end_date)
  if (params.page) queryParams.append('page', params.page.toString())
  if (params.size) queryParams.append('size', params.size.toString())
  
  const queryString = queryParams.toString()
  const url = queryString
    ? `/api/foundation/price-change-logs?${queryString}`
    : '/api/foundation/price-change-logs'
  
  const result = await get<{ items: PriceChangeLog[]; total: number; page: number; size: number }>(url)
  return {
    records: result.data!.items,
    total: result.data!.total,
    size: result.data!.size,
    current: result.data!.page,
    pages: Math.ceil(result.data!.total / result.data!.size)
  }
}
