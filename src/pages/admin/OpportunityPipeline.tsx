/**
 * 商机全流程管理页面（Pipeline视图）
 * 支持9个阶段的Pipeline管理
 */
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Spinner,
  IconButton,
  Badge,
} from '@chakra-ui/react'
import { getOpportunityDetail } from '@/api/opportunities'
import { Opportunity, OpportunityExtended } from '@/api/types'
import { useToast } from '@/components/ToastContainer'
import { useTabs } from '@/contexts/TabsContext'
import { StageNavigation } from '@/components/admin/opportunity/StageNavigation'
import { SidebarPanel } from '@/components/admin/opportunity/SidebarPanel'
import { StageContent } from '@/components/admin/opportunity/StageContent'
import { QuickActionsPanel } from '@/components/admin/opportunity/QuickActionsPanel'

const OpportunityPipeline = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { showError } = useToast()
  const { updateTabTitle } = useTabs()

  // 商机数据
  const [opportunity, setOpportunity] = useState<OpportunityExtended | null>(null)
  const [loading, setLoading] = useState(false)
  const [currentStageId, setCurrentStageId] = useState<string | null>(null)

  // 加载商机详情
  const loadOpportunity = async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await getOpportunityDetail(id)
      setOpportunity(data)
      // 更新标签页标题为商机ID（如OPP2025122900004）或商机名称
      const opportunityTitle = data.id || id
      updateTabTitle(`/admin/opportunities/pipeline/${id}`, opportunityTitle)
      // 设置当前阶段ID（如果有）
      if (data.current_stage_id) {
        setCurrentStageId(data.current_stage_id)
      }
    } catch (error: any) {
      console.error('[OpportunityPipeline] 加载失败:', error)
      showError(error.message || '加载商机信息失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOpportunity()
  }, [id])

  // 阶段切换处理
  const handleStageChange = (stageId: string) => {
    setCurrentStageId(stageId)
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <Spinner size="xl" />
      </Flex>
    )
  }

  if (!opportunity) {
    return (
      <Box p={4}>
        <Text>商机不存在</Text>
      </Box>
    )
  }

  return (
    <Box w="full" h="100vh" display="flex" flexDirection="column" bg="var(--ali-bg-gray)">
      {/* 顶部标题栏 - ECS高密度风格 */}
      <Box
        bg="white"
        borderBottom="1px solid var(--ali-border)"
        px={4}
        py={2}
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        minH="48px"
      >
        <HStack spacing={3}>
          <IconButton
            aria-label="返回列表"
            icon={<ArrowLeft size={18} />}
            onClick={() => navigate('/admin/opportunities/list')}
            variant="ghost"
            size="sm"
            minW="32px"
            h="32px"
          />
          <VStack align="start" spacing={0}>
            <HStack spacing={2}>
              <Text fontSize="14px" fontWeight="600" color="var(--ali-text-primary)" lineHeight="1.5">
                商机编号：{opportunity.id?.substring(0, 8)}...
              </Text>
              {opportunity.customer_name && (
                <>
                  <Text fontSize="12px" color="var(--ali-text-secondary)">
                    |
                  </Text>
                  <Text fontSize="12px" color="var(--ali-text-primary)" lineHeight="1.5">
                    客户：{opportunity.customer_id}（{opportunity.customer_name}）
                  </Text>
                </>
              )}
            </HStack>
            <Text fontSize="11px" color="var(--ali-text-secondary)" mt="2px" lineHeight="1.5">
              {opportunity.name}
            </Text>
          </VStack>
        </HStack>
        <HStack spacing={2}>
          <Badge
            colorScheme={
              opportunity.workflow_status === 'active'
                ? 'blue'
                : opportunity.workflow_status === 'completed'
                ? 'green'
                : opportunity.workflow_status === 'cancelled'
                ? 'red'
                : 'gray'
            }
            fontSize="11px"
            px={2}
            py={0.5}
          >
            {opportunity.workflow_status === 'active'
              ? '进行中'
              : opportunity.workflow_status === 'completed'
              ? '已完成'
              : opportunity.workflow_status === 'cancelled'
              ? '已取消'
              : '暂停'}
          </Badge>
        </HStack>
      </Box>

      {/* 阶段导航栏（固定） */}
      <Box bg="white" borderBottom="1px solid var(--ali-border)" px={4} py={2}>
        <StageNavigation
          opportunityId={id!}
          currentStageId={currentStageId}
          onStageChange={handleStageChange}
        />
      </Box>

      {/* 主内容区 - 三栏响应式布局 */}
      <Flex flex="1" overflow="hidden">
        {/* 主工作区（动态加载） */}
        <Box flex="1" overflowY="auto" bg="white" p={4} minW={0}>
          <StageContent
            opportunityId={id!}
            opportunity={opportunity}
            currentStageId={currentStageId}
            onStageChange={handleStageChange}
            onDataUpdate={loadOpportunity}
          />
        </Box>

        {/* 侧边信息面板（固定宽度280px） */}
        <Box
          w="280px"
          bg="var(--ali-bg-light)"
          borderLeft="1px solid var(--ali-border)"
          overflowY="auto"
          flexShrink={0}
        >
          <SidebarPanel opportunityId={id!} opportunity={opportunity} currentStageId={currentStageId} />
        </Box>

        {/* 快捷操作面板（右侧） */}
        <QuickActionsPanel
          opportunityId={id!}
          opportunity={opportunity}
          currentStageId={currentStageId}
          onStageChange={handleStageChange}
        />
      </Flex>
    </Box>
  )
}

export default OpportunityPipeline
