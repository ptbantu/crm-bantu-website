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
import { PageHeader } from '@/components/admin/PageHeader'
import { formatPrice } from '@/utils/formatPrice'
import {
  Button,
  Card,
  CardBody,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Spinner,
  VStack,
  HStack,
  Flex,
  Box,
  Text,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react'

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


  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Box w="full">
      {/* 页面头部 */}
      <PageHeader
        icon={Package}
        title={t('vendorProductList.title')}
        subtitle={t('vendorProductList.subtitle')}
        actions={
          <Button
            colorScheme="primary"
            leftIcon={<Plus size={16} />}
            onClick={handleCreate}
            disabled={!formData.vendor_id}
            size="sm"
          >
            {t('vendorProductList.create')}
          </Button>
        }
      />

      {/* 查询表单 */}
      <Card mb={4} bg={bgColor} borderColor={borderColor}>
        <CardBody>
          <HStack spacing={3} align="flex-end" flexWrap="wrap">
            {/* 供应商 */}
            <Box flex={1} minW="150px">
              <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.700">
                {t('vendorProductList.search.vendor')}
              </Text>
              <InputGroup size="sm">
                <InputLeftElement pointerEvents="none">
                  <Building2 size={14} color="gray" />
                </InputLeftElement>
                <Select
                  value={formData.vendor_id}
                  onChange={(e) => {
                    setFormData({ ...formData, vendor_id: e.target.value })
                    setQueryParams({ ...queryParams, vendor_id: e.target.value, page: 1 })
                  }}
                  placeholder={t('vendorProductList.search.selectVendor')}
                  pl={8}
                >
                  {vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name}
                    </option>
                  ))}
                </Select>
              </InputGroup>
            </Box>

            {/* 可用状态 */}
            <Box flex={1} minW="150px">
              <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.700">
                {t('vendorProductList.search.available')}
              </Text>
              <Select
                size="sm"
                value={formData.is_available}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.value as '' | 'true' | 'false' })}
              >
                <option value="">{t('vendorProductList.search.allStatus')}</option>
                <option value="true">{t('vendorProductList.search.available')}</option>
                <option value="false">{t('vendorProductList.search.unavailable')}</option>
              </Select>
            </Box>

            {/* 主服务 */}
            <Box flex={1} minW="150px">
              <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.700">
                {t('vendorProductList.search.primary')}
              </Text>
              <Select
                size="sm"
                value={formData.is_primary}
                onChange={(e) => setFormData({ ...formData, is_primary: e.target.value as '' | 'true' | 'false' })}
              >
                <option value="">{t('vendorProductList.search.all')}</option>
                <option value="true">{t('vendorProductList.search.primary')}</option>
                <option value="false">{t('vendorProductList.search.secondary')}</option>
              </Select>
            </Box>

            {/* 操作按钮 */}
            <HStack spacing={2}>
              <Button size="sm" variant="outline" onClick={handleReset}>
                {t('vendorProductList.search.reset')}
              </Button>
              <Button
                size="sm"
                colorScheme="primary"
                leftIcon={<Search size={14} />}
                onClick={handleSearch}
                disabled={loading || !formData.vendor_id}
              >
                {t('vendorProductList.search.search')}
              </Button>
            </HStack>
          </HStack>
        </CardBody>
      </Card>

      {/* 服务列表 */}
      <Card bg={bgColor} borderColor={borderColor} overflow="hidden">
        {!formData.vendor_id ? (
          <CardBody>
            <Text textAlign="center" fontSize="sm" color="gray.500">
              {t('vendorProductList.pleaseSelectVendor')}
            </Text>
          </CardBody>
        ) : loading ? (
          <CardBody>
            <Flex justify="center" align="center" py={8}>
              <Spinner size="md" color="primary.500" />
            </Flex>
          </CardBody>
        ) : products.length === 0 ? (
          <CardBody>
            <Text textAlign="center" fontSize="sm" color="gray.500">
              {t('vendorProductList.noData')}
            </Text>
          </CardBody>
        ) : (
          <>
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead bg="gray.50">
                  <Tr>
                    <Th fontSize="xs" fontWeight="semibold" color="gray.900">
                      {t('vendorProductList.table.name')}
                    </Th>
                    <Th fontSize="xs" fontWeight="semibold" color="gray.900">
                      {t('vendorProductList.table.code')}
                    </Th>
                    <Th fontSize="xs" fontWeight="semibold" color="gray.900">
                      {t('vendorProductList.table.category')}
                    </Th>
                    <Th fontSize="xs" fontWeight="semibold" color="gray.900">
                      {t('vendorProductList.table.serviceType')}
                    </Th>
                    <Th fontSize="xs" fontWeight="semibold" color="gray.900">
                      {t('vendorProductList.table.price')}
                    </Th>
                    <Th fontSize="xs" fontWeight="semibold" color="gray.900">
                      {t('vendorProductList.table.status')}
                    </Th>
                    <Th fontSize="xs" fontWeight="semibold" color="gray.900" w="20">
                      {t('vendorProductList.table.actions')}
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {products.map((product) => (
                    <Tr key={product.id} _hover={{ bg: 'gray.50' }} transition="all 0.2s">
                      <Td fontSize="sm" color="gray.900" fontWeight="medium">
                        {product.name}
                      </Td>
                      <Td fontSize="sm" color="gray.600">
                        {product.code || '-'}
                      </Td>
                      <Td fontSize="sm" color="gray.600">
                        {product.category_name || '-'}
                      </Td>
                      <Td fontSize="sm" color="gray.600">
                        <HStack spacing={1.5}>
                          <Tag size={14} color="gray" />
                          <Text>{product.service_type || '-'}</Text>
                          {product.service_subtype && (
                            <Text fontSize="xs" color="gray.500">
                              ({product.service_subtype})
                            </Text>
                          )}
                        </HStack>
                      </Td>
                      <Td fontSize="sm" color="gray.600">
                        <VStack spacing={0.5} align="flex-start">
                          {product.price_direct_idr && (
                            <HStack spacing={1.5}>
                              <DollarSign size={14} color="gray" />
                              <Text fontSize="xs">{formatPrice(product.price_direct_idr, 'IDR')}</Text>
                            </HStack>
                          )}
                          {product.price_direct_cny && (
                            <HStack spacing={1.5}>
                              <DollarSign size={14} color="gray" />
                              <Text fontSize="xs">{formatPrice(product.price_direct_cny, 'CNY')}</Text>
                            </HStack>
                          )}
                          {!product.price_direct_idr && !product.price_direct_cny && (
                            <Text>-</Text>
                          )}
                        </VStack>
                      </Td>
                      <Td fontSize="sm">
                        {product.is_active ? (
                          <Badge colorScheme="green" fontSize="xs">
                            <HStack spacing={1}>
                              <CheckCircle2 size={14} />
                              <Text>{t('vendorProductList.table.active')}</Text>
                            </HStack>
                          </Badge>
                        ) : (
                          <Badge colorScheme="red" fontSize="xs">
                            <HStack spacing={1}>
                              <XCircle size={14} />
                              <Text>{t('vendorProductList.table.inactive')}</Text>
                            </HStack>
                          </Badge>
                        )}
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          <IconButton
                            aria-label={t('vendorProductList.edit')}
                            icon={<Edit size={14} />}
                            size="xs"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => handleEdit(product)}
                          />
                          <IconButton
                            aria-label={t('vendorProductList.delete')}
                            icon={<Trash2 size={14} />}
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleDelete(product)}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>

            {/* 分页 */}
            {pages > 1 && (
              <Flex
                px={4}
                py={2}
                borderTopWidth={1}
                borderColor={borderColor}
                justify="space-between"
                align="center"
              >
                <Text fontSize="xs" color="gray.600">
                  {t('vendorProductList.pagination.total').replace('{{total}}', total.toString())}
                </Text>
                <HStack spacing={2}>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    isDisabled={currentPage === 1}
                  >
                    {t('vendorProductList.pagination.prev')}
                  </Button>
                  <Text fontSize="xs" color="gray.700">
                    {t('vendorProductList.pagination.page')
                      .replace('{{current}}', currentPage.toString())
                      .replace('{{total}}', pages.toString())}
                  </Text>
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    isDisabled={currentPage === pages}
                  >
                    {t('vendorProductList.pagination.next')}
                  </Button>
                </HStack>
              </Flex>
            )}
          </>
        )}
      </Card>

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
    </Box>
  )
}

export default VendorProductList

