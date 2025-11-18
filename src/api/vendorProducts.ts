/**
 * 供应商服务管理相关 API
 */
import { get, post, put, del } from './client'
import { API_PATHS } from './config'
import {
  Product,
  ProductListParams,
  PaginatedResponse,
  VendorProduct,
} from './types'

/**
 * 供应商服务列表查询参数
 */
export interface VendorProductListParams {
  vendor_id: string
  page?: number
  size?: number
  is_available?: boolean
  is_primary?: boolean
}

/**
 * 获取供应商服务列表
 */
export async function getVendorProductList(
  params: VendorProductListParams
): Promise<PaginatedResponse<Product>> {
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
  if (params.is_primary !== undefined) {
    queryParams.append('is_primary', params.is_primary.toString())
  }

  const queryString = queryParams.toString()
  const url = queryString
    ? `${API_PATHS.PRODUCTS.BY_VENDOR(params.vendor_id)}?${queryString}`
    : API_PATHS.PRODUCTS.BY_VENDOR(params.vendor_id)

  const result = await get<{ items: Product[]; total: number; page: number; size: number }>(url)
  // 转换响应格式为统一的 PaginatedResponse
  return {
    records: result.data!.items,
    total: result.data!.total,
    current: result.data!.page,
    pages: Math.ceil(result.data!.total / result.data!.size),
    size: result.data!.size,
  }
}

/**
 * 创建供应商服务关联
 */
export interface CreateVendorProductRequest {
  organization_id: string
  product_id: string
  is_primary?: boolean
  priority?: number
  cost_price_idr?: number
  cost_price_cny?: number
  processing_days?: number
  is_available?: boolean
  available_from?: string
  available_to?: string
}

export async function createVendorProduct(
  data: CreateVendorProductRequest
): Promise<VendorProduct> {
  // TODO: 等待后端API实现
  // const result = await post<VendorProduct>(`${API_PATHS.PRODUCTS.BASE}/vendors`, data)
  // return result.data!
  throw new Error('API not implemented yet')
}

/**
 * 更新供应商服务关联
 */
export interface UpdateVendorProductRequest {
  is_primary?: boolean
  priority?: number
  cost_price_idr?: number
  cost_price_cny?: number
  processing_days?: number
  is_available?: boolean
  available_from?: string
  available_to?: string
}

export async function updateVendorProduct(
  vendorId: string,
  productId: string,
  data: UpdateVendorProductRequest
): Promise<VendorProduct> {
  // TODO: 等待后端API实现
  // const result = await put<VendorProduct>(
  //   `${API_PATHS.PRODUCTS.BY_ID(productId)}/vendors/${vendorId}`,
  //   data
  // )
  // return result.data!
  throw new Error('API not implemented yet')
}

/**
 * 删除供应商服务关联
 */
export async function deleteVendorProduct(
  vendorId: string,
  productId: string
): Promise<void> {
  // TODO: 等待后端API实现
  // await del(`${API_PATHS.PRODUCTS.BY_ID(productId)}/vendors/${vendorId}`)
  throw new Error('API not implemented yet')
}

