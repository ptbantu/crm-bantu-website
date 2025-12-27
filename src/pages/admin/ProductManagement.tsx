/**
 * 产品/服务管理页面
 * 包含：服务列表、供应商关联、价格管理
 */
import { useState, useEffect, useMemo } from 'react'
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
import { formatPrice } from '@/utils/formatPrice'
import {
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
  HStack,
  VStack,
  Box,
  Flex,
  Spinner,
  Text,
  Badge,
  IconButton,
  Card,
  CardBody,
  useColorModeValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react'

const ProductManagement = () => {
  const { t } = useTranslation()
  const { showSuccess, showError } = useToast()
  
  // Chakra UI 颜色模式
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

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
    service_subtype: '',
    processing_days: '',
    processing_time_text: '',
    price_direct_idr: '',
    price_direct_cny: '',
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
        service_subtype: detail.service_subtype || '',
        processing_days: detail.processing_days?.toString() || '',
        processing_time_text: detail.processing_time_text || '',
        price_direct_idr: detail.price_direct_idr?.toString() || '',
        price_direct_cny: detail.price_direct_cny?.toString() || '',
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
      service_subtype: '',
      processing_days: '',
      processing_time_text: '',
      price_direct_idr: '',
      price_direct_cny: '',
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
          service_subtype: modalFormData.service_subtype || undefined,
          processing_days: modalFormData.processing_days ? parseInt(modalFormData.processing_days) : undefined,
          processing_time_text: modalFormData.processing_time_text || undefined,
          price_direct_idr: modalFormData.price_direct_idr ? parseFloat(modalFormData.price_direct_idr) : undefined,
          price_direct_cny: modalFormData.price_direct_cny ? parseFloat(modalFormData.price_direct_cny) : undefined,
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
          service_subtype: modalFormData.service_subtype || undefined,
          processing_days: modalFormData.processing_days ? parseInt(modalFormData.processing_days) : undefined,
          processing_time_text: modalFormData.processing_time_text || undefined,
          price_direct_idr: modalFormData.price_direct_idr ? parseFloat(modalFormData.price_direct_idr) : undefined,
          price_direct_cny: modalFormData.price_direct_cny ? parseFloat(modalFormData.price_direct_cny) : undefined,
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

  // 按分类分组产品
  const productsByCategory = useMemo(() => {
    const grouped: Record<string, Product[]> = {}
    
    products.forEach((product) => {
      const categoryKey = product.category_id || 'uncategorized'
      const categoryName = product.category_name || t('productManagement.table.uncategorized')
      
      if (!grouped[categoryKey]) {
        grouped[categoryKey] = []
      }
      grouped[categoryKey].push(product)
    })
    
    return Object.entries(grouped)
      .map(([categoryId, products]) => ({
        categoryId,
        categoryName: products[0]?.category_name || t('productManagement.table.uncategorized'),
        products,
      }))
      .sort((a, b) => {
        if (a.categoryId === 'uncategorized') return 1
        if (b.categoryId === 'uncategorized') return -1
        return a.categoryName.localeCompare(b.categoryName)
      })
  }, [products, t])


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
      <Card mb={4} bg={bgColor} borderColor={borderColor}>
        <CardBody>
          <HStack spacing={3} align="flex-end" flexWrap="wrap">
            {/* 产品名称 */}
            <Box flex={1} minW="150px">
              <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.700">
                {t('productManagement.search.name')}
              </Text>
              <InputGroup size="sm">
                <InputLeftElement pointerEvents="none">
                  <Package size={14} color="gray" />
                </InputLeftElement>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('productManagement.search.namePlaceholder')}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </InputGroup>
            </Box>

            {/* 产品编码 */}
            <Box flex={1} minW="150px">
              <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.700">
                {t('productManagement.search.code')}
              </Text>
              <InputGroup size="sm">
                <InputLeftElement pointerEvents="none">
                  <Tag size={14} color="gray" />
                </InputLeftElement>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder={t('productManagement.search.codePlaceholder')}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </InputGroup>
            </Box>

            {/* 分类 */}
            <Box flex={1} minW="120px">
              <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.700">
                {t('productManagement.search.category')}
              </Text>
              <Select
                size="sm"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              >
                <option value="">{t('productManagement.search.allCategories')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </Box>

            {/* 状态 */}
            <Box flex={1} minW="120px">
              <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.700">
                {t('productManagement.search.status')}
              </Text>
              <Select
                size="sm"
                value={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value as '' | 'true' | 'false' })}
              >
                <option value="">{t('productManagement.search.allStatus')}</option>
                <option value="true">{t('productManagement.search.active')}</option>
                <option value="false">{t('productManagement.search.inactive')}</option>
              </Select>
            </Box>

            {/* 操作按钮 */}
            <HStack spacing={2}>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReset}
              >
                {t('productManagement.search.reset')}
              </Button>
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<Search size={14} />}
                onClick={handleSearch}
                isLoading={loading}
              >
                {t('productManagement.search.search')}
              </Button>
            </HStack>
          </HStack>
        </CardBody>
      </Card>

      {/* 产品列表 */}
      {loading ? (
        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <Flex justify="center" align="center" py={8}>
              <Spinner size="lg" color="blue.500" />
              <Text ml={4} color="gray.500">{t('productManagement.loading')}</Text>
            </Flex>
          </CardBody>
        </Card>
      ) : products.length === 0 ? (
        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <VStack py={8} spacing={3}>
              <Package size={48} color="gray" />
              <Text color="gray.500">{t('productManagement.noData')}</Text>
            </VStack>
          </CardBody>
        </Card>
      ) : (
        <Card bg={bgColor} borderColor={borderColor} overflow="hidden">
          <Box overflowX="auto">
            <Accordion allowMultiple defaultIndex={[]}>
              {productsByCategory.map((categoryGroup) => (
                <AccordionItem key={categoryGroup.categoryId} border="none">
                  <AccordionButton
                    px={4}
                    py={3}
                    bg="gray.50"
                    _hover={{ bg: 'gray.100' }}
                    _expanded={{ bg: 'blue.50', color: 'blue.700' }}
                  >
                    <Box flex="1" textAlign="left">
                      <Text fontSize="sm" fontWeight="semibold">
                        {categoryGroup.categoryName}
                      </Text>
                      <Text fontSize="xs" color="gray.500" mt={0.5}>
                        {categoryGroup.products.length} {t('productManagement.table.items')}
                      </Text>
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel px={0} pb={0}>
                    <Table variant="simple" size="sm">
                      <Thead bg="gray.50">
                        <Tr>
                          <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('productManagement.table.name')}</Th>
                          <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('productManagement.table.code')}</Th>
                          <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('productManagement.table.priceCost')}</Th>
                          <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('productManagement.table.priceChannel')}</Th>
                          <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('productManagement.table.priceDirect')}</Th>
                          <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('productManagement.table.status')}</Th>
                          <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('productManagement.table.actions')}</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {categoryGroup.products.map((product) => (
                          <Tr key={product.id} _hover={{ bg: hoverBg }} transition="background-color 0.2s">
                            <Td fontSize="sm" color="gray.900" fontWeight="medium">{product.name}</Td>
                            <Td fontSize="sm" color="gray.600">{product.code || '-'}</Td>
                            <Td fontSize="sm" color="gray.600">
                              <VStack spacing={0.5} align="flex-start">
                                {product.price_cost_idr ? (
                                  <Text fontSize="xs">{formatPrice(product.price_cost_idr, 'IDR')}</Text>
                                ) : (
                                  <Text fontSize="xs" color="gray.400">-</Text>
                                )}
                                {product.price_cost_cny ? (
                                  <Text fontSize="xs">{formatPrice(product.price_cost_cny, 'CNY')}</Text>
                                ) : (
                                  <Text fontSize="xs" color="gray.400">-</Text>
                                )}
                              </VStack>
                            </Td>
                            <Td fontSize="sm" color="gray.600">
                              <VStack spacing={0.5} align="flex-start">
                                {product.price_channel_idr ? (
                                  <Text fontSize="xs">{formatPrice(product.price_channel_idr, 'IDR')}</Text>
                                ) : (
                                  <Text fontSize="xs" color="gray.400">-</Text>
                                )}
                                {product.price_channel_cny ? (
                                  <Text fontSize="xs">{formatPrice(product.price_channel_cny, 'CNY')}</Text>
                                ) : (
                                  <Text fontSize="xs" color="gray.400">-</Text>
                                )}
                              </VStack>
                            </Td>
                            <Td fontSize="sm" color="gray.600">
                              <VStack spacing={0.5} align="flex-start">
                                {product.price_direct_idr ? (
                                  <Text fontSize="xs">{formatPrice(product.price_direct_idr, 'IDR')}</Text>
                                ) : (
                                  <Text fontSize="xs" color="gray.400">-</Text>
                                )}
                                {product.price_direct_cny ? (
                                  <Text fontSize="xs">{formatPrice(product.price_direct_cny, 'CNY')}</Text>
                                ) : (
                                  <Text fontSize="xs" color="gray.400">-</Text>
                                )}
                              </VStack>
                            </Td>
                            <Td fontSize="sm">
                              {product.is_active ? (
                                <Badge colorScheme="green" fontSize="xs">
                                  {t('productManagement.table.active')}
                                </Badge>
                              ) : (
                                <Badge colorScheme="red" fontSize="xs">
                                  {t('productManagement.table.inactive')}
                                </Badge>
                              )}
                            </Td>
                            <Td fontSize="sm">
                              <HStack spacing={1}>
                                <IconButton
                                  aria-label={t('productManagement.viewDetail')}
                                  icon={<Eye size={14} />}
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="blue"
                                  onClick={() => handleViewDetail(product.id)}
                                />
                                <IconButton
                                  aria-label={t('productManagement.edit')}
                                  icon={<Edit size={14} />}
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="blue"
                                  onClick={() => handleEdit(product)}
                                />
                                <IconButton
                                  aria-label={t('productManagement.delete')}
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
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </Box>
        </Card>
      )}

      {/* 分页 */}
      {pages > 1 && (
        <Card mt={4} bg={bgColor} borderColor={borderColor}>
          <CardBody py={2}>
            <Flex justify="space-between" align="center">
              <Text fontSize="xs" color="gray.600">
                {t('productManagement.pagination.info', { current: currentPage, total: pages, size: queryParams.size || 10 })}
              </Text>
              <HStack spacing={1}>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  isDisabled={currentPage === 1}
                >
                  {t('productManagement.pagination.prev')}
                </Button>
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
                    <Button
                      key={pageNum}
                      size="xs"
                      variant={currentPage === pageNum ? 'solid' : 'outline'}
                      colorScheme={currentPage === pageNum ? 'blue' : 'gray'}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  isDisabled={currentPage === pages}
                >
                  {t('productManagement.pagination.next')}
                </Button>
              </HStack>
            </Flex>
          </CardBody>
        </Card>
      )}

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
                    {productDetail.service_subtype && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('productManagement.form.serviceSubtype')}
                        </label>
                        <div className="text-sm text-gray-900">{productDetail.service_subtype}</div>
                      </div>
                    )}
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

