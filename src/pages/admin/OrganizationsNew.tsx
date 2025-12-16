/**
 * 组织管理页面 - ECS风格三段式布局
 * 左侧：组织列表 | 中间：核心信息面板 | 右侧：完整详情侧边栏
 */
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, Edit, Trash2, Building2, Mail, Phone, CheckCircle2, XCircle, Lock, Shield, ChevronRight, ChevronDown, Globe, Users, Calendar, MapPin } from 'lucide-react'
import {
  getOrganizationList,
  getOrganizationDetail,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  lockOrganization,
  unlockOrganization,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
} from '@/api/organizations'
import { OrganizationListParams, Organization, OrganizationDetail } from '@/api/types'
import { useToast } from '@/components/ToastContainer'
import { PageHeader } from '@/components/admin/PageHeader'
import EcsModal from '@/components/admin/EcsModal'
import OrganizationCreateWizard, { OrganizationFormData } from '@/components/admin/OrganizationCreateWizard'
import {
  Button,
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

const OrganizationsNew = () => {
  const { t } = useTranslation()
  const { showSuccess, showError } = useToast()
  
  // Chakra UI 颜色模式
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  // 搜索和筛选
  const [searchKeyword, setSearchKeyword] = useState('')
  const [filterType, setFilterType] = useState<'' | 'internal' | 'vendor' | 'agent'>('')
  const [filterStatus, setFilterStatus] = useState<'' | 'locked'>('')

  // 组织列表
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null)
  const [selectedOrgDetail, setSelectedOrgDetail] = useState<OrganizationDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // 弹窗状态
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editInitialData, setEditInitialData] = useState<Partial<OrganizationFormData> | undefined>()
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean
    type: 'delete' | 'lock' | 'unlock' | null
    org: Organization | null
  }>({
    open: false,
    type: null,
    org: null,
  })

  // 侧边栏折叠状态
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['contact', 'business']))

  // 处理创建
  const handleCreate = () => {
    setShowCreateModal(true)
  }

  // 处理编辑
  const handleEdit = () => {
    if (!selectedOrgDetail) return
    // 将OrganizationDetail转换为OrganizationFormData格式
    const initialData: Partial<OrganizationFormData> = {
      name: selectedOrgDetail.name,
      code: selectedOrgDetail.code || undefined,
      external_id: selectedOrgDetail.external_id || undefined,
      organization_type: selectedOrgDetail.organization_type,
      company_nature: selectedOrgDetail.company_nature || undefined,
      email: selectedOrgDetail.email || undefined,
      phone: selectedOrgDetail.phone || undefined,
      website: selectedOrgDetail.website || undefined,
      country: selectedOrgDetail.country || undefined,
      country_code: selectedOrgDetail.country_code || undefined,
      state_province: selectedOrgDetail.state_province || undefined,
      city: selectedOrgDetail.city || undefined,
      street: selectedOrgDetail.street || undefined,
      postal_code: selectedOrgDetail.postal_code || undefined,
      registration_number: selectedOrgDetail.registration_number || undefined,
      tax_id: selectedOrgDetail.tax_id || undefined,
      legal_representative: selectedOrgDetail.legal_representative || undefined,
      established_date: selectedOrgDetail.established_date || undefined,
      company_status: selectedOrgDetail.company_status || undefined,
      registered_capital: selectedOrgDetail.registered_capital || undefined,
      registered_capital_currency: selectedOrgDetail.registered_capital_currency || 'CNY',
      employee_count: selectedOrgDetail.employee_count || selectedOrgDetail.employees_count || undefined,
      company_size: selectedOrgDetail.company_size || undefined,
      industry: selectedOrgDetail.industry || undefined,
      industry_code: selectedOrgDetail.industry_code || undefined,
      sub_industry: selectedOrgDetail.sub_industry || undefined,
      business_scope: selectedOrgDetail.business_scope || undefined,
      description: selectedOrgDetail.description || undefined,
      is_active: selectedOrgDetail.is_active,
    }
    setEditInitialData(initialData)
    setShowEditModal(true)
  }

  // 提交表单（创建）
  const handleCreateSubmit = async (formData: OrganizationFormData) => {
    try {
      // 创建时不发送 code 和 external_id，由后端自动生成
      const { code, external_id, ...createData } = formData
      await createOrganization(createData as CreateOrganizationRequest)
      showSuccess(t('organizations.success.create'))
      setShowCreateModal(false)
      loadOrganizations()
    } catch (error: any) {
      showError(error.message || t('organizations.error.saveFailed'))
      throw error // 重新抛出以便向导组件处理
    }
  }

  // 提交表单（编辑）
  const handleEditSubmit = async (formData: OrganizationFormData) => {
    if (!selectedOrgDetail) return
    try {
      // 编辑时不发送 code 和 external_id，这些字段不允许修改
      const { code, external_id, ...updateData } = formData
      await updateOrganization(selectedOrgDetail.id, updateData as UpdateOrganizationRequest)
      showSuccess(t('organizations.success.update'))
      setShowEditModal(false)
      setEditInitialData(undefined)
      loadOrganizations()
      if (selectedOrgId) {
        loadOrganizationDetail(selectedOrgId)
      }
    } catch (error: any) {
      showError(error.message || t('organizations.error.saveFailed'))
      throw error // 重新抛出以便向导组件处理
    }
  }

  // 加载组织列表
  const loadOrganizations = async () => {
    setLoading(true)
    try {
      const params: OrganizationListParams = {
        page: 1,
        size: 20, // 默认分页大小
      }
      if (searchKeyword) params.name = searchKeyword
      if (filterType) params.organization_type = filterType

      const result = await getOrganizationList(params)
      setOrganizations(result.records)
      
      // 如果有更多数据，继续加载所有数据用于左侧列表展示
      if (result.total > result.records.length) {
        // 加载剩余数据
        const remainingPages = Math.ceil((result.total - result.records.length) / 20)
        const allRecords = [...result.records]
        
        for (let p = 2; p <= remainingPages + 1; p++) {
          const nextParams = { ...params, page: p, size: 20 }
          const nextResult = await getOrganizationList(nextParams)
          allRecords.push(...nextResult.records)
        }
        
        setOrganizations(allRecords)
      }
      
      // 如果有选中的组织，重新加载详情
      if (selectedOrgId) {
        loadOrganizationDetail(selectedOrgId)
      }
    } catch (error: any) {
      showError(error.message || t('organizations.error.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  // 加载组织详情
  const loadOrganizationDetail = async (orgId: string) => {
    setLoadingDetail(true)
    try {
      const detail = await getOrganizationDetail(orgId)
      setSelectedOrgDetail(detail)
      setSelectedOrgId(orgId)
    } catch (error: any) {
      showError(error.message || t('organizations.error.loadDetailFailed'))
    } finally {
      setLoadingDetail(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadOrganizations()
  }, [searchKeyword, filterType, filterStatus])

  // 过滤后的组织列表
  const filteredOrganizations = useMemo(() => {
    let filtered = organizations

    if (filterStatus === 'locked') {
      filtered = filtered.filter(org => org.is_locked)
    }

    return filtered
  }, [organizations, filterStatus])

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
        return 'blue'
      case 'vendor':
        return 'green'
      case 'agent':
        return 'purple'
      default:
        return 'gray'
    }
  }

  // 格式化金额
  const formatCurrency = (amount: number | null | undefined, currency: string | null | undefined = 'CNY') => {
    if (!amount) return '-'
    return `${amount.toLocaleString()} ${currency || 'CNY'}`
  }

  // 格式化日期
  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('zh-CN')
  }

  // 切换侧边栏折叠
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  // 切换分组展开/收起
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  // 打开确认弹窗
  const openConfirmModal = (type: 'delete' | 'lock' | 'unlock', org: Organization) => {
    setConfirmModal({ open: true, type, org })
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
      }
      setConfirmModal({ open: false, type: null, org: null })
      loadOrganizations()
      if (selectedOrgId === org.id) {
        loadOrganizationDetail(org.id)
      }
    } catch (error: any) {
      const errorKey = `organizations.error.${type}Failed` as const
      showError(error.message || t(errorKey))
    }
  }

  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* 页面头部 */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-6 py-3">
        <PageHeader
          icon={Building2}
          title={t('organizations.title')}
          subtitle={t('organizations.subtitle')}
          actions={
            <Button
              colorScheme="blue"
              leftIcon={<Plus size={16} />}
              onClick={handleCreate}
              size="sm"
            >
              {t('organizations.create')}
            </Button>
          }
        />
      </div>

      {/* 主内容区 - 三段式布局 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧：组织列表 */}
        <div className="w-[280px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
          {/* 搜索栏 */}
          <div className="p-3 border-b border-gray-200">
            <InputGroup size="sm">
              <InputLeftElement pointerEvents="none">
                <Search size={14} color="gray" />
              </InputLeftElement>
              <Input
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder={t('organizations.search.namePlaceholder')}
                className="text-[13px]"
              />
            </InputGroup>
          </div>

          {/* 筛选标签 */}
          <div className="p-2 border-b border-gray-200 flex flex-wrap gap-1">
            <Select
              size="xs"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as '' | 'internal' | 'vendor' | 'agent')}
              className="text-[11px] min-w-[80px]"
            >
              <option value="">{t('organizations.search.allTypes')}</option>
              <option value="internal">{t('organizations.type.internal')}</option>
              <option value="vendor">{t('organizations.type.vendor')}</option>
              <option value="agent">{t('organizations.type.agent')}</option>
            </Select>
            <Select
              size="xs"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as '' | 'locked')}
              className="text-[11px] min-w-[80px]"
            >
              <option value="">全部状态</option>
              <option value="locked">{t('organizations.table.locked')}</option>
            </Select>
          </div>

          {/* 组织列表 */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Spinner size="sm" />
              </div>
            ) : filteredOrganizations.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-xs">
                {t('organizations.noData')}
              </div>
            ) : (
              <div>
                {filteredOrganizations.map((org) => (
                  <div
                    key={org.id}
                    onClick={() => loadOrganizationDetail(org.id)}
                    className={`
                      h-12 px-3 flex items-center border-b border-gray-100 cursor-pointer transition-colors
                      ${selectedOrgId === org.id ? 'bg-blue-50 border-l-[3px] border-l-blue-500' : 'hover:bg-gray-50'}
                    `}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-gray-900 truncate">
                        {org.name}
                      </div>
                      <div className="text-[11px] text-gray-500 truncate">
                        {org.code || '-'} · {getOrganizationTypeLabel(org.organization_type)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 中间：核心信息面板 */}
        <div className="flex-1 overflow-y-auto bg-white">
          {!selectedOrgDetail ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Building2 size={48} className="mx-auto mb-4 text-gray-400" />
                <Text fontSize="sm">请从左侧选择一个组织</Text>
              </div>
            </div>
          ) : loadingDetail ? (
            <div className="flex items-center justify-center h-full">
              <Spinner size="lg" />
            </div>
          ) : (
            <div className="p-6">
              {/* 标题栏 */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-[16px] font-semibold text-gray-900 mb-1">
                    {selectedOrgDetail.name}
                  </h1>
                  <div className="flex items-center gap-2">
                    <Badge colorScheme={getOrganizationTypeColor(selectedOrgDetail.organization_type)} fontSize="xs">
                      {getOrganizationTypeLabel(selectedOrgDetail.organization_type)}
                    </Badge>
                    {selectedOrgDetail.is_active ? (
                      <Badge colorScheme="green" fontSize="xs">{t('organizations.table.active')}</Badge>
                    ) : (
                      <Badge colorScheme="red" fontSize="xs">{t('organizations.table.inactive')}</Badge>
                    )}
                    {selectedOrgDetail.is_locked && (
                      <Badge colorScheme="orange" fontSize="xs">{t('organizations.table.locked')}</Badge>
                    )}
                    {selectedOrgDetail.is_verified && (
                      <Badge colorScheme="blue" fontSize="xs">{t('organizations.table.verified')}</Badge>
                    )}
                  </div>
                </div>
                <HStack spacing={2}>
                  <Button size="sm" leftIcon={<Edit size={14} />} onClick={handleEdit}>
                    {t('organizations.edit')}
                  </Button>
                  {selectedOrgDetail.is_locked ? (
                    <Button size="sm" colorScheme="green" onClick={() => openConfirmModal('unlock', selectedOrgDetail)}>
                      {t('organizations.unlock')}
                    </Button>
                  ) : (
                    <Button size="sm" colorScheme="orange" onClick={() => openConfirmModal('lock', selectedOrgDetail)}>
                      {t('organizations.lock')}
                    </Button>
                  )}
                </HStack>
              </div>

              {/* 核心信息卡片组 */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* 卡片1：基础身份 */}
                <Card bg={bgColor} borderColor={borderColor}>
                  <CardBody p={3}>
                    <h3 className="text-[12px] font-semibold text-gray-700 mb-2">基础信息</h3>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-[11px] text-gray-500">代码</span>
                        <span className="text-[12px] text-gray-900">{selectedOrgDetail.code || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[11px] text-gray-500">外部ID</span>
                        <span className="text-[12px] text-gray-900">{selectedOrgDetail.external_id || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[11px] text-gray-500">类型/性质</span>
                        <span className="text-[12px] text-gray-900">
                          {getOrganizationTypeLabel(selectedOrgDetail.organization_type)}
                          {selectedOrgDetail.company_nature && ` / ${selectedOrgDetail.company_nature}`}
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* 卡片2：联系与状态 */}
                <Card bg={bgColor} borderColor={borderColor}>
                  <CardBody p={3}>
                    <h3 className="text-[12px] font-semibold text-gray-700 mb-2">联系与状态</h3>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-[11px] text-gray-500">邮箱/电话</span>
                        <span className="text-[12px] text-gray-900">
                          {selectedOrgDetail.email || '-'} | {selectedOrgDetail.phone || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[11px] text-gray-500">规模/人数</span>
                        <span className="text-[12px] text-gray-900">
                          {selectedOrgDetail.company_size || '-'} | {selectedOrgDetail.employee_count || selectedOrgDetail.employees_count || 0}人
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[11px] text-gray-500">状态</span>
                        <span className={`text-[12px] ${selectedOrgDetail.company_status === 'normal' ? 'text-green-600' : 'text-gray-900'}`}>
                          {selectedOrgDetail.company_status === 'normal' ? '● 正常' : selectedOrgDetail.company_status || '-'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[11px] text-gray-500">验证</span>
                        <span className="text-[12px] text-gray-900">
                          {selectedOrgDetail.is_verified ? '✅ 已验证' : '⭕ 未验证'}
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                {/* 卡片3：工商与财务关键指标 */}
                <Card bg={bgColor} borderColor={borderColor}>
                  <CardBody p={3}>
                    <h3 className="text-[12px] font-semibold text-gray-700 mb-2">工商概览</h3>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-[11px] text-gray-500">法人</span>
                        <span className="text-[12px] text-gray-900">{selectedOrgDetail.legal_representative || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[11px] text-gray-500">注册资本</span>
                        <span className="text-[12px] text-gray-900">
                          {formatCurrency(selectedOrgDetail.registered_capital, selectedOrgDetail.registered_capital_currency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[11px] text-gray-500">成立日期</span>
                        <span className="text-[12px] text-gray-900">{formatDate(selectedOrgDetail.established_date)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[11px] text-gray-500">营收(最新)</span>
                        <span className="text-[12px] text-gray-900">
                          {formatCurrency(selectedOrgDetail.annual_revenue, selectedOrgDetail.annual_revenue_currency)}
                          {selectedOrgDetail.revenue_year && ` (${selectedOrgDetail.revenue_year}年)`}
                        </span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          )}
        </div>

        {/* 右侧：完整详情侧边栏 */}
        {!sidebarCollapsed && selectedOrgDetail && (
          <div className="w-[400px] flex-shrink-0 bg-white border-l border-gray-200 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[14px] font-semibold text-gray-900">完整详情</h2>
                <IconButton
                  aria-label="收起侧边栏"
                  icon={<ChevronRight size={16} />}
                  size="xs"
                  variant="ghost"
                  onClick={toggleSidebar}
                />
              </div>

              {/* 联系与地址 */}
              <div className="mb-4">
                <button
                  onClick={() => toggleSection('contact')}
                  className="w-full flex items-center justify-between py-2 text-[12px] font-semibold text-gray-700 hover:text-gray-900"
                >
                  <span>联系与地址</span>
                  {expandedSections.has('contact') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                {expandedSections.has('contact') && (
                  <div className="pl-4 space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-gray-500">街道</span>
                      <span className="text-gray-900">{selectedOrgDetail.street || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">城市</span>
                      <span className="text-gray-900">{selectedOrgDetail.city || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">省/州</span>
                      <span className="text-gray-900">{selectedOrgDetail.state_province || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">国家</span>
                      <span className="text-gray-900">{selectedOrgDetail.country || '-'}</span>
                    </div>
                    {selectedOrgDetail.website && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">网站</span>
                        <a href={selectedOrgDetail.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                          {selectedOrgDetail.website}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 行业与资质 */}
              <div className="mb-4">
                <button
                  onClick={() => toggleSection('business')}
                  className="w-full flex items-center justify-between py-2 text-[12px] font-semibold text-gray-700 hover:text-gray-900"
                >
                  <span>行业与资质</span>
                  {expandedSections.has('business') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                {expandedSections.has('business') && (
                  <div className="pl-4 space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-gray-500">行业</span>
                      <span className="text-gray-900">{selectedOrgDetail.industry || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">子行业</span>
                      <span className="text-gray-900">{selectedOrgDetail.sub_industry || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">经营范围</span>
                      <span className="text-gray-900">{selectedOrgDetail.business_scope || '-'}</span>
                    </div>
                    {selectedOrgDetail.certifications && selectedOrgDetail.certifications.length > 0 && (
                      <div>
                        <span className="text-gray-500">资质认证</span>
                        <div className="mt-1 space-y-1">
                          {selectedOrgDetail.certifications.map((cert, idx) => (
                            <div key={idx} className="text-gray-900">{cert}</div>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedOrgDetail.business_license_url && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">营业执照</span>
                        <a href={selectedOrgDetail.business_license_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                          查看
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 工商详情 */}
              <div className="mb-4">
                <button
                  onClick={() => toggleSection('registration')}
                  className="w-full flex items-center justify-between py-2 text-[12px] font-semibold text-gray-700 hover:text-gray-900"
                >
                  <span>工商详情</span>
                  {expandedSections.has('registration') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                {expandedSections.has('registration') && (
                  <div className="pl-4 space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-gray-500">注册号</span>
                      <span className="text-gray-900">{selectedOrgDetail.registration_number || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">税号</span>
                      <span className="text-gray-900">{selectedOrgDetail.tax_id || '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">公司类型</span>
                      <span className="text-gray-900">{selectedOrgDetail.company_type || '-'}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 系统与元数据 */}
              <div className="mb-4">
                <button
                  onClick={() => toggleSection('system')}
                  className="w-full flex items-center justify-between py-2 text-[12px] font-semibold text-gray-700 hover:text-gray-900"
                >
                  <span>系统与元数据</span>
                  {expandedSections.has('system') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                {expandedSections.has('system') && (
                  <div className="pl-4 space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-gray-500">创建时间</span>
                      <span className="text-gray-900">{selectedOrgDetail.created_at ? new Date(selectedOrgDetail.created_at).toLocaleString() : '-'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">更新时间</span>
                      <span className="text-gray-900">{selectedOrgDetail.updated_at ? new Date(selectedOrgDetail.updated_at).toLocaleString() : '-'}</span>
                    </div>
                    {selectedOrgDetail.verified_by && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">验证人</span>
                        <span className="text-gray-900">{selectedOrgDetail.verified_by}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 侧边栏收起状态 */}
        {sidebarCollapsed && (
          <div className="w-8 flex-shrink-0 bg-white border-l border-gray-200 flex items-center justify-center">
            <IconButton
              aria-label="展开侧边栏"
              icon={<ChevronRight size={16} />}
              size="xs"
              variant="ghost"
              onClick={toggleSidebar}
            />
          </div>
        )}
      </div>

      {/* 确认弹窗 */}
      {confirmModal.type && confirmModal.org && (
        <EcsModal
          open={confirmModal.open}
          onClose={() => setConfirmModal({ open: false, type: null, org: null })}
          title={
            confirmModal.type === 'delete'
              ? t('organizations.confirm.delete', { name: confirmModal.org.name }).split('？')[0] + '？'
              : confirmModal.type === 'lock'
              ? t('organizations.confirm.lock', { name: confirmModal.org.name }).split('？')[0] + '？'
              : t('organizations.confirm.unlock', { name: confirmModal.org.name }).split('？')[0] + '？'
          }
          type="confirm"
          message={
            confirmModal.type === 'delete'
              ? t('organizations.confirm.delete', { name: confirmModal.org.name })
              : confirmModal.type === 'lock'
              ? t('organizations.confirm.lock', { name: confirmModal.org.name })
              : t('organizations.confirm.unlock', { name: confirmModal.org.name })
          }
          confirmText={
            confirmModal.type === 'delete'
              ? t('organizations.delete')
              : confirmModal.type === 'lock'
              ? t('organizations.lock')
              : t('organizations.unlock')
          }
          confirmButtonProps={{
            colorScheme: confirmModal.type === 'delete' ? 'red' : 'orange',
          }}
          onConfirm={handleConfirmAction}
        />
      )}

      {/* 创建向导弹窗 */}
      <OrganizationCreateWizard
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateSubmit}
        mode="create"
      />

      {/* 编辑向导弹窗 */}
      <OrganizationCreateWizard
        open={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setEditInitialData(undefined)
        }}
        onSubmit={handleEditSubmit}
        initialData={editInitialData}
        mode="edit"
      />
    </div>
  )
}

export default OrganizationsNew
