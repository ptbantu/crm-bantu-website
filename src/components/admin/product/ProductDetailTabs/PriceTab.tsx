/**
 * 价格信息Tab
 */
import { DollarSign } from 'lucide-react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Heading,
  Divider,
} from '@chakra-ui/react'
import { ProductDetailAggregated } from '@/api/types'
import { formatPrice } from '@/utils/formatPrice'

interface PriceTabProps {
  data: ProductDetailAggregated
}

const PriceTab = ({ data }: PriceTabProps) => {
  const { prices, overview } = data

  // 分离当前价格和未来价格
  const currentPrices = prices.filter(p => p.status === 'active')
  const upcomingPrices = prices.filter(p => p.status === 'upcoming')

  // 如果没有价格历史，显示产品表中的价格
  const hasPriceHistory = prices.length > 0

  return (
    <VStack spacing={6} align="stretch">
      {hasPriceHistory ? (
        <>
          {/* 当前生效价格 */}
          {currentPrices.length > 0 && (
            <Box>
              <Heading size="md" mb={4}>
                当前生效价格
              </Heading>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>类型</Th>
                    <Th>货币</Th>
                    <Th>价格</Th>
                    <Th>生效时间</Th>
                    <Th>最后更新</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {currentPrices.map((price, index) => (
                    <Tr key={index}>
                      <Td>{price.price_type}</Td>
                      <Td>{price.currency}</Td>
                      <Td fontWeight="medium">
                        {price.price ? formatPrice(price.price, price.currency) : '-'}
                      </Td>
                      <Td fontSize="sm">
                        {price.effective_from ? new Date(price.effective_from).toLocaleDateString('zh-CN') : '-'}
                      </Td>
                      <Td fontSize="sm">
                        {price.updated_at ? new Date(price.updated_at).toLocaleDateString('zh-CN') : '-'}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}

          {/* 未来生效价格 */}
          {upcomingPrices.length > 0 && (
            <Box>
              <Divider my={4} />
              <Heading size="md" mb={4}>
                未来生效价格 ({upcomingPrices.length}条)
              </Heading>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>类型</Th>
                    <Th>货币</Th>
                    <Th>价格</Th>
                    <Th>生效时间</Th>
                    <Th>状态</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {upcomingPrices.map((price, index) => (
                    <Tr key={index}>
                      <Td>{price.price_type}</Td>
                      <Td>{price.currency}</Td>
                      <Td fontWeight="medium">
                        {price.price ? formatPrice(price.price, price.currency) : '-'}
                      </Td>
                      <Td fontSize="sm">
                        {price.effective_from ? new Date(price.effective_from).toLocaleDateString('zh-CN') : '-'}
                      </Td>
                      <Td>
                        <Badge colorScheme="yellow">待生效</Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </>
      ) : (
        /* 显示产品表中的价格 */
        <Box>
          <Heading size="md" mb={4}>
            价格信息
          </Heading>
          <VStack spacing={3} align="stretch">
            {overview.price_cost_cny && (
              <HStack>
                <DollarSign size={16} />
                <Text>成本价 (CNY): {formatPrice(overview.price_cost_cny, 'CNY')}</Text>
              </HStack>
            )}
            {overview.price_channel_cny && (
              <HStack>
                <DollarSign size={16} />
                <Text>渠道价 (CNY): {formatPrice(overview.price_channel_cny, 'CNY')}</Text>
              </HStack>
            )}
            {overview.price_direct_cny && (
              <HStack>
                <DollarSign size={16} />
                <Text>直客价 (CNY): {formatPrice(overview.price_direct_cny, 'CNY')}</Text>
              </HStack>
            )}
            {overview.price_list_cny && (
              <HStack>
                <DollarSign size={16} />
                <Text>列表价 (CNY): {formatPrice(overview.price_list_cny, 'CNY')}</Text>
              </HStack>
            )}
            {!overview.price_cost_cny && !overview.price_channel_cny && !overview.price_direct_cny && !overview.price_list_cny && (
              <Text color="gray.500">暂无价格信息</Text>
            )}
          </VStack>
        </Box>
      )}
    </VStack>
  )
}

export default PriceTab
