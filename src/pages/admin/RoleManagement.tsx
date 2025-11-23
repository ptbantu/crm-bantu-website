/**
 * 角色权限管理页面
 * 支持角色权限的配置和管理
 */
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, Shield, Users, RotateCcw, Save } from 'lucide-react'
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
} from '@chakra-ui/react'

const RoleManagement = () => {
  const { t } = useTranslation()
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
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  bg={useColorModeValue('gray.50', 'gray.800')}
                  borderColor={borderColor}
                />
              </InputGroup>

              {/* 角色列表 */}
              <VStack spacing={1} align="stretch" maxH="calc(100vh - 280px)" overflowY="auto">
                {filteredRoles.map((role) => (
                  <Box
                    key={role.id}
                    p={3}
                    borderRadius="md"
                    cursor="pointer"
                    bg={selectedRole?.id === role.id ? selectedBg : 'transparent'}
                    borderWidth={selectedRole?.id === role.id ? 2 : 1}
                    borderColor={selectedRole?.id === role.id ? selectedBorder : borderColor}
                    _hover={{ bg: hoverBg }}
                    onClick={() => handleSelectRole(role)}
                  >
                    <Text fontWeight="medium" fontSize="sm">
                      {role.name}
                    </Text>
                    {role.description && (
                      <Text fontSize="xs" color="gray.500" mt={1} noOfLines={1}>
                        {role.description}
                      </Text>
                    )}
                  </Box>
                ))}
              </VStack>
            </VStack>
          </CardBody>
        </Card>

        {/* 右侧：权限配置 */}
        <Card flex={1} bg={bgColor} borderColor={borderColor} display="flex" flexDirection="column">
          <CardBody flex={1} display="flex" flexDirection="column" overflow="hidden">
            {!selectedRole ? (
              <Flex justify="center" align="center" h="full">
                <Text color="gray.500">请选择一个角色</Text>
              </Flex>
            ) : loading ? (
              <Flex justify="center" align="center" h="full">
                <Spinner size="lg" />
              </Flex>
            ) : (
              <Tabs flex={1} display="flex" flexDirection="column" overflow="hidden">
                <TabList>
                  <Tab>权限</Tab>
                  <Tab>成员</Tab>
                </TabList>

                <TabPanels flex={1} overflowY="auto">
                  {/* 权限标签页 */}
                  <TabPanel p={6}>
                    <VStack spacing={6} align="stretch">
                      {/* 功能权限 */}
                      <Box>
                        <Heading size="md" mb={4}>功能权限</Heading>
                        <Table variant="simple" size="sm">
                          <Thead>
                            <Tr>
                              <Th>功能</Th>
                              <Th>操作对象</Th>
                              <Th>权限</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {Object.entries(groupedPermissions).map(([functionKey, objectGroups]) => {
                              const objectEntries = Object.entries(objectGroups)
                              return objectEntries.map(([objectKey, objectPerms], idx) => (
                                <Tr key={`${functionKey}-${objectKey}-${idx}`}>
                                  {idx === 0 && (
                                    <Td rowSpan={objectEntries.length} verticalAlign="top" pt={4}>
                                      <Text fontWeight="semibold">
                                        {resourceTypeNames[functionKey] || functionKey}
                                      </Text>
                                    </Td>
                                  )}
                                  <Td>
                                    <Text fontSize="sm">
                                      {resourceTypeNames[objectKey] || objectKey}
                                    </Text>
                                  </Td>
                                  <Td>
                                    <HStack spacing={2} flexWrap="wrap">
                                      {objectPerms.map(perm => (
                                        <Checkbox
                                          key={perm.id}
                                          isChecked={rolePermissions.has(perm.id)}
                                          onChange={() => togglePermission(perm.id)}
                                          size="sm"
                                        >
                                          <Text fontSize="xs">
                                            {actionNames[perm.action] || perm.action}
                                          </Text>
                                        </Checkbox>
                                      ))}
                                    </HStack>
                                  </Td>
                                </Tr>
                              ))
                            })}
                          </Tbody>
                        </Table>
                      </Box>
                    </VStack>
                  </TabPanel>

                  {/* 成员标签页 */}
                  <TabPanel p={6}>
                    <Flex justify="center" align="center" h="200px">
                      <Text color="gray.500">成员管理功能开发中...</Text>
                    </Flex>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </CardBody>

          {/* 底部操作按钮 */}
          {selectedRole && (
            <Box p={4} borderTopWidth={1} borderColor={borderColor}>
              <Flex justify="flex-end" gap={3}>
                <Button
                  leftIcon={<RotateCcw size={16} />}
                  onClick={handleUndo}
                  isDisabled={!hasChanges}
                  variant="outline"
                >
                  撤销更改
                </Button>
                <Button
                  leftIcon={<Save size={16} />}
                  onClick={handleSave}
                  isDisabled={!hasChanges}
                  isLoading={loading}
                  colorScheme="blue"
                >
                  更新
                </Button>
              </Flex>
            </Box>
          )}
        </Card>
      </Flex>
    </Box>
  )
}

export default RoleManagement
