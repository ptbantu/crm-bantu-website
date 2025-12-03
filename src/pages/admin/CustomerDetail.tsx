/**
 * 客户详情页面
 * 显示客户信息、跟进记录、客户专员等
 */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Plus, Edit, Phone, Mail, Users, FileText, Calendar, Clock, UserCheck } from 'lucide-react'
import {
  getCustomerDetail,
  getCustomerFollowUps,
  createCustomerFollowUp,
} from '@/api/customers'
import {
  getContactListByCustomer,
  createContact,
  updateContact,
  deleteContact,
  CreateContactRequest,
  UpdateContactRequest,
} from '@/api/contacts'
import { Customer, CustomerFollowUp, CustomerFollowUpCreateRequest, CustomerFollowUpType } from '@/api/types'
import { Contact } from '@/api/types'
import { useToast } from '@/components/ToastContainer'
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Checkbox,
} from '@chakra-ui/react'

const CustomerDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { showSuccess, showError } = useToast()
  const { updateTabTitle } = useTabs()

  // Chakra UI 颜色模式
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  // 客户详情
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(false)

  // 跟进记录
  const [followUps, setFollowUps] = useState<CustomerFollowUp[]>([])
  const [loadingFollowUps, setLoadingFollowUps] = useState(false)

  // 客户专员
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loadingContacts, setLoadingContacts] = useState(false)

  // 弹窗状态
  const { isOpen: isFollowUpOpen, onOpen: onFollowUpOpen, onClose: onFollowUpClose } = useDisclosure()
  const { isOpen: isContactOpen, onOpen: onContactOpen, onClose: onContactClose } = useDisclosure()
  const { isOpen: isEditContactOpen, onOpen: onEditContactOpen, onClose: onEditContactClose } = useDisclosure()

  // 跟进记录表单
  const [followUpFormData, setFollowUpFormData] = useState<CustomerFollowUpCreateRequest>({
    follow_up_type: 'call',
    content: '',
    follow_up_date: new Date().toISOString().slice(0, 16),
    next_follow_up_at: undefined,
  })

  // 客户专员表单
  const [contactFormData, setContactFormData] = useState<CreateContactRequest>({
    customer_id: id || '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    mobile: '',
    wechat_id: '',
    position: '',
    department: '',
    contact_role: '',
    is_primary: false,
    is_decision_maker: false,
    is_active: true,
    notes: '',
  })
  const [editingContact, setEditingContact] = useState<Contact | null>(null)

  // 加载客户详情
  const loadCustomerDetail = async () => {
    if (!id) return
    setLoading(true)
    try {
      const customerData = await getCustomerDetail(id)
      setCustomer(customerData)
      // 更新标签页标题为客户名称
      updateTabTitle(`/admin/customer/detail/${id}`, customerData.name || id)
    } catch (error: any) {
      showError(error.message || t('customerDetail.error.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  // 加载跟进记录
  const loadFollowUps = async () => {
    if (!id) return
    setLoadingFollowUps(true)
    try {
      const data = await getCustomerFollowUps(id)
      setFollowUps(data)
    } catch (error: any) {
      showError(error.message || t('customerDetail.error.loadFollowUpsFailed'))
    } finally {
      setLoadingFollowUps(false)
    }
  }

  // 加载客户专员
  const loadContacts = async () => {
    if (!id) return
    setLoadingContacts(true)
    try {
      const result = await getContactListByCustomer(id, { page: 1, size: 100 })
      setContacts(result.records || [])
    } catch (error: any) {
      showError(error.message || t('customerDetail.error.loadContactsFailed'))
    } finally {
      setLoadingContacts(false)
    }
  }

  // 初始化加载
  useEffect(() => {
    if (id) {
      loadCustomerDetail()
      loadFollowUps()
      loadContacts()
    }
  }, [id])

  // 格式化日期时间
  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return '-'
    try {
      const date = new Date(dateString)
      return date.toLocaleString(i18n.language === 'zh-CN' ? 'zh-CN' : 'id-ID', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  // 获取跟进类型标签
  const getFollowUpTypeLabel = (type: CustomerFollowUpType) => {
    const typeMap: Record<CustomerFollowUpType, string> = {
      call: t('customerDetail.followUpType.call'),
      meeting: t('customerDetail.followUpType.meeting'),
      email: t('customerDetail.followUpType.email'),
      note: t('customerDetail.followUpType.note'),
      visit: t('customerDetail.followUpType.visit'),
      wechat: t('customerDetail.followUpType.wechat'),
      whatsapp: t('customerDetail.followUpType.whatsapp'),
    }
    return typeMap[type] || type
  }

  // 获取跟进类型图标组件
  const getFollowUpTypeIcon = (type: CustomerFollowUpType) => {
    const iconMap: Record<CustomerFollowUpType, React.ComponentType<{ size?: number; color?: string }>> = {
      call: Phone,
      meeting: Users,
      email: Mail,
      note: FileText,
      visit: Calendar,
      wechat: Users,
      whatsapp: Phone,
    }
    const IconComponent = iconMap[type] || FileText
    return IconComponent
  }

  // 创建跟进记录
  const handleCreateFollowUp = async () => {
    if (!id) return
    if (!followUpFormData.follow_up_date) {
      showError(t('customerDetail.error.followUpDateRequired'))
      return
    }

    try {
      await createCustomerFollowUp(id, {
        ...followUpFormData,
        follow_up_date: new Date(followUpFormData.follow_up_date).toISOString(),
        next_follow_up_at: followUpFormData.next_follow_up_at
          ? new Date(followUpFormData.next_follow_up_at).toISOString()
          : undefined,
      })
      showSuccess(t('customerDetail.success.createFollowUp'))
      onFollowUpClose()
      setFollowUpFormData({
        follow_up_type: 'call',
        content: '',
        follow_up_date: new Date().toISOString().slice(0, 16),
        next_follow_up_at: undefined,
      })
      loadFollowUps()
      loadCustomerDetail() // 更新客户信息
    } catch (error: any) {
      showError(error.message || t('customerDetail.error.createFollowUpFailed'))
    }
  }

  // 打开新增客户专员弹窗
  const handleAddContact = () => {
    setContactFormData({
      customer_id: id || '',
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      mobile: '',
      wechat_id: '',
      position: '',
      department: '',
      contact_role: '',
      is_primary: false,
      is_decision_maker: false,
      is_active: true,
      notes: '',
    })
    setEditingContact(null)
    onContactOpen()
  }

  // 打开编辑客户专员弹窗
  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact)
    setContactFormData({
      customer_id: id || '',
      first_name: contact.first_name || '',
      last_name: contact.last_name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      mobile: contact.mobile || '',
      wechat_id: contact.wechat_id || '',
      position: contact.position || '',
      department: contact.department || '',
      contact_role: contact.contact_role || '',
      is_primary: contact.is_primary || false,
      is_decision_maker: contact.is_decision_maker || false,
      is_active: contact.is_active !== false,
      notes: contact.notes || '',
    })
    onEditContactOpen()
  }

  // 保存客户专员
  const handleSaveContact = async () => {
    if (!id) return
    if (!contactFormData.first_name || !contactFormData.last_name) {
      showError(t('customerDetail.error.contactNameRequired'))
      return
    }

    try {
      if (editingContact) {
        const updateData: UpdateContactRequest = {
          first_name: contactFormData.first_name,
          last_name: contactFormData.last_name,
          email: contactFormData.email || null,
          phone: contactFormData.phone || null,
          mobile: contactFormData.mobile || null,
          wechat_id: contactFormData.wechat_id || null,
          position: contactFormData.position || null,
          department: contactFormData.department || null,
          contact_role: contactFormData.contact_role || null,
          is_primary: contactFormData.is_primary,
          is_decision_maker: contactFormData.is_decision_maker,
          is_active: contactFormData.is_active,
          notes: contactFormData.notes || null,
        }
        await updateContact(editingContact.id, updateData)
        showSuccess(t('customerDetail.success.updateContact'))
      } else {
        await createContact(contactFormData)
        showSuccess(t('customerDetail.success.createContact'))
      }
      onContactClose()
      onEditContactClose()
      loadContacts()
    } catch (error: any) {
      showError(error.message || t('customerDetail.error.saveContactFailed'))
    }
  }

  // 删除客户专员
  const handleDeleteContact = async (contact: Contact) => {
    if (!window.confirm(t('customerDetail.confirm.deleteContact', { name: `${contact.first_name} ${contact.last_name}` }))) {
      return
    }

    try {
      await deleteContact(contact.id)
      showSuccess(t('customerDetail.success.deleteContact'))
      loadContacts()
    } catch (error: any) {
      showError(error.message || t('customerDetail.error.deleteContactFailed'))
    }
  }

  if (loading) {
    return (
      <Box textAlign="center" py={12}>
        <Spinner size="lg" color="blue.500" />
        <Text mt={4} fontSize="sm" color="gray.500">{t('customerDetail.loading')}</Text>
      </Box>
    )
  }

  if (!customer) {
    return (
      <Box textAlign="center" py={12}>
        <Text fontSize="lg" color="gray.500">{t('customerDetail.notFound')}</Text>
        <Button mt={4} onClick={() => navigate('/admin/customer/list')}>
          {t('customerDetail.back')}
        </Button>
      </Box>
    )
  }

  return (
    <Box p={4}>
      {/* 返回按钮 */}
      <Button
        leftIcon={<ArrowLeft size={16} />}
        variant="ghost"
        size="sm"
        mb={4}
        onClick={() => navigate('/admin/customer/list')}
      >
        {t('customerDetail.back')}
      </Button>

      {/* 客户基本信息 */}
      <Card mb={4} bg={bgColor} borderColor={borderColor}>
        <CardBody>
          <HStack justify="space-between" mb={4}>
            <Text fontSize="xl" fontWeight="bold" color="gray.900">
              {customer.name}
            </Text>
            <Badge colorScheme={customer.customer_type === 'organization' ? 'blue' : 'green'} fontSize="sm">
              {customer.customer_type === 'organization' ? t('customerList.table.typeOrganization') : t('customerList.table.typeIndividual')}
            </Badge>
          </HStack>
          <VStack align="stretch" spacing={3}>
            <HStack>
              <Text fontSize="sm" color="gray.600" minW="100px">
                {t('customerList.detail.code')}:
              </Text>
              <Text fontSize="sm" color="gray.900">{customer.code || '-'}</Text>
            </HStack>
            <HStack>
              <Text fontSize="sm" color="gray.600" minW="100px">
                {t('customerList.detail.sourceType')}:
              </Text>
              <Text fontSize="sm" color="gray.900">
                {customer.customer_source_type === 'own' ? t('customerList.detail.own') : t('customerList.detail.agent')}
              </Text>
            </HStack>
            {customer.level_name_zh && (
              <HStack>
                <Text fontSize="sm" color="gray.600" minW="100px">
                  {t('customerList.detail.level')}:
                </Text>
                <Text fontSize="sm" color="gray.900">
                  {i18n.language.startsWith('zh') ? customer.level_name_zh : customer.level_name_id}
                </Text>
              </HStack>
            )}
            {customer.industry_name_zh && (
              <HStack>
                <Text fontSize="sm" color="gray.600" minW="100px">
                  {t('customerList.detail.industry')}:
                </Text>
                <Text fontSize="sm" color="gray.900">
                  {i18n.language.startsWith('zh') ? customer.industry_name_zh : customer.industry_name_id}
                </Text>
              </HStack>
            )}
            {customer.description && (
              <HStack align="start">
                <Text fontSize="sm" color="gray.600" minW="100px">
                  {t('customerList.detail.description')}:
                </Text>
                <Text fontSize="sm" color="gray.900" flex={1}>{customer.description}</Text>
              </HStack>
            )}
            {customer.last_follow_up_at && (
              <HStack>
                <Clock size={14} color="gray" />
                <Text fontSize="sm" color="gray.600">
                  {t('customerDetail.lastFollowUp')}: {formatDateTime(customer.last_follow_up_at)}
                </Text>
              </HStack>
            )}
            {customer.next_follow_up_at && (
              <HStack>
                <Calendar size={14} color="gray" />
                <Text fontSize="sm" color="gray.600">
                  {t('customerDetail.nextFollowUp')}: {formatDateTime(customer.next_follow_up_at)}
                </Text>
              </HStack>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* 跟进记录 */}
      <Card mb={4} bg={bgColor} borderColor={borderColor}>
        <CardBody>
          <HStack justify="space-between" mb={4}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
              {t('customerDetail.followUps')}
            </Text>
            <Button
              size="sm"
              colorScheme="blue"
              leftIcon={<Plus size={16} />}
              onClick={onFollowUpOpen}
            >
              {t('customerDetail.addFollowUp')}
            </Button>
          </HStack>
          {loadingFollowUps ? (
            <Box textAlign="center" py={4}>
              <Spinner size="sm" color="blue.500" />
              <Text mt={2} fontSize="sm" color="gray.500">{t('customerDetail.loading')}</Text>
            </Box>
          ) : followUps.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Text fontSize="sm" color="gray.500">{t('customerDetail.noFollowUps')}</Text>
            </Box>
          ) : (
            <Box position="relative" pl={8}>
              <Box
                position="absolute"
                left="15px"
                top="0"
                bottom="0"
                width="2px"
                bg="gray.200"
              />
              <VStack spacing={4} align="stretch">
                {followUps.map((followUp: CustomerFollowUp) => (
                  <Box key={followUp.id} position="relative">
                    <Box
                      position="absolute"
                      left="-23px"
                      top="4px"
                      width="16px"
                      height="16px"
                      borderRadius="full"
                      bg="blue.500"
                      borderWidth="2px"
                      borderColor="white"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      zIndex={1}
                    >
                      {(() => {
                        const IconComponent = getFollowUpTypeIcon(followUp.follow_up_type)
                        return <IconComponent size={10} color="white" />
                      })()}
                    </Box>
                    <Box
                      p={3}
                      borderWidth="1px"
                      borderRadius="md"
                      borderColor={borderColor}
                      bg={bgColor}
                      ml={2}
                    >
                      <HStack justify="space-between" mb={2}>
                        <HStack spacing={2}>
                          <Badge colorScheme="blue" fontSize="xs">
                            {getFollowUpTypeLabel(followUp.follow_up_type)}
                          </Badge>
                          <HStack spacing={1}>
                            <Clock size={12} color="gray" />
                            <Text fontSize="xs" color="gray.500">
                              {formatDateTime(followUp.follow_up_date)}
                            </Text>
                          </HStack>
                        </HStack>
                        <HStack spacing={1}>
                          <UserCheck size={12} color="gray" />
                          <Text fontSize="xs" color="gray.500">
                            {followUp.created_by_name || '-'}
                          </Text>
                        </HStack>
                      </HStack>
                      {followUp.content && (
                        <Text fontSize="sm" color="gray.700" mt={2}>
                          {followUp.content}
                        </Text>
                      )}
                      {followUp.next_follow_up_at && (
                        <HStack mt={2} spacing={1}>
                          <Calendar size={12} color="gray" />
                          <Text fontSize="xs" color="gray.500">
                            {t('customerDetail.nextFollowUp')}: {formatDateTime(followUp.next_follow_up_at)}
                          </Text>
                        </HStack>
                      )}
                    </Box>
                  </Box>
                ))}
              </VStack>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* 客户专员 */}
      <Card mb={4} bg={bgColor} borderColor={borderColor}>
        <CardBody>
          <HStack justify="space-between" mb={4}>
            <Text fontSize="lg" fontWeight="semibold" color="gray.900">
              {t('customerDetail.contacts')}
            </Text>
            <Button
              size="sm"
              colorScheme="blue"
              leftIcon={<Plus size={16} />}
              onClick={handleAddContact}
            >
              {t('customerDetail.addContact')}
            </Button>
          </HStack>
          {loadingContacts ? (
            <Box textAlign="center" py={4}>
              <Spinner size="sm" color="blue.500" />
              <Text mt={2} fontSize="sm" color="gray.500">{t('customerDetail.loading')}</Text>
            </Box>
          ) : contacts.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Text fontSize="sm" color="gray.500">{t('customerDetail.noContacts')}</Text>
            </Box>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>{t('contactList.table.name')}</Th>
                    <Th>{t('contactList.table.position')}</Th>
                    <Th>{t('contactList.table.contact')}</Th>
                    <Th>{t('contactList.table.role')}</Th>
                    <Th>{t('contactList.table.status')}</Th>
                    <Th>{t('contactList.table.actions')}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {contacts.map((contact) => (
                    <Tr key={contact.id}>
                      <Td>
                        <Text fontWeight="medium">
                          {contact.first_name} {contact.last_name}
                        </Text>
                        {contact.is_primary && (
                          <Badge colorScheme="green" fontSize="xs" ml={2}>
                            {t('contactList.table.primary')}
                          </Badge>
                        )}
                      </Td>
                      <Td>{contact.position || '-'}</Td>
                      <Td>
                        <VStack align="start" spacing={1}>
                          {contact.email && (
                            <HStack spacing={1}>
                              <Mail size={12} />
                              <Text fontSize="xs">{contact.email}</Text>
                            </HStack>
                          )}
                          {contact.mobile && (
                            <HStack spacing={1}>
                              <Phone size={12} />
                              <Text fontSize="xs">{contact.mobile}</Text>
                            </HStack>
                          )}
                        </VStack>
                      </Td>
                      <Td>
                        {contact.is_decision_maker && (
                          <Badge colorScheme="purple" fontSize="xs">
                            {t('contactList.table.decisionMaker')}
                          </Badge>
                        )}
                      </Td>
                      <Td>
                        {contact.is_active ? (
                          <Badge colorScheme="green" fontSize="xs">
                            {t('contactList.table.active')}
                          </Badge>
                        ) : (
                          <Badge colorScheme="gray" fontSize="xs">
                            {t('contactList.table.inactive')}
                          </Badge>
                        )}
                      </Td>
                      <Td>
                        <HStack spacing={1}>
                          <Button
                            size="xs"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => handleEditContact(contact)}
                          >
                            {t('contactList.actions.edit')}
                          </Button>
                          <Button
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleDeleteContact(contact)}
                          >
                            {t('contactList.actions.delete')}
                          </Button>
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </CardBody>
      </Card>

      {/* 创建跟进记录 Drawer */}
      <Drawer isOpen={isFollowUpOpen} onClose={onFollowUpClose} size="md" placement="right">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{t('customerDetail.addFollowUp')}</DrawerHeader>
          <DrawerBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>{t('customerDetail.followUpTypeLabel')}</FormLabel>
                <Select
                  value={followUpFormData.follow_up_type}
                  onChange={(e) =>
                    setFollowUpFormData({ ...followUpFormData, follow_up_type: e.target.value as CustomerFollowUpType })
                  }
                >
                  <option value="call">{t('customerDetail.followUpType.call')}</option>
                  <option value="meeting">{t('customerDetail.followUpType.meeting')}</option>
                  <option value="email">{t('customerDetail.followUpType.email')}</option>
                  <option value="note">{t('customerDetail.followUpType.note')}</option>
                  <option value="visit">{t('customerDetail.followUpType.visit')}</option>
                  <option value="wechat">{t('customerDetail.followUpType.wechat')}</option>
                  <option value="whatsapp">{t('customerDetail.followUpType.whatsapp')}</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>{t('customerDetail.followUpDate')}</FormLabel>
                <Input
                  type="datetime-local"
                  value={followUpFormData.follow_up_date}
                  onChange={(e) =>
                    setFollowUpFormData({ ...followUpFormData, follow_up_date: e.target.value })
                  }
                />
              </FormControl>
              <FormControl>
                <FormLabel>{t('customerDetail.followUpContent')}</FormLabel>
                <Textarea
                  value={followUpFormData.content || ''}
                  onChange={(e) =>
                    setFollowUpFormData({ ...followUpFormData, content: e.target.value })
                  }
                  placeholder={t('customerDetail.followUpContentPlaceholder')}
                  rows={4}
                />
              </FormControl>
              <FormControl>
                <FormLabel>{t('customerDetail.nextFollowUpAt')}</FormLabel>
                <Input
                  type="datetime-local"
                  value={followUpFormData.next_follow_up_at || ''}
                  onChange={(e) =>
                    setFollowUpFormData({
                      ...followUpFormData,
                      next_follow_up_at: e.target.value || undefined,
                    })
                  }
                />
              </FormControl>
            </VStack>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" mr={3} onClick={onFollowUpClose}>
              {t('common.cancel')}
            </Button>
            <Button colorScheme="blue" onClick={handleCreateFollowUp}>
              {t('common.save')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* 新增/编辑客户专员 Drawer */}
      <Drawer
        isOpen={isContactOpen || isEditContactOpen}
        onClose={() => {
          onContactClose()
          onEditContactClose()
        }}
        size="lg"
        placement="right"
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            {editingContact ? t('contactList.modal.editTitle') : t('contactList.modal.createTitle')}
          </DrawerHeader>
          <DrawerBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>{t('contactList.modal.firstName')}</FormLabel>
                <Input
                  value={contactFormData.first_name}
                  onChange={(e) =>
                    setContactFormData({ ...contactFormData, first_name: e.target.value })
                  }
                  placeholder={t('contactList.modal.firstNamePlaceholder')}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>{t('contactList.modal.lastName')}</FormLabel>
                <Input
                  value={contactFormData.last_name}
                  onChange={(e) =>
                    setContactFormData({ ...contactFormData, last_name: e.target.value })
                  }
                  placeholder={t('contactList.modal.lastNamePlaceholder')}
                />
              </FormControl>
              <FormControl>
                <FormLabel>{t('contactList.modal.email')}</FormLabel>
                <Input
                  type="email"
                  value={contactFormData.email || ''}
                  onChange={(e) =>
                    setContactFormData({ ...contactFormData, email: e.target.value })
                  }
                  placeholder={t('contactList.modal.emailPlaceholder')}
                />
              </FormControl>
              <FormControl>
                <FormLabel>{t('contactList.modal.mobile')}</FormLabel>
                <Input
                  value={contactFormData.mobile || ''}
                  onChange={(e) =>
                    setContactFormData({ ...contactFormData, mobile: e.target.value })
                  }
                  placeholder={t('contactList.modal.mobilePlaceholder')}
                />
              </FormControl>
              <FormControl>
                <FormLabel>{t('contactList.modal.phone')}</FormLabel>
                <Input
                  value={contactFormData.phone || ''}
                  onChange={(e) =>
                    setContactFormData({ ...contactFormData, phone: e.target.value })
                  }
                  placeholder={t('contactList.modal.phonePlaceholder')}
                />
              </FormControl>
              <FormControl>
                <FormLabel>{t('contactList.modal.wechatId')}</FormLabel>
                <Input
                  value={contactFormData.wechat_id || ''}
                  onChange={(e) =>
                    setContactFormData({ ...contactFormData, wechat_id: e.target.value })
                  }
                  placeholder={t('contactList.modal.wechatIdPlaceholder')}
                />
              </FormControl>
              <FormControl>
                <FormLabel>{t('contactList.modal.position')}</FormLabel>
                <Input
                  value={contactFormData.position || ''}
                  onChange={(e) =>
                    setContactFormData({ ...contactFormData, position: e.target.value })
                  }
                  placeholder={t('contactList.modal.positionPlaceholder')}
                />
              </FormControl>
              <FormControl>
                <FormLabel>{t('contactList.modal.department')}</FormLabel>
                <Input
                  value={contactFormData.department || ''}
                  onChange={(e) =>
                    setContactFormData({ ...contactFormData, department: e.target.value })
                  }
                  placeholder={t('contactList.modal.departmentPlaceholder')}
                />
              </FormControl>
              <FormControl>
                <Checkbox
                  isChecked={contactFormData.is_primary}
                  onChange={(e) =>
                    setContactFormData({ ...contactFormData, is_primary: e.target.checked })
                  }
                >
                  {t('contactList.modal.isPrimary')}
                </Checkbox>
              </FormControl>
              <FormControl>
                <Checkbox
                  isChecked={contactFormData.is_decision_maker}
                  onChange={(e) =>
                    setContactFormData({ ...contactFormData, is_decision_maker: e.target.checked })
                  }
                >
                  {t('contactList.modal.isDecisionMaker')}
                </Checkbox>
              </FormControl>
              <FormControl>
                <Checkbox
                  isChecked={contactFormData.is_active}
                  onChange={(e) =>
                    setContactFormData({ ...contactFormData, is_active: e.target.checked })
                  }
                >
                  {t('contactList.modal.isActive')}
                </Checkbox>
              </FormControl>
              <FormControl>
                <FormLabel>{t('contactList.modal.notes')}</FormLabel>
                <Textarea
                  value={contactFormData.notes || ''}
                  onChange={(e) =>
                    setContactFormData({ ...contactFormData, notes: e.target.value })
                  }
                  placeholder={t('contactList.modal.notesPlaceholder')}
                  rows={3}
                />
              </FormControl>
            </VStack>
          </DrawerBody>
          <DrawerFooter>
            <Button
              variant="outline"
              mr={3}
              onClick={() => {
                onContactClose()
                onEditContactClose()
              }}
            >
              {t('common.cancel')}
            </Button>
            <Button colorScheme="blue" onClick={handleSaveContact}>
              {t('common.save')}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}

export default CustomerDetail

