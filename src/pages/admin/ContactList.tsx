/**
 * 客户维护人员列表页面
 * 用于管理客户的联系人（维护人员），支持按客户筛选、增删改查
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, Edit, Trash2, X, Contact2, User, CheckCircle2, XCircle, Eye, Mail, Phone, Users, Building2 } from 'lucide-react'
import {
  getContactListByCustomer,
  getContactDetail,
  createContact,
  updateContact,
  deleteContact,
  CreateContactRequest,
  UpdateContactRequest,
} from '@/api/contacts'
import { getCustomerList } from '@/api/customers'
import { ContactListParams, Contact, Customer } from '@/api/types'
import { useToast } from '@/components/ToastContainer'

const ContactList = () => {
  const { t } = useTranslation()
  const { showSuccess, showError } = useToast()

  // 查询参数
  const [queryParams, setQueryParams] = useState<ContactListParams>({
    page: 1,
    size: 10,
  })

  // 数据
  const [contacts, setContacts] = useState<Contact[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pages, setPages] = useState(0)

  // 表单状态
  const [formData, setFormData] = useState({
    customer_id: '',
    is_primary: '' as '' | 'true' | 'false',
    is_active: '' as '' | 'true' | 'false',
  })

  // 弹窗状态
  const [showModal, setShowModal] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [modalFormData, setModalFormData] = useState({
    customer_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    mobile: '',
    wechat_id: '',
    position: '',
    department: '',
    contact_role: '',
    is_primary: false,
    is_decision_maker: false,
    address: '',
    city: '',
    province: '',
    country: '',
    postal_code: '',
    preferred_contact_method: '',
    is_active: true,
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)

  // 详情弹窗状态
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [contactDetail, setContactDetail] = useState<Contact | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // 加载客户列表（用于下拉选择）
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const result = await getCustomerList({ size: 1000 })
        setCustomers(result.records)
      } catch (error: any) {
        console.error('Failed to load customers:', error)
      }
    }
    loadCustomers()
  }, [])

  // 加载联系人列表
  const loadContacts = async (params: ContactListParams) => {
    if (!params.customer_id) {
      setContacts([])
      setTotal(0)
      setCurrentPage(1)
      setPages(0)
      return
    }

    setLoading(true)
    try {
      const result = await getContactListByCustomer(params.customer_id, params)
      setContacts(result.records)
      setTotal(result.total)
      setCurrentPage(result.current)
      setPages(result.pages)
    } catch (error: any) {
      showError(error.message || t('contactList.error.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  // 当客户ID变化时自动加载
  useEffect(() => {
    if (formData.customer_id) {
      const params: ContactListParams = {
        page: 1,
        size: queryParams.size || 10,
        customer_id: formData.customer_id,
      }
      if (formData.is_primary !== '') {
        params.is_primary = formData.is_primary === 'true'
      }
      if (formData.is_active !== '') {
        params.is_active = formData.is_active === 'true'
      }
      setQueryParams(params)
      loadContacts(params)
    } else {
      setContacts([])
      setTotal(0)
    }
  }, [formData.customer_id])

  // 处理查询
  const handleSearch = () => {
    if (!formData.customer_id) {
      showError(t('contactList.error.selectCustomer'))
      return
    }

    const params: ContactListParams = {
      page: 1,
      size: queryParams.size || 10,
      customer_id: formData.customer_id,
    }
    if (formData.is_primary !== '') {
      params.is_primary = formData.is_primary === 'true'
    }
    if (formData.is_active !== '') {
      params.is_active = formData.is_active === 'true'
    }

    setQueryParams(params)
    loadContacts(params)
  }

  // 打开创建弹窗
  const handleCreate = () => {
    if (!formData.customer_id) {
      showError(t('contactList.error.selectCustomer'))
      return
    }

    setEditingContact(null)
    setModalFormData({
      customer_id: formData.customer_id,
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      mobile: '',
      wechat_id: '',
      position: '',
      department: '',
      contact_role: '',
      is_primary: false,
      is_decision_maker: false,
      address: '',
      city: '',
      province: '',
      country: '',
      postal_code: '',
      preferred_contact_method: '',
      is_active: true,
      notes: '',
    })
    setShowModal(true)
  }

  // 打开编辑弹窗
  const handleEdit = (contact: Contact) => {
    setEditingContact(contact)
    setModalFormData({
      customer_id: contact.customer_id,
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email || '',
      phone: contact.phone || '',
      mobile: contact.mobile || '',
      wechat_id: contact.wechat_id || '',
      position: contact.position || '',
      department: contact.department || '',
      contact_role: contact.contact_role || '',
      is_primary: contact.is_primary,
      is_decision_maker: contact.is_decision_maker,
      address: contact.address || '',
      city: contact.city || '',
      province: contact.province || '',
      country: contact.country || '',
      postal_code: contact.postal_code || '',
      preferred_contact_method: contact.preferred_contact_method || '',
      is_active: contact.is_active,
      notes: contact.notes || '',
    })
    setShowModal(true)
  }

  // 打开详情弹窗
  const handleViewDetail = async (contactId: string) => {
    setSelectedContactId(contactId)
    setShowDetailModal(true)
    setLoadingDetail(true)
    try {
      const detail = await getContactDetail(contactId)
      setContactDetail(detail)
    } catch (error: any) {
      showError(error.message || t('contactList.error.loadDetailFailed'))
      setShowDetailModal(false)
    } finally {
      setLoadingDetail(false)
    }
  }

  // 关闭详情弹窗
  const handleCloseDetail = () => {
    setShowDetailModal(false)
    setSelectedContactId(null)
    setContactDetail(null)
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!modalFormData.first_name.trim() || !modalFormData.last_name.trim()) {
      showError(t('contactList.error.nameRequired'))
      return
    }

    if (!modalFormData.customer_id) {
      showError(t('contactList.error.selectCustomer'))
      return
    }

    setSubmitting(true)
    try {
      if (editingContact) {
        // 更新
        const updateData: UpdateContactRequest = {
          first_name: modalFormData.first_name,
          last_name: modalFormData.last_name,
          email: modalFormData.email || null,
          phone: modalFormData.phone || null,
          mobile: modalFormData.mobile || null,
          wechat_id: modalFormData.wechat_id || null,
          position: modalFormData.position || null,
          department: modalFormData.department || null,
          contact_role: modalFormData.contact_role || null,
          is_primary: modalFormData.is_primary,
          is_decision_maker: modalFormData.is_decision_maker,
          address: modalFormData.address || null,
          city: modalFormData.city || null,
          province: modalFormData.province || null,
          country: modalFormData.country || null,
          postal_code: modalFormData.postal_code || null,
          preferred_contact_method: modalFormData.preferred_contact_method || null,
          is_active: modalFormData.is_active,
          notes: modalFormData.notes || null,
        }
        await updateContact(editingContact.id, updateData)
        showSuccess(t('contactList.success.updateSuccess'))
      } else {
        // 创建
        const createData: CreateContactRequest = {
          customer_id: modalFormData.customer_id,
          first_name: modalFormData.first_name,
          last_name: modalFormData.last_name,
          email: modalFormData.email || null,
          phone: modalFormData.phone || null,
          mobile: modalFormData.mobile || null,
          wechat_id: modalFormData.wechat_id || null,
          position: modalFormData.position || null,
          department: modalFormData.department || null,
          contact_role: modalFormData.contact_role || null,
          is_primary: modalFormData.is_primary,
          is_decision_maker: modalFormData.is_decision_maker,
          address: modalFormData.address || null,
          city: modalFormData.city || null,
          province: modalFormData.province || null,
          country: modalFormData.country || null,
          postal_code: modalFormData.postal_code || null,
          preferred_contact_method: modalFormData.preferred_contact_method || null,
          is_active: modalFormData.is_active,
          notes: modalFormData.notes || null,
        }
        await createContact(createData)
        showSuccess(t('contactList.success.createSuccess'))
      }
      setShowModal(false)
      loadContacts(queryParams)
    } catch (error: any) {
      showError(error.message || t('contactList.error.submitFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  // 删除联系人
  const handleDelete = async (contact: Contact) => {
    if (!window.confirm(t('contactList.confirm.delete', { name: contact.full_name || `${contact.first_name} ${contact.last_name}` }))) {
      return
    }

    try {
      await deleteContact(contact.id)
      showSuccess(t('contactList.success.deleteSuccess'))
      loadContacts(queryParams)
    } catch (error: any) {
      showError(error.message || t('contactList.error.deleteFailed'))
    }
  }

  // 重置查询
  const handleReset = () => {
    setFormData({
      customer_id: '',
      is_primary: '',
      is_active: '',
    })
    setContacts([])
    setTotal(0)
  }

  // 分页
  const handlePageChange = (page: number) => {
    const params = { ...queryParams, page }
    setQueryParams(params)
    loadContacts(params)
  }

  // 获取客户名称
  const getCustomerName = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId)
    return customer?.name || customerId
  }

  return (
    <div className="w-full">
      {/* 页面标题 */}
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-1.5 tracking-tight">
          {t('contactList.title')}
        </h1>
        <p className="text-sm text-gray-500 font-medium">
          {t('contactList.subtitle')}
        </p>
      </div>

      {/* 查询表单 */}
      <div className="bg-white rounded-xl border border-gray-200 p-2 mb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
          {/* 客户选择 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('contactList.search.customer')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Users className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <select
                value={formData.customer_id}
                onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
              >
                <option value="">{t('contactList.search.selectCustomer')}</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} {customer.code ? `(${customer.code})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 是否主要联系人 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('contactList.search.isPrimary')}
            </label>
            <select
              value={formData.is_primary}
              onChange={(e) => setFormData({ ...formData, is_primary: e.target.value as '' | 'true' | 'false' })}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
            >
              <option value="">{t('contactList.search.allStatus')}</option>
              <option value="true">{t('contactList.search.primary')}</option>
              <option value="false">{t('contactList.search.nonPrimary')}</option>
            </select>
          </div>

          {/* 激活状态 */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('contactList.search.status')}
            </label>
            <select
              value={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.value as '' | 'true' | 'false' })}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
            >
              <option value="">{t('contactList.search.allStatus')}</option>
              <option value="true">{t('contactList.search.active')}</option>
              <option value="false">{t('contactList.search.inactive')}</option>
            </select>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('contactList.search.reset')}
          </button>
          <button
            onClick={handleSearch}
            disabled={loading || !formData.customer_id}
            className="px-4 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
          >
            <Search className="h-3.5 w-3.5" />
            <span>{t('contactList.search.search')}</span>
          </button>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-600">
          {t('contactList.total', { total })}
        </div>
        <button
          onClick={handleCreate}
          disabled={!formData.customer_id}
          className="px-4 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{t('contactList.create')}</span>
        </button>
      </div>

      {/* 联系人列表 */}
      {!formData.customer_id ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <div className="text-gray-500">{t('contactList.selectCustomerFirst')}</div>
        </div>
      ) : loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="text-gray-500">{t('contactList.loading')}</div>
        </div>
      ) : contacts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Contact2 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <div className="text-gray-500">{t('contactList.noData')}</div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-1 py-1 text-left text-xs font-semibold text-gray-700">{t('contactList.table.name')}</th>
                  <th className="px-1 py-1 text-left text-xs font-semibold text-gray-700">{t('contactList.table.customer')}</th>
                  <th className="px-1 py-1 text-left text-xs font-semibold text-gray-700">{t('contactList.table.position')}</th>
                  <th className="px-1 py-1 text-left text-xs font-semibold text-gray-700">{t('contactList.table.contact')}</th>
                  <th className="px-1 py-1 text-left text-xs font-semibold text-gray-700">{t('contactList.table.role')}</th>
                  <th className="px-1 py-1 text-left text-xs font-semibold text-gray-700">{t('contactList.table.status')}</th>
                  <th className="px-1 py-1 text-left text-xs font-semibold text-gray-700">{t('contactList.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-1 py-1 text-sm text-gray-900">
                      {contact.full_name || `${contact.first_name} ${contact.last_name}`}
                    </td>
                    <td className="px-1 py-1 text-sm text-gray-600">{contact.customer_name || getCustomerName(contact.customer_id)}</td>
                    <td className="px-1 py-1 text-sm text-gray-600">{contact.position || '-'}</td>
                    <td className="px-1 py-1 text-sm text-gray-600">
                      <div className="flex flex-col space-y-0.5">
                        {contact.mobile && (
                          <div className="flex items-center space-x-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <span>{contact.mobile}</span>
                          </div>
                        )}
                        {contact.email && (
                          <div className="flex items-center space-x-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <span className="truncate max-w-xs">{contact.email}</span>
                          </div>
                        )}
                        {!contact.mobile && !contact.email && '-'}
                      </div>
                    </td>
                    <td className="px-1 py-1 text-sm">
                      <div className="flex flex-wrap gap-1">
                        {contact.is_primary && (
                          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 text-xs font-medium text-primary-700 bg-primary-50 rounded">
                            <User className="h-3 w-3" />
                            <span>{t('contactList.table.primary')}</span>
                          </span>
                        )}
                        {contact.is_decision_maker && (
                          <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 text-xs font-medium text-orange-700 bg-orange-50 rounded">
                            <Building2 className="h-3 w-3" />
                            <span>{t('contactList.table.decisionMaker')}</span>
                          </span>
                        )}
                        {!contact.is_primary && !contact.is_decision_maker && '-'}
                      </div>
                    </td>
                    <td className="px-1 py-1 text-sm">
                      {contact.is_active ? (
                        <span className="inline-flex items-center space-x-1 text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{t('contactList.table.active')}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-red-600">
                          <XCircle className="h-3 w-3" />
                          <span>{t('contactList.table.inactive')}</span>
                        </span>
                      )}
                    </td>
                    <td className="px-1 py-1 text-sm">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleViewDetail(contact.id)}
                          className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
                          title={t('contactList.actions.view')}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleEdit(contact)}
                          className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
                          title={t('contactList.actions.edit')}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(contact)}
                          className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                          title={t('contactList.actions.delete')}
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
            {t('contactList.pagination.info', { current: currentPage, total: pages, size: queryParams.size || 10 })}
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('contactList.pagination.prev')}
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
              {t('contactList.pagination.next')}
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
                {editingContact ? t('contactList.modal.editTitle') : t('contactList.modal.createTitle')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              {/* 客户（创建时显示，编辑时只读） */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('contactList.modal.customer')}
                </label>
                {editingContact ? (
                  <input
                    type="text"
                    value={editingContact.customer_name || getCustomerName(modalFormData.customer_id)}
                    disabled
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-500"
                  />
                ) : (
                  <select
                    value={modalFormData.customer_id}
                    onChange={(e) => setModalFormData({ ...modalFormData, customer_id: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
                  >
                    <option value="">{t('contactList.modal.selectCustomer')}</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name} {customer.code ? `(${customer.code})` : ''}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* 姓名 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('contactList.modal.firstName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={modalFormData.first_name}
                    onChange={(e) => setModalFormData({ ...modalFormData, first_name: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder={t('contactList.modal.firstNamePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('contactList.modal.lastName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={modalFormData.last_name}
                    onChange={(e) => setModalFormData({ ...modalFormData, last_name: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder={t('contactList.modal.lastNamePlaceholder')}
                  />
                </div>
              </div>

              {/* 联系方式 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('contactList.modal.email')}
                  </label>
                  <input
                    type="email"
                    value={modalFormData.email}
                    onChange={(e) => setModalFormData({ ...modalFormData, email: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder={t('contactList.modal.emailPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('contactList.modal.mobile')}
                  </label>
                  <input
                    type="tel"
                    value={modalFormData.mobile}
                    onChange={(e) => setModalFormData({ ...modalFormData, mobile: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder={t('contactList.modal.mobilePlaceholder')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('contactList.modal.phone')}
                  </label>
                  <input
                    type="tel"
                    value={modalFormData.phone}
                    onChange={(e) => setModalFormData({ ...modalFormData, phone: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder={t('contactList.modal.phonePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('contactList.modal.wechatId')}
                  </label>
                  <input
                    type="text"
                    value={modalFormData.wechat_id}
                    onChange={(e) => setModalFormData({ ...modalFormData, wechat_id: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder={t('contactList.modal.wechatIdPlaceholder')}
                  />
                </div>
              </div>

              {/* 职位和部门 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('contactList.modal.position')}
                  </label>
                  <input
                    type="text"
                    value={modalFormData.position}
                    onChange={(e) => setModalFormData({ ...modalFormData, position: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder={t('contactList.modal.positionPlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    {t('contactList.modal.department')}
                  </label>
                  <input
                    type="text"
                    value={modalFormData.department}
                    onChange={(e) => setModalFormData({ ...modalFormData, department: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder={t('contactList.modal.departmentPlaceholder')}
                  />
                </div>
              </div>

              {/* 角色标识 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_primary"
                    checked={modalFormData.is_primary}
                    onChange={(e) => setModalFormData({ ...modalFormData, is_primary: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_primary" className="text-xs font-medium text-gray-700">
                    {t('contactList.modal.isPrimary')}
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_decision_maker"
                    checked={modalFormData.is_decision_maker}
                    onChange={(e) => setModalFormData({ ...modalFormData, is_decision_maker: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_decision_maker" className="text-xs font-medium text-gray-700">
                    {t('contactList.modal.isDecisionMaker')}
                  </label>
                </div>
              </div>

              {/* 是否激活 */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={modalFormData.is_active}
                  onChange={(e) => setModalFormData({ ...modalFormData, is_active: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="text-xs font-medium text-gray-700">
                  {t('contactList.modal.isActive')}
                </label>
              </div>

              {/* 备注 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('contactList.modal.notes')}
                </label>
                <textarea
                  value={modalFormData.notes}
                  onChange={(e) => setModalFormData({ ...modalFormData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  placeholder={t('contactList.modal.notesPlaceholder')}
                />
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('contactList.modal.cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t('contactList.modal.submitting') : t('contactList.modal.submit')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 详情弹窗 */}
      {showDetailModal && contactDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto m-4">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {t('contactList.detail.title')}
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
                <div className="text-gray-500">{t('contactList.detail.loading')}</div>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {/* 基本信息 */}
                <div className="bg-gray-50 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">{t('contactList.detail.basicInfo')}</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">{t('contactList.detail.name')}:</span>
                      <span className="ml-2 text-gray-900">{contactDetail.full_name || `${contactDetail.first_name} ${contactDetail.last_name}`}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('contactList.detail.customer')}:</span>
                      <span className="ml-2 text-gray-900">{contactDetail.customer_name || getCustomerName(contactDetail.customer_id)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('contactList.detail.position')}:</span>
                      <span className="ml-2 text-gray-900">{contactDetail.position || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('contactList.detail.department')}:</span>
                      <span className="ml-2 text-gray-900">{contactDetail.department || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('contactList.detail.email')}:</span>
                      <span className="ml-2 text-gray-900">{contactDetail.email || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('contactList.detail.mobile')}:</span>
                      <span className="ml-2 text-gray-900">{contactDetail.mobile || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('contactList.detail.phone')}:</span>
                      <span className="ml-2 text-gray-900">{contactDetail.phone || '-'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('contactList.detail.wechatId')}:</span>
                      <span className="ml-2 text-gray-900">{contactDetail.wechat_id || '-'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">{t('contactList.detail.role')}:</span>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {contactDetail.is_primary && (
                          <span className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium text-primary-700 bg-primary-50 rounded">
                            <User className="h-3 w-3" />
                            <span>{t('contactList.detail.primary')}</span>
                          </span>
                        )}
                        {contactDetail.is_decision_maker && (
                          <span className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium text-orange-700 bg-orange-50 rounded">
                            <Building2 className="h-3 w-3" />
                            <span>{t('contactList.detail.decisionMaker')}</span>
                          </span>
                        )}
                        {!contactDetail.is_primary && !contactDetail.is_decision_maker && '-'}
                      </div>
                    </div>
                    {contactDetail.notes && (
                      <div className="col-span-2">
                        <span className="text-gray-600">{t('contactList.detail.notes')}:</span>
                        <p className="mt-1 text-gray-900">{contactDetail.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-end">
              <button
                onClick={handleCloseDetail}
                className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('contactList.detail.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ContactList

