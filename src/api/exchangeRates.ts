/**
 * 汇率管理相关 API
 */
import { get, post, put } from './client'
import { PaginatedResponse } from './types'

// 汇率历史
export interface ExchangeRateHistory {
  id: string
  from_currency: string  // IDR, CNY, USD, EUR
  to_currency: string
  rate: number
  effective_from: string
  effective_to?: string | null
  source?: string | null
  source_reference?: string | null
  is_approved: boolean
  approved_by?: string | null
  approved_at?: string | null
  change_reason?: string | null
  changed_by?: string | null
  created_at: string
  updated_at: string
}

// 汇率列表查询参数
export interface ExchangeRateListParams {
  from_currency?: string
  to_currency?: string
  page?: number
  size?: number
}

// 创建汇率请求
export interface CreateExchangeRateRequest {
  from_currency: string
  to_currency: string
  rate: number
  effective_from?: string
  effective_to?: string | null
  source?: string | null
  source_reference?: string | null
  change_reason?: string | null
}

// 更新汇率请求
export interface UpdateExchangeRateRequest {
  rate?: number
  effective_from?: string
  effective_to?: string | null
  change_reason?: string | null
}

// 货币换算请求
export interface CurrencyConvertRequest {
  from_currency: string
  to_currency: string
  amount: number
}

// 货币换算响应
export interface CurrencyConvertResponse {
  from_currency: string
  to_currency: string
  from_amount: number
  to_amount: number
  rate: number
  rate_effective_from: string
}

/**
 * 获取当前有效汇率列表
 */
export async function getCurrentRates(
  fromCurrency?: string,
  toCurrency?: string
): Promise<ExchangeRateHistory[]> {
  const queryParams = new URLSearchParams()
  if (fromCurrency) queryParams.append('from_currency', fromCurrency)
  if (toCurrency) queryParams.append('to_currency', toCurrency)
  
  const queryString = queryParams.toString()
  const url = queryString
    ? `/api/foundation/exchange-rates?${queryString}`
    : '/api/foundation/exchange-rates'
  
  const result = await get<ExchangeRateHistory[]>(url)
  return result.data!
}

/**
 * 获取汇率历史记录
 */
export async function getRateHistory(
  params: ExchangeRateListParams = {}
): Promise<PaginatedResponse<ExchangeRateHistory>> {
  const queryParams = new URLSearchParams()
  if (params.from_currency) queryParams.append('from_currency', params.from_currency)
  if (params.to_currency) queryParams.append('to_currency', params.to_currency)
  if (params.page) queryParams.append('page', params.page.toString())
  if (params.size) queryParams.append('size', params.size.toString())
  
  const queryString = queryParams.toString()
  const url = queryString
    ? `/api/foundation/exchange-rates/history?${queryString}`
    : '/api/foundation/exchange-rates/history'
  
  const result = await get<{ items: ExchangeRateHistory[]; total: number; page: number; size: number }>(url)
  return {
    records: result.data!.items,
    total: result.data!.total,
    size: result.data!.size,
    current: result.data!.page,
    pages: Math.ceil(result.data!.total / result.data!.size)
  }
}

/**
 * 创建新汇率
 */
export async function createExchangeRate(
  data: CreateExchangeRateRequest
): Promise<ExchangeRateHistory> {
  const url = '/api/foundation/exchange-rates'
  const result = await post<ExchangeRateHistory>(url, data)
  return result.data!
}

/**
 * 更新汇率
 */
export async function updateExchangeRate(
  rateId: string,
  data: UpdateExchangeRateRequest
): Promise<ExchangeRateHistory> {
  const url = `/api/foundation/exchange-rates/${rateId}`
  const result = await put<ExchangeRateHistory>(url, data)
  return result.data!
}

/**
 * 货币换算
 */
export async function convertCurrency(
  data: CurrencyConvertRequest
): Promise<CurrencyConvertResponse> {
  const queryParams = new URLSearchParams()
  queryParams.append('from_currency', data.from_currency)
  queryParams.append('to_currency', data.to_currency)
  queryParams.append('amount', data.amount.toString())
  
  const url = `/api/foundation/exchange-rates/convert?${queryParams.toString()}`
  const result = await get<CurrencyConvertResponse>(url)
  return result.data!
}
