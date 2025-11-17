/**
 * 用户信息页面
 * 显示当前登录用户的详细信息
 */
import { useTranslation } from 'react-i18next'
import { User } from 'lucide-react'

const UserInfo = () => {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-7xl py-8 px-6">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3 tracking-tight">
            {t('systemManagement.userInfo.title')}
          </h1>
          <p className="text-lg text-gray-500 font-medium">
            {t('systemManagement.userInfo.subtitle')}
          </p>
        </div>

        {/* 占位内容 */}
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">{t('systemManagement.userInfo.placeholder')}</p>
        </div>
      </div>
    </div>
  )
}

export default UserInfo

