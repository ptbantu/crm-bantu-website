/**
 * 侧边栏组件
 * 权限感知的导航菜单 - Refined Glassmorphism 设计风格
 */
import { useState, useEffect, useMemo } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMenu } from '@/hooks/useMenu'
import { useSidebar } from '@/contexts/SidebarContext'
import { useAuth } from '@/hooks/useAuth'
import { ChevronDown, ChevronRight, Search, ChevronRight as ChevronRightIcon, LogOut } from 'lucide-react'
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
  Button,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  useDisclosure,
  useBreakpointValue,
  Hide,
} from '@chakra-ui/react'
import UserInfo from '@/pages/admin/UserInfo'

export const Sidebar = () => {
  const menu = useMenu()
  const { t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { isCollapsed, toggleCollapse } = useSidebar()
  const { user } = useAuth()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [searchValue, setSearchValue] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  // Chakra UI 颜色模式 - Refined Glassmorphism
  const glassBg = useColorModeValue('whiteAlpha.900', 'blackAlpha.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const ringColor = useColorModeValue('gray.100', 'gray.800')
  const hoverBg = useColorModeValue('gray.50', 'whiteAlpha.100')
  const activeBg = useColorModeValue('indigo.600', 'indigo.500')
  const activeParentBg = useColorModeValue('indigo.50', 'indigo.900')
  const activeColor = useColorModeValue('white', 'white')
  const activeParentColor = useColorModeValue('indigo.700', 'indigo.200')
  const textColor = useColorModeValue('gray.700', 'gray.300')
  const groupTextColor = useColorModeValue('gray.500', 'gray.400')
  const searchBg = useColorModeValue('gray.50', 'whiteAlpha.100')
  const searchBorder = useColorModeValue('gray.200', 'gray.600')
  const childActiveBg = useColorModeValue('indigo.50', 'indigo.900')
  const childActiveColor = useColorModeValue('indigo.700', 'indigo.200')
  const userCardBg = useColorModeValue('white', 'gray.800')
  const userCardHoverBg = useColorModeValue('gray.50', 'gray.700')
  const userNameColor = useColorModeValue('gray.900', 'white')

  // 辅助函数：检查路径是否匹配（忽略查询参数）
  const isPathMatch = (path1: string, path2: string): boolean => {
    // 移除查询参数进行比较
    const cleanPath1 = path1.split('?')[0]
    const cleanPath2 = path2.split('?')[0]
    return cleanPath1 === cleanPath2 || cleanPath1.startsWith(cleanPath2 + '/')
  }

  // 自动展开包含激活子菜单的父菜单（确保有激活子项时父菜单始终保持展开）
  useEffect(() => {
    const findActiveParent = (items: typeof menu): string[] => {
      const activeParents: string[] = []
      
      // 递归检查菜单项及其所有子项
      const checkItem = (item: typeof menu[0]): boolean => {
        if (item.children) {
          let hasActiveChild = false
          
          for (const child of item.children) {
            // 检查当前子项是否激活（忽略查询参数）
            const childPath = child.path.split('?')[0]
            if (isPathMatch(location.pathname, childPath)) {
              hasActiveChild = true
              break
            }
            
            // 递归检查子项的子项
            if (child.children && checkItem(child)) {
              hasActiveChild = true
              break
            }
          }
          
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
    // 始终展开包含激活子项的父菜单，确保点击子菜单项时父菜单不会折叠
    // 使用函数式更新确保不会丢失已有的展开状态
    setExpandedItems(prev => {
      const next = new Set(prev)
      activeParents.forEach(key => next.add(key))
      return next
    })
  }, [location.pathname, location.search, menu])

  const renderMenuItem = (item: (typeof menu)[0], level = 0, parentKey?: string) => {
    const Icon = item.icon
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.key)
    const isChild = level > 0

    // 检查是否有激活的子项（递归检查，忽略查询参数）
    const checkActiveChild = (children: typeof item.children): boolean => {
      if (!children) return false
      return children.some(child => {
        const childPath = child.path.split('?')[0] // 移除查询参数
        // 检查路径是否匹配（忽略查询参数）
        if (isPathMatch(location.pathname, childPath)) {
          return true
        }
        // 递归检查嵌套的子项
        if (child.children) {
          return checkActiveChild(child.children)
        }
        return false
      })
    }
    const hasActiveChild = hasChildren && checkActiveChild(item.children)

    // 如果有子菜单，显示父菜单标题（可点击折叠/展开）
    if (hasChildren) {
      const toggleExpand = () => {
        // 如果有激活的子项，不允许折叠
        if (hasActiveChild) {
          return
        }
        
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

      // 父项是否直接激活（有路径且匹配，忽略查询参数）
      const isParentDirectlyActive = item.path && isPathMatch(location.pathname, item.path)
      
      // 父菜单项的样式处理逻辑
      const parentBg = isParentDirectlyActive ? activeBg : hasActiveChild ? activeParentBg : 'transparent'
      const parentColor = isParentDirectlyActive ? activeColor : hasActiveChild ? activeParentColor : groupTextColor
      const parentHoverBg = isParentDirectlyActive ? activeBg : hasActiveChild ? activeParentBg : hoverBg

      // 处理父菜单点击：如果折叠，先展开侧边栏再处理子菜单展开
      const handleParentClick = () => {
        if (isCollapsed) {
          toggleCollapse() // 展开侧边栏
          if (!expandedItems.has(item.key)) {
             setExpandedItems(prev => new Set(prev).add(item.key))
          }
        } else {
          toggleExpand()
        }
      }

      return (
        <Box key={item.key}>
          {/* 父菜单作为分组标题，可点击折叠/展开 */}
          <Tooltip 
            label={isCollapsed ? t(item.label) : undefined} 
            placement="right" 
            hasArrow 
            isDisabled={!isCollapsed}
            bg="gray.900"
            color="white"
            fontSize="xs"
          >
            <Box
              as="button"
              onClick={handleParentClick}
              w="full"
              px={isCollapsed ? 2 : 3}
              py={2.5}
              display="flex"
              alignItems="center"
              justifyContent={isCollapsed ? 'center' : 'space-between'}
              fontSize="13px"
              fontWeight="600"
              color={parentColor}
              textTransform="uppercase"
              letterSpacing="wider"
              bg={parentBg}
              boxShadow={isParentDirectlyActive ? 'md' : 'none'}
              _hover={{ bg: parentHoverBg }}
              transition="all 0.3s ease-out"
              borderRadius="lg"
              mb={1}
              position="relative"
            >
              <HStack 
                spacing={isCollapsed ? 0 : 2.5} 
                justify={isCollapsed ? 'center' : 'flex-start'} 
                flex={1} 
                minW={0}
                w={isCollapsed ? 'full' : 'auto'}
              >
                <Box as={Icon} size={18} flexShrink={0} />
                {!isCollapsed && (
                  <Text isTruncated>{t(item.label)}</Text>
                )}
              </HStack>
              {!isCollapsed && (
                <Box 
                  as={isExpanded ? ChevronDown : ChevronRight} 
                  size={14} 
                  flexShrink={0}
                  ml={2}
                  transition="transform 0.3s ease-out"
                  transform={isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)'}
                />
              )}
            </Box>
          </Tooltip>
          
          {/* 子菜单列表 - 仅在非折叠状态下且已展开时显示 */}
          {!isCollapsed && isExpanded ? (
            <VStack
              spacing={0}
              align="stretch"
              ml={4}
              pl={3}
              borderLeftWidth="1px"
              borderColor={borderColor}
              position="relative"
            >
              {item.children!.map((child, index) => (
                <Box key={child.key} position="relative">
                  {renderMenuItem(child, level + 1, item.key)}
                </Box>
              ))}
            </VStack>
          ) : null}
        </Box>
      )
    }

    // 没有子菜单的菜单项，正常显示为链接（忽略查询参数）
    const itemPath = item.path.split('?')[0] // 移除查询参数
    const itemSearch = item.path.includes('?') ? item.path.split('?')[1] : undefined
    const isActive = isPathMatch(location.pathname, itemPath)
    const tooltipTitle = isCollapsed ? t(item.label) : undefined

    // 子项使用不同的样式
    const itemBg = isChild 
      ? (isActive ? childActiveBg : 'transparent')
      : (isActive ? activeBg : 'transparent')
    const itemColor = isChild
      ? (isActive ? childActiveColor : textColor)
      : (isActive ? activeColor : textColor)
    const iconSize = isChild ? 15 : 18
    const fontSize = isChild ? '13px' : '13px'
    const py = isChild ? 2 : 2.5

    // 处理路径和查询参数
    const linkTo = itemSearch 
      ? { pathname: itemPath, search: `?${itemSearch}` }
      : itemPath

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault()
      if (itemSearch) {
        navigate({ pathname: itemPath, search: `?${itemSearch}` })
      } else {
        navigate(itemPath)
      }
    }

    const menuItem = (
      <Box
        as="div"
        onClick={handleClick}
        cursor="pointer"
        display="flex"
        alignItems="center"
        justifyContent={isCollapsed ? 'center' : 'flex-start'}
        px={isChild ? 2.5 : 3}
        py={py}
        borderRadius={isChild ? 'md' : 'lg'}
        transition="all 0.3s ease-out"
        fontSize={fontSize}
        position="relative"
        bg={itemBg}
        color={itemColor}
        transform={isActive && isChild ? 'scale(1.02)' : 'scale(1)'}
        boxShadow={isActive && !isChild ? 'md' : 'none'}
        _hover={{
          bg: isActive ? itemBg : hoverBg,
          transform: isChild ? 'scale(1.01)' : 'scale(1)',
        }}
        _active={{
          bg: isChild ? childActiveBg : activeBg,
          color: isChild ? childActiveColor : activeColor,
        }}
        mb={isChild ? 0.5 : 1}
        ml={isChild ? 0 : 0}
      >
        <Box 
          as={Icon} 
          size={iconSize} 
          flexShrink={0}
          color={isActive ? (isChild ? childActiveColor : activeColor) : textColor}
        />
        {!isCollapsed && (
          <>
            <Text
              fontWeight={isActive ? '600' : '500'}
              flex={1}
              whiteSpace="nowrap"
              ml={isChild ? 2.5 : 3}
            >
              {t(item.label)}
            </Text>
            {item.badge && (
              <Badge
                colorScheme="red"
                fontSize="10px"
                borderRadius="full"
                ml="auto"
                minW={5}
                h={5}
                display="flex"
                alignItems="center"
                justifyContent="center"
                px={1.5}
                fontWeight="600"
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

  // 移除 JS 响应式变量，完全使用 CSS 响应式属性
  
  return (
    <>
      {/* 移动端遮罩层 - 仅在移动端且展开时显示 */}
      {!isCollapsed && (
        <Box
          display={{ base: 'block', md: 'none' }}
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.500"
          zIndex={999}
          onClick={toggleCollapse}
        />
      )}
      
      <Box
        as="aside"
        bg={glassBg}
        backdropFilter="blur(24px)"
        WebkitBackdropFilter="blur(24px)"
        borderRightWidth={1}
        borderColor={borderColor}
        borderWidth="1px"
        display={{ base: isCollapsed ? 'none' : 'flex', md: 'flex' }}
        flexDirection="column"
        h="100vh"
        transition="width 0.3s ease-out, min-width 0.3s ease-out, max-width 0.3s ease-out"
        w={{ base: '280px', md: isCollapsed ? '80px' : '256px' }}
        minW={{ base: '280px', md: isCollapsed ? '80px' : '256px' }}
        maxW={{ base: '280px', md: isCollapsed ? '80px' : '256px' }}
        flexShrink={0}
        position={{ base: 'fixed', md: 'relative' }}
        top={0}
        left={0}
        zIndex={{ base: 1000, md: 10 }}
        sx={{
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
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

      {/* 用户资料 - Polished Footer Card */}
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
            <Flex 
              align="center" 
              justify="center"
              cursor="pointer"
              onClick={onOpen}
              _hover={{ opacity: 0.8 }}
              transition="opacity 0.2s"
            >
              <Avatar
                size="sm"
                name={user?.display_name || user?.username || 'User'}
                src={user?.email ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name || user.username || 'User')}&background=indigo&color=fff` : undefined}
                borderWidth="2px"
                borderColor="indigo.200"
              />
            </Flex>
          </Tooltip>
        ) : (
          <Button
            as={Box}
            w="full"
            variant="ghost"
            p={3}
            borderRadius="xl"
            bg={userCardBg}
            borderWidth="1px"
            borderColor={borderColor}
            boxShadow="sm"
            _hover={{
              bg: userCardHoverBg,
              boxShadow: 'md',
              transform: 'translateY(-1px)',
            }}
            transition="all 0.3s ease-out"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            cursor="pointer"
            onClick={onOpen}
          >
            <HStack spacing={3} align="center" flex={1} minW={0}>
              <Avatar
                size="sm"
                name={user?.display_name || user?.username || 'User'}
                src={user?.email ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name || user.username || 'User')}&background=indigo&color=fff` : undefined}
                borderWidth="2px"
                borderColor="indigo.200"
              />
              <VStack spacing={0} align="flex-start" flex={1} minW={0}>
                <Text
                  fontSize="sm"
                  fontWeight="600"
                  color={userNameColor}
                  isTruncated
                  w="full"
                >
                  {user?.display_name || user?.username || 'User'}
                </Text>
                {user?.roles && user.roles.length > 0 && (
                  <Text
                    fontSize="xs"
                    color={textColor}
                    isTruncated
                    w="full"
                  >
                    {user.roles[0] === 'ADMIN' ? '超级管理员' : user.roles[0]}
                  </Text>
                )}
              </VStack>
            </HStack>
            <Box 
              as={ChevronRightIcon} 
              size={16} 
              color={textColor} 
              flexShrink={0}
              transition="transform 0.3s ease-out"
              _groupHover={{
                transform: 'translateX(2px)',
              }}
            />
          </Button>
        )}
      </Box>

      </Box>

      {/* 个人信息抽屉 */}
      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={onClose}
        size="lg"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            {t('userInfo.title')}
          </DrawerHeader>
          <DrawerBody p={0}>
            <UserInfo />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}