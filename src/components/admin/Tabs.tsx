/**
 * 标签页组件
 * 显示当前打开的页面标签，支持切换和关闭 - 阿里云ECS风格（紧凑设计）
 */
import { X } from 'lucide-react'
import { useTabs } from '@/contexts/TabsContext'
import { Box, HStack, IconButton, Text } from '@chakra-ui/react'

export const Tabs = () => {
  const { tabs, activeTabId, setActiveTab, closeTab } = useTabs()
  // 阿里云ECS风格颜色
  const activeBg = 'var(--ali-primary-light)'
  const activeColor = 'var(--ali-primary)'
  const inactiveBg = 'white'
  const inactiveColor = 'var(--ali-text-secondary)'
  const borderColor = 'var(--ali-border)'
  const hoverBg = 'var(--ali-bg-light)'

  if (tabs.length === 0) {
    return null
  }

  return (
    <Box
      bg={inactiveBg}
      borderBottom="1px"
      borderColor={borderColor}
      display="flex"
      alignItems="center"
      overflowX="auto"
      h="36px"
    >
      <HStack spacing={0} minW={0} flex={1} h="full">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId
          const Icon = tab.icon
          return (
            <HStack
              key={tab.id}
              px={2.5}
              py={1}
              h="full"
              borderRight="1px"
              borderColor={borderColor}
              cursor="pointer"
              minW={0}
              bg={isActive ? activeBg : inactiveBg}
              color={isActive ? activeColor : inactiveColor}
              borderBottom={isActive ? '2px solid' : 'none'}
              borderBottomColor={isActive ? activeColor : 'transparent'}
              _hover={{
                bg: isActive ? activeBg : hoverBg,
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              {Icon && (
                <Box as={Icon} boxSize="12px" flexShrink={0} />
              )}
              <Text
                fontSize="12px"
                fontWeight={isActive ? '500' : '400'}
                noOfLines={1}
                maxW="120px"
              >
                {tab.title}
              </Text>
              <IconButton
                aria-label="关闭标签"
                icon={<X size={12} />}
                size="xs"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(tab.id)
                }}
                color={isActive ? activeColor : inactiveColor}
                _hover={{
                  bg: 'rgba(0, 0, 0, 0.05)',
                }}
                minW="16px"
                h="16px"
              />
            </HStack>
          )
        })}
      </HStack>
    </Box>
  )
}

