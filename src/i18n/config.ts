import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { storage } from '@/utils/storage'

import zhCN from './locales/zh-CN.json'
import idID from './locales/id-ID.json'

// 从 localStorage 获取保存的语言偏好
const getInitialLanguage = (): string => {
  const stored = storage.getLanguage()
  if (stored && (stored === 'zh-CN' || stored === 'id-ID')) {
    return stored
  }
  // 如果没有保存的语言偏好，使用浏览器语言检测
  const browserLang = navigator.language
  if (browserLang.startsWith('zh') || browserLang.startsWith('id')) {
    return browserLang.startsWith('zh') ? 'zh-CN' : 'id-ID'
  }
  // 默认返回中文
  return 'zh-CN'
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': {
        translation: zhCN,
      },
      'id-ID': {
        translation: idID,
      },
    },
    lng: getInitialLanguage(), // 使用从 localStorage 读取的语言
    fallbackLng: 'zh-CN',
    supportedLngs: ['zh-CN', 'id-ID'],
    interpolation: {
      escapeValue: false,
    },
  })

// 监听语言变化，保存到 localStorage
i18n.on('languageChanged', (lng: string) => {
  storage.setLanguage(lng)
})

export default i18n

