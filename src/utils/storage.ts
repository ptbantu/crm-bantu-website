/**
 * 本地存储工具
 */

const TOKEN_KEY = 'bantu_token'
const REFRESH_TOKEN_KEY = 'bantu_refresh_token'
const USER_INFO_KEY = 'bantu_user_info'

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

  // 清除所有数据
  clear(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_INFO_KEY)
  },
}

