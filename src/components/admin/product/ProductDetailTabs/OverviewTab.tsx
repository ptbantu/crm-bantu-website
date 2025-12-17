/**
 * 产品概览Tab
 */
import { Tag, CheckCircle2, XCircle, Clock } from 'lucide-react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Divider,
} from '@chakra-ui/react'
import { ProductDetailAggregated } from '@/api/types'
import { formatPrice } from '@/utils/formatPrice'

interface OverviewTabProps {
  data: ProductDetailAggregated
}

const OverviewTab = ({ data }: OverviewTabProps) => {
  const { overview, statistics } = data

  return (
    <VStack spacing={6} align="stretch">
      {/* 基本信息卡片 */}
      <Box>
        <HStack spacing={3} mb={4}>
          <Box fontSize="xl" fontWeight="bold">
            {overview.name}
          </Box>
          {overview.code && (
            <Badge colorScheme="blue" fontSize="sm" fontFamily="mono">
              {overview.code}
            </Badge>
          )}
          {overview.is_active ? (
            <Badge colorScheme="green" fontSize="xs">
              <CheckCircle2 size={12} style={{ display: 'inline', marginRight: 4 }} />
              已上架
            </Badge>
          ) : (
            <Badge colorScheme="red" fontSize="xs">
              <XCircle size={12} style={{ display: 'inline', marginRight: 4 }} />
              未上架
            </Badge>
          )}
        </HStack>

        <HStack spacing={4} fontSize="sm" color="gray.600">
          {overview.category_name && (
            <HStack spacing={1}>
              <Tag size={14} />
              <Text>{overview.category_name}</Text>
            </HStack>
          )}
          {overview.processing_days && (
            <HStack spacing={1}>
              <Clock size={14} />
              <Text>{overview.processing_days} 天</Text>
            </HStack>
          )}
          {overview.updated_at && (
            <Text>更新: {new Date(overview.updated_at).toLocaleDateString('zh-CN')}</Text>
          )}
        </HStack>
      </Box>

      <Divider />

      {/* 关键指标 */}
      <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
        <Stat>
          <StatLabel>处理时长</StatLabel>
          <StatNumber fontSize="lg">
            {overview.processing_days ? `${overview.processing_days} 天` : '-'}
          </StatNumber>
          {overview.processing_time_text && (
            <StatHelpText>{overview.processing_time_text}</StatHelpText>
          )}
        </Stat>

        <Stat>
          <StatLabel>所需材料</StatLabel>
          <StatNumber fontSize="lg">
            {overview.required_documents ? '已配置' : '未配置'}
          </StatNumber>
        </Stat>

        <Stat>
          <StatLabel>本月订单</StatLabel>
          <StatNumber fontSize="lg">{statistics.monthly_orders}</StatNumber>
          <StatHelpText>累计: {statistics.total_orders} 单</StatHelpText>
        </Stat>

        <Stat>
          <StatLabel>完成率</StatLabel>
          <StatNumber fontSize="lg" color={statistics.completion_rate && statistics.completion_rate >= 95 ? 'green.500' : 'gray.500'}>
            {statistics.completion_rate ? `${statistics.completion_rate.toFixed(1)}%` : '-'}
          </StatNumber>
        </Stat>

        <Stat>
          <StatLabel>累计订单</StatLabel>
          <StatNumber fontSize="lg">{statistics.total_orders}</StatNumber>
        </Stat>

        {statistics.customer_rating && (
          <Stat>
            <StatLabel>客户评分</StatLabel>
            <StatNumber fontSize="lg">{statistics.customer_rating.toFixed(1)}</StatNumber>
            <StatHelpText>⭐⭐⭐⭐⭐</StatHelpText>
          </Stat>
        )}
      </SimpleGrid>
    </VStack>
  )
}

export default OverviewTab
