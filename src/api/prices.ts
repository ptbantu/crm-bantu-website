/**
 * 价格管理相关 API
 */
import { get, post, put, del } from './client'
import { API_PATHS } from './config'
import { PaginatedResponse } from './types'

// 价格策略（列格式：一条记录包含所有价格类型和货币）
export interface PriceStrategy {
  id: string
  product_id: string
  product_name?: string | null
  product_code?: string | null
  category_id?: string | null
  category_name?: string | null
  organization_id?: string | null
  organization_name?: string | null
  // 成本价
  price_cost_idr?: number | null
  price_cost_cny?: number | null
  // 渠道价
  price_channel_idr?: number | null
  price_channel_cny?: number | null
  // 直客价
  price_direct_idr?: number | null
  price_direct_cny?: number | null
  // 列表价
  price_list_idr?: number | null
  price_list_cny?: number | null
  // 汇率
  exchange_rate?: number | null
  // 生效时间
  effective_from: string
  effective_to?: string | null
  // 其他字段
  source?: string | null
  change_reason?: string | null
  changed_by?: string | null
  created_at: string
  updated_at: string
}

// 价格历史（列格式：一条记录包含所有价格类型和货币）
export interface PriceHistory {
  id: string
  product_id: string
  organization_id?: string | null
  // 价格字段（列格式）
  price_channel_idr?: number | null
  price_channel_cny?: number | null
  price_direct_idr?: number | null
  price_direct_cny?: number | null
  price_list_idr?: number | null
  price_list_cny?: number | null
  exchange_rate?: number | null
  // 生效时间
  effective_from: string
  effective_to?: string | null
  // 其他字段
  change_reason?: string | null
  changed_by?: string | null
  created_at: string
  updated_at: string
}

// 价格列表查询参数（列格式：不再需要 price_type 和 currency）
export interface PriceListParams {
  page?: number
  size?: number
  product_id?: string
  organization_id?: string
}

// 创建价格策略请求（列格式：一条记录包含所有价格类型和货币）
export interface CreatePriceStrategyRequest {
  product_id: string
  organization_id?: string | null
  // 渠道价
  price_channel_idr?: number | null
  price_channel_cny?: number | null
  // 直客价
  price_direct_idr?: number | null
  price_direct_cny?: number | null
  // 列表价
  price_list_idr?: number | null
  price_list_cny?: number | null
  // 汇率
  exchange_rate?: number | null
  // 生效时间
  effective_from?: string | null
  effective_to?: string | null
  // 其他字段
  source?: string | null
  change_reason?: string | null
}

// 更新价格策略请求（列格式：一条记录包含所有价格类型和货币）
export interface UpdatePriceStrategyRequest {
  // 渠道价
  price_channel_idr?: number | null
  price_channel_cny?: number | null
  // 直客价
  price_direct_idr?: number | null
  price_direct_cny?: number | null
  // 列表价
  price_list_idr?: number | null
  price_list_cny?: number | null
  // 汇率
  exchange_rate?: number | null
  // 生效时间
  effective_from?: string | null
  effective_to?: string | null
  // 其他字段
  change_reason?: string | null
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
 * 获取价格历史（列格式：不再需要 price_type 和 currency 参数）
 */
export async function getPriceHistory(
  productId: string,
  params?: { organization_id?: string; page?: number; size?: number }
): Promise<PaginatedResponse<PriceHistory>> {
  const queryParams = new URLSearchParams()
  if (params?.organization_id) queryParams.append('organization_id', params.organization_id)
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
