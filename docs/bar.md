# 🎯 CRM系统导航栏优化方案

基于您的角色需求和现有菜单结构，我为您设计了一套优化的导航栏布局方案。

## 📊 角色权限分析

### 用户角色定义
```javascript
const ROLES = {
  ADMIN: 'admin',           // 超级管理员
  SALES: 'sales',           // 销售团队
  OPERATION: 'operation',   // 中台执行
  LEGAL: 'legal',           // 法务
  FINANCE: 'finance'        // 财务
};
```

## 🎨 优化后的导航栏结构

### 1. **仪表盘 (Dashboard)** - 所有角色
```
📊 仪表盘
├── 我的工作台 (个人数据)
├── 团队看板 (团队数据，销售/管理员可见)
└── 业务概览 (关键指标)
```

### 2. **客户与销售** - 销售、管理员
```
👥 客户与销售
├── 客户列表
├── 联系人管理
├── 线索池
│   ├── 我的线索
│   ├── 公海线索
│   └── 线索分析
└── 商机管理
    ├── 销售漏斗
    ├── 跟进记录
    └── 业绩报表
```

### 3. **订单执行** - 中台执行、销售、管理员
```
📦 订单执行
├── 订单列表
│   ├── 我的订单
│   ├── 团队订单
│   └── 全部订单 (管理员)
├── 服务管理
│   ├── 服务列表
│   ├── 执行进度
│   └── 服务报告
└── 合同管理
    ├── 合同列表
    └── 合同审批 (法务可见)
```

### 4. **产品服务** - 中台执行、管理员
```
🛍️ 产品服务
├── 产品管理
├── 服务目录
├── 供应商管理
└── 分类管理
```

### 5. **财务管理** - 财务、销售、管理员
```
💰 财务管理
├── 应收管理
│   ├── 收款计划
│   ├── 催款提醒
│   └── 收款记录
├── 开票管理
│   ├── 开票申请
│   ├── 开票记录
│   └── 发票状态
└── 财务报表
    ├── 销售业绩
    ├── 回款分析
    └── 利润报表
```

### 6. **系统管理** - 仅管理员
```
⚙️ 系统管理
├── 用户管理
│   ├── 员工管理
│   └── 角色权限
├── 组织架构
├── 系统监控
└── 操作日志
```

## 🔧 具体实现方案

### 1. 动态菜单配置

```typescript
// types/menu.ts
interface MenuItem {
  key: string;
  title: string;
  path?: string;
  icon: string;
  roles: string[];
  children?: MenuItem[];
  badge?: number; // 用于显示待办数量
}

// config/menus.ts
export const menuConfig: MenuItem[] = [
  {
    key: 'dashboard',
    title: '仪表盘',
    path: '/dashboard',
    icon: '📊',
    roles: ['admin', 'sales', 'operation', 'legal', 'finance']
  },
  {
    key: 'customer-sales',
    title: '客户与销售',
    icon: '👥',
    roles: ['admin', 'sales'],
    children: [
      {
        key: 'customer-list',
        title: '客户列表',
        path: '/customer/list',
        icon: '👤',
        roles: ['admin', 'sales']
      },
      {
        key: 'leads',
        title: '线索管理',
        icon: '🎯',
        roles: ['admin', 'sales'],
        children: [
          {
            key: 'my-leads',
            title: '我的线索',
            path: '/leads/my',
            icon: '📋',
            roles: ['admin', 'sales']
          },
          {
            key: 'public-leads',
            title: '公海线索',
            path: '/leads/public',
            icon: '🌊',
            roles: ['admin', 'sales']
          }
        ]
      }
    ]
  },
  {
    key: 'order-execution',
    title: '订单执行',
    icon: '📦',
    roles: ['admin', 'sales', 'operation'],
    children: [
      {
        key: 'order-list',
        title: '订单列表',
        path: '/orders',
        icon: '📄',
        roles: ['admin', 'sales', 'operation']
      },
      {
        key: 'service-management',
        title: '服务管理',
        path: '/services',
        icon: '🛠️',
        roles: ['admin', 'operation']
      }
    ]
  },
  {
    key: 'finance',
    title: '财务管理',
    icon: '💰',
    roles: ['admin', 'finance', 'sales'],
    children: [
      {
        key: 'receivables',
        title: '应收管理',
        path: '/finance/receivables',
        icon: '💳',
        roles: ['admin', 'finance', 'sales'],
        badge: 5 // 待收款数量
      },
      {
        key: 'invoicing',
        title: '开票管理',
        path: '/finance/invoicing',
        icon: '🧾',
        roles: ['admin', 'finance']
      }
    ]
  },
  {
    key: 'system',
    title: '系统管理',
    icon: '⚙️',
    roles: ['admin'],
    children: [
      {
        key: 'user-management',
        title: '用户管理',
        path: '/admin/users',
        icon: '👥',
        roles: ['admin']
      },
      {
        key: 'system-logs',
        title: '系统日志',
        path: '/admin/logs',
        icon: '📝',
        roles: ['admin']
      }
    ]
  }
];
```

### 2. 角色过滤Hook

```typescript
// hooks/useMenu.ts
import { useAuth } from '../contexts/AuthContext';
import { menuConfig } from '../config/menus';

export const useMenu = () => {
  const { currentUser } = useAuth();
  
  const filterMenuByRole = (menuItems: MenuItem[], userRoles: string[]): MenuItem[] => {
    return menuItems.filter(item => {
      // 检查是否有权限访问该菜单
      const hasAccess = item.roles.some(role => userRoles.includes(role));
      
      if (!hasAccess) return false;
      
      // 递归过滤子菜单
      if (item.children) {
        const filteredChildren = filterMenuByRole(item.children, userRoles);
        return filteredChildren.length > 0;
      }
      
      return true;
    }).map(item => ({
      ...item,
      children: item.children ? filterMenuByRole(item.children, userRoles) : undefined
    }));
  };
  
  const userMenu = filterMenuByRole(menuConfig, currentUser?.roles || []);
  
  return { userMenu };
};
```

### 3. 导航栏组件

```tsx
// components/AppSidebar.tsx
import React from 'react';
import { Layout, Menu } from 'antd';
import { useMenu } from '../hooks/useMenu';
import { useLocation, useNavigate } from 'react-router-dom';

const { Sider } = Layout;

export const AppSidebar: React.FC = () => {
  const { userMenu } = useMenu();
  const location = useLocation();
  const navigate = useNavigate();
  
  // 扁平化菜单用于查找当前选中的菜单项
  const flattenMenu = (menus: MenuItem[]): MenuItem[] => {
    return menus.reduce<MenuItem[]>((acc, item) => {
      acc.push(item);
      if (item.children) {
        acc.push(...flattenMenu(item.children));
      }
      return acc;
    }, []);
  };
  
  const flatMenu = flattenMenu(userMenu);
  const currentMenu = flatMenu.find(item => item.path === location.pathname);
  
  const renderMenuItems = (menus: MenuItem[]): any[] => {
    return menus.map(menu => ({
      key: menu.key,
      icon: <span>{menu.icon}</span>,
      label: menu.badge ? (
        <span>
          {menu.title}
          <span className="menu-badge">{menu.badge}</span>
        </span>
      ) : menu.title,
      children: menu.children ? renderMenuItems(menu.children) : undefined,
      onClick: menu.path ? () => navigate(menu.path!) : undefined
    }));
  };

  return (
    <Sider 
      width={240} 
      theme="dark" 
      className="app-sidebar"
      breakpoint="lg"
      collapsedWidth="0"
    >
      <div className="sidebar-header">
        <h2>CRM系统</h2>
      </div>
      
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={currentMenu ? [currentMenu.key] : []}
        items={renderMenuItems(userMenu)}
        className="sidebar-menu"
      />
    </Sider>
  );
};
```

### 4. 角色特定的快捷入口

```tsx
// components/RoleBasedQuickActions.tsx
import React from 'react';
import { Card, Row, Col } from 'antd';
import { useAuth } from '../contexts/AuthContext';

export const RoleBasedQuickActions: React.FC = () => {
  const { currentUser } = useAuth();
  
  const salesQuickActions = [
    { title: '新建线索', path: '/leads/create', icon: '➕' },
    { title: '待跟进客户', path: '/customer/followup', icon: '⏰', count: 5 },
    { title: '收款提醒', path: '/finance/receivables', icon: '💰', count: 3 }
  ];
  
  const operationQuickActions = [
    { title: '待处理订单', path: '/orders/pending', icon: '📦', count: 8 },
    { title: '服务执行', path: '/services/execution', icon: '🛠️', count: 12 }
  ];
  
  const financeQuickActions = [
    { title: '待开票', path: '/finance/invoicing', icon: '🧾', count: 15 },
    { title: '对账管理', path: '/finance/reconciliation', icon: '📊' }
  ];
  
  const getQuickActions = () => {
    if (currentUser?.roles.includes('sales')) return salesQuickActions;
    if (currentUser?.roles.includes('operation')) return operationQuickActions;
    if (currentUser?.roles.includes('finance')) return financeQuickActions;
    return [];
  };
  
  const quickActions = getQuickActions();
  
  if (quickActions.length === 0) return null;
  
  return (
    <Card title="快捷操作" size="small" className="quick-actions">
      <Row gutter={[16, 16]}>
        {quickActions.map(action => (
          <Col span={12} key={action.path}>
            <div 
              className="quick-action-item"
              onClick={() => window.location.href = action.path}
            >
              <div className="action-icon">{action.icon}</div>
              <div className="action-content">
                <div className="action-title">{action.title}</div>
                {action.count && (
                  <div className="action-count">{action.count}</div>
                )}
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </Card>
  );
};
```

## 🎯 各角色导航栏展示

### 销售角色导航栏
```
📊 仪表盘
👥 客户与销售
  ├── 客户列表
  ├── 联系人管理
  └── 线索管理
    ├── 我的线索
    └── 公海线索
📦 订单执行
  └── 订单列表
💰 财务管理
  └── 应收管理 (显示待收款数量)
```

### 中台执行角色导航栏
```
📊 仪表盘
📦 订单执行
  ├── 订单列表
  └── 服务管理
🛍️ 产品服务
  ├── 产品管理
  └── 服务目录
```

### 财务角色导航栏
```
📊 仪表盘
💰 财务管理
  ├── 应收管理
  ├── 开票管理
  └── 财务报表
```

### 管理员角色导航栏
```
📊 仪表盘
👥 客户与销售
📦 订单执行
🛍️ 产品服务
💰 财务管理
⚙️ 系统管理
```

## 💡 优化亮点

### 1. **角色聚焦**
- 每个角色只看到相关的功能模块
- 减少信息干扰，提高工作效率

### 2. **视觉优化**
- 使用Emoji图标提高识别度
- 待办数量徽章提醒
- 快捷操作面板

### 3. **用户体验**
- 扁平化菜单结构，减少点击深度
- 常用功能快速访问
- 响应式设计，支持移动端

### 4. **扩展性**
- 模块化配置，易于添加新功能
- 角色权限灵活配置
- 支持多级菜单嵌套

这个优化方案确保了每个角色都能快速访问到最相关的功能，同时保持了系统的整洁和易用性。