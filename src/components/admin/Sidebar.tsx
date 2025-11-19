/**
 * 侧边栏组件
 * 权限感知的导航菜单
 */
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMenu } from '@/hooks/useMenu'
import { useSidebar } from '@/contexts/SidebarContext'
import { ChevronDown, ChevronRight } from 'lucide-react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Tooltip,
  Divider,
  useColorModeValue,
  Flex,
  Image,
  IconButton,
} from '@chakra-ui/react'

export const Sidebar = () => {
  const menu = useMenu()
  const { t } = useTranslation()
  const location = useLocation()
  const { isCollapsed } = useSidebar()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  
  // Chakra UI 颜色模式
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const activeBg = useColorModeValue('blue.50', 'blue.900')
  const activeColor = useColorModeValue('blue.600', 'blue.300')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const groupTextColor = useColorModeValue('gray.500', 'gray.400')

  // 自动展开包含激活子菜单的父菜单
  useEffect(() => {
    const findActiveParent = (items: typeof menu): string[] => {
      const activeParents: string[] = []
      
      const checkItem = (item: typeof menu[0]): boolean => {
        if (item.children) {
          const hasActiveChild = item.children.some(child => 
            location.pathname === child.path || location.pathname.startsWith(child.path + '/')
          )
          if (hasActiveChild) {
            activeParents.push(item.key)
            return true
          }
        }
        return false
      }
      
      items.forEach(item => checkItem(item))
      return activeParents
    }
    
    const activeParents = findActiveParent(menu)
    if (activeParents.length > 0) {
      setExpandedItems(prev => {
        const next = new Set(prev)
        activeParents.forEach(key => next.add(key))
        return next
      })
    }
  }, [location.pathname, menu])

  const renderMenuItem = (item: (typeof menu)[0], level = 0) => {
    const Icon = item.icon
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.key)
    const isParentActive = hasChildren && item.children!.some(child => 
      location.pathname === child.path || location.pathname.startsWith(child.path + '/')
    )

    // 如果有子菜单，显示父菜单标题（可点击折叠/展开）
    if (hasChildren) {
      const toggleExpand = () => {
        setExpandedItems(prev => {
          const next = new Set(prev)
          if (next.has(item.key)) {
            next.delete(item.key)
          } else {
            next.add(item.key)
          }
          return next
        })
      }

      return (
        <Box key={item.key}>
          {/* 父菜单作为分组标题，可点击折叠/展开 */}
          {!isCollapsed && (
            <Box
              as="button"
              onClick={toggleExpand}
              w="full"
              px={2.5}
              py={1.5}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              fontSize="xs"
              fontWeight="semibold"
              color={groupTextColor}
              textTransform="uppercase"
              letterSpacing="wider"
              _hover={{
                bg: hoverBg,
              }}
              transition="all 0.2s"
              borderRadius="md"
            >
              <HStack spacing={2}>
                <Box as={Icon} size={3.5} flexShrink={0} />
                <Text>{t(item.label)}</Text>
              </HStack>
              <Box as={isExpanded ? ChevronDown : ChevronRight} size={3.5} />
            </Box>
          )}
          {/* 子菜单列表 */}
          {!isCollapsed && isExpanded ? (
            <VStack
              spacing={0.5}
              align="stretch"
              ml={1.5}
              pl={1.5}
              borderLeft="1px solid"
              borderColor={borderColor}
            >
              {item.children!.map(child => renderMenuItem(child, level + 1))}
            </VStack>
          ) : null}
        </Box>
      )
    }

    // 没有子菜单的菜单项，正常显示为链接
    const isActive = location.pathname === item.path || 
                    location.pathname.startsWith(item.path + '/')
    const tooltipTitle = isCollapsed ? t(item.label) : undefined

    const menuItem = (
      <Box
        as={Link}
        to={item.path}
        display="flex"
        alignItems="center"
        justifyContent={isCollapsed ? 'center' : 'flex-start'}
        px={2.5}
        py={1.5}
        borderRadius="md"
        transition="all 0.2s"
        fontSize="sm"
        position="relative"
        ml={level > 0 && !isCollapsed ? 4 : 0}
        bg={isActive ? activeBg : 'transparent'}
        color={isActive ? activeColor : textColor}
        _hover={{
          bg: isActive ? activeBg : hoverBg,
        }}
        _active={{
          bg: activeBg,
          color: activeColor,
        }}
      >
        <Box as={Icon} size={4} flexShrink={0} />
        {!isCollapsed && (
          <>
            <Text
              fontWeight="medium"
              flex={1}
              whiteSpace="nowrap"
              ml={2}
            >
              {t(item.label)}
            </Text>
            {item.badge && (
              <Badge
                colorScheme="red"
                fontSize="xs"
                borderRadius="full"
                ml="auto"
              >
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </Box>
    )

    return (
      <Box key={item.key}>
        {isCollapsed ? (
          <Tooltip
            label={tooltipTitle}
            placement="right"
            hasArrow
            bg="gray.900"
            color="white"
            fontSize="xs"
          >
            {menuItem}
          </Tooltip>
        ) : (
          menuItem
        )}
      </Box>
    )
  }

  return (
    <Box
      as="aside"
      bg={bgColor}
      borderRightWidth={1}
      borderColor={borderColor}
      display="flex"
      flexDirection="column"
      h="100%"
      transition="all 0.3s"
      w={isCollapsed ? 16 : { base: '48', md: '64' }}
      minW={isCollapsed ? 16 : { base: '48', md: '64' }}
      maxW={isCollapsed ? 16 : { base: '48', md: '64' }}
    >
      {/* Logo 区域 */}
      <Box
        borderBottomWidth={1}
        borderColor={borderColor}
        p={isCollapsed ? 2 : 3}
        transition="all 0.3s"
      >
        <Flex align="center" justify="center">
          {isCollapsed ? (
            <Box
              h={8}
              w={8}
              borderRadius="md"
              bg="blue.100"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Text color="blue.600" fontWeight="bold" fontSize="sm">
                B
              </Text>
            </Box>
          ) : (
            <Image
              src="/pics/bantu/bantu_logo.png"
              alt="Bantu Logo"
              h={6}
              w="auto"
            />
          )}
        </Flex>
      </Box>
      
      {/* 导航菜单 */}
      <Box
        as="nav"
        flex={1}
        overflowY="auto"
        p={2}
      >
        <VStack spacing={1} align="stretch">
          {menu.map(item => renderMenuItem(item))}
        </VStack>
      </Box>
    </Box>
  )
}

