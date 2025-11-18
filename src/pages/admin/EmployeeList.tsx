/**
 * 人员列表页面
 * 支持条件查询、列表展示、分页
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Filter, X, User, Mail, Building2, Shield, CheckCircle2, XCircle, Eye, Phone, MapPin, MessageCircle, Calendar } from 'lucide-react'
import { getUserList, getOrganizationList, getRoleList, getUserDetail } from '@/api/users'
import { UserListParams, UserListItem, Organization, Role, UserDetail } from '@/api/types'
import { useToast } from '@/components/ToastContainer'

const EmployeeList = () => {
  const { t } = useTranslation()
  const { showError } = useToast()

  // 查询参数
  const [queryParams, setQueryParams] = useState<UserListParams>({
    page: 1,
    size: 10,
  })

  // 数据
  const [users, setUsers] = useState<UserListItem[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pages, setPages] = useState(0)

  // 表单状态
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    organization_id: '',
    role_id: '',
    is_active: '' as '' | 'true' | 'false',
  })

  // 是否显示高级筛选
  const [showAdvanced, setShowAdvanced] = useState(false)

  // 详情弹窗状态
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // 加载组织和角色列表
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [orgs, roleList] = await Promise.all([
          getOrganizationList(),
          getRoleList(),
        ])
        setOrganizations(orgs)
        setRoles(roleList)
      } catch (error: any) {
        showError(t('employeeList.error.loadOptions'))
      }
    }
    loadOptions()
  }, [t, showError])

  // 加载用户列表
  const loadUsers = async (params: UserListParams) => {
    setLoading(true)
    try {
      const result = await getUserList(params)
      setUsers(result.records)
      setTotal(result.total)
      setCurrentPage(result.current)
      setPages(result.pages)
    } catch (error: any) {
      showError(error.message || t('employeeList.error.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadUsers(queryParams)
  }, [])

  // 处理查询（所有查询都是模糊查询）
  const handleSearch = () => {
    const params: UserListParams = {
      page: 1,
      size: queryParams.size || 10,
    }

    // 所有文本查询都是模糊查询，直接传递参数（后端支持模糊查询）
    if (formData.username.trim()) {
      params.username = formData.username.trim()
    }
    if (formData.email.trim()) {
      params.email = formData.email.trim()
    }
    if (formData.organization_id) {
      params.organization_id = formData.organization_id
    }
    if (formData.role_id) {
      params.role_id = formData.role_id
    }
    if (formData.is_active !== '') {
      params.is_active = formData.is_active === 'true'
    }

    setQueryParams(params)
    loadUsers(params)
  }

  // 打开详情弹窗
  const handleViewDetail = async (userId: string) => {
    setSelectedUserId(userId)
    setShowDetailModal(true)
    setLoadingDetail(true)
    try {
      const detail = await getUserDetail(userId)
      setUserDetail(detail)
    } catch (error: any) {
      showError(error.message || t('employees.error.loadDetailFailed'))
      setShowDetailModal(false)
    } finally {
      setLoadingDetail(false)
    }
  }

  // 关闭详情弹窗
  const handleCloseDetail = () => {
    setShowDetailModal(false)
    setSelectedUserId(null)
    setUserDetail(null)
  }

  // 重置查询
  const handleReset = () => {
    setFormData({
      username: '',
      email: '',
      organization_id: '',
      role_id: '',
      is_active: '',
    })
    const defaultParams: UserListParams = {
      page: 1,
      size: 10,
    }
    setQueryParams(defaultParams)
    loadUsers(defaultParams)
  }

  // 分页
  const handlePageChange = (page: number) => {
    const params = { ...queryParams, page }
    setQueryParams(params)
    loadUsers(params)
  }

  return (
    <div className="w-full">
        {/* 页面标题 */}
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-1.5 tracking-tight">
            {t('employeeList.title')}
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            {t('employeeList.subtitle')}
          </p>
        </div>

        {/* 查询表单 */}
        <div className="bg-white rounded-xl border border-gray-200 p-2 mb-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
            {/* 用户名 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('employeeList.search.username')}
              </label>
              <div className="relative">
                <User className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder={t('employeeList.search.usernamePlaceholder')}
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>

            {/* 邮箱 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('employeeList.search.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('employeeList.search.emailPlaceholder')}
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>

            {/* 状态 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('employeeList.search.status')}
              </label>
              <select
                value={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value as '' | 'true' | 'false' })}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
              >
                <option value="">{t('employeeList.search.allStatus')}</option>
                <option value="true">{t('employeeList.search.active')}</option>
                <option value="false">{t('employeeList.search.inactive')}</option>
              </select>
            </div>
          </div>

          {/* 高级筛选 */}
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 pt-3 border-t border-gray-200">
              {/* 组织 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('employeeList.search.organization')}
                </label>
                <div className="relative">
                  <Building2 className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <select
                    value={formData.organization_id}
                    onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
                  >
                    <option value="">{t('employeeList.search.allOrganizations')}</option>
                    {organizations.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 角色 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('employeeList.search.role')}
                </label>
                <div className="relative">
                  <Shield className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <select
                    value={formData.role_id}
                    onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                    className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
                  >
                    <option value="">{t('employeeList.search.allRoles')}</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center space-x-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors"
            >
              <Filter className="h-3.5 w-3.5" />
              <span>{showAdvanced ? t('employeeList.search.hideAdvanced') : t('employeeList.search.showAdvanced')}</span>
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('employeeList.search.reset')}
              </button>
              <button
                onClick={handleSearch}
                disabled={loading}
                className="px-4 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
              >
                <Search className="h-3.5 w-3.5" />
                <span>{t('employeeList.search.search')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 用户列表 */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">
              <div className="text-sm text-gray-500">{t('employeeList.loading')}</div>
            </div>
          ) : users.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-sm text-gray-500">{t('employeeList.noData')}</div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-1 py-1 text-left text-xs font-semibold text-gray-900">
                        {t('employeeList.table.username')}
                      </th>
                      <th className="px-1 py-1 text-left text-xs font-semibold text-gray-900">
                        {t('employeeList.table.displayName')}
                      </th>
                      <th className="px-1 py-1 text-left text-xs font-semibold text-gray-900">
                        {t('employeeList.table.email')}
                      </th>
                      <th className="px-1 py-1 text-left text-xs font-semibold text-gray-900">
                        {t('employeeList.table.organization')}
                      </th>
                      <th className="px-1 py-1 text-left text-xs font-semibold text-gray-900">
                        {t('employeeList.table.status')}
                      </th>
                      <th className="px-1 py-1 text-left text-xs font-semibold text-gray-900">
                        {t('employeeList.table.createdAt')}
                      </th>
                      <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-900 w-20">
                        {t('employeeList.table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-1 py-1 text-sm text-gray-900 font-medium">
                          {user.username}
                        </td>
                        <td className="px-1 py-1 text-sm text-gray-700">
                          {user.display_name || '-'}
                        </td>
                        <td className="px-1 py-1 text-sm text-gray-700">
                          {user.email || '-'}
                        </td>
                        <td className="px-1 py-1 text-sm text-gray-700">
                          <div className="flex items-center space-x-1.5">
                            <Building2 className="h-3.5 w-3.5 text-gray-400" />
                            <span>{user.primary_organization_name || '-'}</span>
                          </div>
                        </td>
                        <td className="px-1 py-1">
                          {user.is_active ? (
                            <span className="inline-flex items-center space-x-1 text-xs text-green-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>{t('employeeList.table.active')}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-xs text-red-600">
                              <XCircle className="h-3.5 w-3.5" />
                              <span>{t('employeeList.table.inactive')}</span>
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-1.5 text-sm text-gray-500">
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString('zh-CN')
                            : '-'}
                        </td>
                        <td className="px-1 py-1">
                          <button
                            onClick={() => handleViewDetail(user.id)}
                            className="px-1.5 py-0.5 text-xs font-medium text-primary-600 bg-primary-50 rounded hover:bg-primary-100 transition-colors"
                          >
                            {t('employeeList.table.detail')}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 分页 */}
              {pages > 1 && (
                <div className="px-1 py-1 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-xs text-gray-600">
                    {t('employeeList.pagination.total').replace('{{total}}', total.toString())}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-2 py-0.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {t('employeeList.pagination.prev')}
                    </button>
                    <div className="text-xs text-gray-700">
                      {t('employeeList.pagination.page')
                        .replace('{{current}}', currentPage.toString())
                        .replace('{{total}}', pages.toString())}
                    </div>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pages}
                      className="px-2 py-0.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {t('employeeList.pagination.next')}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      {/* 详情弹窗 */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={handleCloseDetail}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 弹窗头部 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
                {t('employees.detail.title')}
              </h2>
              <button
                onClick={handleCloseDetail}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-4">
              {loadingDetail ? (
                <div className="text-center py-6">
                  <div className="text-sm text-gray-500">{t('employeeList.loading')}</div>
                </div>
              ) : userDetail ? (
                <div className="space-y-4">
                  {/* 基本信息 */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2.5">
                      {t('employees.detail.basicInfo')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.username')}
                        </label>
                        <p className="text-sm text-gray-900">{userDetail.username}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.displayName')}
                        </label>
                        <p className="text-sm text-gray-900">{userDetail.display_name || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.email')}
                        </label>
                        <p className="text-sm text-gray-900 flex items-center space-x-1.5">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          <span>{userDetail.email || '-'}</span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.phone')}
                        </label>
                        <p className="text-sm text-gray-900 flex items-center space-x-1.5">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          <span>{userDetail.phone || '-'}</span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.status')}
                        </label>
                        <p className="text-sm">
                          {userDetail.is_active ? (
                            <span className="inline-flex items-center space-x-1 text-xs text-green-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>{t('employees.table.active')}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-xs text-red-600">
                              <XCircle className="h-3.5 w-3.5" />
                              <span>{t('employees.table.inactive')}</span>
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.gender')}
                        </label>
                        <p className="text-sm text-gray-900">{userDetail.gender || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* 组织信息 */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2.5">
                      {t('employees.detail.organizationInfo')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.organization')}
                        </label>
                        <p className="text-sm text-gray-900 flex items-center space-x-1.5">
                          <Building2 className="h-3.5 w-3.5 text-gray-400" />
                          <span>{userDetail.primary_organization_name || '-'}</span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.roles')}
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {userDetail.roles && userDetail.roles.length > 0 ? (
                            userDetail.roles.map((role) => (
                              <span
                                key={role.id}
                                className="inline-flex items-center space-x-1 px-2 py-0.5 text-xs font-medium text-primary-600 bg-primary-50 rounded"
                              >
                                <Shield className="h-3 w-3" />
                                <span>{role.name}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">-</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 联系信息 */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2.5">
                      {t('employees.detail.contactInfo')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.contactPhone')}
                        </label>
                        <p className="text-sm text-gray-900 flex items-center space-x-1.5">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          <span>{userDetail.contact_phone || '-'}</span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.whatsapp')}
                        </label>
                        <p className="text-sm text-gray-900 flex items-center space-x-1.5">
                          <MessageCircle className="h-3.5 w-3.5 text-gray-400" />
                          <span>{userDetail.whatsapp || '-'}</span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.wechat')}
                        </label>
                        <p className="text-sm text-gray-900">{userDetail.wechat || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.address')}
                        </label>
                        <p className="text-sm text-gray-900 flex items-center space-x-1.5">
                          <MapPin className="h-3.5 w-3.5 text-gray-400" />
                          <span>{userDetail.address || '-'}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 其他信息 */}
                  {userDetail.bio && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2.5">
                        {t('employees.detail.bio')}
                      </h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{userDetail.bio}</p>
                    </div>
                  )}

                  {/* 时间信息 */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2.5">
                      {t('employees.detail.timeInfo')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.createdAt')}
                        </label>
                        <p className="text-sm text-gray-900 flex items-center space-x-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span>
                            {userDetail.created_at
                              ? new Date(userDetail.created_at).toLocaleString('zh-CN')
                              : '-'}
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.updatedAt')}
                        </label>
                        <p className="text-sm text-gray-900 flex items-center space-x-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span>
                            {userDetail.updated_at
                              ? new Date(userDetail.updated_at).toLocaleString('zh-CN')
                              : '-'}
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.lastLoginAt')}
                        </label>
                        <p className="text-sm text-gray-900 flex items-center space-x-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span>
                            {userDetail.last_login_at
                              ? new Date(userDetail.last_login_at).toLocaleString('zh-CN')
                              : '-'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-sm text-gray-500">{t('employees.error.loadDetailFailed')}</div>
                </div>
              )}
            </div>

            {/* 弹窗底部 */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 py-2.5 flex justify-end">
              <button
                onClick={handleCloseDetail}
                className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('employees.detail.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeeList

