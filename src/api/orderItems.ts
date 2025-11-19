/**
 * 订单项管理相关 API
 */
import { get, post, put, del } from './client'
import { API_PATHS } from './config'
import {
  OrderItem,
  CreateOrderItemRequest,
  UpdateOrderItemRequest,
  PaginatedResponse,
} from './types'

/**
 * 获取订单的订单项列表
 */
export async function getOrderItemList(
  orderId: string,
  lang?: 'zh' | 'id'
): Promise<OrderItem[]> {
  const queryParams = new URLSearchParams()
  if (lang) {
    queryParams.append('lang', lang)
  }
  const queryString = queryParams.toString()
  const url = queryString
    ? `${API_PATHS.ORDER_ITEMS.BASE(orderId)}?${queryString}`
    : API_PATHS.ORDER_ITEMS.BASE(orderId)
  const result = await get<OrderItem[]>(url)
  return result.data || []
}

/**
 * 获取订单项详情
 */
export async function getOrderItemDetail(
  orderId: string,
  itemId: string,
  lang?: 'zh' | 'id'
): Promise<OrderItem> {
  const queryParams = new URLSearchParams()
  if (lang) {
    queryParams.append('lang', lang)
  }
  const queryString = queryParams.toString()
  const url = queryString
    ? `${API_PATHS.ORDER_ITEMS.BY_ID(orderId, itemId)}?${queryString}`
    : API_PATHS.ORDER_ITEMS.BY_ID(orderId, itemId)
  const result = await get<OrderItem>(url)
  return result.data!
}

/**
 * 创建订单项
 */
export async function createOrderItem(
  orderId: string,
  data: CreateOrderItemRequest
): Promise<OrderItem> {
  const result = await post<OrderItem>(API_PATHS.ORDER_ITEMS.BASE(orderId), data)
  return result.data!
}

/**
 * 更新订单项
 */
export async function updateOrderItem(
  orderId: string,
  itemId: string,
  data: UpdateOrderItemRequest
): Promise<OrderItem> {
  const result = await put<OrderItem>(API_PATHS.ORDER_ITEMS.BY_ID(orderId, itemId), data)
  return result.data!
}

/**
 * 删除订单项
 */
export async function deleteOrderItem(orderId: string, itemId: string): Promise<void> {
  await del(API_PATHS.ORDER_ITEMS.BY_ID(orderId, itemId))
}

