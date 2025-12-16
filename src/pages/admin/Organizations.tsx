/**
 * 组织管理页面
 * 支持三种组织类型的增删改查：internal（内部组织）、vendor（供应商）、agent（渠道代理）
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, Edit, Trash2, Building2, Mail, Phone, CheckCircle2, XCircle, Save, Eye, Globe, Users, Calendar, Lock, Shield } from 'lucide-react'
import {
  getOrganizationList,
  getOrganizationDetail,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  lockOrganization,
  unlockOrganization,
  enableOrganization,
  disableOrganization,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
} from '@/api/organizations'
import { OrganizationListParams, Organization, OrganizationDetail } from '@/api/types'
import { useToast } from '@/components/ToastContainer'
import { PageHeader } from '@/components/admin/PageHeader'
import EcsModal from '@/components/admin/EcsModal'
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

const Organizations = () => {
  const { t } = useTranslation()
  const { showSuccess, showError } = useToast()
  
  // Chakra UI 颜色模式
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  // 查询参数
  const [queryParams, setQueryParams] = useState<OrganizationListParams>({
    page: 1,
    size: 10,
  })

  // 数据
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pages, setPages] = useState(0)

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    organization_type: '' as '' | 'internal' | 'vendor' | 'agent',
    is_active: '' as '' | 'true' | 'false',
  })

  // 弹窗状态
  const [showModal, setShowModal] = useState(false)
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null)
  const [modalFormData, setModalFormData] = useState({
    name: '',
    code: '',
    organization_type: 'internal' as 'internal' | 'vendor' | 'agent',
    email: '',
    phone: '',
    is_active: true,
  })
  const [submitting, setSubmitting] = useState(false)

  // 详情弹窗状态
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)
  const [orgDetail, setOrgDetail] = useState<OrganizationDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // 确认弹窗状态
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean
    type: 'delete' | 'lock' | 'unlock' | 'disable' | null
    org: Organization | null
  }>({
    open: false,
    type: null,
    org: null,
  })

  // 加载组织列表
  const loadOrganizations = async (params: OrganizationListParams) => {
    setLoading(true)
    try {
      const result = await getOrganizationList(params)
      setOrganizations(result.records)
      setTotal(result.total)
      setCurrentPage(result.current)
      setPages(result.pages)
    } catch (error: any) {
      showError(error.message || t('organizations.error.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadOrganizations(queryParams)
  }, [])

  // 处理查询
  const handleSearch = () => {
    const params: OrganizationListParams = {
      page: 1,
      size: queryParams.size || 10,
    }

    if (formData.name.trim()) {
      params.name = formData.name.trim()
    }
    if (formData.code.trim()) {
      params.code = formData.code.trim()
    }
    if (formData.organization_type) {
      params.organization_type = formData.organization_type
    }
    if (formData.is_active !== '') {
      params.is_active = formData.is_active === 'true'
    }

    setQueryParams(params)
    loadOrganizations(params)
  }

  // 重置查询
  const handleReset = () => {
    setFormData({
      name: '',
      code: '',
      organization_type: '',
      is_active: '',
    })
    const defaultParams: OrganizationListParams = {
      page: 1,
      size: 10,
    }
    setQueryParams(defaultParams)
    loadOrganizations(defaultParams)
  }

  // 分页
  const handlePageChange = (page: number) => {
    const params = { ...queryParams, page }
    setQueryParams(params)
    loadOrganizations(params)
  }

  // 打开创建弹窗
  const handleCreate = () => {
    setEditingOrg(null)
    setModalFormData({
      name: '',
      code: '',
      organization_type: 'internal',
      email: '',
      phone: '',
      is_active: true,
    })
    setShowModal(true)
  }

  // 打开编辑弹窗
  const handleEdit = async (org: Organization) => {
    setEditingOrg(org)
    try {
      // 获取组织详情以获取完整信息
      const detail = await getOrganizationDetail(org.id)
      setModalFormData({
        name: detail.name,
        code: detail.code || '',
        organization_type: detail.organization_type,
        email: detail.email || '',
        phone: detail.phone || '',
        is_active: detail.is_active,
      })
      setShowModal(true)
    } catch (error: any) {
      showError(error.message || t('organizations.error.loadDetailFailed'))
    }
  }

  // 关闭弹窗
  const handleCloseModal = () => {
    setShowModal(false)
    setEditingOrg(null)
    setModalFormData({
      name: '',
      code: '',
      organization_type: 'internal',
      email: '',
      phone: '',
      is_active: true,
    })
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!modalFormData.name.trim()) {
      showError(t('organizations.validation.nameRequired'))
      return
    }

    setSubmitting(true)
    try {
      if (editingOrg) {
        // 更新组织
        const updateData: UpdateOrganizationRequest = {
          name: modalFormData.name.trim(),
          code: modalFormData.code || undefined,
          email: modalFormData.email || undefined,
          phone: modalFormData.phone || undefined,
          is_active: modalFormData.is_active,
        }
        await updateOrganization(editingOrg.id, updateData)
        showSuccess(t('organizations.success.update'))
      } else {
        // 创建组织
        const createData: CreateOrganizationRequest = {
          name: modalFormData.name.trim(),
          code: modalFormData.code || undefined,
          organization_type: modalFormData.organization_type,
          email: modalFormData.email || undefined,
          phone: modalFormData.phone || undefined,
          is_active: modalFormData.is_active,
        }
        await createOrganization(createData)
        showSuccess(t('organizations.success.create'))
      }
      handleCloseModal()
      loadOrganizations(queryParams)
    } catch (error: any) {
      showError(error.message || t('organizations.error.saveFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  // 打开确认弹窗
  const openConfirmModal = (type: 'delete' | 'lock' | 'unlock' | 'disable', org: Organization) => {
    setConfirmModal({ open: true, type, org })
  }

  // 关闭确认弹窗
  const closeConfirmModal = () => {
    setConfirmModal({ open: false, type: null, org: null })
  }

  // 确认操作
  const handleConfirmAction = async () => {
    if (!confirmModal.org || !confirmModal.type) return

    const { type, org } = confirmModal

    try {
      switch (type) {
        case 'delete':
          await deleteOrganization(org.id)
          showSuccess(t('organizations.success.delete'))
          break
        case 'lock':
          await lockOrganization(org.id)
          showSuccess(t('organizations.success.lock'))
          break
        case 'unlock':
          await unlockOrganization(org.id)
          showSuccess(t('organizations.success.unlock'))
          break
        case 'disable':
          await disableOrganization(org.id)
          showSuccess(t('organizations.success.disable'))
          break
      }
      closeConfirmModal()
      loadOrganizations(queryParams)
    } catch (error: any) {
      const errorKey = `organizations.error.${type}Failed` as const
      showError(error.message || t(errorKey))
    }
  }

  // 删除组织
  const handleDelete = (org: Organization) => {
    openConfirmModal('delete', org)
  }

  // 锁定组织
  const handleLock = (org: Organization) => {
    openConfirmModal('lock', org)
  }

  // 解锁组织
  const handleUnlock = (org: Organization) => {
    openConfirmModal('unlock', org)
  }

  // 启用组织
  const handleEnable = async (org: Organization) => {
    try {
      await enableOrganization(org.id)
      showSuccess(t('organizations.success.enable'))
      loadOrganizations(queryParams)
    } catch (error: any) {
      showError(error.message || t('organizations.error.enableFailed'))
    }
  }

  // 禁用组织
  const handleDisable = (org: Organization) => {
    openConfirmModal('disable', org)
  }

  // 打开详情弹窗
  const handleViewDetail = async (orgId: string) => {
    setSelectedOrgId(orgId)
    setShowDetailModal(true)
    setLoadingDetail(true)
    try {
      const detail = await getOrganizationDetail(orgId)
      setOrgDetail(detail)
    } catch (error: any) {
      showError(error.message || t('organizations.error.loadDetailFailed'))
      setShowDetailModal(false)
    } finally {
      setLoadingDetail(false)
    }
  }

  // 关闭详情弹窗
  const handleCloseDetail = () => {
    setShowDetailModal(false)
    setSelectedOrgId(null)
    setOrgDetail(null)
  }

  // 获取组织类型标签
  const getOrganizationTypeLabel = (type: string) => {
    switch (type) {
      case 'internal':
        return t('organizations.type.internal')
      case 'vendor':
        return t('organizations.type.vendor')
      case 'agent':
        return t('organizations.type.agent')
      default:
        return type
    }
  }

  // 获取组织类型颜色
  const getOrganizationTypeColor = (type: string) => {
    switch (type) {
      case 'internal':
        return 'bg-blue-50 text-blue-600'
      case 'vendor':
        return 'bg-green-50 text-green-600'
      case 'agent':
        return 'bg-purple-50 text-purple-600'
      default:
        return 'bg-gray-50 text-gray-600'
    }
  }

  // 获取组织类型颜色方案（用于 Chakra UI Badge）
  const getOrganizationTypeColorScheme = (type: string) => {
    switch (type) {
      case 'internal':
        return 'blue'
      case 'vendor':
        return 'green'
      case 'agent':
        return 'purple'
      default:
        return 'gray'
    }
  }

  return (
    <div className="w-full">
      {/* 页面头部 */}
      <PageHeader
        icon={Building2}
        title={t('organizations.title')}
        subtitle={t('organizations.subtitle')}
        actions={
          <Button
            colorScheme="primary"
            leftIcon={<Plus size={16} />}
            onClick={handleCreate}
            size="sm"
          >
            {t('organizations.create')}
          </Button>
        }
      />

      {/* 查询表单 */}
      <Card mb={4} bg={bgColor} borderColor={borderColor}>
        <CardBody>
          <HStack spacing={3} align="flex-end" flexWrap="wrap">
            {/* 组织名称 */}
            <Box flex={1} minW="150px">
              <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.700">
                {t('organizations.search.name')}
              </Text>
              <InputGroup size="sm">
                <InputLeftElement pointerEvents="none">
                  <Building2 size={14} color="gray" />
                </InputLeftElement>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('organizations.search.namePlaceholder')}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </InputGroup>
            </Box>

            {/* 组织编码 */}
            <Box flex={1} minW="150px">
              <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.700">
                {t('organizations.search.code')}
              </Text>
              <Input
                size="sm"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder={t('organizations.search.codePlaceholder')}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </Box>

            {/* 组织类型 */}
            <Box flex={1} minW="120px">
              <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.700">
                {t('organizations.search.type')}
              </Text>
              <Select
                size="sm"
                value={formData.organization_type}
                onChange={(e) => setFormData({ ...formData, organization_type: e.target.value as '' | 'internal' | 'vendor' | 'agent' })}
              >
                <option value="">{t('organizations.search.allTypes')}</option>
                <option value="internal">{t('organizations.type.internal')}</option>
                <option value="vendor">{t('organizations.type.vendor')}</option>
                <option value="agent">{t('organizations.type.agent')}</option>
              </Select>
            </Box>

            {/* 状态 */}
            <Box flex={1} minW="120px">
              <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.700">
                {t('organizations.search.status')}
              </Text>
              <Select
                size="sm"
                value={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value as '' | 'true' | 'false' })}
              >
                <option value="">{t('organizations.search.allStatus')}</option>
                <option value="true">{t('organizations.search.active')}</option>
                <option value="false">{t('organizations.search.inactive')}</option>
              </Select>
            </Box>

            {/* 操作按钮 */}
            <HStack spacing={2}>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReset}
              >
                {t('organizations.search.reset')}
              </Button>
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<Search size={14} />}
                onClick={handleSearch}
                isLoading={loading}
              >
                {t('organizations.search.search')}
              </Button>
            </HStack>
          </HStack>
        </CardBody>
      </Card>

      {/* 组织列表 */}
      {loading ? (
        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <Flex justify="center" align="center" py={8}>
              <Spinner size="lg" color="blue.500" />
              <Text ml={4} color="gray.500">{t('organizations.loading')}</Text>
            </Flex>
          </CardBody>
        </Card>
      ) : organizations.length === 0 ? (
        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <VStack py={8} spacing={3}>
              <Building2 size={48} color="gray" />
              <Text color="gray.500">{t('organizations.noData')}</Text>
            </VStack>
          </CardBody>
        </Card>
      ) : (
        <Card bg={bgColor} borderColor={borderColor} overflow="hidden">
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('organizations.table.name')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('organizations.table.code')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('organizations.table.type')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('organizations.table.email')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('organizations.table.phone')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('organizations.table.website')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('organizations.table.employees')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('organizations.table.status')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('organizations.table.actions')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {organizations.map((org) => (
                  <Tr key={org.id} _hover={{ bg: hoverBg }} transition="background-color 0.2s">
                    <Td fontSize="sm" color="gray.900" fontWeight="medium">{org.name}</Td>
                    <Td fontSize="sm" color="gray.600">{org.code || '-'}</Td>
                    <Td fontSize="sm">
                      <Badge colorScheme={getOrganizationTypeColorScheme(org.organization_type)} fontSize="xs">
                        {getOrganizationTypeLabel(org.organization_type)}
                      </Badge>
                    </Td>
                    <Td fontSize="sm" color="gray.600">
                      <HStack spacing={1}>
                        <Mail size={14} />
                        <Text>{org.email || '-'}</Text>
                      </HStack>
                    </Td>
                    <Td fontSize="sm" color="gray.600">
                      <HStack spacing={1}>
                        <Phone size={14} />
                        <Text>{org.phone || '-'}</Text>
                      </HStack>
                    </Td>
                    <Td fontSize="sm" color="gray.600">
                      {org.website ? (
                        <HStack spacing={1} as="a" href={org.website} target="_blank" rel="noopener noreferrer" color="blue.600" _hover={{ color: 'blue.700' }}>
                          <Globe size={14} />
                          <Text maxW="200px" isTruncated>{org.website}</Text>
                        </HStack>
                      ) : (
                        <Text>-</Text>
                      )}
                    </Td>
                    <Td fontSize="sm" color="gray.600">
                      <HStack spacing={1}>
                        <Users size={14} />
                        <Text>{org.employees_count ?? 0}</Text>
                      </HStack>
                    </Td>
                    <Td fontSize="sm">
                      <VStack spacing={0.5} align="flex-start">
                        {org.is_active ? (
                          <Badge colorScheme="green" fontSize="xs">
                            {t('organizations.table.active')}
                          </Badge>
                        ) : (
                          <Badge colorScheme="red" fontSize="xs">
                            {t('organizations.table.inactive')}
                          </Badge>
                        )}
                        {org.is_locked && (
                          <Badge colorScheme="orange" fontSize="xs">
                            {t('organizations.table.locked')}
                          </Badge>
                        )}
                        {org.is_verified && (
                          <Badge colorScheme="blue" fontSize="xs">
                            {t('organizations.table.verified')}
                          </Badge>
                        )}
                      </VStack>
                    </Td>
                    <Td fontSize="sm">
                      <HStack spacing={1}>
                        <IconButton
                          aria-label={t('organizations.detail.title')}
                          icon={<Eye size={14} />}
                          size="xs"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => handleViewDetail(org.id)}
                        />
                        <IconButton
                          aria-label={t('organizations.edit')}
                          icon={<Edit size={14} />}
                          size="xs"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => handleEdit(org)}
                        />
                        {org.is_active ? (
                          <IconButton
                            aria-label={t('organizations.disable')}
                            icon={<XCircle size={14} />}
                            size="xs"
                            variant="ghost"
                            colorScheme="orange"
                            onClick={() => handleDisable(org)}
                            title={t('organizations.disable')}
                          />
                        ) : (
                          <IconButton
                            aria-label={t('organizations.enable')}
                            icon={<CheckCircle2 size={14} />}
                            size="xs"
                            variant="ghost"
                            colorScheme="green"
                            onClick={() => handleEnable(org)}
                            title={t('organizations.enable')}
                          />
                        )}
                        {org.is_locked ? (
                          <IconButton
                            aria-label={t('organizations.unlock')}
                            icon={<Lock size={14} />}
                            size="xs"
                            variant="ghost"
                            colorScheme="yellow"
                            onClick={() => handleUnlock(org)}
                            title={t('organizations.unlock')}
                          />
                        ) : (
                          <IconButton
                            aria-label={t('organizations.lock')}
                            icon={<Lock size={14} />}
                            size="xs"
                            variant="ghost"
                            colorScheme="orange"
                            onClick={() => handleLock(org)}
                            title={t('organizations.lock')}
                          />
                        )}
                        <IconButton
                          aria-label={t('organizations.delete')}
                          icon={<Trash2 size={14} />}
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDelete(org)}
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
                {t('organizations.pagination.info', { current: currentPage, total: pages, size: queryParams.size || 10 })}
              </Text>
              <HStack spacing={1}>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  isDisabled={currentPage === 1}
                >
                  {t('organizations.pagination.prev')}
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
                  {t('organizations.pagination.next')}
                </Button>
              </HStack>
            </Flex>
          </CardBody>
        </Card>
      )}

      {/* 创建/编辑弹窗 */}
      <EcsModal
        open={showModal}
        onClose={handleCloseModal}
        title={editingOrg ? t('organizations.edit') : t('organizations.create')}
        width="large"
        type="form"
        onConfirm={handleSubmit}
        confirmText={t('organizations.save')}
        cancelText={t('organizations.cancel')}
        confirmButtonProps={{
          isLoading: submitting,
          leftIcon: <Save size={14} />,
        }}
      >
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('organizations.form.name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={modalFormData.name}
              onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('organizations.form.code')}
            </label>
            <input
              type="text"
              value={modalFormData.code}
              onChange={(e) => setModalFormData({ ...modalFormData, code: e.target.value })}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('organizations.form.type')} {!editingOrg && <span className="text-red-500">*</span>}
            </label>
            <select
              value={modalFormData.organization_type}
              onChange={(e) => setModalFormData({ ...modalFormData, organization_type: e.target.value as 'internal' | 'vendor' | 'agent' })}
              disabled={!!editingOrg}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white disabled:bg-gray-100"
            >
              <option value="internal">{t('organizations.type.internal')}</option>
              <option value="vendor">{t('organizations.type.vendor')}</option>
              <option value="agent">{t('organizations.type.agent')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('organizations.form.email')}
            </label>
            <div className="relative">
              <Mail className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="email"
                value={modalFormData.email}
                onChange={(e) => setModalFormData({ ...modalFormData, email: e.target.value })}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('organizations.form.phone')}
            </label>
            <div className="relative">
              <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="tel"
                value={modalFormData.phone}
                onChange={(e) => setModalFormData({ ...modalFormData, phone: e.target.value })}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
          <div>
            <label className="flex items-center space-x-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={modalFormData.is_active}
                onChange={(e) => setModalFormData({ ...modalFormData, is_active: e.target.checked })}
                className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-xs font-medium text-gray-700">
                {t('organizations.form.isActive')}
              </span>
            </label>
          </div>
        </div>
      </EcsModal>

      {/* 详情弹窗 */}
      <EcsModal
        open={showDetailModal}
        onClose={handleCloseDetail}
        title={t('organizations.detail.title')}
        width="large"
        showFooter={false}
      >
        {loadingDetail ? (
          <div className="p-6 text-center">
            <div className="text-sm text-gray-500">{t('organizations.loading')}</div>
          </div>
        ) : orgDetail ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 基本信息 */}
            <div className="space-y-2.5">
              <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-1.5">
                {t('organizations.detail.basicInfo')}
              </h3>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-0.5">
                  {t('organizations.table.name')}
                </label>
                <div className="text-sm text-gray-900 font-medium">{orgDetail.name}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-0.5">
                  {t('organizations.table.code')}
                </label>
                <div className="text-sm text-gray-900">{orgDetail.code || '-'}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-0.5">
                  {t('organizations.table.type')}
                </label>
                <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${getOrganizationTypeColor(orgDetail.organization_type)}`}>
                  {getOrganizationTypeLabel(orgDetail.organization_type)}
                </span>
              </div>
              {orgDetail.description && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-0.5">
                    {t('organizations.detail.description')}
                  </label>
                  <div className="text-sm text-gray-900 whitespace-pre-wrap">{orgDetail.description}</div>
                </div>
              )}
            </div>

            {/* 联系信息 */}
            <div className="space-y-2.5">
              <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-1.5">
                {t('organizations.detail.contactInfo')}
              </h3>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-0.5">
                  {t('organizations.table.email')}
                </label>
                <div className="flex items-center space-x-1.5 text-sm text-gray-900">
                  <Mail className="h-3.5 w-3.5 text-gray-400" />
                  <span>{orgDetail.email || '-'}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-0.5">
                  {t('organizations.table.phone')}
                </label>
                <div className="flex items-center space-x-1.5 text-sm text-gray-900">
                  <Phone className="h-3.5 w-3.5 text-gray-400" />
                  <span>{orgDetail.phone || '-'}</span>
                </div>
              </div>
              {orgDetail.website && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-0.5">
                    {t('organizations.table.website')}
                  </label>
                  <a
                    href={orgDetail.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1.5 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>{orgDetail.website}</span>
                  </a>
                </div>
              )}
            </div>

            {/* 状态信息 */}
            <div className="space-y-2.5">
              <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-1.5">
                {t('organizations.detail.statusInfo')}
              </h3>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-0.5">
                  {t('organizations.table.status')}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {orgDetail.is_active ? (
                    <span className="inline-flex items-center space-x-1 text-xs text-green-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>{t('organizations.table.active')}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 text-xs text-red-600">
                      <XCircle className="h-3.5 w-3.5" />
                      <span>{t('organizations.table.inactive')}</span>
                    </span>
                  )}
                  {orgDetail.is_locked && (
                    <span className="inline-flex items-center space-x-1 text-xs text-orange-600">
                      <Lock className="h-3 w-3" />
                      <span>{t('organizations.table.locked')}</span>
                    </span>
                  )}
                  {orgDetail.is_verified && (
                    <span className="inline-flex items-center space-x-1 text-xs text-blue-600">
                      <Shield className="h-3 w-3" />
                      <span>{t('organizations.table.verified')}</span>
                    </span>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-0.5">
                  {t('organizations.table.employees')}
                </label>
                <div className="flex items-center space-x-1.5 text-sm text-gray-900">
                  <Users className="h-3.5 w-3.5 text-gray-400" />
                  <span>{orgDetail.employees_count ?? 0}</span>
                </div>
              </div>
            </div>

            {/* 时间信息 */}
            <div className="space-y-2.5">
              <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-200 pb-1.5">
                {t('organizations.detail.timeInfo')}
              </h3>
              {orgDetail.created_at && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-0.5">
                    {t('organizations.detail.createdAt')}
                  </label>
                  <div className="flex items-center space-x-1.5 text-sm text-gray-900">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <span>{new Date(orgDetail.created_at).toLocaleString()}</span>
                  </div>
                </div>
              )}
              {orgDetail.updated_at && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-0.5">
                    {t('organizations.detail.updatedAt')}
                  </label>
                  <div className="flex items-center space-x-1.5 text-sm text-gray-900">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <span>{new Date(orgDetail.updated_at).toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </EcsModal>

      {/* 确认弹窗 */}
      {confirmModal.type && confirmModal.org && (() => {
        const getConfirmConfig = () => {
          const orgName = confirmModal.org!.name
          const confirmMsg = 
            confirmModal.type === 'delete'
              ? t('organizations.confirm.delete', { name: orgName })
              : confirmModal.type === 'lock'
              ? t('organizations.confirm.lock', { name: orgName })
              : confirmModal.type === 'unlock'
              ? t('organizations.confirm.unlock', { name: orgName })
              : t('organizations.confirm.disable', { name: orgName })
          
          // 从消息中提取标题（去掉组织名称和问号后的内容）
          const title = confirmMsg.split('？')[0] + '？'
          
          switch (confirmModal.type) {
            case 'delete':
              return {
                title,
                message: confirmMsg,
                confirmText: t('organizations.delete'),
                colorScheme: 'red' as const,
              }
            case 'lock':
              return {
                title,
                message: confirmMsg,
                confirmText: t('organizations.lock'),
                colorScheme: 'orange' as const,
              }
            case 'unlock':
              return {
                title,
                message: confirmMsg,
                confirmText: t('organizations.unlock'),
                colorScheme: 'blue' as const,
              }
            case 'disable':
              return {
                title,
                message: confirmMsg,
                confirmText: t('organizations.disable'),
                colorScheme: 'red' as const,
              }
            default:
              return {
                title: t('organizations.confirm'),
                message: '',
                confirmText: t('organizations.confirm'),
                colorScheme: 'blue' as const,
              }
          }
        }
        const config = getConfirmConfig()
        return (
          <EcsModal
            open={confirmModal.open}
            onClose={closeConfirmModal}
            title={config.title}
            type="confirm"
            message={config.message}
            confirmText={config.confirmText}
            confirmButtonProps={{ colorScheme: config.colorScheme }}
            onConfirm={handleConfirmAction}
          />
        )
      })()}
    </div>
  )
}

export default Organizations

