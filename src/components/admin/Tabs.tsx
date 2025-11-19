/**
 * 标签页组件
 * 显示当前打开的页面标签，支持切换和关闭
 */
import { X } from 'lucide-react'
import { useTabs } from '@/contexts/TabsContext'
import { Box, HStack, IconButton, Text, useColorModeValue } from '@chakra-ui/react'

export const Tabs = () => {
  const { tabs, activeTabId, setActiveTab, closeTab } = useTabs()
  const activeBg = useColorModeValue('primary.50', 'primary.900')
  const activeColor = useColorModeValue('primary.600', 'primary.200')
  const inactiveBg = useColorModeValue('white', 'gray.800')
  const inactiveColor = useColorModeValue('gray.600', 'gray.300')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

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
    >
      <HStack spacing={0} minW={0} flex={1}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId
          const Icon = tab.icon
          return (
            <HStack
              key={tab.id}
              px={4}
              py={2}
              borderRight="1px"
              borderColor={borderColor}
              cursor="pointer"
              minW={0}
              bg={isActive ? activeBg : inactiveBg}
              color={isActive ? activeColor : inactiveColor}
              borderBottom={isActive ? '2px solid' : 'none'}
              borderBottomColor={isActive ? activeColor : 'transparent'}
              _hover={{
                bg: isActive ? activeBg : 'gray.50',
              }}
              onClick={() => setActiveTab(tab.id)}
            >
              {Icon && (
                <Box as={Icon} boxSize="14px" flexShrink={0} />
              )}
              <Text
                fontSize="sm"
                fontWeight="medium"
                noOfLines={1}
                maxW="200px"
              >
                {tab.title}
              </Text>
              <IconButton
                aria-label="关闭标签"
                icon={<X size={14} />}
                size="xs"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation()
                  closeTab(tab.id)
                }}
                color={isActive ? activeColor : 'gray.400'}
                _hover={{
                  bg: 'gray.200',
                }}
              />
            </HStack>
          )
        })}
      </HStack>
    </Box>
  )
}

