/**
 * 订单文件管理相关 API
 */
import { get, post, put, del } from './client'
import { API_PATHS } from './config'
import {
  OrderFile,
  PaginatedResponse,
} from './types'

export interface CreateOrderFileRequest {
  order_item_id?: string | null
  order_stage_id?: string | null
  file_category?: 'passport' | 'visa' | 'document' | 'other' | null
  file_name?: string | null
  file_name_zh?: string | null
  file_name_id?: string | null
  file_type?: string | null
  description?: string | null
  description_zh?: string | null
  description_id?: string | null
  is_required?: boolean
}

export interface UpdateOrderFileRequest {
  file_category?: 'passport' | 'visa' | 'document' | 'other' | null
  file_name?: string | null
  file_name_zh?: string | null
  file_name_id?: string | null
  description?: string | null
  description_zh?: string | null
  description_id?: string | null
  is_required?: boolean
}

export interface UploadOrderFileRequest extends CreateOrderFileRequest {
  file: File
}

/**
 * 获取订单的文件列表
 */
export async function getOrderFileList(
  orderId: string,
  params: {
    page?: number
    size?: number
    stage_id?: string
    item_id?: string
    category?: string
    lang?: 'zh' | 'id'
  } = {}
): Promise<PaginatedResponse<OrderFile>> {
  const queryParams = new URLSearchParams()
  if (params.page !== undefined) {
    queryParams.append('page', params.page.toString())
  }
  if (params.size !== undefined) {
    queryParams.append('size', params.size.toString())
  }
  if (params.stage_id) {
    queryParams.append('stage_id', params.stage_id)
  }
  if (params.item_id) {
    queryParams.append('item_id', params.item_id)
  }
  if (params.category) {
    queryParams.append('category', params.category)
  }
  if (params.lang) {
    queryParams.append('lang', params.lang)
  }
  const queryString = queryParams.toString()
  const url = queryString
    ? `${API_PATHS.ORDER_FILES.BASE(orderId)}?${queryString}`
    : API_PATHS.ORDER_FILES.BASE(orderId)
  const result = await get<{ items: OrderFile[]; total: number; page: number; size: number }>(url)
  return {
    records: result.data!.items,
    total: result.data!.total,
    current: result.data!.page,
    pages: Math.ceil(result.data!.total / result.data!.size),
    size: result.data!.size,
  }
}

/**
 * 获取文件详情
 */
export async function getOrderFileDetail(
  orderId: string,
  fileId: string,
  lang?: 'zh' | 'id'
): Promise<OrderFile> {
  const queryParams = new URLSearchParams()
  if (lang) {
    queryParams.append('lang', lang)
  }
  const queryString = queryParams.toString()
  const url = queryString
    ? `${API_PATHS.ORDER_FILES.BY_ID(orderId, fileId)}?${queryString}`
    : API_PATHS.ORDER_FILES.BY_ID(orderId, fileId)
  const result = await get<OrderFile>(url)
  return result.data!
}

/**
 * 上传文件
 */
export async function uploadOrderFile(
  orderId: string,
  data: FormData
): Promise<OrderFile> {
  // FormData 会自动处理，不需要额外配置
  const result = await post<OrderFile>(API_PATHS.ORDER_FILES.BASE(orderId), data)
  return result.data!
}

/**
 * 更新文件信息
 */
export async function updateOrderFile(
  orderId: string,
  fileId: string,
  data: UpdateOrderFileRequest
): Promise<OrderFile> {
  const result = await put<OrderFile>(API_PATHS.ORDER_FILES.BY_ID(orderId, fileId), data)
  return result.data!
}

/**
 * 删除文件
 */
export async function deleteOrderFile(orderId: string, fileId: string): Promise<void> {
  await del(API_PATHS.ORDER_FILES.BY_ID(orderId, fileId))
}

/**
 * 下载文件
 */
export async function downloadOrderFile(orderId: string, fileId: string): Promise<Blob> {
  const result = await get<Blob>(API_PATHS.ORDER_FILES.DOWNLOAD(orderId, fileId), {
    responseType: 'blob',
  })
  return result.data!
}

/**
 * 验证文件
 */
export async function verifyOrderFile(
  orderId: string,
  fileId: string,
  isVerified: boolean
): Promise<OrderFile> {
  const result = await post<OrderFile>(API_PATHS.ORDER_FILES.VERIFY(orderId, fileId), {
    is_verified: isVerified,
  })
  return result.data!
}

/**
 * 获取订单阶段的文件列表
 */
export async function getOrderStageFiles(
  orderId: string,
  stageId: string,
  lang?: 'zh' | 'id'
): Promise<OrderFile[]> {
  const queryParams = new URLSearchParams()
  if (lang) {
    queryParams.append('lang', lang)
  }
  const queryString = queryParams.toString()
  const url = queryString
    ? `${API_PATHS.ORDER_FILES.BY_STAGE(orderId, stageId)}?${queryString}`
    : API_PATHS.ORDER_FILES.BY_STAGE(orderId, stageId)
  const result = await get<OrderFile[]>(url)
  return result.data || []
}

/**
 * 获取订单项的文件列表
 */
export async function getOrderItemFiles(
  orderId: string,
  itemId: string,
  lang?: 'zh' | 'id'
): Promise<OrderFile[]> {
  const queryParams = new URLSearchParams()
  if (lang) {
    queryParams.append('lang', lang)
  }
  const queryString = queryParams.toString()
  const url = queryString
    ? `${API_PATHS.ORDER_FILES.BY_ITEM(orderId, itemId)}?${queryString}`
    : API_PATHS.ORDER_FILES.BY_ITEM(orderId, itemId)
  const result = await get<OrderFile[]>(url)
  return result.data || []
}


