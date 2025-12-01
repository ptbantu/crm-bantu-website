/**
 * 客户列表页面
 * 支持条件查询、列表展示、分页、增删改查
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, Edit, Trash2, X, Users, Building2, User, CheckCircle2, XCircle, Eye, Mail, Phone, Tag, TrendingUp, DollarSign, ShoppingCart } from 'lucide-react'
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
import { getCustomerLevelOptions, CustomerLevelOption } from '@/api/options'
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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
} from '@chakra-ui/react'

const CustomerList = () => {
  const { t, i18n } = useTranslation()
  const { showSuccess, showError } = useToast()
  
  // Chakra UI 颜色模式
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

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

  // 统计数据
  const [statistics, setStatistics] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    totalTransactionAmount: 0,
    averageOrderValue: 0,
  })
  const [loadingStats, setLoadingStats] = useState(false)

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

  // 客户分级选项
  const [customerLevels, setCustomerLevels] = useState<CustomerLevelOption[]>([])

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

  // 加载统计数据
  const loadStatistics = async () => {
    setLoadingStats(true)
    try {
      // 获取总客户数（不筛选，使用较大的size以获取所有客户）
      const allCustomersResult = await getCustomerList({ size: 10000 })
      const allCustomers = allCustomersResult.records
      const totalCustomers = allCustomersResult.total
      
      // 统计活跃客户（is_locked = false）
      // 如果返回的记录数少于总数，需要重新计算
      let activeCustomers = 0
      if (allCustomers.length === totalCustomers) {
        // 如果获取了所有客户，直接统计
        activeCustomers = allCustomers.filter(c => !c.is_locked).length
      } else {
        // 如果客户数太多，需要单独查询活跃客户数
        const activeResult = await getCustomerList({ size: 10000, is_locked: false })
        activeCustomers = activeResult.total
      }
      
      // TODO: 总交易额和平均客单价需要从服务记录或订单中获取
      // 暂时使用 mock 数据
      const totalTransactionAmount = 12500000 // Mock: 1250万
      const averageOrderValue = activeCustomers > 0 
        ? Math.round(totalTransactionAmount / activeCustomers) 
        : 0

      setStatistics({
        totalCustomers,
        activeCustomers,
        totalTransactionAmount,
        averageOrderValue,
      })
    } catch (error: any) {
      console.error('Failed to load statistics:', error)
      // 如果加载失败，使用默认值
      setStatistics({
        totalCustomers: total,
        activeCustomers: 0,
        totalTransactionAmount: 0,
        averageOrderValue: 0,
      })
    } finally {
      setLoadingStats(false)
    }
  }

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

  // 初始加载
  useEffect(() => {
    loadCustomers(queryParams)
    loadStatistics()
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

  // 格式化金额
  const formatCurrency = (amount: number) => {
    return `¥${formatNumber(amount)}`
  }

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
        actions={
          <Button
            colorScheme="primary"
            leftIcon={<Plus size={16} />}
            onClick={handleCreate}
            size="sm"
          >
            {t('customerList.create')}
          </Button>
        }
      />

      {/* 统计卡片 */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={3} mb={4}>
        {/* 总客户数 */}
        <Card bg="blue.50" borderColor="blue.200" borderWidth={1} _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s">
          <CardBody>
            <Stat>
              <Flex align="center" mb={2}>
                <Box as={Users} size={5} color="blue.600" mr={2} />
                <StatLabel fontSize="xs" fontWeight="semibold" color="blue.700">
                  {t('customerList.statistics.totalCustomers')}
                </StatLabel>
              </Flex>
              <StatNumber fontSize="2xl" fontWeight="bold" color="blue.900" mb={1}>
                {loadingStats ? (
                  <Spinner size="sm" color="blue.400" />
                ) : (
                  statistics.totalCustomers.toLocaleString()
                )}
              </StatNumber>
              <StatHelpText fontSize="xs" color="blue.600" m={0}>
                {t('customerList.statistics.totalCustomersDesc')}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        {/* 活跃客户 */}
        <Card bg="green.50" borderColor="green.200" borderWidth={1} _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s">
          <CardBody>
            <Stat>
              <Flex align="center" mb={2}>
                <Box as={CheckCircle2} size={5} color="green.600" mr={2} />
                <StatLabel fontSize="xs" fontWeight="semibold" color="green.700">
                  {t('customerList.statistics.activeCustomers')}
                </StatLabel>
              </Flex>
              <StatNumber fontSize="2xl" fontWeight="bold" color="green.900" mb={1}>
                {loadingStats ? (
                  <Spinner size="sm" color="green.400" />
                ) : (
                  statistics.activeCustomers.toLocaleString()
                )}
              </StatNumber>
              <StatHelpText fontSize="xs" color="green.600" m={0}>
                {t('customerList.statistics.activeCustomersDesc')}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        {/* 总交易额 */}
        <Card bg="orange.50" borderColor="orange.200" borderWidth={1} _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s">
          <CardBody>
            <Stat>
              <Flex align="center" mb={2}>
                <Box as={DollarSign} size={5} color="orange.600" mr={2} />
                <StatLabel fontSize="xs" fontWeight="semibold" color="orange.700">
                  {t('customerList.statistics.totalTransactionAmount')}
                </StatLabel>
              </Flex>
              <StatNumber fontSize="2xl" fontWeight="bold" color="orange.900" mb={1}>
                {loadingStats ? (
                  <Spinner size="sm" color="orange.400" />
                ) : (
                  formatCurrency(statistics.totalTransactionAmount)
                )}
              </StatNumber>
              <StatHelpText fontSize="xs" color="orange.600" m={0}>
                {t('customerList.statistics.totalTransactionAmountDesc')}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        {/* 平均客单价 */}
        <Card bg="purple.50" borderColor="purple.200" borderWidth={1} _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s">
          <CardBody>
            <Stat>
              <Flex align="center" mb={2}>
                <Box as={ShoppingCart} size={5} color="purple.600" mr={2} />
                <StatLabel fontSize="xs" fontWeight="semibold" color="purple.700">
                  {t('customerList.statistics.averageOrderValue')}
                </StatLabel>
              </Flex>
              <StatNumber fontSize="2xl" fontWeight="bold" color="purple.900" mb={1}>
                {loadingStats ? (
                  <Spinner size="sm" color="purple.400" />
                ) : (
                  formatCurrency(statistics.averageOrderValue)
                )}
              </StatNumber>
              <StatHelpText fontSize="xs" color="purple.600" m={0}>
                {t('customerList.statistics.averageOrderValueDesc')}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

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
                onChange={(e) => setFormData({ ...formData, customer_type: e.target.value as '' | 'individual' | 'organization' })}
              >
                <option value="">{t('customerList.search.allTypes')}</option>
                <option value="individual">{t('customerList.search.individual')}</option>
                <option value="organization">{t('customerList.search.organization')}</option>
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
        <Text fontSize="sm" color="gray.600">
          {t('customerList.total', { total })}
        </Text>
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
                        {customer.customer_type === 'individual' ? (
                          <>
                            <User size={14} />
                            <Text>{t('customerList.table.individual')}</Text>
                          </>
                        ) : (
                          <>
                            <Building2 size={14} />
                            <Text>{t('customerList.table.organization')}</Text>
                          </>
                        )}
                      </HStack>
                    </Td>
                    <Td fontSize="sm" color="gray.600">
                      {customer.customer_source_type === 'own' ? t('customerList.table.own') : t('customerList.table.agent')}
                    </Td>
                    <Td fontSize="sm" color="gray.600">{customer.source_name || '-'}</Td>
                    <Td fontSize="sm" color="gray.600">{customer.owner_user_name || '-'}</Td>
                    <Td fontSize="sm" color="gray.600">{customer.level || '-'}</Td>
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
                {t('customerList.pagination.info', { current: currentPage, total: pages, size: queryParams.size || 10 })}
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

