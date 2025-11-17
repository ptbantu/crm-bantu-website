/**
 * 面包屑导航组件
 */
import { useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronRight, Home } from 'lucide-react'

export const Breadcrumb = () => {
  const location = useLocation()
  const { t } = useTranslation()

  const paths = location.pathname.split('/').filter(Boolean)
  
  // 如果只有一个路径（如 /dashboard），不显示面包屑
  if (paths.length <= 1) {
    return null
  }

  const breadcrumbItems = paths.map((path, index) => {
    const isLast = index === paths.length - 1
    const pathTo = '/' + paths.slice(0, index + 1).join('/')
    const label = t(`menu.${path}`) || path

    return {
      label,
      path: pathTo,
      isLast,
    }
  })

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      <Link to="/dashboard" className="hover:text-gray-900">
        <Home className="h-4 w-4" />
      </Link>
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4" />
          {item.isLast ? (
            <span className="text-gray-900 font-medium">{item.label}</span>
          ) : (
            <Link to={item.path} className="hover:text-gray-900">
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}

