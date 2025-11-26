/**
 * 菜单配置
 * 定义后台管理系统的所有菜单项，包含权限要求
 * 根据 bar.md 优化方案重新组织
 */
import { Permission, Role } from './permissions'
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCog,
  ShoppingCart,
  Package,
  DollarSign,
  Settings,
  Contact2,
  User,
  Activity,
  Folder,
  Shield,
  FileText,
  Target,
  TrendingUp,
  FileCheck,
  BarChart3,
  Receipt,
  CreditCard,
  FileText as InvoiceIcon,
  Globe,
} from 'lucide-react'
import { ComponentType } from 'react'

export interface MenuItem {
  key: string
  label: string                    // i18n key
  icon: ComponentType
  path: string
  permission?: Permission | Permission[]  // 所需权限
  role?: Role | Role[]             // 所需角色（可选，更粗粒度）
  children?: MenuItem[]
  badge?: number                   // 徽章数字（如未读消息数）
}

export const adminMenuItems: MenuItem[] = [
  // 1. 仪表盘 - 所有角色
  {
    key: 'dashboard',
    label: 'menu.dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    // 所有登录用户都可以访问
  },
  
  // 2. 客户与销售 - 销售、管理员
  {
    key: 'customer-sales',
    label: 'menu.customerSales',
    icon: Users,
    path: '/admin/customer-sales',
    role: [Role.SALES, Role.ADMIN],
    children: [
      {
        key: 'customers',
        label: 'menu.customers',
        icon: Users,
        path: '/admin/customer/list',
        role: [Role.SALES, Role.ADMIN],
      },
      {
        key: 'contacts',
        label: 'menu.contactList',
        icon: Contact2,
        path: '/admin/customer/contacts',
        role: [Role.SALES, Role.ADMIN],
      },
      {
        key: 'myLeads',
        label: 'menu.myLeads',
        icon: Target,
        path: '/admin/leads/list?filter=my',
        role: [Role.SALES, Role.ADMIN],
      },
      {
        key: 'publicLeads',
        label: 'menu.publicLeads',
        icon: Globe,
        path: '/admin/leads/list?filter=public',
        role: [Role.SALES, Role.ADMIN],
      },
      {
        key: 'opportunities',
        label: 'menu.opportunities',
        icon: TrendingUp,
        path: '/admin/opportunities/list',
        role: [Role.SALES, Role.ADMIN],
      },
    ],
  },
  
  // 3. 订单执行 - 中台执行、销售、管理员
  {
    key: 'order-execution',
    label: 'menu.orderExecution',
    icon: ShoppingCart,
    path: '/admin/order-execution',
    role: [Role.OPERATION, Role.SALES, Role.ADMIN],
    children: [
      {
        key: 'orderList',
        label: 'menu.orderList',
        icon: ShoppingCart,
        path: '/admin/order/list',
        role: [Role.OPERATION, Role.SALES, Role.ADMIN],
      },
      {
        key: 'serviceManagement',
        label: 'menu.serviceManagement',
        icon: FileCheck,
        path: '/admin/order/services',
        role: [Role.OPERATION, Role.ADMIN],
      },
    ],
  },
  
  // 4. 产品服务 - 中台执行、管理员
  {
    key: 'product-service',
    label: 'menu.productService',
    icon: Package,
    path: '/admin/product-service',
    role: [Role.OPERATION, Role.ADMIN],
    children: [
      {
        key: 'productManagement',
        label: 'menu.productManagement',
        icon: Package,
        path: '/admin/product/management',
        role: [Role.OPERATION, Role.ADMIN],
      },
      {
        key: 'serviceCatalog',
        label: 'menu.serviceCatalog',
        icon: Folder,
        path: '/admin/product/catalog',
        role: [Role.OPERATION, Role.ADMIN],
      },
      {
        key: 'vendorManagement',
        label: 'menu.vendorManagement',
        icon: Building2,
        path: '/admin/product/vendor-list',
        role: [Role.OPERATION, Role.ADMIN],
      },
      {
        key: 'categoryManagement',
        label: 'menu.categoryManagement',
        icon: Folder,
        path: '/admin/product/category-management',
        role: [Role.OPERATION, Role.ADMIN],
      },
    ],
  },
  
  // 5. 财务管理 - 财务、销售、管理员
  {
    key: 'finance',
    label: 'menu.finance',
    icon: DollarSign,
    path: '/admin/finance',
    role: [Role.FINANCE, Role.SALES, Role.ADMIN],
    permission: Permission.FINANCE_READ,
    children: [
      {
        key: 'receivables',
        label: 'menu.receivables',
        icon: CreditCard,
        path: '/admin/finance/receivables',
        role: [Role.FINANCE, Role.SALES, Role.ADMIN],
        badge: 0, // 待收款数量，可以从API获取
      },
      {
        key: 'invoicing',
        label: 'menu.invoicing',
        icon: InvoiceIcon,
        path: '/admin/finance/invoicing',
        role: [Role.FINANCE, Role.ADMIN],
      },
      {
        key: 'financeReports',
        label: 'menu.financeReports',
        icon: BarChart3,
        path: '/admin/finance/reports',
        role: [Role.FINANCE, Role.ADMIN],
      },
    ],
  },
  
  // 6. 系统管理 - 仅管理员
  {
    key: 'system-management',
    label: 'menu.systemManagement',
    icon: Settings,
    path: '/admin/system-management',
    role: Role.ADMIN,
    children: [
      {
        key: 'userManagement',
        label: 'menu.userManagement',
        icon: Users,
        path: '/admin/system-management/users',
        role: Role.ADMIN,
        children: [
          {
            key: 'employeeManagement',
            label: 'menu.employeeManagement',
            icon: UserCog,
            path: '/admin/user-management/employee-management',
            role: Role.ADMIN,
          },
          {
            key: 'roleManagement',
            label: 'menu.roleManagement',
            icon: Shield,
            path: '/admin/user-management/role-management',
            role: Role.ADMIN,
          },
        ],
      },
      {
        key: 'organizations',
        label: 'menu.organizations',
        icon: Building2,
        path: '/admin/user-management/organizations',
        role: Role.ADMIN,
      },
      {
        key: 'systemMonitoring',
        label: 'menu.systemMonitoring',
        icon: Activity,
        path: '/admin/system-management/system-status',
        role: Role.ADMIN,
      },
      {
        key: 'systemLogs',
        label: 'menu.systemLogs',
        icon: FileText,
        path: '/admin/system-management/system-logs',
        role: Role.ADMIN,
      },
    ],
  },
]

