/**
 * 侧边栏组件
 * 权限感知的导航菜单 - 现代化设计风格
 */
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMenu } from '@/hooks/useMenu'
import { useSidebar } from '@/contexts/SidebarContext'
import { useAuth } from '@/hooks/useAuth'
import { ChevronDown, ChevronRight, Search, ChevronRight as ChevronRightIcon } from 'lucide-react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Tooltip,
  useColorModeValue,
  Flex,
  IconButton,
  Input,
  InputGroup,
  InputLeftElement,
  Avatar,
  Image,
} from '@chakra-ui/react'

export const Sidebar = () => {
  const menu = useMenu()
  const { t } = useTranslation()
  const location = useLocation()
  const { isCollapsed } = useSidebar()
  const { user } = useAuth()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [searchValue, setSearchValue] = useState('')
  
  // Chakra UI 颜色模式
  const bgColor = useColorModeValue('white', 'gray.900')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.800')
  const activeBg = useColorModeValue('gray.100', 'gray.700')
  const activeColor = useColorModeValue('gray.900', 'white')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const groupTextColor = useColorModeValue('gray.500', 'gray.400')
  const searchBg = useColorModeValue('gray.50', 'gray.800')
  const searchBorder = useColorModeValue('gray.200', 'gray.700')

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
              px={3}
              py={2}
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
              mb={1}
            >
              <HStack spacing={2}>
                <Text>{t(item.label)}</Text>
              </HStack>
              <Box as={isExpanded ? ChevronDown : ChevronRight} size={14} />
            </Box>
          )}
          {/* 子菜单列表 */}
          {!isCollapsed && isExpanded ? (
            <VStack
              spacing={0.5}
              align="stretch"
              ml={2}
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
        px={3}
        py={2}
        borderRadius="md"
        transition="all 0.2s"
        fontSize="sm"
        position="relative"
        bg={isActive ? activeBg : 'transparent'}
        color={isActive ? activeColor : textColor}
        _hover={{
          bg: isActive ? activeBg : hoverBg,
        }}
        _active={{
          bg: activeBg,
          color: activeColor,
        }}
        mb={0.5}
      >
        <Box as={Icon} size={18} flexShrink={0} />
        {!isCollapsed && (
          <>
            <Text
              fontWeight={isActive ? 'semibold' : 'medium'}
              flex={1}
              whiteSpace="nowrap"
              ml={3}
            >
              {t(item.label)}
            </Text>
            {item.badge && (
              <Badge
                colorScheme="red"
                fontSize="xs"
                borderRadius="full"
                ml="auto"
                minW={5}
                h={5}
                display="flex"
                alignItems="center"
                justifyContent="center"
                px={1.5}
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
            openDelay={300}
          >
            {menuItem}
          </Tooltip>
        ) : (
          menuItem
        )}
      </Box>
    )
  }

  // 过滤菜单项（根据搜索）
  const filteredMenu = menu.filter(item => {
    if (!searchValue) return true
    const searchLower = searchValue.toLowerCase()
    const label = t(item.label).toLowerCase()
    if (label.includes(searchLower)) return true
    if (item.children) {
      return item.children.some(child => 
        t(child.label).toLowerCase().includes(searchLower)
      )
    }
    return false
  })

  return (
    <Box
      as="aside"
      bg={bgColor}
      borderRightWidth={1}
      borderColor={borderColor}
      display="flex"
      flexDirection="column"
      h="100vh"
      transition="all 0.3s"
      w={isCollapsed ? 20 : 64}
      minW={isCollapsed ? 20 : 64}
      maxW={isCollapsed ? 20 : 64}
      position="sticky"
      top={0}
    >
      {/* Logo 区域 */}
      <Box
        borderBottomWidth={1}
        borderColor={borderColor}
        p={isCollapsed ? 3 : 4}
        transition="all 0.3s"
      >
        <Flex align="center" justify={isCollapsed ? 'center' : 'flex-start'}>
          <Image
            src="/pics/bantu/bantu_logo_blue.png"
            alt="Bantu Logo"
            h={isCollapsed ? 8 : 10}
            w="auto"
            objectFit="contain"
          />
        </Flex>
      </Box>

      {/* 搜索框 */}
      <Box p={isCollapsed ? 2 : 3} borderBottomWidth={1} borderColor={borderColor}>
        {isCollapsed ? (
          <Tooltip label={t('common.search')} placement="right" hasArrow>
            <IconButton
              aria-label={t('common.search')}
              icon={<Search size={18} />}
              variant="ghost"
              size="sm"
              w="full"
            />
          </Tooltip>
        ) : (
          <InputGroup size="sm">
            <InputLeftElement pointerEvents="none">
              <Search size={16} color="gray" />
            </InputLeftElement>
              <Input
              placeholder={t('common.search')}
              value={searchValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value)}
              bg={searchBg}
              borderColor={searchBorder}
              _focus={{
                borderColor: 'blue.500',
                boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
              }}
            />
          </InputGroup>
        )}
      </Box>
      
      {/* 导航菜单 */}
      <Box
        as="nav"
        flex={1}
        overflowY="auto"
        overflowX="hidden"
        p={2}
      >
        <VStack spacing={0} align="stretch">
          {!isCollapsed && (
            <Text
              fontSize="xs"
              fontWeight="semibold"
              color={groupTextColor}
              textTransform="uppercase"
              letterSpacing="wider"
              px={3}
              py={2}
              mb={1}
            >
              {t('menu.menu')}
            </Text>
          )}
          {filteredMenu.map(item => renderMenuItem(item))}
        </VStack>
      </Box>

      {/* 用户资料 */}
      <Box
        p={3}
        borderTopWidth={1}
        borderColor={borderColor}
      >
        {isCollapsed ? (
          <Tooltip
            label={
              <VStack spacing={0} align="flex-start">
                <Text fontWeight="semibold">{user?.display_name || user?.username || 'User'}</Text>
                <Text fontSize="xs">{user?.email || ''}</Text>
              </VStack>
            }
            placement="right"
            hasArrow
          >
            <Flex align="center" justify="center">
              <Avatar
                size="sm"
                name={user?.display_name || user?.username || 'User'}
                src={user?.email ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name || user.username || 'User')}&background=blue&color=fff` : undefined}
              />
              <Box as={ChevronRightIcon} size={14} ml={1} color={textColor} />
            </Flex>
          </Tooltip>
        ) : (
          <HStack spacing={3} align="center">
            <Avatar
              size="sm"
              name={user?.display_name || user?.username || 'User'}
              src={user?.email ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name || user.username || 'User')}&background=blue&color=fff` : undefined}
            />
            <VStack spacing={0} align="flex-start" flex={1} minW={0}>
              <Text
                fontSize="sm"
                fontWeight="semibold"
                color={useColorModeValue('gray.900', 'white')}
                isTruncated
                w="full"
              >
                {user?.display_name || user?.username || 'User'}
              </Text>
              {user?.email && (
                <Text
                  fontSize="xs"
                  color={textColor}
                  isTruncated
                  w="full"
                >
                  {user.email}
                </Text>
              )}
            </VStack>
            <Box as={ChevronRightIcon} size={16} color={textColor} flexShrink={0} />
          </HStack>
        )}
      </Box>
    </Box>
  )
}