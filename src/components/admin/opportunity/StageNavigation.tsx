/**
 * 阶段导航栏组件
 * 显示9个阶段的导航，支持点击跳转
 */
import React, { useState, useEffect } from 'react'
import { HStack, VStack, Box, Text, Badge, Spinner } from '@chakra-ui/react'
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react'
import { getStageTemplates, getStageHistory, OpportunityStageTemplate, OpportunityStageHistory } from '@/api/opportunityStages'

interface StageNavigationProps {
  opportunityId: string
  currentStageId: string | null
  onStageChange: (stageId: string) => void
}

export const StageNavigation: React.FC<StageNavigationProps> = ({
  opportunityId,
  currentStageId,
  onStageChange,
}) => {
  const [stages, setStages] = useState<OpportunityStageTemplate[]>([])
  const [stageHistories, setStageHistories] = useState<OpportunityStageHistory[]>([])
  const [loading, setLoading] = useState(false)

  // 加载阶段模板和历史
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // 使用 Promise.allSettled 处理404错误
        const [templatesResult, historiesResult] = await Promise.allSettled([
          getStageTemplates(),
          getStageHistory(opportunityId),
        ])
        
        // 处理阶段模板结果
        if (templatesResult.status === 'fulfilled') {
          const templates = templatesResult.value
          // 添加数组类型检查
          if (Array.isArray(templates)) {
            setStages(templates.sort((a, b) => a.stage_order - b.stage_order))
          } else {
            console.warn('[StageNavigation] 阶段模板不是数组格式:', templates)
            setStages([])
          }
        } else {
          console.error('[StageNavigation] 加载阶段模板失败:', templatesResult.reason)
          setStages([])
        }
        
        // 处理阶段历史结果（404错误不抛出异常，返回空数组）
        if (historiesResult.status === 'fulfilled') {
          const histories = historiesResult.value
          // 添加数组类型检查
          if (Array.isArray(histories)) {
            setStageHistories(histories)
          } else {
            console.warn('[StageNavigation] 阶段历史不是数组格式:', histories)
            setStageHistories([])
          }
        } else {
          // 404错误是正常情况，不记录错误
          const error = historiesResult.reason
          if (error && typeof error === 'object' && 'code' in error && error.code === 404) {
            setStageHistories([])
          } else {
            console.error('[StageNavigation] 加载阶段历史失败:', error)
            setStageHistories([])
          }
        }
      } catch (error) {
        console.error('[StageNavigation] 加载失败:', error)
        setStages([])
        setStageHistories([])
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [opportunityId])

  // 获取阶段状态
  const getStageStatus = (stageId: string) => {
    const history = stageHistories.find((h) => h.stage_id === stageId)
    if (!history) return 'not_started' // 未开始
    if (history.exited_at) return 'completed' // 已完成
    if (history.entered_at && !history.exited_at) return 'in_progress' // 进行中
    return 'not_started'
  }

  // 判断是否为当前阶段
  const isCurrentStage = (stageId: string) => {
    return currentStageId === stageId
  }

  // 判断是否需要审批
  const needsApproval = (stageId: string) => {
    const history = stageHistories.find((h) => h.stage_id === stageId)
    return history?.approval_status === 'pending'
  }

  // 判断是否有异常状态
  const hasException = (stageId: string) => {
    const history = stageHistories.find((h) => h.stage_id === stageId)
    // 可以扩展更多异常判断逻辑
    return false // 暂时返回false，后续可根据实际业务逻辑判断
  }

  // 判断数据是否不完整
  const hasIncompleteData = (stageId: string) => {
    const history = stageHistories.find((h) => h.stage_id === stageId)
    // 可以扩展数据完整性检查逻辑
    return false // 暂时返回false，后续可根据实际业务逻辑判断
  }

  // 获取不完整数据数量
  const getIncompleteDataCount = (stageId: string) => {
    // 模拟数据，实际应从API获取
    return 0
  }

  if (loading) {
    return (
      <HStack justify="center" py={4}>
        <Spinner size="sm" />
      </HStack>
    )
  }

  return (
    <Box position="relative">
      {/* 进度条连接线 */}
      <Box
        position="absolute"
        top="50%"
        left="0"
        right="0"
        h="2px"
        bg="var(--ali-border)"
        zIndex={0}
        transform="translateY(-50%)"
      />
      <HStack spacing={0} justify="space-between" align="center" position="relative" zIndex={1}>
        {stages.map((stage, index) => {
          const status = getStageStatus(stage.id)
          const isCurrent = isCurrentStage(stage.id)
          const needsApprove = needsApproval(stage.id)
          const hasExc = hasException(stage.id)
          const hasIncomplete = hasIncompleteData(stage.id)
          const incompleteCount = getIncompleteDataCount(stage.id)

          // 计算进度条连接线的位置和颜色
          const isCompleted = status === 'completed'
          const progressLineColor = isCompleted ? 'var(--ali-primary)' : 'var(--ali-border)'

          return (
            <Box
              key={stage.id}
              flex="1"
              position="relative"
              cursor="pointer"
              onClick={() => onStageChange(stage.id)}
              px={2}
              py={2}
              borderRadius="4px"
              _hover={{ bg: 'var(--ali-primary-light)' }}
              bg={isCurrent ? 'var(--ali-primary-light)' : 'transparent'}
              transition="all 0.2s ease"
            >
              <VStack spacing={1} align="center">
                {/* 阶段图标和连接线 */}
                <HStack spacing={0} align="center" position="relative" w="100%">
                  {/* 左侧连接线 */}
                  {index > 0 && (
                    <Box
                      position="absolute"
                      left="-50%"
                      top="50%"
                      w="50%"
                      h="2px"
                      bg={progressLineColor}
                      zIndex={0}
                    />
                  )}
                  
                  {/* 阶段状态图标 */}
                  <Box position="relative" zIndex={2}>
                    {status === 'completed' ? (
                      <CheckCircle2
                        size={20}
                        color="var(--ali-primary)"
                        fill="var(--ali-primary)"
                        style={{ filter: 'drop-shadow(0 1px 2px rgba(24, 144, 255, 0.3))' }}
                      />
                    ) : status === 'in_progress' ? (
                      <Box position="relative">
                        <Circle
                          size={20}
                          color="var(--ali-primary)"
                          fill="var(--ali-primary)"
                          style={{
                            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                          }}
                        />
                        <Box
                          position="absolute"
                          top="50%"
                          left="50%"
                          transform="translate(-50%, -50%)"
                          w="8px"
                          h="8px"
                          borderRadius="full"
                          bg="white"
                        />
                      </Box>
                    ) : (
                      <Circle
                        size={20}
                        color="var(--ali-text-disabled)"
                        fill="white"
                        strokeWidth="2"
                      />
                    )}
                    
                    {/* 异常状态图标 */}
                    {hasExc && (
                      <Box
                        position="absolute"
                        top="-4px"
                        right="-4px"
                        bg="var(--ali-error)"
                        borderRadius="full"
                        p="2px"
                      >
                        <AlertCircle size={10} color="white" fill="white" />
                      </Box>
                    )}
                  </Box>

                  {/* 右侧连接线 */}
                  {index < stages.length - 1 && (
                    <Box
                      position="absolute"
                      right="-50%"
                      top="50%"
                      w="50%"
                      h="2px"
                      bg={progressLineColor}
                      zIndex={0}
                    />
                  )}
                </HStack>

                {/* 阶段名称和徽标 */}
                <VStack spacing={0} align="center">
                  <HStack spacing={1} align="center">
                    <Text
                      fontSize="12px"
                      fontWeight={isCurrent ? '600' : '400'}
                      color={
                        status === 'completed' || status === 'in_progress'
                          ? 'var(--ali-primary)'
                          : 'var(--ali-text-secondary)'
                      }
                      lineHeight="1.5"
                    >
                      {stage.stage_order}. {stage.name_zh}
                    </Text>
                    {needsApprove && (
                      <Badge
                        colorScheme="orange"
                        fontSize="10px"
                        px={1}
                        py={0}
                        borderRadius="2px"
                      >
                        审批
                      </Badge>
                    )}
                    {hasIncomplete && incompleteCount > 0 && (
                      <Badge
                        bg="var(--ali-error)"
                        color="white"
                        fontSize="10px"
                        minW="16px"
                        h="16px"
                        borderRadius="full"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        px={1}
                      >
                        {incompleteCount}
                      </Badge>
                    )}
                  </HStack>
                </VStack>
              </VStack>

              {/* 当前阶段底部指示条 */}
              {isCurrent && (
                <Box
                  position="absolute"
                  bottom={0}
                  left="20%"
                  right="20%"
                  h="2px"
                  bg="var(--ali-primary)"
                  borderRadius="1px"
                />
              )}
            </Box>
          )
        })}
      </HStack>
      
      {/* 添加脉冲动画样式 */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </Box>
  )
}
