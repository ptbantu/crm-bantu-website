/**
 * 菜单配置
 * 定义后台管理系统的所有菜单项，包含权限要求
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
  Network,
  Settings,
  Contact2,
  User,
  Activity,
  Folder,
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
  {
    key: 'dashboard',
    label: 'menu.dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    // 所有登录用户都可以访问
  },
  {
    key: 'user-management',
    label: 'menu.userManagement',
    icon: Users,
    path: '/admin/user-management',
    role: Role.ADMIN, // 仅管理员可见
    children: [
      {
        key: 'employeeList',
        label: 'menu.employeeList',
        icon: Users,
        path: '/admin/user-management/employee-list',
        role: Role.ADMIN,
      },
      {
        key: 'employeeManagement',
        label: 'menu.employeeManagement',
        icon: UserCog,
        path: '/admin/user-management/employee-management',
        role: Role.ADMIN,
      },
      {
        key: 'organizations',
        label: 'menu.organizations',
        icon: Building2,
        path: '/admin/user-management/organizations',
        role: Role.ADMIN,
      },
    ],
  },
  {
    key: 'customer',
    label: 'menu.customer',
    icon: Users,
    path: '/admin/customer',
    role: Role.ADMIN, // 仅管理员可见
    children: [
      {
        key: 'customers',
        label: 'menu.customers',
        icon: Users,
        path: '/admin/customer/list',
        role: Role.ADMIN,
      },
      {
        key: 'contacts',
        label: 'menu.contactList',
        icon: Contact2,
        path: '/admin/customer/contacts',
        role: Role.ADMIN,
      },
    ],
  },
  {
    key: 'order',
    label: 'menu.businessPlatform',
    icon: ShoppingCart,
    path: '/admin/order',
    role: Role.ADMIN, // 仅管理员可见
    children: [
      {
        key: 'orderList',
        label: 'menu.serviceList',
        icon: ShoppingCart,
        path: '/admin/order/list',
        role: Role.ADMIN,
      },
    ],
  },
  {
    key: 'product',
    label: 'menu.product',
    icon: Package,
    path: '/admin/product',
    role: Role.ADMIN, // 仅管理员可见
    children: [
      {
        key: 'productManagement',
        label: 'menu.productManagement',
        icon: Package,
        path: '/admin/product/management',
        role: Role.ADMIN,
      },
      {
        key: 'vendorProductList',
        label: 'menu.vendorProductList',
        icon: Building2,
        path: '/admin/product/vendor-list',
        role: Role.ADMIN,
      },
      {
        key: 'categoryManagement',
        label: 'menu.categoryManagement',
        icon: Folder,
        path: '/admin/product/category-management',
        role: Role.ADMIN,
      },
    ],
  },
  {
    key: 'finance',
    label: 'menu.finance',
    icon: DollarSign,
    path: '/admin/finance',
    permission: Permission.FINANCE_READ,
    role: [Role.FINANCE, Role.ADMIN], // 仅财务和管理员
  },
  {
    key: 'agent',
    label: 'menu.agent',
    icon: Network,
    path: '/admin/agent',
    permission: Permission.AGENT_READ,
    role: [Role.AGENT, Role.ADMIN], // 仅代理和管理员
  },
  {
    key: 'system-management',
    label: 'menu.systemManagement',
    icon: Settings,
    path: '/admin/system-management',
    role: Role.ADMIN, // 仅管理员可见
    children: [
      {
        key: 'userInfo',
        label: 'menu.userInfo',
        icon: User,
        path: '/admin/system-management/user-info',
        role: Role.ADMIN,
      },
      {
        key: 'systemStatus',
        label: 'menu.systemStatus',
        icon: Activity,
        path: '/admin/system-management/system-status',
        role: Role.ADMIN,
      },
    ],
  },
]

