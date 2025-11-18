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
      <div className="w-full py-3 px-2">
        {/* 页面标题 */}
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-1.5 tracking-tight">
            {t('systemManagement.userInfo.title')}
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            {t('systemManagement.userInfo.subtitle')}
          </p>
        </div>

        {/* 占位内容 */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{t('systemManagement.userInfo.placeholder')}</p>
        </div>
      </div>
    </div>
  )
}

export default UserInfo

