/**
 * 状态标签组件
 * 统一的状态显示样式
 */
import React from 'react'
import { Badge, BadgeProps } from '@chakra-ui/react'

export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'default'

interface StatusBadgeProps extends Omit<BadgeProps, 'colorScheme'> {
  status: StatusType
  children: React.ReactNode
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, children, ...props }) => {
  const colorSchemeMap: Record<StatusType, string> = {
    success: 'green',
    warning: 'orange',
    error: 'red',
    info: 'blue',
    default: 'gray',
  }

  return (
    <Badge
      colorScheme={colorSchemeMap[status]}
      fontSize="11px"
      px={1.5}
      py={0.5}
      borderRadius="2px"
      {...props}
    >
      {children}
    </Badge>
  )
}
