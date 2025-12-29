/**
 * 快捷操作面板组件
 * 右侧折叠式面板，显示阶段待办事项、快速导航和常用动作
 */
import React, { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  IconButton,
  Button,
  Divider,
  Badge,
  Collapse,
} from '@chakra-ui/react'
import {
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Navigation,
  Zap,
  AlertCircle,
} from 'lucide-react'
import { OpportunityExtended } from '@/api/types'

interface QuickActionsPanelProps {
  opportunityId: string
  opportunity: OpportunityExtended
  currentStageId: string | null
  onStageChange: (stageId: string) => void
}

export const QuickActionsPanel: React.FC<QuickActionsPanelProps> = ({
  opportunityId,
  opportunity,
  currentStageId,
  onStageChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // 模拟待办事项数据（实际应从API获取）
  const todos = [
    { id: '1', text: '完善客户信息', stage: 'new', completed: false },
    { id: '2', text: '提交服务方案', stage: 'service_plan', completed: false },
    { id: '3', text: '等待审批', stage: 'quotation', completed: false },
  ]

  // 快速导航阶段列表
  const quickNavStages = [
    { id: 'stage1', name: '新建商机', code: 'new' },
    { id: 'stage2', name: '服务方案', code: 'service_plan' },
    { id: 'stage3', name: '报价单', code: 'quotation' },
    { id: 'stage4', name: '合同', code: 'contract' },
  ]

  const panelWidth = isExpanded
    ? 'var(--ali-quick-actions-width-expanded)'
    : 'var(--ali-quick-actions-width-collapsed)'

  return (
    <Box
      w={panelWidth}
      bg="white"
      borderLeft="1px solid var(--ali-border)"
      display="flex"
      flexDirection="column"
      transition="width 0.2s ease"
      flexShrink={0}
      position="relative"
    >
      {/* 折叠/展开按钮 */}
      <Box
        position="absolute"
        left="-12px"
        top="50%"
        transform="translateY(-50%)"
        zIndex={10}
      >
        <IconButton
          aria-label={isExpanded ? '折叠面板' : '展开面板'}
          icon={isExpanded ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          onClick={() => setIsExpanded(!isExpanded)}
          size="sm"
          borderRadius="full"
          bg="white"
          border="1px solid var(--ali-border)"
          boxShadow="var(--ali-card-shadow)"
          _hover={{ bg: 'var(--ali-bg-light)' }}
          minW="24px"
          h="24px"
        />
      </Box>

      {/* 面板内容 */}
      <Box flex="1" overflowY="auto" p={isExpanded ? 3 : 2}>
        {isExpanded ? (
          <VStack spacing={3} align="stretch">
            {/* 标题 */}
            <Text fontSize="12px" fontWeight="600" color="var(--ali-text-primary)">
              快捷操作
            </Text>

            <Divider />

            {/* 阶段待办事项 */}
            <VStack spacing={2} align="stretch">
              <HStack spacing={1}>
                <CheckSquare size={14} color="var(--ali-text-secondary)" />
                <Text fontSize="11px" fontWeight="500" color="var(--ali-text-secondary)">
                  待办事项
                </Text>
                <Badge
                  fontSize="10px"
                  colorScheme="red"
                  borderRadius="full"
                  minW="16px"
                  h="16px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  px={1}
                >
                  {todos.filter((t) => !t.completed).length}
                </Badge>
              </HStack>
              <VStack spacing={1} align="stretch" pl={4}>
                {todos.slice(0, 3).map((todo) => (
                  <HStack
                    key={todo.id}
                    spacing={2}
                    p={1.5}
                    borderRadius="4px"
                    _hover={{ bg: 'var(--ali-bg-light)' }}
                    cursor="pointer"
                  >
                    <Box
                      w="12px"
                      h="12px"
                      border="1.5px solid var(--ali-border-dark)"
                      borderRadius="2px"
                      bg={todo.completed ? 'var(--ali-primary)' : 'transparent'}
                    />
                    <Text fontSize="11px" color="var(--ali-text-primary)" flex="1">
                      {todo.text}
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </VStack>

            <Divider />

            {/* 快速导航 */}
            <VStack spacing={2} align="stretch">
              <HStack spacing={1}>
                <Navigation size={14} color="var(--ali-text-secondary)" />
                <Text fontSize="11px" fontWeight="500" color="var(--ali-text-secondary)">
                  快速导航
                </Text>
              </HStack>
              <VStack spacing={1} align="stretch">
                {quickNavStages.map((stage) => (
                  <Button
                    key={stage.id}
                    size="sm"
                    variant="ghost"
                    fontSize="11px"
                    h="28px"
                    justifyContent="flex-start"
                    px={2}
                    onClick={() => {
                      // 这里需要根据stage.code找到对应的stageId
                      // 暂时使用占位逻辑
                      console.log('Navigate to:', stage.code)
                    }}
                    _hover={{ bg: 'var(--ali-primary-light)' }}
                    color="var(--ali-text-primary)"
                  >
                    {stage.name}
                  </Button>
                ))}
              </VStack>
            </VStack>

            <Divider />

            {/* 常用动作 */}
            <VStack spacing={2} align="stretch">
              <HStack spacing={1}>
                <Zap size={14} color="var(--ali-text-secondary)" />
                <Text fontSize="11px" fontWeight="500" color="var(--ali-text-secondary)">
                  常用动作
                </Text>
              </HStack>
              <VStack spacing={1} align="stretch">
                <Button
                  size="sm"
                  variant="outline"
                  fontSize="11px"
                  h="28px"
                  colorScheme="blue"
                  borderColor="var(--ali-primary)"
                  color="var(--ali-primary)"
                  _hover={{ bg: 'var(--ali-primary-light)' }}
                >
                  保存草稿
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  fontSize="11px"
                  h="28px"
                  colorScheme="orange"
                  borderColor="var(--ali-orange)"
                  color="var(--ali-orange)"
                  _hover={{ bg: '#FFF7E6' }}
                >
                  提交审批
                </Button>
              </VStack>
            </VStack>

            {/* 异常提醒 */}
            {opportunity.workflow_status === 'active' && (
              <>
                <Divider />
                <VStack spacing={1} align="stretch">
                  <HStack spacing={1}>
                    <AlertCircle size={14} color="var(--ali-error)" />
                    <Text fontSize="11px" fontWeight="500" color="var(--ali-error)">
                      异常提醒
                    </Text>
                  </HStack>
                  <Text fontSize="10px" color="var(--ali-text-secondary)" pl={4}>
                    暂无异常
                  </Text>
                </VStack>
              </>
            )}
          </VStack>
        ) : (
          // 折叠状态：只显示图标按钮
          <VStack spacing={3} align="center" pt={2}>
            <IconButton
              aria-label="待办事项"
              icon={<CheckSquare size={18} />}
              variant="ghost"
              size="sm"
              minW="40px"
              h="40px"
            />
            <IconButton
              aria-label="快速导航"
              icon={<Navigation size={18} />}
              variant="ghost"
              size="sm"
              minW="40px"
              h="40px"
            />
            <IconButton
              aria-label="常用动作"
              icon={<Zap size={18} />}
              variant="ghost"
              size="sm"
              minW="40px"
              h="40px"
            />
          </VStack>
        )}
      </Box>
    </Box>
  )
}
