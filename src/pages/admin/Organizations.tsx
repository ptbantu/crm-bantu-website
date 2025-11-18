/**
 * 组织管理页面
 * 支持三种组织类型的增删改查：internal（内部组织）、vendor（供应商）、agent（渠道代理）
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, Edit, Trash2, X, Building2, Mail, Phone, CheckCircle2, XCircle, Save, Eye, Globe, Users, Calendar, Lock, Shield } from 'lucide-react'
import {
  getOrganizationList,
  getOrganizationDetail,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
} from '@/api/organizations'
import { OrganizationListParams, Organization, OrganizationDetail } from '@/api/types'
import { useToast } from '@/components/ToastContainer'

const Organizations = () => {
  const { t } = useTranslation()
  const { showSuccess, showError } = useToast()

  // 查询参数
  const [queryParams, setQueryParams] = useState<OrganizationListParams>({
    page: 1,
    size: 10,
  })

  // 数据
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pages, setPages] = useState(0)

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    organization_type: '' as '' | 'internal' | 'vendor' | 'agent',
    is_active: '' as '' | 'true' | 'false',
  })

  // 弹窗状态
  const [showModal, setShowModal] = useState(false)
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null)
  const [modalFormData, setModalFormData] = useState({
    name: '',
    code: '',
    organization_type: 'internal' as 'internal' | 'vendor' | 'agent',
    email: '',
    phone: '',
    is_active: true,
  })
  const [submitting, setSubmitting] = useState(false)

  // 详情弹窗状态
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)
  const [orgDetail, setOrgDetail] = useState<OrganizationDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // 加载组织列表
  const loadOrganizations = async (params: OrganizationListParams) => {
    setLoading(true)
    try {
      const result = await getOrganizationList(params)
      setOrganizations(result.records)
      setTotal(result.total)
      setCurrentPage(result.current)
      setPages(result.pages)
    } catch (error: any) {
      showError(error.message || t('organizations.error.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadOrganizations(queryParams)
  }, [])

  // 处理查询
  const handleSearch = () => {
    const params: OrganizationListParams = {
      page: 1,
      size: queryParams.size || 10,
    }

    if (formData.name.trim()) {
      params.name = formData.name.trim()
    }
    if (formData.code.trim()) {
      params.code = formData.code.trim()
    }
    if (formData.organization_type) {
      params.organization_type = formData.organization_type
    }
    if (formData.is_active !== '') {
      params.is_active = formData.is_active === 'true'
    }

    setQueryParams(params)
    loadOrganizations(params)
  }

  // 重置查询
  const handleReset = () => {
    setFormData({
      name: '',
      code: '',
      organization_type: '',
      is_active: '',
    })
    const defaultParams: OrganizationListParams = {
      page: 1,
      size: 10,
    }
    setQueryParams(defaultParams)
    loadOrganizations(defaultParams)
  }

  // 分页
  const handlePageChange = (page: number) => {
    const params = { ...queryParams, page }
    setQueryParams(params)
    loadOrganizations(params)
  }

  // 打开创建弹窗
  const handleCreate = () => {
    setEditingOrg(null)
    setModalFormData({
      name: '',
      code: '',
      organization_type: 'internal',
      email: '',
      phone: '',
      is_active: true,
    })
    setShowModal(true)
  }

  // 打开编辑弹窗
  const handleEdit = async (org: Organization) => {
    setEditingOrg(org)
    try {
      // 获取组织详情以获取完整信息
      const detail = await getOrganizationDetail(org.id)
      setModalFormData({
        name: detail.name,
        code: detail.code || '',
        organization_type: detail.organization_type,
        email: detail.email || '',
        phone: detail.phone || '',
        is_active: detail.is_active,
      })
      setShowModal(true)
    } catch (error: any) {
      showError(error.message || t('organizations.error.loadDetailFailed'))
    }
  }

  // 关闭弹窗
  const handleCloseModal = () => {
    setShowModal(false)
    setEditingOrg(null)
    setModalFormData({
      name: '',
      code: '',
      organization_type: 'internal',
      email: '',
      phone: '',
      is_active: true,
    })
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!modalFormData.name.trim()) {
      showError(t('organizations.validation.nameRequired'))
      return
    }

    setSubmitting(true)
    try {
      if (editingOrg) {
        // 更新组织
        const updateData: UpdateOrganizationRequest = {
          name: modalFormData.name.trim(),
          code: modalFormData.code || undefined,
          email: modalFormData.email || undefined,
          phone: modalFormData.phone || undefined,
          is_active: modalFormData.is_active,
        }
        await updateOrganization(editingOrg.id, updateData)
        showSuccess(t('organizations.success.update'))
      } else {
        // 创建组织
        const createData: CreateOrganizationRequest = {
          name: modalFormData.name.trim(),
          code: modalFormData.code || undefined,
          organization_type: modalFormData.organization_type,
          email: modalFormData.email || undefined,
          phone: modalFormData.phone || undefined,
          is_active: modalFormData.is_active,
        }
        await createOrganization(createData)
        showSuccess(t('organizations.success.create'))
      }
      handleCloseModal()
      loadOrganizations(queryParams)
    } catch (error: any) {
      showError(error.message || t('organizations.error.saveFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  // 删除组织
  const handleDelete = async (org: Organization) => {
    if (!window.confirm(t('organizations.confirm.delete', { name: org.name }))) {
      return
    }

    try {
      await deleteOrganization(org.id)
      showSuccess(t('organizations.success.delete'))
      loadOrganizations(queryParams)
    } catch (error: any) {
      showError(error.message || t('organizations.error.deleteFailed'))
    }
  }

  // 打开详情弹窗
  const handleViewDetail = async (orgId: string) => {
    setSelectedOrgId(orgId)
    setShowDetailModal(true)
    setLoadingDetail(true)
    try {
      const detail = await getOrganizationDetail(orgId)
      setOrgDetail(detail)
    } catch (error: any) {
      showError(error.message || t('organizations.error.loadDetailFailed'))
      setShowDetailModal(false)
    } finally {
      setLoadingDetail(false)
    }
  }

  // 关闭详情弹窗
  const handleCloseDetail = () => {
    setShowDetailModal(false)
    setSelectedOrgId(null)
    setOrgDetail(null)
  }

  // 获取组织类型标签
  const getOrganizationTypeLabel = (type: string) => {
    switch (type) {
      case 'internal':
        return t('organizations.type.internal')
      case 'vendor':
        return t('organizations.type.vendor')
      case 'agent':
        return t('organizations.type.agent')
      default:
        return type
    }
  }

  // 获取组织类型颜色
  const getOrganizationTypeColor = (type: string) => {
    switch (type) {
      case 'internal':
        return 'bg-blue-50 text-blue-600'
      case 'vendor':
        return 'bg-green-50 text-green-600'
      case 'agent':
        return 'bg-purple-50 text-purple-600'
      default:
        return 'bg-gray-50 text-gray-600'
    }
  }

  return (
    <div className="w-full">
        {/* 页面标题 */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-1.5 tracking-tight">
              {t('organizations.title')}
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              {t('organizations.subtitle')}
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{t('organizations.create')}</span>
          </button>
        </div>

        {/* 查询表单 */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 mb-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('organizations.search.name')}
              </label>
              <div className="relative">
                <Building2 className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('organizations.search.namePlaceholder')}
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('organizations.search.code')}
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder={t('organizations.search.codePlaceholder')}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('organizations.search.type')}
              </label>
              <select
                value={formData.organization_type}
                onChange={(e) => setFormData({ ...formData, organization_type: e.target.value as '' | 'internal' | 'vendor' | 'agent' })}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
              >
                <option value="">{t('organizations.search.allTypes')}</option>
                <option value="internal">{t('organizations.type.internal')}</option>
                <option value="vendor">{t('organizations.type.vendor')}</option>
                <option value="agent">{t('organizations.type.agent')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('organizations.search.status')}
              </label>
              <select
                value={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value as '' | 'true' | 'false' })}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
              >
                <option value="">{t('organizations.search.allStatus')}</option>
                <option value="true">{t('organizations.search.active')}</option>
                <option value="false">{t('organizations.search.inactive')}</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('organizations.search.reset')}
            </button>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
            >
              <Search className="h-3.5 w-3.5" />
              <span>{t('organizations.search.search')}</span>
            </button>
          </div>
        </div>

        {/* 组织列表 */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-6 text-center">
              <div className="text-sm text-gray-500">{t('organizations.loading')}</div>
            </div>
          ) : organizations.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-sm text-gray-500">{t('organizations.noData')}</div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-900">
                        {t('organizations.table.name')}
                      </th>
                      <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-900">
                        {t('organizations.table.code')}
                      </th>
                      <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-900">
                        {t('organizations.table.type')}
                      </th>
                      <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-900">
                        {t('organizations.table.email')}
                      </th>
                      <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-900">
                        {t('organizations.table.phone')}
                      </th>
                      <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-900">
                        {t('organizations.table.website')}
                      </th>
                      <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-900">
                        {t('organizations.table.employees')}
                      </th>
                      <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-900">
                        {t('organizations.table.status')}
                      </th>
                      <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-900 w-20">
                        {t('organizations.table.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {organizations.map((org) => (
                      <tr
                        key={org.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-2 py-1.5 text-sm text-gray-900 font-medium">
                          {org.name}
                        </td>
                        <td className="px-2 py-1.5 text-sm text-gray-700">
                          {org.code || '-'}
                        </td>
                        <td className="px-2 py-1.5">
                          <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${getOrganizationTypeColor(org.organization_type)}`}>
                            {getOrganizationTypeLabel(org.organization_type)}
                          </span>
                        </td>
                        <td className="px-2 py-1.5 text-sm text-gray-700">
                          <div className="flex items-center space-x-1.5">
                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                            <span>{org.email || '-'}</span>
                          </div>
                        </td>
                        <td className="px-2 py-1.5 text-sm text-gray-700">
                          <div className="flex items-center space-x-1.5">
                            <Phone className="h-3.5 w-3.5 text-gray-400" />
                            <span>{org.phone || '-'}</span>
                          </div>
                        </td>
                        <td className="px-2 py-1.5 text-sm text-gray-700">
                          {org.website ? (
                            <a
                              href={org.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center space-x-1.5 text-primary-600 hover:text-primary-700"
                            >
                              <Globe className="h-3.5 w-3.5" />
                              <span className="truncate max-w-xs">{org.website}</span>
                            </a>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-2 py-1.5 text-sm text-gray-700">
                          <div className="flex items-center space-x-1.5">
                            <Users className="h-3.5 w-3.5 text-gray-400" />
                            <span>{org.employees_count ?? 0}</span>
                          </div>
                        </td>
                        <td className="px-2 py-1.5">
                          <div className="flex flex-col space-y-0.5">
                            {org.is_active ? (
                              <span className="inline-flex items-center space-x-1 text-xs text-green-600">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>{t('organizations.table.active')}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 text-xs text-red-600">
                                <XCircle className="h-3.5 w-3.5" />
                                <span>{t('organizations.table.inactive')}</span>
                              </span>
                            )}
                            {org.is_locked && (
                              <span className="inline-flex items-center space-x-1 text-xs text-orange-600">
                                <Lock className="h-3 w-3" />
                                <span>{t('organizations.table.locked')}</span>
                              </span>
                            )}
                            {org.is_verified && (
                              <span className="inline-flex items-center space-x-1 text-xs text-blue-600">
                                <Shield className="h-3 w-3" />
                                <span>{t('organizations.table.verified')}</span>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-2 py-1.5">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleViewDetail(org.id)}
                              className="p-1 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                              title={t('organizations.detail.title')}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleEdit(org)}
                              className="p-1 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                              title={t('organizations.edit')}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(org)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title={t('organizations.delete')}
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
                    {t('organizations.pagination.total').replace('{{total}}', total.toString())}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-2 py-0.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {t('organizations.pagination.prev')}
                    </button>
                    <div className="text-xs text-gray-700">
                      {t('organizations.pagination.page')
                        .replace('{{current}}', currentPage.toString())
                        .replace('{{total}}', pages.toString())}
                    </div>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pages}
                      className="px-2 py-0.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {t('organizations.pagination.next')}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
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
                {editingOrg ? t('organizations.edit') : t('organizations.create')}
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
                    {t('organizations.form.name')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={modalFormData.name}
                    onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('organizations.form.code')}
                  </label>
                  <input
                    type="text"
                    value={modalFormData.code}
                    onChange={(e) => setModalFormData({ ...modalFormData, code: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('organizations.form.type')} {!editingOrg && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    value={modalFormData.organization_type}
                    onChange={(e) => setModalFormData({ ...modalFormData, organization_type: e.target.value as 'internal' | 'vendor' | 'agent' })}
                    disabled={!!editingOrg}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white disabled:bg-gray-100"
                  >
                    <option value="internal">{t('organizations.type.internal')}</option>
                    <option value="vendor">{t('organizations.type.vendor')}</option>
                    <option value="agent">{t('organizations.type.agent')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('organizations.form.email')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input
                      type="email"
                      value={modalFormData.email}
                      onChange={(e) => setModalFormData({ ...modalFormData, email: e.target.value })}
                      className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('organizations.form.phone')}
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                    <input
                      type="tel"
                      value={modalFormData.phone}
                      onChange={(e) => setModalFormData({ ...modalFormData, phone: e.target.value })}
                      className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
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
                      {t('organizations.form.isActive')}
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
                {t('organizations.cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{t('organizations.save')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 详情弹窗 */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={handleCloseDetail}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 弹窗头部 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
                {t('organizations.detail.title')}
              </h2>
              <button
                onClick={handleCloseDetail}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 弹窗内容 */}
            {loadingDetail ? (
              <div className="p-6 text-center">
                <div className="text-sm text-gray-500">{t('organizations.loading')}</div>
              </div>
            ) : orgDetail ? (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 基本信息 */}
                  <div className="space-y-2.5">
                    <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-1.5">
                      {t('organizations.detail.basicInfo')}
                    </h3>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-0.5">
                        {t('organizations.table.name')}
                      </label>
                      <div className="text-sm text-gray-900 font-medium">{orgDetail.name}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-0.5">
                        {t('organizations.table.code')}
                      </label>
                      <div className="text-sm text-gray-900">{orgDetail.code || '-'}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-0.5">
                        {t('organizations.table.type')}
                      </label>
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${getOrganizationTypeColor(orgDetail.organization_type)}`}>
                        {getOrganizationTypeLabel(orgDetail.organization_type)}
                      </span>
                    </div>
                    {orgDetail.description && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('organizations.detail.description')}
                        </label>
                        <div className="text-sm text-gray-900 whitespace-pre-wrap">{orgDetail.description}</div>
                      </div>
                    )}
                  </div>

                  {/* 联系信息 */}
                  <div className="space-y-2.5">
                    <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-1.5">
                      {t('organizations.detail.contactInfo')}
                    </h3>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-0.5">
                        {t('organizations.table.email')}
                      </label>
                      <div className="flex items-center space-x-1.5 text-sm text-gray-900">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        <span>{orgDetail.email || '-'}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-0.5">
                        {t('organizations.table.phone')}
                      </label>
                      <div className="flex items-center space-x-1.5 text-sm text-gray-900">
                        <Phone className="h-3.5 w-3.5 text-gray-400" />
                        <span>{orgDetail.phone || '-'}</span>
                      </div>
                    </div>
                    {orgDetail.website && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('organizations.table.website')}
                        </label>
                        <a
                          href={orgDetail.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1.5 text-sm text-primary-600 hover:text-primary-700"
                        >
                          <Globe className="h-3.5 w-3.5" />
                          <span>{orgDetail.website}</span>
                        </a>
                      </div>
                    )}
                  </div>

                  {/* 状态信息 */}
                  <div className="space-y-2.5">
                    <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-1.5">
                      {t('organizations.detail.statusInfo')}
                    </h3>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-0.5">
                        {t('organizations.table.status')}
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {orgDetail.is_active ? (
                          <span className="inline-flex items-center space-x-1 text-xs text-green-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>{t('organizations.table.active')}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-xs text-red-600">
                            <XCircle className="h-3.5 w-3.5" />
                            <span>{t('organizations.table.inactive')}</span>
                          </span>
                        )}
                        {orgDetail.is_locked && (
                          <span className="inline-flex items-center space-x-1 text-xs text-orange-600">
                            <Lock className="h-3 w-3" />
                            <span>{t('organizations.table.locked')}</span>
                          </span>
                        )}
                        {orgDetail.is_verified && (
                          <span className="inline-flex items-center space-x-1 text-xs text-blue-600">
                            <Shield className="h-3 w-3" />
                            <span>{t('organizations.table.verified')}</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-0.5">
                        {t('organizations.table.employees')}
                      </label>
                      <div className="flex items-center space-x-1.5 text-sm text-gray-900">
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                        <span>{orgDetail.employees_count ?? 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* 时间信息 */}
                  <div className="space-y-2.5">
                    <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-1.5">
                      {t('organizations.detail.timeInfo')}
                    </h3>
                    {orgDetail.created_at && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('organizations.detail.createdAt')}
                        </label>
                        <div className="flex items-center space-x-1.5 text-sm text-gray-900">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span>{new Date(orgDetail.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                    {orgDetail.updated_at && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('organizations.detail.updatedAt')}
                        </label>
                        <div className="flex items-center space-x-1.5 text-sm text-gray-900">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span>{new Date(orgDetail.updated_at).toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

export default Organizations

