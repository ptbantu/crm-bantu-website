/**
 * 企服供应商相关 API
 */
import { get, post, put } from './client'
import { API_PATHS } from './config'
import { PaginatedResponse } from './types'

// 供应商信息
export interface Supplier {
  id: string
  name: string
  code?: string | null
  organization_type: string
  email?: string | null
  phone?: string | null
  is_active: boolean
  is_locked: boolean
  service_count?: number  // 服务数量
  created_at: string
  updated_at: string
}

// 价格历史项
export interface PriceHistoryItem {
  id: string
  old_price_cny?: number | null
  old_price_idr?: number | null
  new_price_cny?: number | null
  new_price_idr?: number | null
  effective_from: string
  effective_to?: string | null
  change_reason?: string | null
  changed_by?: string | null
  created_at: string
}

// 供应商服务信息
export interface SupplierService {
  product_id: string
  product_name: string
  product_code?: string | null
  enterprise_service_code?: string | null
  category_id?: string | null
  category_name?: string | null
  service_type_id?: string | null
  service_type?: string | null
  service_subtype?: string | null
  status: string
  is_active: boolean
  vendor_product_id?: string | null
  is_primary: boolean
  is_available: boolean
  cost_price_cny?: number | null
  cost_price_idr?: number | null
  processing_days?: number | null
  sales_prices: Array<{
    price_type: string
    currency: string
    amount: number
    exchange_rate?: number | null
    effective_from: string
    effective_to?: string | null
    is_organization_specific: boolean
  }>
  price_history: PriceHistoryItem[]
}

// 供应商列表查询参数
export interface SupplierListParams {
  page?: number
  size?: number
  name?: string
  code?: string
  is_active?: boolean
  is_locked?: boolean
}

// 供应商服务列表查询参数
export interface SupplierServiceListParams {
  page?: number
  size?: number
  is_available?: boolean
}

/**
 * 获取供应商列表
 */
export async function getSupplierList(
  params: SupplierListParams = {}
): Promise<PaginatedResponse<Supplier>> {
  const queryParams = new URLSearchParams()
  
  if (params.page !== undefined) {
    queryParams.append('page', params.page.toString())
  }
  if (params.size !== undefined) {
    queryParams.append('size', params.size.toString())
  }
  if (params.name) {
    queryParams.append('name', params.name)
  }
  if (params.code) {
    queryParams.append('code', params.code)
  }
  if (params.is_active !== undefined) {
    queryParams.append('is_active', params.is_active.toString())
  }
  if (params.is_locked !== undefined) {
    queryParams.append('is_locked', params.is_locked.toString())
  }

  const queryString = queryParams.toString()
  const url = queryString
    ? `${API_PATHS.SUPPLIERS?.BASE || '/api/service-management/suppliers'}?${queryString}`
    : (API_PATHS.SUPPLIERS?.BASE || '/api/service-management/suppliers')

  const result = await get<{ items: Supplier[]; total: number; page: number; size: number }>(url)
  // 转换响应格式为统一的 PaginatedResponse
  if (!result.data) {
    return {
      records: [],
      total: 0,
      current: 1,
      pages: 0,
      size: params.size || 10,
    }
  }
  return {
    records: result.data.items || [],
    total: result.data.total || 0,
    current: result.data.page || 1,
    pages: result.data.size > 0 ? Math.ceil((result.data.total || 0) / result.data.size) : 0,
    size: result.data.size || 10,
  }
}

/**
 * 获取供应商详情
 */
export async function getSupplierDetail(id: string): Promise<Supplier> {
  const url = `${API_PATHS.SUPPLIERS?.BASE || '/api/service-management/suppliers'}/${id}`
  const result = await get<Supplier>(url)
  return result.data!
}

/**
 * 获取供应商提供的所有服务和价格
 */
export async function getSupplierServices(
  id: string,
  params: SupplierServiceListParams = {}
): Promise<PaginatedResponse<SupplierService>> {
  const queryParams = new URLSearchParams()
  
  if (params.page !== undefined) {
    queryParams.append('page', params.page.toString())
  }
  if (params.size !== undefined) {
    queryParams.append('size', params.size.toString())
  }
  if (params.is_available !== undefined) {
    queryParams.append('is_available', params.is_available.toString())
  }

  const queryString = queryParams.toString()
  const url = queryString
    ? `${API_PATHS.SUPPLIERS?.BASE || '/api/service-management/suppliers'}/${id}/services?${queryString}`
    : `${API_PATHS.SUPPLIERS?.BASE || '/api/service-management/suppliers'}/${id}/services`

  const result = await get<{ items: SupplierService[]; total: number; page: number; size: number }>(url)
  // 转换响应格式为统一的 PaginatedResponse
  if (!result.data) {
    return {
      records: [],
      total: 0,
      current: 1,
      pages: 0,
      size: params.size || 10,
    }
  }
  return {
    records: result.data.items || [],
    total: result.data.total || 0,
    current: result.data.page || 1,
    pages: result.data.size > 0 ? Math.ceil((result.data.total || 0) / result.data.size) : 0,
    size: result.data.size || 10,
  }
}

/**
 * 获取供应商服务的价格历史
 */
export async function getSupplierServicePrices(
  supplierId: string,
  productId: string
): Promise<PriceHistoryItem[]> {
  const url = `${API_PATHS.SUPPLIERS?.BASE || '/api/service-management/suppliers'}/${supplierId}/services/${productId}/prices`
  const result = await get<PriceHistoryItem[]>(url)
  return result.data!
}

/**
 * 批量添加产品请求
 */
export interface BatchAddProductsRequest {
  product_ids: string[]
  default_cost_price_cny?: number | null
  default_cost_price_idr?: number | null
  is_available?: boolean
  is_primary?: boolean
}

/**
 * 批量添加产品响应
 */
export interface BatchAddProductsResponse {
  success_count: number
  failed_count: number
  success_product_ids: string[]
  failed_product_ids: string[]
}

/**
 * 批量添加供应商产品
 */
export async function batchAddSupplierProducts(
  supplierId: string,
  data: BatchAddProductsRequest
): Promise<BatchAddProductsResponse> {
  const url = `${API_PATHS.SUPPLIERS?.BASE || '/api/service-management/suppliers'}/${supplierId}/products/batch`
  const result = await post<BatchAddProductsResponse>(url, data)
  return result.data!
}

/**
 * 价格更新项
 */
export interface PriceUpdateItem {
  product_id: string
  cost_price_cny?: number | null
  cost_price_idr?: number | null
  processing_days?: number | null
  is_available?: boolean | null
  is_primary?: boolean | null
  priority?: number | null
}

/**
 * 更新价格请求
 */
export interface UpdatePriceRequest {
  cost_price_cny?: number | null
  cost_price_idr?: number | null
  effective_from?: string | null
}

/**
 * 批量更新价格请求
 */
export interface BatchUpdatePricesRequest {
  updates: PriceUpdateItem[]
}

/**
 * 批量更新价格响应
 */
export interface BatchUpdatePricesResponse {
  success_count: number
  failed_count: number
  failed_product_ids: string[]
}

/**
 * 批量更新供应商产品价格
 */
export async function batchUpdateSupplierPrices(
  supplierId: string,
  data: BatchUpdatePricesRequest
): Promise<BatchUpdatePricesResponse> {
  const url = `${API_PATHS.SUPPLIERS?.BASE || '/api/service-management/suppliers'}/${supplierId}/products/batch-prices`
  const result = await put<BatchUpdatePricesResponse>(url, data)
  return result.data!
}

/**
 * 获取供应商已添加的产品ID列表
 */
export async function getExistingSupplierProductIds(
  supplierId: string
): Promise<string[]> {
  const url = `${API_PATHS.SUPPLIERS?.BASE || '/api/service-management/suppliers'}/${supplierId}/products/existing`
  const result = await get<string[]>(url)
  return result.data!
}

/**
 * 更新供应商产品价格
 */
export async function updateVendorProductPrice(
  supplierId: string,
  productId: string,
  data: UpdatePriceRequest
): Promise<{ success: boolean; message: string }> {
  const url = `${API_PATHS.SUPPLIERS?.BASE || '/api/service-management/suppliers'}/${supplierId}/services/${productId}/price`
  const result = await put<{ success: boolean; message: string }>(url, data)
  return result.data!
}
