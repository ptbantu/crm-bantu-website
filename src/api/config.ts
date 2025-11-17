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
    // 确保环境变量中的地址是正确的
    if (url.includes('bantu.sbs')) {
      return url
    }
    // 如果环境变量设置为空字符串，使用相对路径（代理）
    if (url === '' || url === 'proxy' || url === 'relative') {
      return ''
    }
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
  
  // 生产环境：强制使用 https://www.bantu.sbs（不能使用当前域名）
  // 无论什么情况，生产环境都必须使用这个地址
  return 'https://www.bantu.sbs'
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
} as const

