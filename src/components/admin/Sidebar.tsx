/**
 * 侧边栏组件
 * 权限感知的导航菜单
 */
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMenu } from '@/hooks/useMenu'
import { cn } from '@/utils/cn'

export const Sidebar = () => {
  const menu = useMenu()
  const { t } = useTranslation()
  const location = useLocation()

  const renderMenuItem = (item: (typeof menu)[0], level = 0) => {
    const isActive = location.pathname === item.path || 
                    location.pathname.startsWith(item.path + '/')
    const Icon = item.icon
    const hasChildren = item.children && item.children.length > 0

    return (
      <div key={item.key}>
        <Link
          to={item.path}
          className={cn(
            'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
            level > 0 && 'ml-4',
            isActive
              ? 'bg-primary-50 text-primary-600'
              : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          <Icon className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium flex-1">{t(item.label)}</span>
          {item.badge && (
            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {item.badge}
            </span>
          )}
        </Link>
        {hasChildren && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">
          {t('admin.title')}
        </h1>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menu.map(item => renderMenuItem(item))}
      </nav>
    </aside>
  )
}

