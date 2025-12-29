/**
 * 进度时间轴组件
 * 显示阶段历史或进度时间线
 */
import React from 'react'
import { VStack, HStack, Box, Text } from '@chakra-ui/react'
import { CheckCircle2, Circle, Clock } from 'lucide-react'

export interface TimelineItem {
  id: string
  title: string
  description?: string
  timestamp: string
  status: 'completed' | 'in_progress' | 'pending'
}

interface ProgressTimelineProps {
  items: TimelineItem[]
  orientation?: 'vertical' | 'horizontal'
}

export const ProgressTimeline: React.FC<ProgressTimelineProps> = ({
  items,
  orientation = 'vertical',
}) => {
  if (orientation === 'horizontal') {
    return (
      <HStack spacing={4} align="center">
        {items.map((item, index) => (
          <HStack key={item.id} spacing={2} align="center">
            {item.status === 'completed' ? (
              <CheckCircle2 size={16} color="var(--ali-primary)" />
            ) : item.status === 'in_progress' ? (
              <Circle size={16} color="var(--ali-primary)" fill="var(--ali-primary)" />
            ) : (
              <Circle size={16} color="var(--ali-text-disabled)" />
            )}
            <VStack spacing={0} align="start">
              <Text fontSize="11px" fontWeight="500" color="var(--ali-text-primary)">
                {item.title}
              </Text>
              <Text fontSize="10px" color="var(--ali-text-secondary)">
                {item.timestamp}
              </Text>
            </VStack>
            {index < items.length - 1 && (
              <Box w="20px" h="2px" bg="var(--ali-border)" />
            )}
          </HStack>
        ))}
      </HStack>
    )
  }

  return (
    <VStack spacing={0} align="stretch">
      {items.map((item, index) => (
        <Box key={item.id} position="relative" pl={6} pb={index < items.length - 1 ? 4 : 0}>
          {/* 连接线 */}
          {index < items.length - 1 && (
            <Box
              position="absolute"
              left="7px"
              top="20px"
              bottom="-16px"
              w="2px"
              bg={
                item.status === 'completed'
                  ? 'var(--ali-primary)'
                  : 'var(--ali-border)'
              }
            />
          )}
          
          {/* 图标 */}
          <Box position="absolute" left="0" top="2px">
            {item.status === 'completed' ? (
              <CheckCircle2 size={16} color="var(--ali-primary)" />
            ) : item.status === 'in_progress' ? (
              <Circle size={16} color="var(--ali-primary)" fill="var(--ali-primary)" />
            ) : (
              <Circle size={16} color="var(--ali-text-disabled)" />
            )}
          </Box>

          {/* 内容 */}
          <VStack align="start" spacing={1}>
            <Text fontSize="11px" fontWeight="500" color="var(--ali-text-primary)" lineHeight="1.5">
              {item.title}
            </Text>
            {item.description && (
              <Text fontSize="10px" color="var(--ali-text-secondary)" lineHeight="1.5">
                {item.description}
              </Text>
            )}
            <Text fontSize="10px" color="var(--ali-text-secondary)" lineHeight="1.5">
              {item.timestamp}
            </Text>
          </VStack>
        </Box>
      ))}
    </VStack>
  )
}
