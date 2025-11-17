# 后台管理架构设计 V2.0
## 简约 CRM 框架 - 支持权限控制与多语言

## 一、设计原则

1. **简约优先**：界面简洁，功能聚焦
2. **权限驱动**：所有功能基于权限控制，不同角色看到不同内容
3. **多语言支持**：从架构层面支持 i18n，所有文本可国际化
4. **渐进式开发**：先搭建框架，再逐步完善功能

---

## 二、核心架构

### 2.1 目录结构

```
src/
├── layouts/
│   └── AdminLayout.tsx              # 后台管理布局（权限感知）
│
├── components/
│   ├── admin/
│   │   ├── Sidebar.tsx              # 侧边栏（权限过滤菜单）
│   │   ├── TopBar.tsx               # 顶部栏（用户信息、退出）
│   │   ├── Breadcrumb.tsx           # 面包屑导航
│   │   └── PermissionGuard.tsx      # 权限守卫组件
│   └── ... (现有组件)
│
├── pages/
│   └── admin/
│       ├── Dashboard.tsx            # 仪表盘
│       ├── foundation/              # 基础管理模块
│       │   ├── Organizations.tsx
│       │   ├── Users.tsx
│       │   ├── Roles.tsx
│       │   └── Settings.tsx
│       ├── customer/                 # 客户管理
│       ├── order/                    # 订单管理
│       ├── product/                  # 产品管理
│       ├── finance/                  # 财务管理
│       ├── vendor/                   # 供应商管理
│       └── agent/                    # 渠道代理
│
├── contexts/
│   ├── AuthContext.tsx              # 认证上下文（用户、角色、权限）
│   └── I18nContext.tsx              # 多语言上下文（可选）
│
├── hooks/
│   ├── useAuth.ts                   # 认证 Hook
│   ├── usePermissions.ts            # 权限检查 Hook
│   ├── useMenu.ts                   # 菜单生成 Hook（权限过滤）
│   └── useI18n.ts                   # 多语言 Hook
│
├── config/
│   ├── menu.ts                      # 菜单配置（含权限要求）
│   ├── permissions.ts               # 权限常量定义
│   └── routes.ts                    # 路由配置（含权限守卫）
│
├── utils/
│   ├── permissions.ts               # 权限工具函数
│   └── menu.ts                      # 菜单工具函数
│
└── i18n/
    ├── config.ts                    # i18n 配置（已存在）
    └── locales/
        ├── zh-CN/
        │   ├── common.json          # 通用翻译
        │   ├── admin.json           # 后台管理翻译
        │   ├── menu.json            # 菜单翻译
        │   └── permissions.json     # 权限相关翻译
        └── id-ID/
            └── ... (同上)
```

---

## 三、权限体系设计

### 3.1 角色定义

根据后端业务逻辑，系统有5个预定义角色：

```typescript
// config/permissions.ts
export enum Role {
  ADMIN = 'ADMIN',           // 系统管理员
  SALES = 'SALES',           // 内部销售
  AGENT = 'AGENT',           // 渠道代理销售
  OPERATION = 'OPERATION',   // 做单人员
  FINANCE = 'FINANCE',       // 财务人员
}

export interface UserRole {
  id: string
  code: string
  name: string
  description: string
}
```

### 3.2 权限定义

```typescript
// config/permissions.ts
export enum Permission {
  // 用户管理
  USER_CREATE = 'USER:CREATE',
  USER_READ = 'USER:READ',
  USER_UPDATE = 'USER:UPDATE',
  USER_DELETE = 'USER:DELETE',
  
  // 组织管理
  ORG_CREATE = 'ORG:CREATE',
  ORG_READ = 'ORG:READ',
  ORG_UPDATE = 'ORG:UPDATE',
  ORG_DELETE = 'ORG:DELETE',
  
  // 客户管理
  CUSTOMER_CREATE = 'CUSTOMER:CREATE',
  CUSTOMER_READ = 'CUSTOMER:READ',
  CUSTOMER_UPDATE = 'CUSTOMER:UPDATE',
  CUSTOMER_DELETE = 'CUSTOMER:DELETE',
  
  // 订单管理
  ORDER_CREATE = 'ORDER:CREATE',
  ORDER_READ = 'ORDER:READ',
  ORDER_UPDATE = 'ORDER:UPDATE',
  ORDER_DELETE = 'ORDER:DELETE',
  
  // 产品管理
  PRODUCT_CREATE = 'PRODUCT:CREATE',
  PRODUCT_READ = 'PRODUCT:READ',
  PRODUCT_UPDATE = 'PRODUCT:UPDATE',
  PRODUCT_DELETE = 'PRODUCT:DELETE',
  
  // 财务管理
  FINANCE_READ = 'FINANCE:READ',
  FINANCE_WRITE = 'FINANCE:WRITE',
  
  // 供应商管理
  VENDOR_CREATE = 'VENDOR:CREATE',
  VENDOR_READ = 'VENDOR:READ',
  VENDOR_UPDATE = 'VENDOR:UPDATE',
  
  // 渠道代理
  AGENT_CREATE = 'AGENT:CREATE',
  AGENT_READ = 'AGENT:READ',
  AGENT_UPDATE = 'AGENT:UPDATE',
}

// 角色-权限映射（后端返回，前端缓存）
export interface RolePermissionMap {
  [roleCode: string]: Permission[]
}
```

### 3.3 权限检查工具

```typescript
// utils/permissions.ts
export const checkPermission = (
  userPermissions: Permission[],
  requiredPermission: Permission | Permission[]
): boolean => {
  if (Array.isArray(requiredPermission)) {
    // 需要满足所有权限（AND）
    return requiredPermission.every(p => userPermissions.includes(p))
  }
  return userPermissions.includes(requiredPermission)
}

export const checkAnyPermission = (
  userPermissions: Permission[],
  requiredPermissions: Permission[]
): boolean => {
  // 满足任一权限即可（OR）
  return requiredPermissions.some(p => userPermissions.includes(p))
}

export const checkRole = (
  userRoles: string[],
  requiredRole: string | string[]
): boolean => {
  if (Array.isArray(requiredRole)) {
    return requiredRole.some(role => userRoles.includes(role))
  }
  return userRoles.includes(requiredRole)
}
```

---

## 四、菜单系统设计

### 4.1 菜单配置（权限感知）

```typescript
// config/menu.ts
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
  Network
} from 'lucide-react'

export interface MenuItem {
  key: string
  label: string                    // i18n key
  icon: React.ComponentType
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
        icon: Contact,
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
```

### 4.2 菜单过滤 Hook

```typescript
// hooks/useMenu.ts
import { useMemo } from 'react'
import { useAuth } from './useAuth'
import { adminMenuItems, MenuItem } from '@/config/menu'
import { checkPermission, checkRole } from '@/utils/permissions'

export const useMenu = () => {
  const { user, permissions, roles } = useAuth()

  const filteredMenu = useMemo(() => {
    const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
      return items
        .filter(item => {
          // 检查权限
          if (item.permission) {
            if (!checkPermission(permissions, item.permission)) {
              return false
            }
          }
          
          // 检查角色
          if (item.role) {
            if (!checkRole(roles, item.role)) {
              return false
            }
          }
          
          return true
        })
        .map(item => {
          // 递归过滤子菜单
          if (item.children) {
            return {
              ...item,
              children: filterMenuItems(item.children),
            }
          }
          return item
        })
        .filter(item => {
          // 如果父菜单有子菜单，但子菜单全部被过滤，则隐藏父菜单
          if (item.children && item.children.length === 0) {
            return false
          }
          return true
        })
    }

    return filterMenuItems(adminMenuItems)
  }, [permissions, roles])

  return filteredMenu
}
```

---

## 五、认证上下文设计

### 5.1 AuthContext

```typescript
// contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { UserInfo, Permission, Role } from '@/api/types'
import { getStoredToken, getStoredUser, clearStorage } from '@/utils/storage'
import { getUserInfo } from '@/api/auth'

interface AuthState {
  user: UserInfo | null
  token: string | null
  permissions: Permission[]
  roles: string[]
  isAuthenticated: boolean
  isLoading: boolean
}

interface AuthContextValue extends AuthState {
  login: (token: string, user: UserInfo) => void
  logout: () => void
  refreshUserInfo: () => Promise<void>
  checkPermission: (permission: Permission | Permission[]) => boolean
  checkRole: (role: string | string[]) => boolean
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    permissions: [],
    roles: [],
    isAuthenticated: false,
    isLoading: true,
  })

  // 初始化：从 localStorage 恢复状态
  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredToken()
      const user = getStoredUser()
      
      if (token && user) {
        try {
          // 验证 token 并获取最新用户信息
          const userInfo = await getUserInfo()
          setState({
            user: userInfo,
            token,
            permissions: userInfo.permissions || [],
            roles: userInfo.roles?.map(r => r.code) || [],
            isAuthenticated: true,
            isLoading: false,
          })
        } catch (error) {
          // Token 无效，清除状态
          clearStorage()
          setState(prev => ({ ...prev, isLoading: false }))
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }

    initAuth()
  }, [])

  const login = (token: string, user: UserInfo) => {
    setState({
      user,
      token,
      permissions: user.permissions || [],
      roles: user.roles?.map(r => r.code) || [],
      isAuthenticated: true,
      isLoading: false,
    })
  }

  const logout = () => {
    clearStorage()
    setState({
      user: null,
      token: null,
      permissions: [],
      roles: [],
      isAuthenticated: false,
      isLoading: false,
    })
  }

  const refreshUserInfo = async () => {
    if (!state.token) return
    
    try {
      const userInfo = await getUserInfo()
      setState(prev => ({
        ...prev,
        user: userInfo,
        permissions: userInfo.permissions || [],
        roles: userInfo.roles?.map(r => r.code) || [],
      }))
    } catch (error) {
      logout()
    }
  }

  const checkPermission = (permission: Permission | Permission[]): boolean => {
    return checkPermission(state.permissions, permission)
  }

  const checkRole = (role: string | string[]): boolean => {
    return checkRole(state.roles, role)
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        refreshUserInfo,
        checkPermission,
        checkRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

---

## 六、多语言支持设计

### 6.1 i18n 配置增强

```typescript
// i18n/config.ts (更新)
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import zhCN from './locales/zh-CN'
import idID from './locales/id-ID'

// 从 localStorage 读取用户语言偏好
const getInitialLanguage = () => {
  const stored = localStorage.getItem('i18n_language')
  if (stored && (stored === 'zh-CN' || stored === 'id-ID')) {
    return stored
  }
  // 默认根据浏览器语言
  const browserLang = navigator.language
  return browserLang.startsWith('zh') ? 'zh-CN' : 'id-ID'
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': zhCN,
      'id-ID': idID,
    },
    lng: getInitialLanguage(),
    fallbackLng: 'zh-CN',
    interpolation: {
      escapeValue: false,
    },
  })

// 监听语言变化，保存到 localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18n_language', lng)
})

export default i18n
```

### 6.2 多语言资源结构

```json
// i18n/locales/zh-CN/admin.json
{
  "title": "后台管理",
  "dashboard": {
    "welcome": "欢迎回来",
    "title": "仪表盘"
  },
  "common": {
    "create": "创建",
    "edit": "编辑",
    "delete": "删除",
    "save": "保存",
    "cancel": "取消",
    "search": "搜索",
    "filter": "筛选"
  }
}

// i18n/locales/zh-CN/menu.json
{
  "dashboard": "仪表盘",
  "foundation": "基础管理",
  "organizations": "组织管理",
  "users": "用户管理",
  "roles": "角色管理",
  "settings": "系统设置",
  "customer": "客户管理",
  "customers": "客户列表",
  "contacts": "联系人",
  "order": "订单管理",
  "product": "产品管理",
  "finance": "财务管理",
  "vendor": "供应商管理",
  "agent": "渠道代理"
}

// i18n/locales/id-ID/menu.json (印尼语)
{
  "dashboard": "Dashboard",
  "foundation": "Manajemen Dasar",
  "organizations": "Manajemen Organisasi",
  "users": "Manajemen Pengguna",
  ...
}
```

---

## 七、路由守卫设计

### 7.1 权限守卫组件

```typescript
// components/admin/PermissionGuard.tsx
import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Permission } from '@/config/permissions'

interface PermissionGuardProps {
  children: ReactNode
  permission?: Permission | Permission[]
  role?: string | string[]
  fallback?: ReactNode
}

export const PermissionGuard = ({
  children,
  permission,
  role,
  fallback = <Navigate to="/login" replace />,
}: PermissionGuardProps) => {
  const { isAuthenticated, checkPermission, checkRole } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (permission && !checkPermission(permission)) {
    return fallback || <Navigate to="/dashboard" replace />
  }

  if (role && !checkRole(role)) {
    return fallback || <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
```

### 7.2 路由配置

```typescript
// config/routes.ts
import { RouteObject } from 'react-router-dom'
import { PermissionGuard } from '@/components/admin/PermissionGuard'
import { Permission } from './permissions'
import Dashboard from '@/pages/admin/Dashboard'
import Organizations from '@/pages/admin/foundation/Organizations'
import Users from '@/pages/admin/foundation/Users'
// ... 其他页面

export const adminRoutes: RouteObject[] = [
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/admin/foundation',
    children: [
      {
        path: 'organizations',
        element: (
          <PermissionGuard permission={Permission.ORG_READ}>
            <Organizations />
          </PermissionGuard>
        ),
      },
      {
        path: 'users',
        element: (
          <PermissionGuard permission={Permission.USER_READ}>
            <Users />
          </PermissionGuard>
        ),
      },
    ],
  },
  // ... 其他路由
]
```

---

## 八、布局组件设计

### 8.1 AdminLayout

```typescript
// layouts/AdminLayout.tsx
import { ReactNode } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Navigate } from 'react-router-dom'
import Sidebar from '@/components/admin/Sidebar'
import TopBar from '@/components/admin/TopBar'
import Breadcrumb from '@/components/admin/Breadcrumb'

interface AdminLayoutProps {
  children: ReactNode
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-6">
            <Breadcrumb />
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 8.2 Sidebar（权限过滤）

```typescript
// components/admin/Sidebar.tsx
import { useMenu } from '@/hooks/useMenu'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/utils/cn'

export const Sidebar = () => {
  const menu = useMenu()
  const { t } = useTranslation()
  const location = useLocation()

  const renderMenuItem = (item: MenuItem) => {
    const isActive = location.pathname.startsWith(item.path)
    const Icon = item.icon

    return (
      <div key={item.key}>
        <Link
          to={item.path}
          className={cn(
            'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
            isActive
              ? 'bg-primary-50 text-primary-600'
              : 'text-gray-600 hover:bg-gray-100'
          )}
        >
          <Icon className="h-5 w-5" />
          <span className="font-medium">{t(item.label)}</span>
          {item.badge && (
            <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {item.badge}
            </span>
          )}
        </Link>
        {item.children && item.children.length > 0 && (
          <div className="ml-8 mt-2 space-y-1">
            {item.children.map(renderMenuItem)}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">
          {t('admin.title')}
        </h1>
      </div>
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menu.map(renderMenuItem)}
      </nav>
    </aside>
  )
}
```

---

## 九、开发优先级

### Phase 1: 基础框架（当前）
1. ✅ 创建 AuthContext 和 useAuth Hook
2. ✅ 创建权限工具函数
3. ✅ 创建菜单配置和 useMenu Hook
4. ✅ 创建 AdminLayout 组件
5. ✅ 创建 Sidebar 组件（权限过滤）
6. ✅ 创建 TopBar 组件
7. ✅ 设置路由守卫
8. ✅ 完善 i18n 配置

### Phase 2: 核心功能
1. 重构 Dashboard 页面
2. 实现用户管理页面
3. 实现组织管理页面
4. 实现角色管理页面

### Phase 3: 业务功能
1. 客户管理
2. 订单管理
3. 产品管理

---

## 十、技术要点

1. **权限检查**：所有菜单项、路由、按钮都基于权限控制
2. **多语言**：所有文本使用 i18n，支持中英文切换
3. **类型安全**：使用 TypeScript 确保类型安全
4. **响应式**：使用 Tailwind CSS 实现响应式设计
5. **状态管理**：使用 Context API + Hooks，避免过度设计

---

## 十一、下一步行动

1. 创建 AuthContext 和认证相关 Hook
2. 创建权限配置和工具函数
3. 创建菜单配置和菜单过滤 Hook
4. 创建 AdminLayout、Sidebar、TopBar 组件
5. 更新路由配置，集成权限守卫
6. 完善多语言资源文件

