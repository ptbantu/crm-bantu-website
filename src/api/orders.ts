/**
 * 订单管理相关 API
 */
import { get, post, put, del } from './client'
import { API_PATHS } from './config'
import {
  OrderListParams,
  Order,
  PaginatedResponse,
  CreateOrderRequest,
  UpdateOrderRequest,
  AssignOrderRequest,
} from './types'

/**
 * 获取订单列表
 */
export async function getOrderList(
  params: OrderListParams = {}
): Promise<PaginatedResponse<Order>> {
  const queryParams = new URLSearchParams()
  
  if (params.page !== undefined) {
    queryParams.append('page', params.page.toString())
  }
  if (params.size !== undefined) {
    queryParams.append('size', params.size.toString())
  }
  if (params.order_number) {
    queryParams.append('order_number', params.order_number)
  }
  if (params.title) {
    queryParams.append('title', params.title)
  }
  if (params.customer_id) {
    queryParams.append('customer_id', params.customer_id)
  }
  if (params.customer_name) {
    queryParams.append('customer_name', params.customer_name)
  }
  if (params.service_record_id) {
    queryParams.append('service_record_id', params.service_record_id)
  }
  if (params.sales_user_id) {
    queryParams.append('sales_user_id', params.sales_user_id)
  }
  if (params.status_code) {
    queryParams.append('status_code', params.status_code)
  }
  if (params.created_at_from) {
    queryParams.append('created_at_from', params.created_at_from)
  }
  if (params.created_at_to) {
    queryParams.append('created_at_to', params.created_at_to)
  }
  if (params.lang) {
    queryParams.append('lang', params.lang)
  }

  const queryString = queryParams.toString()
  const url = queryString
    ? `${API_PATHS.ORDERS.BASE}?${queryString}`
    : API_PATHS.ORDERS.BASE

  const result = await get<{ orders: Order[]; total: number; page: number; page_size: number }>(url)
  // 转换响应格式为统一的 PaginatedResponse
  // 后端返回格式: { orders: [], total: 0, page: 1, page_size: 20 }
  const data = result.data || { orders: [], total: 0, page: 1, page_size: 10 }
  return {
    records: data.orders || [],
    total: data.total || 0,
    current: data.page || 1,
    pages: data.total && data.page_size ? Math.ceil(data.total / data.page_size) : 0,
    size: data.page_size || 10,
  }
}

/**
 * 获取订单详情
 */
export async function getOrderDetail(id: string, lang?: 'zh' | 'id'): Promise<Order> {
  const queryParams = new URLSearchParams()
  if (lang) {
    queryParams.append('lang', lang)
  }
  const queryString = queryParams.toString()
  const url = queryString
    ? `${API_PATHS.ORDERS.BY_ID(id)}?${queryString}`
    : API_PATHS.ORDERS.BY_ID(id)
  const result = await get<Order>(url)
  return result.data!
}

/**
 * 创建订单
 */
export async function createOrder(data: CreateOrderRequest): Promise<Order> {
  const result = await post<Order>(API_PATHS.ORDERS.BASE, data)
  return result.data!
}

/**
 * 更新订单
 */
export async function updateOrder(id: string, data: UpdateOrderRequest): Promise<Order> {
  const result = await put<Order>(API_PATHS.ORDERS.BY_ID(id), data)
  return result.data!
}

/**
 * 删除订单
 */
export async function deleteOrder(id: string): Promise<void> {
  await del(API_PATHS.ORDERS.BY_ID(id))
}

/**
 * 分配订单
 */
export async function assignOrder(id: string, data: AssignOrderRequest): Promise<Order> {
  const result = await post<Order>(API_PATHS.ORDERS.ASSIGN(id), data)
  return result.data!
}

// 导出类型
export type {
  CreateOrderRequest,
  UpdateOrderRequest,
  AssignOrderRequest,
}

