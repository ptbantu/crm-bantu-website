/**
 * API 客户端
 * 封装 fetch 请求，统一处理错误、认证等
 */
import { API_CONFIG } from './config'
import { ApiResult } from './types'
import { storage } from '@/utils/storage'

// 自定义错误类
export class ApiError extends Error {
  constructor(
    public code: number,
    public message: string,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * 创建完整的请求URL
 */
const createUrl = (path: string): string => {
  // 如果路径已经是完整URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  // 如果基础URL为空（开发环境使用代理），直接返回路径（相对路径）
  // 相对路径会被 Vite 代理拦截并转发到 https://www.bantu.sbs
  if (!API_CONFIG.BASE_URL || API_CONFIG.BASE_URL.trim() === '') {
    console.log('[API Client] 使用相对路径（通过 Vite 代理）:', path)
    return path
  }
  // 拼接基础URL和路径（生产环境必须使用完整URL）
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '')
  const apiPath = path.startsWith('/') ? path : `/${path}`
  const fullUrl = `${baseUrl}${apiPath}`
  
  // 开发时输出URL信息（便于调试）
  if (import.meta.env.DEV) {
    console.log('[API Client] 使用完整URL:', fullUrl)
  }
  
  return fullUrl
}

/**
 * 请求选项
 */
interface RequestOptions extends RequestInit {
  skipAuth?: boolean // 是否跳过认证（用于登录等公开接口）
  timeout?: number // 请求超时时间（毫秒）
  skipJson?: boolean // 是否跳过JSON序列化（用于FormData等）
}

/**
 * 发送HTTP请求
 */
export async function request<T = any>(
  path: string,
  options: RequestOptions = {}
): Promise<ApiResult<T>> {
  const {
    skipAuth = false,
    timeout = API_CONFIG.TIMEOUT,
    headers = {},
    ...restOptions
  } = options

  // 构建请求头
  const requestHeaders: HeadersInit = {
    ...headers,
  }
  
  // 如果不是FormData，设置Content-Type为application/json
  if (!options.skipJson && !(restOptions.body instanceof FormData)) {
    requestHeaders['Content-Type'] = 'application/json'
  }

  // 添加认证Token（如果需要）
  // 根据 API 文档，除登录接口外，所有接口都需要在 Header 中携带 JWT Token
  if (!skipAuth) {
    const token = storage.getToken()
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`
      // 开发环境调试：输出 token 信息（不输出完整 token，只输出前10个字符）
      if (import.meta.env.DEV) {
        console.log(`[API Client] 添加 JWT Token: ${token.substring(0, 20)}... (长度: ${token.length})`)
      }
    } else {
      // 开发环境调试：警告没有 token
      if (import.meta.env.DEV) {
        console.warn('[API Client] ⚠️ 未找到 JWT Token，请求将可能失败')
      }
    }
    // 如果没有 token，仍然发送请求，让后端返回 401 错误
    // 这样可以在 401 处理逻辑中统一处理（清除 token 并跳转登录页）
  }

  // 创建AbortController用于超时控制
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const url = createUrl(path)
    
    // 构建fetch选项
    const fetchOptions: RequestInit = {
      ...restOptions,
      method: restOptions.method || 'GET',
      headers: requestHeaders,
      signal: controller.signal,
      mode: 'cors', // 明确指定 CORS 模式
      credentials: 'omit', // 不使用 credentials（与后端配置一致）
    }
    
    // body已经在post/put中设置，这里不需要额外处理
    if (restOptions.body !== undefined) {
      fetchOptions.body = restOptions.body
    }
    
    const response = await fetch(url, fetchOptions)

    // 清除超时定时器
    clearTimeout(timeoutId)

    // 开发环境调试：输出响应状态
    if (import.meta.env.DEV) {
      console.log(`[API Client] ${restOptions.method || 'GET'} ${path} -> ${response.status} ${response.statusText}`)
    }

    // 检查HTTP状态码
    if (!response.ok) {
      // 处理 401 未授权错误（Token 过期或无效）
      if (response.status === 401 && !skipAuth) {
        // 开发环境调试：输出 401 错误详情
        if (import.meta.env.DEV) {
          console.error('[API Client] ❌ 401 未授权错误，Token 可能已过期或无效')
        }
        // 清除本地存储的认证信息
        storage.clear()
        
        // 如果不是在登录页，跳转到登录页
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          // 延迟跳转，避免在错误处理中立即跳转
          setTimeout(() => {
            window.location.href = '/login'
          }, 100)
        }
        
        throw new ApiError(
          401,
          '登录已过期，请重新登录',
          null
        )
      }
      
      // 尝试解析错误响应
      let errorData: any = null
      try {
        errorData = await response.json()
      } catch {
        // 如果无法解析JSON，使用默认错误信息
      }

      throw new ApiError(
        errorData?.code || response.status,
        errorData?.message || `HTTP ${response.status}: ${response.statusText}`,
        errorData?.data
      )
    }

    // 解析响应
    const result: ApiResult<T> = await response.json()

    // 检查业务状态码
    if (result.code !== 200) {
      // 处理业务层面的 401 错误（Token 过期或无效）
      if (result.code === 401 && !skipAuth) {
        // 清除本地存储的认证信息
        storage.clear()
        
        // 如果不是在登录页，跳转到登录页
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          // 延迟跳转，避免在错误处理中立即跳转
          setTimeout(() => {
            window.location.href = '/login'
          }, 100)
        }
      }
      
      throw new ApiError(result.code, result.message, result.data)
    }

    return result
  } catch (error) {
    clearTimeout(timeoutId)

    // 处理AbortError（超时）
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError(408, '请求超时，请稍后重试')
    }

    // 如果是ApiError，直接抛出
    if (error instanceof ApiError) {
      throw error
    }

    // 其他错误
    throw new ApiError(
      500,
      error instanceof Error ? error.message : '网络错误，请稍后重试'
    )
  }
}

/**
 * GET 请求
 */
export function get<T = any>(path: string, options?: RequestOptions): Promise<ApiResult<T>> {
  return request<T>(path, {
    ...options,
    method: 'GET',
  })
}

/**
 * POST 请求
 */
export function post<T = any>(
  path: string,
  data?: any,
  options?: RequestOptions
): Promise<ApiResult<T>> {
  // 如果是FormData，直接传递，否则序列化为JSON
  const body = data instanceof FormData 
    ? data 
    : (data ? JSON.stringify(data) : undefined)
  
  return request<T>(path, {
    ...options,
    method: 'POST',
    body,
    skipJson: data instanceof FormData,
  })
}

/**
 * PUT 请求
 */
export function put<T = any>(
  path: string,
  data?: any,
  options?: RequestOptions
): Promise<ApiResult<T>> {
  return request<T>(path, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * DELETE 请求
 */
export function del<T = any>(path: string, options?: RequestOptions): Promise<ApiResult<T>> {
  return request<T>(path, {
    ...options,
    method: 'DELETE',
  })
}

