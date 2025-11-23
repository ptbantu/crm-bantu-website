/**
 * 系统日志页面
 * 查询和查看系统日志
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
  useColorModeValue,
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
} from '@chakra-ui/react'

const SystemLogs = () => {
  const { t } = useTranslation()
  const { showError } = useToast()
  
  // Chakra UI 颜色模式
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  
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
    <Box w="full">
      {/* 页面头部 */}
      <PageHeader
        icon={FileText}
        title="系统日志"
        subtitle="查询和查看系统运行日志"
      />

      {/* 统计信息 */}
      {statistics && (
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={4}>
          <Card bg={bgColor} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>总日志数</StatLabel>
                <StatNumber>{statistics.total_logs.toLocaleString()}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={bgColor} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>错误数量</StatLabel>
                <StatNumber color="red.500">{statistics.error_count}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={bgColor} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>警告数量</StatLabel>
                <StatNumber color="yellow.500">{statistics.warning_count}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={bgColor} borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>服务数量</StatLabel>
                <StatNumber>{Object.keys(statistics.by_service).length}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>
      )}

      {/* 查询表单 */}
      <Card mb={4} bg={bgColor} borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>服务</Text>
                <Select
                  placeholder="选择服务"
                  value={formData.services[0] || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    services: e.target.value ? [e.target.value] : []
                  })}
                  bg={useColorModeValue('gray.50', 'gray.800')}
                  borderColor={borderColor}
                >
                  {availableServices.map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </Select>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>日志级别</Text>
                <Select
                  placeholder="选择级别"
                  value={formData.levels[0] || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    levels: e.target.value ? [e.target.value] : []
                  })}
                  bg={useColorModeValue('gray.50', 'gray.800')}
                  borderColor={borderColor}
                >
                  {availableLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </Select>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>关键词</Text>
                <InputGroup size="md">
                  <InputLeftElement pointerEvents="none">
                    <Search size={16} color="gray" />
                  </InputLeftElement>
                  <Input
                    placeholder="搜索日志内容..."
                    value={formData.keyword}
                    onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                    bg={useColorModeValue('gray.50', 'gray.800')}
                    borderColor={borderColor}
                  />
                </InputGroup>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>开始时间</Text>
                <Input
                  type="datetime-local"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                  bg={useColorModeValue('gray.50', 'gray.800')}
                  borderColor={borderColor}
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>结束时间</Text>
                <Input
                  type="datetime-local"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  bg={useColorModeValue('gray.50', 'gray.800')}
                  borderColor={borderColor}
                />
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="medium" mb={2}>文件名</Text>
                <Input
                  placeholder="文件名过滤"
                  value={formData.file}
                  onChange={(e) => setFormData({ ...formData, file: e.target.value })}
                  bg={useColorModeValue('gray.50', 'gray.800')}
                  borderColor={borderColor}
                />
              </Box>
            </SimpleGrid>

            <HStack justify="flex-end">
              <Button
                leftIcon={<X size={16} />}
                onClick={handleReset}
                variant="outline"
              >
                重置
              </Button>
              <Button
                leftIcon={<Search size={16} />}
                onClick={handleSearch}
                colorScheme="blue"
              >
                查询
              </Button>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      {/* 日志列表 */}
      <Card bg={bgColor} borderColor={borderColor}>
        <CardBody>
          {loading ? (
            <Flex justify="center" align="center" py={8}>
              <Spinner size="lg" />
            </Flex>
          ) : logs.length === 0 ? (
            <Flex justify="center" align="center" py={8}>
              <Text color="gray.500">暂无日志数据</Text>
            </Flex>
          ) : (
            <>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>时间</Th>
                    <Th>级别</Th>
                    <Th>服务</Th>
                    <Th>消息</Th>
                    <Th>文件</Th>
                    <Th>函数</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {logs.map((log) => {
                    const LevelIcon = getLevelIcon(log.level)
                    return (
                      <Tr key={log.id} _hover={{ bg: hoverBg }}>
                        <Td>
                          <Text fontSize="xs" color="gray.600">
                            {formatTime(log.timestamp)}
                          </Text>
                        </Td>
                        <Td>
                          <Badge colorScheme={getLevelColor(log.level)}>
                            <HStack spacing={1}>
                              <LevelIcon size={12} />
                              <Text>{log.level}</Text>
                            </HStack>
                          </Badge>
                        </Td>
                        <Td>
                          <Text fontSize="sm">{log.service}</Text>
                        </Td>
                        <Td>
                          <Text fontSize="sm" noOfLines={2} maxW="400px">
                            {log.message}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="xs" color="gray.600" noOfLines={1}>
                            {log.file ? log.file.split('/').pop() : '-'}
                          </Text>
                        </Td>
                        <Td>
                          <Text fontSize="xs" color="gray.600">
                            {log.function || '-'}
                          </Text>
                        </Td>
                      </Tr>
                    )
                  })}
                </Tbody>
              </Table>

              {/* 分页 */}
              {totalPages > 1 && (
                <Flex justify="space-between" align="center" mt={4} pt={4} borderTopWidth={1} borderColor={borderColor}>
                  <Text fontSize="sm" color="gray.600">
                    共 {total} 条，第 {queryParams.page} / {totalPages} 页
                  </Text>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      onClick={() => handlePageChange(queryParams.page - 1)}
                      isDisabled={queryParams.page === 1}
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
                      return (
                        <Button
                          key={pageNum}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          colorScheme={queryParams.page === pageNum ? 'blue' : 'gray'}
                          variant={queryParams.page === pageNum ? 'solid' : 'outline'}
                        >
                          {pageNum}
                        </Button>
                      )
                    })}
                    <Button
                      size="sm"
                      onClick={() => handlePageChange(queryParams.page + 1)}
                      isDisabled={queryParams.page >= totalPages}
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
  )
}

export default SystemLogs

