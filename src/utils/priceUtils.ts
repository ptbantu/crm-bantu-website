/**
 * 价格相关工具函数
 */

/**
 * 格式化货币（扩展 formatPrice）
 */
export const formatCurrency = (
  amount: number | null | undefined,
  currency: string = 'IDR',
  options?: {
    showSymbol?: boolean
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  }
): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '-'
  }

  const {
    showSymbol = true,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
  } = options || {}

  if (currency === 'CNY' || currency === 'cny') {
    return new Intl.NumberFormat('zh-CN', {
      style: showSymbol ? 'currency' : 'decimal',
      currency: 'CNY',
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount)
  }

  if (currency === 'IDR' || currency === 'idr') {
    const absAmount = Math.abs(amount)
    const sign = amount < 0 ? '-' : ''
    
    if (absAmount >= 1000000) {
      const juta = absAmount / 1000000
      const formatted = juta.toFixed(maximumFractionDigits).replace(/\.?0+$/, '')
      return `${sign}${formatted}jt`
    }
    
    if (absAmount >= 1000) {
      const ribu = absAmount / 1000
      const formatted = ribu.toFixed(maximumFractionDigits).replace(/\.?0+$/, '')
      return `${sign}${formatted}rb`
    }
    
    const formatted = absAmount.toFixed(minimumFractionDigits).replace(/\.?0+$/, '')
    return `${sign}${formatted}`
  }

  return new Intl.NumberFormat('en-US', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount)
}

/**
 * 计算价格变动百分比
 */
export const calculatePriceChange = (
  oldPrice: number | null | undefined,
  newPrice: number | null | undefined
): { percentage: number; amount: number; direction: 'up' | 'down' | 'same' } | null => {
  if (oldPrice === null || oldPrice === undefined || newPrice === null || newPrice === undefined) {
    return null
  }

  if (oldPrice === 0) {
    return null
  }

  const amount = newPrice - oldPrice
  const percentage = ((newPrice - oldPrice) / oldPrice) * 100

  return {
    percentage: Math.abs(percentage),
    amount: Math.abs(amount),
    direction: amount > 0 ? 'up' : amount < 0 ? 'down' : 'same',
  }
}

/**
 * 获取价格状态
 */
export type PriceStatus = 'active' | 'upcoming' | 'expired' | 'draft'

export interface PriceStatusInfo {
  status: PriceStatus
  label: string
  color: string
  hoursUntil?: number
}

export const getPriceStatus = (
  effectiveFrom: string | Date,
  effectiveTo?: string | Date | null
): PriceStatusInfo => {
  const now = new Date()
  const from = new Date(effectiveFrom)
  const to = effectiveTo ? new Date(effectiveTo) : null

  // 未来生效
  if (from > now) {
    const hoursUntil = Math.floor((from.getTime() - now.getTime()) / (1000 * 60 * 60))
    return {
      status: 'upcoming',
      label: `未来生效 (${hoursUntil}小时后)`,
      color: '#FA8C16',
      hoursUntil,
    }
  }

  // 已过期
  if (to && to < now) {
    return {
      status: 'expired',
      label: '已过期',
      color: '#F5222D',
    }
  }

  // 生效中
  return {
    status: 'active',
    label: '生效中',
    color: '#52C41A',
  }
}

/**
 * 格式化日期时间
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return '-'
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

/**
 * 格式化日期
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return '-'
  
  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'
  
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(d)
}

/**
 * 获取货币图标
 */
export const getCurrencyIcon = (currency: string): string => {
  switch (currency.toUpperCase()) {
    case 'CNY':
      return '¥'
    case 'IDR':
      return 'Rp'
    case 'USD':
      return '$'
    case 'EUR':
      return '€'
    default:
      return currency
  }
}

/**
 * 获取价格类型标签
 */
export const getPriceTypeLabel = (priceType: string): string => {
  const labels: Record<string, string> = {
    cost: '成本价',
    channel: '渠道价',
    direct: '直客价',
    list: '列表价',
  }
  return labels[priceType] || priceType
}
