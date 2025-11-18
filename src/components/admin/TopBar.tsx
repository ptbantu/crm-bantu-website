/**
 * 顶部栏组件
 * 显示用户信息、退出登录等
 */
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { LogOut, User, Globe, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/utils/cn'
import { useSidebar } from '@/contexts/SidebarContext'

export const TopBar = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { isCollapsed, toggleCollapse } = useSidebar()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang)
    setShowLangMenu(false)
  }

  const currentLang = i18n.language

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div className="flex items-center space-x-4">
        {/* 侧边栏折叠按钮 */}
        <button
          onClick={toggleCollapse}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          title={isCollapsed ? t('common.sidebar.expand') : t('common.sidebar.collapse')}
        >
          {isCollapsed ? (
            <Menu className="h-5 w-5" />
          ) : (
            <X className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="flex items-center space-x-4">
        {/* 语言切换 */}
        <div className="relative">
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Globe className="h-4 w-4" />
            <span>{currentLang === 'zh-CN' ? '中文' : 'ID'}</span>
          </button>
          {showLangMenu && (
            <div className="absolute right-0 mt-2 w-36 rounded-lg bg-white shadow-lg border border-gray-100 overflow-hidden z-50">
              <button
                onClick={() => handleLanguageChange('zh-CN')}
                className={cn(
                  'w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center space-x-2',
                  currentLang === 'zh-CN' && 'bg-primary-50 text-primary-600'
                )}
              >
                <span>🇨🇳</span>
                <span>{t('common.chinese')}</span>
              </button>
              <button
                onClick={() => handleLanguageChange('id-ID')}
                className={cn(
                  'w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center space-x-2',
                  currentLang === 'id-ID' && 'bg-primary-50 text-primary-600'
                )}
              >
                <span>🇮🇩</span>
                <span>{t('common.indonesian')}</span>
              </button>
            </div>
          )}
        </div>

        {/* 用户菜单 */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
              <User className="h-4 w-4 text-primary-600" />
            </div>
            <span className="font-medium">
              {user?.display_name || user?.username || 'User'}
            </span>
          </button>
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-100 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {user?.display_name || user?.username}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {user?.email || ''}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>{t('admin.logout')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 点击外部关闭菜单 */}
      {(showUserMenu || showLangMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false)
            setShowLangMenu(false)
          }}
        />
      )}
    </header>
  )
}

