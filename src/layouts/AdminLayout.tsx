/**
 * 后台管理布局组件
 * 提供统一的布局结构：侧边栏 + 顶部栏 + 主内容区 + 标签页
 */
import { ReactNode, useEffect, useCallback } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Sidebar } from '@/components/admin/Sidebar'
import { TopBar } from '@/components/admin/TopBar'
import { Breadcrumb } from '@/components/admin/Breadcrumb'
import { Tabs } from '@/components/admin/Tabs'
import { SidebarProvider } from '@/contexts/SidebarContext'
import { TabsProvider, useTabs } from '@/contexts/TabsContext'
import { useTranslation } from 'react-i18next'
import { useMenu } from '@/hooks/useMenu'
import { ComponentType } from 'react'

interface AdminLayoutContentProps {
  children: ReactNode
}

const AdminLayoutContent = ({ children }: AdminLayoutContentProps) => {
  const location = useLocation()
  const { addTab } = useTabs()
  const { t } = useTranslation()
  const menu = useMenu()

  // 根据路径查找菜单项（包括图标）
  const findMenuItemByPath = useCallback((path: string): typeof menu[0] | null => {
    const findInMenu = (items: typeof menu): typeof menu[0] | null => {
      for (const item of items) {
        // 精确匹配
        if (item.path === path) {
          return item
        }
        // 递归查找子菜单
        if (item.children) {
          const found = findInMenu(item.children)
          if (found) return found
        }
      }
      return null
    }

    return findInMenu(menu)
  }, [menu])

  // 根据路径获取页面标题和图标
  const getPageInfo = useCallback((path: string): { title: string; icon?: ComponentType<{ className?: string }> } => {
    // 处理动态路由（如订单详情）- 使用订单列表的图标
    if (path.startsWith('/admin/order/detail/')) {
      const orderListMenuItem = findMenuItemByPath('/admin/order/list')
      return {
        title: t('orderDetail.title'),
        icon: orderListMenuItem?.icon,
      }
    }

    // 处理线索详情页面 - 初始标题为"线索详情"，后续会在页面加载后更新为线索名称
    if (path.startsWith('/admin/leads/detail/')) {
      const leadListMenuItem = findMenuItemByPath('/admin/leads')
      return {
        title: t('leadDetail.title'),
        icon: leadListMenuItem?.icon,
      }
    }

    // 处理客户详情页面 - 初始标题为"客户详情"，后续会在页面加载后更新为客户名称
    if (path.startsWith('/admin/customer/detail/')) {
      const customerListMenuItem = findMenuItemByPath('/admin/customer/list')
      return {
        title: t('customerDetail.title'),
        icon: customerListMenuItem?.icon,
      }
    }

    const menuItem = findMenuItemByPath(path)
    
    if (menuItem) {
      return {
        title: t(menuItem.label),
        icon: menuItem.icon,
      }
    }

    // 如果没有找到菜单项，使用默认标题
    const pathToTitleMap: Record<string, string> = {
      '/dashboard': 'menu.dashboard',
      '/admin/user-management/employee-list': 'menu.employeeList',
      '/admin/user-management/employee-management': 'menu.employeeManagement',
      '/admin/user-management/organizations': 'menu.organizations',
      '/admin/user-management/role-management': 'menu.roleManagement',
      '/admin/customer/list': 'menu.customers',
      '/admin/customer/contacts': 'menu.contactList',
      '/admin/order/list': 'menu.serviceList',
      '/admin/product/management': 'menu.productManagement',
      '/admin/product/vendor-list': 'menu.vendorProductList',
      '/admin/product/category-management': 'menu.categoryManagement',
      '/admin/system-management/user-info': 'menu.userInfo',
      '/admin/system-management/system-status': 'menu.systemStatus',
      '/admin/system-management/system-logs': 'menu.systemLogs',
    }

    return {
      title: t(pathToTitleMap[path] || '页面'),
      icon: undefined,
    }
  }, [findMenuItemByPath, t])

  // 监听路由变化，自动添加标签页
  useEffect(() => {
    const currentPath = location.pathname
    // 排除 dashboard 和登录页
    if (currentPath !== '/dashboard' && currentPath.startsWith('/admin')) {
      const pageInfo = getPageInfo(currentPath)
      addTab(currentPath, pageInfo.title, currentPath, pageInfo.icon)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0 w-full">
        <TopBar />
        <Tabs />
        <div className="flex-1 overflow-y-auto overflow-x-hidden w-full">
          <div className="w-full px-2 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 max-w-full box-border">
            <Breadcrumb />
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

interface AdminLayoutProps {
  children: ReactNode
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <SidebarProvider>
      <TabsProvider>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </TabsProvider>
    </SidebarProvider>
  )
}

