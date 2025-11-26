/**
 * 线索列表页面
 * 支持条件查询、列表展示、分页、增删改查
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, Edit, Trash2, Target, Mail, Phone, Building2, UserCheck, Eye } from 'lucide-react'
import {
  getLeadList,
  createLead,
  updateLead,
  deleteLead,
  assignLead,
  moveLeadToPool,
  checkLeadDuplicate,
  CreateLeadRequest,
  UpdateLeadRequest,
  LeadDuplicateCheckRequest,
} from '@/api/leads'
import { LeadListParams, Lead, LeadStatus, UserListItem, Customer } from '@/api/types'
import { useToast } from '@/components/ToastContainer'
import { getUserList } from '@/api/users'
import { getCustomerList } from '@/api/customers'
import { getCustomerLevelOptions, CustomerLevelOption } from '@/api/options'
import { PageHeader } from '@/components/admin/PageHeader'
import {
  Button,
  Card,
  CardBody,
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
  useColorModeValue,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  FormControl,
  FormLabel,
  useDisclosure,
  Alert,
  AlertIcon,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
} from '@chakra-ui/react'

const LeadList = () => {
  const { t, i18n } = useTranslation()
  const { showSuccess, showError } = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  // Chakra UI 颜色模式
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  // 查询参数
  const [queryParams, setQueryParams] = useState<LeadListParams>({
    page: 1,
    size: 20,
  })

  // 数据
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pages, setPages] = useState(0)

  // 表单状态
  const [formData, setFormData] = useState({
    company_name: '',
    phone: '',
    email: '',
    status: '' as '' | LeadStatus,
    owner_user_id: '',
    is_in_public_pool: undefined as boolean | undefined,
  })

  // 弹窗状态
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [modalFormData, setModalFormData] = useState({
    name: '',
    company_name: '',
    contact_name: '',
    phone: '',
    email: '',
    address: '',
    customer_id: '',
    owner_user_id: '',
    status: 'new' as LeadStatus,
    level: '',
    next_follow_up_at: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null)

  // 下拉选项
  const [users, setUsers] = useState<UserListItem[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerLevels, setCustomerLevels] = useState<CustomerLevelOption[]>([])

  // 统计数据
  const [statistics, setStatistics] = useState({
    total: 0,
    byStatus: {} as Record<LeadStatus, number>,
    converted: 0,
    conversionRate: 0,
  })

  // 加载统计数据（基于所有数据，不受分页影响）
  const loadStatistics = async (params: LeadListParams) => {
    try {
      // 加载所有数据用于统计（不限制分页）
      const statsParams: LeadListParams = {
        ...params,
        page: 1,
        size: 1000, // 加载足够多的数据用于统计
      }
      const statsResult = await getLeadList(statsParams)
      
      // 计算统计数据
      const stats = {
        total: statsResult.total || 0,
        byStatus: {} as Record<LeadStatus, number>,
        converted: 0,
        conversionRate: 0,
      }
      
      // 基于所有记录计算统计（如果总数小于1000，使用所有记录；否则需要后端支持）
      statsResult.records?.forEach((lead: Lead) => {
        stats.byStatus[lead.status] = (stats.byStatus[lead.status] || 0) + 1
        if (lead.status === 'converted') {
          stats.converted++
        }
      })
      
      // 如果加载的记录数等于总数，说明已经加载了所有数据，可以准确计算
      // 否则，只能基于已加载的数据估算
      if (statsResult.records && statsResult.records.length === statsResult.total) {
        // 已加载所有数据，可以准确计算
        if (stats.total > 0) {
          stats.conversionRate = (stats.converted / stats.total) * 100
        }
      } else {
        // 数据太多，只能基于已加载的数据估算
        const loadedCount = statsResult.records?.length || 0
        if (loadedCount > 0) {
          const convertedInLoaded = stats.converted
          stats.converted = Math.round((convertedInLoaded / loadedCount) * stats.total)
          if (stats.total > 0) {
            stats.conversionRate = (stats.converted / stats.total) * 100
          }
        }
      }
      
      setStatistics(stats)
    } catch (error: any) {
      console.error('[LeadList] 加载统计数据失败:', error)
      // 统计失败不影响主列表加载
    }
  }

  // 加载线索列表
  const loadLeads = async (params: LeadListParams) => {
    setLoading(true)
    try {
      const result = await getLeadList(params)
      setLeads(result.records || [])
      setTotal(result.total || 0)
      setCurrentPage(result.current || 1)
      setPages(result.pages || 0)
      
      // 异步加载统计数据（不阻塞主列表）
      loadStatistics(params).catch((err) => {
        console.error('[LeadList] 加载统计数据失败:', err)
      })
    } catch (error: any) {
      console.error('[LeadList] 加载失败:', error)
      showError(error.message || t('leadList.error.loadFailed'))
      setLeads([])
      setTotal(0)
      setCurrentPage(1)
      setPages(0)
      setStatistics({
        total: 0,
        byStatus: {} as Record<LeadStatus, number>,
        converted: 0,
        conversionRate: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  // 加载下拉选项
  useEffect(() => {
    const loadOptions = async () => {
      try {
        // 获取当前语言（从 i18n）
        const currentLang = i18n.language || 'zh-CN'
        const apiLang = currentLang.startsWith('zh') ? 'zh' : 'id'
        
        const [usersResult, customersResult, levelsResult] = await Promise.all([
          getUserList({ page: 1, size: 100 }),
          getCustomerList({ page: 1, size: 100 }),
          getCustomerLevelOptions(apiLang),
        ])
        setUsers(usersResult.records || [])
        setCustomers(customersResult.records || [])
        setCustomerLevels(levelsResult || [])
      } catch (error: any) {
        console.error('[LeadList] 加载选项失败:', error)
      }
    }
    loadOptions()
  }, [i18n.language])

  // 初始加载
  useEffect(() => {
    loadLeads(queryParams)
  }, [])

  // 搜索
  const handleSearch = () => {
    const params: LeadListParams = {
      page: 1,
      size: queryParams.size || 20,
    }
    if (formData.company_name) params.company_name = formData.company_name
    if (formData.phone) params.phone = formData.phone
    if (formData.email) params.email = formData.email
    if (formData.status) params.status = formData.status
    if (formData.owner_user_id) params.owner_user_id = formData.owner_user_id
    if (formData.is_in_public_pool !== undefined) params.is_in_public_pool = formData.is_in_public_pool
    setQueryParams(params)
    loadLeads(params)
  }

  // 重置搜索
  const handleReset = () => {
    setFormData({
      company_name: '',
      phone: '',
      email: '',
      status: '' as '' | LeadStatus,
      owner_user_id: '',
      is_in_public_pool: undefined,
    })
    const params: LeadListParams = {
      page: 1,
      size: queryParams.size || 20,
    }
    setQueryParams(params)
    loadLeads(params)
  }

  // 创建线索
  const handleCreate = () => {
    setEditingLead(null)
    setModalFormData({
      name: '',
      company_name: '',
      contact_name: '',
      phone: '',
      email: '',
      address: '',
      customer_id: '',
      owner_user_id: '',
      status: 'new',
      level: '',
      next_follow_up_at: '',
    })
    setDuplicateWarning(null)
    onOpen()
  }

  // 编辑线索
  const handleEdit = (lead: Lead) => {
    setEditingLead(lead)
    setModalFormData({
      name: lead.name,
      company_name: lead.company_name || '',
      contact_name: lead.contact_name || '',
      phone: lead.phone || '',
      email: lead.email || '',
      address: lead.address || '',
      customer_id: lead.customer_id || '',
      owner_user_id: lead.owner_user_id || '',
      status: lead.status,
      level: lead.level || '',
      next_follow_up_at: lead.next_follow_up_at ? new Date(lead.next_follow_up_at).toISOString().slice(0, 16) : '',
    })
    setDuplicateWarning(null)
    onOpen()
  }

  // 删除线索
  const handleDelete = async (id: string) => {
    if (!window.confirm(t('leadList.confirm.delete'))) {
      return
    }
    try {
      await deleteLead(id)
      showSuccess(t('leadList.success.delete'))
      loadLeads(queryParams)
    } catch (error: any) {
      showError(error.message || t('leadList.error.deleteFailed'))
    }
  }

  // 分配线索
  const handleAssign = async (leadId: string, userId: string) => {
    try {
      await assignLead(leadId, { owner_user_id: userId })
      showSuccess(t('leadList.success.assign'))
      loadLeads(queryParams)
    } catch (error: any) {
      showError(error.message || t('leadList.error.assignFailed'))
    }
  }

  // 移入公海池
  const handleMoveToPool = async (id: string) => {
    if (!window.confirm(t('leadList.confirm.moveToPool'))) {
      return
    }
    try {
      await moveLeadToPool(id, { pool_id: null })
      showSuccess(t('leadList.success.moveToPool'))
      loadLeads(queryParams)
    } catch (error: any) {
      showError(error.message || t('leadList.error.moveToPoolFailed'))
    }
  }

  // 查重
  const handleCheckDuplicate = async () => {
    if (!modalFormData.company_name && !modalFormData.phone && !modalFormData.email) {
      setDuplicateWarning(null)
      return
    }
    try {
      const checkData: LeadDuplicateCheckRequest = {
        company_name: modalFormData.company_name || null,
        phone: modalFormData.phone || null,
        email: modalFormData.email || null,
        exclude_lead_id: editingLead?.id || null,
      }
      const result = await checkLeadDuplicate(checkData)
      if (result.has_duplicate) {
        setDuplicateWarning(t('leadList.warning.duplicate', { count: result.duplicates.length }))
      } else {
        setDuplicateWarning(null)
      }
    } catch (error: any) {
      console.error('[LeadList] 查重失败:', error)
    }
  }

  // 监听表单变化进行查重
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOpen) {
        handleCheckDuplicate()
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [modalFormData.company_name, modalFormData.phone, modalFormData.email, isOpen])

  // 提交表单
  const handleSubmit = async () => {
    if (!modalFormData.name) {
      showError(t('leadList.error.nameRequired'))
      return
    }

    // 邮箱格式验证
    if (modalFormData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(modalFormData.email)) {
      showError(t('leadList.error.invalidEmail'))
      return
    }

    setSubmitting(true)
    try {
      if (editingLead) {
        const updateData: UpdateLeadRequest = {
          name: modalFormData.name,
          company_name: modalFormData.company_name || null,
          contact_name: modalFormData.contact_name || null,
          phone: modalFormData.phone || null,
          email: modalFormData.email || null,
          address: modalFormData.address || null,
          customer_id: modalFormData.customer_id || null,
          owner_user_id: modalFormData.owner_user_id || null,
          status: modalFormData.status,
          level: modalFormData.level || null,
          next_follow_up_at: modalFormData.next_follow_up_at ? new Date(modalFormData.next_follow_up_at).toISOString() : null,
        }
        await updateLead(editingLead.id, updateData)
        showSuccess(t('leadList.success.update'))
      } else {
        const createData: CreateLeadRequest = {
          name: modalFormData.name,
          company_name: modalFormData.company_name || null,
          contact_name: modalFormData.contact_name || null,
          phone: modalFormData.phone || null,
          email: modalFormData.email || null,
          address: modalFormData.address || null,
          customer_id: modalFormData.customer_id || null,
          owner_user_id: modalFormData.owner_user_id || null,
          status: modalFormData.status,
          level: modalFormData.level || null,
          next_follow_up_at: modalFormData.next_follow_up_at ? new Date(modalFormData.next_follow_up_at).toISOString() : null,
        }
        await createLead(createData)
        showSuccess(t('leadList.success.create'))
      }
      onClose()
      loadLeads(queryParams)
    } catch (error: any) {
      showError(error.message || t('leadList.error.submitFailed'))
    } finally {
      setSubmitting(false)
    }
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
  const getStatusBadge = (status: LeadStatus) => {
    const statusMap: Record<LeadStatus, { label: string; colorScheme: string }> = {
      new: { label: t('leadList.status.new'), colorScheme: 'blue' },
      contacted: { label: t('leadList.status.contacted'), colorScheme: 'yellow' },
      qualified: { label: t('leadList.status.qualified'), colorScheme: 'purple' },
      converted: { label: t('leadList.status.converted'), colorScheme: 'green' },
      lost: { label: t('leadList.status.lost'), colorScheme: 'red' },
    }
    const statusInfo = statusMap[status] || statusMap.new
    return (
      <Badge colorScheme={statusInfo.colorScheme as any} fontSize="xs">
        {statusInfo.label}
      </Badge>
    )
  }

  // 分页
  const handlePageChange = (page: number) => {
    const params = { ...queryParams, page }
    setQueryParams(params)
    loadLeads(params)
  }

  return (
    <Box w="full">
      {/* 页面头部 */}
      <PageHeader
        icon={Target}
        title={t('leadList.title')}
        subtitle={t('leadList.subtitle')}
        actions={
          <Button
            colorScheme="primary"
            leftIcon={<Plus size={16} />}
            onClick={handleCreate}
            size="sm"
          >
            {t('leadList.create')}
          </Button>
        }
      />

      {/* 统计卡片 */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={3} mb={4}>
        <Card bg="blue.50" borderColor="blue.200" borderWidth={1}>
          <CardBody>
            <Stat>
              <StatLabel fontSize="xs" fontWeight="semibold" color="blue.700">
                {t('leadList.statistics.total')}
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="blue.900">
                {loading ? <Spinner size="sm" /> : statistics.total}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="green.50" borderColor="green.200" borderWidth={1}>
          <CardBody>
            <Stat>
              <StatLabel fontSize="xs" fontWeight="semibold" color="green.700">
                {t('leadList.statistics.converted')}
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="green.900">
                {loading ? <Spinner size="sm" /> : statistics.converted}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="purple.50" borderColor="purple.200" borderWidth={1}>
          <CardBody>
            <Stat>
              <StatLabel fontSize="xs" fontWeight="semibold" color="purple.700">
                {t('leadList.statistics.conversionRate')}
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="purple.900">
                {loading ? <Spinner size="sm" /> : `${statistics.conversionRate.toFixed(1)}%`}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="orange.50" borderColor="orange.200" borderWidth={1}>
          <CardBody>
            <Stat>
              <StatLabel fontSize="xs" fontWeight="semibold" color="orange.700">
                {t('leadList.statistics.new')}
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="orange.900">
                {loading ? <Spinner size="sm" /> : statistics.byStatus.new || 0}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* 查询表单 */}
      <Card mb={4} bg={bgColor} borderColor={borderColor}>
        <CardBody>
          <HStack spacing={3} align="flex-end" flexWrap="wrap">
            {/* 公司名称 */}
            <Box flex={1} minW="150px">
              <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.700">
                {t('leadList.search.companyName')}
              </Text>
              <InputGroup size="sm">
                <InputLeftElement pointerEvents="none">
                  <Building2 size={14} color="gray" />
                </InputLeftElement>
                <Input
                  value={formData.company_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder={t('leadList.search.companyNamePlaceholder')}
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
                />
              </InputGroup>
            </Box>

            {/* 电话 */}
            <Box flex={1} minW="150px">
              <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.700">
                {t('leadList.search.phone')}
              </Text>
              <InputGroup size="sm">
                <InputLeftElement pointerEvents="none">
                  <Phone size={14} color="gray" />
                </InputLeftElement>
                <Input
                  value={formData.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder={t('leadList.search.phonePlaceholder')}
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
                />
              </InputGroup>
            </Box>

            {/* 邮箱 */}
            <Box flex={1} minW="150px">
              <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.700">
                {t('leadList.search.email')}
              </Text>
              <InputGroup size="sm">
                <InputLeftElement pointerEvents="none">
                  <Mail size={14} color="gray" />
                </InputLeftElement>
                <Input
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('leadList.search.emailPlaceholder')}
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
                />
              </InputGroup>
            </Box>

            {/* 状态 */}
            <Box flex={1} minW="120px">
              <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.700">
                {t('leadList.search.status')}
              </Text>
              <Select
                size="sm"
                value={formData.status}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, status: e.target.value as '' | LeadStatus })}
              >
                <option value="">{t('leadList.search.allStatus')}</option>
                <option value="new">{t('leadList.status.new')}</option>
                <option value="contacted">{t('leadList.status.contacted')}</option>
                <option value="qualified">{t('leadList.status.qualified')}</option>
                <option value="converted">{t('leadList.status.converted')}</option>
                <option value="lost">{t('leadList.status.lost')}</option>
              </Select>
            </Box>

            {/* 负责人 */}
            <Box flex={1} minW="150px">
              <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.700">
                {t('leadList.search.owner')}
              </Text>
              <Select
                size="sm"
                value={formData.owner_user_id}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, owner_user_id: e.target.value })}
              >
                <option value="">{t('leadList.search.allOwners')}</option>
                {users.map((user: UserListItem) => (
                  <option key={user.id} value={user.id}>
                    {user.display_name || user.username}
                  </option>
                ))}
              </Select>
            </Box>

            {/* 公海池 */}
            <Box flex={1} minW="120px">
              <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.700">
                {t('leadList.search.pool')}
              </Text>
              <Select
                size="sm"
                value={formData.is_in_public_pool === undefined ? '' : formData.is_in_public_pool.toString()}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  const value = e.target.value
                  setFormData({
                    ...formData,
                    is_in_public_pool: value === '' ? undefined : value === 'true',
                  })
                }}
              >
                <option value="">{t('leadList.search.all')}</option>
                <option value="true">{t('leadList.search.inPool')}</option>
                <option value="false">{t('leadList.search.notInPool')}</option>
              </Select>
            </Box>

            {/* 操作按钮 */}
            <HStack spacing={2}>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReset}
              >
                {t('leadList.search.reset')}
              </Button>
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<Search size={14} />}
                onClick={handleSearch}
                isLoading={loading}
              >
                {t('leadList.search.search')}
              </Button>
            </HStack>
          </HStack>
        </CardBody>
      </Card>

      {/* 操作栏 */}
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="sm" color="gray.600">
          {t('leadList.total', { total })}
        </Text>
        <Button
          size="sm"
          colorScheme="blue"
          leftIcon={<Plus size={16} />}
          onClick={handleCreate}
        >
          {t('leadList.create')}
        </Button>
      </Flex>

      {/* 线索列表 */}
      {loading ? (
        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <Flex justify="center" align="center" py={8}>
              <Spinner size="lg" color="blue.500" />
              <Text ml={4} color="gray.500">{t('leadList.loading')}</Text>
            </Flex>
          </CardBody>
        </Card>
      ) : !leads || leads.length === 0 ? (
        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <VStack py={8} spacing={3}>
              <Target size={48} color="gray" />
              <Text color="gray.500">{t('leadList.noData')}</Text>
            </VStack>
          </CardBody>
        </Card>
      ) : (
        <Card bg={bgColor} borderColor={borderColor} overflow="hidden">
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('leadList.table.name')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('leadList.table.companyName')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('leadList.table.contact')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('leadList.table.owner')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('leadList.table.status')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('leadList.table.pool')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('leadList.table.nextFollowUp')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('leadList.table.createdAt')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('leadList.table.actions')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {leads.map((lead: Lead) => (
                  <Tr key={lead.id} _hover={{ bg: hoverBg }} transition="background-color 0.2s">
                    <Td fontSize="sm" color="gray.900" fontWeight="medium">{lead.name || '-'}</Td>
                    <Td fontSize="sm" color="gray.900">{lead.company_name || '-'}</Td>
                    <Td fontSize="sm" color="gray.600">
                      <VStack align="flex-start" spacing={0.5}>
                        {lead.contact_name && (
                          <Text fontSize="xs">{lead.contact_name}</Text>
                        )}
                        {lead.phone && (
                          <HStack spacing={1}>
                            <Phone size={12} />
                            <Text fontSize="xs">{lead.phone}</Text>
                          </HStack>
                        )}
                        {lead.email && (
                          <HStack spacing={1}>
                            <Mail size={12} />
                            <Text fontSize="xs">{lead.email}</Text>
                          </HStack>
                        )}
                      </VStack>
                    </Td>
                    <Td fontSize="sm" color="gray.600">{lead.owner_username || '-'}</Td>
                    <Td fontSize="sm">
                      {getStatusBadge(lead.status)}
                    </Td>
                    <Td fontSize="sm">
                      {lead.is_in_public_pool ? (
                        <Badge colorScheme="orange" fontSize="xs">{t('leadList.table.inPool')}</Badge>
                      ) : (
                        <Text fontSize="xs" color="gray.500">-</Text>
                      )}
                    </Td>
                    <Td fontSize="sm" color="gray.600">{formatDateTime(lead.next_follow_up_at)}</Td>
                    <Td fontSize="sm" color="gray.600">{formatDateTime(lead.created_at)}</Td>
                    <Td fontSize="sm">
                      <HStack spacing={1}>
                        <IconButton
                          aria-label={t('leadList.actions.view')}
                          icon={<Eye size={14} />}
                          size="xs"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => navigate(`/admin/leads/detail/${lead.id}`)}
                        />
                        <IconButton
                          aria-label={t('leadList.actions.edit')}
                          icon={<Edit size={14} />}
                          size="xs"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => handleEdit(lead)}
                        />
                        {!lead.is_in_public_pool && (
                          <IconButton
                            aria-label={t('leadList.actions.assign')}
                            icon={<UserCheck size={14} />}
                            size="xs"
                            variant="ghost"
                            colorScheme="green"
                            onClick={() => {
                              const userId = window.prompt(t('leadList.prompt.selectOwner'))
                              if (userId) {
                                handleAssign(lead.id, userId)
                              }
                            }}
                          />
                        )}
                        {!lead.is_in_public_pool && (
                          <IconButton
                            aria-label={t('leadList.actions.moveToPool')}
                            icon={<Target size={14} />}
                            size="xs"
                            variant="ghost"
                            colorScheme="orange"
                            onClick={() => handleMoveToPool(lead.id)}
                          />
                        )}
                        <IconButton
                          aria-label={t('leadList.actions.delete')}
                          icon={<Trash2 size={14} />}
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDelete(lead.id)}
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
                {t('leadList.pagination.showing', {
                  from: (currentPage - 1) * (queryParams.size || 20) + 1,
                  to: Math.min(currentPage * (queryParams.size || 20), total),
                  total,
                })}
              </Text>
              <HStack spacing={1}>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  isDisabled={currentPage === 1}
                >
                  {t('leadList.pagination.previous')}
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
                  {t('leadList.pagination.next')}
                </Button>
              </HStack>
            </Flex>
          </CardBody>
        </Card>
      )}

      {/* 创建/编辑抽屉 */}
      <Drawer isOpen={isOpen} onClose={onClose} size="md" placement="right">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            {editingLead ? t('leadList.modal.editTitle') : t('leadList.modal.createTitle')}
          </DrawerHeader>

          <DrawerBody>
            <VStack spacing={4} align="stretch">
              {/* 查重警告 */}
              {duplicateWarning && (
                <Alert status="warning">
                  <AlertIcon />
                  {duplicateWarning}
                </Alert>
              )}

              {/* 线索名称 */}
              <FormControl isRequired>
                <FormLabel>{t('leadList.modal.name')}</FormLabel>
                <Input
                  value={modalFormData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModalFormData({ ...modalFormData, name: e.target.value })}
                  placeholder={t('leadList.modal.namePlaceholder')}
                />
              </FormControl>

              {/* 公司名称 */}
              <FormControl>
                <FormLabel>{t('leadList.modal.companyName')}</FormLabel>
                <Input
                  value={modalFormData.company_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModalFormData({ ...modalFormData, company_name: e.target.value })}
                  placeholder={t('leadList.modal.companyNamePlaceholder')}
                />
              </FormControl>

              {/* 联系人姓名 */}
              <FormControl>
                <FormLabel>{t('leadList.modal.contactName')}</FormLabel>
                <Input
                  value={modalFormData.contact_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModalFormData({ ...modalFormData, contact_name: e.target.value })}
                  placeholder={t('leadList.modal.contactNamePlaceholder')}
                />
              </FormControl>

              {/* 电话 */}
              <FormControl>
                <FormLabel>{t('leadList.modal.phone')}</FormLabel>
                <Input
                  value={modalFormData.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModalFormData({ ...modalFormData, phone: e.target.value })}
                  placeholder={t('leadList.modal.phonePlaceholder')}
                />
              </FormControl>

              {/* 邮箱 */}
              <FormControl>
                <FormLabel>{t('leadList.modal.email')}</FormLabel>
                <Input
                  type="email"
                  value={modalFormData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModalFormData({ ...modalFormData, email: e.target.value })}
                  placeholder={t('leadList.modal.emailPlaceholder')}
                />
              </FormControl>

              {/* 地址 */}
              <FormControl>
                <FormLabel>{t('leadList.modal.address')}</FormLabel>
                <Input
                  value={modalFormData.address}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModalFormData({ ...modalFormData, address: e.target.value })}
                  placeholder={t('leadList.modal.addressPlaceholder')}
                />
              </FormControl>

              {/* 关联客户 */}
              <FormControl>
                <FormLabel>{t('leadList.modal.customer')}</FormLabel>
                <Select
                  value={modalFormData.customer_id}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setModalFormData({ ...modalFormData, customer_id: e.target.value })}
                  placeholder={t('leadList.modal.selectCustomer')}
                >
                  {customers.map((customer: Customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* 负责人 */}
              <FormControl>
                <FormLabel>{t('leadList.modal.owner')}</FormLabel>
                <Select
                  value={modalFormData.owner_user_id}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setModalFormData({ ...modalFormData, owner_user_id: e.target.value })}
                  placeholder={t('leadList.modal.selectOwner')}
                >
                  {users.map((user: UserListItem) => (
                    <option key={user.id} value={user.id}>
                      {user.display_name || user.username}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* 状态 */}
              <FormControl>
                <FormLabel>{t('leadList.modal.status')}</FormLabel>
                <Select
                  value={modalFormData.status}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setModalFormData({ ...modalFormData, status: e.target.value as LeadStatus })}
                >
                  <option value="new">{t('leadList.status.new')}</option>
                  <option value="contacted">{t('leadList.status.contacted')}</option>
                  <option value="qualified">{t('leadList.status.qualified')}</option>
                  <option value="converted">{t('leadList.status.converted')}</option>
                  <option value="lost">{t('leadList.status.lost')}</option>
                </Select>
              </FormControl>

              {/* 客户分级 */}
              <FormControl>
                <FormLabel>{t('leadList.modal.level')}</FormLabel>
                <Select
                  value={modalFormData.level}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setModalFormData({ ...modalFormData, level: e.target.value })}
                >
                  <option value="">{t('leadList.modal.levelPlaceholder')}</option>
                  {customerLevels
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((level) => (
                      <option key={level.code} value={level.code}>
                        {level.name}
                      </option>
                    ))}
                </Select>
              </FormControl>

              {/* 下次跟进时间 */}
              <FormControl>
                <FormLabel>{t('leadList.modal.nextFollowUpAt')}</FormLabel>
                <Input
                  type="datetime-local"
                  value={modalFormData.next_follow_up_at}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModalFormData({ ...modalFormData, next_follow_up_at: e.target.value })}
                />
              </FormControl>
            </VStack>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              {t('leadList.modal.cancel')}
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={submitting}
            >
              {t('leadList.modal.submit')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}

export default LeadList