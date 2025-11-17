# 后台管理页面架构设计

## 1. 整体布局结构

```
┌─────────────────────────────────────────────────────────┐
│  TopBar (顶部栏)                                        │
│  - Logo / 标题                                          │
│  - 用户信息 / 退出登录                                   │
│  - 通知 / 消息                                          │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│ Sidebar  │  Main Content (主内容区)                     │
│ (侧边栏) │  - 动态路由内容                               │
│          │  - 面包屑导航                                │
│ - 仪表盘  │                                              │
│ - 基础管理│                                              │
│ - 客户管理│                                              │
│ - 订单管理│                                              │
│ - 产品管理│                                              │
│ - 财务管理│                                              │
│ - 供应商  │                                              │
│ - 渠道代理│                                              │
│ - 系统设置│                                              │
│          │                                              │
└──────────┴──────────────────────────────────────────────┘
```

## 2. 目录结构

```
src/
├── layouts/
│   └── AdminLayout.tsx          # 后台管理布局组件
├── components/
│   ├── admin/
│   │   ├── Sidebar.tsx          # 侧边栏组件
│   │   ├── TopBar.tsx            # 顶部栏组件
│   │   ├── Breadcrumb.tsx        # 面包屑导航
│   │   └── UserMenu.tsx         # 用户菜单下拉
│   └── ... (现有组件)
├── pages/
│   ├── admin/
│   │   ├── Dashboard.tsx        # 仪表盘（已存在，需重构）
│   │   ├── foundation/
│   │   │   ├── Organizations.tsx    # 组织管理
│   │   │   ├── Users.tsx            # 用户管理
│   │   │   ├── Roles.tsx            # 角色管理
│   │   │   └── Settings.tsx         # 系统设置
│   │   ├── customer/
│   │   │   ├── Customers.tsx        # 客户列表
│   │   │   ├── CustomerDetail.tsx   # 客户详情
│   │   │   └── Contacts.tsx         # 联系人管理
│   │   ├── order/
│   │   │   ├── Orders.tsx           # 订单列表
│   │   │   └── OrderDetail.tsx     # 订单详情
│   │   ├── product/
│   │   │   ├── Products.tsx         # 产品列表
│   │   │   └── Categories.tsx      # 产品分类
│   │   ├── finance/
│   │   │   ├── Receivables.tsx      # 应收管理
│   │   │   ├── Payables.tsx         # 应付管理
│   │   │   └── Reports.tsx          # 财务报表
│   │   ├── vendor/
│   │   │   └── Vendors.tsx          # 供应商管理
│   │   └── agent/
│   │       └── Agents.tsx           # 渠道代理管理
│   └── ... (现有前台页面)
├── hooks/
│   ├── useAuth.ts                  # 认证相关 Hook
│   ├── usePermissions.ts           # 权限检查 Hook
│   └── useUser.ts                  # 用户信息 Hook
├── contexts/
│   └── AuthContext.tsx             # 认证上下文
└── utils/
    └── permissions.ts              # 权限工具函数
```

## 3. 核心组件设计

### 3.1 AdminLayout (后台布局)

**功能：**
- 提供统一的后台布局结构
- 包含侧边栏、顶部栏、主内容区
- 处理权限控制
- 处理路由守卫

**Props:**
```typescript
interface AdminLayoutProps {
  children: React.ReactNode
}
```

### 3.2 Sidebar (侧边栏)

**功能：**
- 显示导航菜单
- 根据用户权限动态显示菜单项
- 支持折叠/展开
- 高亮当前路由

**菜单结构：**
```typescript
interface MenuItem {
  key: string
  label: string
  icon: React.ComponentType
  path: string
  children?: MenuItem[]
  permission?: string[]
}
```

### 3.3 TopBar (顶部栏)

**功能：**
- 显示当前用户信息
- 退出登录
- 通知/消息中心
- 全屏切换
- 主题切换（可选）

### 3.4 路由配置

```typescript
// 后台管理路由
const adminRoutes = [
  {
    path: '/dashboard',
    element: <Dashboard />,
    meta: { title: '仪表盘', permission: [] }
  },
  {
    path: '/admin/foundation',
    children: [
      { path: 'organizations', element: <Organizations />, permission: ['ORGANIZATION:READ'] },
      { path: 'users', element: <Users />, permission: ['USER:READ'] },
      { path: 'roles', element: <Roles />, permission: ['ROLE:READ'] },
      { path: 'settings', element: <Settings />, permission: ['ADMIN'] }
    ]
  },
  // ... 其他模块路由
]
```

## 4. 功能模块规划

### 4.1 仪表盘 (Dashboard)
- 数据统计卡片（客户数、订单数、收入等）
- 图表展示（销售趋势、订单状态分布等）
- 最近活动
- 快捷操作

### 4.2 基础管理模块 (Foundation)

#### 4.2.1 组织管理
- 组织列表（树形结构）
- 组织创建/编辑/删除
- 组织详情查看
- 组织员工管理

#### 4.2.2 用户管理
- 用户列表（支持搜索、筛选）
- 用户创建/编辑/删除
- 用户角色分配
- 用户状态管理（启用/禁用）

#### 4.2.3 角色管理
- 角色列表
- 角色创建/编辑/删除
- 角色权限配置

#### 4.2.4 系统设置
- 系统参数配置
- 数据字典管理
- 操作日志查看

### 4.3 客户管理模块 (Customer)
- 客户列表（表格、搜索、筛选）
- 客户详情页
- 客户创建/编辑
- 联系人管理
- 客户跟进记录

### 4.4 订单管理模块 (Order)
- 订单列表
- 订单创建/编辑
- 订单详情
- 订单状态跟踪
- 订单分配

### 4.5 产品管理模块 (Product)
- 产品列表
- 产品创建/编辑
- 产品分类管理
- 产品定价管理

### 4.6 财务管理模块 (Finance)
- 应收管理
- 应付管理
- 财务报表
- 财务统计

### 4.7 供应商管理模块 (Vendor)
- 供应商列表
- 供应商详情
- 供应商员工管理
- 供应商任务分配

### 4.8 渠道代理模块 (Agent)
- 渠道代理列表
- 渠道客户管理
- 佣金管理
- 渠道统计

## 5. 状态管理

### 5.1 认证状态 (AuthContext)
```typescript
interface AuthState {
  user: UserInfo | null
  token: string | null
  isAuthenticated: boolean
  permissions: string[]
  roles: string[]
}

interface AuthContextValue {
  ...AuthState
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  checkPermission: (permission: string) => boolean
  checkRole: (role: string) => boolean
}
```

### 5.2 用户信息
- 从 localStorage 读取 token
- 从 API 获取用户详细信息
- 缓存用户权限和角色

## 6. 权限控制

### 6.1 路由级权限
- 使用路由守卫检查权限
- 无权限时跳转到 403 页面

### 6.2 组件级权限
- 使用 `usePermissions` Hook
- 条件渲染受保护的内容

### 6.3 按钮级权限
- 根据权限显示/隐藏操作按钮

## 7. API 集成

### 7.1 API 客户端
- 使用现有的 `api/client.ts`
- 自动添加认证 token
- 统一错误处理

### 7.2 API 服务
```typescript
// api/admin.ts
export const adminApi = {
  // 基础管理
  getOrganizations: () => get('/api/foundation/organizations'),
  createOrganization: (data) => post('/api/foundation/organizations', data),
  // ... 其他 API
}
```

## 8. UI/UX 设计原则

### 8.1 设计风格
- 简洁、专业
- 统一的颜色系统（使用 Tailwind CSS）
- 一致的间距和圆角
- 清晰的视觉层次

### 8.2 交互体验
- 加载状态提示
- 错误提示（使用 Toast）
- 确认对话框（删除等危险操作）
- 表单验证反馈

### 8.3 响应式设计
- 侧边栏在小屏幕可折叠
- 表格支持横向滚动
- 移动端适配

## 9. 开发优先级

### Phase 1: 基础架构（当前阶段）
1. ✅ 创建 AdminLayout 组件
2. ✅ 创建 Sidebar 组件
3. ✅ 创建 TopBar 组件
4. ✅ 设置路由结构
5. ✅ 实现认证上下文

### Phase 2: 核心功能
1. 重构 Dashboard 页面
2. 实现用户管理
3. 实现组织管理
4. 实现角色管理

### Phase 3: 业务功能
1. 客户管理
2. 订单管理
3. 产品管理

### Phase 4: 高级功能
1. 财务管理
2. 供应商管理
3. 渠道代理管理
4. 报表和统计

## 10. 技术栈

- **框架**: React 18 + TypeScript
- **路由**: React Router DOM v6
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **状态管理**: React Context + Hooks
- **HTTP 客户端**: 现有的 api/client.ts
- **表单处理**: React Hook Form (可选)
- **表格**: 自定义表格组件或使用库（如 TanStack Table）

## 11. 下一步行动

1. 创建 AdminLayout 组件
2. 创建 Sidebar 和 TopBar 组件
3. 设置后台路由结构
4. 实现认证上下文和权限检查
5. 重构 Dashboard 页面

