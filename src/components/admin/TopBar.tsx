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

  // 响应式配置
  const logoHeight = useBreakpointValue({ base: 6, sm: 7, md: 8 })
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
      h="56px"
      bg="white"
      borderBottom="1px"
      borderColor="var(--ali-border)"
      boxShadow="0 1px 4px rgba(0, 21, 41, 0.08)"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      px={6}
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
          color="black"
          _hover={{ bg: 'gray.100', color: 'black' }}
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
            color="black"
            _hover={{ bg: 'gray.100', color: 'black' }}
          >
            <Hide below="sm">
              <Text color="black">{currentLang === 'zh-CN' ? '中文' : 'ID'}</Text>
            </Hide>
          </MenuButton>
          <MenuList>
            <MenuItem
              icon={<span>🇨🇳</span>}
              onClick={() => handleLanguageChange('zh-CN')}
              bg={currentLang === 'zh-CN' ? 'var(--ali-primary-light)' : 'transparent'}
              color={currentLang === 'zh-CN' ? 'var(--ali-primary)' : 'inherit'}
            >
              {t('common.chinese')}
            </MenuItem>
            <MenuItem
              icon={<span>🇮🇩</span>}
              onClick={() => handleLanguageChange('id-ID')}
              bg={currentLang === 'id-ID' ? 'var(--ali-primary-light)' : 'transparent'}
              color={currentLang === 'id-ID' ? 'var(--ali-primary)' : 'inherit'}
            >
              {t('common.indonesian')}
            </MenuItem>
          </MenuList>
        </Menu>

        {/* 用户菜单 */}
        <Menu>
          <MenuButton
            color="black"
            _hover={{ bg: 'gray.100' }}
          >
            <HStack spacing={{ base: 1.5, md: 3 }} minW={0}>
              <Avatar
                size={{ base: 'xs', md: 'sm' }}
                bg="var(--ali-primary-light)"
                color="var(--ali-primary)"
                icon={<User size={useBreakpointValue({ base: 12, md: 16 })} />}
                flexShrink={0}
              />
              <Show above="sm">
                <Text 
                  fontSize={{ base: 'xs', md: 'sm' }} 
                  fontWeight="medium"
                  noOfLines={1}
                  maxW={{ base: '80px', md: '120px' }}
                  color="black"
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
              color="var(--ali-error)"
              _hover={{ bg: 'rgba(255, 77, 79, 0.1)' }}
            >
              {t('admin.logout')}
            </MenuItem>
          </MenuList>
        </Menu>
      </HStack>
    </Box>
  )
}

