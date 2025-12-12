/**
 * 系统日志页面
 * 查询和查看系统日志 - 阿里云ECS风格优化
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Filter, X, FileText, Calendar, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import {
  queryLogs,
  getLogStatistics,
  LogQueryParams,
  LogEntry,
  LogStatistics,
} from '@/api/logs'
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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
} from '@chakra-ui/react'

const SystemLogs = () => {
  const { t } = useTranslation()
  const { showError } = useToast()
  
  // 查询参数
  const [queryParams, setQueryParams] = useState<LogQueryParams>({
    page: 1,
    page_size: 50,
  })
  
  // 数据
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [statistics, setStatistics] = useState<LogStatistics | null>(null)
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  
  // 表单数据
  const [formData, setFormData] = useState({
    services: [] as string[],
    levels: [] as string[],
    start_time: '',
    end_time: '',
    keyword: '',
    file: '',
    function: '',
  })

  // 可用的服务和级别
  const availableServices = [
    'foundation-service',
    'order-workflow-service',
    'service-management-service',
    'analytics-monitoring-service',
  ]
  
  const availableLevels = ['ERROR', 'WARNING', 'INFO', 'DEBUG']

  // 加载日志
  useEffect(() => {
    loadLogs()
    loadStatistics()
  }, [queryParams])

  const loadLogs = async () => {
    setLoading(true)
    try {
      const response = await queryLogs(queryParams)
      setLogs(response.logs)
      setTotal(response.total)
      setTotalPages(response.total_pages)
    } catch (error: any) {
      showError(error.message || '加载日志失败')
    } finally {
      setLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const stats = await getLogStatistics({
        services: queryParams.services,
        start_time: queryParams.start_time,
        end_time: queryParams.end_time,
      })
      setStatistics(stats)
    } catch (error: any) {
      // 统计失败不影响主功能
      console.error('加载统计失败:', error)
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
      services: [],
      levels: [],
      start_time: '',
      end_time: '',
      keyword: '',
      file: '',
      function: '',
    })
    setQueryParams({
      page: 1,
      page_size: 50,
    })
  }

  // 分页
  const handlePageChange = (page: number) => {
    setQueryParams({ ...queryParams, page })
  }

  // 获取日志级别颜色
  const getLevelColor = (level: string) => {
    switch (level.toUpperCase()) {
      case 'ERROR':
        return 'red'
      case 'WARNING':
        return 'yellow'
      case 'INFO':
        return 'blue'
      case 'DEBUG':
        return 'gray'
      default:
        return 'gray'
    }
  }

  // 获取日志级别图标
  const getLevelIcon = (level: string) => {
    switch (level.toUpperCase()) {
      case 'ERROR':
        return AlertCircle
      case 'WARNING':
        return AlertTriangle
      case 'INFO':
        return Info
      default:
        return FileText
    }
  }

  // 格式化时间
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      return date.toLocaleString('zh-CN', {
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

  return (
    <Box minH="100vh" bg="var(--ali-bg-gray)">
      <Box w="full" py={4} px={6}>
        {/* 页面头部 */}
        <PageHeader
          icon={FileText}
          title="系统日志"
          subtitle="查询和查看系统运行日志"
        />

        {/* 统计信息 - 阿里云ECS风格 */}
        {statistics && (
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={4}>
            <Card variant="elevated">
              <CardBody p={4}>
                <VStack align="flex-start" spacing={1}>
                  <Text fontSize="12px" color="var(--ali-text-secondary)" fontWeight="normal">
                    总日志数
                  </Text>
                  <Text fontSize="20px" fontWeight="600" color="var(--ali-text-primary)">
                    {statistics.total_logs.toLocaleString()}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
            <Card variant="elevated">
              <CardBody p={4}>
                <VStack align="flex-start" spacing={1}>
                  <Text fontSize="12px" color="var(--ali-text-secondary)" fontWeight="normal">
                    错误数量
                  </Text>
                  <Text fontSize="20px" fontWeight="600" color="var(--ali-error)">
                    {statistics.error_count}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
            <Card variant="elevated">
              <CardBody p={4}>
                <VStack align="flex-start" spacing={1}>
                  <Text fontSize="12px" color="var(--ali-text-secondary)" fontWeight="normal">
                    警告数量
                  </Text>
                  <Text fontSize="20px" fontWeight="600" color="var(--ali-warning)">
                    {statistics.warning_count}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
            <Card variant="elevated">
              <CardBody p={4}>
                <VStack align="flex-start" spacing={1}>
                  <Text fontSize="12px" color="var(--ali-text-secondary)" fontWeight="normal">
                    服务数量
                  </Text>
                  <Text fontSize="20px" fontWeight="600" color="var(--ali-text-primary)">
                    {Object.keys(statistics.by_service).length}
                  </Text>
                </VStack>
              </CardBody>
            </Card>
          </SimpleGrid>
        )}

        {/* 查询表单 - 阿里云ECS风格 */}
        <Card variant="elevated" mb={4}>
          <CardHeader pb={3} borderBottom="1px solid" borderColor="var(--ali-border)">
            <Heading size="sm" fontSize="14px" fontWeight="600" color="var(--ali-text-primary)">
              查询条件
            </Heading>
          </CardHeader>
          <CardBody p={4}>
            <VStack spacing={4} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                <Box>
                  <Text fontSize="12px" fontWeight="500" mb={2} color="var(--ali-text-secondary)">
                    服务
                  </Text>
                  <Select
                    placeholder="选择服务"
                    value={formData.services[0] || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      services: e.target.value ? [e.target.value] : []
                    })}
                    size="md"
                    bg="white"
                    borderColor="var(--ali-border)"
                    fontSize="14px"
                    _focus={{
                      borderColor: 'var(--ali-primary)',
                      boxShadow: '0 0 0 1px var(--ali-primary)',
                    }}
                  >
                    {availableServices.map(service => (
                      <option key={service} value={service}>{service}</option>
                    ))}
                  </Select>
                </Box>

                <Box>
                  <Text fontSize="12px" fontWeight="500" mb={2} color="var(--ali-text-secondary)">
                    日志级别
                  </Text>
                  <Select
                    placeholder="选择级别"
                    value={formData.levels[0] || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      levels: e.target.value ? [e.target.value] : []
                    })}
                    size="md"
                    bg="white"
                    borderColor="var(--ali-border)"
                    fontSize="14px"
                    _focus={{
                      borderColor: 'var(--ali-primary)',
                      boxShadow: '0 0 0 1px var(--ali-primary)',
                    }}
                  >
                    {availableLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </Select>
                </Box>

                <Box>
                  <Text fontSize="12px" fontWeight="500" mb={2} color="var(--ali-text-secondary)">
                    关键词
                  </Text>
                  <InputGroup size="md">
                    <InputLeftElement pointerEvents="none">
                      <Search size={16} color="var(--ali-text-secondary)" />
                    </InputLeftElement>
                    <Input
                      placeholder="搜索日志内容..."
                      value={formData.keyword}
                      onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                      bg="white"
                      borderColor="var(--ali-border)"
                      fontSize="14px"
                      _focus={{
                        borderColor: 'var(--ali-primary)',
                        boxShadow: '0 0 0 1px var(--ali-primary)',
                      }}
                    />
                  </InputGroup>
                </Box>

                <Box>
                  <Text fontSize="12px" fontWeight="500" mb={2} color="var(--ali-text-secondary)">
                    开始时间
                  </Text>
                  <Input
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    size="md"
                    bg="white"
                    borderColor="var(--ali-border)"
                    fontSize="14px"
                    _focus={{
                      borderColor: 'var(--ali-primary)',
                      boxShadow: '0 0 0 1px var(--ali-primary)',
                    }}
                  />
                </Box>

                <Box>
                  <Text fontSize="12px" fontWeight="500" mb={2} color="var(--ali-text-secondary)">
                    结束时间
                  </Text>
                  <Input
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    size="md"
                    bg="white"
                    borderColor="var(--ali-border)"
                    fontSize="14px"
                    _focus={{
                      borderColor: 'var(--ali-primary)',
                      boxShadow: '0 0 0 1px var(--ali-primary)',
                    }}
                  />
                </Box>

                <Box>
                  <Text fontSize="12px" fontWeight="500" mb={2} color="var(--ali-text-secondary)">
                    文件名
                  </Text>
                  <Input
                    placeholder="文件名过滤"
                    value={formData.file}
                    onChange={(e) => setFormData({ ...formData, file: e.target.value })}
                    size="md"
                    bg="white"
                    borderColor="var(--ali-border)"
                    fontSize="14px"
                    _focus={{
                      borderColor: 'var(--ali-primary)',
                      boxShadow: '0 0 0 1px var(--ali-primary)',
                    }}
                  />
                </Box>
              </SimpleGrid>

              <HStack justify="flex-end" pt={2}>
                <Button
                  leftIcon={<X size={16} />}
                  onClick={handleReset}
                  variant="outline"
                  size="md"
                  fontSize="14px"
                  borderColor="var(--ali-border)"
                  color="var(--ali-text-primary)"
                  _hover={{
                    bg: 'var(--ali-bg-light)',
                    borderColor: 'var(--ali-primary)',
                  }}
                >
                  重置
                </Button>
                <Button
                  leftIcon={<Search size={16} />}
                  onClick={handleSearch}
                  bg="var(--ali-primary)"
                  color="white"
                  size="md"
                  fontSize="14px"
                  _hover={{
                    bg: 'var(--ali-primary-hover)',
                  }}
                >
                  查询
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>

        {/* 日志列表 - 阿里云ECS风格 */}
        <Card variant="elevated">
          <CardHeader pb={3} borderBottom="1px solid" borderColor="var(--ali-border)">
            <Heading size="sm" fontSize="14px" fontWeight="600" color="var(--ali-text-primary)">
              日志列表
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
                    暂无日志数据
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
                          时间
                        </Th>
                        <Th fontSize="12px" fontWeight="600" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)">
                          级别
                        </Th>
                        <Th fontSize="12px" fontWeight="600" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)">
                          服务
                        </Th>
                        <Th fontSize="12px" fontWeight="600" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)">
                          消息
                        </Th>
                        <Th fontSize="12px" fontWeight="600" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)">
                          文件
                        </Th>
                        <Th fontSize="12px" fontWeight="600" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)">
                          函数
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {logs.map((log, index) => {
                        const LevelIcon = getLevelIcon(log.level)
                        const isEven = index % 2 === 0
                        return (
                          <Tr 
                            key={log.id} 
                            bg={isEven ? 'white' : 'var(--ali-bg-light)'}
                            _hover={{ bg: 'var(--ali-primary-light)' }}
                            transition="background-color 0.2s"
                          >
                            <Td fontSize="12px" color="var(--ali-text-secondary)" py={3} px={4} borderColor="var(--ali-border)">
                              {formatTime(log.timestamp)}
                            </Td>
                            <Td py={3} px={4} borderColor="var(--ali-border)">
                              <Badge 
                                colorScheme={getLevelColor(log.level)}
                                fontSize="11px"
                                px={2}
                                py={1}
                                borderRadius="4px"
                              >
                                <HStack spacing={1}>
                                  <LevelIcon size={12} />
                                  <Text>{log.level}</Text>
                                </HStack>
                              </Badge>
                            </Td>
                            <Td fontSize="13px" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)">
                              {log.service}
                            </Td>
                            <Td fontSize="13px" color="var(--ali-text-primary)" py={3} px={4} borderColor="var(--ali-border)" maxW="400px">
                              <Text noOfLines={2}>
                                {log.message}
                              </Text>
                            </Td>
                            <Td fontSize="12px" color="var(--ali-text-secondary)" py={3} px={4} borderColor="var(--ali-border)">
                              <Text noOfLines={1}>
                                {log.file ? log.file.split('/').pop() : '-'}
                              </Text>
                            </Td>
                            <Td fontSize="12px" color="var(--ali-text-secondary)" py={3} px={4} borderColor="var(--ali-border)">
                              {log.function || '-'}
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
                      共 {total} 条，第 {queryParams.page} / {totalPages} 页
                    </Text>
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        onClick={() => handlePageChange(queryParams.page - 1)}
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
                        上一页
                      </Button>
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum: number
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (queryParams.page <= 3) {
                          pageNum = i + 1
                        } else if (queryParams.page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = queryParams.page - 2 + i
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
                        onClick={() => handlePageChange(queryParams.page + 1)}
                        isDisabled={queryParams.page >= totalPages}
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
                        下一页
                      </Button>
                    </HStack>
                  </Flex>
                )}
              </>
            )}
          </CardBody>
        </Card>
      </Box>
    </Box>
  )
}

export default SystemLogs
