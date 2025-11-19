/**
 * 订单评论管理相关 API
 */
import { get, post, put, del } from './client'
import { API_PATHS } from './config'
import {
  OrderComment,
  PaginatedResponse,
} from './types'

export interface CreateOrderCommentRequest {
  order_stage_id?: string | null
  comment_type?: 'general' | 'internal' | 'customer' | 'system'
  content?: string | null
  content_zh?: string | null
  content_id?: string | null
  is_internal?: boolean
  is_pinned?: boolean
  replied_to_comment_id?: string | null
}

export interface UpdateOrderCommentRequest {
  comment_type?: 'general' | 'internal' | 'customer' | 'system'
  content?: string | null
  content_zh?: string | null
  content_id?: string | null
  is_internal?: boolean
  is_pinned?: boolean
}

export interface ReplyOrderCommentRequest {
  content?: string | null
  content_zh?: string | null
  content_id?: string | null
  is_internal?: boolean
}

/**
 * 获取订单的评论列表
 */
export async function getOrderCommentList(
  orderId: string,
  params: { page?: number; size?: number; lang?: 'zh' | 'id' } = {}
): Promise<PaginatedResponse<OrderComment>> {
  const queryParams = new URLSearchParams()
  if (params.page !== undefined) {
    queryParams.append('page', params.page.toString())
  }
  if (params.size !== undefined) {
    queryParams.append('size', params.size.toString())
  }
  if (params.lang) {
    queryParams.append('lang', params.lang)
  }
  const queryString = queryParams.toString()
  const url = queryString
    ? `${API_PATHS.ORDER_COMMENTS.BASE(orderId)}?${queryString}`
    : API_PATHS.ORDER_COMMENTS.BASE(orderId)
  const result = await get<{ items: OrderComment[]; total: number; page: number; size: number }>(url)
  return {
    records: result.data!.items,
    total: result.data!.total,
    current: result.data!.page,
    pages: Math.ceil(result.data!.total / result.data!.size),
    size: result.data!.size,
  }
}

/**
 * 获取评论详情
 */
export async function getOrderCommentDetail(
  orderId: string,
  commentId: string,
  lang?: 'zh' | 'id'
): Promise<OrderComment> {
  const queryParams = new URLSearchParams()
  if (lang) {
    queryParams.append('lang', lang)
  }
  const queryString = queryParams.toString()
  const url = queryString
    ? `${API_PATHS.ORDER_COMMENTS.BY_ID(orderId, commentId)}?${queryString}`
    : API_PATHS.ORDER_COMMENTS.BY_ID(orderId, commentId)
  const result = await get<OrderComment>(url)
  return result.data!
}

/**
 * 创建评论
 */
export async function createOrderComment(
  orderId: string,
  data: CreateOrderCommentRequest
): Promise<OrderComment> {
  const result = await post<OrderComment>(API_PATHS.ORDER_COMMENTS.BASE(orderId), data)
  return result.data!
}

/**
 * 更新评论
 */
export async function updateOrderComment(
  orderId: string,
  commentId: string,
  data: UpdateOrderCommentRequest
): Promise<OrderComment> {
  const result = await put<OrderComment>(API_PATHS.ORDER_COMMENTS.BY_ID(orderId, commentId), data)
  return result.data!
}

/**
 * 删除评论
 */
export async function deleteOrderComment(orderId: string, commentId: string): Promise<void> {
  await del(API_PATHS.ORDER_COMMENTS.BY_ID(orderId, commentId))
}

/**
 * 回复评论
 */
export async function replyOrderComment(
  orderId: string,
  commentId: string,
  data: ReplyOrderCommentRequest
): Promise<OrderComment> {
  const result = await post<OrderComment>(API_PATHS.ORDER_COMMENTS.REPLY(orderId, commentId), data)
  return result.data!
}

/**
 * 置顶/取消置顶评论
 */
export async function pinOrderComment(
  orderId: string,
  commentId: string,
  isPinned: boolean
): Promise<OrderComment> {
  const result = await post<OrderComment>(API_PATHS.ORDER_COMMENTS.PIN(orderId, commentId), { is_pinned: isPinned })
  return result.data!
}


