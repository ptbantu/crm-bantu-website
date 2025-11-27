/**
 * 人员管理页面
 * 左侧：组织列表 + 人员列表
 * 右侧：添加/编辑人员表单（侧边栏）
 */
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, Edit, Trash2, User, Building2, Eye, EyeOff, Key } from 'lucide-react'
import {
  getUserList,
  getRoleList,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  CreateUserRequest,
  UpdateUserRequest,
} from '@/api/users'
import { getOrganizationList } from '@/api/organizations'
import { UserListParams, UserListItem, Organization, Role } from '@/api/types'
import { useToast } from '@/components/ToastContainer'
import { PageHeader } from '@/components/admin/PageHeader'
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
  InputRightElement,
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
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  DrawerCloseButton,
  FormControl,
  FormLabel,
  Switch,
  Checkbox,
  Divider,
  useDisclosure,
} from '@chakra-ui/react'

const EmployeeManagement = () => {
  const { } = useTranslation()
  const { showSuccess, showError } = useToast()
  
  // Chakra UI 颜色模式
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const selectedBg = useColorModeValue('blue.50', 'blue.900')
  const selectedBorder = useColorModeValue('blue.200', 'blue.700')
  
  // Drawer 控制
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  // 选中的组织
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null)
  
  // 查询参数
  const [queryParams, setQueryParams] = useState<UserListParams>({
    page: 1,
    size: 20,
  })
  
  // 搜索关键词
  const [searchKeyword, setSearchKeyword] = useState('')
  
  // 数据
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [users, setUsers] = useState<UserListItem[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingOrgs, setLoadingOrgs] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pages, setPages] = useState(0)
  
  // 表单状态
  const [editingUser, setEditingUser] = useState<UserListItem | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '',
    display_name: '',
    gender: '',
    role_ids: [] as string[],
    is_active: true,
  })
  const [submitting, setSubmitting] = useState(false)
  
  // 密码显示/隐藏状态
  const [showPassword, setShowPassword] = useState(false)
  
  // 用户详情（用于显示完整信息）
  const [userDetails, setUserDetails] = useState<Record<string, any>>({})

  // 加载组织列表
  useEffect(() => {
    const loadOrganizations = async () => {
      setLoadingOrgs(true)
      try {
        const result = await getOrganizationList({ page: 1, size: 100 })
        setOrganizations(result.records)
        // 默认选中第一个组织
        if (result.records.length > 0 && !selectedOrganization) {
          setSelectedOrganization(result.records[0])
        }
      } catch (error: any) {
        showError(error.message || '加载组织列表失败')
      } finally {
        setLoadingOrgs(false)
      }
    }
    loadOrganizations()
  }, [])

  // 加载角色列表
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const roleList = await getRoleList()
        setRoles(roleList)
      } catch (error: any) {
        showError(error.message || '加载角色列表失败')
      }
    }
    loadRoles()
  }, [])

  // 当选中组织变化时，加载该组织的人员列表
  useEffect(() => {
    if (selectedOrganization) {
      const params: UserListParams = {
        page: 1,
        size: 20,
        organization_id: selectedOrganization.id,
      }
      if (searchKeyword) {
        // 如果有关键词，尝试匹配用户名或邮箱
        // 注意：API可能不支持模糊搜索，这里先按精确匹配
      }
      loadUsers(params)
    } else {
      setUsers([])
      setTotal(0)
    }
  }, [selectedOrganization, searchKeyword])

  // 当用户列表加载后，加载用户详情
  useEffect(() => {
    if (users.length > 0) {
      const userIds = users.map((u: UserListItem) => u.id)
      loadUserDetails(userIds)
    }
  }, [users])

  // 当 Drawer 打开且为新增模式时，确保表单数据为空
  useEffect(() => {
    if (isOpen && !editingUser) {
      // 强制清空所有表单字段
      setFormData({
        username: '',
        email: '',
        password: '',
        phone: '',
        display_name: '',
        gender: '',
        role_ids: [],
        is_active: true,
      })
      // 重置密码显示状态
      setShowPassword(false)
    }
  }, [isOpen, editingUser])

  // 加载用户列表
  const loadUsers = async (params: UserListParams) => {
    setLoading(true)
    try {
      const result = await getUserList(params)
      setUsers(result.records)
      setTotal(result.total)
      setCurrentPage(result.current)
      setPages(result.pages)
    } catch (error: any) {
      showError(error.message || '加载人员列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 处理组织选择
  const handleOrganizationSelect = (org: Organization) => {
    setSelectedOrganization(org)
    setSearchKeyword('')
    setQueryParams({ page: 1, size: 20 })
  }

  // 处理搜索
  const handleSearch = () => {
    if (selectedOrganization) {
      const params: UserListParams = {
        page: 1,
        size: 20,
        organization_id: selectedOrganization.id,
        username: searchKeyword || undefined,
        email: searchKeyword || undefined,
      }
      loadUsers(params)
      setQueryParams(params)
    }
  }

  // 邮箱验证正则
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  // 验证邮箱格式
  const validateEmail = (email: string): boolean => {
    return emailRegex.test(email)
  }

  // 处理邮箱输入变化
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value
    setFormData((prev: typeof formData) => {
      // 如果是新增模式，自动填充密码（邮箱去掉@后缀 + bantu）
      const newPassword = !editingUser && email.includes('@') 
        ? email.split('@')[0] + 'bantu'
        : prev.password
      return {
        ...prev,
        email,
        password: newPassword,
      }
    })
  }

  // 打开添加表单
  const handleAdd = () => {
    if (!selectedOrganization) {
      showError('请先选择一个组织')
      return
    }
    // 先清空编辑用户状态
    setEditingUser(null)
    // 强制清空表单数据
    setFormData({
      username: '',
      email: '',
      password: '',
      phone: '',
      display_name: '',
      gender: '',
      role_ids: [],
      is_active: true,
    })
    // 打开 Drawer
    onOpen()
  }

  // 加载用户详情（用于显示完整信息）
  const loadUserDetails = async (userIds: string[]) => {
    try {
      const { getUserDetail } = await import('@/api/users')
      const details: Record<string, any> = {}
      await Promise.all(
        userIds.map(async (id) => {
          try {
            const detail = await getUserDetail(id as string)
            details[id as string] = detail
          } catch {
            // 忽略单个用户加载失败
          }
        })
      )
      setUserDetails((prev: Record<string, any>) => ({ ...prev, ...details }))
    } catch {
      // 忽略加载失败
    }
  }

  // 打开编辑表单
  const handleEdit = async (user: UserListItem) => {
    try {
      // 获取用户详情以获取完整信息
      const { getUserDetail } = await import('@/api/users')
      const userDetail = await getUserDetail(user.id)
      setEditingUser(user)
      setFormData({
        username: userDetail.username,
        email: userDetail.email || '',
        password: '', // 编辑时不显示密码
        phone: userDetail.phone || '',
        display_name: userDetail.display_name || '',
        gender: userDetail.gender || '',
        role_ids: userDetail.roles?.map(r => r.id) || [],
        is_active: userDetail.is_active,
      })
      onOpen()
    } catch (error: any) {
      showError(error.message || '加载用户详情失败')
    }
  }

  // 关闭表单
  const handleClose = () => {
    // 先关闭 Drawer
    onClose()
    // 然后清空状态
    setTimeout(() => {
      setEditingUser(null)
      setFormData({
        username: '',
        email: '',
        password: '',
        phone: '',
        display_name: '',
        gender: '',
        role_ids: [],
        is_active: true,
      })
    }, 100) // 等待 Drawer 关闭动画完成
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!selectedOrganization) {
      showError('请先选择一个组织')
      return
    }

    // 验证必填字段顺序：用户名 -> 邮箱 -> 密码 -> 角色
    
    // 1. 验证用户名（新增时必填）
    if (!editingUser && !formData.username.trim()) {
      showError('请输入用户名')
      return
    }
    
    // 2. 验证邮箱（必填）
    if (!formData.email.trim()) {
      showError('请输入邮箱')
      return
    }
    
    // 验证邮箱格式
    if (!validateEmail(formData.email.trim())) {
      showError('请输入有效的邮箱地址')
      return
    }
    
    // 3. 验证密码（新增时必填）
    if (!editingUser && !formData.password.trim()) {
      showError('请输入密码')
      return
    }
    
    // 验证密码长度（至少8位）
    if (!editingUser && formData.password.trim().length < 8) {
      showError('密码长度至少需要8位')
      return
    }
    
    // 4. 验证角色（必填）
    if (formData.role_ids.length === 0) {
      showError('请至少选择一个角色')
      return
    }

    setSubmitting(true)
    try {
      if (editingUser) {
        // 更新用户
        const updateData: UpdateUserRequest = {
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          display_name: formData.display_name.trim() || undefined,
          gender: formData.gender || undefined,
          organization_id: selectedOrganization.id,
          role_ids: formData.role_ids,
          is_active: formData.is_active,
        }
        await updateUser(editingUser.id, updateData)
        showSuccess('更新成功')
      } else {
        // 创建用户（只需要必填字段）
        const createData: CreateUserRequest = {
          username: formData.username.trim(),
          email: formData.email.trim(),
          password: formData.password.trim(),
          display_name: formData.display_name.trim() || undefined,
          organization_id: selectedOrganization.id,
          role_ids: formData.role_ids,
          is_active: formData.is_active,
        }
        await createUser(createData)
        showSuccess('创建成功')
      }
      handleClose()
      // 重新加载用户列表
      if (selectedOrganization) {
        loadUsers({
          page: currentPage,
          size: 20,
          organization_id: selectedOrganization.id,
        })
      }
    } catch (error: any) {
      showError(error.message || '保存失败')
    } finally {
      setSubmitting(false)
    }
  }

  // 删除用户
  const handleDelete = async (user: UserListItem) => {
    if (!window.confirm(`确定要删除用户 "${user.username}" 吗？`)) {
      return
    }

    try {
      await deleteUser(user.id)
      showSuccess('删除成功')
      // 重新加载用户列表
      if (selectedOrganization) {
        loadUsers({
          page: currentPage,
          size: 20,
          organization_id: selectedOrganization.id,
        })
      }
    } catch (error: any) {
      showError(error.message || '删除失败')
    }
  }

  // 重置密码
  const handleResetPassword = async (user: UserListItem) => {
    if (!window.confirm(`确定要将用户 "${user.username}" 的密码重置为 "bantuqifu123" 吗？`)) {
      return
    }

    try {
      await resetUserPassword(user.id, 'bantuqifu123')
      showSuccess('密码重置成功')
    } catch (error: any) {
      showError(error.message || '密码重置失败')
    }
  }

  // 切换角色选择
  const toggleRole = (roleId: string) => {
    setFormData((prev: typeof formData) => ({
      ...prev,
      role_ids: prev.role_ids.includes(roleId)
        ? prev.role_ids.filter((id: string) => id !== roleId)
        : [...prev.role_ids, roleId],
    }))
  }

  // 分页
  const handlePageChange = (page: number) => {
    if (selectedOrganization) {
      const params: UserListParams = {
        ...queryParams,
        page,
        organization_id: selectedOrganization.id,
      }
      loadUsers(params)
      setQueryParams(params)
    }
  }

  return (
    <Box w="full" h="calc(100vh - 120px)" display="flex" flexDirection="column">
      {/* 页面头部 */}
      <PageHeader
        icon={User}
        title="人员管理"
        subtitle="管理组织内的人员信息"
      />

      {/* 主内容区域 */}
      <Flex flex={1} gap={4} mt={4} overflow="hidden">
        {/* 左侧：组织列表 */}
        <Card w="300px" flexShrink={0} bg={bgColor} borderColor={borderColor}>
          <CardBody p={4}>
            <VStack spacing={4} align="stretch">
              {/* 搜索框 */}
              <InputGroup size="sm">
                <InputLeftElement pointerEvents="none">
                  <Search size={16} color="gray" />
                </InputLeftElement>
                <Input
                  placeholder="通过名称搜索"
                  bg={useColorModeValue('gray.50', 'gray.800')}
                  borderColor={borderColor}
                />
              </InputGroup>

              {/* 组织列表 */}
              <VStack spacing={1} align="stretch" maxH="calc(100vh - 280px)" overflowY="auto">
                {loadingOrgs ? (
                  <Flex justify="center" py={4}>
                    <Spinner size="sm" />
                  </Flex>
                ) : organizations.length === 0 ? (
                  <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                    暂无组织
                  </Text>
                ) : (
                  organizations.map((org: Organization) => (
                    <Box
                      key={org.id}
                      p={3}
                      borderRadius="md"
                      cursor="pointer"
                      bg={selectedOrganization?.id === org.id ? selectedBg : 'transparent'}
                      borderWidth={selectedOrganization?.id === org.id ? 2 : 1}
                      borderColor={selectedOrganization?.id === org.id ? selectedBorder : borderColor}
                      _hover={{ bg: hoverBg }}
                      onClick={() => handleOrganizationSelect(org)}
                    >
                      <HStack justify="space-between">
                        <HStack spacing={2}>
                          <Building2 size={16} />
                          <Text fontSize="sm" fontWeight={selectedOrganization?.id === org.id ? 'medium' : 'normal'}>
                            {org.name}
                          </Text>
                        </HStack>
                        {org.employees_count !== undefined && (
                          <Badge colorScheme="blue" fontSize="xs">
                            {org.employees_count}
                          </Badge>
                        )}
                      </HStack>
                    </Box>
                  ))
                )}
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* 右侧：人员列表 */}
        <Card flex={1} bg={bgColor} borderColor={borderColor} display="flex" flexDirection="column">
          <CardBody flex={1} display="flex" flexDirection="column" overflow="hidden" p={4}>
            {!selectedOrganization ? (
              <Flex justify="center" align="center" h="full">
                <Text color="gray.500">请选择一个组织</Text>
              </Flex>
            ) : (
              <VStack spacing={4} align="stretch" h="full">
                {/* 搜索和添加按钮 */}
                <HStack spacing={2}>
                  <InputGroup size="md" flex="1">
                    <InputLeftElement pointerEvents="none">
                      <Search size={16} color="gray" />
                    </InputLeftElement>
                    <Input
                      placeholder="通过名称搜索"
                      value={searchKeyword}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchKeyword(e.target.value)}
                      onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch()}
                      bg={useColorModeValue('gray.50', 'gray.800')}
                      borderColor={borderColor}
                    />
                  </InputGroup>
                  <Button
                    leftIcon={<Plus size={16} />}
                    onClick={handleAdd}
                    colorScheme="blue"
                    size="md"
                  >
                    添加成员
                  </Button>
                </HStack>

                {/* 组织标签 */}
                <HStack>
                  <Badge colorScheme="teal" fontSize="sm" px={2} py={1}>
                    {selectedOrganization.name}
                  </Badge>
                </HStack>

                    {/* 人员表格 */}
                    {loading ? (
                      <Flex justify="center" align="center" flex="1">
                        <Spinner size="lg" />
                      </Flex>
                    ) : users.length === 0 ? (
                      <Flex justify="center" align="center" flex="1">
                        <Text color="gray.500">暂无数据</Text>
                      </Flex>
                    ) : (
                      <>
                        <Box flex="1" overflowY="auto">
                          <Table variant="simple" size="sm">
                            <Thead position="sticky" top={0} bg={bgColor} zIndex={1}>
                              <Tr>
                                <Th>姓名</Th>
                                <Th>状态</Th>
                                <Th>性别</Th>
                                <Th>手机号</Th>
                                <Th>邮箱</Th>
                                <Th>WhatsApp</Th>
                                <Th>角色</Th>
                                <Th>操作</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {users.map((user: UserListItem) => (
                                <Tr key={user.id} _hover={{ bg: hoverBg }}>
                                  <Td>
                                    <Text fontSize="sm" fontWeight="medium">
                                      {user.display_name || user.username}
                                    </Text>
                                  </Td>
                                  <Td>
                                    <Badge colorScheme={user.is_active ? 'green' : 'red'}>
                                      {user.is_active ? '启用' : '禁用'}
                                    </Badge>
                                  </Td>
                                  <Td>
                                    <Text fontSize="sm" color="gray.600">
                                      {userDetails[user.id]?.gender === 'male' ? '男' : 
                                       userDetails[user.id]?.gender === 'female' ? '女' : '-'}
                                    </Text>
                                  </Td>
                                  <Td>
                                    <Text fontSize="sm" color="gray.600">
                                      {userDetails[user.id]?.phone || user.phone || '-'}
                                    </Text>
                                  </Td>
                                  <Td>
                                    <Text fontSize="sm">{user.email || '-'}</Text>
                                  </Td>
                                  <Td>
                                    <Text fontSize="sm" color="gray.600">
                                      {userDetails[user.id]?.whatsapp || user.whatsapp || '-'}
                                    </Text>
                                  </Td>
                                  <Td>
                                    {user.roles && user.roles.length > 0 ? (
                                      <HStack spacing={1} flexWrap="wrap">
                                        {user.roles.map((role) => (
                                          <Badge key={role.id} colorScheme="blue" fontSize="xs">
                                            {role.name}
                                          </Badge>
                                        ))}
                                      </HStack>
                                    ) : (
                                      <Text fontSize="sm" color="gray.500">-</Text>
                                    )}
                                  </Td>
                                  <Td>
                                    <HStack spacing={1}>
                                      <IconButton
                                        aria-label="编辑"
                                        icon={<Edit size={14} />}
                                        size="xs"
                                        variant="ghost"
                                        onClick={() => handleEdit(user)}
                                      />
                                      <IconButton
                                        aria-label="重置密码"
                                        icon={<Key size={14} />}
                                        size="xs"
                                        variant="ghost"
                                        colorScheme="orange"
                                        onClick={() => handleResetPassword(user)}
                                      />
                                      <IconButton
                                        aria-label="删除"
                                        icon={<Trash2 size={14} />}
                                        size="xs"
                                        variant="ghost"
                                        colorScheme="red"
                                        onClick={() => handleDelete(user)}
                                      />
                                    </HStack>
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </Box>

                        {/* 分页 */}
                        {pages > 1 && (
                          <Flex justify="space-between" align="center" mt={4} pt={4} borderTopWidth={1} borderColor={borderColor}>
                            <Text fontSize="sm" color="gray.600">
                              共 {total} 条，第 {currentPage} / {pages} 页
                            </Text>
                            <HStack spacing={2}>
                              <Button
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                isDisabled={currentPage === 1}
                              >
                                上一页
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
                                    size="sm"
                                    onClick={() => handlePageChange(pageNum)}
                                    colorScheme={currentPage === pageNum ? 'blue' : 'gray'}
                                    variant={currentPage === pageNum ? 'solid' : 'outline'}
                                  >
                                    {pageNum}
                                  </Button>
                                )
                              })}
                              <Button
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                isDisabled={currentPage >= pages}
                              >
                                下一页
                              </Button>
                            </HStack>
                          </Flex>
                        )}
                      </>
                    )}
              </VStack>
            )}
          </CardBody>
        </Card>
      </Flex>

      {/* 右侧：添加/编辑表单 Drawer */}
      <Drawer 
        isOpen={isOpen} 
        placement="right" 
        onClose={handleClose} 
        size="md"
        key={editingUser?.id || 'new-user'} // 使用 key 强制重置 Drawer 内容
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth={1}>
            {editingUser ? '编辑成员' : '添加成员'}
          </DrawerHeader>

          <DrawerBody>
            <VStack spacing={4} align="stretch" pt={4}>
              {/* 用户名 */}
              <FormControl isRequired={!editingUser}>
                <FormLabel>
                  姓名
                  {!editingUser && <Text as="span" color="red.500"> *</Text>}
                </FormLabel>
                <Input
                  placeholder="请输入"
                  value={formData.username}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, username: e.target.value })}
                  isDisabled={!!editingUser} // 编辑时禁用用户名
                  bg={useColorModeValue('gray.50', 'gray.800')}
                  borderColor={borderColor}
                />
              </FormControl>

              {/* 性别 */}
              <FormControl>
                <FormLabel>性别</FormLabel>
                <HStack spacing={4}>
                  <Checkbox
                    isChecked={formData.gender === 'male'}
                    onChange={() => setFormData({ ...formData, gender: formData.gender === 'male' ? '' : 'male' })}
                  >
                    男
                  </Checkbox>
                  <Checkbox
                    isChecked={formData.gender === 'female'}
                    onChange={() => setFormData({ ...formData, gender: formData.gender === 'female' ? '' : 'female' })}
                  >
                    女
                  </Checkbox>
                </HStack>
              </FormControl>

              {/* 手机号 */}
              <FormControl>
                <FormLabel>手机号</FormLabel>
                <Input
                  placeholder="请输入"
                  type="tel"
                  value={formData.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, phone: e.target.value })}
                  bg={useColorModeValue('gray.50', 'gray.800')}
                  borderColor={borderColor}
                />
              </FormControl>

              {/* 邮箱 */}
              <FormControl isRequired>
                <FormLabel>邮箱 <Text as="span" color="red.500">*</Text></FormLabel>
                <Input
                  placeholder="请输入"
                  type="email"
                  value={formData.email || ''}
                  onChange={handleEmailChange}
                  bg={useColorModeValue('gray.50', 'gray.800')}
                  borderColor={borderColor}
                  isInvalid={formData.email.trim() !== '' && !validateEmail(formData.email.trim())}
                  autoComplete="off"
                />
                {formData.email.trim() !== '' && !validateEmail(formData.email.trim()) && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    请输入有效的邮箱地址
                  </Text>
                )}
              </FormControl>

              {/* 部门 */}
              <FormControl isRequired>
                <FormLabel>部门</FormLabel>
                <Select
                  value={selectedOrganization?.id || ''}
                  isDisabled
                  bg={useColorModeValue('gray.50', 'gray.800')}
                  borderColor={borderColor}
                >
                  {selectedOrganization && (
                    <option value={selectedOrganization.id}>{selectedOrganization.name}</option>
                  )}
                </Select>
              </FormControl>


              {/* 密码（仅创建时显示） */}
              {!editingUser && (
                <FormControl isRequired>
                  <FormLabel>
                    密码 <Text as="span" color="red.500">*</Text>
                  </FormLabel>
                  <InputGroup>
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="自动填充（邮箱@前部分+bantu）"
                      value={formData.password || ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, password: e.target.value })}
                      bg={useColorModeValue('gray.50', 'gray.800')}
                      borderColor={borderColor}
                      autoComplete="new-password"
                      isInvalid={formData.password.trim() !== '' && formData.password.trim().length < 8}
                    />
                    <InputRightElement width="3rem">
                      <IconButton
                        aria-label={showPassword ? '隐藏密码' : '显示密码'}
                        icon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        size="sm"
                        variant="ghost"
                        onClick={() => setShowPassword(!showPassword)}
                        h="1.75rem"
                      />
                    </InputRightElement>
                  </InputGroup>
                  {formData.password.trim() !== '' && formData.password.trim().length < 8 && (
                    <Text fontSize="xs" color="red.500" mt={1}>
                      密码长度至少需要8位
                    </Text>
                  )}
                  {formData.password.trim() === '' && (
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      默认使用邮箱@前部分+bantu作为密码，可手动修改
                    </Text>
                  )}
                </FormControl>
              )}

              {/* 显示名称 */}
              <FormControl>
                <FormLabel>显示名称</FormLabel>
                <Input
                  placeholder="请输入"
                  value={formData.display_name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, display_name: e.target.value })}
                  bg={useColorModeValue('gray.50', 'gray.800')}
                  borderColor={borderColor}
                />
              </FormControl>

              {/* 角色 */}
              <FormControl isRequired>
                <FormLabel>角色 <Text as="span" color="red.500">*</Text></FormLabel>
                <VStack align="stretch" spacing={2} maxH="200px" overflowY="auto" p={2} borderWidth={1} borderRadius="md" borderColor={borderColor}>
                  {roles.length === 0 ? (
                    <Text fontSize="sm" color="gray.500" textAlign="center" py={2}>
                      暂无角色
                    </Text>
                  ) : (
                    roles.map((role: Role) => (
                      <Checkbox
                        key={role.id}
                        isChecked={formData.role_ids.includes(role.id)}
                        onChange={() => toggleRole(role.id)}
                      >
                        {role.name}
                      </Checkbox>
                    ))
                  )}
                </VStack>
                {formData.role_ids.length === 0 && (
                  <Text fontSize="xs" color="red.500" mt={1}>
                    请至少选择一个角色
                  </Text>
                )}
              </FormControl>

              <Divider />

              {/* 状态 */}
              <FormControl display="flex" alignItems="center" justifyContent="space-between">
                <FormLabel mb={0}>状态</FormLabel>
                <Switch
                  isChecked={formData.is_active}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, is_active: e.target.checked })}
                  colorScheme="teal"
                />
              </FormControl>
            </VStack>
          </DrawerBody>

          <DrawerFooter borderTopWidth={1}>
            <Button variant="outline" mr={3} onClick={handleClose}>
              取消
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleSubmit}
              isLoading={submitting}
              loadingText="保存中..."
            >
              确认
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}

export default EmployeeManagement

