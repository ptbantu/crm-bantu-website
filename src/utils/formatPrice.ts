/**
 * 价格格式化工具函数
 * 支持多种货币格式，印尼盾使用 jt（juta）单位显示
 * 
 * 规则：
 * - 100万印尼盾 = 1jt
 * - 500k = 0.5jt
 * - 小于100万显示完整数字
 */

/**
 * 格式化价格
 * @param amount 价格金额
 * @param currency 货币类型（IDR/CNY）
 * @param options 格式化选项
 * @returns 格式化后的价格字符串
 */
export const formatPrice = (
  amount: number | null | undefined,
  currency: string = 'IDR',
  options?: {
    showSymbol?: boolean // 是否显示货币符号
    minimumFractionDigits?: number // 最小小数位数
    maximumFractionDigits?: number // 最大小数位数
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

  // 印尼盾特殊处理：使用 jt（juta）单位
  if (currency === 'IDR' || currency === 'idr') {
    return formatIDR(amount, showSymbol, minimumFractionDigits, maximumFractionDigits)
  }

  // 人民币格式化
  if (currency === 'CNY' || currency === 'cny') {
    return formatCNY(amount, showSymbol, minimumFractionDigits, maximumFractionDigits)
  }

  // 其他货币使用默认格式化
  return new Intl.NumberFormat('en-US', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount)
}

/**
 * 格式化印尼盾价格（使用 jt 单位）
 * @param amount 金额（印尼盾）
 * @param showSymbol 是否显示货币符号
 * @param minimumFractionDigits 最小小数位数
 * @param maximumFractionDigits 最大小数位数
 * @returns 格式化后的字符串，例如：1jt、0.5jt、500rb、Rp 1jt
 */
const formatIDR = (
  amount: number,
  showSymbol: boolean = true,
  minimumFractionDigits: number = 0,
  maximumFractionDigits: number = 2
): string => {
  const absAmount = Math.abs(amount)
  const sign = amount < 0 ? '-' : ''

  // 10万（100,000）及以上使用 jt 单位（支持小数，如 0.5jt = 500k）
  if (absAmount >= 100000) {
    const juta = absAmount / 1000000
    const formatted = juta.toFixed(maximumFractionDigits).replace(/\.?0+$/, '') // 移除末尾的0
    const symbol = showSymbol ? 'Rp ' : ''
    return `${sign}${symbol}${formatted}jt`
  }

  // 1000及以上使用 rb（ribu）单位
  if (absAmount >= 1000) {
    const ribu = absAmount / 1000
    const formatted = ribu.toFixed(maximumFractionDigits).replace(/\.?0+$/, '')
    const symbol = showSymbol ? 'Rp ' : ''
    return `${sign}${symbol}${formatted}rb`
  }

  // 小于1000显示完整数字
  const formatted = absAmount.toFixed(minimumFractionDigits).replace(/\.?0+$/, '')
  const symbol = showSymbol ? 'Rp ' : ''
  return `${sign}${symbol}${formatted}`
}

/**
 * 格式化人民币价格
 * @param amount 金额（人民币）
 * @param showSymbol 是否显示货币符号
 * @param minimumFractionDigits 最小小数位数
 * @param maximumFractionDigits 最大小数位数
 * @returns 格式化后的字符串
 */
const formatCNY = (
  amount: number,
  showSymbol: boolean = true,
  minimumFractionDigits: number = 0,
  maximumFractionDigits: number = 2
): string => {
  return new Intl.NumberFormat('zh-CN', {
    style: showSymbol ? 'currency' : 'decimal',
    currency: 'CNY',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount)
}

/**
 * 格式化货币（兼容旧代码）
 * @deprecated 请使用 formatPrice
 */
export const formatCurrency = (
  amount: number | null | undefined,
  currency: string = 'IDR'
): string => {
  return formatPrice(amount, currency)
}

/**
 * 价格格式化组件 Props（如果需要创建 React 组件，请在组件文件中使用）
 */
export interface PriceDisplayProps {
  amount: number | null | undefined
  currency?: string
  showSymbol?: boolean
  className?: string
  fontSize?: string
  color?: string
}
