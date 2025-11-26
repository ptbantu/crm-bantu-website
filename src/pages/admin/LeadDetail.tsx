/**
 * 线索详情页面
 * 显示线索信息、跟进记录、备注等
 */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Plus, Edit, Target, Mail, Phone, UserCheck, Clock, TrendingUp, Users } from 'lucide-react'
import {
  getLeadDetail,
  updateLead,
  assignLead,
  moveLeadToPool,
  getLeadFollowUps,
  createLeadFollowUp,
  getLeadNotes,
  createLeadNote,
  convertLeadToCustomer,
  convertLeadToOpportunity,
} from '@/api/leads'
import { Lead, LeadFollowUp, LeadNote, LeadStatus, LeadFollowUpType, LeadNoteType, UserListItem, Customer, UpdateLeadRequest, LeadFollowUpCreateRequest, LeadNoteCreateRequest } from '@/api/types'
import { useToast } from '@/components/ToastContainer'
import { getUserList } from '@/api/users'
import { getCustomerList } from '@/api/customers'
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
  Checkbox,
} from '@chakra-ui/react'

const LeadDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { showSuccess, showError } = useToast()

  // Chakra UI 颜色模式
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // 线索详情
  const [lead, setLead] = useState<Lead | null>(null)
  const [loading, setLoading] = useState(false)

  // 跟进记录
  const [followUps, setFollowUps] = useState<LeadFollowUp[]>([])
  const [loadingFollowUps, setLoadingFollowUps] = useState(false)

  // 备注
  const [notes, setNotes] = useState<LeadNote[]>([])
  const [loadingNotes, setLoadingNotes] = useState(false)

  // 下拉选项
  const [users, setUsers] = useState<UserListItem[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])

  // 弹窗状态
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure()
  const { isOpen: isFollowUpOpen, onOpen: onFollowUpOpen, onClose: onFollowUpClose } = useDisclosure()
  const { isOpen: isNoteOpen, onOpen: onNoteOpen, onClose: onNoteClose } = useDisclosure()
  const { isOpen: isAssignOpen, onOpen: onAssignOpen, onClose: onAssignClose } = useDisclosure()
  const { isOpen: isConvertToCustomerOpen, onOpen: onConvertToCustomerOpen, onClose: onConvertToCustomerClose } = useDisclosure()
  const { isOpen: isConvertToOpportunityOpen, onOpen: onConvertToOpportunityOpen, onClose: onConvertToOpportunityClose } = useDisclosure()

  // 编辑表单
  const [editFormData, setEditFormData] = useState({
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

  // 跟进记录表单
  const [followUpFormData, setFollowUpFormData] = useState<LeadFollowUpCreateRequest>({
    follow_up_type: 'call',
    content: '',
    follow_up_date: new Date().toISOString().slice(0, 16),
  })

  // 备注表单
  const [noteFormData, setNoteFormData] = useState<LeadNoteCreateRequest>({
    note_type: 'comment',
    content: '',
    is_important: false,
  })

  // 分配表单
  const [assignUserId, setAssignUserId] = useState('')

  // 加载线索详情
  const loadLeadDetail = async () => {
    if (!id) return
    setLoading(true)
    try {
      const leadData = await getLeadDetail(id)
      setLead(leadData)
      // 初始化编辑表单
      setEditFormData({
        name: leadData.name,
        company_name: leadData.company_name || '',
        contact_name: leadData.contact_name || '',
        phone: leadData.phone || '',
        email: leadData.email || '',
        address: leadData.address || '',
        customer_id: leadData.customer_id || '',
        owner_user_id: leadData.owner_user_id || '',
        status: leadData.status,
        level: leadData.level || '',
        next_follow_up_at: leadData.next_follow_up_at ? new Date(leadData.next_follow_up_at).toISOString().slice(0, 16) : '',
      })
    } catch (error: any) {
      showError(error.message || t('leadDetail.error.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  // 加载跟进记录
  const loadFollowUps = async () => {
    if (!id) return
    setLoadingFollowUps(true)
    try {
      const data = await getLeadFollowUps(id)
      setFollowUps(data)
    } catch (error: any) {
      showError(error.message || t('leadDetail.error.loadFollowUpsFailed'))
    } finally {
      setLoadingFollowUps(false)
    }
  }

  // 加载备注
  const loadNotes = async () => {
    if (!id) return
    setLoadingNotes(true)
    try {
      const data = await getLeadNotes(id)
      setNotes(data)
    } catch (error: any) {
      showError(error.message || t('leadDetail.error.loadNotesFailed'))
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
        console.error('Failed to load options:', error)
      }
    }
    loadOptions()
  }, [])

  // 初始加载
  useEffect(() => {
    if (id) {
      loadLeadDetail()
      loadFollowUps()
      loadNotes()
    }
  }, [id])

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

  // 获取跟进类型标签
  const getFollowUpTypeLabel = (type: LeadFollowUpType) => {
    const typeMap: Record<LeadFollowUpType, string> = {
      call: t('leadDetail.followUpType.call'),
      meeting: t('leadDetail.followUpType.meeting'),
      email: t('leadDetail.followUpType.email'),
      note: t('leadDetail.followUpType.note'),
    }
    return typeMap[type] || type
  }

  // 获取备注类型标签
  const getNoteTypeLabel = (type: LeadNoteType) => {
    const typeMap: Record<LeadNoteType, string> = {
      comment: t('leadDetail.noteType.comment'),
      reminder: t('leadDetail.noteType.reminder'),
      task: t('leadDetail.noteType.task'),
    }
    return typeMap[type] || type
  }

  // 保存编辑
  const handleSaveEdit = async () => {
    if (!id) return
    if (!editFormData.name) {
      showError(t('leadDetail.error.nameRequired'))
      return
    }

    try {
      const updateData: UpdateLeadRequest = {
        name: editFormData.name,
        company_name: editFormData.company_name || null,
        contact_name: editFormData.contact_name || null,
        phone: editFormData.phone || null,
        email: editFormData.email || null,
        address: editFormData.address || null,
        customer_id: editFormData.customer_id || null,
        owner_user_id: editFormData.owner_user_id || null,
        status: editFormData.status,
        level: editFormData.level || null,
        next_follow_up_at: editFormData.next_follow_up_at ? new Date(editFormData.next_follow_up_at).toISOString() : null,
      }
      await updateLead(id, updateData)
      showSuccess(t('leadDetail.success.update'))
      onEditClose()
      loadLeadDetail()
    } catch (error: any) {
      showError(error.message || t('leadDetail.error.updateFailed'))
    }
  }

  // 创建跟进记录
  const handleCreateFollowUp = async () => {
    if (!id) return
    if (!followUpFormData.follow_up_date) {
      showError(t('leadDetail.error.followUpDateRequired'))
      return
    }

    try {
      await createLeadFollowUp(id, {
        ...followUpFormData,
        follow_up_date: new Date(followUpFormData.follow_up_date).toISOString(),
      })
      showSuccess(t('leadDetail.success.createFollowUp'))
      onFollowUpClose()
      setFollowUpFormData({
        follow_up_type: 'call',
        content: '',
        follow_up_date: new Date().toISOString().slice(0, 16),
      })
      loadFollowUps()
      loadLeadDetail() // 更新下次跟进时间
    } catch (error: any) {
      showError(error.message || t('leadDetail.error.createFollowUpFailed'))
    }
  }

  // 创建备注
  const handleCreateNote = async () => {
    if (!id) return
    if (!noteFormData.content.trim()) {
      showError(t('leadDetail.error.noteContentRequired'))
      return
    }

    try {
      await createLeadNote(id, noteFormData)
      showSuccess(t('leadDetail.success.createNote'))
      onNoteClose()
      setNoteFormData({
        note_type: 'comment',
        content: '',
        is_important: false,
      })
      loadNotes()
    } catch (error: any) {
      showError(error.message || t('leadDetail.error.createNoteFailed'))
    }
  }

  // 分配线索
  const handleAssign = async () => {
    if (!id) return
    if (!assignUserId) {
      showError(t('leadDetail.error.selectUser'))
      return
    }

    try {
      await assignLead(id, { owner_user_id: assignUserId })
      showSuccess(t('leadDetail.success.assign'))
      onAssignClose()
      setAssignUserId('')
      loadLeadDetail()
    } catch (error: any) {
      showError(error.message || t('leadDetail.error.assignFailed'))
    }
  }

  // 移入公海池
  const handleMoveToPool = async () => {
    if (!id) return
    if (!window.confirm(t('leadDetail.confirm.moveToPool'))) {
      return
    }

    try {
      await moveLeadToPool(id, { pool_id: null })
      showSuccess(t('leadDetail.success.moveToPool'))
      loadLeadDetail()
    } catch (error: any) {
      showError(error.message || t('leadDetail.error.moveToPoolFailed'))
    }
  }

  // 转换为客户
  const handleConvertToCustomer = async () => {
    if (!id) return
    try {
      const result = await convertLeadToCustomer(id, {
        customer_name: convertToCustomerForm.customer_name || lead.company_name || undefined,
        contact_name: convertToCustomerForm.contact_name || lead.contact_name || undefined,
      })
      showSuccess(t('leadDetail.convert.success'))
      onConvertToCustomerClose()
      setConvertToCustomerForm({ customer_name: '', contact_name: '' })
      navigate(`/admin/customer/list`)
    } catch (error: any) {
      showError(error.message || t('leadDetail.convert.failed'))
    }
  }

  // 转换为商机
  const handleConvertToOpportunity = async () => {
    if (!id) return
    try {
      const result = await convertLeadToOpportunity(id, {
        opportunity_name: convertToOpportunityForm.opportunity_name || lead.name || undefined,
        amount: convertToOpportunityForm.amount ? parseFloat(convertToOpportunityForm.amount) : undefined,
      })
      showSuccess(t('leadDetail.convert.success'))
      onConvertToOpportunityClose()
      setConvertToOpportunityForm({ opportunity_name: '', amount: '' })
      navigate(`/admin/opportunities/list`)
    } catch (error: any) {
      showError(error.message || t('leadDetail.convert.failed'))
    }
  }

  if (loading) {
    return (
      <Box w="full" p={8} textAlign="center">
        <Spinner size="lg" color="blue.500" />
        <Text mt={4} color="gray.500">{t('leadDetail.loading')}</Text>
      </Box>
    )
  }

  if (!lead) {
    return (
      <Box w="full" p={8} textAlign="center">
        <Text color="gray.500">{t('leadDetail.notFound')}</Text>
      </Box>
    )
  }

  return (
    <Box w="full">
      {/* 头部 */}
      <HStack mb={4} justify="space-between">
        <HStack spacing={4}>
          <IconButton
            aria-label={t('leadDetail.back')}
            icon={<ArrowLeft size={20} />}
            variant="ghost"
            onClick={() => navigate('/admin/leads/list')}
          />
          <VStack align="flex-start" spacing={0}>
            <Text fontSize="2xl" fontWeight="semibold" color="gray.900">
              {lead.name}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {lead.company_name || '-'}
            </Text>
          </VStack>
        </HStack>
        <HStack spacing={2}>
          {!lead.is_in_public_pool && (
            <Button
              size="sm"
              colorScheme="green"
              leftIcon={<UserCheck size={16} />}
              onClick={onAssignOpen}
            >
              {t('leadDetail.assign')}
            </Button>
          )}
          {!lead.is_in_public_pool && (
            <Button
              size="sm"
              colorScheme="orange"
              leftIcon={<Target size={16} />}
              onClick={handleMoveToPool}
            >
              {t('leadDetail.moveToPool')}
            </Button>
          )}
          <Button
            size="sm"
            colorScheme="blue"
            leftIcon={<Edit size={16} />}
            onClick={onEditOpen}
          >
            {t('leadDetail.edit')}
          </Button>
          <Button
            size="sm"
            colorScheme="green"
            leftIcon={<Users size={16} />}
            onClick={onConvertToCustomerOpen}
          >
            {t('leadDetail.convert.toCustomer')}
          </Button>
          <Button
            size="sm"
            colorScheme="purple"
            leftIcon={<TrendingUp size={16} />}
            onClick={onConvertToOpportunityOpen}
          >
            {t('leadDetail.convert.toOpportunity')}
          </Button>
        </HStack>
      </HStack>

      {/* 线索基本信息 */}
      <Card mb={4} bg={bgColor} borderColor={borderColor}>
        <CardBody>
          <Text fontSize="lg" fontWeight="semibold" mb={4} color="gray.900">
            {t('leadDetail.basicInfo')}
          </Text>
          <VStack spacing={4} align="stretch">
            <HStack spacing={8} flexWrap="wrap">
              <Box flex={1} minW="200px">
                <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.500">
                  {t('leadDetail.contactName')}
                </Text>
                <Text fontSize="sm" color="gray.900">
                  {lead.contact_name || '-'}
                </Text>
              </Box>
              <Box flex={1} minW="200px">
                <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.500">
                  {t('leadDetail.phone')}
                </Text>
                <HStack spacing={1}>
                  <Phone size={14} color="gray" />
                  <Text fontSize="sm" color="gray.900">
                    {lead.phone || '-'}
                  </Text>
                </HStack>
              </Box>
              <Box flex={1} minW="200px">
                <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.500">
                  {t('leadDetail.email')}
                </Text>
                <HStack spacing={1}>
                  <Mail size={14} color="gray" />
                  <Text fontSize="sm" color="gray.900">
                    {lead.email || '-'}
                  </Text>
                </HStack>
              </Box>
            </HStack>
            <HStack spacing={8} flexWrap="wrap">
              <Box flex={1} minW="200px">
                <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.500">
                  {t('leadDetail.address')}
                </Text>
                <Text fontSize="sm" color="gray.900">
                  {lead.address || '-'}
                </Text>
              </Box>
              <Box flex={1} minW="200px">
                <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.500">
                  {t('leadDetail.owner')}
                </Text>
                <Text fontSize="sm" color="gray.900">
                  {lead.owner_username || '-'}
                </Text>
              </Box>
              <Box flex={1} minW="200px">
                <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.500">
                  {t('leadDetail.status')}
                </Text>
                {getStatusBadge(lead.status)}
              </Box>
            </HStack>
            <HStack spacing={8} flexWrap="wrap">
              <Box flex={1} minW="200px">
                <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.500">
                  {t('leadDetail.level')}
                </Text>
                <Text fontSize="sm" color="gray.900">
                  {lead.level_name_zh || lead.level || '-'}
                </Text>
              </Box>
              <Box flex={1} minW="200px">
                <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.500">
                  {t('leadDetail.lastFollowUp')}
                </Text>
                <Text fontSize="sm" color="gray.900">
                  {formatDateTime(lead.last_follow_up_at)}
                </Text>
              </Box>
              <Box flex={1} minW="200px">
                <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.500">
                  {t('leadDetail.nextFollowUp')}
                </Text>
                <HStack spacing={1}>
                  <Clock size={14} color="gray" />
                  <Text fontSize="sm" color="gray.900">
                    {formatDateTime(lead.next_follow_up_at)}
                  </Text>
                </HStack>
              </Box>
            </HStack>
            {lead.is_in_public_pool && (
              <Box>
                <Badge colorScheme="orange" fontSize="xs">
                  {t('leadDetail.inPublicPool')}
                </Badge>
              </Box>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* 跟进记录 */}
      <Card mb={4} bg={bgColor} borderColor={borderColor}>
        <CardBody>
          <HStack justify="space-between" mb={4}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
              {t('leadDetail.followUps')}
            </Text>
            <Button
              size="sm"
              colorScheme="blue"
              leftIcon={<Plus size={16} />}
              onClick={onFollowUpOpen}
            >
              {t('leadDetail.addFollowUp')}
            </Button>
          </HStack>
          {loadingFollowUps ? (
            <Box textAlign="center" py={4}>
              <Spinner size="sm" color="blue.500" />
              <Text mt={2} fontSize="sm" color="gray.500">{t('leadDetail.loading')}</Text>
            </Box>
          ) : followUps.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Text fontSize="sm" color="gray.500">{t('leadDetail.noFollowUps')}</Text>
            </Box>
          ) : (
            <VStack spacing={3} align="stretch">
              {followUps.map((followUp: LeadFollowUp) => (
                <Box
                  key={followUp.id}
                  p={3}
                  borderWidth="1px"
                  borderRadius="md"
                  borderColor={borderColor}
                  bg={bgColor}
                >
                  <HStack justify="space-between" mb={2}>
                    <HStack spacing={2}>
                      <Badge colorScheme="blue" fontSize="xs">
                        {getFollowUpTypeLabel(followUp.follow_up_type)}
                      </Badge>
                      <Text fontSize="xs" color="gray.500">
                        {formatDateTime(followUp.follow_up_date)}
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color="gray.500">
                      {followUp.created_by_name || '-'}
                    </Text>
                  </HStack>
                  {followUp.content && (
                    <Text fontSize="sm" color="gray.700" mt={2}>
                      {followUp.content}
                    </Text>
                  )}
                </Box>
              ))}
            </VStack>
          )}
        </CardBody>
      </Card>

      {/* 备注 */}
      <Card mb={4} bg={bgColor} borderColor={borderColor}>
        <CardBody>
          <HStack justify="space-between" mb={4}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
              {t('leadDetail.notes')}
            </Text>
            <Button
              size="sm"
              colorScheme="blue"
              leftIcon={<Plus size={16} />}
              onClick={onNoteOpen}
            >
              {t('leadDetail.addNote')}
            </Button>
          </HStack>
          {loadingNotes ? (
            <Box textAlign="center" py={4}>
              <Spinner size="sm" color="blue.500" />
              <Text mt={2} fontSize="sm" color="gray.500">{t('leadDetail.loading')}</Text>
            </Box>
          ) : notes.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Text fontSize="sm" color="gray.500">{t('leadDetail.noNotes')}</Text>
            </Box>
          ) : (
            <VStack spacing={3} align="stretch">
              {notes.map((note: LeadNote) => (
                <Box
                  key={note.id}
                  p={3}
                  borderWidth="1px"
                  borderRadius="md"
                  borderColor={borderColor}
                  bg={bgColor}
                  borderLeftWidth={note.is_important ? '4px' : '1px'}
                  borderLeftColor={note.is_important ? 'orange.500' : borderColor}
                >
                  <HStack justify="space-between" mb={2}>
                    <HStack spacing={2}>
                      <Badge colorScheme="purple" fontSize="xs">
                        {getNoteTypeLabel(note.note_type)}
                      </Badge>
                      {note.is_important && (
                        <Badge colorScheme="orange" fontSize="xs">
                          {t('leadDetail.important')}
                        </Badge>
                      )}
                      <Text fontSize="xs" color="gray.500">
                        {formatDateTime(note.created_at)}
                      </Text>
                    </HStack>
                    <Text fontSize="xs" color="gray.500">
                      {note.created_by_name || '-'}
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.700">
                    {note.content}
                  </Text>
                </Box>
              ))}
            </VStack>
          )}
        </CardBody>
      </Card>

      {/* 编辑线索 Drawer */}
      <Drawer isOpen={isEditOpen} onClose={onEditClose} size="md" placement="right">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{t('leadDetail.editLead')}</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>{t('leadList.modal.name')}</FormLabel>
                <Input
                  value={editFormData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData({ ...editFormData, name: e.target.value })
                  }
                  placeholder={t('leadList.modal.namePlaceholder')}
                />
              </FormControl>

              <FormControl>
                <FormLabel>{t('leadList.modal.companyName')}</FormLabel>
                <Input
                  value={editFormData.company_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData({ ...editFormData, company_name: e.target.value })
                  }
                  placeholder={t('leadList.modal.companyNamePlaceholder')}
                />
              </FormControl>

              <FormControl>
                <FormLabel>{t('leadList.modal.contactName')}</FormLabel>
                <Input
                  value={editFormData.contact_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData({ ...editFormData, contact_name: e.target.value })
                  }
                  placeholder={t('leadList.modal.contactNamePlaceholder')}
                />
              </FormControl>

              <FormControl>
                <FormLabel>{t('leadList.modal.phone')}</FormLabel>
                <Input
                  value={editFormData.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData({ ...editFormData, phone: e.target.value })
                  }
                  placeholder={t('leadList.modal.phonePlaceholder')}
                />
              </FormControl>

              <FormControl>
                <FormLabel>{t('leadList.modal.email')}</FormLabel>
                <Input
                  type="email"
                  value={editFormData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData({ ...editFormData, email: e.target.value })
                  }
                  placeholder={t('leadList.modal.emailPlaceholder')}
                />
              </FormControl>

              <FormControl>
                <FormLabel>{t('leadList.modal.address')}</FormLabel>
                <Input
                  value={editFormData.address}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData({ ...editFormData, address: e.target.value })
                  }
                  placeholder={t('leadList.modal.addressPlaceholder')}
                />
              </FormControl>

              <FormControl>
                <FormLabel>{t('leadList.modal.customer')}</FormLabel>
                <Select
                  value={editFormData.customer_id}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setEditFormData({ ...editFormData, customer_id: e.target.value })
                  }
                  placeholder={t('leadList.modal.selectCustomer')}
                >
                  {customers.map((customer: Customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>{t('leadList.modal.owner')}</FormLabel>
                <Select
                  value={editFormData.owner_user_id}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setEditFormData({ ...editFormData, owner_user_id: e.target.value })
                  }
                  placeholder={t('leadList.modal.selectOwner')}
                >
                  {users.map((user: UserListItem) => (
                    <option key={user.id} value={user.id}>
                      {user.display_name || user.username}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>{t('leadList.modal.status')}</FormLabel>
                <Select
                  value={editFormData.status}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setEditFormData({ ...editFormData, status: e.target.value as LeadStatus })
                  }
                >
                  <option value="new">{t('leadList.status.new')}</option>
                  <option value="contacted">{t('leadList.status.contacted')}</option>
                  <option value="qualified">{t('leadList.status.qualified')}</option>
                  <option value="converted">{t('leadList.status.converted')}</option>
                  <option value="lost">{t('leadList.status.lost')}</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>{t('leadList.modal.level')}</FormLabel>
                <Input
                  value={editFormData.level}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData({ ...editFormData, level: e.target.value })
                  }
                  placeholder={t('leadList.modal.levelPlaceholder')}
                />
              </FormControl>

              <FormControl>
                <FormLabel>{t('leadList.modal.nextFollowUpAt')}</FormLabel>
                <Input
                  type="datetime-local"
                  value={editFormData.next_follow_up_at}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEditFormData({ ...editFormData, next_follow_up_at: e.target.value })
                  }
                />
              </FormControl>
            </VStack>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onEditClose}>
              {t('leadList.modal.cancel')}
            </Button>
            <Button colorScheme="blue" onClick={handleSaveEdit}>
              {t('leadList.modal.submit')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* 创建跟进记录 Drawer */}
      <Drawer isOpen={isFollowUpOpen} onClose={onFollowUpClose} size="md" placement="right">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{t('leadDetail.addFollowUp')}</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>{t('leadDetail.followUpTypeLabel')}</FormLabel>
                <Select
                  value={followUpFormData.follow_up_type}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setFollowUpFormData({ ...followUpFormData, follow_up_type: e.target.value as LeadFollowUpType })
                  }
                >
                  <option value="call">{t('leadDetail.followUpType.call')}</option>
                  <option value="meeting">{t('leadDetail.followUpType.meeting')}</option>
                  <option value="email">{t('leadDetail.followUpType.email')}</option>
                  <option value="note">{t('leadDetail.followUpType.note')}</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>{t('leadDetail.followUpDate')}</FormLabel>
                <Input
                  type="datetime-local"
                  value={followUpFormData.follow_up_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setFollowUpFormData({ ...followUpFormData, follow_up_date: e.target.value })
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>{t('leadDetail.followUpContent')}</FormLabel>
                <Textarea
                  value={followUpFormData.content || ''}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setFollowUpFormData({ ...followUpFormData, content: e.target.value })
                  }
                  placeholder={t('leadDetail.followUpContentPlaceholder')}
                  rows={4}
                />
              </FormControl>
            </VStack>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onFollowUpClose}>
              {t('leadList.modal.cancel')}
            </Button>
            <Button colorScheme="blue" onClick={handleCreateFollowUp}>
              {t('leadList.modal.submit')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* 创建备注 Drawer */}
      <Drawer isOpen={isNoteOpen} onClose={onNoteClose} size="md" placement="right">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{t('leadDetail.addNote')}</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>{t('leadDetail.noteTypeLabel')}</FormLabel>
                <Select
                  value={noteFormData.note_type}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setNoteFormData({ ...noteFormData, note_type: e.target.value as LeadNoteType })
                  }
                >
                  <option value="comment">{t('leadDetail.noteType.comment')}</option>
                  <option value="reminder">{t('leadDetail.noteType.reminder')}</option>
                  <option value="task">{t('leadDetail.noteType.task')}</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>{t('leadDetail.noteContent')}</FormLabel>
                <Textarea
                  value={noteFormData.content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setNoteFormData({ ...noteFormData, content: e.target.value })
                  }
                  placeholder={t('leadDetail.noteContentPlaceholder')}
                  rows={4}
                />
              </FormControl>

              <FormControl>
                <Checkbox
                  isChecked={noteFormData.is_important}
                  onChange={(e) =>
                    setNoteFormData({ ...noteFormData, is_important: e.target.checked })
                  }
                >
                  {t('leadDetail.isImportant')}
                </Checkbox>
              </FormControl>
            </VStack>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onNoteClose}>
              {t('leadList.modal.cancel')}
            </Button>
            <Button colorScheme="blue" onClick={handleCreateNote}>
              {t('leadList.modal.submit')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* 分配线索 Drawer */}
      <Drawer isOpen={isAssignOpen} onClose={onAssignClose} size="sm" placement="right">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{t('leadDetail.assign')}</DrawerHeader>
          <DrawerBody>
            <FormControl isRequired>
              <FormLabel>{t('leadDetail.selectOwner')}</FormLabel>
              <Select
                value={assignUserId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setAssignUserId(e.target.value)
                }
                placeholder={t('leadList.modal.selectOwner')}
              >
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
              {t('leadList.modal.cancel')}
            </Button>
            <Button colorScheme="blue" onClick={handleAssign}>
              {t('leadList.modal.submit')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}

export default LeadDetail