/**
 * 顶部栏组件
 * 显示 Logo、用户信息、退出登录等
 */
import { useTranslation } from 'react-i18next'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { LogOut, User, Globe, PanelLeft } from 'lucide-react'
import { useSidebar } from '@/contexts/SidebarContext'
import {
  Box,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  Text,
  useColorModeValue,
  Image,
  Flex,
  useBreakpointValue,
  Show,
  Hide,
} from '@chakra-ui/react'

export const TopBar = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isCollapsed, toggleCollapse } = useSidebar()
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // 响应式配置
  const logoHeight = useBreakpointValue({ base: 6, sm: 7, md: 8 })
  const headerPadding = useBreakpointValue({ base: 3, sm: 4, md: 6 })
  const spacing = useBreakpointValue({ base: 2, sm: 3, md: 4 })
  const iconSize = useBreakpointValue({ base: 16, md: 20 })

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang)
  }

  const currentLang = i18n.language

  return (
    <Box
      as="header"
      h={{ base: 14, md: 16 }}
      bg={bg}
      borderBottom="1px"
      borderColor={borderColor}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      px={headerPadding}
      position="sticky"
      top={0}
      zIndex={100}
      minW={0}
    >
      <HStack spacing={spacing} flex={1} minW={0}>
        {/* 侧边栏折叠按钮 */}
        <IconButton
          aria-label={isCollapsed ? t('common.sidebar.expand') : t('common.sidebar.collapse')}
          icon={<PanelLeft size={iconSize} />}
          onClick={toggleCollapse}
          variant="ghost"
          size={{ base: 'sm', md: 'md' }}
          flexShrink={0}
        />
        
        {/* Logo */}
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
          <Image
            src="/pics/bantu/bantu_logo_blue.png"
            alt="Bantu Logo"
            h={logoHeight}
            w="auto"
            objectFit="contain"
            maxW={{ base: '120px', sm: '140px', md: 'none' }}
          />
        </Link>
      </HStack>

      <HStack spacing={spacing} flexShrink={0}>
        {/* 语言切换 */}
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<Globe size={useBreakpointValue({ base: 14, md: 16 })} />}
            variant="ghost"
            size={{ base: 'sm', md: 'md' }}
            aria-label={t('common.language')}
          >
            <Hide below="sm">
              {currentLang === 'zh-CN' ? '中文' : 'ID'}
            </Hide>
          </MenuButton>
          <MenuList>
            <MenuItem
              icon={<span>🇨🇳</span>}
              onClick={() => handleLanguageChange('zh-CN')}
              bg={currentLang === 'zh-CN' ? 'primary.50' : 'transparent'}
              color={currentLang === 'zh-CN' ? 'primary.600' : 'inherit'}
            >
              {t('common.chinese')}
            </MenuItem>
            <MenuItem
              icon={<span>🇮🇩</span>}
              onClick={() => handleLanguageChange('id-ID')}
              bg={currentLang === 'id-ID' ? 'primary.50' : 'transparent'}
              color={currentLang === 'id-ID' ? 'primary.600' : 'inherit'}
            >
              {t('common.indonesian')}
            </MenuItem>
          </MenuList>
        </Menu>

        {/* 用户菜单 */}
        <Menu>
          <MenuButton>
            <HStack spacing={{ base: 1.5, md: 3 }} minW={0}>
              <Avatar
                size={{ base: 'xs', md: 'sm' }}
                bg="primary.100"
                icon={<User size={useBreakpointValue({ base: 12, md: 16 })} />}
                flexShrink={0}
              />
              <Show above="sm">
                <Text 
                  fontSize={{ base: 'xs', md: 'sm' }} 
                  fontWeight="medium"
                  noOfLines={1}
                  maxW={{ base: '80px', md: '120px' }}
                >
                  {user?.display_name || user?.username || 'User'}
                </Text>
              </Show>
            </HStack>
          </MenuButton>
          <MenuList>
            <Box px={4} py={3} borderBottom="1px" borderColor="gray.200">
              <Text fontSize="sm" fontWeight="medium">
                {user?.display_name || user?.username}
              </Text>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {user?.email || ''}
              </Text>
            </Box>
            <MenuItem
              icon={<LogOut size={16} />}
              onClick={handleLogout}
              color="red.600"
              _hover={{ bg: 'red.50' }}
            >
              {t('admin.logout')}
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Box>
  )
}

