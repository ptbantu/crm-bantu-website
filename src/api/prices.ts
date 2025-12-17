/**
 * 价格管理相关 API
 */
import { get, post, put, del } from './client'
import { API_PATHS } from './config'
import { PaginatedResponse } from './types'

// 价格策略
export interface PriceStrategy {
  id: string
  product_id: string
  product_name?: string
  organization_id?: string | null
  organization_name?: string | null
  price_type: string  // cost, channel, direct, list
  currency: string  // IDR, CNY, USD, EUR
  amount: number
  exchange_rate?: number | null
  effective_from: string
  effective_to?: string | null
  source?: string | null
  is_approved: boolean
  approved_by?: string | null
  approved_at?: string | null
  change_reason?: string | null
  created_at: string
  updated_at: string
}

// 价格历史
export interface PriceHistory {
  id: string
  product_id: string
  organization_id?: string | null
  price_type: string
  currency: string
  old_price?: number | null
  new_price?: number | null
  change_reason?: string | null
  effective_from: string
  effective_to?: string | null
  changed_by?: string | null
  created_at: string
}

// 价格列表查询参数
export interface PriceListParams {
  page?: number
  size?: number
  product_id?: string
  organization_id?: string
  price_type?: string
  currency?: string
  is_approved?: boolean
}

// 创建价格策略请求
export interface CreatePriceStrategyRequest {
  product_id: string
  organization_id?: string | null
  price_type: string
  currency: string
  amount: number
  exchange_rate?: number | null
  effective_from: string
  effective_to?: string | null
  source?: string | null
  change_reason?: string | null
}

// 更新价格策略请求
export interface UpdatePriceStrategyRequest {
  amount?: number
  exchange_rate?: number | null
  effective_from?: string
  effective_to?: string | null
  change_reason?: string | null
  is_approved?: boolean
}

/**
 * 获取价格列表
 */
export async function getPriceList(
  params: PriceListParams = {}
): Promise<PaginatedResponse<PriceStrategy>> {
  const queryParams = new URLSearchParams()
  
  if (params.page !== undefined) {
    queryParams.append('page', params.page.toString())
  }
  if (params.size !== undefined) {
    queryParams.append('size', params.size.toString())
  }
  if (params.product_id) {
    queryParams.append('product_id', params.product_id)
  }
  if (params.organization_id) {
    queryParams.append('organization_id', params.organization_id)
  }
  if (params.price_type) {
    queryParams.append('price_type', params.price_type)
  }
  if (params.currency) {
    queryParams.append('currency', params.currency)
  }
  if (params.is_approved !== undefined) {
    queryParams.append('is_approved', params.is_approved.toString())
  }

  const queryString = queryParams.toString()
  const url = queryString
    ? `/api/foundation/product-prices?${queryString}`
    : '/api/foundation/product-prices'

  const result = await get<{ items: PriceStrategy[]; total: number; page: number; size: number }>(url)
  return {
    records: result.data!.items,
    total: result.data!.total,
    size: result.data!.size,
    current: result.data!.page,
    pages: Math.ceil(result.data!.total / result.data!.size)
  }
}

/**
 * 创建价格策略
 */
export async function createPriceStrategy(
  data: CreatePriceStrategyRequest
): Promise<PriceStrategy> {
  const url = '/api/foundation/product-prices'
  const result = await post<PriceStrategy>(url, data)
  return result.data!
}

/**
 * 更新价格策略
 */
export async function updatePriceStrategy(
  id: string,
  data: UpdatePriceStrategyRequest
): Promise<PriceStrategy> {
  const url = `/api/foundation/product-prices/${id}`
  const result = await put<PriceStrategy>(url, data)
  return result.data!
}

/**
 * 删除价格策略
 */
export async function deletePriceStrategy(id: string): Promise<void> {
  const url = `/api/foundation/product-prices/${id}`
  await del(url)
}

/**
 * 获取价格历史
 */
export async function getPriceHistory(
  productId: string,
  params?: { price_type?: string; currency?: string; page?: number; size?: number }
): Promise<PaginatedResponse<PriceHistory>> {
  const queryParams = new URLSearchParams()
  if (params?.price_type) queryParams.append('price_type', params.price_type)
  if (params?.currency) queryParams.append('currency', params.currency)
  if (params?.page) queryParams.append('page', params.page.toString())
  if (params?.size) queryParams.append('size', params.size.toString())
  
  const queryString = queryParams.toString()
  const url = queryString
    ? `/api/foundation/product-prices/products/${productId}/history?${queryString}`
    : `/api/foundation/product-prices/products/${productId}/history`
  
  const result = await get<{ items: PriceHistory[]; total: number; page: number; size: number }>(url)
  return {
    records: result.data!.items,
    total: result.data!.total,
    size: result.data!.size,
    current: result.data!.page,
    pages: Math.ceil(result.data!.total / result.data!.size)
  }
}

/**
 * 获取即将生效的价格变更
 */
export async function getUpcomingPriceChanges(
  productId?: string,
  hoursAhead: number = 24
): Promise<PriceStrategy[]> {
  const queryParams = new URLSearchParams()
  if (productId) queryParams.append('product_id', productId)
  queryParams.append('hours_ahead', hoursAhead.toString())
  
  const queryString = queryParams.toString()
  const url = queryString
    ? `/api/foundation/product-prices/upcoming/changes?${queryString}`
    : '/api/foundation/product-prices/upcoming/changes'
  
  const result = await get<PriceStrategy[]>(url)
  return result.data!
}
