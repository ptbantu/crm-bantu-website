/**
 * 标签页上下文
 * 管理多个打开的页面标签
 */
import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ComponentType } from 'react'

export interface Tab {
  id: string
  path: string
  title: string
  key: string // 用于标识唯一标签（通常是路径）
  icon?: ComponentType<{ className?: string }> // 图标组件
}

interface TabsContextType {
  tabs: Tab[]
  activeTabId: string | null
  addTab: (path: string, title: string, key: string, icon?: ComponentType<{ className?: string }>) => void
  removeTab: (tabId: string) => void
  setActiveTab: (tabId: string) => void
  closeTab: (tabId: string) => void
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

export const useTabs = () => {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('useTabs must be used within TabsProvider')
  }
  return context
}

interface TabsProviderProps {
  children: ReactNode
}

export const TabsProvider = ({ children }: TabsProviderProps) => {
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  // 处理待处理的导航
  useEffect(() => {
    if (pendingNavigation) {
      navigate(pendingNavigation)
      setPendingNavigation(null)
    }
  }, [pendingNavigation, navigate])

  // 添加标签页
  const addTab = useCallback((path: string, title: string, key: string, icon?: ComponentType<{ className?: string }>) => {
    setTabs(prev => {
      // 检查是否已存在相同的标签
      const existingTab = prev.find(tab => tab.key === key)
      if (existingTab) {
        setActiveTabId(existingTab.id)
        setPendingNavigation(path)
        return prev
      }

      // 创建新标签
      const newTab: Tab = {
        id: `tab-${Date.now()}-${Math.random()}`,
        path,
        title,
        key,
        icon,
      }

      const newTabs = [...prev, newTab]
      setActiveTabId(newTab.id)
      setPendingNavigation(path)
      return newTabs
    })
  }, [])

  // 移除标签页
  const removeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const tabIndex = prev.findIndex(tab => tab.id === tabId)
      if (tabIndex === -1) return prev

      const newTabs = prev.filter(tab => tab.id !== tabId)
      
      // 如果关闭的是当前激活的标签，激活其他标签
      if (activeTabId === tabId) {
        if (newTabs.length > 0) {
          // 优先激活右侧的标签，如果没有则激活左侧的
          const nextTab = newTabs[tabIndex] || newTabs[tabIndex - 1]
          if (nextTab) {
            setActiveTabId(nextTab.id)
            setPendingNavigation(nextTab.path)
          } else {
            setActiveTabId(null)
            setPendingNavigation('/dashboard')
          }
        } else {
          setActiveTabId(null)
          setPendingNavigation('/dashboard')
        }
      }

      return newTabs
    })
  }, [activeTabId])

  // 设置激活标签
  const setActiveTab = useCallback((tabId: string) => {
    const tab = tabs.find(t => t.id === tabId)
    if (tab) {
      setActiveTabId(tabId)
      setPendingNavigation(tab.path)
    }
  }, [tabs])

  // 关闭标签（同 removeTab）
  const closeTab = useCallback((tabId: string) => {
    removeTab(tabId)
  }, [removeTab])

  // 监听路由变化，自动激活对应的标签
  useEffect(() => {
    const currentKey = location.pathname
    const existingTab = tabs.find(tab => tab.key === currentKey)
    
    if (existingTab) {
      setActiveTabId(existingTab.id)
    }
  }, [location.pathname, tabs])

  return (
    <TabsContext.Provider
      value={{
        tabs,
        activeTabId,
        addTab,
        removeTab,
        setActiveTab,
        closeTab,
      }}
    >
      {children}
    </TabsContext.Provider>
  )
}

