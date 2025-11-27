/**
 * 线索列表页面
 * 支持条件查询、列表展示、分页、增删改查
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Edit, Trash2, Target, Mail, Phone, Building2, UserCheck, Eye, Filter, ChevronUp, ChevronDown } from 'lucide-react'
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
import { storage } from '@/utils/storage'
import { useAuth } from '@/hooks/useAuth'
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
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverCloseButton,
  Checkbox,
  CheckboxGroup,
  Stack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from '@chakra-ui/react'

const LeadList = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const { user } = useAuth()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isTransferOpen, onOpen: onTransferOpen, onClose: onTransferClose } = useDisclosure()
  const { isOpen: isDuplicateModalOpen, onOpen: onDuplicateModalOpen, onClose: onDuplicateModalClose } = useDisclosure()
  
  // Chakra UI 颜色模式
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  // 视图类型：'my' 表示"我的线索"，'public' 表示"公海线索"
  const [viewType, setViewType] = useState<'my' | 'public'>('my')

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
  
  // 转换用户相关状态
  const [transferringLeadId, setTransferringLeadId] = useState<string | null>(null)
  const [organizationUsers, setOrganizationUsers] = useState<UserListItem[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string>('')

  // 表单状态（移除 is_in_public_pool，由 viewType 控制）
  const [formData, setFormData] = useState({
    company_name: '',
    phone: '',
    email: '',
    status: '' as '' | LeadStatus,
    owner_user_id: '',
  })

  // 筛选状态管理（用于 Popover）
  const [filterStatus, setFilterStatus] = useState<string[]>([])
  const [filterOwner, setFilterOwner] = useState<string[]>([])

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
  const [isDuplicate, setIsDuplicate] = useState(false) // 标记是否存在重复线索（完全匹配公司名）
  const [checkingDuplicate, setCheckingDuplicate] = useState(false) // 标记是否正在查重
  const [duplicateLeads, setDuplicateLeads] = useState<Lead[]>([]) // 存储重复线索列表

  // 下拉选项
  const [users, setUsers] = useState<UserListItem[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [customerLevels, setCustomerLevels] = useState<CustomerLevelOption[]>([])

  // 加载线索列表
  const loadLeads = async (params: LeadListParams) => {
    setLoading(true)
    try {
      // 根据视图类型自动设置 is_in_public_pool
      const finalParams: LeadListParams = {
        ...params,
        is_in_public_pool: viewType === 'public' ? true : false,
      }
      const result = await getLeadList(finalParams)
      setLeads(result.records || [])
      setTotal(result.total || 0)
      setCurrentPage(result.current || 1)
      setPages(result.pages || 0)
    } catch (error: any) {
      console.error('[LeadList] 加载失败:', error)
      showError(error.message || t('leadList.error.loadFailed'))
      setLeads([])
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // is_in_public_pool 由 viewType 控制，不需要从 formData 获取
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
    })
    const params: LeadListParams = {
      page: 1,
      size: queryParams.size || 20,
    }
    setQueryParams(params)
    loadLeads(params)
  }

  // 切换视图类型
  const handleViewTypeChange = (type: 'my' | 'public') => {
    setViewType(type)
  }

  // 当视图类型改变时，重新加载数据
  useEffect(() => {
    const params: LeadListParams = {
      page: 1,
      size: queryParams.size || 20,
    }
    if (formData.company_name) params.company_name = formData.company_name
    if (formData.phone) params.phone = formData.phone
    if (formData.email) params.email = formData.email
    if (formData.status) params.status = formData.status
    if (formData.owner_user_id) params.owner_user_id = formData.owner_user_id
    setQueryParams(params)
    // 直接调用 loadLeads，它会使用最新的 viewType
    loadLeads(params)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewType])

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
    setIsDuplicate(false)
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
    setIsDuplicate(false)
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

  // 打开转换弹窗
  const handleOpenTransfer = async (leadId: string) => {
    setTransferringLeadId(leadId)
    setSelectedUserId('')
    // 获取当前用户的组织ID
    const userInfo = storage.getUserInfo()
    const organizationId = userInfo?.primary_organization_id || userInfo?.organization_ids?.[0]
    
    if (!organizationId) {
      showError(t('leadList.error.noOrganization'))
      return
    }
    
    // 加载同组织的用户列表
    setLoadingUsers(true)
    try {
      const result = await getUserList({ organization_id: organizationId, size: 1000 })
      setOrganizationUsers(result.records || [])
      onTransferOpen()
    } catch (error: any) {
      showError(error.message || t('leadList.error.loadUsersFailed'))
    } finally {
      setLoadingUsers(false)
    }
  }
  
  // 转换线索（分配线索）
  const handleTransfer = async () => {
    if (!transferringLeadId || !selectedUserId) {
      showError(t('leadList.error.selectUser'))
      return
    }
    try {
      await assignLead(transferringLeadId, { owner_user_id: selectedUserId })
      showSuccess(t('leadList.success.assign'))
      onTransferClose()
      setTransferringLeadId(null)
      setSelectedUserId('')
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

  // 转化线索（从公海转化为我的线索）
  const handleConvert = async (id: string) => {
    if (!user?.id) {
      showError(t('leadList.error.noUser'))
      return
    }
    if (!window.confirm(t('leadList.confirm.convert'))) {
      return
    }
    try {
      await assignLead(id, { owner_user_id: user.id })
      showSuccess(t('leadList.success.convert'))
      loadLeads(queryParams)
    } catch (error: any) {
      showError(error.message || t('leadList.error.convertFailed'))
    }
  }

  // 查重（用于提交前的完整查重）
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
        exact_match: false, // 提交前查重使用模糊匹配
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

  // 公司名称 onBlur 查重（完全匹配）
  const handleCompanyNameBlur = async () => {
    const companyName = modalFormData.company_name?.trim()
    
    // 如果公司名为空，重置重复状态
    if (!companyName) {
      setIsDuplicate(false)
      setDuplicateLeads([])
      return
    }
    
    // 开始查重
    setCheckingDuplicate(true)
    try {
      const checkData: LeadDuplicateCheckRequest = {
        company_name: companyName,
        phone: null,
        email: null,
        exclude_lead_id: editingLead?.id || null,
        exact_match: true, // 完全匹配
      }
      const result = await checkLeadDuplicate(checkData)
      setIsDuplicate(result.has_duplicate)
      if (result.has_duplicate && result.duplicates) {
        setDuplicateLeads(result.duplicates)
        // 打开重复线索详情弹窗
        onDuplicateModalOpen()
      } else {
        setDuplicateLeads([])
      }
    } catch (error: any) {
      console.error('[LeadList] 公司名查重失败:', error)
      // 查重失败时不阻止提交，只记录错误
      setIsDuplicate(false)
      setDuplicateLeads([])
    } finally {
      setCheckingDuplicate(false)
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

      {/* 操作栏 */}
      <Flex justify="flex-start" align="center" mb={4}>
        <Text fontSize="sm" color="gray.600">
          {t('leadList.total', { total })}
        </Text>
      </Flex>

      {/* 线索列表 */}
      <Card bg={bgColor} borderColor={borderColor} overflow="hidden">
        {/* 视图切换标签 - 始终显示在表格头部 */}
        <Flex
          px={4}
          py={2}
          bg="gray.50"
          borderBottom="1px solid"
          borderColor={borderColor}
          align="center"
          gap={2}
        >
          <Box
            as="button"
            px={3}
            py={1}
            fontSize="sm"
            fontWeight={viewType === 'my' ? 'semibold' : 'normal'}
            color={viewType === 'my' ? 'teal.600' : 'gray.600'}
            bg={viewType === 'my' ? 'teal.50' : 'transparent'}
            border="1px solid"
            borderColor={viewType === 'my' ? 'teal.200' : 'transparent'}
            borderRadius="md"
            cursor="pointer"
            _hover={{
              bg: viewType === 'my' ? 'teal.100' : 'gray.100',
            }}
            onClick={() => handleViewTypeChange('my')}
          >
            {t('leadList.view.myLeads')}
          </Box>
          <Box
            as="button"
            px={3}
            py={1}
            fontSize="sm"
            fontWeight={viewType === 'public' ? 'semibold' : 'normal'}
            color={viewType === 'public' ? 'teal.600' : 'gray.600'}
            bg={viewType === 'public' ? 'teal.50' : 'transparent'}
            border="1px solid"
            borderColor={viewType === 'public' ? 'teal.200' : 'transparent'}
            borderRadius="md"
            cursor="pointer"
            _hover={{
              bg: viewType === 'public' ? 'teal.100' : 'gray.100',
            }}
            onClick={() => handleViewTypeChange('public')}
          >
            {t('leadList.view.publicLeads')}
          </Box>
        </Flex>

        <Box overflowX="auto" minW="100%">
          <Table variant="simple" size="sm" w="100%" minW="1400px">
            <Thead bg="gray.50">
              {/* 第一行：列标题 */}
              <Tr>
                <Th fontSize="xs" fontWeight="semibold" color="gray.700" py={2} minW="150px">{t('leadList.table.name')}</Th>
                <Th fontSize="xs" fontWeight="semibold" color="gray.700" py={2} minW="200px">{t('leadList.table.companyName')}</Th>
                <Th fontSize="xs" fontWeight="semibold" color="gray.700" py={2} minW="280px">{t('leadList.table.contact')}</Th>
                <Th fontSize="xs" fontWeight="semibold" color="gray.700" py={2} minW="180px">{t('leadList.table.owner')}</Th>
                <Th fontSize="xs" fontWeight="semibold" color="gray.700" py={2} minW="150px">{t('leadList.table.status')}</Th>
                <Th fontSize="xs" fontWeight="semibold" color="gray.700" py={2} minW="120px">{t('leadList.table.pool')}</Th>
                <Th fontSize="xs" fontWeight="semibold" color="gray.700" py={2} minW="150px">{t('leadList.table.nextFollowUp')}</Th>
                <Th fontSize="xs" fontWeight="semibold" color="gray.700" py={2} minW="150px">{t('leadList.table.createdAt')}</Th>
                <Th fontSize="xs" fontWeight="semibold" color="gray.700" py={2} minW="120px">{t('leadList.table.actions')}</Th>
              </Tr>
              {/* 第二行：筛选条件 */}
              <Tr>
                <Th py={1.5}></Th>
                
                {/* 公司名称 - 输入框 */}
                <Th py={1.5} minW="200px">
                  <Input
                    size="xs"
                    value={formData.company_name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setFormData({ ...formData, company_name: e.target.value })
                    }}
                    placeholder={t('leadList.search.companyNamePlaceholder')}
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') handleSearch()
                    }}
                    w="100%"
                    borderRadius="md"
                  />
                </Th>
                
                {/* 联系方式 - 两个输入框 */}
                <Th py={1.5} minW="280px">
                  <HStack spacing={2}>
                    <Input
                      size="xs"
                      value={formData.phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData({ ...formData, phone: e.target.value })
                      }}
                      placeholder={t('leadList.search.phonePlaceholder')}
                      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter') handleSearch()
                      }}
                      flex={1}
                      borderRadius="md"
                    />
                    <Input
                      size="xs"
                      value={formData.email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        setFormData({ ...formData, email: e.target.value })
                      }}
                      placeholder={t('leadList.search.emailPlaceholder')}
                      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter') handleSearch()
                      }}
                      flex={1}
                      borderRadius="md"
                    />
                  </HStack>
                </Th>
                
                {/* 负责人 - 筛选菜单 */}
                <Th py={1.5} position="relative" minW="180px">
                  <Popover 
                    placement="bottom-start" 
                    closeOnBlur={false}
                    isLazy
                    lazyBehavior="keepMounted"
                  >
                    {({ isOpen, onClose }) => (
                      <>
                        <PopoverTrigger>
                          <HStack spacing={2} cursor="pointer" align="center">
                            <Select
                              size="xs"
                              value={formData.owner_user_id}
                              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                setFormData({ ...formData, owner_user_id: e.target.value })
                                handleSearch()
                              }}
                              flex={1}
                              minW="140px"
                            >
                              <option value="">{t('leadList.search.allOwners')}</option>
                              {users.map((user: UserListItem) => (
                                <option key={user.id} value={user.id}>
                                  {user.display_name || user.username}
                                </option>
                              ))}
                            </Select>
                            <IconButton
                              aria-label={t('leadList.search.owner')}
                              icon={<Filter size={12} />}
                              size="xs"
                              variant="ghost"
                              colorScheme={formData.owner_user_id ? 'teal' : 'gray'}
                            />
                          </HStack>
                        </PopoverTrigger>
                        <PopoverContent 
                          w="200px" 
                          zIndex={1500}
                          position="fixed"
                          boxShadow="md"
                          borderRadius="md"
                          border="1px solid"
                          borderColor="gray.200"
                          bg="white"
                        >
                          <PopoverCloseButton size="sm" />
                          <PopoverBody p={3}>
                            <VStack align="stretch" spacing={3}>
                              <Select
                                size="sm"
                                value={formData.owner_user_id}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                  setFormData({ ...formData, owner_user_id: e.target.value })
                                }}
                                borderRadius="md"
                              >
                                <option value="">{t('leadList.search.allOwners')}</option>
                                {users.map((user: UserListItem) => (
                                  <option key={user.id} value={user.id}>
                                    {user.display_name || user.username}
                                  </option>
                                ))}
                              </Select>
                              <HStack spacing={2} pt={2} borderTop="1px solid" borderColor="gray.200">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  colorScheme="blue"
                                  flex={1}
                                  borderRadius="md"
                                  onClick={() => {
                                    setFormData({ ...formData, owner_user_id: '' })
                                    handleSearch()
                                    onClose()
                                  }}
                                >
                                  {t('leadList.search.reset')}
                                </Button>
                                <Button
                                  size="sm"
                                  colorScheme="teal"
                                  flex={1}
                                  borderRadius="md"
                                  onClick={() => {
                                    handleSearch()
                                    onClose()
                                  }}
                                >
                                  {t('leadList.search.search')}
                                </Button>
                              </HStack>
                            </VStack>
                          </PopoverBody>
                        </PopoverContent>
                      </>
                    )}
                  </Popover>
                </Th>
                
                {/* 状态 - 筛选菜单 */}
                <Th py={1.5} position="relative" minW="150px">
                  <Popover 
                    placement="bottom-start" 
                    closeOnBlur={false}
                    isLazy
                    lazyBehavior="keepMounted"
                  >
                    {({ isOpen, onClose }) => (
                      <>
                        <PopoverTrigger>
                          <HStack spacing={2} cursor="pointer" align="center">
                            <Text fontSize="xs" color="gray.600" minW="80px" noOfLines={1}>
                              {formData.status ? t(`leadList.status.${formData.status}`) : t('leadList.search.allStatus')}
                            </Text>
                            <IconButton
                              aria-label={t('leadList.search.status')}
                              icon={<Filter size={12} />}
                              size="xs"
                              variant="ghost"
                              colorScheme={formData.status || filterStatus.length > 0 ? 'teal' : 'gray'}
                            />
                          </HStack>
                        </PopoverTrigger>
                        <PopoverContent 
                          w="200px" 
                          zIndex={1500}
                          position="fixed"
                          boxShadow="md"
                          borderRadius="md"
                          border="1px solid"
                          borderColor="gray.200"
                          bg="white"
                        >
                          <PopoverCloseButton size="sm" />
                          <PopoverBody p={3}>
                            <VStack align="stretch" spacing={3}>
                              <Box maxH="200px" overflowY="auto">
                                <CheckboxGroup
                                  value={filterStatus}
                                  onChange={(values) => {
                                    const statusValues = values as string[]
                                    setFilterStatus(statusValues)
                                    if (statusValues.length === 1) {
                                      setFormData({ ...formData, status: statusValues[0] as LeadStatus })
                                    } else if (statusValues.length === 0) {
                                      setFormData({ ...formData, status: '' })
                                    } else {
                                      // 多个选择时，不设置单个状态
                                      setFormData({ ...formData, status: '' })
                                    }
                                  }}
                                >
                                  <Stack spacing={2}>
                                    <Checkbox value="new" size="sm">{t('leadList.status.new')}</Checkbox>
                                    <Checkbox value="contacted" size="sm">{t('leadList.status.contacted')}</Checkbox>
                                    <Checkbox value="qualified" size="sm">{t('leadList.status.qualified')}</Checkbox>
                                    <Checkbox value="converted" size="sm">{t('leadList.status.converted')}</Checkbox>
                                    <Checkbox value="lost" size="sm">{t('leadList.status.lost')}</Checkbox>
                                  </Stack>
                                </CheckboxGroup>
                              </Box>
                              <HStack spacing={2} pt={2} borderTop="1px solid" borderColor="gray.200">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  colorScheme="blue"
                                  flex={1}
                                  borderRadius="md"
                                  onClick={() => {
                                    setFilterStatus([])
                                    setFormData({ ...formData, status: '' })
                                    handleSearch()
                                    onClose()
                                  }}
                                >
                                  {t('leadList.search.reset')}
                                </Button>
                                <Button
                                  size="sm"
                                  colorScheme="teal"
                                  flex={1}
                                  borderRadius="md"
                                  onClick={() => {
                                    handleSearch()
                                    onClose()
                                  }}
                                >
                                  {t('leadList.search.search')}
                                </Button>
                              </HStack>
                            </VStack>
                          </PopoverBody>
                        </PopoverContent>
                      </>
                    )}
                  </Popover>
                </Th>
                
                <Th py={1.5}></Th>
                <Th py={1.5}></Th>
                <Th py={1.5}></Th>
                <Th py={1.5}></Th>
              </Tr>
            </Thead>
            <Tbody>
              {loading ? (
                <Tr>
                  <Td colSpan={9} textAlign="center" py={8}>
                    <Flex justify="center" align="center">
                      <Spinner size="lg" color="blue.500" />
                      <Text ml={4} color="gray.500">{t('leadList.loading')}</Text>
                    </Flex>
                  </Td>
                </Tr>
              ) : !leads || leads.length === 0 ? (
                <Tr>
                  <Td colSpan={9} textAlign="center" py={8}>
                    <VStack spacing={3}>
                      <Target size={48} color="gray" />
                      <Text color="gray.500">{t('leadList.noData')}</Text>
                    </VStack>
                  </Td>
                </Tr>
              ) : (
                leads.map((lead: Lead) => (
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
                      <HStack spacing={2} flexWrap="wrap">
                        <Button
                          size="xs"
                          variant="link"
                          colorScheme="blue"
                          onClick={() => navigate(`/admin/leads/detail/${lead.id}`)}
                        >
                          {t('leadList.actions.view')}
                        </Button>
                        <Button
                          size="xs"
                          variant="link"
                          colorScheme="blue"
                          onClick={() => handleEdit(lead)}
                        >
                          {t('leadList.actions.edit')}
                        </Button>
                        {viewType === 'public' && lead.is_in_public_pool && (
                          <Button
                            size="xs"
                            variant="link"
                            colorScheme="teal"
                            onClick={() => handleConvert(lead.id)}
                          >
                            {t('leadList.actions.convert')}
                          </Button>
                        )}
                        {!lead.is_in_public_pool && (
                          <Button
                            size="xs"
                            variant="link"
                            colorScheme="green"
                            onClick={() => handleOpenTransfer(lead.id)}
                          >
                            {t('leadList.actions.transfer')}
                          </Button>
                        )}
                        {!lead.is_in_public_pool && (
                          <Button
                            size="xs"
                            variant="link"
                            colorScheme="orange"
                            onClick={() => handleMoveToPool(lead.id)}
                          >
                            {t('leadList.actions.moveToPool')}
                          </Button>
                        )}
                        <Button
                          size="xs"
                          variant="link"
                          colorScheme="red"
                          onClick={() => handleDelete(lead.id)}
                        >
                          {t('leadList.actions.delete')}
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </Card>

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
      <Drawer 
        isOpen={isOpen} 
        onClose={() => {
          setIsDuplicate(false)
          setDuplicateWarning(null)
          onClose()
        }} 
        size="md" 
        placement="right"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            {editingLead ? t('leadList.modal.editTitle') : t('leadList.modal.createTitle')}
          </DrawerHeader>

          <DrawerBody>
            <VStack spacing={4} align="stretch">
              {/* 完全匹配重复警告 */}
              {isDuplicate && (
                <Alert status="error">
                  <AlertIcon />
                  {t('leadList.warning.duplicateCompanyName')}
                </Alert>
              )}
              
              {/* 查重警告（模糊匹配） */}
              {duplicateWarning && !isDuplicate && (
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setModalFormData({ ...modalFormData, company_name: e.target.value })
                    // 如果之前有重复标记，用户修改公司名后重置
                    if (isDuplicate) {
                      setIsDuplicate(false)
                    }
                  }}
                  onBlur={handleCompanyNameBlur}
                  placeholder={t('leadList.modal.companyNamePlaceholder')}
                  isDisabled={checkingDuplicate}
                />
                {checkingDuplicate && (
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {t('leadList.checkingDuplicate')}
                  </Text>
                )}
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
              isDisabled={isDuplicate || submitting}
            >
              {t('leadList.modal.submit')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* 转换用户弹窗 */}
      <Modal isOpen={isTransferOpen} onClose={onTransferClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{t('leadList.transfer.title')}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>{t('leadList.transfer.selectUser')}</FormLabel>
              {loadingUsers ? (
                <Spinner size="sm" />
              ) : (
                <Select
                  value={selectedUserId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedUserId(e.target.value)}
                  placeholder={t('leadList.transfer.selectUserPlaceholder')}
                >
                  {organizationUsers.map((user: UserListItem) => (
                    <option key={user.id} value={user.id}>
                      {user.display_name || user.username} ({user.email || user.username})
                    </option>
                  ))}
                </Select>
              )}
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onTransferClose}>
              {t('common.cancel')}
            </Button>
            <Button colorScheme="teal" onClick={handleTransfer} isDisabled={!selectedUserId || loadingUsers}>
              {t('leadList.transfer.confirm')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* 重复线索详情弹窗 */}
      <Modal isOpen={isDuplicateModalOpen} onClose={onDuplicateModalClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <Alert status="warning" borderRadius="md" mb={2}>
              <AlertIcon />
              {t('leadList.duplicateModal.title')}
            </Alert>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              <Text fontSize="sm" color="gray.600">
                {t('leadList.duplicateModal.description', { count: duplicateLeads.length })}
              </Text>
              
              {duplicateLeads.map((lead: Lead, index: number) => (
                <Card key={lead.id || index} bg={bgColor} borderColor={borderColor} borderWidth={1}>
                  <CardBody>
                    <VStack align="stretch" spacing={2}>
                      <HStack justify="space-between">
                        <Text fontWeight="semibold" fontSize="sm">
                          {lead.name || '-'}
                        </Text>
                        {getStatusBadge(lead.status)}
                      </HStack>
                      
                      <HStack spacing={4} fontSize="xs" color="gray.600">
                        <HStack spacing={1}>
                          <Building2 size={14} />
                          <Text>{lead.company_name || '-'}</Text>
                        </HStack>
                        {lead.phone && (
                          <HStack spacing={1}>
                            <Phone size={14} />
                            <Text>{lead.phone}</Text>
                          </HStack>
                        )}
                        {lead.email && (
                          <HStack spacing={1}>
                            <Mail size={14} />
                            <Text>{lead.email}</Text>
                          </HStack>
                        )}
                      </HStack>
                      
                      <HStack spacing={4} fontSize="xs" color="gray.500">
                        {lead.owner_username && (
                          <HStack spacing={1}>
                            <UserCheck size={14} />
                            <Text>{t('leadList.duplicateModal.owner')}: {lead.owner_username}</Text>
                          </HStack>
                        )}
                        {lead.created_at && (
                          <Text>
                            {t('leadList.duplicateModal.createdAt')}: {formatDateTime(lead.created_at)}
                          </Text>
                        )}
                        {lead.next_follow_up_at && (
                          <Text>
                            {t('leadList.duplicateModal.nextFollowUp')}: {formatDateTime(lead.next_follow_up_at)}
                          </Text>
                        )}
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              ))}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              mr={3}
              onClick={() => {
                setModalFormData({ ...modalFormData, company_name: '' })
                setIsDuplicate(false)
                setDuplicateLeads([])
                onDuplicateModalClose()
              }}
            >
              {t('leadList.duplicateModal.cancel')}
            </Button>
            <Button
              colorScheme="orange"
              onClick={() => {
                onDuplicateModalClose()
                // 保持 isDuplicate 状态，提交时仍会阻止
              }}
            >
              {t('leadList.duplicateModal.continue')}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default LeadList