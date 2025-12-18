/**
 * 系统状态组件
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Card,
  CardBody,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Badge,
  Progress,
  VStack,
  HStack,
  Text,
} from '@chakra-ui/react'
import { CheckCircle2, XCircle, Activity } from 'lucide-react'
import { ConfigCard } from './ConfigCard'
import { getSystemStatus, SystemStatus } from '@/api/systemConfig'

export const SystemStatusComponent = () => {
  const { t } = useTranslation()
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStatus()
    const interval = setInterval(loadStatus, 30000) // 每30秒刷新一次
    return () => clearInterval(interval)
  }, [])

  const loadStatus = async () => {
    try {
      const data = await getSystemStatus()
      setStatus(data)
    } catch (error) {
      console.error('Failed to load system status:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (statusText: string) => {
    if (statusText === '正常') return 'green'
    if (statusText === '异常') return 'red'
    return 'gray'
  }

  if (loading || !status) {
    return <ConfigCard title={t('systemConfig.status.title')}>加载中...</ConfigCard>
  }

  return (
    <ConfigCard title={t('systemConfig.status.title')}>
      <VStack spacing={4} align="stretch">
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Stat>
            <StatLabel>{t('systemConfig.status.version')}</StatLabel>
            <StatNumber fontSize="2xl">{status.version}</StatNumber>
          </Stat>

          <Stat>
            <StatLabel>{t('systemConfig.status.uptime')}</StatLabel>
            <StatNumber fontSize="2xl">{status.uptime}</StatNumber>
          </Stat>
        </SimpleGrid>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={4}>
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={2}>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    {t('systemConfig.status.database')}
                  </Text>
                  <Badge colorScheme={getStatusColor(status.database_status)}>
                    {status.database_status}
                  </Badge>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <VStack align="stretch" spacing={2}>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    Redis
                  </Text>
                  <Badge colorScheme={getStatusColor(status.redis_status)}>
                    {status.redis_status}
                  </Badge>
                </HStack>
              </VStack>
            </CardBody>
          </Card>

          <Card>
            <CardBody>
              <VStack align="stretch" spacing={2}>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    MongoDB
                  </Text>
                  <Badge colorScheme={getStatusColor(status.mongodb_status)}>
                    {status.mongodb_status}
                  </Badge>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {status.cpu_usage !== undefined && (
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={2}>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    {t('systemConfig.status.cpuUsage')}
                  </Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {status.cpu_usage.toFixed(1)}%
                  </Text>
                </HStack>
                <Progress
                  value={status.cpu_usage}
                  colorScheme={status.cpu_usage > 80 ? 'red' : status.cpu_usage > 50 ? 'yellow' : 'green'}
                  size="sm"
                />
              </VStack>
            </CardBody>
          </Card>
        )}

        {status.memory_usage !== undefined && (
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={2}>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    {t('systemConfig.status.memoryUsage')}
                  </Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {status.memory_usage.toFixed(1)}%
                  </Text>
                </HStack>
                <Progress
                  value={status.memory_usage}
                  colorScheme={status.memory_usage > 80 ? 'red' : status.memory_usage > 50 ? 'yellow' : 'green'}
                  size="sm"
                />
              </VStack>
            </CardBody>
          </Card>
        )}

        {status.disk_usage !== undefined && (
          <Card>
            <CardBody>
              <VStack align="stretch" spacing={2}>
                <HStack justify="space-between">
                  <Text fontSize="sm" color="gray.600">
                    {t('systemConfig.status.diskUsage')}
                  </Text>
                  <Text fontSize="sm" fontWeight="bold">
                    {status.disk_usage.toFixed(1)}%
                  </Text>
                </HStack>
                <Progress
                  value={status.disk_usage}
                  colorScheme={status.disk_usage > 80 ? 'red' : status.disk_usage > 50 ? 'yellow' : 'green'}
                  size="sm"
                />
              </VStack>
            </CardBody>
          </Card>
        )}

        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mt={4}>
          {status.active_users !== undefined && (
            <Stat>
              <StatLabel>{t('systemConfig.status.activeUsers')}</StatLabel>
              <StatNumber>{status.active_users}</StatNumber>
            </Stat>
          )}

          {status.total_requests !== undefined && (
            <Stat>
              <StatLabel>{t('systemConfig.status.totalRequests')}</StatLabel>
              <StatNumber>{status.total_requests.toLocaleString()}</StatNumber>
            </Stat>
          )}
        </SimpleGrid>
      </VStack>
    </ConfigCard>
  )
}
