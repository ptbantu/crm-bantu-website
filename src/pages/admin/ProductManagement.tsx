/**
 * 产品/服务管理页面
 * 包含：服务列表、供应商关联、价格管理
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, Edit, Trash2, X, Package, Tag, DollarSign, Building2, CheckCircle2, XCircle, Save, Eye } from 'lucide-react'
import {
  getProductList,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct,
  CreateProductRequest,
  UpdateProductRequest,
} from '@/api/products'
import { getCategoryList } from '@/api/categories'
import { ProductListParams, Product, ProductDetail, ProductCategory } from '@/api/types'
import { useToast } from '@/components/ToastContainer'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button } from '@chakra-ui/react'

const ProductManagement = () => {
  const { t } = useTranslation()
  const { showSuccess, showError } = useToast()

  // 查询参数
  const [queryParams, setQueryParams] = useState<ProductListParams>({
    page: 1,
    size: 10,
  })

  // 数据
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pages, setPages] = useState(0)

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category_id: '',
    service_type: '',
    status: '',
    is_active: '' as '' | 'true' | 'false',
  })

  // 弹窗状态
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [modalFormData, setModalFormData] = useState({
    name: '',
    code: '',
    category_id: '',
    service_type: '',
    service_subtype: '',
    processing_days: '',
    processing_time_text: '',
    price_direct_idr: '',
    price_direct_cny: '',
    price_list_idr: '',
    price_list_cny: '',
    status: 'active',
    is_active: true,
  })
  const [submitting, setSubmitting] = useState(false)

  // 详情弹窗状态
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [productDetail, setProductDetail] = useState<ProductDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // 加载分类列表
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const result = await getCategoryList({ size: 1000, is_active: true })
        setCategories(result.records)
      } catch (error: any) {
        console.error('Failed to load categories:', error)
      }
    }
    loadCategories()
  }, [])

  // 加载产品列表
  const loadProducts = async (params: ProductListParams) => {
    setLoading(true)
    try {
      const result = await getProductList(params)
      setProducts(result.records)
      setTotal(result.total)
      setCurrentPage(result.current)
      setPages(result.pages)
    } catch (error: any) {
      showError(error.message || t('productManagement.error.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadProducts(queryParams)
  }, [])

  // 处理查询
  const handleSearch = () => {
    const params: ProductListParams = {
      page: 1,
      size: queryParams.size || 10,
    }

    if (formData.name.trim()) {
      params.name = formData.name.trim()
    }
    if (formData.code.trim()) {
      params.code = formData.code.trim()
    }
    if (formData.category_id) {
      params.category_id = formData.category_id
    }
    if (formData.service_type) {
      params.service_type = formData.service_type
    }
    if (formData.status) {
      params.status = formData.status
    }
    if (formData.is_active !== '') {
      params.is_active = formData.is_active === 'true'
    }

    setQueryParams(params)
    loadProducts(params)
  }

  // 重置查询
  const handleReset = () => {
    setFormData({
      name: '',
      code: '',
      category_id: '',
      service_type: '',
      status: '',
      is_active: '',
    })
    const defaultParams: ProductListParams = {
      page: 1,
      size: 10,
    }
    setQueryParams(defaultParams)
    loadProducts(defaultParams)
  }

  // 分页
  const handlePageChange = (page: number) => {
    const params = { ...queryParams, page }
    setQueryParams(params)
    loadProducts(params)
  }

  // 打开创建弹窗
  const handleCreate = () => {
    setEditingProduct(null)
    setModalFormData({
      name: '',
      code: '',
      category_id: '',
      service_type: '',
      service_subtype: '',
      processing_days: '',
      processing_time_text: '',
      price_direct_idr: '',
      price_direct_cny: '',
      price_list_idr: '',
      price_list_cny: '',
      status: 'active',
      is_active: true,
    })
    setShowModal(true)
  }

  // 打开编辑弹窗
  const handleEdit = async (product: Product) => {
    setEditingProduct(product)
    try {
      const detail = await getProductDetail(product.id)
      setModalFormData({
        name: detail.name,
        code: detail.code || '',
        category_id: detail.category_id || '',
        service_type: detail.service_type || '',
        service_subtype: detail.service_subtype || '',
        processing_days: detail.processing_days?.toString() || '',
        processing_time_text: detail.processing_time_text || '',
        price_direct_idr: detail.price_direct_idr?.toString() || '',
        price_direct_cny: detail.price_direct_cny?.toString() || '',
        price_list_idr: detail.price_list_idr?.toString() || '',
        price_list_cny: detail.price_list_cny?.toString() || '',
        status: detail.status || 'active',
        is_active: detail.is_active,
      })
      setShowModal(true)
    } catch (error: any) {
      showError(error.message || t('productManagement.error.loadDetailFailed'))
    }
  }

  // 关闭弹窗
  const handleCloseModal = () => {
    setShowModal(false)
    setEditingProduct(null)
    setModalFormData({
      name: '',
      code: '',
      category_id: '',
      service_type: '',
      service_subtype: '',
      processing_days: '',
      processing_time_text: '',
      price_direct_idr: '',
      price_direct_cny: '',
      price_list_idr: '',
      price_list_cny: '',
      status: 'active',
      is_active: true,
    })
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!modalFormData.name.trim()) {
      showError(t('productManagement.validation.nameRequired'))
      return
    }

    setSubmitting(true)
    try {
      if (editingProduct) {
        // 更新产品
        const updateData: UpdateProductRequest = {
          name: modalFormData.name.trim(),
          code: modalFormData.code || undefined,
          category_id: modalFormData.category_id || undefined,
          service_type: modalFormData.service_type || undefined,
          service_subtype: modalFormData.service_subtype || undefined,
          processing_days: modalFormData.processing_days ? parseInt(modalFormData.processing_days) : undefined,
          processing_time_text: modalFormData.processing_time_text || undefined,
          price_direct_idr: modalFormData.price_direct_idr ? parseFloat(modalFormData.price_direct_idr) : undefined,
          price_direct_cny: modalFormData.price_direct_cny ? parseFloat(modalFormData.price_direct_cny) : undefined,
          price_list_idr: modalFormData.price_list_idr ? parseFloat(modalFormData.price_list_idr) : undefined,
          price_list_cny: modalFormData.price_list_cny ? parseFloat(modalFormData.price_list_cny) : undefined,
          status: modalFormData.status || undefined,
          is_active: modalFormData.is_active,
        }
        await updateProduct(editingProduct.id, updateData)
        showSuccess(t('productManagement.success.update'))
      } else {
        // 创建产品
        const createData: CreateProductRequest = {
          name: modalFormData.name.trim(),
          code: modalFormData.code || undefined,
          category_id: modalFormData.category_id || undefined,
          service_type: modalFormData.service_type || undefined,
          service_subtype: modalFormData.service_subtype || undefined,
          processing_days: modalFormData.processing_days ? parseInt(modalFormData.processing_days) : undefined,
          processing_time_text: modalFormData.processing_time_text || undefined,
          price_direct_idr: modalFormData.price_direct_idr ? parseFloat(modalFormData.price_direct_idr) : undefined,
          price_direct_cny: modalFormData.price_direct_cny ? parseFloat(modalFormData.price_direct_cny) : undefined,
          price_list_idr: modalFormData.price_list_idr ? parseFloat(modalFormData.price_list_idr) : undefined,
          price_list_cny: modalFormData.price_list_cny ? parseFloat(modalFormData.price_list_cny) : undefined,
          status: modalFormData.status || 'active',
          is_active: modalFormData.is_active,
        }
        await createProduct(createData)
        showSuccess(t('productManagement.success.create'))
      }
      handleCloseModal()
      loadProducts(queryParams)
    } catch (error: any) {
      showError(error.message || t('productManagement.error.saveFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  // 删除产品
  const handleDelete = async (product: Product) => {
    if (!window.confirm(t('productManagement.confirm.delete', { name: product.name }))) {
      return
    }

    try {
      await deleteProduct(product.id)
      showSuccess(t('productManagement.success.delete'))
      loadProducts(queryParams)
    } catch (error: any) {
      showError(error.message || t('productManagement.error.deleteFailed'))
    }
  }

  // 打开详情弹窗
  const handleViewDetail = async (productId: string) => {
    setSelectedProductId(productId)
    setShowDetailModal(true)
    setLoadingDetail(true)
    try {
      const detail = await getProductDetail(productId)
      setProductDetail(detail)
    } catch (error: any) {
      showError(error.message || t('productManagement.error.loadDetailFailed'))
      setShowDetailModal(false)
    } finally {
      setLoadingDetail(false)
    }
  }

  // 关闭详情弹窗
  const handleCloseDetail = () => {
    setShowDetailModal(false)
    setSelectedProductId(null)
    setProductDetail(null)
  }

  // 格式化价格
  const formatPrice = (amount: number | null | undefined, currency: string = 'IDR') => {
    if (!amount) return '-'
    if (currency === 'IDR') {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
    }
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount)
  }

  return (
    <div className="w-full">
      {/* 页面头部 */}
      <PageHeader
        icon={Package}
        title={t('productManagement.title')}
        subtitle={t('productManagement.subtitle')}
        actions={
          <Button
            colorScheme="primary"
            leftIcon={<Plus size={16} />}
            onClick={handleCreate}
            size="sm"
          >
            {t('productManagement.create')}
          </Button>
        }
      />

      {/* 查询表单 */}
      <div className="bg-white rounded-xl border border-gray-200 p-2 mb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('productManagement.search.name')}
            </label>
            <div className="relative">
              <Package className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('productManagement.search.namePlaceholder')}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('productManagement.search.code')}
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder={t('productManagement.search.codePlaceholder')}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('productManagement.search.category')}
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
            >
              <option value="">{t('productManagement.search.allCategories')}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('productManagement.search.status')}
            </label>
            <select
              value={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.value as '' | 'true' | 'false' })}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
            >
              <option value="">{t('productManagement.search.allStatus')}</option>
              <option value="true">{t('productManagement.search.active')}</option>
              <option value="false">{t('productManagement.search.inactive')}</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('productManagement.search.reset')}
          </button>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
          >
            <Search className="h-3.5 w-3.5" />
            <span>{t('productManagement.search.search')}</span>
          </button>
        </div>
      </div>

      {/* 产品列表 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <div className="text-sm text-gray-500">{t('productManagement.loading')}</div>
          </div>
        ) : products.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-sm text-gray-500">{t('productManagement.noData')}</div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-1 py-1 text-left text-xs font-semibold text-gray-900">
                      {t('productManagement.table.name')}
                    </th>
                    <th className="px-1 py-1 text-left text-xs font-semibold text-gray-900">
                      {t('productManagement.table.code')}
                    </th>
                    <th className="px-1 py-1 text-left text-xs font-semibold text-gray-900">
                      {t('productManagement.table.category')}
                    </th>
                    <th className="px-1 py-1 text-left text-xs font-semibold text-gray-900">
                      {t('productManagement.table.serviceType')}
                    </th>
                    <th className="px-1 py-1 text-left text-xs font-semibold text-gray-900">
                      {t('productManagement.table.price')}
                    </th>
                    <th className="px-1 py-1 text-left text-xs font-semibold text-gray-900">
                      {t('productManagement.table.status')}
                    </th>
                    <th className="px-2 py-1.5 text-left text-xs font-semibold text-gray-900 w-20">
                      {t('productManagement.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.map((product) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-1 py-1 text-sm text-gray-900 font-medium">
                        {product.name}
                      </td>
                      <td className="px-1 py-1 text-sm text-gray-700">
                        {product.code || '-'}
                      </td>
                      <td className="px-1 py-1 text-sm text-gray-700">
                        {product.category_name || '-'}
                      </td>
                      <td className="px-1 py-1 text-sm text-gray-700">
                        <div className="flex items-center space-x-1.5">
                          <Tag className="h-3.5 w-3.5 text-gray-400" />
                          <span>{product.service_type || '-'}</span>
                          {product.service_subtype && (
                            <span className="text-xs text-gray-500">({product.service_subtype})</span>
                          )}
                        </div>
                      </td>
                      <td className="px-1 py-1 text-sm text-gray-700">
                        <div className="flex flex-col space-y-0.5">
                          {product.price_direct_idr && (
                            <div className="flex items-center space-x-1.5">
                              <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-xs">{formatPrice(product.price_direct_idr, 'IDR')}</span>
                            </div>
                          )}
                          {product.price_direct_cny && (
                            <div className="flex items-center space-x-1.5">
                              <DollarSign className="h-3.5 w-3.5 text-gray-400" />
                              <span className="text-xs">{formatPrice(product.price_direct_cny, 'CNY')}</span>
                            </div>
                          )}
                          {!product.price_direct_idr && !product.price_direct_cny && '-'}
                        </div>
                      </td>
                      <td className="px-1 py-1">
                        {product.is_active ? (
                          <span className="inline-flex items-center space-x-1 text-xs text-green-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>{t('productManagement.table.active')}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-xs text-red-600">
                            <XCircle className="h-3.5 w-3.5" />
                            <span>{t('productManagement.table.inactive')}</span>
                          </span>
                        )}
                      </td>
                      <td className="px-1 py-1">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleViewDetail(product.id)}
                            className="p-1 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                            title={t('productManagement.viewDetail')}
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-1 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                            title={t('productManagement.edit')}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title={t('productManagement.delete')}
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
              <div className="px-1 py-1 border-t border-gray-200 flex items-center justify-between">
                <div className="text-xs text-gray-600">
                  {t('productManagement.pagination.total').replace('{{total}}', total.toString())}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2 py-0.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('productManagement.pagination.prev')}
                  </button>
                  <div className="text-xs text-gray-700">
                    {t('productManagement.pagination.page')
                      .replace('{{current}}', currentPage.toString())
                      .replace('{{total}}', pages.toString())}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pages}
                    className="px-2 py-0.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('productManagement.pagination.next')}
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
            className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 弹窗头部 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
                {editingProduct ? t('productManagement.edit') : t('productManagement.create')}
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
                    {t('productManagement.form.name')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={modalFormData.name}
                    onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {t('productManagement.form.code')}
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
                      {t('productManagement.form.category')}
                    </label>
                    <select
                      value={modalFormData.category_id}
                      onChange={(e) => setModalFormData({ ...modalFormData, category_id: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
                    >
                      <option value="">{t('productManagement.form.selectCategory')}</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {t('productManagement.form.serviceType')}
                    </label>
                    <input
                      type="text"
                      value={modalFormData.service_type}
                      onChange={(e) => setModalFormData({ ...modalFormData, service_type: e.target.value })}
                      placeholder={t('productManagement.form.serviceTypePlaceholder')}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {t('productManagement.form.serviceSubtype')}
                    </label>
                    <input
                      type="text"
                      value={modalFormData.service_subtype}
                      onChange={(e) => setModalFormData({ ...modalFormData, service_subtype: e.target.value })}
                      placeholder={t('productManagement.form.serviceSubtypePlaceholder')}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {t('productManagement.form.processingDays')}
                    </label>
                    <input
                      type="number"
                      value={modalFormData.processing_days}
                      onChange={(e) => setModalFormData({ ...modalFormData, processing_days: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {t('productManagement.form.processingTimeText')}
                    </label>
                    <input
                      type="text"
                      value={modalFormData.processing_time_text}
                      onChange={(e) => setModalFormData({ ...modalFormData, processing_time_text: e.target.value })}
                      placeholder={t('productManagement.form.processingTimeTextPlaceholder')}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {t('productManagement.form.priceDirectIdr')}
                    </label>
                    <input
                      type="number"
                      value={modalFormData.price_direct_idr}
                      onChange={(e) => setModalFormData({ ...modalFormData, price_direct_idr: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {t('productManagement.form.priceDirectCny')}
                    </label>
                    <input
                      type="number"
                      value={modalFormData.price_direct_cny}
                      onChange={(e) => setModalFormData({ ...modalFormData, price_direct_cny: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {t('productManagement.form.priceListIdr')}
                    </label>
                    <input
                      type="number"
                      value={modalFormData.price_list_idr}
                      onChange={(e) => setModalFormData({ ...modalFormData, price_list_idr: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {t('productManagement.form.priceListCny')}
                    </label>
                    <input
                      type="number"
                      value={modalFormData.price_list_cny}
                      onChange={(e) => setModalFormData({ ...modalFormData, price_list_cny: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      {t('productManagement.form.status')}
                    </label>
                    <select
                      value={modalFormData.status}
                      onChange={(e) => setModalFormData({ ...modalFormData, status: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
                    >
                      <option value="active">{t('productManagement.form.statusActive')}</option>
                      <option value="suspended">{t('productManagement.form.statusSuspended')}</option>
                      <option value="discontinued">{t('productManagement.form.statusDiscontinued')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="flex items-center space-x-2 cursor-pointer pt-6">
                      <input
                        type="checkbox"
                        checked={modalFormData.is_active}
                        onChange={(e) => setModalFormData({ ...modalFormData, is_active: e.target.checked })}
                        className="w-3.5 h-3.5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <span className="text-xs font-medium text-gray-700">
                        {t('productManagement.form.isActive')}
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* 弹窗底部 */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 py-2.5 flex justify-end space-x-2">
              <button
                onClick={handleCloseModal}
                className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('productManagement.cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{t('productManagement.save')}</span>
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
                {t('productManagement.detail.title')}
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
                <div className="text-sm text-gray-500">{t('productManagement.loading')}</div>
              </div>
            ) : productDetail ? (
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 基本信息 */}
                  <div className="space-y-2.5">
                    <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-1.5">
                      {t('productManagement.detail.basicInfo')}
                    </h3>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-0.5">
                        {t('productManagement.table.name')}
                      </label>
                      <div className="text-sm text-gray-900 font-medium">{productDetail.name}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-0.5">
                        {t('productManagement.table.code')}
                      </label>
                      <div className="text-sm text-gray-900">{productDetail.code || '-'}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-0.5">
                        {t('productManagement.table.category')}
                      </label>
                      <div className="text-sm text-gray-900">{productDetail.category_name || '-'}</div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-0.5">
                        {t('productManagement.table.serviceType')}
                      </label>
                      <div className="text-sm text-gray-900">
                        {productDetail.service_type || '-'}
                        {productDetail.service_subtype && ` (${productDetail.service_subtype})`}
                      </div>
                    </div>
                    {productDetail.processing_days && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('productManagement.form.processingDays')}
                        </label>
                        <div className="text-sm text-gray-900">
                          {productDetail.processing_days} {t('productManagement.detail.days')}
                          {productDetail.processing_time_text && ` (${productDetail.processing_time_text})`}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 价格信息 */}
                  <div className="space-y-2.5">
                    <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-1.5">
                      {t('productManagement.detail.priceInfo')}
                    </h3>
                    {productDetail.price_cost_idr && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('productManagement.detail.costPrice')} (IDR)
                        </label>
                        <div className="text-sm text-gray-900">{formatPrice(productDetail.price_cost_idr, 'IDR')}</div>
                      </div>
                    )}
                    {productDetail.price_channel_idr && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('productManagement.detail.channelPrice')} (IDR)
                        </label>
                        <div className="text-sm text-gray-900">{formatPrice(productDetail.price_channel_idr, 'IDR')}</div>
                      </div>
                    )}
                    {productDetail.price_direct_idr && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('productManagement.detail.directPrice')} (IDR)
                        </label>
                        <div className="text-sm text-gray-900">{formatPrice(productDetail.price_direct_idr, 'IDR')}</div>
                      </div>
                    )}
                    {productDetail.price_list_idr && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('productManagement.detail.listPrice')} (IDR)
                        </label>
                        <div className="text-sm text-gray-900">{formatPrice(productDetail.price_list_idr, 'IDR')}</div>
                      </div>
                    )}
                    {productDetail.price_direct_cny && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('productManagement.detail.directPrice')} (CNY)
                        </label>
                        <div className="text-sm text-gray-900">{formatPrice(productDetail.price_direct_cny, 'CNY')}</div>
                      </div>
                    )}
                  </div>

                  {/* 状态信息 */}
                  <div className="space-y-2.5">
                    <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-1.5">
                      {t('productManagement.detail.statusInfo')}
                    </h3>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-0.5">
                        {t('productManagement.table.status')}
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {productDetail.is_active ? (
                          <span className="inline-flex items-center space-x-1 text-xs text-green-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>{t('productManagement.table.active')}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-xs text-red-600">
                            <XCircle className="h-3.5 w-3.5" />
                            <span>{t('productManagement.table.inactive')}</span>
                          </span>
                        )}
                        {productDetail.status && (
                          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded bg-blue-50 text-blue-600">
                            {productDetail.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 其他信息 */}
                  {(productDetail.required_documents || productDetail.notes) && (
                    <div className="space-y-2.5">
                      <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-1.5">
                        {t('productManagement.detail.otherInfo')}
                      </h3>
                      {productDetail.required_documents && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-0.5">
                            {t('productManagement.detail.requiredDocuments')}
                          </label>
                          <div className="text-sm text-gray-900 whitespace-pre-wrap">{productDetail.required_documents}</div>
                        </div>
                      )}
                      {productDetail.notes && (
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-0.5">
                            {t('productManagement.detail.notes')}
                          </label>
                          <div className="text-sm text-gray-900 whitespace-pre-wrap">{productDetail.notes}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductManagement

