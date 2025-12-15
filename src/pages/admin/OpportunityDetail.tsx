/**
 * 商机详情页面
 * 显示商机信息、跟进记录、备注等
 */
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Plus, Edit, TrendingUp, User } from 'lucide-react'
import {
  getOpportunityDetail,
  updateOpportunity,
  assignOpportunity,
  convertOpportunity,
  getOpportunityFollowUps,
  createOpportunityFollowUp,
  getOpportunityNotes,
  createOpportunityNote,
} from '@/api/opportunities'
import { 
  Opportunity, 
  OpportunityFollowUp, 
  OpportunityNote, 
  OpportunityStage, 
  OpportunityStatus, 
  OpportunityFollowUpType, 
  OpportunityNoteType, 
  UserListItem, 
  Customer, 
  UpdateOpportunityRequest, 
  OpportunityFollowUpCreateRequest, 
  OpportunityNoteCreateRequest,
  OpportunityAssignRequest,
  OpportunityConvertRequest,
} from '@/api/types'
import { useToast } from '@/components/ToastContainer'
import { formatPrice } from '@/utils/formatPrice'
import { getUserList } from '@/api/users'
import { getCustomerList } from '@/api/customers'
import { useTabs } from '@/contexts/TabsContext'
import {
  Box,
  Button,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  Spinner,
  Flex,
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
  Input,
  Select,
  Textarea,
  useDisclosure,
  IconButton,
  Divider,
  SimpleGrid,
  Alert,
  AlertIcon,
  Checkbox,
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

const OpportunityDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { showSuccess, showError } = useToast()
  const { updateTabTitle } = useTabs()

  // Chakra UI 颜色模式
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // 商机详情
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [loading, setLoading] = useState(false)

  // 跟进记录
  const [followUps, setFollowUps] = useState<OpportunityFollowUp[]>([])
  const [loadingFollowUps, setLoadingFollowUps] = useState(false)

  // 备注
  const [notes, setNotes] = useState<OpportunityNote[]>([])
  const [loadingNotes, setLoadingNotes] = useState(false)

  // 下拉选项
  const [users, setUsers] = useState<UserListItem[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])

  // 弹窗状态
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isFollowUpOpen, onOpen: onFollowUpOpen, onClose: onFollowUpClose } = useDisclosure()
  const { isOpen: isNoteOpen, onOpen: onNoteOpen, onClose: onNoteClose } = useDisclosure()
  const { isOpen: isAssignOpen, onOpen: onAssignOpen, onClose: onAssignClose } = useDisclosure()
  const { isOpen: isConvertOpen, onOpen: onConvertOpen, onClose: onConvertClose } = useDisclosure()

  // 编辑表单
  const [editFormData, setEditFormData] = useState({
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

  // 跟进记录表单
  const [followUpFormData, setFollowUpFormData] = useState<OpportunityFollowUpCreateRequest>({
    follow_up_type: 'call',
    content: '',
    follow_up_date: new Date().toISOString().split('T')[0],
  })

  // 备注表单
  const [noteFormData, setNoteFormData] = useState<OpportunityNoteCreateRequest>({
    note_type: 'comment',
    content: '',
    is_important: false,
  })

  // 分配表单
  const [assignFormData, setAssignFormData] = useState<OpportunityAssignRequest>({
    owner_user_id: '',
  })

  // 转换表单
  const [convertFormData, setConvertFormData] = useState<OpportunityConvertRequest>({
    order_title: '',
    order_items: null,
  })

  // 加载商机详情
  const loadOpportunity = async () => {
    if (!id) return
    setLoading(true)
    try {
      const data = await getOpportunityDetail(id)
      setOpportunity(data)
      // 更新标签页标题为商机名称
      const opportunityTitle = data.name || id
      updateTabTitle(`/admin/opportunities/detail/${id}`, opportunityTitle)
      // 初始化编辑表单
      setEditFormData({
        name: data.name,
        customer_id: data.customer_id || '',
        amount: data.amount?.toString() || '',
        probability: data.probability?.toString() || '',
        stage: data.stage,
        status: data.status,
        owner_user_id: data.owner_user_id || '',
        expected_close_date: data.expected_close_date || '',
        description: data.description || '',
      })
    } catch (error: any) {
      console.error('[OpportunityDetail] 加载失败:', error)
      showError(error.message || t('opportunityDetail.error.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  // 加载跟进记录
  const loadFollowUps = async () => {
    if (!id) return
    setLoadingFollowUps(true)
    try {
      const data = await getOpportunityFollowUps(id)
      setFollowUps(data)
    } catch (error: any) {
      console.error('[OpportunityDetail] 加载跟进记录失败:', error)
    } finally {
      setLoadingFollowUps(false)
    }
  }

  // 加载备注
  const loadNotes = async () => {
    if (!id) return
    setLoadingNotes(true)
    try {
      const data = await getOpportunityNotes(id)
      setNotes(data)
    } catch (error: any) {
      console.error('[OpportunityDetail] 加载备注失败:', error)
    } finally {
      setLoadingNotes(false)
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
        console.error('[OpportunityDetail] 加载选项失败:', error)
      }
    }
    loadOptions()
  }, [])

  // 初始加载
  useEffect(() => {
    loadOpportunity()
    loadFollowUps()
    loadNotes()
  }, [id])

  // 更新商机
  const handleUpdate = async () => {
    if (!id || !opportunity) return
    try {
      const updateData: UpdateOpportunityRequest = {
        name: editFormData.name,
        customer_id: editFormData.customer_id || null,
        amount: editFormData.amount ? parseFloat(editFormData.amount) : null,
        probability: editFormData.probability ? parseFloat(editFormData.probability) : null,
        stage: editFormData.stage,
        status: editFormData.status,
        owner_user_id: editFormData.owner_user_id || null,
        expected_close_date: editFormData.expected_close_date || null,
        description: editFormData.description || null,
      }
      await updateOpportunity(id, updateData)
      showSuccess(t('opportunityDetail.success.update'))
      onEditClose()
      loadOpportunity()
    } catch (error: any) {
      showError(error.message || t('opportunityDetail.error.updateFailed'))
    }
  }

  // 分配商机
  const handleAssign = async () => {
    if (!id) return
    try {
      await assignOpportunity(id, assignFormData)
      showSuccess(t('opportunityDetail.success.assign'))
      onAssignClose()
      loadOpportunity()
    } catch (error: any) {
      showError(error.message || t('opportunityDetail.error.assignFailed'))
    }
  }

  // 转换商机
  const handleConvert = async () => {
    if (!id) return
    try {
      await convertOpportunity(id, convertFormData)
      showSuccess(t('opportunityDetail.success.convert'))
      onConvertClose()
      navigate('/admin/opportunities/list')
    } catch (error: any) {
      showError(error.message || t('opportunityDetail.error.convertFailed'))
    }
  }

  // 创建跟进记录
  const handleCreateFollowUp = async () => {
    if (!id) return
    try {
      await createOpportunityFollowUp(id, followUpFormData)
      showSuccess(t('opportunityDetail.success.followUpCreated'))
      onFollowUpClose()
      setFollowUpFormData({
        follow_up_type: 'call',
        content: '',
        follow_up_date: new Date().toISOString().split('T')[0],
      })
      loadFollowUps()
    } catch (error: any) {
      showError(error.message || t('opportunityDetail.error.followUpCreateFailed'))
    }
  }

  // 创建备注
  const handleCreateNote = async () => {
    if (!id) return
    if (!noteFormData.content.trim()) {
      showError(t('opportunityDetail.error.contentRequired'))
      return
    }
    try {
      await createOpportunityNote(id, noteFormData)
      showSuccess(t('opportunityDetail.success.noteCreated'))
      onNoteClose()
      setNoteFormData({
        note_type: 'comment',
        content: '',
        is_important: false,
      })
      loadNotes()
    } catch (error: any) {
      showError(error.message || t('opportunityDetail.error.noteCreateFailed'))
    }
  }

  // 格式化日期时间
  const formatDateTime = (dateString: string | undefined) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN')
    } catch (error) {
      return '-'
    }
  }

  // 格式化金额
  const formatAmount = (amount: number | null | undefined): string => {
    return formatPrice(amount, 'IDR')
  }

  // 获取阶段标签
  const getStageLabel = (stage: OpportunityStage): string => {
    const stageConfig = OPPORTUNITY_STAGES.find(s => s.value === stage)
    return stageConfig?.label || stage
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <Spinner size="xl" />
      </Flex>
    )
  }

  if (!opportunity) {
    return (
      <Box p={4}>
        <Text>{t('opportunityDetail.error.notFound')}</Text>
      </Box>
    )
  }

  return (
    <Box w="full">
      {/* 页面头部 */}
      <HStack spacing={4} mb={4}>
        <IconButton
          aria-label={t('common.back')}
          icon={<ArrowLeft size={20} />}
          onClick={() => navigate('/admin/opportunities/list')}
          variant="ghost"
        />
        <Text fontSize="2xl" fontWeight="bold">
          {t('opportunityDetail.title')}
        </Text>
        <HStack spacing={2} ml="auto">
          <Button
            leftIcon={<Edit size={16} />}
            onClick={onEditOpen}
            size="sm"
          >
            {t('common.edit')}
          </Button>
          <Button
            leftIcon={<User size={16} />}
            onClick={onAssignOpen}
            size="sm"
            variant="outline"
          >
            {t('opportunityDetail.assign')}
          </Button>
          {opportunity.stage === 'negotiation' && (
            <Button
              leftIcon={<TrendingUp size={16} />}
              onClick={onConvertOpen}
              size="sm"
              colorScheme="green"
            >
              {t('opportunityDetail.convert')}
            </Button>
          )}
        </HStack>
      </HStack>

      {/* 商机信息 */}
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
        <Card>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Text fontSize="lg" fontWeight="bold">
                  {t('opportunityDetail.basicInfo')}
                </Text>
              </HStack>
              <Divider />
              <HStack>
                <Text fontWeight="semibold" minW="100px">{t('opportunityDetail.name')}:</Text>
                <Text>{opportunity.name}</Text>
              </HStack>
              <HStack>
                <Text fontWeight="semibold" minW="100px">{t('opportunityDetail.customer')}:</Text>
                <Text>{opportunity.customer_name || '-'}</Text>
              </HStack>
              <HStack>
                <Text fontWeight="semibold" minW="100px">{t('opportunityDetail.stage')}:</Text>
                <Badge colorScheme={OPPORTUNITY_STAGES.find(s => s.value === opportunity.stage)?.color || 'gray'}>
                  {getStageLabel(opportunity.stage)}
                </Badge>
              </HStack>
              <HStack>
                <Text fontWeight="semibold" minW="100px">{t('opportunityDetail.status')}:</Text>
                <Badge colorScheme={opportunity.status === 'won' ? 'green' : opportunity.status === 'lost' ? 'red' : 'blue'}>
                  {t(`opportunityDetail.statusValues.${opportunity.status}`) || opportunity.status}
                </Badge>
              </HStack>
              <HStack>
                <Text fontWeight="semibold" minW="100px">{t('opportunityDetail.owner')}:</Text>
                <Text>{opportunity.owner_username || '-'}</Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack align="stretch" spacing={4}>
              <HStack justify="space-between">
                <Text fontSize="lg" fontWeight="bold">
                  {t('opportunityDetail.financialInfo')}
                </Text>
              </HStack>
              <Divider />
              <HStack>
                <Text fontWeight="semibold" minW="100px">{t('opportunityDetail.amount')}:</Text>
                <Text fontSize="lg" fontWeight="bold" color="green.600">
                  {formatAmount(opportunity.amount)}
                </Text>
              </HStack>
              <HStack>
                <Text fontWeight="semibold" minW="100px">{t('opportunityDetail.probability')}:</Text>
                <Text>{opportunity.probability !== null && opportunity.probability !== undefined ? `${opportunity.probability}%` : '-'}</Text>
              </HStack>
              <HStack>
                <Text fontWeight="semibold" minW="100px">{t('opportunityDetail.expectedCloseDate')}:</Text>
                <Text>{opportunity.expected_close_date ? new Date(opportunity.expected_close_date).toLocaleDateString() : '-'}</Text>
              </HStack>
              <HStack>
                <Text fontWeight="semibold" minW="100px">{t('opportunityDetail.actualCloseDate')}:</Text>
                <Text>{opportunity.actual_close_date ? new Date(opportunity.actual_close_date).toLocaleDateString() : '-'}</Text>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* 描述 */}
      {opportunity.description && (
        <Card mb={4}>
          <CardBody>
            <Text fontWeight="semibold" mb={2}>{t('opportunityDetail.description')}:</Text>
            <Text>{opportunity.description}</Text>
          </CardBody>
        </Card>
      )}

      {/* 跟进记录 */}
      <Card mb={4}>
        <CardBody>
          <HStack justify="space-between" mb={4}>
            <Text fontSize="lg" fontWeight="bold">
              {t('opportunityDetail.followUps')}
            </Text>
            <Button
              leftIcon={<Plus size={16} />}
              onClick={onFollowUpOpen}
              size="sm"
            >
              {t('opportunityDetail.addFollowUp')}
            </Button>
          </HStack>
          {loadingFollowUps ? (
            <Spinner />
          ) : followUps.length === 0 ? (
            <Text color="gray.500">{t('opportunityDetail.noFollowUps')}</Text>
          ) : (
            <VStack align="stretch" spacing={3}>
              {followUps.map((followUp: OpportunityFollowUp) => (
                <Box
                  key={followUp.id}
                  p={3}
                  bg={bgColor}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="md"
                >
                  <HStack justify="space-between" mb={2}>
                    <HStack>
                      <Badge>{t(`opportunityDetail.followUpTypeValues.${followUp.follow_up_type}`) || followUp.follow_up_type}</Badge>
                      <Text fontSize="sm" color="gray.500">
                        {formatDateTime(followUp.follow_up_date)}
                      </Text>
                    </HStack>
                    {followUp.created_by_name && (
                      <Text fontSize="sm" color="gray.500">
                        {followUp.created_by_name}
                      </Text>
                    )}
                  </HStack>
                  {followUp.content && (
                    <Text>{followUp.content}</Text>
                  )}
                </Box>
              ))}
            </VStack>
          )}
        </CardBody>
      </Card>

      {/* 备注 */}
      <Card>
        <CardBody>
          <HStack justify="space-between" mb={4}>
            <Text fontSize="lg" fontWeight="bold">
              {t('opportunityDetail.notes')}
            </Text>
            <Button
              leftIcon={<Plus size={16} />}
              onClick={onNoteOpen}
              size="sm"
            >
              {t('opportunityDetail.addNote')}
            </Button>
          </HStack>
          {loadingNotes ? (
            <Spinner />
          ) : notes.length === 0 ? (
            <Text color="gray.500">{t('opportunityDetail.noNotes')}</Text>
          ) : (
            <VStack align="stretch" spacing={3}>
              {notes.map((note: OpportunityNote) => (
                <Box
                  key={note.id}
                  p={3}
                  bg={bgColor}
                  borderWidth="1px"
                  borderColor={borderColor}
                  borderRadius="md"
                  borderLeftWidth={note.is_important ? '4px' : '1px'}
                  borderLeftColor={note.is_important ? 'red.500' : borderColor}
                >
                  <HStack justify="space-between" mb={2}>
                    <HStack>
                      <Badge>{t(`opportunityDetail.noteTypeValues.${note.note_type}`) || note.note_type}</Badge>
                      {note.is_important && (
                        <Badge colorScheme="red">{t('opportunityDetail.important')}</Badge>
                      )}
                      <Text fontSize="sm" color="gray.500">
                        {formatDateTime(note.created_at)}
                      </Text>
                    </HStack>
                    {note.created_by_name && (
                      <Text fontSize="sm" color="gray.500">
                        {note.created_by_name}
                      </Text>
                    )}
                  </HStack>
                  <Text>{note.content}</Text>
                </Box>
              ))}
            </VStack>
          )}
        </CardBody>
      </Card>

      {/* 编辑表单 */}
      <Drawer isOpen={isEditOpen} onClose={onEditClose} size="md" placement="right">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{t('opportunityDetail.edit')}</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>{t('opportunityDetail.name')}</FormLabel>
                <Input
                  value={editFormData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData({ ...editFormData, name: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>{t('opportunityDetail.customer')}</FormLabel>
                <Select
                  value={editFormData.customer_id}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditFormData({ ...editFormData, customer_id: e.target.value })}
                >
                  <option value="">{t('common.select')}</option>
                  {customers.map((customer: Customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>{t('opportunityDetail.amount')}</FormLabel>
                <Input
                  type="number"
                  value={editFormData.amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData({ ...editFormData, amount: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>{t('opportunityDetail.probability')}</FormLabel>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={editFormData.probability}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData({ ...editFormData, probability: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>{t('opportunityDetail.stage')}</FormLabel>
                <Select
                  value={editFormData.stage}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditFormData({ ...editFormData, stage: e.target.value as OpportunityStage })}
                >
                  {OPPORTUNITY_STAGES.map((stage) => (
                    <option key={stage.value} value={stage.value}>
                      {stage.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>{t('opportunityDetail.status')}</FormLabel>
                <Select
                  value={editFormData.status}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditFormData({ ...editFormData, status: e.target.value as OpportunityStatus })}
                >
                  <option value="active">{t('opportunityDetail.statusValues.active')}</option>
                  <option value="won">{t('opportunityDetail.statusValues.won')}</option>
                  <option value="lost">{t('opportunityDetail.statusValues.lost')}</option>
                  <option value="cancelled">{t('opportunityDetail.statusValues.cancelled')}</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>{t('opportunityDetail.owner')}</FormLabel>
                <Select
                  value={editFormData.owner_user_id}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setEditFormData({ ...editFormData, owner_user_id: e.target.value })}
                >
                  <option value="">{t('common.select')}</option>
                  {users.map((user: UserListItem) => (
                    <option key={user.id} value={user.id}>
                      {user.display_name || user.username}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>{t('opportunityDetail.expectedCloseDate')}</FormLabel>
                <Input
                  type="date"
                  value={editFormData.expected_close_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditFormData({ ...editFormData, expected_close_date: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>{t('opportunityDetail.description')}</FormLabel>
                <Textarea
                  value={editFormData.description}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditFormData({ ...editFormData, description: e.target.value })}
                  rows={4}
                />
              </FormControl>
            </VStack>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onEditClose}>
              {t('common.cancel')}
            </Button>
            <Button colorScheme="blue" onClick={handleUpdate}>
              {t('common.save')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* 分配表单 */}
      <Drawer isOpen={isAssignOpen} onClose={onAssignClose} size="sm" placement="right">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{t('opportunityDetail.assign')}</DrawerHeader>
          <DrawerBody>
            <FormControl>
              <FormLabel>{t('opportunityDetail.owner')}</FormLabel>
              <Select
                value={assignFormData.owner_user_id}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAssignFormData({ owner_user_id: e.target.value })}
              >
                <option value="">{t('common.select')}</option>
                {users.map((user: UserListItem) => (
                  <option key={user.id} value={user.id}>
                    {user.display_name || user.username}
                  </option>
                ))}
              </Select>
            </FormControl>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onAssignClose}>
              {t('common.cancel')}
            </Button>
            <Button colorScheme="blue" onClick={handleAssign}>
              {t('common.save')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* 转换表单 */}
      <Drawer isOpen={isConvertOpen} onClose={onConvertClose} size="md" placement="right">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{t('opportunityDetail.convert')}</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>{t('opportunityDetail.convert.orderTitle')}</FormLabel>
                <Input
                  value={convertFormData.order_title || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConvertFormData({ ...convertFormData, order_title: e.target.value })}
                  placeholder={t('opportunityDetail.convert.orderTitlePlaceholder')}
                />
              </FormControl>
              <Alert status="info">
                <AlertIcon />
                {t('opportunityDetail.convert.info')}
              </Alert>
            </VStack>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onConvertClose}>
              {t('common.cancel')}
            </Button>
            <Button colorScheme="green" onClick={handleConvert}>
              {t('opportunityDetail.convert.submit')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* 创建跟进记录表单 */}
      <Drawer isOpen={isFollowUpOpen} onClose={onFollowUpClose} size="md" placement="right">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{t('opportunityDetail.addFollowUp')}</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>{t('opportunityDetail.followUpType')}</FormLabel>
                <Select
                  value={followUpFormData.follow_up_type}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFollowUpFormData({ ...followUpFormData, follow_up_type: e.target.value as OpportunityFollowUpType })}
                >
                  <option value="call">{t('opportunityDetail.followUpTypeValues.call')}</option>
                  <option value="meeting">{t('opportunityDetail.followUpTypeValues.meeting')}</option>
                  <option value="email">{t('opportunityDetail.followUpTypeValues.email')}</option>
                  <option value="note">{t('opportunityDetail.followUpTypeValues.note')}</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>{t('opportunityDetail.followUpDate')}</FormLabel>
                <Input
                  type="date"
                  value={followUpFormData.follow_up_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFollowUpFormData({ ...followUpFormData, follow_up_date: e.target.value })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>{t('opportunityDetail.content')}</FormLabel>
                <Textarea
                  value={followUpFormData.content || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFollowUpFormData({ ...followUpFormData, content: e.target.value })}
                  rows={4}
                  placeholder={t('opportunityDetail.contentPlaceholder')}
                />
              </FormControl>
            </VStack>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onFollowUpClose}>
              {t('common.cancel')}
            </Button>
            <Button colorScheme="blue" onClick={handleCreateFollowUp}>
              {t('common.submit')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* 创建备注表单 */}
      <Drawer isOpen={isNoteOpen} onClose={onNoteClose} size="md" placement="right">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{t('opportunityDetail.addNote')}</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>{t('opportunityDetail.noteType')}</FormLabel>
                <Select
                  value={noteFormData.note_type}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNoteFormData({ ...noteFormData, note_type: e.target.value as OpportunityNoteType })}
                >
                  <option value="comment">{t('opportunityDetail.noteTypeValues.comment')}</option>
                  <option value="reminder">{t('opportunityDetail.noteTypeValues.reminder')}</option>
                  <option value="task">{t('opportunityDetail.noteTypeValues.task')}</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>{t('opportunityDetail.content')}</FormLabel>
                <Textarea
                  value={noteFormData.content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNoteFormData({ ...noteFormData, content: e.target.value })}
                  rows={6}
                  placeholder={t('opportunityDetail.contentPlaceholder')}
                />
              </FormControl>
              <FormControl>
                <Checkbox
                  isChecked={noteFormData.is_important}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNoteFormData({ ...noteFormData, is_important: e.target.checked })}
                >
                  {t('opportunityDetail.important')}
                </Checkbox>
              </FormControl>
            </VStack>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onNoteClose}>
              {t('common.cancel')}
            </Button>
            <Button colorScheme="blue" onClick={handleCreateNote}>
              {t('common.submit')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}

export default OpportunityDetail

