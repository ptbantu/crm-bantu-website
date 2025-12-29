/**
 * 阶段内容组件
 * 根据当前阶段ID动态加载对应的阶段内容组件
 */
import React, { useState, useEffect } from 'react'
import { Box, Text, Spinner } from '@chakra-ui/react'
import { OpportunityExtended } from '@/api/types'
import { getStageTemplates, OpportunityStageTemplate } from '@/api/opportunityStages'
import { Stage1New } from './stages/Stage1New'
import { Stage2ServicePlan } from './stages/Stage2ServicePlan'
import { Stage3Quotation } from './stages/Stage3Quotation'
import { Stage4Contract } from './stages/Stage4Contract'
import { Stage5Invoice } from './stages/Stage5Invoice'
import { Stage6HandlingMaterials } from './stages/Stage6HandlingMaterials'
import { Stage7CollectionStatus } from './stages/Stage7CollectionStatus'
import { Stage8AssignExecution } from './stages/Stage8AssignExecution'
import { Stage9Collection } from './stages/Stage9Collection'

interface StageContentProps {
  opportunityId: string
  opportunity: OpportunityExtended
  currentStageId: string | null
  onStageChange: (stageId: string) => void
  onDataUpdate: () => void
}

export const StageContent: React.FC<StageContentProps> = ({
  opportunityId,
  opportunity,
  currentStageId,
  onStageChange,
  onDataUpdate,
}) => {
  const [stages, setStages] = useState<OpportunityStageTemplate[]>([])
  const [loading, setLoading] = useState(false)

  // 加载阶段模板
  useEffect(() => {
    const loadStages = async () => {
      setLoading(true)
      try {
        const templates = await getStageTemplates()
        // 添加数组类型检查
        if (Array.isArray(templates)) {
          setStages(templates)
        } else {
          console.warn('[StageContent] 阶段模板不是数组格式:', templates)
          setStages([])
        }
      } catch (error) {
        console.error('[StageContent] 加载阶段模板失败:', error)
        setStages([])
      } finally {
        setLoading(false)
      }
    }
    loadStages()
  }, [])

  // 根据阶段代码映射到组件
  const getStageComponent = () => {
    if (loading) {
      return <Spinner />
    }

    // 处理stages为空的情况
    if (!Array.isArray(stages) || stages.length === 0) {
      return <Stage1New opportunityId={opportunityId} opportunity={opportunity} onDataUpdate={onDataUpdate} />
    }

    // 如果没有当前阶段ID，默认显示第一阶段
    if (!currentStageId) {
      return <Stage1New opportunityId={opportunityId} opportunity={opportunity} onDataUpdate={onDataUpdate} />
    }

    // 查找当前阶段的模板
    const currentStage = stages.find((s) => s.id === currentStageId)
    const stageCode = currentStage?.code || ''

    // 根据阶段代码映射到组件
    switch (stageCode) {
      case 'new':
        return <Stage1New opportunityId={opportunityId} opportunity={opportunity} onDataUpdate={onDataUpdate} />
      case 'service_plan':
        return <Stage2ServicePlan opportunityId={opportunityId} opportunity={opportunity} onDataUpdate={onDataUpdate} />
      case 'quotation':
        return <Stage3Quotation opportunityId={opportunityId} opportunity={opportunity} onDataUpdate={onDataUpdate} />
      case 'contract':
        return <Stage4Contract opportunityId={opportunityId} opportunity={opportunity} onDataUpdate={onDataUpdate} />
      case 'invoice':
        return <Stage5Invoice opportunityId={opportunityId} opportunity={opportunity} onDataUpdate={onDataUpdate} />
      case 'handling_materials':
        return <Stage6HandlingMaterials opportunityId={opportunityId} opportunity={opportunity} onDataUpdate={onDataUpdate} />
      case 'collection_status':
        return <Stage7CollectionStatus opportunityId={opportunityId} opportunity={opportunity} onDataUpdate={onDataUpdate} />
      case 'assign_execution':
        return <Stage8AssignExecution opportunityId={opportunityId} opportunity={opportunity} onDataUpdate={onDataUpdate} />
      case 'collection':
        return <Stage9Collection opportunityId={opportunityId} opportunity={opportunity} onDataUpdate={onDataUpdate} />
      default:
        return <Stage1New opportunityId={opportunityId} opportunity={opportunity} onDataUpdate={onDataUpdate} />
    }
  }

  return (
    <Box>
      {getStageComponent()}
    </Box>
  )
}
