/**
 * 面包屑导航组件
 */
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, Home } from 'lucide-react'
import { useTabs } from '@/contexts/TabsContext'

export const Breadcrumb = () => {
  const location = useLocation()
  const { t } = useTranslation()
  const { tabs } = useTabs()

  const paths = location.pathname.split('/').filter(Boolean)
  
  // 如果只有一个路径（如 /dashboard），不显示面包屑
  if (paths.length <= 1) {
    return null
  }

  // 路径到翻译 key 的映射
  const pathToKeyMap: Record<string, string> = {
    'admin': 'menu.admin',
    'user-management': 'menu.user-management',
    'employee-list': 'menu.employeeList',
    'employee-management': 'menu.employeeManagement',
    'employees': 'menu.employees',
    'organizations': 'menu.organizations',
    'role-management': 'menu.roleManagement',
    'system-management': 'menu.systemManagement',
    'user-info': 'menu.userInfo',
    'system-status': 'menu.systemStatus',
    'system-logs': 'menu.systemLogs',
    'system-monitoring': 'menu.systemMonitoring',
    'customer': 'menu.customer',
    'customer-sales': 'menu.customerSales',
    'customers': 'menu.customers',
    'contacts': 'menu.contacts',
    'order': 'menu.order',
    'order-execution': 'menu.orderExecution',
    'leads': 'menu.leadManagement',
    'myLeads': 'menu.myLeads',
    'publicLeads': 'menu.publicLeads',
    'opportunities': 'menu.opportunities',
    'detail': 'leadDetail.title',
    'product': 'menu.product',
    'product-service': 'menu.productService',
    'product-management': 'menu.productManagement',
    'management': 'menu.productManagement',
    'vendor-management': 'menu.vendorManagement',
    'vendor-list': 'menu.vendorProductList',
    'category-management': 'menu.categoryManagement',
    'finance': 'menu.finance',
    'receivables': 'menu.receivables',
    'invoicing': 'menu.invoicing',
    'finance-reports': 'menu.financeReports',
    'agent': 'menu.agent',
    'dashboard': 'menu.dashboard',
  }

  const breadcrumbItems = paths.map((path, index) => {
    const isLast = index === paths.length - 1
    const pathTo = '/' + paths.slice(0, index + 1).join('/')
    
    // 检查是否是详情页面的 ID（UUID 格式）
    // UUID 格式：8-4-4-4-12 个十六进制字符
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(path)
    const isLeadDetailPath = index >= 2 && paths[index - 1] === 'detail' && paths[index - 2] === 'leads'
    const isCustomerDetailPath = index >= 2 && paths[index - 1] === 'detail' && paths[index - 2] === 'customer'
    const isOpportunityDetailPath = index >= 2 && paths[index - 1] === 'detail' && paths[index - 2] === 'opportunities'
    
    let label: string
    if (isUUID && isLeadDetailPath) {
      // 如果是线索详情页面的 ID，尝试从标签页获取标题
      const currentTab = tabs.find(tab => tab.key === location.pathname)
      const defaultTitle = t('leadDetail.title')
      if (currentTab && currentTab.title && currentTab.title !== defaultTitle && !currentTab.title.startsWith('menu.')) {
        // 如果标签页标题已更新（不是默认标题，也不是翻译 key），使用标签页标题
        label = currentTab.title
      } else {
        // 否则使用默认的"线索详情"
        label = defaultTitle
      }
    } else if (isUUID && isCustomerDetailPath) {
      // 如果是客户详情页面的 ID，尝试从标签页获取标题
      const currentTab = tabs.find(tab => tab.key === location.pathname)
      const defaultTitle = t('customerDetail.title')
      if (currentTab && currentTab.title && currentTab.title !== defaultTitle && !currentTab.title.startsWith('menu.')) {
        // 如果标签页标题已更新（不是默认标题，也不是翻译 key），使用标签页标题
        label = currentTab.title
      } else {
        // 否则使用默认的"客户详情"
        label = defaultTitle
      }
    } else if (isUUID && isOpportunityDetailPath) {
      // 如果是商机详情页面的 ID，尝试从标签页获取标题
      const currentTab = tabs.find(tab => tab.key === location.pathname)
      const defaultTitle = t('opportunityDetail.title')
      if (currentTab && currentTab.title && currentTab.title !== defaultTitle && !currentTab.title.startsWith('menu.')) {
        // 如果标签页标题已更新（不是默认标题，也不是翻译 key），使用标签页标题
        label = currentTab.title
      } else {
        // 否则使用默认的"商机详情"
        label = defaultTitle
      }
    } else if (isCustomerDetailPath && path === 'detail') {
      // 如果是客户详情路径（detail），显示"客户详情"
      label = t('customerDetail.title')
    } else if (isOpportunityDetailPath && path === 'detail') {
      // 如果是商机详情路径（detail），显示"商机详情"
      label = t('opportunityDetail.title')
    } else {
      const translationKey = pathToKeyMap[path] || `menu.${path}`
      label = t(translationKey) || path
    }

    return {
      label,
      path: pathTo,
      isLast,
    }
  })

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      <span className="text-gray-600">
        <Home className="h-4 w-4" />
      </span>
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4" />
          <span className={item.isLast ? "text-gray-900 font-medium" : "text-gray-600"}>
            {item.label}
          </span>
        </div>
      ))}
    </nav>
  )
}

