/**
 * 侧边栏组件
 * 权限感知的导航菜单
 */
import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useMenu } from '@/hooks/useMenu'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'
import { useSidebar } from '@/contexts/SidebarContext'

export const Sidebar = () => {
  const menu = useMenu()
  const { t } = useTranslation()
  const location = useLocation()
  const { isCollapsed } = useSidebar()
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // 自动展开包含激活子菜单的父菜单
  useEffect(() => {
    const findActiveParent = (items: typeof menu): string[] => {
      const activeParents: string[] = []
      
      const checkItem = (item: typeof menu[0]): boolean => {
        const isActive = location.pathname === item.path || 
                        location.pathname.startsWith(item.path + '/')
        
        if (item.children) {
          const hasActiveChild = item.children.some(child => checkItem(child))
          if (hasActiveChild) {
            activeParents.push(item.key)
            return true
          }
        }
        
        return isActive
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

  const toggleExpand = (key: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const renderMenuItem = (item: (typeof menu)[0], level = 0) => {
    const isActive = location.pathname === item.path || 
                    location.pathname.startsWith(item.path + '/')
    const Icon = item.icon
    const hasChildren = item.children && item.children.length > 0
    const isExpanded = expandedItems.has(item.key)
    const isParentActive = hasChildren && item.children!.some(child => 
      location.pathname === child.path || location.pathname.startsWith(child.path + '/')
    )

    // 折叠模式下，如果有子菜单，显示 tooltip
    const tooltipTitle = isCollapsed ? t(item.label) : undefined

    return (
      <div key={item.key}>
        <div className="flex items-center">
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(item.key)}
              className={cn(
                'flex items-center justify-center px-2.5 py-1.5 rounded transition-colors text-sm relative group',
                isCollapsed ? 'w-full' : 'space-x-2 flex-1',
                (isActive || isParentActive)
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
              title={tooltipTitle}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="font-medium flex-1 text-left whitespace-nowrap">{t(item.label)}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 flex-shrink-0" />
                  )}
                </>
              )}
              {/* 折叠模式下的 tooltip */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
                  {t(item.label)}
                </div>
              )}
            </button>
          ) : (
            <Link
              to={item.path}
              className={cn(
                'flex items-center justify-center px-2.5 py-1.5 rounded transition-colors text-sm relative group',
                isCollapsed ? 'w-full' : 'space-x-2 flex-1',
                level > 0 && !isCollapsed && 'ml-4',
                isActive
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
              title={tooltipTitle}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!isCollapsed && (
                <>
                  <span className="font-medium flex-1 whitespace-nowrap">{t(item.label)}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
              {/* 折叠模式下的 tooltip */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity">
                  {t(item.label)}
                </div>
              )}
            </Link>
          )}
        </div>
        {hasChildren && isExpanded && !isCollapsed && (
          <div className="mt-0.5 space-y-0.5 ml-1.5 border-l border-gray-200 pl-1.5">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside className={cn(
      'bg-white border-r border-gray-200 flex flex-col h-full transition-all duration-300',
      isCollapsed ? 'w-16' : 'min-w-48 w-auto max-w-64'
    )}>
      <div className={cn(
        'border-b border-gray-200 transition-all',
        isCollapsed ? 'p-2' : 'p-3'
      )}>
        <div className="flex items-center justify-center">
          {isCollapsed ? (
            <div className="h-8 w-8 rounded bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 font-bold text-sm">B</span>
            </div>
          ) : (
            <img
              src="/pics/bantu/bantu_logo.png"
              alt="Bantu Logo"
              className="h-6 w-auto"
            />
          )}
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {menu.map(item => renderMenuItem(item))}
      </nav>
    </aside>
  )
}

