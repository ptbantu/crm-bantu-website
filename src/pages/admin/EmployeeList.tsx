/**
 * 人员列表页面
 * 支持条件查询、列表展示、分页
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Filter, X, User, Mail, Building2, Shield, CheckCircle2, XCircle, Eye, Phone, MapPin, MessageCircle, Calendar } from 'lucide-react'
import { getUserList, getOrganizationList, getRoleList, getUserDetail } from '@/api/users'
import { UserListParams, UserListItem, Organization, Role, UserDetail } from '@/api/types'
import { useToast } from '@/components/ToastContainer'
import { PageHeader } from '@/components/admin/PageHeader'
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
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
  Divider,
  SimpleGrid,
} from '@chakra-ui/react'

const EmployeeList = () => {
  const { t, i18n } = useTranslation()
  const { showError } = useToast()
  
  // Chakra UI 颜色模式
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  // 查询参数
  const [queryParams, setQueryParams] = useState<UserListParams>({
    page: 1,
    size: 10,
  })

  // 数据
  const [users, setUsers] = useState<UserListItem[]>([])
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pages, setPages] = useState(0)

  // 表单状态
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    organization_id: '',
    role_id: '',
    is_active: '' as '' | 'true' | 'false',
  })

  // 是否显示高级筛选
  const [showAdvanced, setShowAdvanced] = useState(false)

  // 详情弹窗状态
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  
  // 用户详情缓存（用于显示更多字段）
  const [userDetails, setUserDetails] = useState<Record<string, UserDetail>>({})

  // 加载组织和角色列表
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [orgs, roleList] = await Promise.all([
          getOrganizationList(),
          getRoleList(),
        ])
        setOrganizations(orgs)
        setRoles(roleList)
      } catch (error: any) {
        showError(t('employeeList.error.loadOptions'))
      }
    }
    loadOptions()
  }, [t, showError])

  // 加载用户列表
  const loadUsers = async (params: UserListParams) => {
    setLoading(true)
    try {
      const result = await getUserList(params)
      setUsers(result.records)
      setTotal(result.total)
      setCurrentPage(result.current)
      setPages(result.pages)
      
      // 加载用户详情以获取更多字段
      if (result.records.length > 0) {
        loadUserDetails(result.records.map(u => u.id))
      }
    } catch (error: any) {
      showError(error.message || t('employeeList.error.loadFailed'))
    } finally {
      setLoading(false)
    }
  }
  
  // 加载用户详情
  const loadUserDetails = async (userIds: string[]) => {
    try {
      const details: Record<string, UserDetail> = {}
      await Promise.all(
        userIds.map(async (id) => {
          try {
            const detail = await getUserDetail(id)
            details[id] = detail
          } catch {
            // 忽略单个用户加载失败
          }
        })
      )
      setUserDetails((prev) => ({ ...prev, ...details }))
    } catch {
      // 忽略加载失败
    }
  }

  // 初始加载
  useEffect(() => {
    loadUsers(queryParams)
  }, [])

  // 处理查询（所有查询都是模糊查询）
  const handleSearch = () => {
    const params: UserListParams = {
      page: 1,
      size: queryParams.size || 10,
    }

    // 所有文本查询都是模糊查询，直接传递参数（后端支持模糊查询）
    if (formData.username.trim()) {
      params.username = formData.username.trim()
    }
    if (formData.email.trim()) {
      params.email = formData.email.trim()
    }
    if (formData.organization_id) {
      params.organization_id = formData.organization_id
    }
    if (formData.role_id) {
      params.role_id = formData.role_id
    }
    if (formData.is_active !== '') {
      params.is_active = formData.is_active === 'true'
    }

    setQueryParams(params)
    loadUsers(params)
  }

  // 打开详情弹窗
  const handleViewDetail = async (userId: string) => {
    setSelectedUserId(userId)
    setShowDetailModal(true)
    setLoadingDetail(true)
    try {
      const detail = await getUserDetail(userId)
      setUserDetail(detail)
    } catch (error: any) {
      showError(error.message || t('employees.error.loadDetailFailed'))
      setShowDetailModal(false)
    } finally {
      setLoadingDetail(false)
    }
  }

  // 关闭详情弹窗
  const handleCloseDetail = () => {
    setShowDetailModal(false)
    setSelectedUserId(null)
    setUserDetail(null)
  }

  // 重置查询
  const handleReset = () => {
    setFormData({
      username: '',
      email: '',
      organization_id: '',
      role_id: '',
      is_active: '',
    })
    const defaultParams: UserListParams = {
      page: 1,
      size: 10,
    }
    setQueryParams(defaultParams)
    loadUsers(defaultParams)
  }

  // 分页
  const handlePageChange = (page: number) => {
    const params = { ...queryParams, page }
    setQueryParams(params)
    loadUsers(params)
  }

  return (
    <Box w="full">
        {/* 页面头部 */}
        <PageHeader
          icon={User}
          title={t('employeeList.title')}
          subtitle={t('employeeList.subtitle')}
        />

        {/* 查询表单 - 优化布局，更紧凑 */}
        <Card mb={4} variant="elevated" bg={bgColor} borderColor={borderColor}>
          <CardBody p={3}>
            <SimpleGrid columns={{ base: 2, md: 4, lg: 6 }} spacing={3}>
              {/* 用户名 */}
              <Box>
                <Text fontSize="11px" fontWeight="500" mb={1} color="var(--ali-text-secondary)">
                  {t('employeeList.search.username')}
                </Text>
                <InputGroup size="sm">
                  <InputLeftElement pointerEvents="none">
                    <User size={12} color="gray" />
                  </InputLeftElement>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder={t('employeeList.search.usernamePlaceholder')}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    bg="white"
                    borderColor="var(--ali-border)"
                    fontSize="13px"
                    _focus={{
                      borderColor: 'var(--ali-primary)',
                      boxShadow: '0 0 0 1px var(--ali-primary)',
                    }}
                  />
                </InputGroup>
              </Box>

              {/* 邮箱 */}
              <Box>
                <Text fontSize="11px" fontWeight="500" mb={1} color="var(--ali-text-secondary)">
                  {t('employeeList.search.email')}
                </Text>
                <InputGroup size="sm">
                  <InputLeftElement pointerEvents="none">
                    <Mail size={12} color="gray" />
                  </InputLeftElement>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t('employeeList.search.emailPlaceholder')}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    bg="white"
                    borderColor="var(--ali-border)"
                    fontSize="13px"
                    _focus={{
                      borderColor: 'var(--ali-primary)',
                      boxShadow: '0 0 0 1px var(--ali-primary)',
                    }}
                  />
                </InputGroup>
              </Box>

              {/* 状态 */}
              <Box>
                <Text fontSize="11px" fontWeight="500" mb={1} color="var(--ali-text-secondary)">
                  {t('employeeList.search.status')}
                </Text>
                <Select
                  size="sm"
                  value={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.value as '' | 'true' | 'false' })}
                  bg="white"
                  borderColor="var(--ali-border)"
                  fontSize="13px"
                  _focus={{
                    borderColor: 'var(--ali-primary)',
                    boxShadow: '0 0 0 1px var(--ali-primary)',
                  }}
                >
                  <option value="">{t('employeeList.search.allStatus')}</option>
                  <option value="true">{t('employeeList.search.active')}</option>
                  <option value="false">{t('employeeList.search.inactive')}</option>
                </Select>
              </Box>

              {/* 组织 */}
              <Box>
                <Text fontSize="11px" fontWeight="500" mb={1} color="var(--ali-text-secondary)">
                  {t('employeeList.search.organization')}
                </Text>
                <Select
                  size="sm"
                  value={formData.organization_id}
                  onChange={(e) => setFormData({ ...formData, organization_id: e.target.value })}
                  bg="white"
                  borderColor="var(--ali-border)"
                  fontSize="13px"
                  _focus={{
                    borderColor: 'var(--ali-primary)',
                    boxShadow: '0 0 0 1px var(--ali-primary)',
                  }}
                >
                  <option value="">{t('employeeList.search.allOrganizations')}</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </Select>
              </Box>

              {/* 角色 */}
              <Box>
                <Text fontSize="11px" fontWeight="500" mb={1} color="var(--ali-text-secondary)">
                  {t('employeeList.search.role')}
                </Text>
                <Select
                  size="sm"
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                  bg="white"
                  borderColor="var(--ali-border)"
                  fontSize="13px"
                  _focus={{
                    borderColor: 'var(--ali-primary)',
                    boxShadow: '0 0 0 1px var(--ali-primary)',
                  }}
                >
                  <option value="">{t('employeeList.search.allRoles')}</option>
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </Select>
              </Box>

              {/* 操作按钮 */}
              <Box>
                <Text fontSize="11px" fontWeight="500" mb={1} color="transparent">
                  {t('employeeList.search.search')}
                </Text>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleReset}
                    fontSize="12px"
                    borderColor="var(--ali-border)"
                    color="var(--ali-text-primary)"
                    _hover={{
                      bg: 'var(--ali-bg-light)',
                      borderColor: 'var(--ali-primary)',
                    }}
                  >
                    {t('employeeList.search.reset')}
                  </Button>
                  <Button
                    size="sm"
                    bg="var(--ali-primary)"
                    color="white"
                    leftIcon={<Search size={14} />}
                    onClick={handleSearch}
                    isLoading={loading}
                    fontSize="12px"
                    _hover={{
                      bg: 'var(--ali-primary-hover)',
                    }}
                  >
                    {t('employeeList.search.search')}
                  </Button>
                </HStack>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* 用户列表 */}
        {loading ? (
          <Card bg={bgColor} borderColor={borderColor}>
            <CardBody>
              <Flex justify="center" align="center" py={8}>
                <Spinner size="lg" color="blue.500" />
                <Text ml={4} color="gray.500">{t('employeeList.loading')}</Text>
              </Flex>
            </CardBody>
          </Card>
        ) : users.length === 0 ? (
          <Card bg={bgColor} borderColor={borderColor}>
            <CardBody>
              <VStack py={8} spacing={3}>
                <User size={48} color="gray" />
                <Text color="gray.500">{t('employeeList.noData')}</Text>
              </VStack>
            </CardBody>
          </Card>
        ) : (
          <>
            <Card variant="elevated" bg={bgColor} borderColor={borderColor} overflow="hidden">
              <CardHeader pb={2} pt={3} px={4} borderBottom="1px solid" borderColor="var(--ali-border)">
                <Heading size="sm" fontSize="14px" fontWeight="600" color="var(--ali-text-primary)">
                  {t('employeeList.table.title') || '人员列表'}
                </Heading>
              </CardHeader>
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead bg="var(--ali-bg-light)">
                    <Tr>
                      <Th fontSize="12px" fontWeight="600" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)">
                        {t('employeeList.table.username')}
                      </Th>
                      <Th fontSize="12px" fontWeight="600" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)">
                        {t('employeeList.table.displayName')}
                      </Th>
                      <Th fontSize="12px" fontWeight="600" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)">
                        {t('employeeList.table.email')}
                      </Th>
                      <Th fontSize="12px" fontWeight="600" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)">
                        {t('employeeList.table.phone') || '电话'}
                      </Th>
                      <Th fontSize="12px" fontWeight="600" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)">
                        {t('employeeList.table.whatsapp') || 'WhatsApp'}
                      </Th>
                      <Th fontSize="12px" fontWeight="600" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)">
                        {t('employeeList.table.organization')}
                      </Th>
                      <Th fontSize="12px" fontWeight="600" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)">
                        {t('employeeList.table.roles') || '角色'}
                      </Th>
                      <Th fontSize="12px" fontWeight="600" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)">
                        {t('employeeList.table.status')}
                      </Th>
                      <Th fontSize="12px" fontWeight="600" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)">
                        {t('employeeList.table.createdAt')}
                      </Th>
                      <Th fontSize="12px" fontWeight="600" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)" w={20}>
                        {t('employeeList.table.actions')}
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {users.map((user, index) => {
                      const isEven = index % 2 === 0
                      const userDetail = userDetails[user.id]
                      return (
                        <Tr 
                          key={user.id} 
                          bg={isEven ? 'white' : 'var(--ali-bg-light)'}
                          _hover={{ bg: 'var(--ali-primary-light)' }} 
                          transition="background-color 0.2s"
                        >
                          <Td fontSize="13px" color="var(--ali-text-primary)" fontWeight="medium" py={3} px={4} borderColor="var(--ali-border)">
                            {user.username}
                          </Td>
                          <Td fontSize="13px" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)">
                            {user.display_name || '-'}
                          </Td>
                          <Td fontSize="13px" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)">
                            <HStack spacing={1}>
                              <Mail size={12} color="var(--ali-text-secondary)" />
                              <Text>{user.email || '-'}</Text>
                            </HStack>
                          </Td>
                          <Td fontSize="12px" color="var(--ali-text-secondary)" py={3} px={4} borderColor="var(--ali-border)">
                            <HStack spacing={1}>
                              <Phone size={12} color="var(--ali-text-secondary)" />
                              <Text>{userDetail?.phone || user.phone || '-'}</Text>
                            </HStack>
                          </Td>
                          <Td fontSize="12px" color="var(--ali-text-secondary)" py={3} px={4} borderColor="var(--ali-border)">
                            {userDetail?.whatsapp || user.whatsapp || '-'}
                          </Td>
                          <Td fontSize="13px" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)">
                            <HStack spacing={1.5}>
                              <Building2 size={14} color="var(--ali-text-secondary)" />
                              <Text>{user.primary_organization_name || '-'}</Text>
                            </HStack>
                          </Td>
                          <Td fontSize="12px" py={3} px={4} borderColor="var(--ali-border)">
                            {user.roles && user.roles.length > 0 ? (
                              <HStack spacing={1} flexWrap="wrap">
                                {user.roles.map((role) => (
                                  <Badge key={role.id} colorScheme="blue" fontSize="10px" px={1.5} py={0.5}>
                                    {role.name}
                                  </Badge>
                                ))}
                              </HStack>
                            ) : (
                              <Text color="var(--ali-text-secondary)">-</Text>
                            )}
                          </Td>
                          <Td py={3} px={4} borderColor="var(--ali-border)">
                            {user.is_active ? (
                              <Badge colorScheme="green" fontSize="11px" px={2} py={1} borderRadius="4px">
                                {t('employeeList.table.active')}
                              </Badge>
                            ) : (
                              <Badge colorScheme="red" fontSize="11px" px={2} py={1} borderRadius="4px">
                                {t('employeeList.table.inactive')}
                              </Badge>
                            )}
                          </Td>
                          <Td fontSize="12px" color="var(--ali-text-secondary)" py={3} px={4} borderColor="var(--ali-border)">
                            {user.created_at
                              ? new Date(user.created_at).toLocaleDateString(i18n.language === 'id-ID' ? 'id-ID' : 'zh-CN')
                              : '-'}
                          </Td>
                          <Td py={3} px={4} borderColor="var(--ali-border)">
                            <Button
                              size="xs"
                              variant="ghost"
                              onClick={() => handleViewDetail(user.id)}
                              fontSize="12px"
                              color="var(--ali-primary)"
                              _hover={{
                                bg: 'var(--ali-primary-light)',
                              }}
                            >
                              {t('employeeList.table.detail')}
                            </Button>
                          </Td>
                        </Tr>
                      )
                    })}
                  </Tbody>
                </Table>
              </Box>
            </Card>

            {/* 分页 - 阿里云ECS风格 */}
            {pages > 1 && (
              <Flex 
                justify="space-between" 
                align="center" 
                px={4} 
                py={3} 
                mt={4}
                borderTop="1px solid" 
                borderColor="var(--ali-border)"
                bg="var(--ali-bg-light)"
                borderRadius="0 0 8px 8px"
              >
                <Text fontSize="12px" color="var(--ali-text-secondary)">
                  {t('employeeList.pagination.total', { total }) || `共 ${total} 条，第 ${currentPage} / ${pages} 页`}
                </Text>
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    isDisabled={currentPage === 1}
                    fontSize="12px"
                    variant="outline"
                    borderColor="var(--ali-border)"
                    color="var(--ali-text-primary)"
                    _hover={{
                      bg: 'var(--ali-bg-light)',
                      borderColor: 'var(--ali-primary)',
                    }}
                    _disabled={{
                      opacity: 0.4,
                      cursor: 'not-allowed',
                    }}
                  >
                    {t('employeeList.pagination.prev')}
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
                    const isActive = currentPage === pageNum
                    return (
                      <Button
                        key={pageNum}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        fontSize="12px"
                        bg={isActive ? 'var(--ali-primary)' : 'white'}
                        color={isActive ? 'white' : 'var(--ali-text-primary)'}
                        borderColor={isActive ? 'var(--ali-primary)' : 'var(--ali-border)'}
                        variant={isActive ? 'solid' : 'outline'}
                        _hover={{
                          bg: isActive ? 'var(--ali-primary-hover)' : 'var(--ali-bg-light)',
                          borderColor: 'var(--ali-primary)',
                        }}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                  <Button
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    isDisabled={currentPage >= pages}
                    fontSize="12px"
                    variant="outline"
                    borderColor="var(--ali-border)"
                    color="var(--ali-text-primary)"
                    _hover={{
                      bg: 'var(--ali-bg-light)',
                      borderColor: 'var(--ali-primary)',
                    }}
                    _disabled={{
                      opacity: 0.4,
                      cursor: 'not-allowed',
                    }}
                  >
                    {t('employeeList.pagination.next')}
                  </Button>
                </HStack>
              </Flex>
            )}
          </>
        )}

      {/* 详情弹窗 */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={handleCloseDetail}>
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 弹窗头部 */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 tracking-tight">
                {t('employees.detail.title')}
              </h2>
              <button
                onClick={handleCloseDetail}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-4">
              {loadingDetail ? (
                <div className="text-center py-6">
                  <div className="text-sm text-gray-500">{t('employeeList.loading')}</div>
                </div>
              ) : userDetail ? (
                <div className="space-y-4">
                  {/* 基本信息 */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2.5">
                      {t('employees.detail.basicInfo')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.username')}
                        </label>
                        <p className="text-sm text-gray-900">{userDetail.username}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.displayName')}
                        </label>
                        <p className="text-sm text-gray-900">{userDetail.display_name || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.email')}
                        </label>
                        <p className="text-sm text-gray-900 flex items-center space-x-1.5">
                          <Mail className="h-3.5 w-3.5 text-gray-400" />
                          <span>{userDetail.email || '-'}</span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.phone')}
                        </label>
                        <p className="text-sm text-gray-900 flex items-center space-x-1.5">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          <span>{userDetail.phone || '-'}</span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.status')}
                        </label>
                        <p className="text-sm">
                          {userDetail.is_active ? (
                            <span className="inline-flex items-center space-x-1 text-xs text-green-600">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              <span>{t('employees.table.active')}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 text-xs text-red-600">
                              <XCircle className="h-3.5 w-3.5" />
                              <span>{t('employees.table.inactive')}</span>
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.gender')}
                        </label>
                        <p className="text-sm text-gray-900">{userDetail.gender || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* 组织信息 */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2.5">
                      {t('employees.detail.organizationInfo')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.organization')}
                        </label>
                        <p className="text-sm text-gray-900 flex items-center space-x-1.5">
                          <Building2 className="h-3.5 w-3.5 text-gray-400" />
                          <span>{userDetail.primary_organization_name || '-'}</span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.roles')}
                        </label>
                        <div className="flex flex-wrap gap-1.5">
                          {userDetail.roles && userDetail.roles.length > 0 ? (
                            userDetail.roles.map((role) => (
                              <span
                                key={role.id}
                                className="inline-flex items-center space-x-1 px-2 py-0.5 text-xs font-medium text-primary-600 bg-primary-50 rounded"
                              >
                                <Shield className="h-3 w-3" />
                                <span>{role.name}</span>
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">-</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 联系信息 */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2.5">
                      {t('employees.detail.contactInfo')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.contactPhone')}
                        </label>
                        <p className="text-sm text-gray-900 flex items-center space-x-1.5">
                          <Phone className="h-3.5 w-3.5 text-gray-400" />
                          <span>{userDetail.contact_phone || '-'}</span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.whatsapp')}
                        </label>
                        <p className="text-sm text-gray-900 flex items-center space-x-1.5">
                          <MessageCircle className="h-3.5 w-3.5 text-gray-400" />
                          <span>{userDetail.whatsapp || '-'}</span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.wechat')}
                        </label>
                        <p className="text-sm text-gray-900">{userDetail.wechat || '-'}</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.address')}
                        </label>
                        <p className="text-sm text-gray-900 flex items-center space-x-1.5">
                          <MapPin className="h-3.5 w-3.5 text-gray-400" />
                          <span>{userDetail.address || '-'}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 其他信息 */}
                  {userDetail.bio && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 mb-2.5">
                        {t('employees.detail.bio')}
                      </h3>
                      <p className="text-sm text-gray-700 leading-relaxed">{userDetail.bio}</p>
                    </div>
                  )}

                  {/* 时间信息 */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2.5">
                      {t('employees.detail.timeInfo')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.createdAt')}
                        </label>
                        <p className="text-sm text-gray-900 flex items-center space-x-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span>
                            {userDetail.created_at
                              ? new Date(userDetail.created_at).toLocaleString('zh-CN')
                              : '-'}
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.updatedAt')}
                        </label>
                        <p className="text-sm text-gray-900 flex items-center space-x-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span>
                            {userDetail.updated_at
                              ? new Date(userDetail.updated_at).toLocaleString('zh-CN')
                              : '-'}
                          </span>
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-0.5">
                          {t('employees.detail.lastLoginAt')}
                        </label>
                        <p className="text-sm text-gray-900 flex items-center space-x-1.5">
                          <Calendar className="h-3.5 w-3.5 text-gray-400" />
                          <span>
                            {userDetail.last_login_at
                              ? new Date(userDetail.last_login_at).toLocaleString('zh-CN')
                              : '-'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-sm text-gray-500">{t('employees.error.loadDetailFailed')}</div>
                </div>
              )}
            </div>

            {/* 弹窗底部 */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 py-2.5 flex justify-end">
              <button
                onClick={handleCloseDetail}
                className="px-4 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('employees.detail.close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </Box>
  )
}

export default EmployeeList

