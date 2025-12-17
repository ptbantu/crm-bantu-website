/**
 * 统计信息Tab
 */
import { TrendingUp, TrendingDown } from 'lucide-react'
import {
  Box,
  VStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  HStack,
} from '@chakra-ui/react'
import { ProductDetailAggregated } from '@/api/types'
import { formatPrice } from '@/utils/formatPrice'

interface StatisticsTabProps {
  data: ProductDetailAggregated
}

const StatisticsTab = ({ data }: StatisticsTabProps) => {
  const { statistics } = data

  return (
    <VStack spacing={6} align="stretch">
      {/* 关键指标 */}
      <Heading size="md">关键指标</Heading>
      <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
        <Stat>
          <StatLabel>订单量</StatLabel>
          <StatNumber fontSize="lg">{statistics.monthly_orders}</StatNumber>
          <StatHelpText>
            <HStack spacing={1}>
              <TrendingUp size={12} />
              <Text>本月</Text>
            </HStack>
          </StatHelpText>
        </Stat>

        <Stat>
          <StatLabel>收入</StatLabel>
          <StatNumber fontSize="lg">
            {statistics.monthly_revenue ? formatPrice(statistics.monthly_revenue, 'CNY') : '-'}
          </StatNumber>
          <StatHelpText>
            <HStack spacing={1}>
              <TrendingUp size={12} />
              <Text>本月</Text>
            </HStack>
          </StatHelpText>
        </Stat>

        <Stat>
          <StatLabel>完成率</StatLabel>
          <StatNumber fontSize="lg" color={statistics.completion_rate && statistics.completion_rate >= 95 ? 'green.500' : 'gray.500'}>
            {statistics.completion_rate ? `${statistics.completion_rate.toFixed(1)}%` : '-'}
          </StatNumber>
          <StatHelpText>
            {statistics.completion_rate && statistics.completion_rate >= 95 ? (
              <HStack spacing={1}>
                <TrendingUp size={12} />
                <Text>优秀</Text>
              </HStack>
            ) : (
              <Text>待提升</Text>
            )}
          </StatHelpText>
        </Stat>

        {statistics.customer_rating && (
          <Stat>
            <StatLabel>客户评分</StatLabel>
            <StatNumber fontSize="lg">{statistics.customer_rating.toFixed(1)}</StatNumber>
            <StatHelpText>⭐⭐⭐⭐⭐</StatHelpText>
          </Stat>
        )}

        {statistics.refund_rate !== null && statistics.refund_rate !== undefined && (
          <Stat>
            <StatLabel>退款率</StatLabel>
            <StatNumber fontSize="lg" color={statistics.refund_rate < 1 ? 'green.500' : 'red.500'}>
              {statistics.refund_rate.toFixed(2)}%
            </StatNumber>
            <StatHelpText>
              {statistics.refund_rate < 1 ? (
                <HStack spacing={1}>
                  <TrendingDown size={12} />
                  <Text>良好</Text>
                </HStack>
              ) : (
                <Text>需关注</Text>
              )}
            </StatHelpText>
          </Stat>
        )}

        {statistics.avg_processing_days && (
          <Stat>
            <StatLabel>平均处理</StatLabel>
            <StatNumber fontSize="lg">{statistics.avg_processing_days.toFixed(1)} 天</StatNumber>
            <StatHelpText>
              <HStack spacing={1}>
                <TrendingDown size={12} />
                <Text>效率提升</Text>
              </HStack>
            </StatHelpText>
          </Stat>
        )}
      </SimpleGrid>

      {/* 详细统计表格 */}
      <Box>
        <Heading size="md" mb={4}>详细统计</Heading>
        <Table variant="simple" size="sm">
          <Thead>
            <Tr>
              <Th>指标</Th>
              <Th>本月</Th>
              <Th>累计</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>订单量</Td>
              <Td fontWeight="medium">{statistics.monthly_orders}</Td>
              <Td>{statistics.total_orders}</Td>
            </Tr>
            <Tr>
              <Td>收入</Td>
              <Td fontWeight="medium">
                {statistics.monthly_revenue ? formatPrice(statistics.monthly_revenue, 'CNY') : '-'}
              </Td>
              <Td>
                {statistics.total_revenue ? formatPrice(statistics.total_revenue, 'CNY') : '-'}
              </Td>
            </Tr>
            <Tr>
              <Td>完成率</Td>
              <Td fontWeight="medium" colSpan={2}>
                {statistics.completion_rate ? `${statistics.completion_rate.toFixed(1)}%` : '-'}
              </Td>
            </Tr>
          </Tbody>
        </Table>
      </Box>
    </VStack>
  )
}

export default StatisticsTab
