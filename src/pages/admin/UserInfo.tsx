/**
 * 用户信息页面
 * 显示当前登录用户的详细信息
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Shield, 
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  MessageSquare,
  MessageCircle
} from 'lucide-react'
import { getUserDetail } from '@/api/users'
import { getCurrentUser } from '@/api/auth'
import { UserDetail } from '@/api/types'
import { useToast } from '@/components/ToastContainer'

const UserInfo = () => {
  const { t } = useTranslation()
  const { showError } = useToast()
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const currentUser = getCurrentUser()
        if (!currentUser || !currentUser.id) {
          showError(t('userInfo.error.noUser'))
          setLoading(false)
          return
        }

        const detail = await getUserDetail(currentUser.id)
        setUserDetail(detail)
      } catch (error: any) {
        console.error('Failed to load user info:', error)
        showError(error.message || t('userInfo.error.loadFailed'))
      } finally {
        setLoading(false)
      }
    }

    loadUserInfo()
  }, [])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  if (loading) {
    return (
      <div className="w-full">
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-1.5 tracking-tight">
            {t('userInfo.title')}
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            {t('userInfo.subtitle')}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <div className="text-sm text-gray-500">{t('userInfo.loading')}</div>
        </div>
      </div>
    )
  }

  if (!userDetail) {
    return (
      <div className="w-full">
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-1.5 tracking-tight">
            {t('userInfo.title')}
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            {t('userInfo.subtitle')}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{t('userInfo.error.noData')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* 页面标题 */}
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-1.5 tracking-tight">
          {t('userInfo.title')}
        </h1>
        <p className="text-sm text-gray-500 font-medium">
          {t('userInfo.subtitle')}
        </p>
      </div>

      {/* 基本信息卡片 */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
        <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center space-x-2">
          <User className="h-4 w-4" />
          <span>{t('userInfo.basicInfo.title')}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-start space-x-2">
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-0.5">{t('userInfo.basicInfo.username')}</div>
              <div className="text-sm font-medium text-gray-900">{userDetail.username}</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Mail className="h-4 w-4 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-0.5">{t('userInfo.basicInfo.email')}</div>
              <div className="text-sm font-medium text-gray-900">{userDetail.email || '-'}</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-0.5">{t('userInfo.basicInfo.displayName')}</div>
              <div className="text-sm font-medium text-gray-900">{userDetail.display_name || '-'}</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-0.5">{t('userInfo.basicInfo.phone')}</div>
              <div className="text-sm font-medium text-gray-900">{userDetail.phone || '-'}</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-0.5">{t('userInfo.basicInfo.status')}</div>
              <div className="flex items-center space-x-1">
                {userDetail.is_active ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                    <span className="text-xs text-green-600 font-medium">{t('userInfo.basicInfo.active')}</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-3.5 w-3.5 text-red-600" />
                    <span className="text-xs text-red-600 font-medium">{t('userInfo.basicInfo.inactive')}</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Building2 className="h-4 w-4 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-0.5">{t('userInfo.basicInfo.organization')}</div>
              <div className="text-sm font-medium text-gray-900">
                {userDetail.primary_organization_name || '-'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 角色信息 */}
      {userDetail.roles && userDetail.roles.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>{t('userInfo.roles.title')}</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {userDetail.roles.map((role) => (
              <div
                key={role.id}
                className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <Shield className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">{role.name}</span>
                <span className="text-xs text-blue-500">({role.code})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 联系信息 */}
      {(userDetail.contact_phone || userDetail.whatsapp || userDetail.wechat || userDetail.address) && (
        <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <MessageSquare className="h-4 w-4" />
            <span>{t('userInfo.contact.title')}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {userDetail.contact_phone && (
              <div className="flex items-start space-x-2">
                <Phone className="h-4 w-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-0.5">{t('userInfo.contact.contactPhone')}</div>
                  <div className="text-sm font-medium text-gray-900">{userDetail.contact_phone}</div>
                </div>
              </div>
            )}
            {userDetail.whatsapp && (
              <div className="flex items-start space-x-2">
                <MessageCircle className="h-4 w-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-0.5">{t('userInfo.contact.whatsapp')}</div>
                  <div className="text-sm font-medium text-gray-900">{userDetail.whatsapp}</div>
                </div>
              </div>
            )}
            {userDetail.wechat && (
              <div className="flex items-start space-x-2">
                <MessageCircle className="h-4 w-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-0.5">{t('userInfo.contact.wechat')}</div>
                  <div className="text-sm font-medium text-gray-900">{userDetail.wechat}</div>
                </div>
              </div>
            )}
            {userDetail.address && (
              <div className="flex items-start space-x-2 md:col-span-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-0.5">{t('userInfo.contact.address')}</div>
                  <div className="text-sm font-medium text-gray-900">{userDetail.address}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 时间信息 */}
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span>{t('userInfo.timeline.title')}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-start space-x-2">
            <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-0.5">{t('userInfo.timeline.createdAt')}</div>
              <div className="text-sm font-medium text-gray-900">{formatDate(userDetail.created_at)}</div>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <div className="text-xs text-gray-500 mb-0.5">{t('userInfo.timeline.updatedAt')}</div>
              <div className="text-sm font-medium text-gray-900">{formatDate(userDetail.updated_at)}</div>
            </div>
          </div>
          {userDetail.last_login_at && (
            <div className="flex items-start space-x-2">
              <Clock className="h-4 w-4 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-0.5">{t('userInfo.timeline.lastLoginAt')}</div>
                <div className="text-sm font-medium text-gray-900">{formatDate(userDetail.last_login_at)}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserInfo
