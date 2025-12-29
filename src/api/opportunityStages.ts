/**
 * 商机阶段相关 API
 */
import { get, post, put } from './client'
import { API_PATHS } from './config'

// 阶段模板
export interface OpportunityStageTemplate {
  id: string
  code: string
  name_zh: string
  name_id: string
  description_zh?: string
  description_id?: string
  stage_order: number
  requires_approval: boolean
  approval_roles_json?: string[]
  conditions_json?: any
  is_active: boolean
  created_at: string
  updated_at: string
}

// 阶段历史
export interface OpportunityStageHistory {
  id: string
  opportunity_id: string
  stage_id: string
  stage_name_zh?: string
  entered_at: string
  exited_at?: string
  duration_days?: number
  conditions_met_json?: any
  requires_approval: boolean
  approval_status?: 'pending' | 'approved' | 'rejected'
  approved_by?: string
  approval_at?: string
  approval_notes?: string
  created_at: string
}

/**
 * 获取所有阶段模板
 */
export async function getStageTemplates(): Promise<OpportunityStageTemplate[]> {
  const result = await get<OpportunityStageTemplate[]>(`${API_PATHS.OPPORTUNITIES.BASE}/stages/templates`)
  return result.data || []
}

/**
 * 获取商机的阶段历史
 */
export async function getStageHistory(opportunityId: string): Promise<OpportunityStageHistory[]> {
  try {
    const result = await get<{ records: OpportunityStageHistory[]; total?: number } | OpportunityStageHistory[]>(
      `${API_PATHS.OPPORTUNITIES.BY_ID(opportunityId)}/stages/history`
    )
    
    // 处理响应格式：支持 { records: [] } 和直接数组两种格式
    if (result.data) {
      if (Array.isArray(result.data)) {
        return result.data
      } else if (typeof result.data === 'object' && 'records' in result.data) {
        return Array.isArray(result.data.records) ? result.data.records : []
      }
    }
    return []
  } catch (error: any) {
    // 404错误返回空数组（正常情况：商机可能还没有阶段历史）
    if (error instanceof Error && 'code' in error && error.code === 404) {
      return []
    }
    // 其他错误也返回空数组，避免页面崩溃
    console.error('[getStageHistory] 获取阶段历史失败:', error)
    return []
  }
}

/**
 * 推进到下一阶段
 */
export async function advanceStage(
  opportunityId: string,
  targetStageId: string,
  conditionsMet?: any
): Promise<void> {
  await post(`${API_PATHS.OPPORTUNITIES.BY_ID(opportunityId)}/advance-stage`, {
    target_stage_id: targetStageId,
    conditions_met: conditionsMet,
  })
}

/**
 * 审批阶段
 */
export async function approveStage(
  opportunityId: string,
  stageId: string,
  approvalStatus: 'approved' | 'rejected',
  notes?: string
): Promise<void> {
  await post(`${API_PATHS.OPPORTUNITIES.BY_ID(opportunityId)}/approve-stage`, {
    stage_id: stageId,
    approval_status: approvalStatus,
    notes,
  })
}
