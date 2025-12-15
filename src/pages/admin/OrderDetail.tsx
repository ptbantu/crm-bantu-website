/**
 * 订单详情页面
 * 显示订单信息、订单项、评论、文件等
 */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Plus, Edit, Trash2, X, ShoppingCart, DollarSign, User, Package, MessageSquare, FileText, Download, CheckCircle2, XCircle, Upload } from 'lucide-react'
import { getOrderDetail, updateOrder, assignOrder } from '@/api/orders'
import { getOrderItemList, createOrderItem, updateOrderItem, deleteOrderItem } from '@/api/orderItems'
import { getOrderCommentList, createOrderComment, updateOrderComment, deleteOrderComment, replyOrderComment, pinOrderComment } from '@/api/orderComments'
import { getOrderFileList, uploadOrderFile, deleteOrderFile, downloadOrderFile, verifyOrderFile } from '@/api/orderFiles'
import { getCustomerList } from '@/api/customers'
import { getProductList } from '@/api/products'
import { getUserList } from '@/api/users'
import { Order, OrderItem, OrderComment, OrderFile, Customer, Product, UserListItem, CreateOrderItemRequest, UpdateOrderRequest, AssignOrderRequest, OrderStatus } from '@/api/types'
import { useToast } from '@/components/ToastContainer'
import { formatPrice as formatCurrency } from '@/utils/formatPrice'

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { showSuccess, showError } = useToast()

  // 订单详情
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(false)

  // 订单项
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)

  // 评论
  const [comments, setComments] = useState<OrderComment[]>([])
  const [loadingComments, setLoadingComments] = useState(false)

  // 文件
  const [files, setFiles] = useState<OrderFile[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)

  // 下拉选项
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [users, setUsers] = useState<UserListItem[]>([])

  // 弹窗状态
  const [showItemModal, setShowItemModal] = useState(false)
  const [editingItem, setEditingItem] = useState<OrderItem | null>(null)
  const [itemFormData, setItemFormData] = useState<CreateOrderItemRequest>({
    product_id: '',
    quantity: 1,
    unit_price: 0,
    currency_code: 'IDR',
  })

  const [showCommentModal, setShowCommentModal] = useState(false)
  const [commentContent, setCommentContent] = useState('')
  const [isInternalComment, setIsInternalComment] = useState(false)

  const [showAssignModal, setShowAssignModal] = useState(false)
  const [assignUserId, setAssignUserId] = useState('')

  const [showFileUploadModal, setShowFileUploadModal] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [fileCategory, setFileCategory] = useState<'passport' | 'visa' | 'document' | 'other'>('document')
  const [fileDescription, setFileDescription] = useState('')
  const [uploading, setUploading] = useState(false)

  // 加载订单详情
  const loadOrderDetail = async () => {
    if (!id) return
    setLoading(true)
    try {
      const orderData = await getOrderDetail(id)
      setOrder(orderData)
    } catch (error: any) {
      showError(error.message || t('orderDetail.error.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  // 加载订单项
  const loadOrderItems = async () => {
    if (!id) return
    setLoadingItems(true)
    try {
      const items = await getOrderItemList(id)
      setOrderItems(items)
    } catch (error: any) {
      showError(error.message || t('orderDetail.error.loadItemsFailed'))
    } finally {
      setLoadingItems(false)
    }
  }

  // 加载评论
  const loadComments = async () => {
    if (!id) return
    setLoadingComments(true)
    try {
      const result = await getOrderCommentList(id, { page: 1, size: 100 })
      setComments(result.records)
    } catch (error: any) {
      showError(error.message || t('orderDetail.error.loadCommentsFailed'))
    } finally {
      setLoadingComments(false)
    }
  }

  // 加载文件
  const loadFiles = async () => {
    if (!id) return
    setLoadingFiles(true)
    try {
      const result = await getOrderFileList(id, { page: 1, size: 100 })
      setFiles(result.records)
    } catch (error: any) {
      showError(error.message || t('orderDetail.error.loadFilesFailed'))
    } finally {
      setLoadingFiles(false)
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
    if (id) {
      loadOrderDetail()
      loadOrderItems()
      loadComments()
      loadFiles()
    }
  }, [id])

  // formatCurrency 已从 @/utils/formatPrice 导入

  // 格式化日期时间
  const formatDateTime = (dateString: string | undefined) => {
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
    } catch (error) {
      return '-'
    }
  }

  // 添加订单项
  const handleAddItem = () => {
    setEditingItem(null)
    setItemFormData({
      product_id: '',
      quantity: 1,
      unit_price: 0,
      currency_code: order?.currency_code || 'IDR',
    })
    setShowItemModal(true)
  }

  // 编辑订单项
  const handleEditItem = (item: OrderItem) => {
    setEditingItem(item)
    setItemFormData({
      product_id: item.product_id || '',
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount_amount: item.discount_amount,
      currency_code: item.currency_code,
      description: item.description || '',
    })
    setShowItemModal(true)
  }

  // 保存订单项
  const handleSaveItem = async () => {
    if (!id) return
    if (!itemFormData.quantity || itemFormData.quantity <= 0) {
      showError(t('orderDetail.error.invalidQuantity'))
      return
    }
    if (!itemFormData.unit_price || itemFormData.unit_price <= 0) {
      showError(t('orderDetail.error.invalidPrice'))
      return
    }

    try {
      if (editingItem) {
        await updateOrderItem(id, editingItem.id, itemFormData)
        showSuccess(t('orderDetail.success.updateItem'))
      } else {
        await createOrderItem(id, itemFormData)
        showSuccess(t('orderDetail.success.addItem'))
      }
      setShowItemModal(false)
      loadOrderItems()
      loadOrderDetail() // 重新加载订单以更新总金额
    } catch (error: any) {
      showError(error.message || t('orderDetail.error.saveItemFailed'))
    }
  }

  // 删除订单项
  const handleDeleteItem = async (itemId: string) => {
    if (!id) return
    if (!window.confirm(t('orderDetail.confirm.deleteItem'))) {
      return
    }
    try {
      await deleteOrderItem(id, itemId)
      showSuccess(t('orderDetail.success.deleteItem'))
      loadOrderItems()
      loadOrderDetail()
    } catch (error: any) {
      showError(error.message || t('orderDetail.error.deleteItemFailed'))
    }
  }

  // 添加评论
  const handleAddComment = async () => {
    if (!id) return
    if (!commentContent.trim()) {
      showError(t('orderDetail.error.commentRequired'))
      return
    }
    try {
      await createOrderComment(id, {
        content: commentContent,
        is_internal: isInternalComment,
      })
      showSuccess(t('orderDetail.success.addComment'))
      setShowCommentModal(false)
      setCommentContent('')
      setIsInternalComment(false)
      loadComments()
    } catch (error: any) {
      showError(error.message || t('orderDetail.error.addCommentFailed'))
    }
  }

  // 分配订单
  const handleAssign = async () => {
    if (!id) return
    if (!assignUserId) {
      showError(t('orderDetail.error.selectUser'))
      return
    }
    try {
      await assignOrder(id, {
        assigned_to_user_id: assignUserId,
      })
      showSuccess(t('orderDetail.success.assign'))
      setShowAssignModal(false)
      setAssignUserId('')
      loadOrderDetail()
    } catch (error: any) {
      showError(error.message || t('orderDetail.error.assignFailed'))
    }
  }

  // 更新订单状态
  const handleUpdateStatus = async (status: OrderStatus) => {
    if (!id || !order) return
    try {
      await updateOrder(id, { status_code: status })
      showSuccess(t('orderDetail.success.updateStatus'))
      loadOrderDetail()
    } catch (error: any) {
      showError(error.message || t('orderDetail.error.updateStatusFailed'))
    }
  }

  // 上传文件
  const handleUploadFile = async () => {
    if (!id) return
    if (!uploadFile) {
      showError(t('orderDetail.error.selectFile'))
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('file_category', fileCategory)
      if (fileDescription) {
        formData.append('description', fileDescription)
      }

      await uploadOrderFile(id, formData)
      showSuccess(t('orderDetail.success.uploadFile'))
      setShowFileUploadModal(false)
      setUploadFile(null)
      setFileDescription('')
      setFileCategory('document')
      loadFiles()
    } catch (error: any) {
      showError(error.message || t('orderDetail.error.uploadFileFailed'))
    } finally {
      setUploading(false)
    }
  }

  // 下载文件
  const handleDownloadFile = async (fileId: string, fileName: string) => {
    if (!id) return
    try {
      const blob = await downloadOrderFile(id, fileId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName || 'file'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error: any) {
      showError(error.message || t('orderDetail.error.downloadFileFailed'))
    }
  }

  // 验证文件
  const handleVerifyFile = async (fileId: string, isVerified: boolean) => {
    if (!id) return
    try {
      await verifyOrderFile(id, fileId, isVerified)
      showSuccess(t('orderDetail.success.verifyFile'))
      loadFiles()
    } catch (error: any) {
      showError(error.message || t('orderDetail.error.verifyFileFailed'))
    }
  }

  // 删除文件
  const handleDeleteFile = async (fileId: string) => {
    if (!id) return
    if (!window.confirm(t('orderDetail.confirm.deleteFile'))) {
      return
    }
    try {
      await deleteOrderFile(id, fileId)
      showSuccess(t('orderDetail.success.deleteFile'))
      loadFiles()
    } catch (error: any) {
      showError(error.message || t('orderDetail.error.deleteFileFailed'))
    }
  }

  // 获取可用的状态流转
  const getAvailableStatusTransitions = (currentStatus: OrderStatus): OrderStatus[] => {
    const transitions: Record<OrderStatus, OrderStatus[]> = {
      submitted: ['approved', 'cancelled'],
      approved: ['assigned', 'cancelled'],
      assigned: ['processing', 'cancelled'],
      processing: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    }
    return transitions[currentStatus] || []
  }

  if (loading) {
    return (
      <div className="w-full p-8 text-center">
        <div className="text-gray-500">{t('orderDetail.loading')}</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="w-full p-8 text-center">
        <div className="text-gray-500">{t('orderDetail.notFound')}</div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* 头部 */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/order/list')}
            className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{order.order_number}</h1>
            <p className="text-sm text-gray-500">{order.title}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {order.status_code !== 'completed' && order.status_code !== 'cancelled' && (
            <>
              {getAvailableStatusTransitions(order.status_code).map((status) => (
                <button
                  key={status}
                  onClick={() => handleUpdateStatus(status)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    status === 'cancelled'
                      ? 'text-white bg-red-600 hover:bg-red-700'
                      : 'text-white bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  {t(`orderList.status.${status}`)}
                </button>
              ))}
            </>
          )}
          {order.status_code === 'approved' && (
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
            >
              {t('orderDetail.assign')}
            </button>
          )}
        </div>
      </div>

      {/* 订单基本信息 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('orderDetail.basicInfo')}</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('orderDetail.customer')}</label>
            <div className="text-sm text-gray-900">{order.customer_name || '-'}</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('orderDetail.salesUser')}</label>
            <div className="text-sm text-gray-900">{order.sales_username || '-'}</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('orderDetail.totalAmount')}</label>
            <div className="text-sm text-gray-900 font-medium">{formatCurrency(order.final_amount, order.currency_code)}</div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">{t('orderDetail.status')}</label>
            <div className="text-sm">
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                order.status_code === 'completed' ? 'bg-green-100 text-green-800' :
                order.status_code === 'cancelled' ? 'bg-red-100 text-red-800' :
                order.status_code === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {t(`orderList.status.${order.status_code}`)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 订单项 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('orderDetail.orderItems')}</h2>
          <button
            onClick={handleAddItem}
            className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{t('orderDetail.addItem')}</span>
          </button>
        </div>
        {loadingItems ? (
          <div className="text-center py-4 text-gray-500">{t('orderDetail.loading')}</div>
        ) : orderItems.length === 0 ? (
          <div className="text-center py-4 text-gray-500">{t('orderDetail.noItems')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700">{t('orderDetail.itemNumber')}</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700">{t('orderDetail.product')}</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700">{t('orderDetail.quantity')}</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700">{t('orderDetail.unitPrice')}</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700">{t('orderDetail.amount')}</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-gray-700">{t('orderDetail.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orderItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-2 py-2 text-sm text-gray-900">{item.item_number}</td>
                    <td className="px-2 py-2 text-sm text-gray-900">{item.product_name || '-'}</td>
                    <td className="px-2 py-2 text-sm text-gray-600">{item.quantity} {item.unit || ''}</td>
                    <td className="px-2 py-2 text-sm text-gray-600">{formatCurrency(item.unit_price, item.currency_code)}</td>
                    <td className="px-2 py-2 text-sm text-gray-900 font-medium">{formatCurrency(item.item_amount, item.currency_code)}</td>
                    <td className="px-2 py-2 text-sm">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditItem(item)}
                          className="p-1 text-gray-600 hover:text-primary-600 transition-colors"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1 text-gray-600 hover:text-red-600 transition-colors"
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
        )}
      </div>

      {/* 评论 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('orderDetail.comments')}</h2>
          <button
            onClick={() => setShowCommentModal(true)}
            className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{t('orderDetail.addComment')}</span>
          </button>
        </div>
        {loadingComments ? (
          <div className="text-center py-4 text-gray-500">{t('orderDetail.loading')}</div>
        ) : comments.length === 0 ? (
          <div className="text-center py-4 text-gray-500">{t('orderDetail.noComments')}</div>
        ) : (
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{comment.created_by_name || '-'}</span>
                    {comment.is_internal && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                        {t('orderDetail.internal')}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{formatDateTime(comment.created_at)}</span>
                </div>
                <div className="text-sm text-gray-700">{comment.content || '-'}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 文件 */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">{t('orderDetail.files')}</h2>
          <button
            onClick={() => setShowFileUploadModal(true)}
            className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>{t('orderDetail.uploadFile')}</span>
          </button>
        </div>
        {loadingFiles ? (
          <div className="text-center py-4 text-gray-500">{t('orderDetail.loading')}</div>
        ) : files.length === 0 ? (
          <div className="text-center py-4 text-gray-500">{t('orderDetail.noFiles')}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {files.map((file) => (
              <div key={file.id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 truncate">{file.file_name || '-'}</span>
                  </div>
                  {file.is_verified ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                <div className="text-xs text-gray-500 mb-2">{formatDateTime(file.created_at)}</div>
                <div className="flex items-center space-x-2 mt-2">
                  {file.file_url && (
                    <button
                      onClick={() => handleDownloadFile(file.id, file.file_name || 'file')}
                      className="text-xs text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                    >
                      <Download className="h-3 w-3" />
                      <span>{t('orderDetail.download')}</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleVerifyFile(file.id, !file.is_verified)}
                    className={`text-xs flex items-center space-x-1 ${
                      file.is_verified
                        ? 'text-green-600 hover:text-green-700'
                        : 'text-gray-600 hover:text-gray-700'
                    }`}
                  >
                    {file.is_verified ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        <span>{t('orderDetail.verified')}</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" />
                        <span>{t('orderDetail.verify')}</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleDeleteFile(file.id)}
                    className="text-xs text-red-600 hover:text-red-700 flex items-center space-x-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>{t('orderDetail.delete')}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 添加订单项弹窗 */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingItem ? t('orderDetail.editItem') : t('orderDetail.addItem')}
              </h2>
              <button
                onClick={() => setShowItemModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('orderDetail.product')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={itemFormData.product_id || ''}
                  onChange={(e) => setItemFormData({ ...itemFormData, product_id: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="">{t('orderDetail.selectProduct')}</option>
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
                    {t('orderDetail.quantity')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={itemFormData.quantity}
                    onChange={(e) => setItemFormData({ ...itemFormData, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('orderDetail.unitPrice')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={itemFormData.unit_price}
                    onChange={(e) => setItemFormData({ ...itemFormData, unit_price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowItemModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('orderDetail.cancel')}
              </button>
              <button
                onClick={handleSaveItem}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                {t('orderDetail.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 添加评论弹窗 */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{t('orderDetail.addComment')}</h2>
              <button
                onClick={() => setShowCommentModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('orderDetail.comment')}
                </label>
                <textarea
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  rows={4}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isInternal"
                  checked={isInternalComment}
                  onChange={(e) => setIsInternalComment(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="isInternal" className="text-sm text-gray-700">
                  {t('orderDetail.internalComment')}
                </label>
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowCommentModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('orderDetail.cancel')}
              </button>
              <button
                onClick={handleAddComment}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                {t('orderDetail.submit')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 分配订单弹窗 */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{t('orderDetail.assign')}</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('orderDetail.selectUser')} <span className="text-red-500">*</span>
                </label>
                <select
                  value={assignUserId}
                  onChange={(e) => setAssignUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="">{t('orderDetail.selectUser')}</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.display_name || user.username}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('orderDetail.cancel')}
              </button>
              <button
                onClick={handleAssign}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                {t('orderDetail.submit')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 文件上传弹窗 */}
      {showFileUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{t('orderDetail.uploadFile')}</h2>
              <button
                onClick={() => {
                  setShowFileUploadModal(false)
                  setUploadFile(null)
                  setFileDescription('')
                  setFileCategory('document')
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('orderDetail.file')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
                {uploadFile && (
                  <div className="mt-2 text-sm text-gray-600">
                    {t('orderDetail.selectedFile')}: {uploadFile.name}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('orderDetail.fileCategory')}
                </label>
                <select
                  value={fileCategory}
                  onChange={(e) => setFileCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="passport">{t('orderDetail.categoryPassport')}</option>
                  <option value="visa">{t('orderDetail.categoryVisa')}</option>
                  <option value="document">{t('orderDetail.categoryDocument')}</option>
                  <option value="other">{t('orderDetail.categoryOther')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('orderDetail.fileDescription')}
                </label>
                <textarea
                  value={fileDescription}
                  onChange={(e) => setFileDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  rows={3}
                  placeholder={t('orderDetail.fileDescriptionPlaceholder')}
                />
              </div>
            </div>
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 py-3 flex items-center justify-end space-x-3">
              <button
                onClick={() => {
                  setShowFileUploadModal(false)
                  setUploadFile(null)
                  setFileDescription('')
                  setFileCategory('document')
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('orderDetail.cancel')}
              </button>
              <button
                onClick={handleUploadFile}
                disabled={uploading || !uploadFile}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? t('orderDetail.uploading') : t('orderDetail.upload')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderDetail


