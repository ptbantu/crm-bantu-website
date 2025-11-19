/**
 * 人员管理页面
 * 支持用户的增删改查
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, Edit, Trash2, X, User, Mail, Building2, Shield, CheckCircle2, XCircle, Save } from 'lucide-react'
import {
  getUserList,
  getOrganizationList,
  getRoleList,
  getUserDetail,
  createUser,
  updateUser,
  deleteUser,
  CreateUserRequest,
  UpdateUserRequest,
} from '@/api/users'
import { UserListParams, UserListItem, Organization, Role } from '@/api/types'
import { useToast } from '@/components/ToastContainer'
import { useAuth } from '@/contexts/AuthContext'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button } from '@chakra-ui/react'

const EmployeeManagement = () => {
  const { t } = useTranslation()
  const { showSuccess, showError } = useToast()
  const { user } = useAuth()
  
  // 当前用户的组织ID
  const currentUserOrganizationId = user?.primary_organization_id || null

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

  // 弹窗状态
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null)
  const [modalFormData, setModalFormData] = useState({
    username: '',
    email: '',
    password: '',
    display_name: '',
    organization_id: '',
    role_ids: [] as string[],
    is_active: true,
  })
  const [submitting, setSubmitting] = useState(false)

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
        showError(t('employeeManagement.error.loadOptions'))
      }
    }
    loadOptions()
  }, [t, showError])

  // 加载用户列表
  const loadUsers = async (params: UserListParams) => {
    setLoading(true)
    try {
      // 自动添加当前用户组织的过滤条件
      const queryParams: UserListParams = {
        ...params,
        organization_id: currentUserOrganizationId || undefined,
      }
      const result = await getUserList(queryParams)
      setUsers(result.records)
      setTotal(result.total)
      setCurrentPage(result.current)
      setPages(result.pages)
    } catch (error: any) {
      showError(error.message || t('employeeManagement.error.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    if (currentUserOrganizationId) {
      const params: UserListParams = {
        page: 1,
        size: 10,
        organization_id: currentUserOrganizationId,
      }
      loadUsers(params)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUserOrganizationId])

  // 处理查询
  const handleSearch = () => {
    const params: UserListParams = {
      page: 1,
      size: queryParams.size || 10,
      // 始终限制在当前用户组织
      organization_id: currentUserOrganizationId || undefined,
    }

    if (formData.username.trim()) {
      params.username = formData.username.trim()
    }
    if (formData.email.trim()) {
      params.email = formData.email.trim()
    }
    // 移除组织选择，因为只能查看自己组织的成员
    if (formData.role_id) {
      params.role_id = formData.role_id
    }
    if (formData.is_active !== '') {
      params.is_active = formData.is_active === 'true'
    }

    setQueryParams(params)
    loadUsers(params)
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
      organization_id: currentUserOrganizationId || undefined,
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

  // 打开创建弹窗
  const handleCreate = () => {
    if (!currentUserOrganizationId) {
      showError(t('employeeManagement.error.noOrganization'))
      return
    }
    setEditingUser(null)
    setModalFormData({
      username: '',
      email: '',
      password: '',
      display_name: '',
      organization_id: currentUserOrganizationId, // 自动设置为当前用户组织
      role_ids: [],
      is_active: true,
    })
    setShowModal(true)
  }

  // 打开编辑弹窗
  const handleEdit = async (user: UserListItem) => {
    if (!currentUserOrganizationId) {
      showError(t('employeeManagement.error.noOrganization'))
      return
    }
    setEditingUser(user)
    try {
      // 获取用户详情以获取完整的组织信息
      const detail = await getUserDetail(user.id)
      setModalFormData({
        username: user.username,
        email: user.email || '',
        password: '',
        display_name: user.display_name || '',
        organization_id: currentUserOrganizationId, // 确保是当前用户组织
        role_ids: detail.roles?.map(r => r.id) || [],
        is_active: user.is_active,
      })
      setShowModal(true)
    } catch (error: any) {
      showError(error.message || t('employeeManagement.error.loadDetailFailed'))
    }
  }

  // 关闭弹窗
  const handleCloseModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setModalFormData({
      username: '',
      email: '',
      password: '',
      display_name: '',
      organization_id: '',
      role_ids: [],
      is_active: true,
    })
  }

  // 提交表单
  const handleSubmit = async () => {
    // 用户名和密码可以为空（可选）
    // 但创建时至少需要用户名或邮箱
    if (!editingUser) {
      if (!modalFormData.username.trim() && !modalFormData.email.trim()) {
        showError(t('employeeManagement.validation.usernameOrEmailRequired'))
        return
      }
    }

    // 确保组织ID是当前用户组织
    if (!currentUserOrganizationId) {
      showError(t('employeeManagement.error.noOrganization'))
      return
    }

    setSubmitting(true)
    try {
      if (editingUser) {
        // 更新用户
        const updateData: UpdateUserRequest = {
          email: modalFormData.email || undefined,
          display_name: modalFormData.display_name || undefined,
          organization_id: currentUserOrganizationId, // 确保是当前用户组织
          role_ids: modalFormData.role_ids.length > 0 ? modalFormData.role_ids : undefined,
          is_active: modalFormData.is_active,
        }
        await updateUser(editingUser.id, updateData)
        showSuccess(t('employeeManagement.success.update'))
      } else {
        // 创建用户
        const createData: CreateUserRequest = {
          username: modalFormData.username.trim() || undefined,
          email: modalFormData.email.trim() || undefined,
          password: modalFormData.password.trim() || undefined, // 密码可选
          display_name: modalFormData.display_name || undefined,
          organization_id: currentUserOrganizationId, // 必须是自己组织
          role_ids: modalFormData.role_ids.length > 0 ? modalFormData.role_ids : undefined,
          is_active: modalFormData.is_active,
        }
        await createUser(createData)
        showSuccess(t('employeeManagement.success.create'))
      }
      handleCloseModal()
      loadUsers(queryParams)
    } catch (error: any) {
      showError(error.message || t('employeeManagement.error.saveFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  // 删除用户
  const handleDelete = async (user: UserListItem) => {
    if (!window.confirm(t('employeeManagement.confirm.delete', { name: user.username }))) {
      return
    }

    try {
      await deleteUser(user.id)
      showSuccess(t('employeeManagement.success.delete'))
      loadUsers(queryParams)
    } catch (error: any) {
      showError(error.message || t('employeeManagement.error.deleteFailed'))
    }
  }

  // 切换角色选择
  const toggleRole = (roleId: string) => {
    setModalFormData(prev => ({
      ...prev,
      role_ids: prev.role_ids.includes(roleId)
        ? prev.role_ids.filter(id => id !== roleId)
        : [...prev.role_ids, roleId],
    }))
  }

  return (
    <div className="w-full">
      {/* 页面头部 */}
      <PageHeader
        icon={User}
        title={t('employeeManagement.title')}
        subtitle={t('employeeManagement.subtitle')}
        actions={
          <Button
            colorScheme="primary"
            leftIcon={<Plus size={16} />}
            onClick={handleCreate}
            size="sm"
          >
            {t('employeeManagement.create')}
          </Button>
        }
      />

      {/* 查询表单 */}
      <div className="bg-white rounded-xl border border-gray-200 p-2 mb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('employeeManagement.search.username')}
            </label>
            <div className="relative">
              <User className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder={t('employeeManagement.search.usernamePlaceholder')}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('employeeManagement.search.email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t('employeeManagement.search.emailPlaceholder')}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('employeeManagement.search.status')}
            </label>
            <select
              value={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.value as '' | 'true' | 'false' })}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
            >
              <option value="">{t('employeeManagement.search.allStatus')}</option>
              <option value="true">{t('employeeManagement.search.active')}</option>
              <option value="false">{t('employeeManagement.search.inactive')}</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-end space-x-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('employeeManagement.search.reset')}
            </button>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
            >
              <Search className="h-3.5 w-3.5" />
              <span>{t('employeeManagement.search.search')}</span>
            </button>
          </div>
      </div>

      {/* 用户列表 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
            <div className="p-6 text-center">
              <div className="text-sm text-gray-500">{t('employeeManagement.loading')}</div>
            </div>
          ) : users.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-sm text-gray-500">{t('employeeManagement.noData')}</div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-1 py-1 text-left text-xs font-semibold text-gray-900">
                        {t('employeeManagement.table.username')}
                      </th>
                      <th className="px-1 py-1 text-left text-xs font-semibold text-gray-900">
                        {t('employeeManagement.table.displayName')}
                      </th>
                      <th className="px-1 py-1 text-left text-xs font-semibold text-gray-900">
                        {t('employeeManagement.table.email')}
                      </th>
                      <th className="px-1 py-1 text-left text-xs font-semibold text-gray-900">
                        {t('employeeManagement.table.organization')}
                      </th>
                      <th className="px-1 py-1 text-left text-xs font-semibold text-gray-900">
                        {t('employeeManagement.table.status')}
                      </th>
                      <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-900 w-20">
                        {t('employeeManagement.table.actions')}
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
                        <td className="px-2 py-1.5">
                          {user.is_active ? (
                            <span className="inline-flex items-center space-x-1 text-xs text-green-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>{t('employeeManagement.table.active')}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-xs text-red-600">
                              <XCircle className="h-3.5 w-3.5" />
                              <span>{t('employeeManagement.table.inactive')}</span>
                            </span>
                          )}
                        </td>
                        <td className="px-2 py-1.5">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-1 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                              title={t('employeeManagement.edit')}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(user)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title={t('employeeManagement.delete')}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 分页 */}
              {pages > 1 && (
                <div className="px-2 py-1.5 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-xs text-gray-600">
                    {t('employeeManagement.pagination.total').replace('{{total}}', total.toString())}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-2 py-0.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {t('employeeManagement.pagination.prev')}
                    </button>
                    <div className="text-xs text-gray-700">
                      {t('employeeManagement.pagination.page')
                        .replace('{{current}}', currentPage.toString())
                        .replace('{{total}}', pages.toString())}
                    </div>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pages}
                      className="px-2 py-0.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {t('employeeManagement.pagination.next')}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      {/* 创建/编辑弹窗 */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={handleCloseModal}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 弹窗头部 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
                {editingUser ? t('employeeManagement.edit') : t('employeeManagement.create')}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('employeeManagement.form.username')}
                    {!editingUser && <span className="text-gray-400 text-xs ml-1.5">({t('employeeManagement.form.optional')})</span>}
                  </label>
                  <input
                    type="text"
                    value={modalFormData.username}
                    onChange={(e) => setModalFormData({ ...modalFormData, username: e.target.value })}
                    disabled={!!editingUser}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm disabled:bg-gray-100"
                  />
                </div>
                {!editingUser && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {t('employeeManagement.form.password')}
                      <span className="text-gray-400 text-xs ml-1.5">({t('employeeManagement.form.optional')})</span>
                    </label>
                    <input
                      type="password"
                      value={modalFormData.password}
                      onChange={(e) => setModalFormData({ ...modalFormData, password: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('employeeManagement.form.email')}
                  </label>
                  <input
                    type="email"
                    value={modalFormData.email}
                    onChange={(e) => setModalFormData({ ...modalFormData, email: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('employeeManagement.form.displayName')}
                  </label>
                  <input
                    type="text"
                    value={modalFormData.display_name}
                    onChange={(e) => setModalFormData({ ...modalFormData, display_name: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('employeeManagement.form.organization')}
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={user?.primary_organization_name || t('employeeManagement.form.currentOrganization')}
                      disabled
                      className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 text-sm cursor-not-allowed"
                    />
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {t('employeeManagement.form.organizationHint')}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('employeeManagement.form.roles')}
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                    {roles.map((role) => (
                      <label
                        key={role.id}
                        className="flex items-center space-x-1.5 cursor-pointer hover:bg-gray-50 p-1.5 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={modalFormData.role_ids.includes(role.id)}
                          onChange={() => toggleRole(role.id)}
                          className="w-3.5 h-3.5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-xs text-gray-700">{role.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="flex items-center space-x-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modalFormData.is_active}
                      onChange={(e) => setModalFormData({ ...modalFormData, is_active: e.target.checked })}
                      className="w-3.5 h-3.5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-xs font-medium text-gray-700">
                      {t('employeeManagement.form.isActive')}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* 弹窗底部 */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 py-2.5 flex justify-end space-x-2">
              <button
                onClick={handleCloseModal}
                className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('employeeManagement.cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{t('employeeManagement.save')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EmployeeManagement

