/**
 * 客户列表页面
 * 支持条件查询、列表展示、分页、增删改查
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, Edit, Trash2, X, Users, Building2, User, CheckCircle2, XCircle, Eye, Mail, Phone, Tag } from 'lucide-react'
import {
  getCustomerList,
  getCustomerDetail,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from '@/api/customers'
import { CustomerListParams, Customer } from '@/api/types'
import { useToast } from '@/components/ToastContainer'

const CustomerList = () => {
  const { t } = useTranslation()
  const { showSuccess, showError } = useToast()

  // 查询参数
  const [queryParams, setQueryParams] = useState<CustomerListParams>({
    page: 1,
    size: 10,
  })

  // 数据
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pages, setPages] = useState(0)

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    customer_type: '' as '' | 'individual' | 'organization',
    customer_source_type: '' as '' | 'own' | 'agent',
    is_locked: '' as '' | 'true' | 'false',
  })

  // 弹窗状态
  const [showModal, setShowModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [modalFormData, setModalFormData] = useState({
    name: '',
    code: '',
    customer_type: 'individual' as 'individual' | 'organization',
    customer_source_type: 'own' as 'own' | 'agent',
    parent_customer_id: '',
    owner_user_id: '',
    agent_id: '',
    source_id: '',
    channel_id: '',
    level: '',
    industry: '',
    description: '',
    tags: [] as string[],
    is_locked: false,
    customer_requirements: '',
  })
  const [submitting, setSubmitting] = useState(false)

  // 详情弹窗状态
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [customerDetail, setCustomerDetail] = useState<Customer | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // 加载客户列表
  const loadCustomers = async (params: CustomerListParams) => {
    setLoading(true)
    try {
      const result = await getCustomerList(params)
      setCustomers(result.records)
      setTotal(result.total)
      setCurrentPage(result.current)
      setPages(result.pages)
    } catch (error: any) {
      showError(error.message || t('customerList.error.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadCustomers(queryParams)
  }, [])

  // 处理查询
  const handleSearch = () => {
    const params: CustomerListParams = {
      page: 1,
      size: queryParams.size || 10,
    }

    if (formData.name.trim()) {
      params.name = formData.name.trim()
    }
    if (formData.code.trim()) {
      params.code = formData.code.trim()
    }
    if (formData.customer_type) {
      params.customer_type = formData.customer_type
    }
    if (formData.customer_source_type) {
      params.customer_source_type = formData.customer_source_type
    }
    if (formData.is_locked !== '') {
      params.is_locked = formData.is_locked === 'true'
    }

    setQueryParams(params)
    loadCustomers(params)
  }

  // 打开创建弹窗
  const handleCreate = () => {
    setEditingCustomer(null)
    setModalFormData({
      name: '',
      code: '',
      customer_type: 'individual',
      customer_source_type: 'own',
      parent_customer_id: '',
      owner_user_id: '',
      agent_id: '',
      source_id: '',
      channel_id: '',
      level: '',
      industry: '',
      description: '',
      tags: [],
      is_locked: false,
      customer_requirements: '',
    })
    setShowModal(true)
  }

  // 打开编辑弹窗
  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setModalFormData({
      name: customer.name,
      code: customer.code || '',
      customer_type: customer.customer_type,
      customer_source_type: customer.customer_source_type,
      parent_customer_id: customer.parent_customer_id || '',
      owner_user_id: customer.owner_user_id || '',
      agent_id: customer.agent_id || '',
      source_id: customer.source_id || '',
      channel_id: customer.channel_id || '',
      level: customer.level || '',
      industry: customer.industry || '',
      description: customer.description || '',
      tags: customer.tags || [],
      is_locked: customer.is_locked || false,
      customer_requirements: customer.customer_requirements || '',
    })
    setShowModal(true)
  }

  // 打开详情弹窗
  const handleViewDetail = async (customerId: string) => {
    setSelectedCustomerId(customerId)
    setShowDetailModal(true)
    setLoadingDetail(true)
    try {
      const detail = await getCustomerDetail(customerId)
      setCustomerDetail(detail)
    } catch (error: any) {
      showError(error.message || t('customerList.error.loadDetailFailed'))
      setShowDetailModal(false)
    } finally {
      setLoadingDetail(false)
    }
  }

  // 关闭详情弹窗
  const handleCloseDetail = () => {
    setShowDetailModal(false)
    setSelectedCustomerId(null)
    setCustomerDetail(null)
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!modalFormData.name.trim()) {
      showError(t('customerList.error.nameRequired'))
      return
    }

    setSubmitting(true)
    try {
      if (editingCustomer) {
        // 更新
        const updateData: UpdateCustomerRequest = {
          name: modalFormData.name,
          code: modalFormData.code || null,
          customer_type: modalFormData.customer_type,
          customer_source_type: modalFormData.customer_source_type,
          parent_customer_id: modalFormData.parent_customer_id || null,
          owner_user_id: modalFormData.owner_user_id || null,
          agent_id: modalFormData.agent_id || null,
          source_id: modalFormData.source_id || null,
          channel_id: modalFormData.channel_id || null,
          level: modalFormData.level || null,
          industry: modalFormData.industry || null,
          description: modalFormData.description || null,
          tags: modalFormData.tags,
          is_locked: modalFormData.is_locked,
          customer_requirements: modalFormData.customer_requirements || null,
        }
        await updateCustomer(editingCustomer.id, updateData)
        showSuccess(t('customerList.success.updateSuccess'))
      } else {
        // 创建
        const createData: CreateCustomerRequest = {
          name: modalFormData.name,
          code: modalFormData.code || null,
          customer_type: modalFormData.customer_type,
          customer_source_type: modalFormData.customer_source_type,
          parent_customer_id: modalFormData.parent_customer_id || null,
          owner_user_id: modalFormData.owner_user_id || null,
          agent_id: modalFormData.agent_id || null,
          source_id: modalFormData.source_id || null,
          channel_id: modalFormData.channel_id || null,
          level: modalFormData.level || null,
          industry: modalFormData.industry || null,
          description: modalFormData.description || null,
          tags: modalFormData.tags,
          is_locked: modalFormData.is_locked,
          customer_requirements: modalFormData.customer_requirements || null,
        }
        await createCustomer(createData)
        showSuccess(t('customerList.success.createSuccess'))
      }
      setShowModal(false)
      loadCustomers(queryParams)
    } catch (error: any) {
      showError(error.message || t('customerList.error.submitFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  // 删除客户
  const handleDelete = async (customer: Customer) => {
    if (!window.confirm(t('customerList.confirm.delete', { name: customer.name }))) {
      return
    }

    try {
      await deleteCustomer(customer.id)
      showSuccess(t('customerList.success.deleteSuccess'))
      loadCustomers(queryParams)
    } catch (error: any) {
      showError(error.message || t('customerList.error.deleteFailed'))
    }
  }

  // 重置查询
  const handleReset = () => {
    setFormData({
      name: '',
      code: '',
      customer_type: '',
      customer_source_type: '',
      is_locked: '',
    })
    const defaultParams: CustomerListParams = {
      page: 1,
      size: 10,
    }
    setQueryParams(defaultParams)
    loadCustomers(defaultParams)
  }

  // 分页
  const handlePageChange = (page: number) => {
    const params = { ...queryParams, page }
    setQueryParams(params)
    loadCustomers(params)
  }

  return (
    <div className="w-full">
      {/* 页面标题 */}
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-1.5 tracking-tight">
          {t('customerList.title')}
        </h1>
        <p className="text-sm text-gray-500 font-medium">
          {t('customerList.subtitle')}
        </p>
      </div>

      {/* 查询表单 */}
      <div className="bg-white rounded-xl border border-gray-200 p-2 mb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
          {/* 客户名称 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('customerList.search.name')}
            </label>
            <div className="relative">
              <Users className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('customerList.search.namePlaceholder')}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          {/* 客户编码 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('customerList.search.code')}
            </label>
            <div className="relative">
              <Tag className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder={t('customerList.search.codePlaceholder')}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          {/* 客户类型 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('customerList.search.customerType')}
            </label>
            <select
              value={formData.customer_type}
              onChange={(e) => setFormData({ ...formData, customer_type: e.target.value as '' | 'individual' | 'organization' })}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
            >
              <option value="">{t('customerList.search.allTypes')}</option>
              <option value="individual">{t('customerList.search.individual')}</option>
              <option value="organization">{t('customerList.search.organization')}</option>
            </select>
          </div>

          {/* 客户来源类型 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('customerList.search.sourceType')}
            </label>
            <select
              value={formData.customer_source_type}
              onChange={(e) => setFormData({ ...formData, customer_source_type: e.target.value as '' | 'own' | 'agent' })}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
            >
              <option value="">{t('customerList.search.allSources')}</option>
              <option value="own">{t('customerList.search.own')}</option>
              <option value="agent">{t('customerList.search.agent')}</option>
            </select>
          </div>

          {/* 锁定状态 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('customerList.search.locked')}
            </label>
            <select
              value={formData.is_locked}
              onChange={(e) => setFormData({ ...formData, is_locked: e.target.value as '' | 'true' | 'false' })}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
            >
              <option value="">{t('customerList.search.allStatus')}</option>
              <option value="false">{t('customerList.search.unlocked')}</option>
              <option value="true">{t('customerList.search.locked')}</option>
            </select>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('customerList.search.reset')}
          </button>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
          >
            <Search className="h-3.5 w-3.5" />
            <span>{t('customerList.search.search')}</span>
          </button>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-600">
          {t('customerList.total', { total })}
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{t('customerList.create')}</span>
        </button>
      </div>

      {/* 客户列表 */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="text-gray-500">{t('customerList.loading')}</div>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <div className="text-gray-500">{t('customerList.noData')}</div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-1 py-1 text-left text-xs font-semibold text-gray-700">{t('customerList.table.name')}</th>
                  <th className="px-1 py-1 text-left text-xs font-semibold text-gray-700">{t('customerList.table.code')}</th>
                  <th className="px-1 py-1 text-left text-xs font-semibold text-gray-700">{t('customerList.table.type')}</th>
                  <th className="px-1 py-1 text-left text-xs font-semibold text-gray-700">{t('customerList.table.sourceType')}</th>
                  <th className="px-1 py-1 text-left text-xs font-semibold text-gray-700">{t('customerList.table.level')}</th>
                  <th className="px-1 py-1 text-left text-xs font-semibold text-gray-700">{t('customerList.table.status')}</th>
                  <th className="px-1 py-1 text-left text-xs font-semibold text-gray-700">{t('customerList.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-1 py-1 text-sm text-gray-900">{customer.name}</td>
                    <td className="px-1 py-1 text-sm text-gray-600">{customer.code || '-'}</td>
                    <td className="px-1 py-1 text-sm text-gray-600">
                      {customer.customer_type === 'individual' ? (
                        <span className="inline-flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{t('customerList.table.individual')}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1">
                          <Building2 className="h-3 w-3" />
                          <span>{t('customerList.table.organization')}</span>
                        </span>
                      )}
                    </td>
                    <td className="px-1 py-1 text-sm text-gray-600">
                      {customer.customer_source_type === 'own' ? t('customerList.table.own') : t('customerList.table.agent')}
                    </td>
                    <td className="px-1 py-1 text-sm text-gray-600">{customer.level || '-'}</td>
                    <td className="px-1 py-1 text-sm">
                      {customer.is_locked ? (
                        <span className="inline-flex items-center space-x-1 text-red-600">
                          <XCircle className="h-3 w-3" />
                          <span>{t('customerList.table.locked')}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{t('customerList.table.active')}</span>
                        </span>
                      )}
                    </td>
                    <td className="px-1 py-1 text-sm">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleViewDetail(customer.id)}
                          className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
                          title={t('customerList.actions.view')}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleEdit(customer)}
                          className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
                          title={t('customerList.actions.edit')}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(customer)}
                          className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                          title={t('customerList.actions.delete')}
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
        </div>
      )}

      {/* 分页 */}
      {pages > 1 && (
        <div className="mt-2 flex items-center justify-between bg-white rounded-xl border border-gray-200 px-1 py-1">
          <div className="text-xs text-gray-600">
            {t('customerList.pagination.info', { current: currentPage, total: pages, size: queryParams.size || 10 })}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('customerList.pagination.prev')}
            </button>
            {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
              let pageNum: number
              if (pages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= pages - 2) {
                pageNum = pages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    currentPage === pageNum
                      ? 'text-white bg-primary-600'
                      : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pages}
              className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('customerList.pagination.next')}
            </button>
          </div>
        </div>
      )}

      {/* 创建/编辑弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingCustomer ? t('customerList.modal.editTitle') : t('customerList.modal.createTitle')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {/* 客户名称 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('customerList.modal.name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={modalFormData.name}
                  onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  placeholder={t('customerList.modal.namePlaceholder')}
                />
              </div>

              {/* 客户编码 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('customerList.modal.code')}
                </label>
                <input
                  type="text"
                  value={modalFormData.code}
                  onChange={(e) => setModalFormData({ ...modalFormData, code: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  placeholder={t('customerList.modal.codePlaceholder')}
                />
              </div>

              {/* 客户类型 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('customerList.modal.customerType')}
                </label>
                <select
                  value={modalFormData.customer_type}
                  onChange={(e) => setModalFormData({ ...modalFormData, customer_type: e.target.value as 'individual' | 'organization' })}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="individual">{t('customerList.modal.individual')}</option>
                  <option value="organization">{t('customerList.modal.organization')}</option>
                </select>
              </div>

              {/* 客户来源类型 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('customerList.modal.sourceType')}
                </label>
                <select
                  value={modalFormData.customer_source_type}
                  onChange={(e) => setModalFormData({ ...modalFormData, customer_source_type: e.target.value as 'own' | 'agent' })}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="own">{t('customerList.modal.own')}</option>
                  <option value="agent">{t('customerList.modal.agent')}</option>
                </select>
              </div>

              {/* 客户等级 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('customerList.modal.level')}
                </label>
                <input
                  type="text"
                  value={modalFormData.level}
                  onChange={(e) => setModalFormData({ ...modalFormData, level: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  placeholder={t('customerList.modal.levelPlaceholder')}
                />
              </div>

              {/* 行业 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('customerList.modal.industry')}
                </label>
                <input
                  type="text"
                  value={modalFormData.industry}
                  onChange={(e) => setModalFormData({ ...modalFormData, industry: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  placeholder={t('customerList.modal.industryPlaceholder')}
                />
              </div>

              {/* 描述 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('customerList.modal.description')}
                </label>
                <textarea
                  value={modalFormData.description}
                  onChange={(e) => setModalFormData({ ...modalFormData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  placeholder={t('customerList.modal.descriptionPlaceholder')}
                />
              </div>

              {/* 是否锁定 */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_locked"
                  checked={modalFormData.is_locked}
                  onChange={(e) => setModalFormData({ ...modalFormData, is_locked: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="is_locked" className="text-xs font-medium text-gray-700">
                  {t('customerList.modal.isLocked')}
                </label>
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('customerList.modal.cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t('customerList.modal.submitting') : t('customerList.modal.submit')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 详情弹窗 */}
      {showDetailModal && customerDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {t('customerList.detail.title')}
              </h2>
              <button
                onClick={handleCloseDetail}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {loadingDetail ? (
              <div className="p-8 text-center">
                <div className="text-gray-500">{t('customerList.detail.loading')}</div>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {/* 基本信息 */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">{t('customerList.detail.basicInfo')}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">{t('customerList.detail.name')}:</span>
                      <span className="ml-2 text-gray-900">{customerDetail.name}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('customerList.detail.code')}:</span>
                      <span className="ml-2 text-gray-900">{customerDetail.code || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('customerList.detail.type')}:</span>
                      <span className="ml-2 text-gray-900">
                        {customerDetail.customer_type === 'individual' ? t('customerList.detail.individual') : t('customerList.detail.organization')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('customerList.detail.sourceType')}:</span>
                      <span className="ml-2 text-gray-900">
                        {customerDetail.customer_source_type === 'own' ? t('customerList.detail.own') : t('customerList.detail.agent')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('customerList.detail.level')}:</span>
                      <span className="ml-2 text-gray-900">{customerDetail.level || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('customerList.detail.industry')}:</span>
                      <span className="ml-2 text-gray-900">{customerDetail.industry || '-'}</span>
                    </div>
                    {customerDetail.description && (
                      <div className="col-span-2">
                        <span className="text-gray-600">{t('customerList.detail.description')}:</span>
                        <p className="mt-1 text-gray-900">{customerDetail.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 标签 */}
                {customerDetail.tags && customerDetail.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">{t('customerList.detail.tags')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {customerDetail.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded-lg"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-end">
              <button
                onClick={handleCloseDetail}
                className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('customerList.detail.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerList

