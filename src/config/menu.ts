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
  Truck,
  Network,
  Settings,
  Contact2,
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
    key: 'foundation',
    label: 'menu.foundation',
    icon: Building2,
    path: '/admin/foundation',
    permission: [Permission.ORG_READ, Permission.USER_READ], // 需要任一权限
    children: [
      {
        key: 'organizations',
        label: 'menu.organizations',
        icon: Building2,
        path: '/admin/foundation/organizations',
        permission: Permission.ORG_READ,
      },
      {
        key: 'users',
        label: 'menu.users',
        icon: Users,
        path: '/admin/foundation/users',
        permission: Permission.USER_READ,
      },
      {
        key: 'roles',
        label: 'menu.roles',
        icon: UserCog,
        path: '/admin/foundation/roles',
        permission: Permission.USER_READ, // 角色管理需要用户管理权限
      },
      {
        key: 'settings',
        label: 'menu.settings',
        icon: Settings,
        path: '/admin/foundation/settings',
        role: Role.ADMIN, // 仅管理员
      },
    ],
  },
  {
    key: 'customer',
    label: 'menu.customer',
    icon: Users,
    path: '/admin/customer',
    permission: Permission.CUSTOMER_READ,
    children: [
      {
        key: 'customers',
        label: 'menu.customers',
        icon: Users,
        path: '/admin/customer/list',
        permission: Permission.CUSTOMER_READ,
      },
      {
        key: 'contacts',
        label: 'menu.contacts',
        icon: Contact2,
        path: '/admin/customer/contacts',
        permission: Permission.CUSTOMER_READ,
      },
    ],
  },
  {
    key: 'order',
    label: 'menu.order',
    icon: ShoppingCart,
    path: '/admin/order',
    permission: Permission.ORDER_READ,
  },
  {
    key: 'product',
    label: 'menu.product',
    icon: Package,
    path: '/admin/product',
    permission: Permission.PRODUCT_READ,
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
    key: 'vendor',
    label: 'menu.vendor',
    icon: Truck,
    path: '/admin/vendor',
    permission: Permission.VENDOR_READ,
  },
  {
    key: 'agent',
    label: 'menu.agent',
    icon: Network,
    path: '/admin/agent',
    permission: Permission.AGENT_READ,
    role: [Role.AGENT, Role.ADMIN], // 仅代理和管理员
  },
]

