/**
 * 客户列表页面
 * 支持条件查询、列表展示、分页、增删改查
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { isAdmin } from '@/utils/permissions'
import { Search, Plus, Edit, Trash2, X, Users, Building2, User, XCircle, Eye, Mail, Phone, Tag } from 'lucide-react'
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
import { PageHeader } from '@/components/admin/PageHeader'
import { getCustomerLevelOptions, getIndustryOptions, CustomerLevelOption, IndustryOption } from '@/api/options'
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
} from '@chakra-ui/react'

const CustomerList = () => {
  const { t, i18n } = useTranslation()
  const { showSuccess, showError } = useToast()
  const { user } = useAuth()
  
  // Chakra UI 颜色模式
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  // 视图类型：'my' 表示"我的客户"，'global' 表示"全局客户"（仅管理员）
  const [viewType, setViewType] = useState<'my' | 'global'>('my')

  // 查询参数
  const [queryParams, setQueryParams] = useState<CustomerListParams>({
    page: 1,
    size: 20,
  })

  // 数据
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pages, setPages] = useState(0)

  // 统计数据已移除（不再需要）

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    customer_type: '' as '' | 'B' | 'C',
    customer_source_type: '' as '' | 'own' | 'agent',
    is_locked: '' as '' | 'true' | 'false',
  })

  // 弹窗状态
  const [showModal, setShowModal] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [modalFormData, setModalFormData] = useState({
    name: '',
    code: '',  // 保留但不显示在表单中，由后端自动生成
    customer_type: 'C' as 'B' | 'C',  // 默认为 C 端
    customer_source_type: 'own' as 'own' | 'agent',
    parent_customer_id: '',
    owner_user_id: '',
    agent_id: '',
    source_id: '',
    channel_id: '',
    level: '',
    industry_id: '',  // 改为 industry_id
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

  // 客户分级选项
  const [customerLevels, setCustomerLevels] = useState<CustomerLevelOption[]>([])
  const [industries, setIndustries] = useState<IndustryOption[]>([])

  // 处理视图切换
  const handleViewTypeChange = (newViewType: 'my' | 'global') => {
    setViewType(newViewType)
    const params: CustomerListParams = {
      page: 1,
      size: queryParams.size || 20,
      view_type: newViewType,
    }
    setQueryParams(params)
    loadCustomers(params)
  }

  // 加载客户列表
  const loadCustomers = async (params: CustomerListParams) => {
    setLoading(true)
    try {
      // 根据视图类型设置 view_type
      const requestParams: CustomerListParams = {
        ...params,
        view_type: viewType,
      }
      const result = await getCustomerList(requestParams)
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

  // 统计数据功能已移除

  // 加载客户分级选项
  useEffect(() => {
    const loadCustomerLevels = async () => {
      try {
        const currentLang = i18n.language || 'zh-CN'
        const apiLang = currentLang.startsWith('zh') ? 'zh' : 'id'
        const levels = await getCustomerLevelOptions(apiLang)
        setCustomerLevels(levels || [])
      } catch (error: any) {
        console.error('Failed to load customer levels:', error)
      }
    }
    loadCustomerLevels()
  }, [i18n.language])

  // 加载行业选项
  useEffect(() => {
    const loadIndustries = async () => {
      try {
        const currentLang = i18n.language || 'zh-CN'
        const apiLang = currentLang.startsWith('zh') ? 'zh' : 'id'
        const industryList = await getIndustryOptions(apiLang)
        setIndustries(industryList || [])
      } catch (error: any) {
        console.error('Failed to load industries:', error)
      }
    }
    loadIndustries()
  }, [i18n.language])

  // 初始加载
  useEffect(() => {
    loadCustomers(queryParams)
  }, [])

  // 处理查询
  const handleSearch = () => {
    const params: CustomerListParams = {
      page: 1,
      size: queryParams.size || 20,
      view_type: viewType,
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
      code: '',  // 不显示，由后端自动生成
      customer_type: 'C',  // 默认为 C 端
      customer_source_type: 'own',
      parent_customer_id: '',
      owner_user_id: '',
      agent_id: '',
      source_id: '',
      channel_id: '',
      level: '',
      industry_id: '',  // 改为 industry_id
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
      code: customer.code || '',  // 保留但不显示在表单中
      customer_type: customer.customer_type,
      customer_source_type: customer.customer_source_type,
      parent_customer_id: customer.parent_customer_id || '',
      owner_user_id: customer.owner_user_id || '',
      agent_id: customer.agent_id || '',
      source_id: customer.source_id || '',
      channel_id: customer.channel_id || '',
      level: customer.level || '',
      industry_id: customer.industry_id || '',  // 改为 industry_id
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
          code: modalFormData.code || null,  // 编辑时保留 code
          customer_type: modalFormData.customer_type,
          customer_source_type: modalFormData.customer_source_type,
          parent_customer_id: modalFormData.parent_customer_id || null,
          owner_user_id: modalFormData.owner_user_id || null,
          agent_id: modalFormData.agent_id || null,
          source_id: modalFormData.source_id || null,
          channel_id: modalFormData.channel_id || null,
          level: modalFormData.level || null,
          industry_id: modalFormData.industry_id || null,  // 改为 industry_id
          description: modalFormData.description || null,
          tags: modalFormData.tags,
          is_locked: modalFormData.is_locked,
          customer_requirements: modalFormData.customer_requirements || null,
        }
        await updateCustomer(editingCustomer.id, updateData)
        showSuccess(t('customerList.success.updateSuccess'))
      } else {
        // 创建（不传 code，由后端自动生成）
        const createData: CreateCustomerRequest = {
          name: modalFormData.name,
          // code 不传，由后端自动生成
          customer_type: modalFormData.customer_type,
          customer_source_type: modalFormData.customer_source_type,
          parent_customer_id: modalFormData.parent_customer_id || null,
          owner_user_id: modalFormData.owner_user_id || null,
          agent_id: modalFormData.agent_id || null,
          source_id: modalFormData.source_id || null,
          channel_id: modalFormData.channel_id || null,
          level: modalFormData.level || null,
          industry_id: modalFormData.industry_id || null,  // 行业ID，从下拉选择器选择
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
      size: 20,
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

  // 格式化数字
  const formatNumber = (num: number) => {
    if (num >= 100000000) {
      return (num / 100000000).toFixed(2) + '亿'
    } else if (num >= 10000) {
      return (num / 10000).toFixed(2) + '万'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(2) + '千'
    }
    return num.toLocaleString()
  }

  // 格式化金额函数已移除（不再需要）

  // 格式化日期时间
  const formatDateTime = (dateString: string | undefined) => {
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

  return (
    <div className="w-full">
      {/* 页面头部 */}
      <PageHeader
        icon={Users}
        title={t('customerList.title')}
        subtitle={t('customerList.subtitle')}
      />

      {/* 统计卡片已移除 */}

      {/* 查询表单 */}
      <Card mb={4} bg={bgColor} borderColor={borderColor}>
        <CardBody>
          <HStack spacing={3} align="flex-end" flexWrap="wrap">
            {/* 客户名称 */}
            <Box flex={1} minW="150px">
              <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.700">
                {t('customerList.search.name')}
              </Text>
              <InputGroup size="sm">
                <InputLeftElement pointerEvents="none">
                  <Users size={14} color="gray" />
                </InputLeftElement>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('customerList.search.namePlaceholder')}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </InputGroup>
            </Box>

            {/* 客户编码 */}
            <Box flex={1} minW="150px">
              <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.700">
                {t('customerList.search.code')}
              </Text>
              <InputGroup size="sm">
                <InputLeftElement pointerEvents="none">
                  <Tag size={14} color="gray" />
                </InputLeftElement>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder={t('customerList.search.codePlaceholder')}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </InputGroup>
            </Box>

            {/* 客户类型 */}
            <Box flex={1} minW="120px">
              <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.700">
                {t('customerList.search.customerType')}
              </Text>
              <Select
                size="sm"
                value={formData.customer_type}
                onChange={(e) => setFormData({ ...formData, customer_type: e.target.value as '' | 'B' | 'C' })}
              >
                <option value="">{t('customerList.search.allTypes')}</option>
                <option value="B">{t('customerList.search.typeB')}</option>
                <option value="C">{t('customerList.search.typeC')}</option>
              </Select>
            </Box>

            {/* 客户来源类型 */}
            <Box flex={1} minW="120px">
              <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.700">
                {t('customerList.search.sourceType')}
              </Text>
              <Select
                size="sm"
                value={formData.customer_source_type}
                onChange={(e) => setFormData({ ...formData, customer_source_type: e.target.value as '' | 'own' | 'agent' })}
              >
                <option value="">{t('customerList.search.allSources')}</option>
                <option value="own">{t('customerList.search.own')}</option>
                <option value="agent">{t('customerList.search.agent')}</option>
              </Select>
            </Box>

            {/* 锁定状态 */}
            <Box flex={1} minW="120px">
              <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.700">
                {t('customerList.search.locked')}
              </Text>
              <Select
                size="sm"
                value={formData.is_locked}
                onChange={(e) => setFormData({ ...formData, is_locked: e.target.value as '' | 'true' | 'false' })}
              >
                <option value="">{t('customerList.search.allStatus')}</option>
                <option value="false">{t('customerList.search.unlocked')}</option>
                <option value="true">{t('customerList.search.locked')}</option>
              </Select>
            </Box>

            {/* 操作按钮 */}
            <HStack spacing={2}>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReset}
              >
                {t('customerList.search.reset')}
              </Button>
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<Search size={14} />}
                onClick={handleSearch}
                isLoading={loading}
              >
                {t('customerList.search.search')}
              </Button>
            </HStack>
          </HStack>
        </CardBody>
      </Card>

      {/* 操作栏 */}
      <Flex justify="space-between" align="center" mb={4}>
        <HStack spacing={2}>
          {/* 视图切换 */}
          <HStack spacing={2}>
            <Box
              as="button"
              px={4}
              py={2}
              fontSize="sm"
              fontWeight={viewType === 'my' ? 'semibold' : 'normal'}
              color={viewType === 'my' ? 'teal.600' : 'gray.600'}
              bg={viewType === 'my' ? 'teal.50' : 'transparent'}
              border="1px solid"
              borderColor={viewType === 'my' ? 'teal.200' : 'gray.200'}
              borderRadius="md"
              cursor="pointer"
              _hover={{
                bg: viewType === 'my' ? 'teal.100' : 'gray.50',
              }}
              onClick={() => handleViewTypeChange('my')}
            >
              {t('customerList.view.myCustomers')}
            </Box>
            {isAdmin(user?.roles || []) && (
              <Box
                as="button"
                px={4}
                py={2}
                fontSize="sm"
                fontWeight={viewType === 'global' ? 'semibold' : 'normal'}
                color={viewType === 'global' ? 'teal.600' : 'gray.600'}
                bg={viewType === 'global' ? 'teal.50' : 'transparent'}
                border="1px solid"
                borderColor={viewType === 'global' ? 'teal.200' : 'gray.200'}
                borderRadius="md"
                cursor="pointer"
                _hover={{
                  bg: viewType === 'global' ? 'teal.100' : 'gray.50',
                }}
                onClick={() => handleViewTypeChange('global')}
              >
                {t('customerList.view.globalCustomers')}
              </Box>
            )}
          </HStack>
          <Text fontSize="sm" color="gray.600" fontWeight="medium">
            {t('customerList.total', { total })}
          </Text>
        </HStack>
        <Button
          size="sm"
          colorScheme="blue"
          leftIcon={<Plus size={16} />}
          onClick={handleCreate}
        >
          {t('customerList.create')}
        </Button>
      </Flex>

      {/* 客户列表 */}
      {loading ? (
        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <Flex justify="center" align="center" py={8}>
              <Spinner size="lg" color="blue.500" />
              <Text ml={4} color="gray.500">{t('customerList.loading')}</Text>
            </Flex>
          </CardBody>
        </Card>
      ) : customers.length === 0 ? (
        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <VStack py={8} spacing={3}>
              <Users size={48} color="gray" />
              <Text color="gray.500">{t('customerList.noData')}</Text>
            </VStack>
          </CardBody>
        </Card>
      ) : (
        <Card bg={bgColor} borderColor={borderColor} overflow="hidden">
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('customerList.table.name')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('customerList.table.code')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('customerList.table.type')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('customerList.table.sourceType')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('customerList.table.sourceName')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('customerList.table.ownerUserName')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('customerList.table.level')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('customerList.table.status')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('customerList.table.createdAt')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('customerList.table.actions')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {customers.map((customer) => (
                  <Tr key={customer.id} _hover={{ bg: hoverBg }} transition="background-color 0.2s">
                    <Td fontSize="sm" color="gray.900">{customer.name}</Td>
                    <Td fontSize="sm" color="gray.600">{customer.code || '-'}</Td>
                    <Td fontSize="sm" color="gray.600">
                      <HStack spacing={1}>
                        {customer.customer_type === 'C' ? (
                          <>
                            <User size={14} />
                            <Text>{t('customerList.table.typeC')}</Text>
                          </>
                        ) : (
                          <>
                            <Building2 size={14} />
                            <Text>{t('customerList.table.typeB')}</Text>
                          </>
                        )}
                      </HStack>
                    </Td>
                    <Td fontSize="sm" color="gray.600">
                      {customer.customer_source_type === 'own' ? t('customerList.table.own') : t('customerList.table.agent')}
                    </Td>
                    <Td fontSize="sm" color="gray.600">{customer.source_name || '-'}</Td>
                    <Td fontSize="sm" color="gray.600">{customer.owner_user_name || '-'}</Td>
                    <Td fontSize="sm" color="gray.600">
                      {i18n.language.startsWith('zh') 
                        ? (customer.level_name_zh || customer.level_name_id || customer.level || '-')
                        : (customer.level_name_id || customer.level_name_zh || customer.level || '-')}
                    </Td>
                    <Td fontSize="sm">
                      {customer.is_locked ? (
                        <Badge colorScheme="red" fontSize="xs">
                          {t('customerList.table.locked')}
                        </Badge>
                      ) : (
                        <Badge colorScheme="green" fontSize="xs">
                          {t('customerList.table.active')}
                        </Badge>
                      )}
                    </Td>
                    <Td fontSize="sm" color="gray.600">{formatDateTime(customer.created_at)}</Td>
                    <Td fontSize="sm">
                      <HStack spacing={1}>
                        <IconButton
                          aria-label={t('customerList.actions.view')}
                          icon={<Eye size={14} />}
                          size="xs"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => handleViewDetail(customer.id)}
                        />
                        <IconButton
                          aria-label={t('customerList.actions.edit')}
                          icon={<Edit size={14} />}
                          size="xs"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => handleEdit(customer)}
                        />
                        <IconButton
                          aria-label={t('customerList.actions.delete')}
                          icon={<Trash2 size={14} />}
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDelete(customer)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Card>
      )}

      {/* 分页 */}
      {pages > 1 && (
        <Card mt={4} bg={bgColor} borderColor={borderColor}>
          <CardBody py={2}>
            <Flex justify="space-between" align="center">
              <Text fontSize="xs" color="gray.600">
                {t('customerList.pagination.info', { current: currentPage, total: pages, size: queryParams.size || 20 })}
              </Text>
              <HStack spacing={1}>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  isDisabled={currentPage === 1}
                >
                  {t('customerList.pagination.prev')}
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
                  {t('customerList.pagination.next')}
                </Button>
              </HStack>
            </Flex>
          </CardBody>
        </Card>
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

              {/* 客户编码 - 创建时隐藏，由后台自动生成 */}
              {editingCustomer && (
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
              )}

              {/* 客户类型 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('customerList.modal.customerType')}
                </label>
                <select
                  value={modalFormData.customer_type}
                  onChange={(e) => setModalFormData({ ...modalFormData, customer_type: e.target.value as 'B' | 'C' })}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="B">{t('customerList.modal.typeB')}</option>
                  <option value="C">{t('customerList.modal.typeC')}</option>
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
                <select
                  value={modalFormData.level}
                  onChange={(e) => setModalFormData({ ...modalFormData, level: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                >
                  <option value="">{t('customerList.modal.levelPlaceholder')}</option>
                  {customerLevels
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((level) => (
                      <option key={level.code} value={level.code}>
                        {level.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* 行业 - 下拉选择器 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  {t('customerList.modal.industry')}
                </label>
                <select
                  value={modalFormData.industry_id}
                  onChange={(e) => setModalFormData({ ...modalFormData, industry_id: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
                >
                  <option value="">{t('customerList.modal.industryPlaceholder')}</option>
                  {industries
                    .filter(industry => industry.is_active)
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((industry) => (
                      <option key={industry.id} value={industry.id}>
                        {industry.name}
                      </option>
                    ))}
                </select>
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
                        {customerDetail.customer_type === 'C' ? t('customerList.detail.typeC') : t('customerList.detail.typeB')}
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
                      <span className="ml-2 text-gray-900">
                        {i18n.language.startsWith('zh') 
                          ? (customerDetail.level_name_zh || customerDetail.level_name_id || customerDetail.level || '-')
                          : (customerDetail.level_name_id || customerDetail.level_name_zh || customerDetail.level || '-')}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">{t('customerList.detail.industry')}:</span>
                      <span className="ml-2 text-gray-900">
                        {i18n.language.startsWith('zh') 
                          ? (customerDetail.industry_name_zh || customerDetail.industry_name_id || '-')
                          : (customerDetail.industry_name_id || customerDetail.industry_name_zh || '-')}
                      </span>
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

