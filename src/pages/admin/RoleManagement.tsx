/**
 * 角色权限管理页面
 * 支持角色权限的配置和管理
 */
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, Shield, Users, RotateCcw, Save, Calendar, Code, FileText } from 'lucide-react'
import {
  getRoleList,
  Role,
} from '@/api/roles'
import {
  getPermissionList,
  getRolePermissions,
  assignRolePermissions,
  Permission,
} from '@/api/permissions'
import { useToast } from '@/components/ToastContainer'
import { PageHeader } from '@/components/admin/PageHeader'
import {
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  HStack,
  VStack,
  Box,
  Flex,
  Spinner,
  Text,
  Badge,
  Card,
  CardBody,
  CardHeader,
  useColorModeValue,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Radio,
  RadioGroup,
  Stack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Divider,
  Heading,
  SimpleGrid,
} from '@chakra-ui/react'

const RoleManagement = () => {
  const { t, i18n } = useTranslation()
  const { showSuccess, showError } = useToast()
  
  // Chakra UI 颜色模式
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const selectedBg = useColorModeValue('blue.50', 'blue.900')
  const selectedBorder = useColorModeValue('blue.500', 'blue.400')
  
  // 数据
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  
  // 选中的角色
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [rolePermissions, setRolePermissions] = useState<Set<string>>(new Set())
  const [originalRolePermissions, setOriginalRolePermissions] = useState<Set<string>>(new Set())
  
  // 是否有未保存的更改
  const hasChanges = useMemo(() => {
    if (!selectedRole) return false
    const permissionsChanged = 
      rolePermissions.size !== originalRolePermissions.size ||
      Array.from(rolePermissions).some(id => !originalRolePermissions.has(id)) ||
      Array.from(originalRolePermissions).some(id => !rolePermissions.has(id))
    return permissionsChanged
  }, [rolePermissions, originalRolePermissions, selectedRole])

  // 加载角色列表
  useEffect(() => {
    loadRoles()
    loadPermissions()
  }, [])

  // 加载权限列表
  const loadPermissions = async () => {
    try {
      const data = await getPermissionList({ is_active: true })
      setPermissions(data)
    } catch (error: any) {
      showError(error.message || '加载权限列表失败')
    }
  }

  const loadRoles = async () => {
    setLoading(true)
    try {
      const data = await getRoleList()
      setRoles(data)
      // 默认选中第一个角色
      if (data.length > 0 && !selectedRole) {
        handleSelectRole(data[0])
      }
    } catch (error: any) {
      showError(error.message || '加载角色列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 选择角色
  const handleSelectRole = async (role: Role) => {
    setSelectedRole(role)
    setLoading(true)
    try {
      // 加载角色的权限
      const rolePerms = await getRolePermissions(role.id)
      const permIds = new Set(rolePerms.map(p => p.id))
      setRolePermissions(permIds)
      setOriginalRolePermissions(new Set(permIds))
      
    } catch (error: any) {
      showError(error.message || '加载角色权限失败')
    } finally {
      setLoading(false)
    }
  }

  // 过滤角色
  const filteredRoles = roles.filter(role => {
    if (!searchValue) return true
    const searchLower = searchValue.toLowerCase()
    return (
      role.code.toLowerCase().includes(searchLower) ||
      role.name.toLowerCase().includes(searchLower) ||
      role.name_zh?.toLowerCase().includes(searchLower) ||
      role.name_id?.toLowerCase().includes(searchLower)
    )
  })

  // 按功能（resource_type）和操作对象分组权限
  const groupedPermissions = useMemo(() => {
    // 第一层：按 resource_type（功能）分组
    const functionGroups: Record<string, Record<string, Permission[]>> = {}
    
    permissions.forEach(perm => {
      const functionKey = perm.resource_type || 'other'
      // 操作对象通常是 resource_type，但有些权限可能有更细的分类
      // 这里我们按 resource_type 作为操作对象，如果后续需要更细的分类可以扩展
      const objectKey = perm.resource_type || 'other'
      
      if (!functionGroups[functionKey]) {
        functionGroups[functionKey] = {}
      }
      if (!functionGroups[functionKey][objectKey]) {
        functionGroups[functionKey][objectKey] = []
      }
      functionGroups[functionKey][objectKey].push(perm)
    })
    
    return functionGroups
  }, [permissions])

  // 切换权限
  const togglePermission = (permissionId: string) => {
    setRolePermissions(prev => {
      const next = new Set(prev)
      if (next.has(permissionId)) {
        next.delete(permissionId)
      } else {
        next.add(permissionId)
      }
      return next
    })
  }

  // 撤销更改
  const handleUndo = () => {
    if (!selectedRole) return
    setRolePermissions(new Set(originalRolePermissions))
  }

  // 保存更改
  const handleSave = async () => {
    if (!selectedRole) return
    
    setLoading(true)
    try {
      // 保存权限
      await assignRolePermissions(selectedRole.id, {
        permission_ids: Array.from(rolePermissions)
      })
      
      // 更新原始状态
      setOriginalRolePermissions(new Set(rolePermissions))
      
      showSuccess('权限更新成功')
    } catch (error: any) {
      showError(error.message || '保存失败')
    } finally {
      setLoading(false)
    }
  }

  // 资源类型的中文名称映射
  const resourceTypeNames: Record<string, string> = {
    'user': '用户管理',
    'organization': '组织管理',
    'customer': '客户管理',
    'contact': '联系人',
    'order': '订单管理',
    'product': '产品管理',
    'category': '分类管理',
    'finance': '财务管理',
    'vendor': '供应商管理',
    'agent': '渠道代理',
    'system': '系统管理',
    'other': '其他',
  }

  // 操作类型的中文名称映射
  const actionNames: Record<string, string> = {
    'create': '添加',
    'read': '查看',
    'view': '查看',
    'list': '查看',
    'update': '编辑',
    'edit': '编辑',
    'delete': '删除',
    'remove': '移除',
    'assign': '分配',
    'import': '导入',
    'export': '导出',
    'merge': '合并',
    'sync': '同步',
    'reset': '重置',
    'process': '处理',
    'claim': '领取',
    'move': '移入',
  }

  return (
    <Box w="full" h="calc(100vh - 120px)" display="flex" flexDirection="column">
      {/* 页面头部 */}
      <PageHeader
        icon={Shield}
        title="角色权限管理"
        subtitle="配置角色权限和数据访问范围"
      />

      {/* 主内容区域 */}
      <Flex flex={1} gap={4} mt={4} overflow="hidden">
        {/* 左侧：角色列表 */}
        <Card w="320px" flexShrink={0} variant="elevated" bg={bgColor} borderColor={borderColor}>
          <CardHeader pb={2} pt={3} px={4} borderBottom="1px solid" borderColor="var(--ali-border)">
            <Heading size="sm" fontSize="14px" fontWeight="600" color="var(--ali-text-primary)">
              角色列表
            </Heading>
          </CardHeader>
          <CardBody p={3}>
            <VStack spacing={3} align="stretch">
              {/* 搜索框 */}
              <InputGroup size="sm">
                <InputLeftElement pointerEvents="none">
                  <Search size={14} color="gray" />
                </InputLeftElement>
                <Input
                  placeholder="搜索角色..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  bg="white"
                  borderColor="var(--ali-border)"
                  fontSize="13px"
                  _focus={{
                    borderColor: 'var(--ali-primary)',
                    boxShadow: '0 0 0 1px var(--ali-primary)',
                  }}
                />
              </InputGroup>

              {/* 角色列表 */}
              <VStack spacing={2} align="stretch" maxH="calc(100vh - 300px)" overflowY="auto">
                {filteredRoles.length === 0 ? (
                  <Flex justify="center" align="center" py={8}>
                    <Text fontSize="sm" color="var(--ali-text-secondary)">
                      暂无角色
                    </Text>
                  </Flex>
                ) : (
                  filteredRoles.map((role) => {
                    const isSelected = selectedRole?.id === role.id
                    const permCount = role.permissions?.length || 0
                    return (
                      <Box
                        key={role.id}
                        p={3}
                        borderRadius="6px"
                        cursor="pointer"
                        bg={isSelected ? 'var(--ali-primary-light)' : 'white'}
                        borderWidth={isSelected ? 2 : 1}
                        borderColor={isSelected ? 'var(--ali-primary)' : 'var(--ali-border)'}
                        _hover={{ 
                          bg: isSelected ? 'var(--ali-primary-light)' : 'var(--ali-bg-light)',
                          borderColor: 'var(--ali-primary)',
                        }}
                        onClick={() => handleSelectRole(role)}
                        transition="all 0.2s"
                      >
                        <HStack justify="space-between" align="flex-start" mb={1}>
                          <VStack align="flex-start" spacing={0.5} flex={1}>
                            <HStack spacing={1.5}>
                              <Shield size={14} color={isSelected ? 'var(--ali-primary)' : 'var(--ali-text-secondary)'} />
                              <Text fontWeight="600" fontSize="13px" color="var(--ali-text-primary)">
                                {role.name}
                              </Text>
                            </HStack>
                            <HStack spacing={2} fontSize="11px" color="var(--ali-text-secondary)">
                              <HStack spacing={0.5}>
                                <Code size={10} />
                                <Text>{role.code}</Text>
                              </HStack>
                              {permCount > 0 && (
                                <Badge colorScheme="blue" fontSize="10px" px={1.5} py={0.5}>
                                  {permCount} 权限
                                </Badge>
                              )}
                            </HStack>
                          </VStack>
                        </HStack>
                        {role.description && (
                          <Text fontSize="11px" color="var(--ali-text-secondary)" mt={1.5} noOfLines={2}>
                            {role.description}
                          </Text>
                        )}
                        {role.created_at && (
                          <HStack spacing={1} mt={1.5} fontSize="10px" color="var(--ali-text-secondary)">
                            <Calendar size={10} />
                            <Text>
                              {new Date(role.created_at).toLocaleDateString(i18n.language === 'id-ID' ? 'id-ID' : 'zh-CN')}
                            </Text>
                          </HStack>
                        )}
                      </Box>
                    )
                  })
                )}
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* 右侧：权限配置 */}
        <Card flex={1} variant="elevated" bg={bgColor} borderColor={borderColor} display="flex" flexDirection="column">
          {!selectedRole ? (
            <CardBody flex={1} display="flex" flexDirection="column" overflow="hidden">
              <Flex justify="center" align="center" h="full">
                <VStack spacing={2}>
                  <Shield size={48} color="var(--ali-text-secondary)" />
                  <Text color="var(--ali-text-secondary)">请选择一个角色</Text>
                </VStack>
              </Flex>
            </CardBody>
          ) : (
            <>
              {/* 角色信息头部 - 紧凑布局 */}
              <CardHeader pb={2} pt={3} px={3} borderBottom="1px solid" borderColor="var(--ali-border)">
                <VStack align="stretch" spacing={2}>
                  <HStack justify="space-between" align="flex-start">
                    <VStack align="flex-start" spacing={0.5}>
                      <HStack spacing={1.5}>
                        <Shield size={16} color="var(--ali-primary)" />
                        <Heading size="md" fontSize="15px" fontWeight="600" color="var(--ali-text-primary)">
                          {selectedRole.name}
                        </Heading>
                      </HStack>
                      {selectedRole.description && (
                        <Text fontSize="11px" color="var(--ali-text-secondary)" mt={0.5}>
                          {selectedRole.description}
                        </Text>
                      )}
                    </VStack>
                    <Badge colorScheme="blue" fontSize="10px" px={1.5} py={0.5}>
                      {rolePermissions.size} 权限
                    </Badge>
                  </HStack>
                  
                  {/* 角色详情 - 紧凑布局 */}
                  <SimpleGrid columns={3} spacing={3} pt={1.5} borderTop="1px solid" borderColor="var(--ali-border)">
                    <Box>
                      <Text fontSize="10px" fontWeight="500" color="var(--ali-text-secondary)" mb={0.5}>
                        角色代码
                      </Text>
                      <HStack spacing={1}>
                        <Code size={10} color="var(--ali-text-secondary)" />
                        <Text fontSize="11px" color="var(--ali-text-primary)">
                          {selectedRole.code}
                        </Text>
                      </HStack>
                    </Box>
                    {selectedRole.created_at && (
                      <Box>
                        <Text fontSize="10px" fontWeight="500" color="var(--ali-text-secondary)" mb={0.5}>
                          创建时间
                        </Text>
                        <HStack spacing={1}>
                          <Calendar size={10} color="var(--ali-text-secondary)" />
                          <Text fontSize="11px" color="var(--ali-text-primary)">
                            {new Date(selectedRole.created_at).toLocaleDateString(i18n.language === 'id-ID' ? 'id-ID' : 'zh-CN')}
                          </Text>
                        </HStack>
                      </Box>
                    )}
                    {selectedRole.updated_at && (
                      <Box>
                        <Text fontSize="10px" fontWeight="500" color="var(--ali-text-secondary)" mb={0.5}>
                          更新时间
                        </Text>
                        <HStack spacing={1}>
                          <Calendar size={10} color="var(--ali-text-secondary)" />
                          <Text fontSize="11px" color="var(--ali-text-primary)">
                            {new Date(selectedRole.updated_at).toLocaleDateString(i18n.language === 'id-ID' ? 'id-ID' : 'zh-CN')}
                          </Text>
                        </HStack>
                      </Box>
                    )}
                  </SimpleGrid>
                </VStack>
              </CardHeader>

              <CardBody flex={1} display="flex" flexDirection="column" overflow="hidden" p={0}>
                {loading ? (
                  <Flex justify="center" align="center" h="full">
                    <Spinner size="lg" color="var(--ali-primary)" />
                  </Flex>
                ) : (
                  <Box flex={1} overflowY="auto" p={3}>
                    <VStack spacing={2} align="stretch">
                      {/* 功能权限 - 紧凑布局 */}
                      {Object.entries(groupedPermissions).map(([functionKey, objectGroups]) => {
                        const functionName = resourceTypeNames[functionKey] || functionKey
                        const allPermsInFunction: Permission[] = []
                        Object.values(objectGroups).forEach(perms => {
                          allPermsInFunction.push(...perms)
                        })
                        const checkedCount = allPermsInFunction.filter(p => rolePermissions.has(p.id)).length
                        
                        return (
                          <Card key={functionKey} variant="outline" borderColor="var(--ali-border)" size="sm">
                            <CardHeader pb={1.5} pt={2} px={3} bg="var(--ali-bg-light)">
                              <HStack justify="space-between">
                                <Heading size="sm" fontSize="13px" fontWeight="600" color="var(--ali-text-primary)">
                                  {functionName}
                                </Heading>
                                <Badge colorScheme={checkedCount === allPermsInFunction.length ? 'green' : checkedCount > 0 ? 'yellow' : 'gray'} fontSize="10px" px={1.5} py={0.5}>
                                  {checkedCount} / {allPermsInFunction.length}
                                </Badge>
                              </HStack>
                            </CardHeader>
                            <CardBody p={2.5}>
                              <VStack spacing={2} align="stretch">
                                {Object.entries(objectGroups).map(([objectKey, objectPerms]) => {
                                  const objectName = resourceTypeNames[objectKey] || objectKey
                                  return (
                                    <Box key={objectKey}>
                                      <Text fontSize="11px" fontWeight="500" color="var(--ali-text-secondary)" mb={1.5}>
                                        {objectName}
                                      </Text>
                                      <SimpleGrid columns={{ base: 3, md: 4, lg: 5, xl: 6 }} spacing={1.5}>
                                        {objectPerms.map(perm => {
                                          const isChecked = rolePermissions.has(perm.id)
                                          const actionName = actionNames[perm.action] || perm.action
                                          return (
                                            <Checkbox
                                              key={perm.id}
                                              isChecked={isChecked}
                                              onChange={() => togglePermission(perm.id)}
                                              size="sm"
                                              colorScheme="blue"
                                            >
                                              <Text fontSize="11px" color={isChecked ? 'var(--ali-text-primary)' : 'var(--ali-text-secondary)'}>
                                                {actionName}
                                              </Text>
                                            </Checkbox>
                                          )
                                        })}
                                      </SimpleGrid>
                                    </Box>
                                  )
                                })}
                              </VStack>
                            </CardBody>
                          </Card>
                        )
                      })}
                      
                      {Object.keys(groupedPermissions).length === 0 && (
                        <Flex justify="center" align="center" py={8}>
                          <VStack spacing={2}>
                            <FileText size={36} color="var(--ali-text-secondary)" />
                            <Text fontSize="13px" color="var(--ali-text-secondary)">
                              暂无权限数据
                            </Text>
                          </VStack>
                        </Flex>
                      )}
                    </VStack>
                  </Box>
                )}
              </CardBody>

              {/* 底部操作按钮 - 紧凑布局 */}
              <Box p={2.5} borderTop="1px solid" borderColor="var(--ali-border)" bg="var(--ali-bg-light)">
                <Flex justify="flex-end" gap={2}>
                  <Button
                    leftIcon={<RotateCcw size={12} />}
                    onClick={handleUndo}
                    isDisabled={!hasChanges}
                    variant="outline"
                    size="sm"
                    fontSize="11px"
                    borderColor="var(--ali-border)"
                    color="var(--ali-text-primary)"
                    px={3}
                    h="28px"
                    _hover={{
                      bg: 'var(--ali-bg-light)',
                      borderColor: 'var(--ali-primary)',
                    }}
                    _disabled={{
                      opacity: 0.4,
                      cursor: 'not-allowed',
                    }}
                  >
                    撤销
                  </Button>
                  <Button
                    leftIcon={<Save size={12} />}
                    onClick={handleSave}
                    isDisabled={!hasChanges}
                    isLoading={loading}
                    bg="var(--ali-primary)"
                    color="white"
                    size="sm"
                    fontSize="11px"
                    px={3}
                    h="28px"
                    _hover={{
                      bg: 'var(--ali-primary-hover)',
                    }}
                    _disabled={{
                      opacity: 0.4,
                      cursor: 'not-allowed',
                    }}
                  >
                    保存
                  </Button>
                </Flex>
              </Box>
            </>
          )}
        </Card>
      </Flex>
    </Box>
  )
}

export default RoleManagement
