/**
 * 系统状态页面
 * 显示系统运行状态、性能指标等信息
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Database, 
  Server, 
  FileText, 
  Cpu,
  HardDrive,
  MemoryStick,
  Clock,
  Network,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react'
import { PageHeader } from '@/components/admin/PageHeader'
import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  SimpleGrid,
  VStack,
  HStack,
  Box,
  Text,
  Badge,
  Progress,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react'

interface ServiceStatus {
  name: string
  status: 'normal' | 'warning' | 'error'
  message: string
  icon: typeof CheckCircle2
}

interface SystemInfo {
  uptime: string
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  dbConnections: number
  apiRequests: number
  activeUsers: number
  version: string
}

const SystemStatus = () => {
  const { t } = useTranslation()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    uptime: '15天 8小时 32分钟',
    cpuUsage: 45.2,
    memoryUsage: 62.8,
    diskUsage: 38.5,
    dbConnections: 24,
    apiRequests: 1234,
    activeUsers: 156,
    version: 'v2.1.0',
  })

  // Mock数据 - 服务状态
  const services: ServiceStatus[] = [
    {
      name: t('systemStatus.services.backend'),
      status: 'normal',
      message: t('systemStatus.status.normal'),
      icon: Server,
    },
    {
      name: 'MySQL',
      status: 'normal',
      message: t('systemStatus.status.normal'),
      icon: Database,
    },
    {
      name: 'MongoDB',
      status: 'normal',
      message: t('systemStatus.status.normal'),
      icon: Database,
    },
    {
      name: 'Redis',
      status: 'normal',
      message: t('systemStatus.status.normal'),
      icon: Database,
    },
    {
      name: t('systemStatus.services.log'),
      status: 'normal',
      message: t('systemStatus.status.normal'),
      icon: FileText,
    },
    {
      name: t('systemStatus.services.backendService'),
      status: 'normal',
      message: t('systemStatus.status.normal'),
      icon: Cpu,
    },
  ]

  // 模拟实时更新（每30秒更新一次）
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemInfo(prev => ({
        ...prev,
        cpuUsage: Math.max(20, Math.min(80, prev.cpuUsage + (Math.random() - 0.5) * 5)),
        memoryUsage: Math.max(30, Math.min(90, prev.memoryUsage + (Math.random() - 0.5) * 3)),
        apiRequests: prev.apiRequests + Math.floor(Math.random() * 10),
      }))
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColorScheme = (status: string): string => {
    switch (status) {
      case 'normal':
        return 'green'
      case 'warning':
        return 'yellow'
      case 'error':
        return 'red'
      default:
        return 'gray'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return CheckCircle2
      case 'warning':
      case 'error':
        return XCircle
      default:
        return Activity
    }
  }

  const getUsageColorScheme = (usage: number): string => {
    if (usage < 50) return 'green'
    if (usage < 80) return 'yellow'
    return 'red'
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('zh-CN')
  }

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Box w="full" py={2} px={1}>
        {/* 页面头部 */}
        <PageHeader
          icon={Activity}
          title={t('systemStatus.title')}
          subtitle={t('systemStatus.subtitle')}
        />

        {/* 系统运行时间与版本信息 */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} mb={3}>
          <Card bg="blue.50" borderColor="blue.200" borderWidth={1}>
            <CardBody>
              <HStack spacing={3} mb={3}>
                <Box
                  as={Clock}
                  size={6}
                  color="blue.600"
                  bg="blue.100"
                  p={2}
                  borderRadius="lg"
                />
                <Text fontSize="sm" fontWeight="semibold" color="blue.700">
                  {t('systemStatus.systemInfo.uptime')}
                </Text>
              </HStack>
              <Text fontSize="lg" fontWeight="bold" color="blue.900">
                {systemInfo.uptime}
              </Text>
            </CardBody>
          </Card>
          <Card bg="purple.50" borderColor="purple.200" borderWidth={1}>
            <CardBody>
              <HStack spacing={3} mb={3}>
                <Box
                  as={Zap}
                  size={6}
                  color="purple.600"
                  bg="purple.100"
                  p={2}
                  borderRadius="lg"
                />
                <Text fontSize="sm" fontWeight="semibold" color="purple.700">
                  {t('systemStatus.systemInfo.version')}
                </Text>
              </HStack>
              <Text fontSize="lg" fontWeight="bold" color="purple.900">
                {systemInfo.version}
              </Text>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* 性能指标 */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={3} mb={3}>
          {/* CPU使用率 */}
          <Card bg={bgColor} borderColor={borderColor}>
            <CardBody>
              <HStack justify="space-between" mb={3}>
                <HStack spacing={3}>
                  <Box
                    as={Cpu}
                    size={5}
                    color="blue.600"
                    bg="blue.50"
                    p={2}
                    borderRadius="lg"
                  />
                  <Text fontSize="xs" fontWeight="medium" color="gray.700">
                    {t('systemStatus.performance.cpu')}
                  </Text>
                </HStack>
                <Text fontSize="sm" fontWeight="bold" color="gray.900">
                  {systemInfo.cpuUsage.toFixed(1)}%
                </Text>
              </HStack>
              <Progress
                value={systemInfo.cpuUsage}
                colorScheme={getUsageColorScheme(systemInfo.cpuUsage)}
                size="sm"
                borderRadius="full"
              />
            </CardBody>
          </Card>

          {/* 内存使用率 */}
          <Card bg={bgColor} borderColor={borderColor}>
            <CardBody>
              <HStack justify="space-between" mb={3}>
                <HStack spacing={3}>
                  <Box
                    as={MemoryStick}
                    size={5}
                    color="green.600"
                    bg="green.50"
                    p={2}
                    borderRadius="lg"
                  />
                  <Text fontSize="xs" fontWeight="medium" color="gray.700">
                    {t('systemStatus.performance.memory')}
                  </Text>
                </HStack>
                <Text fontSize="sm" fontWeight="bold" color="gray.900">
                  {systemInfo.memoryUsage.toFixed(1)}%
                </Text>
              </HStack>
              <Progress
                value={systemInfo.memoryUsage}
                colorScheme={getUsageColorScheme(systemInfo.memoryUsage)}
                size="sm"
                borderRadius="full"
              />
            </CardBody>
          </Card>

          {/* 磁盘使用率 */}
          <Card bg={bgColor} borderColor={borderColor}>
            <CardBody>
              <HStack justify="space-between" mb={3}>
                <HStack spacing={3}>
                  <Box
                    as={HardDrive}
                    size={5}
                    color="orange.600"
                    bg="orange.50"
                    p={2}
                    borderRadius="lg"
                  />
                  <Text fontSize="xs" fontWeight="medium" color="gray.700">
                    {t('systemStatus.performance.disk')}
                  </Text>
                </HStack>
                <Text fontSize="sm" fontWeight="bold" color="gray.900">
                  {systemInfo.diskUsage.toFixed(1)}%
                </Text>
              </HStack>
              <Progress
                value={systemInfo.diskUsage}
                colorScheme={getUsageColorScheme(systemInfo.diskUsage)}
                size="sm"
                borderRadius="full"
              />
            </CardBody>
          </Card>

          {/* 数据库连接数 */}
          <Card bg={bgColor} borderColor={borderColor}>
            <CardBody>
              <HStack justify="space-between" mb={2}>
                <HStack spacing={3}>
                  <Box
                    as={Database}
                    size={5}
                    color="indigo.600"
                    bg="indigo.50"
                    p={2}
                    borderRadius="lg"
                  />
                  <Text fontSize="xs" fontWeight="medium" color="gray.700">
                    {t('systemStatus.performance.dbConnections')}
                  </Text>
                </HStack>
                <Text fontSize="sm" fontWeight="bold" color="gray.900">
                  {systemInfo.dbConnections}
                </Text>
              </HStack>
              <Text fontSize="xs" color="gray.500" mt={1}>
                {t('systemStatus.performance.maxConnections')}: 100
              </Text>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* 服务状态卡片 */}
        <Box mb={3}>
          <Heading size="sm" mb={2} color="gray.900">
            {t('systemStatus.services.title')}
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
            {services.map((service, index) => {
              const IconComponent = service.icon
              const StatusIcon = getStatusIcon(service.status)
              const colorScheme = getStatusColorScheme(service.status)
              return (
                <Card
                  key={index}
                  bg={`${colorScheme}.50`}
                  borderColor={`${colorScheme}.200`}
                  borderWidth={2}
                  _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
                  transition="all 0.2s"
                >
                  <CardBody>
                    <HStack justify="space-between" mb={3}>
                      <HStack spacing={3}>
                        <Box
                          as={IconComponent}
                          size={6}
                          color={`${colorScheme}.600`}
                          bg={`${colorScheme}.100`}
                          p={2}
                          borderRadius="lg"
                        />
                        <Text fontSize="sm" fontWeight="semibold" color="gray.900">
                          {service.name}
                        </Text>
                      </HStack>
                      <Box
                        as={StatusIcon}
                        size={5}
                        color={`${colorScheme}.600`}
                        bg={`${colorScheme}.100`}
                        p={1.5}
                        borderRadius="md"
                      />
                    </HStack>
                    <Text fontSize="xs" color="gray.600" fontWeight="medium">
                      {service.message}
                    </Text>
                  </CardBody>
                </Card>
              )
            })}
          </SimpleGrid>
        </Box>

        {/* 统计信息 */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={3} mb={3}>
          {/* API请求统计 */}
          <Card bg="blue.50" borderColor="blue.200" borderWidth={1}>
            <CardBody>
              <HStack spacing={3} mb={3}>
                <Box
                  as={TrendingUp}
                  size={6}
                  color="blue.600"
                  bg="blue.100"
                  p={2}
                  borderRadius="lg"
                />
                <Text fontSize="sm" fontWeight="semibold" color="blue.700">
                  {t('systemStatus.stats.apiRequests')}
                </Text>
              </HStack>
              <Stat>
                <StatNumber fontSize="2xl" fontWeight="bold" color="blue.900" mb={1}>
                  {formatNumber(systemInfo.apiRequests)}
                </StatNumber>
                <StatHelpText fontSize="xs" color="blue.600" m={0}>
                  {t('systemStatus.stats.today')}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          {/* 活跃用户 */}
          <Card bg="green.50" borderColor="green.200" borderWidth={1}>
            <CardBody>
              <HStack spacing={3} mb={3}>
                <Box
                  as={Users}
                  size={6}
                  color="green.600"
                  bg="green.100"
                  p={2}
                  borderRadius="lg"
                />
                <Text fontSize="sm" fontWeight="semibold" color="green.700">
                  {t('systemStatus.stats.activeUsers')}
                </Text>
              </HStack>
              <Stat>
                <StatNumber fontSize="2xl" fontWeight="bold" color="green.900" mb={1}>
                  {systemInfo.activeUsers}
                </StatNumber>
                <StatHelpText fontSize="xs" color="green.600" m={0}>
                  {t('systemStatus.stats.currentOnline')}
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>

          {/* 网络状态 */}
          <Card bg="purple.50" borderColor="purple.200" borderWidth={1}>
            <CardBody>
              <HStack spacing={3} mb={3}>
                <Box
                  as={Network}
                  size={6}
                  color="purple.600"
                  bg="purple.100"
                  p={2}
                  borderRadius="lg"
                />
                <Text fontSize="sm" fontWeight="semibold" color="purple.700">
                  {t('systemStatus.stats.network')}
                </Text>
              </HStack>
              <Stat>
                <StatNumber fontSize="2xl" fontWeight="bold" color="green.600" mb={1}>
                  {t('systemStatus.status.normal')}
                </StatNumber>
                <StatHelpText fontSize="xs" color="purple.600" m={0}>
                  {t('systemStatus.stats.latency')}: 12ms
                </StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* 系统概览 */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader pb={3}>
            <Heading size="sm" color="gray.900">
              {t('systemStatus.overview.title')}
            </Heading>
          </CardHeader>
          <CardBody pt={0}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={3}>
              <Box bg="gray.50" borderRadius="lg" p={2.5}>
                <Text fontSize="xs" color="gray.500" mb={1}>
                  {t('systemStatus.overview.totalServices')}
                </Text>
                <Text fontSize="lg" fontWeight="semibold" color="gray.900">
                  {services.length}
                </Text>
              </Box>
              <Box bg="green.50" borderRadius="lg" p={2.5}>
                <Text fontSize="xs" color="green.600" mb={1}>
                  {t('systemStatus.overview.normalServices')}
                </Text>
                <Text fontSize="lg" fontWeight="semibold" color="green.700">
                  {services.filter(s => s.status === 'normal').length}
                </Text>
              </Box>
              <Box bg="yellow.50" borderRadius="lg" p={2.5}>
                <Text fontSize="xs" color="yellow.600" mb={1}>
                  {t('systemStatus.overview.warningServices')}
                </Text>
                <Text fontSize="lg" fontWeight="semibold" color="yellow.700">
                  {services.filter(s => s.status === 'warning').length}
                </Text>
              </Box>
              <Box bg="red.50" borderRadius="lg" p={2.5}>
                <Text fontSize="xs" color="red.600" mb={1}>
                  {t('systemStatus.overview.errorServices')}
                </Text>
                <Text fontSize="lg" fontWeight="semibold" color="red.700">
                  {services.filter(s => s.status === 'error').length}
                </Text>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>
      </Box>
    </Box>
  )
}

export default SystemStatus
