/**
 * 产品/服务管理页面
 * 包含：服务列表、供应商关联、价格管理
 */
import { useState, useEffect, useMemo } from 'react'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, X, Package, Tag, DollarSign, CheckCircle2, XCircle, Save, Download, ChevronDown, ChevronRight, Info } from 'lucide-react'
import {
  getProductList,
  createProduct,
  updateProduct,
  CreateProductRequest,
  UpdateProductRequest,
} from '@/api/products'
import { getCategoryList } from '@/api/categories'
import { ProductListParams, Product, ProductCategory } from '@/api/types'
import { useToast } from '@/components/ToastContainer'
import { PageHeader } from '@/components/admin/PageHeader'
import {
  ProductDetailDrawer,
  ProductBasicInfoSidebar,
  ProductPriceConfigSidebar,
  ProductBasicInfo,
  ProductPriceConfig,
} from '@/components/admin/product'
import { formatPrice } from '@/utils/formatPrice'
import { useAuth } from '@/hooks/useAuth'
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
  Card,
  CardBody,
  useColorModeValue,
  Checkbox,
  Tooltip,
  Icon,
} from '@chakra-ui/react'

const EnterpriseServiceProduct = () => {
  const { t } = useTranslation()
  const { showSuccess, showError } = useToast()
  const { user } = useAuth()
  
  // 检查是否为管理员
  const isAdmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('admin') || false
  
  // Chakra UI 颜色模式
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  // 查询参数（使用后端分组功能）
  const [queryParams, setQueryParams] = useState<ProductListParams>({
    page: 1,
    size: 100, // 使用后端分组时，size会被忽略，但需要设置一个有效值
    group_by_category: true, // 启用后端分组
  })

  // 数据
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pages, setPages] = useState(0)
  
  // 选中状态
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  // 分类折叠状态（key: categoryName, value: isExpanded）
  const [categoryExpanded, setCategoryExpanded] = useState<Record<string, boolean>>({})

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category_id: '',
    status: '',
    is_active: '' as '' | 'true' | 'false',
  })

  // 弹窗状态（用于编辑）
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  
  // 侧边栏状态（用于创建和编辑）
  const [showBasicInfoSidebar, setShowBasicInfoSidebar] = useState(false)
  const [showPriceConfigSidebar, setShowPriceConfigSidebar] = useState(false)
  const [basicInfoData, setBasicInfoData] = useState<ProductBasicInfo | null>(null)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [modalFormData, setModalFormData] = useState({
    name: '',
    code: '',
    category_id: '',
    service_subtype: '',
    processing_days: '',
    processing_time_text: '',
    // 注意：estimated_cost_idr 和 estimated_cost_cny 已删除
    price_direct_idr: '',
    price_direct_cny: '',
    price_channel_idr: '',
    price_channel_cny: '',
    status: 'active',
    is_active: true,
  })
  const [submitting, setSubmitting] = useState(false)

  // 详情抽屉状态
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null)

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
      // 清空选中状态（切换页面时）
      setSelectedIds([])
      
      // 初始化所有分类为展开状态（如果还没有设置过）
      const newExpanded: Record<string, boolean> = {}
      result.records.forEach((product) => {
        const categoryName = product.category_name || '未分类'
        if (categoryExpanded[categoryName] === undefined) {
          newExpanded[categoryName] = true
        }
      })
      if (Object.keys(newExpanded).length > 0) {
        setCategoryExpanded(prev => ({ ...prev, ...newExpanded }))
      }
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
      size: 100, // 使用后端分组时，size会被忽略
      group_by_category: true, // 启用后端分组
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
      size: 100, // 使用后端分组时，size会被忽略
      group_by_category: true, // 启用后端分组
    }
    setQueryParams(defaultParams)
    loadProducts(defaultParams)
  }

  // 分页（分组展示时不需要分页）
  // const handlePageChange = (page: number) => {
  //   const params = { ...queryParams, page }
  //   setQueryParams(params)
  //   loadProducts(params)
  // }

  // 打开创建弹窗（用于编辑）
  const handleCreate = () => {
    // 使用侧边栏流程创建新产品
    setShowBasicInfoSidebar(true)
    setBasicInfoData(null)
  }

  // 打开编辑侧边栏
  const handleEdit = async (productOrId: Product | string) => {
    let product: Product
    if (typeof productOrId === 'string') {
      // 从列表中找到产品
      product = products.find(p => p.id === productOrId)!
      if (!product) {
        showError('产品不存在')
        return
      }
    } else {
      product = productOrId
    }
    
    // 将 Product 转换为 ProductBasicInfo 格式
    const basicInfo: ProductBasicInfo = {
      name: product.name,
      service_type: product.service_type || '',
      category_id: product.category_id || '',
      code: product.code || '',
      status: (product.status as 'active' | 'suspended') || 'active',
      description: product.processing_time_text || '',
      processing_days: product.processing_days?.toString() || '',
      is_urgent_available: false, // 从 ProductDetail 获取，这里先设为 false
      applicable_regions: [], // 需要从 tags 中解析 region:xxx
      required_documents: [], // 需要从 required_documents 字符串解析
      service_level: '', // 需要从 ProductDetail 获取
      tags: product.tags || [],
    }
    
    // 解析适用地区（从 tags 中提取 region:xxx）
    if (product.tags) {
      basicInfo.applicable_regions = product.tags
        .filter(tag => tag.startsWith('region:'))
        .map(tag => tag.replace('region:', ''))
    }
    
    setEditingProductId(product.id)
    setBasicInfoData(basicInfo)
    setShowBasicInfoSidebar(true)
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
      // 注意：estimated_cost_idr 和 estimated_cost_cny 已删除
      price_direct_idr: '',
      price_direct_cny: '',
      price_channel_idr: '',
      price_channel_cny: '',
      status: 'active',
      is_active: true,
    })
  }

  // 处理基本信息侧边栏的下一步
  const handleBasicInfoNext = (data: ProductBasicInfo) => {
    setBasicInfoData(data)
    setShowBasicInfoSidebar(false)
    setShowPriceConfigSidebar(true)
  }

  // 处理价格配置侧边栏的提交
  const handlePriceConfigSubmit = async (basicInfo: ProductBasicInfo, priceConfig: ProductPriceConfig) => {
    if (!basicInfo) return

    setSubmitting(true)
    try {
      // 构建创建产品的数据
      const createData: CreateProductRequest = {
        name: basicInfo.name.trim(),
        code: basicInfo.code || undefined,
        category_id: basicInfo.category_id || undefined,
        service_type: basicInfo.service_type || undefined,
        service_subtype: basicInfo.service_type || undefined,
        processing_days: basicInfo.processing_days ? parseInt(basicInfo.processing_days) : undefined,
        processing_time_text: basicInfo.description || undefined,
        is_urgent_available: basicInfo.is_urgent_available,
        status: basicInfo.status || 'active',
        is_active: basicInfo.status === 'active',
        service_level: basicInfo.service_level || undefined,
        required_documents: basicInfo.required_documents.length > 0 ? basicInfo.required_documents.join(',') : undefined,
        tags: basicInfo.tags.length > 0 ? basicInfo.tags : undefined,
        // 前端新增字段
        applicable_regions: basicInfo.applicable_regions.length > 0 ? basicInfo.applicable_regions : undefined,
        // 价格信息
        price_cost_idr: priceConfig.price_cost_idr > 0 ? priceConfig.price_cost_idr : undefined,
        price_cost_cny: priceConfig.price_cost_cny > 0 ? priceConfig.price_cost_cny : undefined,
        price_channel_idr: priceConfig.price_channel_idr > 0 ? priceConfig.price_channel_idr : undefined,
        price_channel_cny: priceConfig.price_channel_cny > 0 ? priceConfig.price_channel_cny : undefined,
        price_direct_idr: priceConfig.price_direct_idr > 0 ? priceConfig.price_direct_idr : undefined,
        price_direct_cny: priceConfig.price_direct_cny > 0 ? priceConfig.price_direct_cny : undefined,
        default_currency: priceConfig.default_currency,
        exchange_rate: priceConfig.exchange_rate > 0 ? priceConfig.exchange_rate : undefined,
        // 价格时间字段
        price_effective_from: priceConfig.effective_from ? new Date(priceConfig.effective_from) : undefined,
        price_effective_to: priceConfig.effective_to ? new Date(priceConfig.effective_to) : undefined,
      }

      await createProduct(createData)
      showSuccess(t('productManagement.success.create'))
      
      // 关闭侧边栏
      setShowPriceConfigSidebar(false)
      setShowBasicInfoSidebar(false)
      setBasicInfoData(null)
      setSelectedIds([])
      loadProducts(queryParams)
    } catch (error: any) {
      showError(error.message || t('productManagement.error.saveFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  // 处理价格配置侧边栏的返回
  const handlePriceConfigBack = () => {
    setShowPriceConfigSidebar(false)
    setShowBasicInfoSidebar(true)
  }

  // 处理编辑提交
  const handleEditSubmit = async (data: ProductBasicInfo) => {
    if (!editingProductId) return
    
    setSubmitting(true)
    try {
      // 构建 tags，包含原有标签和适用地区
      const tags: string[] = [...(data.tags || [])]
      // 移除旧的地区标签
      const filteredTags = tags.filter(tag => !tag.startsWith('region:'))
      // 添加新的地区标签
      if (data.applicable_regions && data.applicable_regions.length > 0) {
        filteredTags.push(...data.applicable_regions.map(region => `region:${region}`))
      }
      
      const updateData: UpdateProductRequest = {
        // 注意：编辑时不发送 name, code, category_id（这些字段在编辑模式下被禁用）
        // 注意：编辑时不发送任何价格字段（价格通过独立的价格管理API管理，products表中已无价格字段）
        service_type: data.service_type || undefined,
        service_subtype: data.service_type || undefined,
        processing_days: data.processing_days ? parseInt(data.processing_days) : undefined,
        processing_time_text: data.description || undefined,
        is_urgent_available: data.is_urgent_available,
        status: data.status || undefined,
        is_active: data.status === 'active',
        service_level: data.service_level || undefined,
        required_documents: data.required_documents.length > 0 ? data.required_documents.join(',') : undefined,
        tags: filteredTags.length > 0 ? filteredTags : undefined,
        // 适用地区通过 tags 存储，不需要单独发送
      }
      
      await updateProduct(editingProductId, updateData)
      showSuccess(t('productManagement.success.update'))
      
      // 关闭侧边栏
      setShowBasicInfoSidebar(false)
      setBasicInfoData(null)
      setEditingProductId(null)
      setSelectedIds([])
      loadProducts(queryParams)
    } catch (error: any) {
      showError(error.message || t('productManagement.error.saveFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  // 关闭基本信息侧边栏
  const handleCloseBasicInfoSidebar = () => {
    setShowBasicInfoSidebar(false)
    setBasicInfoData(null)
    setEditingProductId(null)
  }

  // 关闭价格配置侧边栏
  const handleClosePriceConfigSidebar = () => {
    setShowPriceConfigSidebar(false)
    setBasicInfoData(null)
  }

  // 提交表单（用于编辑）
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
          // 注意：estimated_cost_idr 和 estimated_cost_cny 已删除
          price_direct_idr: modalFormData.price_direct_idr ? parseFloat(modalFormData.price_direct_idr) : undefined,
          price_direct_cny: modalFormData.price_direct_cny ? parseFloat(modalFormData.price_direct_cny) : undefined,
          price_channel_idr: modalFormData.price_channel_idr ? parseFloat(modalFormData.price_channel_idr) : undefined,
          price_channel_cny: modalFormData.price_channel_cny ? parseFloat(modalFormData.price_channel_cny) : undefined,
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
          // 注意：estimated_cost_idr 和 estimated_cost_cny 已删除
          price_direct_idr: modalFormData.price_direct_idr ? parseFloat(modalFormData.price_direct_idr) : undefined,
          price_direct_cny: modalFormData.price_direct_cny ? parseFloat(modalFormData.price_direct_cny) : undefined,
          price_channel_idr: modalFormData.price_channel_idr ? parseFloat(modalFormData.price_channel_idr) : undefined,
          price_channel_cny: modalFormData.price_channel_cny ? parseFloat(modalFormData.price_channel_cny) : undefined,
          status: modalFormData.status || 'active',
          is_active: modalFormData.is_active,
        }
        await createProduct(createData)
        showSuccess(t('productManagement.success.create'))
      }
      handleCloseModal()
      setSelectedIds([])
      loadProducts(queryParams)
    } catch (error: any) {
      showError(error.message || t('productManagement.error.saveFailed'))
    } finally {
      setSubmitting(false)
    }
  }


  // 打开详情抽屉
  const handleViewDetail = (productId: string) => {
    setSelectedProductId(productId)
    setHighlightedProductId(productId)
  }

  // 关闭详情抽屉
  const handleCloseDetail = () => {
    setSelectedProductId(null)
    setHighlightedProductId(null)
  }


  // 全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(products.map(p => p.id))
    } else {
      setSelectedIds([])
    }
  }

  // 单个选择
  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id])
    } else {
      setSelectedIds(selectedIds.filter(i => i !== id))
    }
  }

  // 导出功能（Excel格式）
  const handleExport = () => {
    if (selectedIds.length === 0) {
      showError(t('productManagement.selectAtLeastOne'))
      return
    }

    // 获取选中的产品数据
    const selectedProducts = products.filter(p => selectedIds.includes(p.id))
    
    // 准备Excel数据
    const headers = [
      t('productManagement.table.name'),
      t('productManagement.table.code'),
      t('productManagement.table.category'),
      t('productManagement.form.serviceSubtype'),
      t('productManagement.form.processingDays'),
      t('productManagement.form.priceDirectIdr'),
      t('productManagement.form.priceDirectCny'),
      t('productManagement.table.status'),
      t('productManagement.form.isActive'),
    ]
    
    const rows = selectedProducts.map(product => [
      product.name || '',
      product.code || '',
      product.category_name || '',
      product.service_subtype || '',
      product.processing_days?.toString() || '',
      product.price_direct_idr?.toString() || '',
      product.price_direct_cny?.toString() || '',
      product.status || '',
      product.is_active ? t('productManagement.table.active') : t('productManagement.table.inactive'),
    ])
    
    // 创建Excel内容（使用HTML表格格式，浏览器会自动识别为Excel）
    let htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
        <head>
          <meta charset="utf-8">
          <!--[if gte mso 9]>
          <xml>
            <x:ExcelWorkbook>
              <x:ExcelWorksheets>
                <x:ExcelWorksheet>
                  <x:Name>企服产品</x:Name>
                  <x:WorksheetOptions>
                    <x:DisplayGridlines/>
                  </x:WorksheetOptions>
                </x:ExcelWorksheet>
              </x:ExcelWorksheets>
            </x:ExcelWorkbook>
          </xml>
          <![endif]-->
          <style>
            table {
              border-collapse: collapse;
              width: 100%;
            }
            th {
              background-color: #f0f0f0;
              font-weight: bold;
              border: 1px solid #ccc;
              padding: 8px;
              text-align: center;
            }
            td {
              border: 1px solid #ccc;
              padding: 6px;
            }
          </style>
        </head>
        <body>
          <table>
            <thead>
              <tr>
                ${headers.map(h => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `
    
    // 创建Blob并下载
    const blob = new Blob([htmlContent], { type: 'application/vnd.ms-excel' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    const dateStr = new Date().toISOString().split('T')[0]
    link.setAttribute('download', `企服产品_${dateStr}.xls`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    showSuccess(t('productManagement.exportSuccess', { count: selectedIds.length }))
  }

  return (
    <div className="w-full">
      {/* 页面头部 */}
      <PageHeader
        icon={Package}
        title={t('menu.enterpriseServiceProduct')}
        subtitle={t('productManagement.subtitle')}
        actions={
          <HStack spacing={2}>
            <Button
              size="sm"
              variant="outline"
              leftIcon={<Download size={14} />}
              onClick={handleExport}
              isDisabled={selectedIds.length === 0}
            >
              {t('productManagement.export')}
              {selectedIds.length > 0 && ` (${selectedIds.length})`}
            </Button>
            {isAdmin && (
              <Button
                colorScheme="primary"
                leftIcon={<Plus size={16} />}
                onClick={handleCreate}
                size="sm"
              >
                {t('productManagement.create')}
              </Button>
            )}
          </HStack>
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
          <Box 
            position="relative"
            overflowX="auto"
            overflowY="visible"
            css={{
              '&::-webkit-scrollbar': {
                height: '8px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#888',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#555',
              },
            }}
          >
            <Table variant="simple" size="sm" minW="1480px">
              <Thead bg="gray.50" position="sticky" top={0} zIndex={10}>
                <Tr>
                  <Th 
                    fontSize="xs" 
                    fontWeight="semibold" 
                    color="gray.700" 
                    w="40px" 
                    position="sticky" 
                    left={0} 
                    bg="gray.50" 
                    zIndex={11}
                    borderRightWidth="1px"
                    borderRightColor="gray.200"
                  >
                    <Checkbox
                      isChecked={selectedIds.length === products.length && products.length > 0}
                      isIndeterminate={selectedIds.length > 0 && selectedIds.length < products.length}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                    />
                  </Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700" minW="200px">{t('productManagement.table.name')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700" minW="120px" fontFamily="mono">{t('productManagement.table.code')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700" minW="120px">{t('productManagement.table.category')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700" minW="100px">
                    <Tooltip
                      label={
                        <Box>
                          <Text fontWeight="bold" mb={1} color="white">{t('productManagement.table.estimatedProcessingTimeTitle')}</Text>
                          <Text fontSize="xs" color="gray.100">{t('productManagement.table.estimatedProcessingTimeDesc')}</Text>
                          <Text fontSize="xs" mt={1} color="gray.100">{t('productManagement.table.estimatedProcessingTimeUsage')}</Text>
                        </Box>
                      }
                      placement="top"
                      hasArrow
                      bg="gray.800"
                      color="white"
                      fontSize="xs"
                      px={3}
                      py={2}
                      borderRadius="md"
                    >
                      <HStack spacing={1} cursor="help">
                        <Text>{t('productManagement.table.estimatedProcessingTime')}</Text>
                        <Icon as={Info} boxSize={3} />
                      </HStack>
                    </Tooltip>
                  </Th>
                  {/* 价格字段组 */}
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700" minW="120px" bg="blue.50" colSpan={6}>
                    <Tooltip
                      label={
                        <Box>
                          <Text fontWeight="bold" mb={1} color="white">{t('productManagement.table.priceInfoTitle')}</Text>
                          <Text fontSize="xs" mb={1} color="gray.100">{t('productManagement.table.priceInfoCost')}</Text>
                          <Text fontSize="xs" mb={1} color="gray.100">{t('productManagement.table.priceInfoEstimatedCost')}</Text>
                          <Text fontSize="xs" mb={1} color="gray.100">{t('productManagement.table.priceInfoDirect')}</Text>
                          <Text fontSize="xs" mb={1} color="gray.100">{t('productManagement.table.priceInfoChannel')}</Text>
                          <Text fontSize="xs" color="gray.100">{t('productManagement.table.priceInfoList')}</Text>
                        </Box>
                      }
                      placement="top"
                      hasArrow
                      bg="gray.800"
                      color="white"
                      fontSize="xs"
                      px={3}
                      py={2}
                      borderRadius="md"
                    >
                      <Box textAlign="center" py={1} cursor="help">
                        <HStack spacing={1} justify="center">
                          <Text>{t('productManagement.table.priceInfo')}</Text>
                          <Icon as={Info} boxSize={3} />
                        </HStack>
                      </Box>
                    </Tooltip>
                  </Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700" minW="100px">{t('productManagement.table.status')}</Th>
                  <Th 
                    fontSize="xs" 
                    fontWeight="semibold" 
                    color="gray.700" 
                    minW="150px" 
                    position="sticky" 
                    right={0} 
                    bg="gray.50" 
                    zIndex={11}
                    borderLeftWidth="1px"
                    borderLeftColor="gray.200"
                  >
                    {t('productManagement.table.actions')}
                  </Th>
                </Tr>
                <Tr>
                  <Th bg="gray.50" position="sticky" left={0} zIndex={11} borderRightWidth="1px" borderRightColor="gray.200"></Th>
                  <Th bg="gray.50"></Th>
                  <Th bg="gray.50"></Th>
                  <Th bg="gray.50"></Th>
                  <Th bg="gray.50"></Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700" minW="90px" bg="blue.50">
                    <Tooltip
                      label={
                        <Box>
                          <Text fontWeight="bold" mb={1} color="white">{t('productManagement.table.priceCostIdr')}</Text>
                          <Text fontSize="xs" color="gray.100">{t('productManagement.table.priceCostIdrDesc')}</Text>
                          <Text fontSize="xs" mt={1} color="gray.100">{t('productManagement.table.priceCostIdrUsage')}</Text>
                        </Box>
                      }
                      placement="top"
                      hasArrow
                      bg="gray.800"
                      color="white"
                      fontSize="xs"
                      px={3}
                      py={2}
                      borderRadius="md"
                    >
                      <HStack spacing={1} cursor="help">
                        <Text>{t('productManagement.table.priceCostIdr')}</Text>
                        <Icon as={Info} boxSize={3} />
                      </HStack>
                    </Tooltip>
                  </Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700" minW="90px" bg="blue.50">
                    <Tooltip
                      label={
                        <Box>
                          <Text fontWeight="bold" mb={1} color="white">{t('productManagement.table.priceCostCny')}</Text>
                          <Text fontSize="xs" color="gray.100">{t('productManagement.table.priceCostCnyDesc')}</Text>
                          <Text fontSize="xs" mt={1} color="gray.100">{t('productManagement.table.priceCostCnyUsage')}</Text>
                        </Box>
                      }
                      placement="top"
                      hasArrow
                      bg="gray.800"
                      color="white"
                      fontSize="xs"
                      px={3}
                      py={2}
                      borderRadius="md"
                    >
                      <HStack spacing={1} cursor="help">
                        <Text>{t('productManagement.table.priceCostCny')}</Text>
                        <Icon as={Info} boxSize={3} />
                      </HStack>
                    </Tooltip>
                  </Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700" minW="90px" bg="blue.50">
                    <Tooltip
                      label={
                        <Box>
                          <Text fontWeight="bold" mb={1} color="white">{t('productManagement.table.priceDirectIdr')}</Text>
                          <Text fontSize="xs" color="gray.100">{t('productManagement.table.priceDirectIdrDesc')}</Text>
                          <Text fontSize="xs" mt={1} color="gray.100">{t('productManagement.table.priceDirectIdrUsage')}</Text>
                        </Box>
                      }
                      placement="top"
                      hasArrow
                      bg="gray.800"
                      color="white"
                      fontSize="xs"
                      px={3}
                      py={2}
                      borderRadius="md"
                    >
                      <HStack spacing={1} cursor="help">
                        <Text>{t('productManagement.table.priceDirectIdr')}</Text>
                        <Icon as={Info} boxSize={3} />
                      </HStack>
                    </Tooltip>
                  </Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700" minW="90px" bg="blue.50">
                    <Tooltip
                      label={
                        <Box>
                          <Text fontWeight="bold" mb={1} color="white">{t('productManagement.table.priceDirectCny')}</Text>
                          <Text fontSize="xs" color="gray.100">{t('productManagement.table.priceDirectCnyDesc')}</Text>
                          <Text fontSize="xs" mt={1} color="gray.100">{t('productManagement.table.priceDirectCnyUsage')}</Text>
                        </Box>
                      }
                      placement="top"
                      hasArrow
                      bg="gray.800"
                      color="white"
                      fontSize="xs"
                      px={3}
                      py={2}
                      borderRadius="md"
                    >
                      <HStack spacing={1} cursor="help">
                        <Text>{t('productManagement.table.priceDirectCny')}</Text>
                        <Icon as={Info} boxSize={3} />
                      </HStack>
                    </Tooltip>
                  </Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700" minW="90px" bg="blue.50">
                    <Tooltip
                      label={
                        <Box>
                          <Text fontWeight="bold" mb={1} color="white">{t('productManagement.table.priceChannelIdr')}</Text>
                          <Text fontSize="xs" color="gray.100">{t('productManagement.table.priceChannelIdrDesc')}</Text>
                          <Text fontSize="xs" mt={1} color="gray.100">{t('productManagement.table.priceChannelIdrUsage')}</Text>
                        </Box>
                      }
                      placement="top"
                      hasArrow
                      bg="gray.800"
                      color="white"
                      fontSize="xs"
                      px={3}
                      py={2}
                      borderRadius="md"
                    >
                      <HStack spacing={1} cursor="help">
                        <Text>{t('productManagement.table.priceChannelIdr')}</Text>
                        <Icon as={Info} boxSize={3} />
                      </HStack>
                    </Tooltip>
                  </Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700" minW="90px" bg="blue.50">
                    <Tooltip
                      label={
                        <Box>
                          <Text fontWeight="bold" mb={1} color="white">{t('productManagement.table.priceChannelCny')}</Text>
                          <Text fontSize="xs" color="gray.100">{t('productManagement.table.priceChannelCnyDesc')}</Text>
                          <Text fontSize="xs" mt={1} color="gray.100">{t('productManagement.table.priceChannelCnyUsage')}</Text>
                        </Box>
                      }
                      placement="top"
                      hasArrow
                      bg="gray.800"
                      color="white"
                      fontSize="xs"
                      px={3}
                      py={2}
                      borderRadius="md"
                    >
                      <HStack spacing={1} cursor="help">
                        <Text>{t('productManagement.table.priceChannelCny')}</Text>
                        <Icon as={Info} boxSize={3} />
                      </HStack>
                    </Tooltip>
                  </Th>
                  <Th bg="gray.50"></Th>
                  <Th bg="gray.50" position="sticky" right={0} zIndex={11} borderLeftWidth="1px" borderLeftColor="gray.200"></Th>
                </Tr>
              </Thead>
              <Tbody>
                {(() => {
                  // 后端已经按分类和code排序，前端只需要检测分类变化来显示分组标题
                  let currentCategory: string | null = null
                  let categoryProductCount = 0
                  
                  // 切换分类展开/折叠状态
                  const toggleCategory = (categoryName: string, e: React.MouseEvent) => {
                    e.stopPropagation()
                    setCategoryExpanded(prev => ({
                      ...prev,
                      [categoryName]: !(prev[categoryName] ?? true) // 默认展开
                    }))
                  }
                  
                  return products.map((product, index) => {
                    const categoryName = product.category_name || t('productManagement.table.uncategorized')
                    const isNewCategory = categoryName !== currentCategory
                    const isExpanded = categoryExpanded[categoryName] ?? true // 默认展开
                    
                    // 如果是新分类，重置计数
                    if (isNewCategory) {
                      currentCategory = categoryName
                      categoryProductCount = 1
                      // 计算当前分类的产品数量
                      for (let i = index + 1; i < products.length; i++) {
                        const nextCategoryName = products[i].category_name || t('productManagement.table.uncategorized')
                        if (nextCategoryName === categoryName) {
                          categoryProductCount++
                        } else {
                          break
                        }
                      }
                    }
                    
                    return (
                      <React.Fragment key={product.id}>
                        {/* 分类标题行（仅在新分类开始时显示） */}
                        {isNewCategory && (
                          <Tr bg="blue.50" _hover={{ bg: 'blue.100' }} cursor="pointer" onClick={(e) => toggleCategory(categoryName, e)}>
                            <Td 
                              colSpan={13} 
                              fontSize="sm" 
                              fontWeight="bold" 
                              color="blue.700" 
                              py={3} 
                              position="sticky" 
                              left={0} 
                              bg="blue.50" 
                              zIndex={9}
                              borderRightWidth="1px"
                              borderRightColor="gray.200"
                            >
                              <HStack spacing={2}>
                                {isExpanded ? (
                                  <ChevronDown size={16} />
                                ) : (
                                  <ChevronRight size={16} />
                                )}
                                <Tag size={16} />
                                <Text>{categoryName}</Text>
                                <Text fontSize="xs" color="gray.500" fontWeight="normal">
                                  ({t('productManagement.table.productCount', { count: categoryProductCount })})
                                </Text>
                              </HStack>
                            </Td>
                          </Tr>
                        )}
                        {/* 产品行（仅在分类展开时显示） */}
                        {isExpanded && (
                          <Tr 
                            _hover={{ bg: hoverBg }} 
                            transition="background-color 0.2s"
                            bg={highlightedProductId === product.id ? 'blue.50' : undefined}
                          >
                            <Td 
                              fontSize="sm" 
                              position="sticky" 
                              left={0} 
                              bg={highlightedProductId === product.id ? 'blue.50' : bgColor} 
                              zIndex={9}
                              borderRightWidth="1px"
                              borderRightColor="gray.200"
                            >
                              <Checkbox
                                isChecked={selectedIds.includes(product.id)}
                                onChange={(e) => handleSelect(product.id, e.target.checked)}
                              />
                            </Td>
                            <Td fontSize="sm" color="gray.900" fontWeight="medium" minW="200px">{product.name}</Td>
                            <Td fontSize="sm" color="gray.600" fontFamily="mono" minW="120px">{product.code || '-'}</Td>
                            <Td fontSize="sm" color="gray.600" minW="120px">{product.category_name || '-'}</Td>
                            <Td fontSize="sm" color="gray.600" minW="100px" textAlign="center">
                              {product.processing_days ? `${product.processing_days} ${t('productManagement.table.day')}` : '-'}
                            </Td>
                            {/* 价格字段组 */}
                            <Td 
                              fontSize="sm" 
                              color="gray.600" 
                              minW="90px" 
                              bg={highlightedProductId === product.id ? 'blue.100' : 'blue.50'} 
                              textAlign="left"
                              fontFamily="mono"
                            >
                              {product.price_cost_idr ? formatPrice(product.price_cost_idr, 'IDR') : '-'}
                            </Td>
                            <Td 
                              fontSize="sm" 
                              color="gray.600" 
                              minW="90px" 
                              bg={highlightedProductId === product.id ? 'blue.100' : 'blue.50'} 
                              textAlign="left"
                              fontFamily="mono"
                            >
                              {product.price_cost_cny ? formatPrice(product.price_cost_cny, 'CNY') : '-'}
                            </Td>
                            <Td 
                              fontSize="sm" 
                              color="gray.600" 
                              minW="90px" 
                              bg={highlightedProductId === product.id ? 'blue.100' : 'blue.50'} 
                              textAlign="left"
                              fontFamily="mono"
                            >
                              {product.price_direct_idr ? formatPrice(product.price_direct_idr, 'IDR') : '-'}
                            </Td>
                            <Td 
                              fontSize="sm" 
                              color="gray.600" 
                              minW="90px" 
                              bg={highlightedProductId === product.id ? 'blue.100' : 'blue.50'} 
                              textAlign="left"
                              fontFamily="mono"
                            >
                              {product.price_direct_cny ? formatPrice(product.price_direct_cny, 'CNY') : '-'}
                            </Td>
                            <Td 
                              fontSize="sm" 
                              color="gray.600" 
                              minW="90px" 
                              bg={highlightedProductId === product.id ? 'blue.100' : 'blue.50'} 
                              textAlign="left"
                              fontFamily="mono"
                            >
                              {product.price_channel_idr ? formatPrice(product.price_channel_idr, 'IDR') : '-'}
                            </Td>
                            <Td 
                              fontSize="sm" 
                              color="gray.600" 
                              minW="90px" 
                              bg={highlightedProductId === product.id ? 'blue.100' : 'blue.50'} 
                              textAlign="left"
                              fontFamily="mono"
                            >
                              {product.price_channel_cny ? formatPrice(product.price_channel_cny, 'CNY') : '-'}
                            </Td>
                            <Td fontSize="sm" minW="100px">
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
                            <Td 
                              fontSize="sm" 
                              minW="150px" 
                              position="sticky" 
                              right={0} 
                              bg={highlightedProductId === product.id ? 'blue.50' : bgColor} 
                              zIndex={9}
                              borderLeftWidth="1px"
                              borderLeftColor="gray.200"
                            >
                              <HStack spacing={2}>
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="blue"
                                  onClick={() => handleViewDetail(product.id)}
                                >
                                  {t('productManagement.table.detail')}
                                </Button>
                                {isAdmin && (
                                  <Button
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="blue"
                                    onClick={() => handleEdit(product)}
                                  >
                                    {t('productManagement.edit')}
                                  </Button>
                                )}
                              </HStack>
                            </Td>
                          </Tr>
                        )}
                      </React.Fragment>
                    )
                  })
                })()}
              </Tbody>
            </Table>
          </Box>
        </Card>
      )}

      {/* 分组展示时不需要分页，显示总数即可 */}
      {products.length > 0 && (
        <Card mt={4} bg={bgColor} borderColor={borderColor}>
          <CardBody py={2}>
            <Flex justify="space-between" align="center">
              <Text fontSize="xs" color="gray.600">
                {t('productManagement.table.totalProducts', { total })}
              </Text>
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
                <div className="grid grid-cols-2 gap-3">
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
                {/* 预估成本字段 */}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">{t('productManagement.form.estimatedCostTitle')}</h3>
                    <Tooltip
                      label={
                        <Box>
                          <Text fontWeight="bold" mb={1} color="white">{t('productManagement.form.estimatedCostDesc')}</Text>
                          <Text fontSize="xs" mb={1} color="gray.100">{t('productManagement.form.estimatedCostDesc1')}</Text>
                          <Text fontSize="xs" mb={1} color="gray.100">{t('productManagement.form.estimatedCostDesc2')}</Text>
                          <Text fontSize="xs" color="gray.100">{t('productManagement.form.estimatedCostDesc3')}</Text>
                        </Box>
                      }
                      placement="top"
                      hasArrow
                      bg="gray.800"
                      color="white"
                      fontSize="xs"
                      px={3}
                      py={2}
                      borderRadius="md"
                    >
                      <Box as="span" cursor="help" display="inline-flex" alignItems="center">
                        <Info className="h-4 w-4 text-gray-400" />
                      </Box>
                    </Tooltip>
                  </div>
                  {/* 注意：预估成本字段已删除 */}
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

      {/* 产品详情抽屉 */}
      <ProductDetailDrawer
        productId={selectedProductId}
        isOpen={selectedProductId !== null}
        onClose={handleCloseDetail}
        onEdit={handleEdit}
        isAdmin={isAdmin}
      />

      {/* 产品基本信息侧边栏 */}
      <ProductBasicInfoSidebar
        isOpen={showBasicInfoSidebar}
        onClose={handleCloseBasicInfoSidebar}
        onNext={handleBasicInfoNext}
        initialData={basicInfoData || undefined}
        isEditMode={!!editingProductId}
        productId={editingProductId || undefined}
        onSubmit={handleEditSubmit}
      />

      {/* 产品价格配置侧边栏 */}
      <ProductPriceConfigSidebar
        isOpen={showPriceConfigSidebar}
        onClose={handleClosePriceConfigSidebar}
        onBack={handlePriceConfigBack}
        onSubmit={handlePriceConfigSubmit}
        basicInfo={basicInfoData}
      />
    </div>
  )
}

export default EnterpriseServiceProduct

