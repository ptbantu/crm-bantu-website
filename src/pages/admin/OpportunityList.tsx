/**
 * 商机列表页面（看板视图）
 * 支持看板拖拽、条件查询、创建、编辑、删除等
 */
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Edit, Trash2, TrendingUp, DollarSign, User, Eye, GripVertical, ChevronDown, LayoutGrid, List } from 'lucide-react'
import {
  getOpportunityList,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  updateOpportunityStage,
  CreateOpportunityRequest,
  UpdateOpportunityRequest,
  OpportunityStageUpdateRequest,
} from '@/api/opportunities'
import { OpportunityListParams, Opportunity, OpportunityStage, OpportunityStatus, UserListItem, Customer } from '@/api/types'
import { useToast } from '@/components/ToastContainer'
import { getUserList } from '@/api/users'
import { getCustomerList } from '@/api/customers'
import { PageHeader } from '@/components/admin/PageHeader'
import { useAuth } from '@/hooks/useAuth'
import { isAdmin } from '@/utils/permissions'
import {
  Button,
  Card,
  CardBody,
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
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Checkbox,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react'

// 商机阶段配置
const OPPORTUNITY_STAGES: { value: OpportunityStage; label: string; color: string }[] = [
  { value: 'initial_contact', label: '初步接触', color: 'gray' },
  { value: 'needs_analysis', label: '需求分析', color: 'blue' },
  { value: 'proposal', label: '方案报价', color: 'yellow' },
  { value: 'negotiation', label: '谈判', color: 'orange' },
  { value: 'closed_won', label: '成交', color: 'green' },
  { value: 'closed_lost', label: '失败', color: 'red' },
]

// 阶段赢率配置（用于计算加权金额）
const STAGE_WIN_RATES: Record<OpportunityStage, number> = {
  initial_contact: 0.1,
  needs_analysis: 0.25,
  proposal: 0.5,
  negotiation: 0.75,
  closed_won: 1.0,
  closed_lost: 0.0,
}

const OpportunityList = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { user, roles } = useAuth()
  
  // 阿里云ECS风格颜色（移除useColorModeValue）
  const bgColor = 'white'
  const borderColor = 'var(--ali-border)'
  const columnBg = 'var(--ali-bg-light)'
  const hoverBg = 'var(--ali-primary-light)'

  // 视图范围：我的商机 / 全部商机
  // 根据角色设置默认值：普通销售默认"我的商机"，管理员默认"全部商机"
  const getDefaultViewScope = (): 'my' | 'all' => {
    if (isAdmin(roles)) {
      return 'all'
    }
    return 'my'
  }

  // 视图模式：看板 / 列表
  // 根据角色设置默认值：普通销售默认看板，管理员默认列表
  const getDefaultViewMode = (): 'board' | 'list' => {
    if (isAdmin(roles)) {
      return 'list'
    }
    return 'board'
  }

  const [viewScope, setViewScope] = useState<'my' | 'all'>(() => {
    // 从 localStorage 读取用户偏好，如果没有则根据角色设置默认值
    const saved = localStorage.getItem('opportunityViewScope')
    if (saved === 'my' || saved === 'all') {
      return saved
    }
    return getDefaultViewScope()
  })

  const [viewMode, setViewMode] = useState<'board' | 'list'>(() => {
    // 从 localStorage 读取用户偏好，如果没有则根据角色设置默认值
    const saved = localStorage.getItem('opportunityViewMode')
    if (saved === 'board' || saved === 'list') {
      return saved
    }
    return getDefaultViewMode()
  })

  // 查询参数
  const [queryParams, setQueryParams] = useState<OpportunityListParams>({
    page: 1,
    size: 100, // 看板视图需要加载更多数据
  })

  // 数据
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(false)

  // 拖拽状态
  const [draggedOpportunity, setDraggedOpportunity] = useState<Opportunity | null>(null)
  const [dragOverStage, setDragOverStage] = useState<OpportunityStage | null>(null)

  // 表单状态
  const [formData, setFormData] = useState({
    owner_user_id: '',
    customer_id: '',
    name: '',
    min_amount: '',
    max_amount: '',
  })

  // 弹窗状态
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null)
  const [modalFormData, setModalFormData] = useState({
    name: '',
    customer_id: '',
    amount: '',
    probability: '',
    stage: 'initial_contact' as OpportunityStage,
    status: 'active' as OpportunityStatus,
    owner_user_id: '',
    expected_close_date: '',
    description: '',
  })
  const [submitting, setSubmitting] = useState(false)

  // 下拉选项
  const [users, setUsers] = useState<UserListItem[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])

  // 统计数据
  const [statistics, setStatistics] = useState({
    total: 0,
    byStage: {} as Record<OpportunityStage, number>,
    totalAmount: 0,
    wonCount: 0,
    lostCount: 0,
  })

  // 分页信息
  const [pagination, setPagination] = useState({
    total: 0,
    current: 1,
    pages: 1,
    size: 20,
  })

  // 列表模式：选中的商机ID列表
  const [selectedOpportunities, setSelectedOpportunities] = useState<string[]>([])
  
  // 批量操作弹窗
  const { isOpen: isBatchModalOpen, onOpen: onBatchModalOpen, onClose: onBatchModalClose } = useDisclosure()
  const [batchActionType, setBatchActionType] = useState<'owner' | 'date' | null>(null)
  const [batchOwnerId, setBatchOwnerId] = useState('')
  const [batchDate, setBatchDate] = useState('')

  // 加载商机列表
  const loadOpportunities = async (params: OpportunityListParams) => {
    setLoading(true)
    try {
      const result = await getOpportunityList(params)
      setOpportunities(result.records || [])
      
      // 更新分页信息
      setPagination({
        total: result.total || 0,
        current: result.current || 1,
        pages: result.pages || 1,
        size: result.size || 20,
      })
      
      // 计算统计数据
      const stats = {
        total: result.total || 0,
        byStage: {} as Record<OpportunityStage, number>,
        totalAmount: 0,
        wonCount: 0,
        lostCount: 0,
      }
      
      result.records?.forEach((opp) => {
        // 按阶段统计
        stats.byStage[opp.stage] = (stats.byStage[opp.stage] || 0) + 1
        // 总金额
        if (opp.amount) {
          stats.totalAmount += opp.amount
        }
        // 成交/失败统计
        if (opp.status === 'won') {
          stats.wonCount++
        } else if (opp.status === 'lost') {
          stats.lostCount++
        }
      })
      
      setStatistics(stats)
    } catch (error: any) {
      console.error('[OpportunityList] 加载失败:', error)
      showError(error.message || t('opportunityList.error.loadFailed'))
      setOpportunities([])
    } finally {
      setLoading(false)
    }
  }

  // 分页处理
  const handlePageChange = (page: number) => {
    const newParams = {
      ...queryParams,
      page,
    }
    setQueryParams(newParams)
    loadOpportunities(newParams)
  }

  // 加载下拉选项
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [usersResult, customersResult] = await Promise.all([
          getUserList({ page: 1, size: 100 }),
          getCustomerList({ page: 1, size: 100 }),
        ])
        setUsers(usersResult.records || [])
        setCustomers(customersResult.records || [])
      } catch (error: any) {
        console.error('[OpportunityList] 加载选项失败:', error)
      }
    }
    loadOptions()
  }, [])

  // 视图范围切换处理
  const handleViewScopeChange = (scope: 'my' | 'all') => {
    setViewScope(scope)
    localStorage.setItem('opportunityViewScope', scope)
    
    const newParams: OpportunityListParams = {
      ...queryParams,
      page: 1,
    }
    
    // 根据视图范围设置过滤条件
    if (scope === 'my' && user?.id) {
      newParams.owner_user_id = user.id
    } else {
      // 全部商机：移除 owner_user_id 过滤
      delete newParams.owner_user_id
    }
    
    setQueryParams(newParams)
    loadOpportunities(newParams)
  }

  // 视图模式切换处理
  const handleViewModeChange = (mode: 'board' | 'list') => {
    setViewMode(mode)
    localStorage.setItem('opportunityViewMode', mode)
    // 切换视图模式时，列表模式可能需要调整分页大小
    if (mode === 'list') {
      const newParams = {
        ...queryParams,
        size: 20, // 列表模式使用较小的分页
      }
      setQueryParams(newParams)
      loadOpportunities(newParams)
    } else {
      const newParams = {
        ...queryParams,
        size: 100, // 看板模式需要加载更多数据
      }
      setQueryParams(newParams)
      loadOpportunities(newParams)
    }
  }

  // 初始加载：根据视图范围设置查询参数
  useEffect(() => {
    const initialParams: OpportunityListParams = {
      page: 1,
      size: 100,
    }
    
    // 根据默认视图范围设置过滤条件
    if (viewScope === 'my' && user?.id) {
      initialParams.owner_user_id = user.id
    }
    
    setQueryParams(initialParams)
    loadOpportunities(initialParams)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // 只在组件挂载时执行一次

  // 当用户信息加载完成后，如果视图范围是"我的商机"，更新查询参数
  useEffect(() => {
    if (user?.id && viewScope === 'my') {
      const newParams: OpportunityListParams = {
        page: 1,
        size: 100,
        owner_user_id: user.id,
      }
      setQueryParams(newParams)
      loadOpportunities(newParams)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, viewScope])

  // 搜索
  const handleSearch = () => {
    const params: OpportunityListParams = {
      page: 1,
      size: 100,
    }
    if (formData.owner_user_id) {
      params.owner_user_id = formData.owner_user_id
    }
    if (formData.customer_id) {
      params.customer_id = formData.customer_id
    }
    if (formData.name) {
      params.name = formData.name
    }
    if (formData.min_amount) {
      params.min_amount = parseFloat(formData.min_amount)
    }
    if (formData.max_amount) {
      params.max_amount = parseFloat(formData.max_amount)
    }
    setQueryParams(params)
    loadOpportunities(params)
  }

  // 创建
  const handleCreate = () => {
    setEditingOpportunity(null)
    setModalFormData({
      name: '',
      customer_id: '',
      amount: '',
      probability: '',
      stage: 'initial_contact',
      status: 'active',
      owner_user_id: '',
      expected_close_date: '',
      description: '',
    })
    onOpen()
  }

  // 编辑
  const handleEdit = (opportunity: Opportunity) => {
    setEditingOpportunity(opportunity)
    setModalFormData({
      name: opportunity.name,
      customer_id: opportunity.customer_id || '',
      amount: opportunity.amount?.toString() || '',
      probability: opportunity.probability?.toString() || '',
      stage: opportunity.stage,
      status: opportunity.status,
      owner_user_id: opportunity.owner_user_id || '',
      expected_close_date: opportunity.expected_close_date || '',
      description: opportunity.description || '',
    })
    onOpen()
  }

  // 删除
  const handleDelete = async (opportunity: Opportunity) => {
    if (!window.confirm(t('opportunityList.confirm.delete', { name: opportunity.name }))) {
      return
    }
    try {
      await deleteOpportunity(opportunity.id)
      showSuccess(t('opportunityList.success.delete'))
      loadOpportunities(queryParams)
    } catch (error: any) {
      showError(error.message || t('opportunityList.error.deleteFailed'))
    }
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!modalFormData.name.trim()) {
      showError(t('opportunityList.error.nameRequired'))
      return
    }

    setSubmitting(true)
    try {
      if (editingOpportunity) {
        const updateData: UpdateOpportunityRequest = {
          name: modalFormData.name,
          customer_id: modalFormData.customer_id || null,
          amount: modalFormData.amount ? parseFloat(modalFormData.amount) : null,
          probability: modalFormData.probability ? parseFloat(modalFormData.probability) : null,
          stage: modalFormData.stage,
          status: modalFormData.status,
          owner_user_id: modalFormData.owner_user_id || null,
          expected_close_date: modalFormData.expected_close_date || null,
          description: modalFormData.description || null,
        }
        await updateOpportunity(editingOpportunity.id, updateData)
        showSuccess(t('opportunityList.success.update'))
      } else {
        const createData: CreateOpportunityRequest = {
          name: modalFormData.name,
          customer_id: modalFormData.customer_id || null,
          amount: modalFormData.amount ? parseFloat(modalFormData.amount) : null,
          probability: modalFormData.probability ? parseFloat(modalFormData.probability) : null,
          stage: modalFormData.stage,
          status: modalFormData.status,
          owner_user_id: modalFormData.owner_user_id || null,
          expected_close_date: modalFormData.expected_close_date || null,
          description: modalFormData.description || null,
        }
        await createOpportunity(createData)
        showSuccess(t('opportunityList.success.create'))
      }
      onClose()
      loadOpportunities(queryParams)
    } catch (error: any) {
      showError(error.message || t('opportunityList.error.submitFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  // 拖拽开始
  const handleDragStart = (e: React.DragEvent, opportunity: Opportunity) => {
    setDraggedOpportunity(opportunity)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', opportunity.id)
  }

  // 拖拽结束
  const handleDragEnd = () => {
    setDraggedOpportunity(null)
    setDragOverStage(null)
  }

  // 拖拽悬停
  const handleDragOver = (e: React.DragEvent, stage: OpportunityStage) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverStage(stage)
  }

  // 拖拽离开
  const handleDragLeave = () => {
    setDragOverStage(null)
  }

  // 放置
  const handleDrop = async (e: React.DragEvent, targetStage: OpportunityStage) => {
    e.preventDefault()
    setDragOverStage(null)

    if (!draggedOpportunity || draggedOpportunity.stage === targetStage) {
      return
    }

    try {
      const updateData: OpportunityStageUpdateRequest = {
        stage: targetStage,
      }
      await updateOpportunityStage(draggedOpportunity.id, updateData)
      showSuccess(t('opportunityList.success.stageUpdated'))
      loadOpportunities(queryParams)
    } catch (error: any) {
      showError(error.message || t('opportunityList.error.stageUpdateFailed'))
    }
  }

  // 获取阶段内的商机
  const getOpportunitiesByStage = (stage: OpportunityStage): Opportunity[] => {
    return opportunities.filter((opp: Opportunity) => opp.stage === stage)
  }

  // 计算阶段统计信息
  const getStageStats = (stage: OpportunityStage) => {
    const stageOpportunities = getOpportunitiesByStage(stage)
    const count = stageOpportunities.length
    const totalAmount = stageOpportunities.reduce((sum: number, opp: Opportunity) => sum + (opp.amount || 0), 0)
    const winRate = STAGE_WIN_RATES[stage] || 0
    const weightedAmount = totalAmount * winRate
    
    return {
      count,
      totalAmount,
      weightedAmount,
      winRate,
    }
  }

  // 格式化金额
  const formatAmount = (amount: number | null | undefined): string => {
    if (!amount) return '-'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // 列表模式：全选/取消全选
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOpportunities(opportunities.map((opp: Opportunity) => opp.id))
    } else {
      setSelectedOpportunities([])
    }
  }

  // 列表模式：单个选择
  const handleSelectOne = (opportunityId: string, checked: boolean) => {
    if (checked) {
      setSelectedOpportunities([...selectedOpportunities, opportunityId])
    } else {
      setSelectedOpportunities(selectedOpportunities.filter((id: string) => id !== opportunityId))
    }
  }

  // 批量操作：打开弹窗
  const handleBatchAction = (actionType: 'owner' | 'date') => {
    if (selectedOpportunities.length === 0) {
      showError(t('opportunityList.error.noSelection'))
      return
    }
    setBatchActionType(actionType)
    setBatchOwnerId('')
    setBatchDate('')
    onBatchModalOpen()
  }

  // 批量操作：提交
  const handleBatchSubmit = async () => {
    if (selectedOpportunities.length === 0) {
      showError(t('opportunityList.error.noSelection'))
      return
    }

    try {
      // 这里暂时使用循环更新，后续可以添加批量更新API
      for (const opportunityId of selectedOpportunities) {
        const updateData: UpdateOpportunityRequest = {}
        
        if (batchActionType === 'owner' && batchOwnerId) {
          updateData.owner_user_id = batchOwnerId
        }
        
        if (batchActionType === 'date' && batchDate) {
          updateData.expected_close_date = batchDate
        }
        
        if (Object.keys(updateData).length > 0) {
          await updateOpportunity(opportunityId, updateData)
        }
      }
      
      showSuccess(t('opportunityList.success.batchUpdate'))
      setSelectedOpportunities([])
      onBatchModalClose()
      loadOpportunities(queryParams)
    } catch (error: any) {
      showError(error.message || t('opportunityList.error.batchUpdateFailed'))
    }
  }

  // 视图模式切换时清空选择
  useEffect(() => {
    setSelectedOpportunities([])
  }, [viewMode])


  return (
    <Box w="full">
      {/* 页面头部 */}
      <PageHeader
        icon={TrendingUp}
        title={t('opportunityList.title')}
        subtitle={t('opportunityList.subtitle')}
        actions={
          <HStack spacing={3}>
            {/* 视图范围切换下拉框 */}
            <Select
              value={viewScope}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
                handleViewScopeChange(e.target.value as 'my' | 'all')
              }
              size="sm"
              width="140px"
              bg={bgColor}
            >
              <option value="my">{t('opportunityList.viewScope.my')}</option>
              <option value="all">{t('opportunityList.viewScope.all')}</option>
            </Select>
            
            {/* 列表 ↔ 看板切换按钮 */}
            <Button
              variant={viewMode === 'board' ? 'solid' : 'outline'}
              colorScheme={viewMode === 'board' ? 'primary' : 'gray'}
              leftIcon={viewMode === 'board' ? <LayoutGrid size={16} /> : <List size={16} />}
              onClick={() => handleViewModeChange(viewMode === 'board' ? 'list' : 'board')}
              size="md"
            >
              {viewMode === 'board' ? t('opportunityList.viewMode.board') : t('opportunityList.viewMode.list')}
            </Button>
            
            <Button
              leftIcon={<Plus size={16} />}
              onClick={handleCreate}
              size="md"
            >
              {t('opportunityList.create')}
            </Button>
          </HStack>
        }
      />

      {/* 统计卡片 - 阿里云ECS风格 */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={3} mb={4}>
        <Card variant="elevated">
          <CardBody p={4}>
            <Stat>
              <StatLabel fontSize="12px" fontWeight="500" color="var(--ali-text-secondary)">
                {t('opportunityList.statistics.total')}
              </StatLabel>
              <StatNumber fontSize="20px" fontWeight="600" color="var(--ali-text-primary)">
                {loading ? <Spinner size="sm" /> : statistics.total}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card variant="elevated">
          <CardBody p={4}>
            <Stat>
              <StatLabel fontSize="12px" fontWeight="500" color="var(--ali-text-secondary)">
                {t('opportunityList.statistics.won')}
              </StatLabel>
              <StatNumber fontSize="20px" fontWeight="600" color="var(--ali-success)">
                {loading ? <Spinner size="sm" /> : statistics.wonCount}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card variant="elevated">
          <CardBody p={4}>
            <Stat>
              <StatLabel fontSize="12px" fontWeight="500" color="var(--ali-text-secondary)">
                {t('opportunityList.statistics.lost')}
              </StatLabel>
              <StatNumber fontSize="20px" fontWeight="600" color="var(--ali-error)">
                {loading ? <Spinner size="sm" /> : statistics.lostCount}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card variant="elevated">
          <CardBody p={4}>
            <Stat>
              <StatLabel fontSize="12px" fontWeight="500" color="var(--ali-text-secondary)">
                {t('opportunityList.statistics.totalAmount')}
              </StatLabel>
              <StatNumber fontSize="20px" fontWeight="600" color="var(--ali-text-primary)">
                {loading ? <Spinner size="sm" /> : formatAmount(statistics.totalAmount)}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card variant="elevated">
          <CardBody p={4}>
            <Stat>
              <StatLabel fontSize="12px" fontWeight="500" color="var(--ali-text-secondary)">
                {t('opportunityList.statistics.conversionRate')}
              </StatLabel>
              <StatNumber fontSize="20px" fontWeight="600" color="var(--ali-text-primary)">
                {loading ? <Spinner size="sm" /> : statistics.total > 0 
                  ? `${((statistics.wonCount / statistics.total) * 100).toFixed(1)}%`
                  : '0%'}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* 搜索栏 - 阿里云ECS风格 */}
      <Card mb={4} variant="elevated">
        <CardBody p={4}>
          <HStack spacing={4} flexWrap="wrap">
            <InputGroup flex="1" minW="200px" size="md">
              <InputLeftElement pointerEvents="none">
                <Search size={16} color="var(--ali-text-secondary)" />
              </InputLeftElement>
              <Input
                placeholder={t('opportunityList.search.name')}
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                onKeyPress={(e: React.KeyboardEvent) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
              />
            </InputGroup>

            <Select
              placeholder={t('opportunityList.search.owner')}
              value={formData.owner_user_id}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, owner_user_id: e.target.value })}
              flex="1"
              minW="150px"
              size="md"
            >
              {users.map((user: UserListItem) => (
                <option key={user.id} value={user.id}>
                  {user.display_name || user.username}
                </option>
              ))}
            </Select>

            <Select
              placeholder={t('opportunityList.search.customer')}
              value={formData.customer_id}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, customer_id: e.target.value })}
              flex="1"
              minW="150px"
              size="md"
            >
              {customers.map((customer: Customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </Select>

            <Input
              type="number"
              placeholder={t('opportunityList.search.minAmount')}
              value={formData.min_amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, min_amount: e.target.value })}
              flex="1"
              minW="120px"
              size="md"
            />

            <Input
              type="number"
              placeholder={t('opportunityList.search.maxAmount')}
              value={formData.max_amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, max_amount: e.target.value })}
              flex="1"
              minW="120px"
              size="md"
            />

            <Button onClick={handleSearch} leftIcon={<Search size={16} />} size="md">
              {t('common.search')}
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {/* 视图内容：看板或列表 */}
      {loading ? (
        <Flex justify="center" align="center" h="400px">
          <Spinner size="xl" />
        </Flex>
      ) : viewMode === 'list' ? (
        /* 列表视图 - 阿里云ECS风格 */
        <Card variant="elevated">
          <CardBody p={4}>
            {/* 批量操作栏 */}
            {selectedOpportunities.length > 0 && (
              <Box mb={4} p={3} bg="var(--ali-primary-light)" borderRadius="4px">
                <HStack spacing={3}>
                  <Text fontSize="sm" fontWeight="semibold">
                    {t('opportunityList.list.selectedCount', { count: selectedOpportunities.length })}
                  </Text>
                  <Button
                    size="md"
                    variant="outline"
                    onClick={() => handleBatchAction('owner')}
                  >
                    {t('opportunityList.list.batchUpdateOwner')}
                  </Button>
                  <Button
                    size="md"
                    variant="outline"
                    onClick={() => handleBatchAction('date')}
                  >
                    {t('opportunityList.list.batchUpdateDate')}
                  </Button>
                  <Button
                    size="md"
                    variant="ghost"
                    onClick={() => setSelectedOpportunities([])}
                  >
                    {t('common.cancel')}
                  </Button>
                </HStack>
              </Box>
            )}
            
            <TableContainer>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th w="50px" fontSize="14px" fontWeight="600" color="var(--ali-text-primary)" py={3}>
                      <Checkbox
                        isChecked={selectedOpportunities.length > 0 && selectedOpportunities.length === opportunities.length}
                        isIndeterminate={selectedOpportunities.length > 0 && selectedOpportunities.length < opportunities.length}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </Th>
                    <Th fontSize="14px" fontWeight="600" color="var(--ali-text-primary)" py={3}>{t('opportunityList.table.name')}</Th>
                    <Th fontSize="14px" fontWeight="600" color="var(--ali-text-primary)" py={3}>{t('opportunityList.table.customer')}</Th>
                    <Th fontSize="14px" fontWeight="600" color="var(--ali-text-primary)" py={3}>{t('opportunityList.table.amount')}</Th>
                    <Th fontSize="14px" fontWeight="600" color="var(--ali-text-primary)" py={3}>{t('opportunityList.table.stage')}</Th>
                    <Th fontSize="14px" fontWeight="600" color="var(--ali-text-primary)" py={3}>{t('opportunityList.table.owner')}</Th>
                    <Th fontSize="14px" fontWeight="600" color="var(--ali-text-primary)" py={3}>{t('opportunityList.table.expectedCloseDate')}</Th>
                    <Th fontSize="14px" fontWeight="600" color="var(--ali-text-primary)" py={3}>{t('opportunityList.table.actions')}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {opportunities.length === 0 ? (
                    <Tr>
                      <Td colSpan={8} textAlign="center" py={8} color="var(--ali-text-secondary)">
                        {t('opportunityList.empty')}
                      </Td>
                    </Tr>
                  ) : (
                    opportunities.map((opportunity, index) => {
                      const stageConfig = OPPORTUNITY_STAGES.find(s => s.value === opportunity.stage)
                      const isSelected = selectedOpportunities.includes(opportunity.id)
                      return (
                        <Tr 
                          key={opportunity.id} 
                          h="52px"
                          bg={index % 2 === 0 ? 'var(--ali-bg-light)' : 'white'}
                          _hover={{ bg: hoverBg }}
                        >
                          <Td py={4}>
                            <Checkbox
                              isChecked={isSelected}
                              onChange={(e) => handleSelectOne(opportunity.id, e.target.checked)}
                            />
                          </Td>
                          <Td py={4}>
                            <Text
                              fontWeight="500"
                              fontSize="14px"
                              cursor="pointer"
                              onClick={() => navigate(`/admin/opportunities/detail/${opportunity.id}`)}
                              color="var(--ali-text-primary)"
                              _hover={{ color: 'var(--ali-primary)' }}
                            >
                              {opportunity.name}
                            </Text>
                          </Td>
                          <Td fontSize="14px" color="var(--ali-text-secondary)" py={4}>{opportunity.customer_name || '-'}</Td>
                          <Td fontSize="14px" color="var(--ali-text-primary)" fontWeight="500" py={4}>{formatAmount(opportunity.amount)}</Td>
                          <Td py={4}>
                            <Badge bg="var(--ali-primary)" color="white" fontSize="12px">
                              {stageConfig?.label || opportunity.stage}
                            </Badge>
                          </Td>
                          <Td fontSize="14px" color="var(--ali-text-secondary)" py={4}>{opportunity.owner_username || '-'}</Td>
                          <Td fontSize="14px" color="var(--ali-text-secondary)" py={4}>
                            {opportunity.expected_close_date
                              ? new Date(opportunity.expected_close_date).toLocaleDateString()
                              : '-'}
                          </Td>
                          <Td py={4}>
                            <HStack spacing={1}>
                              <IconButton
                                aria-label={t('common.view')}
                                icon={<Eye size={14} />}
                                size="sm"
                                variant="ghost"
                                color="var(--ali-primary)"
                                onClick={() => navigate(`/admin/opportunities/detail/${opportunity.id}`)}
                              />
                              <IconButton
                                aria-label={t('common.edit')}
                                icon={<Edit size={14} />}
                                size="sm"
                                variant="ghost"
                                color="var(--ali-primary)"
                                onClick={() => handleEdit(opportunity)}
                              />
                              <IconButton
                                aria-label={t('common.delete')}
                                icon={<Trash2 size={14} />}
                                size="sm"
                                variant="ghost"
                                color="var(--ali-error)"
                                onClick={() => handleDelete(opportunity)}
                              />
                            </HStack>
                          </Td>
                        </Tr>
                      )
                    })
                  )}
                </Tbody>
              </Table>
            </TableContainer>
            
            {/* 分页 */}
            {pagination.pages > 1 && (
              <Box mt={4} py={3}>
                <Flex justify="space-between" align="center">
                  <Text fontSize="sm" color="gray.600">
                    {t('opportunityList.pagination.showing', {
                      from: (pagination.current - 1) * pagination.size + 1,
                      to: Math.min(pagination.current * pagination.size, pagination.total),
                      total: pagination.total,
                    })}
                  </Text>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePageChange(pagination.current - 1)}
                      isDisabled={pagination.current === 1}
                    >
                      {t('opportunityList.pagination.previous')}
                    </Button>
                    <Text fontSize="sm" color="gray.600">
                      {t('opportunityList.pagination.page', {
                        current: pagination.current,
                        total: pagination.pages,
                      })}
                    </Text>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handlePageChange(pagination.current + 1)}
                      isDisabled={pagination.current >= pagination.pages}
                    >
                      {t('opportunityList.pagination.next')}
                    </Button>
                  </HStack>
                </Flex>
              </Box>
            )}
          </CardBody>
        </Card>
      ) : (
        /* 看板视图 */
        <Box
          overflowX="auto"
          pb={4}
          css={{
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'var(--ali-bg-gray)',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'var(--ali-border-dark)',
              borderRadius: '4px',
            },
          }}
        >
          <HStack spacing={4} align="flex-start" minW="max-content">
            {OPPORTUNITY_STAGES.map((stageConfig) => {
              const stageOpportunities = getOpportunitiesByStage(stageConfig.value)
              const isDragOver = dragOverStage === stageConfig.value

              return (
                <Box
                  key={stageConfig.value}
                  minW="280px"
                  w="280px"
                  bg={isDragOver ? 'var(--ali-primary-light)' : columnBg}
                  borderRadius="lg"
                  borderWidth="2px"
                  borderColor={isDragOver ? 'blue.300' : borderColor}
                  borderStyle={isDragOver ? 'dashed' : 'solid'}
                  transition="all 0.2s"
                >
                  {/* 阶段标题和统计信息 */}
                  <Box
                    p={3}
                    bg="var(--ali-bg-light)"
                    borderTopRadius="lg"
                    borderBottomWidth="1px"
                    borderBottomColor={borderColor}
                  >
                    <VStack align="stretch" spacing={2}>
                      <Flex justify="space-between" align="center">
                        <HStack spacing={2}>
                          <Text fontWeight="bold" fontSize="14px" color="var(--ali-text-primary)">
                            {stageConfig.label}
                          </Text>
                          <Badge colorScheme={stageConfig.color} borderRadius="full">
                            {stageOpportunities.length}
                          </Badge>
                        </HStack>
                      </Flex>
                      
                      {/* 统计信息 */}
                      {(() => {
                        const stats = getStageStats(stageConfig.value)
                        return (
                          <VStack align="stretch" spacing={1} fontSize="xs">
                            <HStack justify="space-between">
                              <Text color="var(--ali-text-secondary)" fontSize="12px">
                                {t('opportunityList.board.stats.amount')}:
                              </Text>
                              <Text fontWeight="semibold" color="var(--ali-text-primary)" fontSize="12px">
                                {formatAmount(stats.totalAmount)}
                              </Text>
                            </HStack>
                            <HStack justify="space-between">
                              <Text color="var(--ali-text-secondary)" fontSize="12px">
                                {t('opportunityList.board.stats.weightedAmount')}:
                              </Text>
                              <Text fontWeight="bold" color="var(--ali-success)" fontSize="12px">
                                {formatAmount(stats.weightedAmount)}
                              </Text>
                            </HStack>
                          </VStack>
                        )
                      })()}
                    </VStack>
                  </Box>

                  {/* 商机卡片列表 */}
                  <Box
                    p={2}
                    minH="400px"
                    maxH="600px"
                    overflowY="auto"
                    onDragOver={(e: React.DragEvent) => handleDragOver(e, stageConfig.value)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e: React.DragEvent) => handleDrop(e, stageConfig.value)}
                  >
                    <VStack spacing={2} align="stretch">
                      {stageOpportunities.map((opportunity) => (
                        <Card
                          key={opportunity.id}
                          draggable
                          onDragStart={(e: React.DragEvent) => handleDragStart(e, opportunity)}
                          onDragEnd={handleDragEnd}
                          cursor="move"
                          variant="elevated"
                          _hover={{
                            boxShadow: 'var(--ali-card-shadow-hover)',
                            transform: 'translateY(-2px)',
                          }}
                          transition="all 0.2s"
                          opacity={draggedOpportunity?.id === opportunity.id ? 0.5 : 1}
                        >
                          <CardBody p={3}>
                            <VStack align="stretch" spacing={2}>
                              {/* 商机名称和操作 */}
                              <Flex justify="space-between" align="flex-start">
                                <Text
                                  fontWeight="semibold"
                                  fontSize="sm"
                                  noOfLines={2}
                                  cursor="pointer"
                                  onClick={() => navigate(`/admin/opportunities/detail/${opportunity.id}`)}
                                  _hover={{ color: 'var(--ali-primary)' }}
                                >
                                  {opportunity.name}
                                </Text>
                                <HStack spacing={1}>
                                  <IconButton
                                    aria-label={t('common.view')}
                                    icon={<Eye size={14} />}
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => navigate(`/admin/opportunities/detail/${opportunity.id}`)}
                                  />
                                  <IconButton
                                    aria-label={t('common.edit')}
                                    icon={<Edit size={14} />}
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => handleEdit(opportunity)}
                                  />
                                  <IconButton
                                    aria-label={t('common.delete')}
                                    icon={<Trash2 size={14} />}
                                    size="xs"
                                    variant="ghost"
                                    colorScheme="red"
                                    onClick={() => handleDelete(opportunity)}
                                  />
                                </HStack>
                              </Flex>

                              {/* 客户信息 */}
                              {opportunity.customer_name && (
                                <HStack spacing={1}>
                                  <Box as={User} size={12} color="var(--ali-text-secondary)" />
                                  <Text fontSize="12px" color="var(--ali-text-secondary)" noOfLines={1}>
                                    {opportunity.customer_name}
                                  </Text>
                                </HStack>
                              )}

                              {/* 金额 */}
                              {opportunity.amount && (
                                <HStack spacing={1}>
                                  <Box as={DollarSign} size={12} color="var(--ali-success)" />
                                  <Text fontSize="14px" fontWeight="bold" color="var(--ali-success)">
                                    {formatAmount(opportunity.amount)}
                                  </Text>
                                </HStack>
                              )}

                              {/* 可能性 */}
                              {opportunity.probability !== null && opportunity.probability !== undefined && (
                                <Box>
                                  <Text fontSize="12px" color="var(--ali-text-secondary)" mb={1}>
                                    {t('opportunityList.probability')}: {opportunity.probability}%
                                  </Text>
                                  <Box
                                    w="full"
                                    h="4px"
                                    bg="var(--ali-border)"
                                    borderRadius="full"
                                    overflow="hidden"
                                  >
                                    <Box
                                      w={`${opportunity.probability}%`}
                                      h="full"
                                      bg="var(--ali-primary)"
                                      transition="width 0.3s"
                                    />
                                  </Box>
                                </Box>
                              )}

                              {/* 负责人 */}
                              {opportunity.owner_username && (
                                <Text fontSize="xs" color="gray.500">
                                  {t('opportunityList.owner')}: {opportunity.owner_username}
                                </Text>
                              )}

                              {/* 预计成交日期 */}
                              {opportunity.expected_close_date && (
                                <Text fontSize="xs" color="gray.500">
                                  {t('opportunityList.expectedCloseDate')}: {new Date(opportunity.expected_close_date).toLocaleDateString()}
                                </Text>
                              )}

                              {/* 拖拽手柄 */}
                              <Flex justify="center" pt={1} borderTopWidth="1px" borderTopColor={borderColor}>
                                <Box as={GripVertical} size={16} color="gray.400" />
                              </Flex>
                            </VStack>
                          </CardBody>
                        </Card>
                      ))}

                      {stageOpportunities.length === 0 && (
                        <Box
                          p={8}
                          textAlign="center"
                          color="gray.500"
                          borderWidth="2px"
                          borderStyle="dashed"
                          borderColor={borderColor}
                          borderRadius="md"
                        >
                          <Text fontSize="sm">{t('opportunityList.empty')}</Text>
                        </Box>
                      )}
                    </VStack>
                  </Box>
                </Box>
              )
            })}
          </HStack>
        </Box>
      )}

      {/* 创建/编辑表单 */}
      <Drawer isOpen={isOpen} onClose={onClose} size="md" placement="right">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            {editingOpportunity ? t('opportunityList.modal.edit') : t('opportunityList.modal.create')}
          </DrawerHeader>

          <DrawerBody>
            <VStack spacing={4} align="stretch">
              {/* 商机名称 */}
              <FormControl isRequired>
                <FormLabel>{t('opportunityList.modal.name')}</FormLabel>
                <Input
                  value={modalFormData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModalFormData({ ...modalFormData, name: e.target.value })}
                  placeholder={t('opportunityList.modal.namePlaceholder')}
                />
              </FormControl>

              {/* 客户 */}
              <FormControl>
                <FormLabel>{t('opportunityList.modal.customer')}</FormLabel>
                <Select
                  value={modalFormData.customer_id}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setModalFormData({ ...modalFormData, customer_id: e.target.value })}
                  placeholder={t('opportunityList.modal.selectCustomer')}
                >
                  {customers.map((customer: Customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* 金额 */}
              <FormControl>
                <FormLabel>{t('opportunityList.modal.amount')}</FormLabel>
                <Input
                  type="number"
                  value={modalFormData.amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModalFormData({ ...modalFormData, amount: e.target.value })}
                  placeholder={t('opportunityList.modal.amountPlaceholder')}
                />
              </FormControl>

              {/* 可能性 */}
              <FormControl>
                <FormLabel>{t('opportunityList.modal.probability')}</FormLabel>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={modalFormData.probability}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModalFormData({ ...modalFormData, probability: e.target.value })}
                  placeholder={t('opportunityList.modal.probabilityPlaceholder')}
                />
              </FormControl>

              {/* 阶段 */}
              <FormControl>
                <FormLabel>{t('opportunityList.modal.stage')}</FormLabel>
                <Select
                  value={modalFormData.stage}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setModalFormData({ ...modalFormData, stage: e.target.value as OpportunityStage })}
                >
                  {OPPORTUNITY_STAGES.map((stage) => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* 状态 */}
              <FormControl>
                <FormLabel>{t('opportunityList.modal.status')}</FormLabel>
                <Select
                  value={modalFormData.status}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setModalFormData({ ...modalFormData, status: e.target.value as OpportunityStatus })}
                >
                  <option value="active">{t('opportunityList.status.active')}</option>
                  <option value="won">{t('opportunityList.status.won')}</option>
                  <option value="lost">{t('opportunityList.status.lost')}</option>
                  <option value="cancelled">{t('opportunityList.status.cancelled')}</option>
                </Select>
              </FormControl>

              {/* 负责人 */}
              <FormControl>
                <FormLabel>{t('opportunityList.modal.owner')}</FormLabel>
                <Select
                  value={modalFormData.owner_user_id}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setModalFormData({ ...modalFormData, owner_user_id: e.target.value })}
                  placeholder={t('opportunityList.modal.selectOwner')}
                >
                  {users.map((user: UserListItem) => (
                    <option key={user.id} value={user.id}>
                      {user.display_name || user.username}
                    </option>
                  ))}
                </Select>
              </FormControl>

              {/* 预计成交日期 */}
              <FormControl>
                <FormLabel>{t('opportunityList.modal.expectedCloseDate')}</FormLabel>
                <Input
                  type="date"
                  value={modalFormData.expected_close_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModalFormData({ ...modalFormData, expected_close_date: e.target.value })}
                />
              </FormControl>

              {/* 描述 */}
              <FormControl>
                <FormLabel>{t('opportunityList.modal.description')}</FormLabel>
              <Input
                as="textarea"
                value={modalFormData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setModalFormData({ ...modalFormData, description: e.target.value })}
                placeholder={t('opportunityList.modal.descriptionPlaceholder')}
                rows={3}
              />
              </FormControl>
            </VStack>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={submitting}
            >
              {t('common.submit')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* 批量操作弹窗 */}
      <Drawer isOpen={isBatchModalOpen} onClose={onBatchModalClose} size="md" placement="right">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            {batchActionType === 'owner' 
              ? t('opportunityList.list.batchUpdateOwner')
              : t('opportunityList.list.batchUpdateDate')}
          </DrawerHeader>

          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <Text fontSize="sm" color="gray.600">
                {t('opportunityList.list.selectedCount', { count: selectedOpportunities.length })}
              </Text>

              {batchActionType === 'owner' && (
                <FormControl>
                  <FormLabel>{t('opportunityList.modal.owner')}</FormLabel>
                  <Select
                    value={batchOwnerId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setBatchOwnerId(e.target.value)}
                    placeholder={t('opportunityList.modal.selectOwner')}
                  >
                    {users.map((user: UserListItem) => (
                      <option key={user.id} value={user.id}>
                        {user.display_name || user.username}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}

              {batchActionType === 'date' && (
                <FormControl>
                  <FormLabel>{t('opportunityList.modal.expectedCloseDate')}</FormLabel>
                  <Input
                    type="date"
                    value={batchDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBatchDate(e.target.value)}
                  />
                </FormControl>
              )}
            </VStack>
          </DrawerBody>

          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onBatchModalClose}>
              {t('common.cancel')}
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleBatchSubmit}
              isDisabled={
                (batchActionType === 'owner' && !batchOwnerId) ||
                (batchActionType === 'date' && !batchDate)
              }
            >
              {t('common.submit')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}

export default OpportunityList
  