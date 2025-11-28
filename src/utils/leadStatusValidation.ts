/**
 * 线索状态流转验证工具
 * 用于验证线索状态转换是否合法（只能向下转化，不能往前转化）
 */
import { LeadStatus } from '@/api/types'

// 状态顺序定义
const STATUS_ORDER: Record<LeadStatus, number> = {
  'new': 1,
  'contacted': 2,
  'qualified': 3,
  'converted': 4,
  'lost': 5,
}

// 最终状态（不能转换）
const FINAL_STATUSES: LeadStatus[] = ['converted', 'lost']

/**
 * 验证状态流转是否合法（只能向下转化，不能往前转化）
 */
export function validateStatusTransition(
  statusBefore: LeadStatus,
  statusAfter: LeadStatus
): boolean {
  // 如果状态相同，允许
  if (statusBefore === statusAfter) {
    return true
  }

  // 如果当前状态是最终状态，不允许转换
  if (FINAL_STATUSES.includes(statusBefore)) {
    return false
  }

  // 如果目标状态是 lost，允许（任何状态都可以转换为丢失）
  if (statusAfter === 'lost') {
    return true
  }

  // 如果目标状态是 converted，只允许从 qualified 转换
  if (statusAfter === 'converted') {
    return statusBefore === 'qualified'
  }

  // 检查是否向前推进（status_after 的顺序 >= status_before 的顺序）
  const beforeOrder = STATUS_ORDER[statusBefore] || 0
  const afterOrder = STATUS_ORDER[statusAfter] || 0

  return afterOrder >= beforeOrder
}

/**
 * 获取可用的状态选项（基于当前状态）
 */
export function getAvailableStatuses(currentStatus: LeadStatus): LeadStatus[] {
  // 如果当前状态是最终状态，只能选择当前状态
  if (FINAL_STATUSES.includes(currentStatus)) {
    return [currentStatus]
  }

  const currentOrder = STATUS_ORDER[currentStatus] || 0
  const availableStatuses: LeadStatus[] = []

  // 可以保持当前状态
  availableStatuses.push(currentStatus)

  // 可以转换到更高级别的状态
  Object.entries(STATUS_ORDER).forEach(([status, order]) => {
    if (order > currentOrder && validateStatusTransition(currentStatus, status as LeadStatus)) {
      availableStatuses.push(status as LeadStatus)
    }
  })

  // 任何状态都可以转换为 lost（除了已经是 lost）
  if (currentStatus !== 'lost') {
    availableStatuses.push('lost')
  }

  return availableStatuses
}

/**
 * 获取状态流转错误消息
 */
export function getStatusTransitionErrorMessage(
  statusBefore: LeadStatus,
  statusAfter: LeadStatus
): string | null {
  if (validateStatusTransition(statusBefore, statusAfter)) {
    return null
  }

  if (FINAL_STATUSES.includes(statusBefore)) {
    const statusLabels: Record<LeadStatus, string> = {
      'new': '新建',
      'contacted': '已联系',
      'qualified': '已确认',
      'converted': '已转化',
      'lost': '已丢失',
    }
    return `状态"${statusLabels[statusBefore]}"是最终状态，不能转换`
  }

  if (statusAfter === 'converted' && statusBefore !== 'qualified') {
    return '只有"已确认"状态的线索才能转换为"已转化"'
  }

  const statusLabels: Record<LeadStatus, string> = {
    'new': '新建',
    'contacted': '已联系',
    'qualified': '已确认',
    'converted': '已转化',
    'lost': '已丢失',
  }
  return `不能从"${statusLabels[statusBefore]}"转换到"${statusLabels[statusAfter]}"。状态只能向下转化，不能往前转化。`
}

