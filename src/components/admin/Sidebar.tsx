/**
 * 侧边栏组件
 * 权限感知的导航菜单 - 阿里云ECS风格
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
  
  // 阿里云ECS风格颜色配置
  const darkBg = '#001529' // 深色背景
  const darkHover = '#112240' // 悬停背景
  const activeBg = '#1890FF' // 选中背景（深蓝色）
  const activeColor = '#FFFFFF' // 选中文字颜色
  const textColor = 'rgba(255, 255, 255, 0.85)' // 默认文字颜色
  const textColorSecondary = 'rgba(255, 255, 255, 0.65)' // 次要文字颜色
  const childHoverBg = '#E6F7FF' // 子菜单悬停背景（淡蓝色）
  const childActiveBg = '#1890FF' // 子菜单选中背景
  const childActiveColor = '#FFFFFF' // 子菜单选中文字
  const borderColor = 'rgba(255, 255, 255, 0.1)' // 边框颜色

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
      
      // 父菜单项的样式处理逻辑 - 阿里云ECS风格（确保文字为白色）
      const parentBg = isParentDirectlyActive ? activeBg : hasActiveChild ? darkHover : 'transparent'
      const parentColor = isParentDirectlyActive ? activeColor : hasActiveChild ? activeColor : textColor
      const parentHoverBg = isParentDirectlyActive ? activeBg : hasActiveChild ? darkHover : darkHover

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
          {/* 父菜单作为分组标题，可点击折叠/展开 - 阿里云ECS风格 */}
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
              h="50px"
              display="flex"
              alignItems="center"
              justifyContent={isCollapsed ? 'center' : 'space-between'}
              fontSize="14px"
              fontWeight="500"
              color={parentColor}
              bg={parentBg}
              _hover={{ bg: parentHoverBg }}
              transition="all 0.2s"
              mb={0}
              position="relative"
            >
              {/* 左侧8px彩色竖条标识 */}
              {!isCollapsed && (
                <Box
                  position="absolute"
                  left={0}
                  top={0}
                  bottom={0}
                  w="8px"
                  bg={isParentDirectlyActive || hasActiveChild ? activeBg : 'transparent'}
                />
              )}
              <HStack 
                spacing={isCollapsed ? 0 : 3} 
                justify={isCollapsed ? 'center' : 'flex-start'} 
                flex={1} 
                minW={0}
                w={isCollapsed ? 'full' : 'auto'}
                pl={isCollapsed ? 0 : '8px'}
              >
                <Box as={Icon} size={16} flexShrink={0} color={parentColor} />
                {!isCollapsed && (
                  <Text isTruncated fontSize="14px" color={parentColor}>{t(item.label)}</Text>
                )}
              </HStack>
              {!isCollapsed && (
                <Box 
                  as={isExpanded ? ChevronDown : ChevronRight} 
                  size={14} 
                  flexShrink={0}
                  ml={2}
                  transition="transform 0.2s"
                  transform={isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)'}
                  color={parentColor}
                />
              )}
            </Box>
          </Tooltip>
          
          {/* 子菜单列表 - 仅在非折叠状态下且已展开时显示 - 阿里云ECS风格 */}
          {!isCollapsed && isExpanded ? (
            <VStack
              spacing={0}
              align="stretch"
              ml="16px"
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

    // 阿里云ECS风格样式 - 子项和一级菜单项（确保文字为白色）
    const itemBg = isChild 
      ? (isActive ? childActiveBg : 'transparent')
      : (isActive ? activeBg : 'transparent')
    const itemColor = isChild
      ? (isActive ? childActiveColor : textColor)
      : (isActive ? activeColor : textColor)
    const hoverBg = isChild ? childHoverBg : darkHover
    const iconSize = isChild ? 14 : 16
    const fontSize = '14px'
    const itemHeight = isChild ? '40px' : '50px'
    // 图标颜色：激活时使用activeColor（白色），非激活时使用textColor（白色）
    const iconColor = isActive ? activeColor : textColor

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
        px={isChild ? 4 : 3}
        h={itemHeight}
        transition="all 0.2s"
        fontSize={fontSize}
        position="relative"
        bg={itemBg}
        color={itemColor}
        _hover={{
          bg: isActive ? itemBg : hoverBg,
        }}
        _active={{
          bg: isChild ? childActiveBg : activeBg,
          color: isChild ? childActiveColor : activeColor,
        }}
        mb={0}
        ml={0}
      >
        {/* 一级菜单左侧8px彩色竖条 */}
        {!isChild && !isCollapsed && (
          <Box
            position="absolute"
            left={0}
            top={0}
            bottom={0}
            w="8px"
            bg={isActive ? activeBg : 'transparent'}
          />
        )}
        <Box 
          as={Icon} 
          size={iconSize} 
          flexShrink={0}
          color={iconColor}
        />
        {!isCollapsed && (
          <>
            <Text
              fontWeight={isActive ? '500' : '400'}
              flex={1}
              whiteSpace="nowrap"
              ml={3}
              fontSize="14px"
              color={itemColor}
            >
              {t(item.label)}
            </Text>
            {item.badge && (
              <Badge
                bg="red.500"
                color="white"
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
        bg={darkBg}
        borderRightWidth={0}
        display={{ base: isCollapsed ? 'none' : 'flex', md: 'flex' }}
        flexDirection="column"
        h="100vh"
        transition="width 0.2s ease-out, min-width 0.2s ease-out, max-width 0.2s ease-out"
        w={{ base: '240px', md: isCollapsed ? '80px' : '240px' }}
        minW={{ base: '240px', md: isCollapsed ? '80px' : '240px' }}
        maxW={{ base: '240px', md: isCollapsed ? '80px' : '240px' }}
        flexShrink={0}
        position={{ base: 'fixed', md: 'relative' }}
        top={0}
        left={0}
        zIndex={{ base: 1000, md: 10 }}
      >
      {/* 搜索框 - 阿里云ECS风格 */}
      <Box p={isCollapsed ? 2 : 3} borderBottomWidth={1} borderColor={borderColor}>
        {isCollapsed ? (
          <Tooltip label={t('common.search')} placement="right" hasArrow>
            <IconButton
              aria-label={t('common.search')}
              icon={<Search size={18} />}
              variant="ghost"
              size="sm"
              w="full"
              color={textColor}
              _hover={{ bg: darkHover }}
            />
          </Tooltip>
        ) : (
          <InputGroup size="sm">
            <InputLeftElement pointerEvents="none">
              <Search size={16} color={textColorSecondary} />
            </InputLeftElement>
            <Input
              placeholder={t('common.search')}
              value={searchValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchValue(e.target.value)}
              bg="rgba(255, 255, 255, 0.1)"
              borderColor="rgba(255, 255, 255, 0.2)"
              color={textColor}
              _placeholder={{ color: textColorSecondary }}
              _focus={{
                borderColor: activeBg,
                boxShadow: `0 0 0 2px rgba(24, 144, 255, 0.2)`,
              }}
            />
          </InputGroup>
        )}
      </Box>
      
      {/* 导航菜单 - 阿里云ECS风格 */}
      <Box
        as="nav"
        flex={1}
        overflowY="auto"
        overflowX="hidden"
        p={0}
      >
        <VStack spacing={0} align="stretch">
          {filteredMenu.map(item => renderMenuItem(item))}
        </VStack>
      </Box>

      {/* 用户资料 - 阿里云ECS风格 */}
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
              _hover={{ bg: darkHover }}
              transition="all 0.2s"
              p={2}
              borderRadius="4px"
            >
              <Avatar
                size="sm"
                name={user?.display_name || user?.username || 'User'}
                src={user?.email ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name || user.username || 'User')}&background=1890FF&color=fff` : undefined}
              />
            </Flex>
          </Tooltip>
        ) : (
          <Button
            as={Box}
            w="full"
            variant="ghost"
            p={2}
            borderRadius="4px"
            bg="transparent"
            _hover={{
              bg: darkHover,
            }}
            transition="all 0.2s"
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            cursor="pointer"
            onClick={onOpen}
          >
            <HStack spacing={2} align="center" flex={1} minW={0}>
              <Avatar
                size="sm"
                name={user?.display_name || user?.username || 'User'}
                src={user?.email ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.display_name || user.username || 'User')}&background=1890FF&color=fff` : undefined}
              />
              <VStack spacing={0} align="flex-start" flex={1} minW={0}>
                <Text
                  fontSize="14px"
                  fontWeight="500"
                  color={textColor}
                  isTruncated
                  w="full"
                >
                  {user?.display_name || user?.username || 'User'}
                </Text>
                {user?.roles && user.roles.length > 0 && (
                  <Text
                    fontSize="12px"
                    color={textColorSecondary}
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
              size={14} 
              color={textColorSecondary} 
              flexShrink={0}
              transition="transform 0.2s"
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