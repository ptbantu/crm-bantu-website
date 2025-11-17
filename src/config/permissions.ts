/**
 * 权限配置
 * 定义系统中的所有权限和角色
 */

// 角色枚举
export enum Role {
  ADMIN = 'ADMIN',           // 系统管理员
  SALES = 'SALES',           // 内部销售
  AGENT = 'AGENT',           // 渠道代理销售
  OPERATION = 'OPERATION',   // 做单人员
  FINANCE = 'FINANCE',       // 财务人员
}

// 权限枚举
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

// 角色信息映射
export const ROLE_INFO: Record<Role, { name: string; description: string }> = {
  [Role.ADMIN]: {
    name: '管理员',
    description: '系统管理员，拥有所有权限',
  },
  [Role.SALES]: {
    name: '销售',
    description: '内部销售代表',
  },
  [Role.AGENT]: {
    name: '渠道代理',
    description: '外部渠道代理销售',
  },
  [Role.OPERATION]: {
    name: '做单人员',
    description: '订单处理人员',
  },
  [Role.FINANCE]: {
    name: '财务',
    description: '财务人员，负责应收应付和报表',
  },
}

