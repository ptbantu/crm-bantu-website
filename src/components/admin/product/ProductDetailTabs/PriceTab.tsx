/**
 * 价格信息Tab
 */
import { useTranslation } from 'react-i18next'
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
  Badge,
  Heading,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react'
import { ProductDetailAggregated } from '@/api/types'
import { formatPrice } from '@/utils/formatPrice'

interface PriceTabProps {
  data: ProductDetailAggregated
}

const PriceTab = ({ data }: PriceTabProps) => {
  const { t } = useTranslation()
  const { prices, overview } = data
  const bgColor = useColorModeValue('white', 'gray.800')
  const priceBgColor = useColorModeValue('blue.50', 'blue.900')

  // 分离当前价格和未来价格
  const currentPrices = prices.filter(p => p.status === 'active')
  const upcomingPrices = prices.filter(p => p.status === 'upcoming')

  // 如果没有价格历史，显示产品表中的价格（和产品列表一致）
  const hasPriceHistory = prices.length > 0

  // 从当前价格中提取所有8个价格字段（和产品列表一致）
  const getCurrentPriceRow = () => {
    const priceMap: Record<string, { idr?: number; cny?: number }> = {}
    
    currentPrices.forEach(price => {
      const key = price.price_type // cost, channel, direct, list
      if (!priceMap[key]) {
        priceMap[key] = {}
      }
      if (price.currency === 'IDR') {
        priceMap[key].idr = price.price || undefined
      } else if (price.currency === 'CNY') {
        priceMap[key].cny = price.price || undefined
      }
    })

    return {
      price_cost_idr: priceMap.cost?.idr,
      price_cost_cny: priceMap.cost?.cny,
      price_direct_idr: priceMap.direct?.idr,
      price_direct_cny: priceMap.direct?.cny,
      price_channel_idr: priceMap.channel?.idr,
      price_channel_cny: priceMap.channel?.cny,
    }
  }

  const currentPriceRow = hasPriceHistory && currentPrices.length > 0 ? getCurrentPriceRow() : null

  return (
    <VStack spacing={6} align="stretch">
      {hasPriceHistory ? (
        <>
          {/* 当前生效价格 - 左侧列是价格分类，右侧两列是CNY和IDR */}
          {currentPriceRow && (
            <Box>
              <Heading size="md" mb={4}>
                {t('productManagement.detail.currentPrices', '当前生效价格')}
              </Heading>
              {currentPrices.length > 0 && currentPrices[0].effective_from && (
                <Text fontSize="sm" color="gray.600" mb={2}>
                  {t('productManagement.detail.effectiveFrom', '生效时间')}: {new Date(currentPrices[0].effective_from).toLocaleDateString()}
                </Text>
              )}
              <Box overflowX="auto">
                <Table variant="simple" size="sm" minW="400px">
                  <Thead>
                    <Tr>
                      <Th>{t('productManagement.detail.priceType', '价格分类')}</Th>
                      <Th bg={priceBgColor}>{t('productManagement.detail.currencyCny', 'CNY')}</Th>
                      <Th bg={priceBgColor}>{t('productManagement.detail.currencyIdr', 'IDR')}</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    <Tr>
                      <Td fontWeight="medium">{t('productManagement.detail.priceTypes.cost', '成本价')}</Td>
                      <Td bg={priceBgColor} fontFamily="mono" textAlign="left">
                        {currentPriceRow.price_cost_cny ? formatPrice(currentPriceRow.price_cost_cny, 'CNY') : '-'}
                      </Td>
                      <Td bg={priceBgColor} fontFamily="mono" textAlign="left">
                        {currentPriceRow.price_cost_idr ? formatPrice(currentPriceRow.price_cost_idr, 'IDR') : '-'}
                      </Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="medium">{t('productManagement.detail.priceTypes.direct', '直客价')}</Td>
                      <Td bg={priceBgColor} fontFamily="mono" textAlign="left">
                        {currentPriceRow.price_direct_cny ? formatPrice(currentPriceRow.price_direct_cny, 'CNY') : '-'}
                      </Td>
                      <Td bg={priceBgColor} fontFamily="mono" textAlign="left">
                        {currentPriceRow.price_direct_idr ? formatPrice(currentPriceRow.price_direct_idr, 'IDR') : '-'}
                      </Td>
                    </Tr>
                    <Tr>
                      <Td fontWeight="medium">{t('productManagement.detail.priceTypes.channel', '渠道价')}</Td>
                      <Td bg={priceBgColor} fontFamily="mono" textAlign="left">
                        {currentPriceRow.price_channel_cny ? formatPrice(currentPriceRow.price_channel_cny, 'CNY') : '-'}
                      </Td>
                      <Td bg={priceBgColor} fontFamily="mono" textAlign="left">
                        {currentPriceRow.price_channel_idr ? formatPrice(currentPriceRow.price_channel_idr, 'IDR') : '-'}
                      </Td>
                    </Tr>
                  </Tbody>
                </Table>
              </Box>
            </Box>
          )}

          {/* 未来生效价格 */}
          {upcomingPrices.length > 0 && (
            <Box>
              <Divider my={4} />
              <Heading size="md" mb={4}>
                {t('productManagement.detail.upcomingPrices', '未来生效价格')} ({upcomingPrices.length})
              </Heading>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>{t('productManagement.detail.priceType', '类型')}</Th>
                    <Th>{t('productManagement.detail.currency', '货币')}</Th>
                    <Th>{t('productManagement.detail.price', '价格')}</Th>
                    <Th>{t('productManagement.detail.effectiveFrom', '生效时间')}</Th>
                    <Th>{t('productManagement.detail.status', '状态')}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {upcomingPrices.map((price, index) => (
                    <Tr key={index}>
                      <Td>{t(`productManagement.detail.priceTypes.${price.price_type}`, price.price_type)}</Td>
                      <Td>{price.currency}</Td>
                      <Td fontWeight="medium" fontFamily="mono">
                        {price.price ? formatPrice(price.price, price.currency) : '-'}
                      </Td>
                      <Td fontSize="sm">
                        {price.effective_from ? new Date(price.effective_from).toLocaleDateString() : '-'}
                      </Td>
                      <Td>
                        <Badge colorScheme="yellow">
                          {t('productManagement.detail.pending', '待生效')}
                        </Badge>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </>
      ) : (
        <Box>
          {/* 显示产品表中的价格 - 左侧列是价格分类，右侧两列是CNY和IDR */}
          <Heading size="md" mb={4}>
            {t('productManagement.detail.priceInfo', '价格信息')}
          </Heading>
          <Box overflowX="auto">
            <Table variant="simple" size="sm" minW="400px">
              <Thead>
                <Tr>
                  <Th>{t('productManagement.detail.priceType', '价格分类')}</Th>
                  <Th bg={priceBgColor}>{t('productManagement.detail.currencyCny', 'CNY')}</Th>
                  <Th bg={priceBgColor}>{t('productManagement.detail.currencyIdr', 'IDR')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td fontWeight="medium">{t('productManagement.detail.priceTypes.cost', '成本价')}</Td>
                  <Td bg={priceBgColor} fontFamily="mono" textAlign="left">
                    {overview.price_cost_cny ? formatPrice(overview.price_cost_cny, 'CNY') : '-'}
                  </Td>
                  <Td bg={priceBgColor} fontFamily="mono" textAlign="left">
                    {overview.price_cost_idr ? formatPrice(overview.price_cost_idr, 'IDR') : '-'}
                  </Td>
                </Tr>
                <Tr>
                  <Td fontWeight="medium">{t('productManagement.detail.priceTypes.direct', '直客价')}</Td>
                  <Td bg={priceBgColor} fontFamily="mono" textAlign="left">
                    {overview.price_direct_cny ? formatPrice(overview.price_direct_cny, 'CNY') : '-'}
                  </Td>
                  <Td bg={priceBgColor} fontFamily="mono" textAlign="left">
                    {overview.price_direct_idr ? formatPrice(overview.price_direct_idr, 'IDR') : '-'}
                  </Td>
                </Tr>
                <Tr>
                  <Td fontWeight="medium">{t('productManagement.detail.priceTypes.channel', '渠道价')}</Td>
                  <Td bg={priceBgColor} fontFamily="mono" textAlign="left">
                    {overview.price_channel_cny ? formatPrice(overview.price_channel_cny, 'CNY') : '-'}
                  </Td>
                  <Td bg={priceBgColor} fontFamily="mono" textAlign="left">
                    {overview.price_channel_idr ? formatPrice(overview.price_channel_idr, 'IDR') : '-'}
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
          {!overview.price_cost_idr && !overview.price_cost_cny && 
           !overview.price_direct_idr && !overview.price_direct_cny && 
           !overview.price_channel_idr && !overview.price_channel_cny && (
            <Text color="gray.500" mt={4}>
              {t('productManagement.detail.noPriceInfo', '暂无价格信息')}
            </Text>
          )}
        </Box>
      )}
    </VStack>
  )
}

export default PriceTab
