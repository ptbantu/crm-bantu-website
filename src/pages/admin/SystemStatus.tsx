/**
 * 系统状态页面
 * 显示系统运行状态、性能指标等信息 - 阿里云ECS风格优化
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
  Zap,
  AlertTriangle
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
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  Divider,
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
        return AlertTriangle
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
    <Box minH="100vh" bg="var(--ali-bg-gray)">
      <Box w="full" py={4} px={6}>
        {/* 页面头部 */}
        <PageHeader
          icon={Activity}
          title={t('systemStatus.title')}
          subtitle={t('systemStatus.subtitle')}
        />

        {/* 系统运行时间与版本信息 - 阿里云ECS风格 */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
          <Card variant="elevated">
            <CardBody p={4}>
              <Flex align="center" justify="space-between">
                <HStack spacing={3}>
                  <Box
                    as={Clock}
                    size={20}
                    color="var(--ali-primary)"
                    bg="var(--ali-primary-light)"
                    p={2.5}
                    borderRadius="4px"
                  />
                  <VStack align="flex-start" spacing={0}>
                    <Text fontSize="12px" color="var(--ali-text-secondary)" fontWeight="normal">
                      {t('systemStatus.systemInfo.uptime')}
                    </Text>
                    <Text fontSize="18px" fontWeight="600" color="var(--ali-text-primary)">
                      {systemInfo.uptime}
                    </Text>
                  </VStack>
                </HStack>
              </Flex>
            </CardBody>
          </Card>
          <Card variant="elevated">
            <CardBody p={4}>
              <Flex align="center" justify="space-between">
                <HStack spacing={3}>
                  <Box
                    as={Zap}
                    size={20}
                    color="var(--ali-primary)"
                    bg="var(--ali-primary-light)"
                    p={2.5}
                    borderRadius="4px"
                  />
                  <VStack align="flex-start" spacing={0}>
                    <Text fontSize="12px" color="var(--ali-text-secondary)" fontWeight="normal">
                      {t('systemStatus.systemInfo.version')}
                    </Text>
                    <Text fontSize="18px" fontWeight="600" color="var(--ali-text-primary)">
                      {systemInfo.version}
                    </Text>
                  </VStack>
                </HStack>
              </Flex>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* 性能指标 - 阿里云ECS风格 */}
        <Card variant="elevated" mb={4}>
          <CardHeader pb={3} borderBottom="1px solid" borderColor="var(--ali-border)">
            <Heading size="sm" fontSize="14px" fontWeight="600" color="var(--ali-text-primary)">
              {t('systemStatus.performance.cpu')} / {t('systemStatus.performance.memory')} / {t('systemStatus.performance.disk')}
            </Heading>
          </CardHeader>
          <CardBody p={4}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
              {/* CPU使用率 */}
              <Box>
                <Flex justify="space-between" align="center" mb={2}>
                  <HStack spacing={2}>
                    <Box
                      as={Cpu}
                      size={16}
                      color="var(--ali-primary)"
                    />
                    <Text fontSize="12px" fontWeight="500" color="var(--ali-text-secondary)">
                      {t('systemStatus.performance.cpu')}
                    </Text>
                  </HStack>
                  <Text fontSize="14px" fontWeight="600" color="var(--ali-text-primary)">
                    {systemInfo.cpuUsage.toFixed(1)}%
                  </Text>
                </Flex>
                <Progress
                  value={systemInfo.cpuUsage}
                  colorScheme={getUsageColorScheme(systemInfo.cpuUsage)}
                  size="sm"
                  borderRadius="full"
                  bg="var(--ali-border)"
                />
              </Box>

              {/* 内存使用率 */}
              <Box>
                <Flex justify="space-between" align="center" mb={2}>
                  <HStack spacing={2}>
                    <Box
                      as={MemoryStick}
                      size={16}
                      color="var(--ali-success)"
                    />
                    <Text fontSize="12px" fontWeight="500" color="var(--ali-text-secondary)">
                      {t('systemStatus.performance.memory')}
                    </Text>
                  </HStack>
                  <Text fontSize="14px" fontWeight="600" color="var(--ali-text-primary)">
                    {systemInfo.memoryUsage.toFixed(1)}%
                  </Text>
                </Flex>
                <Progress
                  value={systemInfo.memoryUsage}
                  colorScheme={getUsageColorScheme(systemInfo.memoryUsage)}
                  size="sm"
                  borderRadius="full"
                  bg="var(--ali-border)"
                />
              </Box>

              {/* 磁盘使用率 */}
              <Box>
                <Flex justify="space-between" align="center" mb={2}>
                  <HStack spacing={2}>
                    <Box
                      as={HardDrive}
                      size={16}
                      color="var(--ali-warning)"
                    />
                    <Text fontSize="12px" fontWeight="500" color="var(--ali-text-secondary)">
                      {t('systemStatus.performance.disk')}
                    </Text>
                  </HStack>
                  <Text fontSize="14px" fontWeight="600" color="var(--ali-text-primary)">
                    {systemInfo.diskUsage.toFixed(1)}%
                  </Text>
                </Flex>
                <Progress
                  value={systemInfo.diskUsage}
                  colorScheme={getUsageColorScheme(systemInfo.diskUsage)}
                  size="sm"
                  borderRadius="full"
                  bg="var(--ali-border)"
                />
              </Box>

              {/* 数据库连接数 */}
              <Box>
                <Flex justify="space-between" align="center" mb={2}>
                  <HStack spacing={2}>
                    <Box
                      as={Database}
                      size={16}
                      color="var(--ali-primary)"
                    />
                    <Text fontSize="12px" fontWeight="500" color="var(--ali-text-secondary)">
                      {t('systemStatus.performance.dbConnections')}
                    </Text>
                  </HStack>
                  <Text fontSize="14px" fontWeight="600" color="var(--ali-text-primary)">
                    {systemInfo.dbConnections}
                  </Text>
                </Flex>
                <Text fontSize="11px" color="var(--ali-text-secondary)" mt={1}>
                  {t('systemStatus.performance.maxConnections')}: 100
                </Text>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* 服务状态卡片 - 阿里云ECS风格 */}
        <Card variant="elevated" mb={4}>
          <CardHeader pb={3} borderBottom="1px solid" borderColor="var(--ali-border)">
            <Heading size="sm" fontSize="14px" fontWeight="600" color="var(--ali-text-primary)">
              {t('systemStatus.services.title')}
            </Heading>
          </CardHeader>
          <CardBody p={4}>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={3}>
              {services.map((service, index) => {
                const IconComponent = service.icon
                const StatusIcon = getStatusIcon(service.status)
                const colorScheme = getStatusColorScheme(service.status)
                const statusColor = 
                  service.status === 'normal' ? 'var(--ali-success)' :
                  service.status === 'warning' ? 'var(--ali-warning)' :
                  'var(--ali-error)'
                const statusBg = 
                  service.status === 'normal' ? 'var(--ali-primary-light)' :
                  service.status === 'warning' ? '#FFFBE6' :
                  '#FFF1F0'
                
                return (
                  <Card
                    key={index}
                    variant="elevated"
                    borderLeft="4px solid"
                    borderLeftColor={statusColor}
                    _hover={{ 
                      boxShadow: 'var(--ali-card-shadow-hover)',
                      transform: 'translateY(-2px)' 
                    }}
                    transition="all 0.2s"
                  >
                    <CardBody p={3}>
                      <Flex justify="space-between" align="flex-start">
                        <HStack spacing={2.5} flex={1}>
                          <Box
                            as={IconComponent}
                            size={18}
                            color={statusColor}
                          />
                          <VStack align="flex-start" spacing={0} flex={1}>
                            <Text fontSize="13px" fontWeight="500" color="var(--ali-text-primary)">
                              {service.name}
                            </Text>
                            <Text fontSize="11px" color="var(--ali-text-secondary)" mt={0.5}>
                              {service.message}
                            </Text>
                          </VStack>
                        </HStack>
                        <Box
                          as={StatusIcon}
                          size={16}
                          color={statusColor}
                          flexShrink={0}
                        />
                      </Flex>
                    </CardBody>
                  </Card>
                )
              })}
            </SimpleGrid>
          </CardBody>
        </Card>

        {/* 统计信息 - 阿里云ECS风格 */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
          {/* API请求统计 */}
          <Card variant="elevated">
            <CardBody p={4}>
              <Flex align="center" justify="space-between" mb={3}>
                <HStack spacing={2.5}>
                  <Box
                    as={TrendingUp}
                    size={18}
                    color="var(--ali-primary)"
                    bg="var(--ali-primary-light)"
                    p={2}
                    borderRadius="4px"
                  />
                  <Text fontSize="12px" fontWeight="500" color="var(--ali-text-secondary)">
                    {t('systemStatus.stats.apiRequests')}
                  </Text>
                </HStack>
              </Flex>
              <VStack align="flex-start" spacing={0}>
                <Text fontSize="24px" fontWeight="600" color="var(--ali-text-primary)" lineHeight="1.2">
                  {formatNumber(systemInfo.apiRequests)}
                </Text>
                <Text fontSize="11px" color="var(--ali-text-secondary)" mt={1}>
                  {t('systemStatus.stats.today')}
                </Text>
              </VStack>
            </CardBody>
          </Card>

          {/* 活跃用户 */}
          <Card variant="elevated">
            <CardBody p={4}>
              <Flex align="center" justify="space-between" mb={3}>
                <HStack spacing={2.5}>
                  <Box
                    as={Users}
                    size={18}
                    color="var(--ali-success)"
                    bg="var(--ali-primary-light)"
                    p={2}
                    borderRadius="4px"
                  />
                  <Text fontSize="12px" fontWeight="500" color="var(--ali-text-secondary)">
                    {t('systemStatus.stats.activeUsers')}
                  </Text>
                </HStack>
              </Flex>
              <VStack align="flex-start" spacing={0}>
                <Text fontSize="24px" fontWeight="600" color="var(--ali-text-primary)" lineHeight="1.2">
                  {systemInfo.activeUsers}
                </Text>
                <Text fontSize="11px" color="var(--ali-text-secondary)" mt={1}>
                  {t('systemStatus.stats.currentOnline')}
                </Text>
              </VStack>
            </CardBody>
          </Card>

          {/* 网络状态 */}
          <Card variant="elevated">
            <CardBody p={4}>
              <Flex align="center" justify="space-between" mb={3}>
                <HStack spacing={2.5}>
                  <Box
                    as={Network}
                    size={18}
                    color="var(--ali-primary)"
                    bg="var(--ali-primary-light)"
                    p={2}
                    borderRadius="4px"
                  />
                  <Text fontSize="12px" fontWeight="500" color="var(--ali-text-secondary)">
                    {t('systemStatus.stats.network')}
                  </Text>
                </HStack>
              </Flex>
              <VStack align="flex-start" spacing={0}>
                <Badge 
                  colorScheme="green" 
                  fontSize="12px" 
                  px={2} 
                  py={1}
                  borderRadius="4px"
                >
                  {t('systemStatus.status.normal')}
                </Badge>
                <Text fontSize="11px" color="var(--ali-text-secondary)" mt={2}>
                  {t('systemStatus.stats.latency')}: 12ms
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* 系统概览 - 阿里云ECS风格 */}
        <Card variant="elevated">
          <CardHeader pb={3} borderBottom="1px solid" borderColor="var(--ali-border)">
            <Heading size="sm" fontSize="14px" fontWeight="600" color="var(--ali-text-primary)">
              {t('systemStatus.overview.title')}
            </Heading>
          </CardHeader>
          <CardBody p={4}>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
              <Box 
                bg="var(--ali-bg-light)" 
                borderRadius="4px" 
                p={3}
                border="1px solid"
                borderColor="var(--ali-border)"
              >
                <Text fontSize="11px" color="var(--ali-text-secondary)" mb={1.5} fontWeight="normal">
                  {t('systemStatus.overview.totalServices')}
                </Text>
                <Text fontSize="20px" fontWeight="600" color="var(--ali-text-primary)">
                  {services.length}
                </Text>
              </Box>
              <Box 
                bg="#F6FFED" 
                borderRadius="4px" 
                p={3}
                border="1px solid"
                borderColor="#B7EB8F"
              >
                <Text fontSize="11px" color="var(--ali-success)" mb={1.5} fontWeight="normal">
                  {t('systemStatus.overview.normalServices')}
                </Text>
                <Text fontSize="20px" fontWeight="600" color="var(--ali-success)">
                  {services.filter(s => s.status === 'normal').length}
                </Text>
              </Box>
              <Box 
                bg="#FFFBE6" 
                borderRadius="4px" 
                p={3}
                border="1px solid"
                borderColor="#FFE58F"
              >
                <Text fontSize="11px" color="var(--ali-warning)" mb={1.5} fontWeight="normal">
                  {t('systemStatus.overview.warningServices')}
                </Text>
                <Text fontSize="20px" fontWeight="600" color="var(--ali-warning)">
                  {services.filter(s => s.status === 'warning').length}
                </Text>
              </Box>
              <Box 
                bg="#FFF1F0" 
                borderRadius="4px" 
                p={3}
                border="1px solid"
                borderColor="#FFCCC7"
              >
                <Text fontSize="11px" color="var(--ali-error)" mb={1.5} fontWeight="normal">
                  {t('systemStatus.overview.errorServices')}
                </Text>
                <Text fontSize="20px" fontWeight="600" color="var(--ali-error)">
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
