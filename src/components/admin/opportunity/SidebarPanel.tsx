/**
 * 侧边信息面板组件
 * 显示商机概要、阶段历史、相关人员、审批状态等
 */
import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Card,
  CardBody,
  Divider,
  Spinner,
  Progress,
  Avatar,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react'
import { User, Calendar, DollarSign, TrendingUp, AlertCircle, Clock, CheckCircle2 } from 'lucide-react'
import { Opportunity, OpportunityExtended } from '@/api/types'
import { getStageHistory, OpportunityStageHistory } from '@/api/opportunityStages'
import { formatPrice } from '@/utils/formatPrice'

interface SidebarPanelProps {
  opportunityId: string
  opportunity: OpportunityExtended
  currentStageId?: string | null
}

export const SidebarPanel: React.FC<SidebarPanelProps> = ({
  opportunityId,
  opportunity,
  currentStageId,
}) => {
  const [stageHistories, setStageHistories] = useState<OpportunityStageHistory[]>([])
  const [loading, setLoading] = useState(false)

  // 根据当前阶段生成智能提醒
  const getSmartReminders = () => {
    const reminders: Array<{ type: 'info' | 'warning' | 'error'; message: string }> = []
    
    if (!currentStageId) {
      reminders.push({
        type: 'info',
        message: '请选择或创建商机阶段以开始流程',
      })
      return reminders
    }

    // 根据阶段代码生成不同的提醒
    // 这里可以根据实际业务逻辑扩展
    if (opportunity.workflow_status === 'active') {
      reminders.push({
        type: 'info',
        message: '商机进行中，请及时更新进度',
      })
    }

    if (opportunity.probability && opportunity.probability < 30) {
      reminders.push({
        type: 'warning',
        message: '成功率较低，建议加强跟进',
      })
    }

    return reminders
  }

  // 加载阶段历史
  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true)
      try {
        const histories = await getStageHistory(opportunityId)
        // 添加数组类型检查
        if (Array.isArray(histories)) {
          setStageHistories(histories.sort((a, b) => {
            const dateA = new Date(a.entered_at).getTime()
            const dateB = new Date(b.entered_at).getTime()
            return dateB - dateA // 最新的在前
          }))
        } else {
          console.warn('[SidebarPanel] 阶段历史不是数组格式:', histories)
          setStageHistories([])
        }
      } catch (error: any) {
        // 404错误返回空数组（正常情况：商机可能还没有阶段历史）
        if (error && typeof error === 'object' && 'code' in error && error.code === 404) {
          setStageHistories([])
        } else {
          console.error('[SidebarPanel] 加载历史失败:', error)
          setStageHistories([])
        }
      } finally {
        setLoading(false)
      }
    }
    loadHistory()
  }, [opportunityId])

  // 格式化日期时间
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  const reminders = getSmartReminders()

  return (
    <VStack spacing={3} align="stretch" p={3}>
      {/* 商机概要卡片 */}
      <Card variant="elevated" size="sm" boxShadow="var(--ali-card-shadow)">
        <CardBody p={3}>
          <Text fontSize="14px" fontWeight="600" mb={3} color="var(--ali-text-primary)" lineHeight="1.5">
            商机概要
          </Text>
          <VStack spacing={2} align="stretch">
            <HStack justify="space-between" minH="20px">
              <Text fontSize="11px" color="var(--ali-text-secondary)" lineHeight="1.5">
                客户编号：
              </Text>
              <Text fontSize="12px" fontWeight="500" color="var(--ali-text-primary)" lineHeight="1.5">
                {opportunity.customer_id}
              </Text>
            </HStack>
            <HStack justify="space-between" minH="20px">
              <Text fontSize="11px" color="var(--ali-text-secondary)" lineHeight="1.5">
                预计金额：
              </Text>
              <Text fontSize="12px" fontWeight="500" color="var(--ali-text-primary)" lineHeight="1.5">
                {formatPrice(opportunity.amount, 'IDR')}
              </Text>
            </HStack>
            <HStack justify="space-between" minH="20px">
              <Text fontSize="11px" color="var(--ali-text-secondary)" lineHeight="1.5">
                成功率：
              </Text>
              <HStack spacing={2} flex="1" maxW="60%">
                <Progress
                  value={opportunity.probability || 0}
                  size="sm"
                  colorScheme="blue"
                  flex="1"
                  borderRadius="2px"
                />
                <Text fontSize="11px" fontWeight="500" color="var(--ali-text-primary)" lineHeight="1.5" minW="32px">
                  {opportunity.probability || 0}%
                </Text>
              </HStack>
            </HStack>
            <Divider my={1} />
            <HStack justify="space-between" minH="20px">
              <Text fontSize="11px" color="var(--ali-text-secondary)" lineHeight="1.5">
                服务类型：
              </Text>
              <Badge fontSize="11px" colorScheme="blue" px={1.5} py={0.5} borderRadius="2px">
                {opportunity.service_type === 'one_time'
                  ? '一次性'
                  : opportunity.service_type === 'long_term'
                  ? '长周期'
                  : '混合'}
              </Badge>
            </HStack>
            <HStack justify="space-between" minH="20px">
              <Text fontSize="11px" color="var(--ali-text-secondary)" lineHeight="1.5">
                创建人：
              </Text>
              <Text fontSize="11px" color="var(--ali-text-primary)" lineHeight="1.5">
                {opportunity.owner_username || '-'}
              </Text>
            </HStack>
            <HStack justify="space-between" minH="20px">
              <Text fontSize="11px" color="var(--ali-text-secondary)" lineHeight="1.5">
                创建时间：
              </Text>
              <Text fontSize="11px" color="var(--ali-text-primary)" lineHeight="1.5">
                {opportunity.created_at
                  ? new Date(opportunity.created_at).toLocaleDateString('zh-CN')
                  : '-'}
              </Text>
            </HStack>
            {opportunity.last_followup_at && (
              <HStack justify="space-between" minH="20px">
                <Text fontSize="11px" color="var(--ali-text-secondary)" lineHeight="1.5">
                  最后跟进：
                </Text>
                <Text fontSize="11px" color="var(--ali-text-primary)" lineHeight="1.5">
                  {formatDateTime(opportunity.last_followup_at)}
                </Text>
              </HStack>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* 智能提醒卡片 */}
      {reminders.length > 0 && (
        <Card variant="elevated" size="sm" boxShadow="var(--ali-card-shadow)">
          <CardBody p={3}>
            <HStack spacing={1} mb={2}>
              <AlertCircle size={14} color="var(--ali-warning)" />
              <Text fontSize="14px" fontWeight="600" color="var(--ali-text-primary)" lineHeight="1.5">
                智能提醒
              </Text>
            </HStack>
            <VStack spacing={2} align="stretch">
              {reminders.map((reminder, index) => (
                <Alert
                  key={index}
                  status={reminder.type}
                  borderRadius="4px"
                  py={2}
                  px={2}
                  fontSize="11px"
                  minH="auto"
                >
                  <AlertIcon boxSize="14px" />
                  <Text fontSize="11px" lineHeight="1.5">
                    {reminder.message}
                  </Text>
                </Alert>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* 阶段历史时间线 */}
      <Card variant="elevated" size="sm" boxShadow="var(--ali-card-shadow)">
        <CardBody p={3}>
          <Text fontSize="14px" fontWeight="600" mb={3} color="var(--ali-text-primary)" lineHeight="1.5">
            阶段历史
          </Text>
          {loading ? (
            <Spinner size="sm" />
          ) : stageHistories.length === 0 ? (
            <Text fontSize="12px" color="var(--ali-text-secondary)">
              暂无历史记录
            </Text>
          ) : (
            <VStack spacing={2} align="stretch">
              {stageHistories.slice(0, 5).map((history, index) => (
                <Box
                  key={history.id}
                  pl={3}
                  borderLeft="2px solid var(--ali-border)"
                  position="relative"
                  pb={index < stageHistories.slice(0, 5).length - 1 ? 2 : 0}
                >
                  <Box
                    position="absolute"
                    left="-6px"
                    top="4px"
                    w="10px"
                    h="10px"
                    borderRadius="full"
                    bg={history.exited_at ? 'var(--ali-primary)' : 'var(--ali-success)'}
                    border="2px solid white"
                    boxShadow="0 0 0 1px var(--ali-border)"
                  />
                  <Text fontSize="11px" fontWeight="500" color="var(--ali-text-primary)" mb={1} lineHeight="1.5">
                    {history.stage_name_zh || '阶段'}
                  </Text>
                  <Text fontSize="10px" color="var(--ali-text-secondary)" lineHeight="1.5">
                    {formatDateTime(history.entered_at)}
                    {history.exited_at && ` → ${formatDateTime(history.exited_at)}`}
                  </Text>
                  {history.duration_days !== null && (
                    <Text fontSize="10px" color="var(--ali-text-secondary)" lineHeight="1.5">
                      持续 {history.duration_days} 天
                    </Text>
                  )}
                </Box>
              ))}
            </VStack>
          )}
        </CardBody>
      </Card>

      {/* 相关人员卡片 */}
      <Card variant="elevated" size="sm" boxShadow="var(--ali-card-shadow)">
        <CardBody p={3}>
          <Text fontSize="14px" fontWeight="600" mb={3} color="var(--ali-text-primary)" lineHeight="1.5">
            相关人员
          </Text>
          <VStack spacing={2} align="stretch">
            {opportunity.owner_username && (
              <HStack spacing={2}>
                <Avatar size="xs" name={opportunity.owner_username} />
                <VStack align="start" spacing={0}>
                  <Text fontSize="12px" fontWeight="500" color="var(--ali-text-primary)">
                    {opportunity.owner_username}
                  </Text>
                  <Text fontSize="11px" color="var(--ali-text-secondary)">
                    负责人
                  </Text>
                </VStack>
              </HStack>
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )
}
