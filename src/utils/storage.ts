/**
 * 本地存储工具
 */

const TOKEN_KEY = 'bantu_token'
const REFRESH_TOKEN_KEY = 'bantu_refresh_token'
const USER_INFO_KEY = 'bantu_user_info'
const LANGUAGE_KEY = 'bantu_language'

export const storage = {
  // Token 相关
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token)
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY)
  },

  setRefreshToken(refreshToken: string): void {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
  },

  // 用户信息
  setUserInfo(userInfo: any): void {
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))
  },

  getUserInfo(): any | null {
    const userInfo = localStorage.getItem(USER_INFO_KEY)
    return userInfo ? JSON.parse(userInfo) : null
  },

  // 语言偏好
  setLanguage(language: string): void {
    localStorage.setItem(LANGUAGE_KEY, language)
  },

  getLanguage(): string | null {
    return localStorage.getItem(LANGUAGE_KEY)
  },

  // 清除所有数据（保留语言偏好，因为这是用户设置）
  clear(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_INFO_KEY)
    // 注意：不清除语言偏好，因为这是用户的个人设置
  },

  // 清除所有数据（包括语言偏好）
  clearAll(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_INFO_KEY)
    localStorage.removeItem(LANGUAGE_KEY)
  },
}

