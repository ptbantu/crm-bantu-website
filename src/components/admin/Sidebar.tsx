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

export const Sidebar = () => {
  const menu = useMenu()
  const { t } = useTranslation()
  const location = useLocation()
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

    return (
      <div key={item.key}>
        <div className="flex items-center">
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(item.key)}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors flex-1',
                (isActive || isParentActive)
                  ? 'bg-primary-50 text-primary-600'
                  : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium flex-1 text-left">{t(item.label)}</span>
              {item.badge && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              )}
            </button>
          ) : (
            <Link
              to={item.path}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors flex-1',
                level > 0 && 'ml-6',
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
          )}
        </div>
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1 ml-2 border-l border-gray-200 pl-2">
            {item.children!.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <img
            src="/pics/bantu/bantu_logo.png"
            alt="Bantu Logo"
            className="h-8 w-auto"
          />
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menu.map(item => renderMenuItem(item))}
      </nav>
    </aside>
  )
}

