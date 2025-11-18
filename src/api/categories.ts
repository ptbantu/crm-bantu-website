/**
 * 产品分类管理相关 API
 */
import { get, post, put, del } from './client'
import { API_PATHS } from './config'
import {
  CategoryListParams,
  ProductCategory,
  PaginatedResponse,
} from './types'

/**
 * 获取分类列表
 */
export async function getCategoryList(
  params: CategoryListParams = {}
): Promise<PaginatedResponse<ProductCategory>> {
  const queryParams = new URLSearchParams()
  
  if (params.page !== undefined) {
    queryParams.append('page', params.page.toString())
  }
  if (params.size !== undefined) {
    queryParams.append('size', params.size.toString())
  }
  if (params.code) {
    queryParams.append('code', params.code)
  }
  if (params.name) {
    queryParams.append('name', params.name)
  }
  if (params.parent_id !== undefined) {
    queryParams.append('parent_id', params.parent_id)
  }
  if (params.is_active !== undefined) {
    queryParams.append('is_active', params.is_active.toString())
  }

  const queryString = queryParams.toString()
  const url = queryString
    ? `${API_PATHS.CATEGORIES.BASE}?${queryString}`
    : API_PATHS.CATEGORIES.BASE

  const result = await get<{ items: ProductCategory[]; total: number; page: number; size: number }>(url)
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
 * 获取分类详情
 */
export async function getCategoryDetail(id: string): Promise<ProductCategory> {
  const result = await get<ProductCategory>(API_PATHS.CATEGORIES.BY_ID(id))
  return result.data!
}

/**
 * 创建分类
 */
export interface CreateCategoryRequest {
  code: string
  name: string
  description?: string
  parent_id?: string | null
  display_order?: number
  is_active?: boolean
}

export async function createCategory(data: CreateCategoryRequest): Promise<ProductCategory> {
  const result = await post<ProductCategory>(API_PATHS.CATEGORIES.BASE, data)
  return result.data!
}

/**
 * 更新分类
 */
export interface UpdateCategoryRequest {
  name?: string
  description?: string
  display_order?: number
  is_active?: boolean
}

export async function updateCategory(
  id: string,
  data: UpdateCategoryRequest
): Promise<ProductCategory> {
  const result = await put<ProductCategory>(API_PATHS.CATEGORIES.BY_ID(id), data)
  return result.data!
}

/**
 * 删除分类
 */
export async function deleteCategory(id: string): Promise<void> {
  await del(API_PATHS.CATEGORIES.BY_ID(id))
}

