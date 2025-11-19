/**
 * 订单列表页面
 * 支持条件查询、列表展示、分页、增删改查
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Plus, Edit, Trash2, X, ShoppingCart, DollarSign, User, CheckCircle2, XCircle, Eye, Calendar, FileText, Package } from 'lucide-react'
import {
  getOrderList,
  getOrderDetail,
  createOrder,
  updateOrder,
  deleteOrder,
  CreateOrderRequest,
  UpdateOrderRequest,
} from '@/api/orders'
import { OrderListParams, Order, OrderStatus, CreateOrderItemRequest, Customer, Product, UserListItem } from '@/api/types'
import { useToast } from '@/components/ToastContainer'
import { getCustomerList } from '@/api/customers'
import { getProductList } from '@/api/products'
import { getUserList } from '@/api/users'

const OrderList = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { showSuccess, showError } = useToast()

  // 查询参数
  const [queryParams, setQueryParams] = useState<OrderListParams>({
    page: 1,
    size: 10,
  })

  // 数据
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pages, setPages] = useState(0)

  // 表单状态
  const [formData, setFormData] = useState({
    order_number: '',
    title: '',
    customer_name: '',
    status_code: '' as '' | OrderStatus,
  })

  // 弹窗状态
  const [showModal, setShowModal] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [modalFormData, setModalFormData] = useState({
    title: '',
    customer_id: '',
    service_record_id: '',
    sales_user_id: '',
    discount_amount: 0,
    currency_code: 'IDR',
    entry_city: '',
    passport_id: '',
    processor: '',
    exchange_rate: 0,
    description: '',
    notes: '',
    order_items: [] as any[],
  })
  const [submitting, setSubmitting] = useState(false)

  // 详情弹窗状态
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)
  const [orderDetail, setOrderDetail] = useState<Order | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // 下拉选项
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<UserListItem[]>([])
  
  // 订单项管理
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null)
  const [itemFormData, setItemFormData] = useState<CreateOrderItemRequest>({
    product_id: '',
    quantity: 1,
    unit_price: 0,
    currency_code: 'IDR',
  })

  // 加载订单列表
  const loadOrders = async (params: OrderListParams) => {
    setLoading(true)
    try {
      const result = await getOrderList(params)
      console.log('[OrderList] API响应:', result)
      console.log('[OrderList] records:', result.records)
      console.log('[OrderList] total:', result.total)
      setOrders(result.records || [])
      setTotal(result.total || 0)
      setCurrentPage(result.current || 1)
      setPages(result.pages || 0)
      console.log('[OrderList] 设置后的orders:', result.records || [])
    } catch (error: any) {
      console.error('[OrderList] 加载失败:', error)
      showError(error.message || t('orderList.error.loadFailed'))
      // 发生错误时，确保orders是数组
      setOrders([])
      setTotal(0)
      setCurrentPage(1)
      setPages(0)
    } finally {
      setLoading(false)
    }
  }

  // 加载下拉选项
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [customersResult, productsResult, usersResult] = await Promise.all([
          getCustomerList({ size: 1000 }),
          getProductList({ size: 1000, is_active: true }),
          getUserList({ size: 1000, is_active: true }),
        ])
        setCustomers(customersResult.records)
        setProducts(productsResult.records)
        setUsers(usersResult.records)
      } catch (error: any) {
        console.error('Failed to load options:', error)
      }
    }
    loadOptions()
  }, [])

  // 初始加载
  useEffect(() => {
    loadOrders(queryParams)
  }, [])

  // 搜索
  const handleSearch = () => {
    const params: OrderListParams = {
      page: 1,
      size: queryParams.size || 10,
    }
    if (formData.order_number) {
      params.order_number = formData.order_number
    }
    if (formData.title) {
      params.title = formData.title
    }
    if (formData.customer_name) {
      params.customer_name = formData.customer_name
    }
    if (formData.status_code) {
      params.status_code = formData.status_code
    }
    setQueryParams(params)
    loadOrders(params)
  }

  // 重置
  const handleReset = () => {
    setFormData({
      order_number: '',
      title: '',
      customer_name: '',
      status_code: '',
    })
    const params: OrderListParams = {
      page: 1,
      size: queryParams.size || 10,
    }
    setQueryParams(params)
    loadOrders(params)
  }

  // 创建订单
  const handleCreate = () => {
    setEditingOrder(null)
    setModalFormData({
      title: '',
      customer_id: '',
      service_record_id: '',
      sales_user_id: '',
      discount_amount: 0,
      currency_code: 'IDR',
      entry_city: '',
      passport_id: '',
      processor: '',
      exchange_rate: 0,
      description: '',
      notes: '',
      order_items: [],
    })
    setShowModal(true)
  }

  // 添加订单项
  const handleAddItem = () => {
    setEditingItemIndex(null)
    setItemFormData({
      product_id: '',
      quantity: 1,
      unit_price: 0,
      currency_code: modalFormData.currency_code,
    })
    setShowItemModal(true)
  }

  // 编辑订单项
  const handleEditItem = (index: number) => {
    setEditingItemIndex(index)
    setItemFormData(modalFormData.order_items[index])
    setShowItemModal(true)
  }

  // 删除订单项
  const handleDeleteItem = (index: number) => {
    const newItems = [...modalFormData.order_items]
    newItems.splice(index, 1)
    setModalFormData({ ...modalFormData, order_items: newItems })
  }

  // 保存订单项
  const handleSaveItem = () => {
    if (!itemFormData.quantity || itemFormData.quantity <= 0) {
      showError(t('orderList.error.invalidQuantity'))
      return
    }
    if (!itemFormData.unit_price || itemFormData.unit_price <= 0) {
      showError(t('orderList.error.invalidPrice'))
      return
    }
    if (!itemFormData.product_id) {
      showError(t('orderList.error.selectProduct'))
      return
    }

    const newItems = [...modalFormData.order_items]
    if (editingItemIndex !== null) {
      newItems[editingItemIndex] = { ...itemFormData }
    } else {
      newItems.push({ ...itemFormData })
    }
    setModalFormData({ ...modalFormData, order_items: newItems })
    setShowItemModal(false)
    setEditingItemIndex(null)
  }

  // 计算订单总金额
  const calculateTotalAmount = () => {
    const itemsTotal = modalFormData.order_items.reduce((sum, item) => {
      const itemAmount = (item.quantity || 0) * (item.unit_price || 0) - (item.discount_amount || 0)
      return sum + itemAmount
    }, 0)
    return itemsTotal - (modalFormData.discount_amount || 0)
  }

  // 编辑订单
  const handleEdit = (order: Order) => {
    setEditingOrder(order)
    setModalFormData({
      title: order.title,
      customer_id: order.customer_id,
      service_record_id: order.service_record_id || '',
      sales_user_id: order.sales_user_id,
      discount_amount: order.discount_amount || 0,
      currency_code: order.currency_code,
      entry_city: order.entry_city || '',
      passport_id: order.passport_id || '',
      processor: order.processor || '',
      exchange_rate: order.exchange_rate || 0,
      description: order.description || '',
      notes: order.notes || '',
      order_items: [],
    })
    setShowModal(true)
  }

  // 查看详情
  const handleViewDetail = (id: string) => {
    navigate(`/admin/order/detail/${id}`)
  }

  // 删除订单
  const handleDelete = async (id: string) => {
    if (!window.confirm(t('orderList.confirm.delete'))) {
      return
    }
    try {
      await deleteOrder(id)
      showSuccess(t('orderList.success.delete'))
      loadOrders(queryParams)
    } catch (error: any) {
      showError(error.message || t('orderList.error.deleteFailed'))
    }
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!modalFormData.title || !modalFormData.customer_id || !modalFormData.sales_user_id) {
      showError(t('orderList.error.requiredFields'))
      return
    }
    if (!modalFormData.order_items || modalFormData.order_items.length === 0) {
      showError(t('orderList.error.noOrderItems'))
      return
    }

    setSubmitting(true)
    try {
      if (editingOrder) {
        const updateData: UpdateOrderRequest = {
          title: modalFormData.title,
          customer_id: modalFormData.customer_id,
          service_record_id: modalFormData.service_record_id || null,
          discount_amount: modalFormData.discount_amount,
          currency_code: modalFormData.currency_code,
          entry_city: modalFormData.entry_city || null,
          passport_id: modalFormData.passport_id || null,
          processor: modalFormData.processor || null,
          exchange_rate: modalFormData.exchange_rate || null,
          description: modalFormData.description || null,
          notes: modalFormData.notes || null,
        }
        await updateOrder(editingOrder.id, updateData)
        showSuccess(t('orderList.success.update'))
      } else {
        const createData: CreateOrderRequest = {
          title: modalFormData.title,
          customer_id: modalFormData.customer_id,
          service_record_id: modalFormData.service_record_id || null,
          sales_user_id: modalFormData.sales_user_id,
          discount_amount: modalFormData.discount_amount,
          currency_code: modalFormData.currency_code,
          entry_city: modalFormData.entry_city || null,
          passport_id: modalFormData.passport_id || null,
          processor: modalFormData.processor || null,
          exchange_rate: modalFormData.exchange_rate || null,
          description: modalFormData.description || null,
          notes: modalFormData.notes || null,
          order_items: modalFormData.order_items,
        }
        await createOrder(createData)
        showSuccess(t('orderList.success.create'))
      }
      setShowModal(false)
      loadOrders(queryParams)
    } catch (error: any) {
      showError(error.message || t('orderList.error.submitFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  // 格式化金额
  const formatCurrency = (amount: number | null | undefined, currency: string = 'IDR') => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return '-'
    }
    const numAmount = Number(amount)
    if (isNaN(numAmount)) {
      return '-'
    }
    if (currency === 'IDR') {
      return `Rp ${numAmount.toLocaleString('id-ID')}`
    }
    return `¥ ${numAmount.toLocaleString('zh-CN')}`
  }

  // 格式化日期时间
  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      return `${year}-${month}-${day} ${hours}:${minutes}`
    } catch (error) {
      return '-'
    }
  }

  // 获取状态标签
  const getStatusBadge = (status: OrderStatus) => {
    const statusMap: Record<OrderStatus, { label: string; className: string }> = {
      submitted: { label: t('orderList.status.submitted'), className: 'bg-blue-100 text-blue-800' },
      approved: { label: t('orderList.status.approved'), className: 'bg-green-100 text-green-800' },
      assigned: { label: t('orderList.status.assigned'), className: 'bg-purple-100 text-purple-800' },
      processing: { label: t('orderList.status.processing'), className: 'bg-yellow-100 text-yellow-800' },
      completed: { label: t('orderList.status.completed'), className: 'bg-gray-100 text-gray-800' },
      cancelled: { label: t('orderList.status.cancelled'), className: 'bg-red-100 text-red-800' },
    }
    const statusInfo = statusMap[status] || statusMap.submitted
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    )
  }

  // 分页
  const handlePageChange = (page: number) => {
    const params = { ...queryParams, page }
    setQueryParams(params)
    loadOrders(params)
  }

  return (
    <div className="w-full">
      {/* 页面标题 */}
      <div className="mb-4">
        <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-1.5 tracking-tight">
          {t('orderList.title')}
        </h1>
        <p className="text-sm text-gray-500 font-medium">
          {t('orderList.subtitle')}
        </p>
      </div>

      {/* 查询表单 */}
      <div className="bg-white rounded-xl border border-gray-200 p-2 mb-2">
        <div className="flex items-end gap-2 flex-wrap">
          {/* 订单号 */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('orderList.search.orderNumber')}
            </label>
            <div className="relative">
              <FileText className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                value={formData.order_number}
                onChange={(e) => setFormData({ ...formData, order_number: e.target.value })}
                placeholder={t('orderList.search.orderNumberPlaceholder')}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          {/* 订单标题 */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('orderList.search.title')}
            </label>
            <div className="relative">
              <ShoppingCart className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder={t('orderList.search.titlePlaceholder')}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          {/* 客户名称 */}
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('orderList.search.customerName')}
            </label>
            <div className="relative">
              <User className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                placeholder={t('orderList.search.customerNamePlaceholder')}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>

          {/* 订单状态 */}
          <div className="flex-1 min-w-[120px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('orderList.search.status')}
            </label>
            <select
              value={formData.status_code}
              onChange={(e) => setFormData({ ...formData, status_code: e.target.value as '' | OrderStatus })}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
            >
              <option value="">{t('orderList.search.allStatus')}</option>
              <option value="submitted">{t('orderList.status.submitted')}</option>
              <option value="approved">{t('orderList.status.approved')}</option>
              <option value="assigned">{t('orderList.status.assigned')}</option>
              <option value="processing">{t('orderList.status.processing')}</option>
              <option value="completed">{t('orderList.status.completed')}</option>
              <option value="cancelled">{t('orderList.status.cancelled')}</option>
            </select>
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              {t('orderList.search.reset')}
            </button>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-4 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5 whitespace-nowrap"
            >
              <Search className="h-3.5 w-3.5" />
              <span>{t('orderList.search.search')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 操作栏 */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-600">
          {t('orderList.total', { total })}
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>{t('orderList.create')}</span>
        </button>
      </div>

      {/* 订单列表 */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="text-gray-500">{t('orderList.loading')}</div>
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <div className="text-gray-500">{t('orderList.noData')}</div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-1 py-1 text-left text-xs font-semibold text-gray-700">{t('orderList.table.orderNumber')}</th>
                  <th className="px-1 py-1 text-left text-xs font-semibold text-gray-700">{t('orderList.table.title')}</th>
                  <th className="px-1 py-1 text-left text-xs font-semibold text-gray-700">{t('orderList.table.customerName')}</th>
                  <th className="px-1 py-1 text-left text-xs font-semibold text-gray-700">{t('orderList.table.salesUser')}</th>
                  <th className="px-1 py-1 text-left text-xs font-semibold text-gray-700">{t('orderList.table.totalAmount')}</th>
                  <th className="px-1 py-1 text-left text-xs font-semibold text-gray-700">{t('orderList.table.status')}</th>
                  <th className="px-1 py-1 text-left text-xs font-semibold text-gray-700">{t('orderList.table.createdAt')}</th>
                  <th className="px-1 py-1 text-left text-xs font-semibold text-gray-700">{t('orderList.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-1 py-1 text-sm text-gray-900 font-medium">{order.order_number || '-'}</td>
                    <td className="px-1 py-1 text-sm text-gray-900">{order.title || '-'}</td>
                    <td className="px-1 py-1 text-sm text-gray-600">{order.customer_name || '-'}</td>
                    <td className="px-1 py-1 text-sm text-gray-600">{order.sales_username || '-'}</td>
                    <td className="px-1 py-1 text-sm text-gray-900 font-medium">
                      {formatCurrency(order.final_amount ?? order.total_amount, order.currency_code)}
                    </td>
                    <td className="px-1 py-1 text-sm">
                      {getStatusBadge(order.status_code || 'submitted')}
                    </td>
                    <td className="px-1 py-1 text-sm text-gray-600">{formatDateTime(order.created_at)}</td>
                    <td className="px-1 py-1 text-sm">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleViewDetail(order.id)}
                          className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
                          title={t('orderList.actions.view')}
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleEdit(order)}
                          className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
                          title={t('orderList.actions.edit')}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(order.id)}
                          className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                          title={t('orderList.actions.delete')}
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
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {t('orderList.pagination.showing', {
              from: (currentPage - 1) * (queryParams.size || 10) + 1,
              to: Math.min(currentPage * (queryParams.size || 10), total),
              total,
            })}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('orderList.pagination.previous')}
            </button>
            <div className="text-sm text-gray-600">
              {t('orderList.pagination.page', { current: currentPage, total: pages })}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pages}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('orderList.pagination.next')}
            </button>
          </div>
        </div>
      )}

      {/* 创建/编辑弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingOrder ? t('orderList.modal.editTitle') : t('orderList.modal.createTitle')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('orderList.modal.title')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={modalFormData.title}
                    onChange={(e) => setModalFormData({ ...modalFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder={t('orderList.modal.titlePlaceholder')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('orderList.modal.customer')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={modalFormData.customer_id}
                    onChange={(e) => setModalFormData({ ...modalFormData, customer_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="">{t('orderList.modal.selectCustomer')}</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('orderList.modal.salesUser')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={modalFormData.sales_user_id}
                    onChange={(e) => setModalFormData({ ...modalFormData, sales_user_id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    disabled={!!editingOrder}
                  >
                    <option value="">{t('orderList.modal.selectSalesUser')}</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.display_name || user.username}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('orderList.modal.currency')}
                  </label>
                  <select
                    value={modalFormData.currency_code}
                    onChange={(e) => setModalFormData({ ...modalFormData, currency_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="IDR">IDR</option>
                    <option value="CNY">CNY</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('orderList.modal.discountAmount')}
                  </label>
                  <input
                    type="number"
                    value={modalFormData.discount_amount}
                    onChange={(e) => setModalFormData({ ...modalFormData, discount_amount: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('orderList.modal.totalAmount')}
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-900">
                    {formatCurrency(calculateTotalAmount(), modalFormData.currency_code)}
                  </div>
                </div>
              </div>

              {/* 订单项列表 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('orderList.modal.orderItems')} <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>{t('orderList.modal.addItem')}</span>
                  </button>
                </div>
                {!modalFormData.order_items || modalFormData.order_items.length === 0 ? (
                  <div className="text-sm text-gray-500 text-center py-4 border border-gray-200 rounded-lg">
                    {t('orderList.modal.noItems')}
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700">{t('orderList.modal.itemProduct')}</th>
                          <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700">{t('orderList.modal.itemQuantity')}</th>
                          <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700">{t('orderList.modal.itemPrice')}</th>
                          <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700">{t('orderList.modal.itemAmount')}</th>
                          <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700">{t('orderList.modal.actions')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {modalFormData.order_items.map((item, index) => {
                          const product = products.find(p => p.id === item.product_id)
                          const itemAmount = (item.quantity || 0) * (item.unit_price || 0) - (item.discount_amount || 0)
                          return (
                            <tr key={index}>
                              <td className="px-2 py-2">{product?.name || '-'}</td>
                              <td className="px-2 py-2">{item.quantity}</td>
                              <td className="px-2 py-2">{formatCurrency(item.unit_price || 0, item.currency_code || modalFormData.currency_code)}</td>
                              <td className="px-2 py-2 font-medium">{formatCurrency(itemAmount, item.currency_code || modalFormData.currency_code)}</td>
                              <td className="px-2 py-2">
                                <div className="flex items-center space-x-1">
                                  <button
                                    type="button"
                                    onClick={() => handleEditItem(index)}
                                    className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteItem(index)}
                                    className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* 其他字段 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('orderList.modal.description')}
                </label>
                <textarea
                  value={modalFormData.description}
                  onChange={(e) => setModalFormData({ ...modalFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  rows={3}
                  placeholder={t('orderList.modal.descriptionPlaceholder')}
                />
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('orderList.modal.cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t('orderList.modal.submitting') : t('orderList.modal.submit')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 订单项弹窗 */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingItemIndex !== null ? t('orderList.modal.editItem') : t('orderList.modal.addItem')}
              </h2>
              <button
                onClick={() => {
                  setShowItemModal(false)
                  setEditingItemIndex(null)
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('orderList.modal.itemProduct')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={itemFormData.product_id || ''}
                  onChange={(e) => {
                    const product = products.find(p => p.id === e.target.value)
                    setItemFormData({
                      ...itemFormData,
                      product_id: e.target.value || null,
                      unit_price: product?.price_list_idr || itemFormData.unit_price || 0,
                    })
                  }}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="">{t('orderList.modal.selectProduct')}</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('orderList.modal.itemQuantity')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={itemFormData.quantity}
                    onChange={(e) => setItemFormData({ ...itemFormData, quantity: Number(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('orderList.modal.itemPrice')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={itemFormData.unit_price}
                    onChange={(e) => setItemFormData({ ...itemFormData, unit_price: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('orderList.modal.itemDiscount')}
                  </label>
                  <input
                    type="number"
                    value={itemFormData.discount_amount || 0}
                    onChange={(e) => setItemFormData({ ...itemFormData, discount_amount: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('orderList.modal.itemCurrency')}
                  </label>
                  <select
                    value={itemFormData.currency_code || modalFormData.currency_code}
                    onChange={(e) => setItemFormData({ ...itemFormData, currency_code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="IDR">IDR</option>
                    <option value="CNY">CNY</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('orderList.modal.itemDescription')}
                </label>
                <textarea
                  value={itemFormData.description || ''}
                  onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  rows={2}
                />
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowItemModal(false)
                  setEditingItemIndex(null)
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('orderList.modal.cancel')}
              </button>
              <button
                onClick={handleSaveItem}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                {t('orderList.modal.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 详情弹窗 */}
      {showDetailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {t('orderList.detail.title')}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              {loadingDetail ? (
                <div className="text-center py-8 text-gray-500">
                  {t('orderList.detail.loading')}
                </div>
              ) : orderDetail ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        {t('orderList.detail.orderNumber')}
                      </label>
                      <div className="text-sm text-gray-900">{orderDetail.order_number}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        {t('orderList.detail.status')}
                      </label>
                      <div>{getStatusBadge(orderDetail.status_code)}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        {t('orderList.detail.title')}
                      </label>
                      <div className="text-sm text-gray-900">{orderDetail.title}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        {t('orderList.detail.customerName')}
                      </label>
                      <div className="text-sm text-gray-900">{orderDetail.customer_name || '-'}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        {t('orderList.detail.totalAmount')}
                      </label>
                      <div className="text-sm text-gray-900 font-medium">
                        {formatCurrency(orderDetail.final_amount, orderDetail.currency_code)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        {t('orderList.detail.createdAt')}
                      </label>
                      <div className="text-sm text-gray-900">{formatDateTime(orderDetail.created_at)}</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {t('orderList.detail.noData')}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderList

