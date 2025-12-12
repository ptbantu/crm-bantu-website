/**
 * 页面头部组件
 * 通用的页面头部，支持固定定位、图标、标题、副标题、操作按钮
 */
import { ReactNode } from 'react'
import { ComponentType } from 'react'
import {
  Box,
  HStack,
  VStack,
  Text,
  Icon,
} from '@chakra-ui/react'

interface PageHeaderProps {
  /** 图标组件 */
  icon?: ComponentType<{ className?: string }> | ComponentType<any>
  /** 标题 */
  title: string
  /** 副标题 */
  subtitle?: string
  /** 右侧操作按钮区域 */
  actions?: ReactNode
  /** 是否固定定位（默认 true） */
  sticky?: boolean
  /** 背景色（默认白色） */
  bg?: string
}

export const PageHeader = ({
  icon: IconComponent,
  title,
  subtitle,
  actions,
  sticky = true,
  bg,
}: PageHeaderProps) => {
  // 阿里云ECS风格样式
  const defaultBg = 'white'
  const titleColor = 'var(--ali-text-primary)'
  const subtitleColor = 'var(--ali-text-secondary)'
  const borderColor = 'var(--ali-border)'

  return (
    <Box
      position={sticky ? 'sticky' : 'relative'}
      top={sticky ? 0 : 'auto'}
      zIndex={sticky ? 10 : 'auto'}
      bg={bg || defaultBg}
      borderBottom="1px"
      borderColor={borderColor}
      h="56px"
      px={6}
      mb={4}
      boxShadow={sticky ? '0 1px 4px rgba(0, 21, 41, 0.08)' : 'none'}
      display="flex"
      alignItems="center"
    >
      <HStack spacing={4} justify="space-between" align="center" w="full">
        {/* 左侧：图标 + 标题区域 */}
        <HStack spacing={3} flex={1} minW={0}>
          {IconComponent && (
            <Box
              boxSize={8}
              p={1.5}
              bg="var(--ali-primary-light)"
              color="var(--ali-primary)"
              borderRadius="4px"
              flexShrink={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <IconComponent size={16} />
            </Box>
          )}
          <VStack align="flex-start" spacing={0} flex={1} minW={0}>
            <Text
              fontSize="16px"
              fontWeight="600"
              color={titleColor}
              lineHeight="1.5"
              noOfLines={1}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                fontSize="12px"
                color={subtitleColor}
                fontWeight="normal"
                noOfLines={1}
                mt={0.5}
              >
                {subtitle}
              </Text>
            )}
          </VStack>
        </HStack>

        {/* 右侧：操作按钮区域 */}
        {actions && (
          <HStack spacing={2} flexShrink={0}>
            {actions}
          </HStack>
        )}
      </HStack>
    </Box>
  )
}

