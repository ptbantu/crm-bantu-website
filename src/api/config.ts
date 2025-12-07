/**
 * API 配置
 */

// 根据环境变量或默认值设置API基础地址
const getApiBaseUrl = (): string => {
  // 检查当前域名，如果是开发域名，根据当前协议选择 HTTP 或 HTTPS
  // 注意：浏览器无法忽略 SSL 证书错误，所以如果使用 HTTPS 会有证书警告
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname
    const protocol = window.location.protocol
    // 如果是 crmbantu.space 域名，根据当前协议选择
    if (hostname.includes('crmbantu.space')) {
      // 当前页面是 HTTPS，必须使用 HTTPS（否则会被阻止混合内容）
      // 使用 HTTPS 会有证书警告，但这是唯一可行的方法
      // 用户需要在浏览器中手动接受证书，或者修复后端 SSL 证书
      console.log(`[API Config] 检测到开发域名 crmbantu.space，当前协议: ${protocol}`)
      console.warn('[API Config] ⚠️ 使用 HTTPS 可能遇到证书错误')
      console.warn('[API Config] 💡 解决方案：1) 在浏览器中手动接受证书 2) 修复后端 SSL 证书')
      // 强制使用 HTTPS（即使有证书警告）
      return 'https://www.bantu.sbs'
    }
  }
  
  // 优先使用环境变量（如果明确设置了）
  const envUrl = import.meta.env.VITE_API_BASE_URL
  if (envUrl && envUrl.trim() !== '') {
    const url = envUrl.trim()
    // 如果环境变量设置为空字符串，使用相对路径（代理）
    if (url === '' || url === 'proxy' || url === 'relative') {
      return ''
    }
    // 生产环境：使用环境变量中的地址（构建时通过 Dockerfile.prod 设置）
    // 支持 bantuqifu.xin 和 bantu.sbs 等域名
    return url
  }
  
  // 开发模式：使用相对路径，通过Vite代理转发
  // Vite代理可以忽略SSL证书验证（secure: false）
  // 这样既可以使用HTTPS，又能绕过证书问题
  // 检查是否为开发模式（DEV 或 MODE === 'development' 或 NODE_ENV === 'development'）
  const isDev = 
    import.meta.env.DEV || 
    import.meta.env.MODE === 'development' ||
    import.meta.env.MODE === 'dev'
  
  if (isDev) {
    console.log('[API Config] 开发模式：使用相对路径通过代理')
    return '' // 使用相对路径，通过Vite代理转发到 https://www.bantu.sbs
  }
  
  // 生产环境：优先使用环境变量，如果没有则使用默认值
  // 生产环境构建时会通过 Dockerfile.prod 设置 VITE_API_BASE_URL
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.trim()
  }
  // 默认生产环境地址
  return 'https://www.bantuqifu.xin'
}

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: 30000, // 30秒超时
}

// 开发时输出配置信息（便于调试）
if (import.meta.env.DEV) {
  console.log('API Config:', {
    BASE_URL: API_CONFIG.BASE_URL,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
  })
}

// API 路径
export const API_PATHS = {
  // 认证
  AUTH: {
    LOGIN: '/api/foundation/auth/login',
    USER_INFO: '/api/foundation/auth/user-info',
  },
  // 用户
  USERS: {
    BASE: '/api/foundation/users',
    BY_ID: (id: string) => `/api/foundation/users/${id}`,
  },
  // 组织
  ORGANIZATIONS: {
    BASE: '/api/foundation/organizations',
    BY_ID: (id: string) => `/api/foundation/organizations/${id}`,
  },
  // 角色
  ROLES: {
    BASE: '/api/foundation/roles',
    BY_ID: (id: string) => `/api/foundation/roles/${id}`,
  },
  // 权限
  PERMISSIONS: {
    BASE: '/api/foundation/permissions',
    BY_ID: (id: string) => `/api/foundation/permissions/${id}`,
  },
  // 服务管理 - 分类
  CATEGORIES: {
    BASE: '/api/service-management/categories',
    BY_ID: (id: string) => `/api/service-management/categories/${id}`,
  },
  // 服务管理 - 产品/服务
  PRODUCTS: {
    BASE: '/api/service-management/products',
    BY_ID: (id: string) => `/api/service-management/products/${id}`,
    BY_VENDOR: (vendorId: string) => `/api/service-management/products/vendors/${vendorId}`,
  },
  // 服务管理 - 客户
  CUSTOMERS: {
    BASE: '/api/service-management/customers',
    BY_ID: (id: string) => `/api/service-management/customers/${id}`,
  },
  // 服务管理 - 联系人
  CONTACTS: {
    BASE: '/api/service-management/contacts',
    BY_ID: (id: string) => `/api/service-management/contacts/${id}`,
    BY_CUSTOMER: (customerId: string) => `/api/service-management/contacts/customers/${customerId}/contacts`,
  },
  // 服务管理 - 服务记录
  SERVICE_RECORDS: {
    BASE: '/api/service-management/service-records',
    BY_ID: (id: string) => `/api/service-management/service-records/${id}`,
    BY_CUSTOMER: (customerId: string) => `/api/service-management/service-records/customers/${customerId}/service-records`,
  },
  // 订单与工作流 - 订单
  ORDERS: {
    BASE: '/api/order-workflow/orders',
    BY_ID: (id: string) => `/api/order-workflow/orders/${id}`,
    ASSIGN: (id: string) => `/api/order-workflow/orders/${id}/assign`,
  },
  // 订单与工作流 - 订单项
  ORDER_ITEMS: {
    BASE: (orderId: string) => `/api/order-workflow/orders/${orderId}/items`,
    BY_ID: (orderId: string, itemId: string) => `/api/order-workflow/orders/${orderId}/items/${itemId}`,
  },
  // 订单与工作流 - 订单评论
  ORDER_COMMENTS: {
    BASE: (orderId: string) => `/api/order-workflow/orders/${orderId}/comments`,
    BY_ID: (orderId: string, commentId: string) => `/api/order-workflow/orders/${orderId}/comments/${commentId}`,
    REPLY: (orderId: string, commentId: string) => `/api/order-workflow/orders/${orderId}/comments/${commentId}/reply`,
    PIN: (orderId: string, commentId: string) => `/api/order-workflow/orders/${orderId}/comments/${commentId}/pin`,
  },
  // 订单与工作流 - 订单文件
  ORDER_FILES: {
    BASE: (orderId: string) => `/api/order-workflow/orders/${orderId}/files`,
    BY_ID: (orderId: string, fileId: string) => `/api/order-workflow/orders/${orderId}/files/${fileId}`,
    DOWNLOAD: (orderId: string, fileId: string) => `/api/order-workflow/orders/${orderId}/files/${fileId}/download`,
    VERIFY: (orderId: string, fileId: string) => `/api/order-workflow/orders/${orderId}/files/${fileId}/verify`,
    BY_STAGE: (orderId: string, stageId: string) => `/api/order-workflow/orders/${orderId}/stages/${stageId}/files`,
    BY_ITEM: (orderId: string, itemId: string) => `/api/order-workflow/orders/${orderId}/items/${itemId}/files`,
  },
  // 订单与工作流 - 线索管理
  LEADS: {
    BASE: '/api/order-workflow/leads',
    BY_ID: (id: string) => `/api/order-workflow/leads/${id}`,
    ASSIGN: (id: string) => `/api/order-workflow/leads/${id}/assign`,
    MOVE_TO_POOL: (id: string) => `/api/order-workflow/leads/${id}/move-to-pool`,
    CHECK_DUPLICATE: '/api/order-workflow/leads/check-duplicate',
    FOLLOW_UPS: (id: string) => `/api/order-workflow/leads/${id}/follow-ups`,
    NOTES: (id: string) => `/api/order-workflow/leads/${id}/notes`,
    CONVERT_TO_CUSTOMER: (id: string) => `/api/order-workflow/leads/${id}/convert-to-customer`,
    CONVERT_TO_OPPORTUNITY: (id: string) => `/api/order-workflow/leads/${id}/convert-to-opportunity`,
  },
  // 订单与工作流 - 商机管理
  OPPORTUNITIES: {
    BASE: '/api/order-workflow/opportunities',
    BY_ID: (id: string) => `/api/order-workflow/opportunities/${id}`,
    ASSIGN: (id: string) => `/api/order-workflow/opportunities/${id}/assign`,
    UPDATE_STAGE: (id: string) => `/api/order-workflow/opportunities/${id}/update-stage`,
    CONVERT: (id: string) => `/api/order-workflow/opportunities/${id}/convert`,
    FOLLOW_UPS: (id: string) => `/api/order-workflow/opportunities/${id}/follow-ups`,
    NOTES: (id: string) => `/api/order-workflow/opportunities/${id}/notes`,
  },
  // 订单与工作流 - 选项配置
  OPTIONS: {
    CUSTOMER_LEVELS: '/api/order-workflow/customer-levels',
    FOLLOW_UP_STATUSES: '/api/order-workflow/follow-up-statuses',
  },
} as const

