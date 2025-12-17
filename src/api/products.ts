/**
 * 产品/服务管理相关 API
 */
import { get, post, put, del } from './client'
import { API_PATHS } from './config'
import {
  ProductListParams,
  Product,
  ProductDetail,
  ProductDetailAggregated,
  PaginatedResponse,
} from './types'

/**
 * 获取产品列表
 */
export async function getProductList(
  params: ProductListParams = {}
): Promise<PaginatedResponse<Product>> {
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
  if (params.category_id) {
    queryParams.append('category_id', params.category_id)
  }
  if (params.service_type) {
    queryParams.append('service_type', params.service_type)
  }
  if (params.service_subtype) {
    queryParams.append('service_subtype', params.service_subtype)
  }
  if (params.status) {
    queryParams.append('status', params.status)
  }
  if (params.is_active !== undefined) {
    queryParams.append('is_active', params.is_active.toString())
  }
  if (params.group_by_category !== undefined) {
    queryParams.append('group_by_category', params.group_by_category.toString())
  }

  const queryString = queryParams.toString()
  const url = queryString
    ? `${API_PATHS.PRODUCTS.BASE}?${queryString}`
    : API_PATHS.PRODUCTS.BASE

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
 * 获取产品详情
 */
export async function getProductDetail(id: string): Promise<ProductDetail> {
  const result = await get<ProductDetail>(API_PATHS.PRODUCTS.BY_ID(id))
  return result.data!
}

/**
 * 创建产品
 */
export interface CreateProductRequest {
  name: string
  code?: string
  category_id?: string
  service_type?: string
  service_subtype?: string
  validity_period?: number
  processing_days?: number
  processing_time_text?: string
  is_urgent_available?: boolean
  urgent_processing_days?: number
  urgent_price_surcharge?: number
  price_cost_idr?: number
  price_cost_cny?: number
  price_channel_idr?: number
  price_channel_cny?: number
  price_direct_idr?: number
  price_direct_cny?: number
  price_list_idr?: number
  price_list_cny?: number
  default_currency?: string
  exchange_rate?: number
  commission_rate?: number
  commission_amount?: number
  equivalent_cny?: number
  monthly_orders?: number
  total_amount?: number
  sla_description?: string
  service_level?: string
  status?: string
  required_documents?: string
  notes?: string
  tags?: string[]
  is_active?: boolean
}

export async function createProduct(data: CreateProductRequest): Promise<Product> {
  const result = await post<Product>(API_PATHS.PRODUCTS.BASE, data)
  return result.data!
}

/**
 * 更新产品
 */
export interface UpdateProductRequest {
  name?: string
  code?: string
  category_id?: string
  service_type?: string
  service_type_id?: string
  service_subtype?: string
  validity_period?: number
  processing_days?: number
  processing_time_text?: string
  is_urgent_available?: boolean
  urgent_processing_days?: number
  urgent_price_surcharge?: number
  std_duration_days?: number
  allow_multi_vendor?: boolean
  default_supplier_id?: string
  price_cost_idr?: number
  price_cost_cny?: number
  price_channel_idr?: number
  price_channel_cny?: number
  price_direct_idr?: number
  price_direct_cny?: number
  price_list_idr?: number
  price_list_cny?: number
  exchange_rate?: number
  price_effective_from?: Date
  commission_rate?: number
  commission_amount?: number
  equivalent_cny?: number
  monthly_orders?: number
  total_amount?: number
  sla_description?: string
  service_level?: string
  status?: string
  suspended_reason?: string
  discontinued_at?: Date
  required_documents?: string
  notes?: string
  tags?: string[]
  applicable_regions?: string[]
  is_active?: boolean
}

export async function updateProduct(
  id: string,
  data: UpdateProductRequest
): Promise<Product> {
  const result = await put<Product>(API_PATHS.PRODUCTS.BY_ID(id), data)
  return result.data!
}

/**
 * 删除产品
 */
export async function deleteProduct(id: string): Promise<void> {
  await del(API_PATHS.PRODUCTS.BY_ID(id))
}

/**
 * 获取产品详情聚合数据
 */
export async function getProductDetailAggregated(id: string): Promise<ProductDetailAggregated> {
  try {
    const result = await get<ProductDetailAggregated>(`${API_PATHS.PRODUCTS.BY_ID(id)}/detail`)
    return result.data!
  } catch (error: any) {
    console.error('获取产品详情聚合数据失败:', error)
    throw error
  }
}

/**
 * 检查产品编码是否已存在
 */
export async function checkProductCode(
  code: string,
  excludeProductId?: string
): Promise<{ exists: boolean; code: string }> {
  const queryParams = new URLSearchParams()
  if (excludeProductId) {
    queryParams.append('exclude_product_id', excludeProductId)
  }
  const queryString = queryParams.toString()
  const url = queryString
    ? `${API_PATHS.PRODUCTS.CHECK_CODE(code)}?${queryString}`
    : API_PATHS.PRODUCTS.CHECK_CODE(code)
  const result = await get<{ exists: boolean; code: string }>(url)
  return result.data!
}

