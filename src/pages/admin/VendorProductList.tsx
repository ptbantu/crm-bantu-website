/**
 * 供应商服务列表页面
 * 用于对供应商提供的服务进行增删改查
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, Edit, Trash2, X, Package, Tag, DollarSign, Building2, CheckCircle2, XCircle, Eye } from 'lucide-react'
import {
  getVendorProductList,
  VendorProductListParams,
} from '@/api/vendorProducts'
import { getOrganizationList } from '@/api/organizations'
import { getProductList } from '@/api/products'
import { Product, Organization } from '@/api/types'
import { useToast } from '@/components/ToastContainer'

const VendorProductList = () => {
  const { t } = useTranslation()
  const { showError } = useToast()

  // 查询参数
  const [queryParams, setQueryParams] = useState<VendorProductListParams>({
    vendor_id: '',
    page: 1,
    size: 10,
  })

  // 数据
  const [products, setProducts] = useState<Product[]>([])
  const [vendors, setVendors] = useState<Organization[]>([])
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pages, setPages] = useState(0)

  // 表单状态
  const [formData, setFormData] = useState({
    vendor_id: '',
    is_available: '' as '' | 'true' | 'false',
    is_primary: '' as '' | 'true' | 'false',
  })

  // 弹窗状态
  const [showModal, setShowModal] = useState(false)
  const [modalFormData, setModalFormData] = useState({
    product_id: '',
    is_primary: false,
    priority: 0,
    cost_price_idr: '',
    cost_price_cny: '',
    processing_days: '',
    is_available: true,
  })
  const [submitting, setSubmitting] = useState(false)

  // 加载供应商列表
  useEffect(() => {
    const loadVendors = async () => {
      try {
        const result = await getOrganizationList({
          organization_type: 'vendor',
          size: 1000,
          is_active: true,
        })
        setVendors(result.records)
      } catch (error: any) {
        console.error('Failed to load vendors:', error)
      }
    }
    loadVendors()
  }, [])

  // 加载所有产品列表（用于添加时选择）
  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        const result = await getProductList({ size: 1000, is_active: true })
        setAllProducts(result.records)
      } catch (error: any) {
        console.error('Failed to load products:', error)
      }
    }
    loadAllProducts()
  }, [])

  // 加载供应商服务列表
  const loadVendorProducts = async (params: VendorProductListParams) => {
    if (!params.vendor_id) {
      setProducts([])
      setTotal(0)
      setCurrentPage(1)
      setPages(0)
      return
    }

    setLoading(true)
    try {
      const result = await getVendorProductList(params)
      setProducts(result.records)
      setTotal(result.total)
      setCurrentPage(result.current)
      setPages(result.pages)
    } catch (error: any) {
      showError(error.message || t('vendorProductList.error.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  // 当供应商ID变化时自动加载
  useEffect(() => {
    if (queryParams.vendor_id) {
      loadVendorProducts(queryParams)
    }
  }, [queryParams.vendor_id, queryParams.page, queryParams.size])

  // 搜索
  const handleSearch = () => {
    setQueryParams({
      ...queryParams,
      vendor_id: formData.vendor_id,
      is_available: formData.is_available === '' ? undefined : formData.is_available === 'true',
      is_primary: formData.is_primary === '' ? undefined : formData.is_primary === 'true',
      page: 1,
    })
  }

  // 重置
  const handleReset = () => {
    setFormData({
      vendor_id: '',
      is_available: '',
      is_primary: '',
    })
    setQueryParams({
      vendor_id: '',
      page: 1,
      size: 10,
    })
  }

  // 分页
  const handlePageChange = (page: number) => {
    setQueryParams({ ...queryParams, page })
  }

  // 创建
  const handleCreate = () => {
    if (!formData.vendor_id) {
      showError(t('vendorProductList.error.selectVendor'))
      return
    }
    setModalFormData({
      product_id: '',
      is_primary: false,
      priority: 0,
      cost_price_idr: '',
      cost_price_cny: '',
      processing_days: '',
      is_available: true,
    })
    setShowModal(true)
  }

  // 编辑
  const handleEdit = (product: Product) => {
    // TODO: 需要获取供应商-产品关联的详细信息
    setModalFormData({
      product_id: product.id,
      is_primary: false,
      priority: 0,
      cost_price_idr: '',
      cost_price_cny: '',
      processing_days: product.processing_days?.toString() || '',
      is_available: product.is_active || true,
    })
    setShowModal(true)
  }

  // 删除
  const handleDelete = async (product: Product) => {
    if (!window.confirm(t('vendorProductList.confirm.delete'))) {
      return
    }
    try {
      // TODO: 等待后端API实现
      // await deleteVendorProduct(queryParams.vendor_id, product.id)
      showError(t('vendorProductList.error.apiNotImplemented'))
      // loadVendorProducts(queryParams)
    } catch (error: any) {
      showError(error.message || t('vendorProductList.error.deleteFailed'))
    }
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!modalFormData.product_id) {
      showError(t('vendorProductList.error.selectProduct'))
      return
    }

    setSubmitting(true)
    try {
      // TODO: 等待后端API实现
      // if (editingProduct) {
      //   await updateVendorProduct(queryParams.vendor_id, modalFormData.product_id, {
      //     is_primary: modalFormData.is_primary,
      //     priority: modalFormData.priority,
      //     cost_price_idr: modalFormData.cost_price_idr ? parseFloat(modalFormData.cost_price_idr) : undefined,
      //     cost_price_cny: modalFormData.cost_price_cny ? parseFloat(modalFormData.cost_price_cny) : undefined,
      //     processing_days: modalFormData.processing_days ? parseInt(modalFormData.processing_days) : undefined,
      //     is_available: modalFormData.is_available,
      //   })
      // } else {
      //   await createVendorProduct({
      //     organization_id: queryParams.vendor_id,
      //     product_id: modalFormData.product_id,
      //     is_primary: modalFormData.is_primary,
      //     priority: modalFormData.priority,
      //     cost_price_idr: modalFormData.cost_price_idr ? parseFloat(modalFormData.cost_price_idr) : undefined,
      //     cost_price_cny: modalFormData.cost_price_cny ? parseFloat(modalFormData.cost_price_cny) : undefined,
      //     processing_days: modalFormData.processing_days ? parseInt(modalFormData.processing_days) : undefined,
      //     is_available: modalFormData.is_available,
      //   })
      // }
      showError(t('vendorProductList.error.apiNotImplemented'))
      // setShowModal(false)
      // loadVendorProducts(queryParams)
    } catch (error: any) {
      showError(error.message || t('vendorProductList.error.saveFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  // 格式化价格
  const formatPrice = (amount: number, currency: 'IDR' | 'CNY') => {
    if (currency === 'IDR') {
      return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount)
    }
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(amount)
  }

  return (
    <div className="w-full">
        {/* 页面标题 */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-1.5 tracking-tight">
              {t('vendorProductList.title')}
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              {t('vendorProductList.subtitle')}
            </p>
          </div>
          <button
            onClick={handleCreate}
            disabled={!formData.vendor_id}
            className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" />
            <span>{t('vendorProductList.create')}</span>
          </button>
        </div>

        {/* 查询表单 */}
        <div className="bg-white rounded-xl border border-gray-200 p-2 mb-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('vendorProductList.search.vendor')}
              </label>
              <div className="relative">
                <Building2 className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                <select
                  value={formData.vendor_id}
                  onChange={(e) => {
                    setFormData({ ...formData, vendor_id: e.target.value })
                    setQueryParams({ ...queryParams, vendor_id: e.target.value, page: 1 })
                  }}
                  className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="">{t('vendorProductList.search.selectVendor')}</option>
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('vendorProductList.search.available')}
              </label>
              <select
                value={formData.is_available}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.value as '' | 'true' | 'false' })}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
              >
                <option value="">{t('vendorProductList.search.allStatus')}</option>
                <option value="true">{t('vendorProductList.search.available')}</option>
                <option value="false">{t('vendorProductList.search.unavailable')}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                {t('vendorProductList.search.primary')}
              </label>
              <select
                value={formData.is_primary}
                onChange={(e) => setFormData({ ...formData, is_primary: e.target.value as '' | 'true' | 'false' })}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
              >
                <option value="">{t('vendorProductList.search.all')}</option>
                <option value="true">{t('vendorProductList.search.primary')}</option>
                <option value="false">{t('vendorProductList.search.secondary')}</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={handleReset}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t('vendorProductList.search.reset')}
            </button>
            <button
              onClick={handleSearch}
              disabled={loading || !formData.vendor_id}
              className="px-4 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
            >
              <Search className="h-3.5 w-3.5" />
              <span>{t('vendorProductList.search.search')}</span>
            </button>
          </div>
        </div>

        {/* 服务列表 */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {!formData.vendor_id ? (
            <div className="p-6 text-center">
              <div className="text-sm text-gray-500">{t('vendorProductList.pleaseSelectVendor')}</div>
            </div>
          ) : loading ? (
            <div className="p-6 text-center">
              <div className="text-sm text-gray-500">{t('vendorProductList.loading')}</div>
            </div>
          ) : products.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-sm text-gray-500">{t('vendorProductList.noData')}</div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-1 py-1 text-left text-xs font-semibold text-gray-900">
                        {t('vendorProductList.table.name')}
                      </th>
                      <th className="px-1 py-1 text-left text-xs font-semibold text-gray-900">
                        {t('vendorProductList.table.code')}
                      </th>
                      <th className="px-1 py-1 text-left text-xs font-semibold text-gray-900">
                        {t('vendorProductList.table.category')}
                      </th>
                      <th className="px-1 py-1 text-left text-xs font-semibold text-gray-900">
                        {t('vendorProductList.table.serviceType')}
                      </th>
                      <th className="px-1 py-1 text-left text-xs font-semibold text-gray-900">
                        {t('vendorProductList.table.price')}
                      </th>
                      <th className="px-1 py-1 text-left text-xs font-semibold text-gray-900">
                        {t('vendorProductList.table.status')}
                      </th>
                      <th className="px-1 py-1 text-left text-xs font-semibold text-gray-900 w-20">
                        {t('vendorProductList.table.actions')}
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
                              <span>{t('vendorProductList.table.active')}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-xs text-red-600">
                              <XCircle className="h-3.5 w-3.5" />
                              <span>{t('vendorProductList.table.inactive')}</span>
                            </span>
                          )}
                        </td>
                        <td className="px-1 py-1">
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleEdit(product)}
                              className="p-1 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                              title={t('vendorProductList.edit')}
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(product)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title={t('vendorProductList.delete')}
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
                    {t('vendorProductList.pagination.total').replace('{{total}}', total.toString())}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-2 py-0.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {t('vendorProductList.pagination.prev')}
                    </button>
                    <div className="text-xs text-gray-700">
                      {t('vendorProductList.pagination.page')
                        .replace('{{current}}', currentPage.toString())
                        .replace('{{total}}', pages.toString())}
                    </div>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === pages}
                      className="px-2 py-0.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {t('vendorProductList.pagination.next')}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {t('vendorProductList.modal.title')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    {t('vendorProductList.modal.product')} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={modalFormData.product_id}
                    onChange={(e) => setModalFormData({ ...modalFormData, product_id: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
                  >
                    <option value="">{t('vendorProductList.modal.selectProduct')}</option>
                    {allProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} {product.code ? `(${product.code})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                      {t('vendorProductList.modal.isPrimary')}
                    </label>
                    <input
                      type="checkbox"
                      checked={modalFormData.is_primary}
                      onChange={(e) => setModalFormData({ ...modalFormData, is_primary: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                      {t('vendorProductList.modal.priority')}
                    </label>
                    <input
                      type="number"
                      value={modalFormData.priority}
                      onChange={(e) => setModalFormData({ ...modalFormData, priority: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                      {t('vendorProductList.modal.costPriceIdr')}
                    </label>
                    <input
                      type="number"
                      value={modalFormData.cost_price_idr}
                      onChange={(e) => setModalFormData({ ...modalFormData, cost_price_idr: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                      {t('vendorProductList.modal.costPriceCny')}
                    </label>
                    <input
                      type="number"
                      value={modalFormData.cost_price_cny}
                      onChange={(e) => setModalFormData({ ...modalFormData, cost_price_cny: e.target.value })}
                      placeholder="0"
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    {t('vendorProductList.modal.processingDays')}
                  </label>
                  <input
                    type="number"
                    value={modalFormData.processing_days}
                    onChange={(e) => setModalFormData({ ...modalFormData, processing_days: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    {t('vendorProductList.modal.isAvailable')}
                  </label>
                  <input
                    type="checkbox"
                    checked={modalFormData.is_available}
                    onChange={(e) => setModalFormData({ ...modalFormData, is_available: e.target.checked })}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                </div>
              </div>
            </div>
            <div className="px-4 py-2.5 border-t border-gray-200 flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('vendorProductList.modal.cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !modalFormData.product_id}
                className="px-4 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t('vendorProductList.modal.saving') : t('vendorProductList.modal.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default VendorProductList

