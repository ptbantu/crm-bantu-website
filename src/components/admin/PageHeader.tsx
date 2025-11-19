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
  useColorModeValue,
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
  const defaultBg = useColorModeValue('white', 'gray.800')
  const iconBg = useColorModeValue('primary.50', 'primary.900')
  const iconColor = useColorModeValue('primary.600', 'primary.200')
  const titleColor = useColorModeValue('gray.900', 'white')
  const subtitleColor = useColorModeValue('gray.500', 'gray.400')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box
      position={sticky ? 'sticky' : 'relative'}
      top={sticky ? 0 : 'auto'}
      zIndex={sticky ? 10 : 'auto'}
      bg={bg || defaultBg}
      borderBottom="1px"
      borderColor={borderColor}
      py={4}
      px={6}
      mb={4}
      shadow={sticky ? 'sm' : 'none'}
    >
      <HStack spacing={4} justify="space-between" align="flex-start">
        {/* 左侧：图标 + 标题区域 */}
        <HStack spacing={4} flex={1} minW={0}>
          {IconComponent && (
            <Box
              boxSize={10}
              p={2}
              bg={iconBg}
              color={iconColor}
              borderRadius="lg"
              flexShrink={0}
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <IconComponent size={20} />
            </Box>
          )}
          <VStack align="flex-start" spacing={1} flex={1} minW={0}>
            <Text
              fontSize="2xl"
              fontWeight="semibold"
              color={titleColor}
              lineHeight="shorter"
              noOfLines={1}
            >
              {title}
            </Text>
            {subtitle && (
              <HStack spacing={1.5}>
                <Text
                  fontSize="sm"
                  color={subtitleColor}
                  fontWeight="medium"
                  noOfLines={1}
                >
                  {subtitle}
                </Text>
              </HStack>
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

