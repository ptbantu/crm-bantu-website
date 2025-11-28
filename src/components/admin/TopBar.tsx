/**
 * 顶部栏组件
 * 显示用户信息、退出登录等
 */
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
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
} from '@chakra-ui/react'

export const TopBar = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isCollapsed, toggleCollapse } = useSidebar()
  const bg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

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
      h={16}
      bg={bg}
      borderBottom="1px"
      borderColor={borderColor}
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      px={6}
    >
      <HStack spacing={4}>
        {/* 侧边栏折叠按钮 */}
        <IconButton
          aria-label={isCollapsed ? t('common.sidebar.expand') : t('common.sidebar.collapse')}
          icon={<PanelLeft size={20} />}
          onClick={toggleCollapse}
          variant="ghost"
          size="md"
        />
      </HStack>

      <HStack spacing={4}>
        {/* 语言切换 */}
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<Globe size={16} />}
            variant="ghost"
            size="md"
          >
            {currentLang === 'zh-CN' ? '中文' : 'ID'}
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
            <HStack spacing={3}>
              <Avatar
                size="sm"
                bg="primary.100"
                icon={<User size={16} />}
              />
              <Text fontSize="sm" fontWeight="medium">
                {user?.display_name || user?.username || 'User'}
              </Text>
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

