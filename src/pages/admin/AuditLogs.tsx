/**
 * 系统审计日志页面
 * 查询和查看系统审计日志 - 阿里云ECS风格优化
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Filter, X, FileText, Calendar, AlertCircle, Info, AlertTriangle, Download, Eye } from 'lucide-react'
import {
  queryAuditLogs,
  getAuditLogDetail,
  exportAuditLogs,
  AuditLogQueryParams,
  AuditLogEntry,
  AuditLogExportRequest,
} from '@/api/auditLogs'
import { useToast } from '@/components/ToastContainer'
import { PageHeader } from '@/components/admin/PageHeader'
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
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Code,
  Divider,
  useDisclosure,
} from '@chakra-ui/react'

const AuditLogs = () => {
  const { t, i18n } = useTranslation()
  const { showError, showSuccess } = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)
  
  // 查询参数
  const [queryParams, setQueryParams] = useState<AuditLogQueryParams>({
    page: 1,
    size: 50,
  })
  
  // 数据
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  
  // 表单数据
  const [formData, setFormData] = useState({
    user_id: '',
    action: '',
    resource_type: '',
    resource_id: '',
    category: '',
    status: '',
    start_time: '',
    end_time: '',
  })

  // 可用的操作类型
  const availableActions = [
    'CREATE',
    'UPDATE',
    'DELETE',
    'VIEW',
    'LOGIN',
    'LOGOUT',
    'EXPORT',
    'IMPORT',
  ]
  
  // 可用的资源类型
  const availableResourceTypes = [
    'user',
    'organization',
    'order',
    'lead',
    'customer',
    'product',
    'role',
    'permission',
  ]
  
  // 可用的操作分类
  const availableCategories = [
    'user_management',
    'order_management',
    'customer_management',
    'product_management',
    'role_management',
    'system_management',
  ]

  // 加载日志
  useEffect(() => {
    loadLogs()
  }, [queryParams])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const response = await queryAuditLogs(queryParams)
      setLogs(response.records)
      setTotal(response.total)
      setTotalPages(response.pages)
    } catch (error: any) {
      showError(error.message || t('systemManagement.auditLogs.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  // 处理查询
  const handleSearch = () => {
    // 转换日期时间格式为 ISO 8601
    const startTime = formData.start_time
      ? new Date(formData.start_time).toISOString()
      : undefined
    const endTime = formData.end_time
      ? new Date(formData.end_time).toISOString()
      : undefined

    setQueryParams({
      ...queryParams,
      ...formData,
      start_time: startTime,
      end_time: endTime,
      page: 1, // 重置到第一页
    })
  }

  // 重置查询
  const handleReset = () => {
    setFormData({
      user_id: '',
      action: '',
      resource_type: '',
      resource_id: '',
      category: '',
      status: '',
      start_time: '',
      end_time: '',
    })
    setQueryParams({
      page: 1,
      size: 50,
    })
  }

  // 分页
  const handlePageChange = (page: number) => {
    setQueryParams({ ...queryParams, page })
  }

  // 查看详情
  const handleViewDetail = async (logId: string) => {
    try {
      const log = await getAuditLogDetail(logId)
      setSelectedLog(log)
      onOpen()
    } catch (error: any) {
      showError(error.message || t('systemManagement.auditLogs.loadDetailFailed'))
    }
  }

  // 导出日志
  const handleExport = async () => {
    setExporting(true)
    try {
      const exportRequest: AuditLogExportRequest = {
        user_id: formData.user_id || undefined,
        action: formData.action || undefined,
        resource_type: formData.resource_type || undefined,
        resource_id: formData.resource_id || undefined,
        category: formData.category || undefined,
        status: formData.status as 'success' | 'failed' | undefined,
        start_time: formData.start_time
          ? new Date(formData.start_time).toISOString()
          : undefined,
        end_time: formData.end_time
          ? new Date(formData.end_time).toISOString()
          : undefined,
        format: 'json',
      }
      
      await exportAuditLogs(exportRequest)
      showSuccess(t('systemManagement.auditLogs.exportSuccess'))
    } catch (error: any) {
      showError(error.message || t('systemManagement.auditLogs.exportFailed'))
    } finally {
      setExporting(false)
    }
  }

  // 获取操作类型颜色
  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE':
        return 'green'
      case 'UPDATE':
        return 'blue'
      case 'DELETE':
        return 'red'
      case 'VIEW':
        return 'gray'
      case 'LOGIN':
        return 'purple'
      case 'LOGOUT':
        return 'orange'
      default:
        return 'gray'
    }
  }

  // 获取状态颜色
  const getStatusColor = (status: string) => {
    return status === 'success' ? 'green' : 'red'
  }

  // 格式化时间
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const locale = i18n.language === 'id-ID' ? 'id-ID' : 'zh-CN'
      return date.toLocaleString(locale, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    } catch {
      return timestamp
    }
  }

  // 获取操作类型翻译
  const getActionLabel = (action: string) => {
    const key = `systemManagement.auditLogs.actions.${action}`
    const translated = t(key)
    return translated !== key ? translated : action
  }

  // 获取资源类型翻译
  const getResourceTypeLabel = (type: string) => {
    const key = `systemManagement.auditLogs.resourceTypes.${type}`
    const translated = t(key)
    return translated !== key ? translated : type
  }

  // 获取操作分类翻译
  const getCategoryLabel = (category: string) => {
    const key = `systemManagement.auditLogs.categories.${category}`
    const translated = t(key)
    return translated !== key ? translated : category
  }

  // 格式化JSON
  const formatJSON = (obj: any) => {
    if (!obj) return '-'
    try {
      return JSON.stringify(obj, null, 2)
    } catch {
      return String(obj)
    }
  }

  return (
    <Box minH="100vh" bg="var(--ali-bg-gray)">
      <Box w="full" py={4} px={6}>
        {/* 页面头部 */}
        <PageHeader
          icon={FileText}
          title={t('systemManagement.auditLogs.title')}
          subtitle={t('systemManagement.auditLogs.subtitle')}
        />

        {/* 查询表单 - 优化布局，更紧凑 */}
        <Card variant="elevated" mb={4}>
          <CardHeader pb={2} pt={3} px={4} borderBottom="1px solid" borderColor="var(--ali-border)">
            <Flex justify="space-between" align="center">
              <Heading size="sm" fontSize="14px" fontWeight="600" color="var(--ali-text-primary)">
                {t('systemManagement.auditLogs.queryConditions')}
              </Heading>
              <HStack spacing={2}>
                <Button
                  leftIcon={<Download size={14} />}
                  onClick={handleExport}
                  isLoading={exporting}
                  variant="outline"
                  size="sm"
                  fontSize="12px"
                  borderColor="var(--ali-border)"
                  color="var(--ali-text-primary)"
                  _hover={{
                    bg: 'var(--ali-bg-light)',
                    borderColor: 'var(--ali-primary)',
                  }}
                >
                  {t('systemManagement.auditLogs.export')}
                </Button>
                <Button
                  leftIcon={<X size={14} />}
                  onClick={handleReset}
                  variant="outline"
                  size="sm"
                  fontSize="12px"
                  borderColor="var(--ali-border)"
                  color="var(--ali-text-primary)"
                  _hover={{
                    bg: 'var(--ali-bg-light)',
                    borderColor: 'var(--ali-primary)',
                  }}
                >
                  {t('systemManagement.auditLogs.reset')}
                </Button>
                <Button
                  leftIcon={<Search size={14} />}
                  onClick={handleSearch}
                  bg="var(--ali-primary)"
                  color="white"
                  size="sm"
                  fontSize="12px"
                  _hover={{
                    bg: 'var(--ali-primary-hover)',
                  }}
                >
                  {t('systemManagement.auditLogs.search')}
                </Button>
              </HStack>
            </Flex>
          </CardHeader>
          <CardBody p={3}>
            <SimpleGrid columns={{ base: 2, md: 4, lg: 5 }} spacing={3}>
                <Box>
                  <Text fontSize="11px" fontWeight="500" mb={1} color="var(--ali-text-secondary)">
                    {t('systemManagement.auditLogs.userId')}
                  </Text>
                  <Input
                    placeholder={t('systemManagement.auditLogs.userIdPlaceholder')}
                    value={formData.user_id}
                    onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                    size="sm"
                    bg="white"
                    borderColor="var(--ali-border)"
                    fontSize="13px"
                    _focus={{
                      borderColor: 'var(--ali-primary)',
                      boxShadow: '0 0 0 1px var(--ali-primary)',
                    }}
                  />
                </Box>

                <Box>
                  <Text fontSize="11px" fontWeight="500" mb={1} color="var(--ali-text-secondary)">
                    {t('systemManagement.auditLogs.actionType')}
                  </Text>
                  <Select
                    placeholder={t('systemManagement.auditLogs.actionTypePlaceholder')}
                    value={formData.action}
                    onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                    size="sm"
                    bg="white"
                    borderColor="var(--ali-border)"
                    fontSize="13px"
                    _focus={{
                      borderColor: 'var(--ali-primary)',
                      boxShadow: '0 0 0 1px var(--ali-primary)',
                    }}
                  >
                    {availableActions.map(action => (
                      <option key={action} value={action}>{getActionLabel(action)}</option>
                    ))}
                  </Select>
                </Box>

                <Box>
                  <Text fontSize="11px" fontWeight="500" mb={1} color="var(--ali-text-secondary)">
                    {t('systemManagement.auditLogs.resourceType')}
                  </Text>
                  <Select
                    placeholder={t('systemManagement.auditLogs.resourceTypePlaceholder')}
                    value={formData.resource_type}
                    onChange={(e) => setFormData({ ...formData, resource_type: e.target.value })}
                    size="sm"
                    bg="white"
                    borderColor="var(--ali-border)"
                    fontSize="13px"
                    _focus={{
                      borderColor: 'var(--ali-primary)',
                      boxShadow: '0 0 0 1px var(--ali-primary)',
                    }}
                  >
                    {availableResourceTypes.map(type => (
                      <option key={type} value={type}>{getResourceTypeLabel(type)}</option>
                    ))}
                  </Select>
                </Box>

                <Box>
                  <Text fontSize="11px" fontWeight="500" mb={1} color="var(--ali-text-secondary)">
                    {t('systemManagement.auditLogs.resourceId')}
                  </Text>
                  <Input
                    placeholder={t('systemManagement.auditLogs.resourceIdPlaceholder')}
                    value={formData.resource_id}
                    onChange={(e) => setFormData({ ...formData, resource_id: e.target.value })}
                    size="sm"
                    bg="white"
                    borderColor="var(--ali-border)"
                    fontSize="13px"
                    _focus={{
                      borderColor: 'var(--ali-primary)',
                      boxShadow: '0 0 0 1px var(--ali-primary)',
                    }}
                  />
                </Box>

                <Box>
                  <Text fontSize="11px" fontWeight="500" mb={1} color="var(--ali-text-secondary)">
                    {t('systemManagement.auditLogs.category')}
                  </Text>
                  <Select
                    placeholder={t('systemManagement.auditLogs.categoryPlaceholder')}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    size="sm"
                    bg="white"
                    borderColor="var(--ali-border)"
                    fontSize="13px"
                    _focus={{
                      borderColor: 'var(--ali-primary)',
                      boxShadow: '0 0 0 1px var(--ali-primary)',
                    }}
                  >
                    {availableCategories.map(category => (
                      <option key={category} value={category}>{getCategoryLabel(category)}</option>
                    ))}
                  </Select>
                </Box>

                <Box>
                  <Text fontSize="11px" fontWeight="500" mb={1} color="var(--ali-text-secondary)">
                    {t('systemManagement.auditLogs.status')}
                  </Text>
                  <Select
                    placeholder={t('systemManagement.auditLogs.statusPlaceholder')}
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    size="sm"
                    bg="white"
                    borderColor="var(--ali-border)"
                    fontSize="13px"
                    _focus={{
                      borderColor: 'var(--ali-primary)',
                      boxShadow: '0 0 0 1px var(--ali-primary)',
                    }}
                  >
                    <option value="success">{t('systemManagement.auditLogs.statusSuccess')}</option>
                    <option value="failed">{t('systemManagement.auditLogs.statusFailed')}</option>
                  </Select>
                </Box>

                <Box>
                  <Text fontSize="11px" fontWeight="500" mb={1} color="var(--ali-text-secondary)">
                    {t('systemManagement.auditLogs.startTime')}
                  </Text>
                  <Input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    size="sm"
                    bg="white"
                    borderColor="var(--ali-border)"
                    fontSize="13px"
                    _focus={{
                      borderColor: 'var(--ali-primary)',
                      boxShadow: '0 0 0 1px var(--ali-primary)',
                    }}
                  />
                </Box>

                <Box>
                  <Text fontSize="11px" fontWeight="500" mb={1} color="var(--ali-text-secondary)">
                    {t('systemManagement.auditLogs.endTime')}
                  </Text>
                  <Input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    size="sm"
                    bg="white"
                    borderColor="var(--ali-border)"
                    fontSize="13px"
                    _focus={{
                      borderColor: 'var(--ali-primary)',
                      boxShadow: '0 0 0 1px var(--ali-primary)',
                    }}
                  />
                </Box>
              </SimpleGrid>
          </CardBody>
        </Card>

        {/* 日志列表 - 阿里云ECS风格 */}
        <Card variant="elevated">
          <CardHeader pb={3} borderBottom="1px solid" borderColor="var(--ali-border)">
            <Heading size="sm" fontSize="14px" fontWeight="600" color="var(--ali-text-primary)">
              {t('systemManagement.auditLogs.auditLogList')}
            </Heading>
          </CardHeader>
          <CardBody p={0}>
            {loading ? (
              <Flex justify="center" align="center" py={12}>
                <Spinner size="lg" color="var(--ali-primary)" />
              </Flex>
            ) : logs.length === 0 ? (
              <Flex justify="center" align="center" py={12}>
                <VStack spacing={2}>
                  <FileText size={48} color="var(--ali-text-secondary)" />
                  <Text fontSize="14px" color="var(--ali-text-secondary)">
                    {t('systemManagement.auditLogs.noData')}
                  </Text>
                </VStack>
              </Flex>
            ) : (
              <>
                <Box overflowX="auto">
                  <Table variant="simple" size="sm">
                    <Thead bg="var(--ali-bg-light)">
                      <Tr>
                        <Th fontSize="12px" fontWeight="600" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)">
                          {t('systemManagement.auditLogs.time')}
                        </Th>
                        <Th fontSize="12px" fontWeight="600" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)">
                          {t('systemManagement.auditLogs.user')}
                        </Th>
                        <Th fontSize="12px" fontWeight="600" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)">
                          {t('systemManagement.auditLogs.action')}
                        </Th>
                        <Th fontSize="12px" fontWeight="600" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)">
                          {t('systemManagement.auditLogs.resource')}
                        </Th>
                        <Th fontSize="12px" fontWeight="600" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)">
                          {t('systemManagement.auditLogs.status')}
                        </Th>
                        <Th fontSize="12px" fontWeight="600" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)">
                          {t('systemManagement.auditLogs.ipAddress')}
                        </Th>
                        <Th fontSize="12px" fontWeight="600" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)">
                          {t('systemManagement.auditLogs.duration')}
                        </Th>
                        <Th fontSize="12px" fontWeight="600" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)">
                          {t('systemManagement.auditLogs.operation')}
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {logs.map((log, index) => {
                        const isEven = index % 2 === 0
                        return (
                          <Tr 
                            key={log.id} 
                            bg={isEven ? 'white' : 'var(--ali-bg-light)'}
                            _hover={{ bg: 'var(--ali-primary-light)' }}
                            transition="background-color 0.2s"
                          >
                            <Td fontSize="12px" color="var(--ali-text-secondary)" py={3} px={4} borderColor="var(--ali-border)">
                              {formatTime(log.created_at)}
                            </Td>
                            <Td fontSize="13px" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)">
                              {log.user_name || log.user_id || '-'}
                            </Td>
                            <Td py={3} px={4} borderColor="var(--ali-border)">
                              <Badge 
                                colorScheme={getActionColor(log.action)}
                                fontSize="11px"
                                px={2}
                                py={1}
                                borderRadius="4px"
                              >
                                {getActionLabel(log.action)}
                              </Badge>
                            </Td>
                            <Td fontSize="13px" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)">
                              <VStack align="flex-start" spacing={0}>
                                <Text fontSize="12px" fontWeight="500">
                                  {log.resource_type ? getResourceTypeLabel(log.resource_type) : '-'}
                                </Text>
                                {log.resource_name && (
                                  <Text fontSize="11px" color="var(--ali-text-secondary)">
                                    {log.resource_name}
                                  </Text>
                                )}
                              </VStack>
                            </Td>
                            <Td py={3} px={4} borderColor="var(--ali-border)">
                              <Badge 
                                colorScheme={getStatusColor(log.status)}
                                fontSize="11px"
                                px={2}
                                py={1}
                                borderRadius="4px"
                              >
                                {log.status === 'success' 
                                  ? t('systemManagement.auditLogs.statusSuccess')
                                  : t('systemManagement.auditLogs.statusFailed')}
                              </Badge>
                            </Td>
                            <Td fontSize="12px" color="var(--ali-text-secondary)" py={3} px={4} borderColor="var(--ali-border)">
                              {log.ip_address || '-'}
                            </Td>
                            <Td fontSize="12px" color="var(--ali-text-secondary)" py={3} px={4} borderColor="var(--ali-border)">
                              {log.duration_ms ? `${log.duration_ms}ms` : '-'}
                            </Td>
                            <Td py={3} px={4} borderColor="var(--ali-border)">
                              <Button
                                size="xs"
                                leftIcon={<Eye size={12} />}
                                onClick={() => handleViewDetail(log.id)}
                                variant="ghost"
                                fontSize="12px"
                                color="var(--ali-primary)"
                                _hover={{
                                  bg: 'var(--ali-primary-light)',
                                }}
                              >
                                {t('systemManagement.auditLogs.detail')}
                              </Button>
                            </Td>
                          </Tr>
                        )
                      })}
                    </Tbody>
                  </Table>
                </Box>

                {/* 分页 - 阿里云ECS风格 */}
                {totalPages > 1 && (
                  <Flex 
                    justify="space-between" 
                    align="center" 
                    px={4} 
                    py={3} 
                    borderTop="1px solid" 
                    borderColor="var(--ali-border)"
                    bg="var(--ali-bg-light)"
                  >
                    <Text fontSize="12px" color="var(--ali-text-secondary)">
                      {t('systemManagement.auditLogs.totalRecordsText', { total, page: queryParams.page, pages: totalPages })}
                    </Text>
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        onClick={() => handlePageChange(queryParams.page! - 1)}
                        isDisabled={queryParams.page === 1}
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
                        {t('systemManagement.auditLogs.previousPage')}
                      </Button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum: number
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (queryParams.page! <= 3) {
                          pageNum = i + 1
                        } else if (queryParams.page! >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = queryParams.page! - 2 + i
                        }
                        const isActive = queryParams.page === pageNum
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
                        onClick={() => handlePageChange(queryParams.page! + 1)}
                        isDisabled={queryParams.page! >= totalPages}
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
                        {t('systemManagement.auditLogs.nextPage')}
                      </Button>
                    </HStack>
                  </Flex>
                )}
              </>
            )}
          </CardBody>
        </Card>

        {/* 详情模态框 */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{t('systemManagement.auditLogs.detailTitle')}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              {selectedLog && (
                <VStack spacing={4} align="stretch">
                  <SimpleGrid columns={2} spacing={4}>
                    <Box>
                      <Text fontSize="12px" fontWeight="500" color="var(--ali-text-secondary)" mb={1}>
                        {t('systemManagement.auditLogs.logId')}
                      </Text>
                      <Text fontSize="14px" color="var(--ali-text-primary)">
                        {selectedLog.id}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="12px" fontWeight="500" color="var(--ali-text-secondary)" mb={1}>
                        {t('systemManagement.auditLogs.operationTime')}
                      </Text>
                      <Text fontSize="14px" color="var(--ali-text-primary)">
                        {formatTime(selectedLog.created_at)}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="12px" fontWeight="500" color="var(--ali-text-secondary)" mb={1}>
                        {t('systemManagement.auditLogs.user')}
                      </Text>
                      <Text fontSize="14px" color="var(--ali-text-primary)">
                        {selectedLog.user_name || selectedLog.user_id || '-'}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="12px" fontWeight="500" color="var(--ali-text-secondary)" mb={1}>
                        {t('systemManagement.auditLogs.action')}
                      </Text>
                      <Badge colorScheme={getActionColor(selectedLog.action)}>
                        {getActionLabel(selectedLog.action)}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontSize="12px" fontWeight="500" color="var(--ali-text-secondary)" mb={1}>
                        {t('systemManagement.auditLogs.resourceType')}
                      </Text>
                      <Text fontSize="14px" color="var(--ali-text-primary)">
                        {selectedLog.resource_type ? getResourceTypeLabel(selectedLog.resource_type) : '-'}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="12px" fontWeight="500" color="var(--ali-text-secondary)" mb={1}>
                        {t('systemManagement.auditLogs.resourceName')}
                      </Text>
                      <Text fontSize="14px" color="var(--ali-text-primary)">
                        {selectedLog.resource_name || '-'}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="12px" fontWeight="500" color="var(--ali-text-secondary)" mb={1}>
                        {t('systemManagement.auditLogs.status')}
                      </Text>
                      <Badge colorScheme={getStatusColor(selectedLog.status)}>
                        {selectedLog.status === 'success' 
                          ? t('systemManagement.auditLogs.statusSuccess')
                          : t('systemManagement.auditLogs.statusFailed')}
                      </Badge>
                    </Box>
                    <Box>
                      <Text fontSize="12px" fontWeight="500" color="var(--ali-text-secondary)" mb={1}>
                        {t('systemManagement.auditLogs.duration')}
                      </Text>
                      <Text fontSize="14px" color="var(--ali-text-primary)">
                        {selectedLog.duration_ms ? `${selectedLog.duration_ms}ms` : '-'}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="12px" fontWeight="500" color="var(--ali-text-secondary)" mb={1}>
                        {t('systemManagement.auditLogs.ipAddress')}
                      </Text>
                      <Text fontSize="14px" color="var(--ali-text-primary)">
                        {selectedLog.ip_address || '-'}
                      </Text>
                    </Box>
                    <Box>
                      <Text fontSize="12px" fontWeight="500" color="var(--ali-text-secondary)" mb={1}>
                        {t('systemManagement.auditLogs.requestMethod')}
                      </Text>
                      <Text fontSize="14px" color="var(--ali-text-primary)">
                        {selectedLog.request_method || '-'}
                      </Text>
                    </Box>
                    <Box colSpan={2}>
                      <Text fontSize="12px" fontWeight="500" color="var(--ali-text-secondary)" mb={1}>
                        {t('systemManagement.auditLogs.requestPath')}
                      </Text>
                      <Text fontSize="14px" color="var(--ali-text-primary)">
                        {selectedLog.request_path || '-'}
                      </Text>
                    </Box>
                  </SimpleGrid>

                  {selectedLog.error_message && (
                    <>
                      <Divider />
                      <Box>
                        <Text fontSize="12px" fontWeight="500" color="var(--ali-text-secondary)" mb={2}>
                          {t('systemManagement.auditLogs.errorMessage')}
                        </Text>
                        <Code p={2} borderRadius="4px" fontSize="12px" colorScheme="red" display="block" whiteSpace="pre-wrap">
                          {selectedLog.error_message}
                        </Code>
                      </Box>
                    </>
                  )}

                  {selectedLog.old_values && (
                    <>
                      <Divider />
                      <Box>
                        <Text fontSize="12px" fontWeight="500" color="var(--ali-text-secondary)" mb={2}>
                          {t('systemManagement.auditLogs.oldValues')}
                        </Text>
                        <Code p={2} borderRadius="4px" fontSize="12px" display="block" whiteSpace="pre-wrap" maxH="200px" overflowY="auto">
                          {formatJSON(selectedLog.old_values)}
                        </Code>
                      </Box>
                    </>
                  )}

                  {selectedLog.new_values && (
                    <>
                      <Divider />
                      <Box>
                        <Text fontSize="12px" fontWeight="500" color="var(--ali-text-secondary)" mb={2}>
                          {t('systemManagement.auditLogs.newValues')}
                        </Text>
                        <Code p={2} borderRadius="4px" fontSize="12px" display="block" whiteSpace="pre-wrap" maxH="200px" overflowY="auto">
                          {formatJSON(selectedLog.new_values)}
                        </Code>
                      </Box>
                    </>
                  )}

                  {selectedLog.request_params && (
                    <>
                      <Divider />
                      <Box>
                        <Text fontSize="12px" fontWeight="500" color="var(--ali-text-secondary)" mb={2}>
                          {t('systemManagement.auditLogs.requestParams')}
                        </Text>
                        <Code p={2} borderRadius="4px" fontSize="12px" display="block" whiteSpace="pre-wrap" maxH="200px" overflowY="auto">
                          {formatJSON(selectedLog.request_params)}
                        </Code>
                      </Box>
                    </>
                  )}
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button onClick={onClose} size="sm">
                {t('systemManagement.auditLogs.close')}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Box>
    </Box>
  )
}

export default AuditLogs
