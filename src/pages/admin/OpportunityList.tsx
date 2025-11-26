/**
 * 商机列表页面（看板视图）
 * 支持看板拖拽、条件查询、创建、编辑、删除等
 */
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Edit, Trash2, TrendingUp, DollarSign, User, Eye, GripVertical } from 'lucide-react'
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
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
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

const OpportunityList = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { showSuccess, showError } = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  // Chakra UI 颜色模式
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const columnBg = useColorModeValue('gray.50', 'gray.700')

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

  // 加载商机列表
  const loadOpportunities = async (params: OpportunityListParams) => {
    setLoading(true)
    try {
      const result = await getOpportunityList(params)
      setOpportunities(result.records || [])
      
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

  // 初始加载
  useEffect(() => {
    loadOpportunities(queryParams)
  }, [])

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

  // 格式化金额
  const formatAmount = (amount: number | null | undefined): string => {
    if (!amount) return '-'
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }


  return (
    <Box w="full">
      {/* 页面头部 */}
      <PageHeader
        icon={TrendingUp}
        title={t('opportunityList.title')}
        subtitle={t('opportunityList.subtitle')}
        actions={
          <Button
            colorScheme="primary"
            leftIcon={<Plus size={16} />}
            onClick={handleCreate}
            size="sm"
          >
            {t('opportunityList.create')}
          </Button>
        }
      />

      {/* 统计卡片 */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={3} mb={4}>
        <Card bg="blue.50" borderColor="blue.200" borderWidth={1}>
          <CardBody>
            <Stat>
              <StatLabel fontSize="xs" fontWeight="semibold" color="blue.700">
                {t('opportunityList.statistics.total')}
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
                {t('opportunityList.statistics.won')}
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="green.900">
                {loading ? <Spinner size="sm" /> : statistics.wonCount}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="red.50" borderColor="red.200" borderWidth={1}>
          <CardBody>
            <Stat>
              <StatLabel fontSize="xs" fontWeight="semibold" color="red.700">
                {t('opportunityList.statistics.lost')}
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="red.900">
                {loading ? <Spinner size="sm" /> : statistics.lostCount}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="orange.50" borderColor="orange.200" borderWidth={1}>
          <CardBody>
            <Stat>
              <StatLabel fontSize="xs" fontWeight="semibold" color="orange.700">
                {t('opportunityList.statistics.totalAmount')}
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="orange.900">
                {loading ? <Spinner size="sm" /> : formatAmount(statistics.totalAmount)}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card bg="purple.50" borderColor="purple.200" borderWidth={1}>
          <CardBody>
            <Stat>
              <StatLabel fontSize="xs" fontWeight="semibold" color="purple.700">
                {t('opportunityList.statistics.conversionRate')}
              </StatLabel>
              <StatNumber fontSize="2xl" fontWeight="bold" color="purple.900">
                {loading ? <Spinner size="sm" /> : statistics.total > 0 
                  ? `${((statistics.wonCount / statistics.total) * 100).toFixed(1)}%`
                  : '0%'}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* 搜索栏 */}
      <Card mb={4}>
        <CardBody>
          <HStack spacing={4} flexWrap="wrap">
            <InputGroup flex="1" minW="200px">
              <InputLeftElement pointerEvents="none">
                <Search size={16} />
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
            />

            <Input
              type="number"
              placeholder={t('opportunityList.search.maxAmount')}
              value={formData.max_amount}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, max_amount: e.target.value })}
              flex="1"
              minW="120px"
            />

            <Button colorScheme="blue" onClick={handleSearch} leftIcon={<Search size={16} />}>
              {t('common.search')}
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {/* 看板视图 */}
      {loading ? (
        <Flex justify="center" align="center" h="400px">
          <Spinner size="xl" />
        </Flex>
      ) : (
        <Box
          overflowX="auto"
          pb={4}
          css={{
            '&::-webkit-scrollbar': {
              height: '8px',
            },
            '&::-webkit-scrollbar-track': {
              background: useColorModeValue('gray.100', 'gray.800'),
            },
            '&::-webkit-scrollbar-thumb': {
              background: useColorModeValue('gray.400', 'gray.600'),
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
                  bg={isDragOver ? useColorModeValue('blue.50', 'blue.900') : columnBg}
                  borderRadius="lg"
                  borderWidth="2px"
                  borderColor={isDragOver ? 'blue.300' : borderColor}
                  borderStyle={isDragOver ? 'dashed' : 'solid'}
                  transition="all 0.2s"
                >
                  {/* 阶段标题 */}
                  <Box
                    p={3}
                    bg={useColorModeValue(`${stageConfig.color}.100`, `${stageConfig.color}.800`)}
                    borderTopRadius="lg"
                    borderBottomWidth="1px"
                    borderBottomColor={borderColor}
                  >
                    <Flex justify="space-between" align="center">
                      <HStack spacing={2}>
                        <Text fontWeight="bold" fontSize="sm" color={useColorModeValue(`${stageConfig.color}.800`, `${stageConfig.color}.200`)}>
                          {stageConfig.label}
                        </Text>
                        <Badge colorScheme={stageConfig.color} borderRadius="full">
                          {stageOpportunities.length}
                        </Badge>
                      </HStack>
                    </Flex>
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
                          bg={bgColor}
                          borderWidth="1px"
                          borderColor={borderColor}
                          _hover={{
                            boxShadow: 'md',
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
                                  _hover={{ color: 'blue.500' }}
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
                                  <Box as={User} size={12} color="gray.500" />
                                  <Text fontSize="xs" color="gray.600" noOfLines={1}>
                                    {opportunity.customer_name}
                                  </Text>
                                </HStack>
                              )}

                              {/* 金额 */}
                              {opportunity.amount && (
                                <HStack spacing={1}>
                                  <Box as={DollarSign} size={12} color="green.500" />
                                  <Text fontSize="sm" fontWeight="bold" color="green.600">
                                    {formatAmount(opportunity.amount)}
                                  </Text>
                                </HStack>
                              )}

                              {/* 可能性 */}
                              {opportunity.probability !== null && opportunity.probability !== undefined && (
                                <Box>
                                  <Text fontSize="xs" color="gray.600" mb={1}>
                                    {t('opportunityList.probability')}: {opportunity.probability}%
                                  </Text>
                                  <Box
                                    w="full"
                                    h="4px"
                                    bg="gray.200"
                                    borderRadius="full"
                                    overflow="hidden"
                                  >
                                    <Box
                                      w={`${opportunity.probability}%`}
                                      h="full"
                                      bg="blue.500"
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
    </Box>
  )
}

export default OpportunityList
  