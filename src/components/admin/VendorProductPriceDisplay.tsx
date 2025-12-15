/**
 * 供应商产品价格展示组件
 * 展示双价格（CNY和IDR）和价格历史
 * 如果新价格未到生效时间，展示两行（即将生效 + 历史价格）
 */
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { formatPrice } from '@/utils/formatPrice'
import { PriceHistoryItem } from '@/api/suppliers'
import {
  VStack,
  HStack,
  Text,
  Box,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react'
import { Calendar, Clock } from 'lucide-react'

export interface VendorProductPriceDisplayProps {
  costPriceCny?: number | null
  costPriceIdr?: number | null
  priceHistory?: PriceHistoryItem[]
  onEdit?: () => void
}

const VendorProductPriceDisplay = ({
  costPriceCny,
  costPriceIdr,
  priceHistory = [],
  onEdit,
}: VendorProductPriceDisplayProps) => {
  const { t } = useTranslation()
  
  const textColor = useColorModeValue('gray.700', 'gray.300')
  const labelColor = useColorModeValue('gray.500', 'gray.400')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const futureBg = useColorModeValue('blue.50', 'blue.900')
  const currentBg = useColorModeValue('gray.50', 'gray.800')

  // 获取当前价格和即将生效的价格
  const { currentPrice, futurePrice } = useMemo(() => {
    const now = new Date()
    
    // 查找当前有效的价格历史
    const current = priceHistory.find(
      (item) =>
        new Date(item.effective_from) <= now &&
        (!item.effective_to || new Date(item.effective_to) >= now)
    )
    
    // 查找即将生效的价格历史
    const future = priceHistory.find(
      (item) =>
        new Date(item.effective_from) > now &&
        !item.effective_to
    )
    
    return {
      currentPrice: current || null,
      futurePrice: future || null,
    }
  }, [priceHistory])

  // 格式化日期时间（使用 UTC+7 时区）
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    // 转换为 UTC+7 时区显示
    return date.toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 如果没有价格历史，使用当前价格
  const displayCurrentCny = currentPrice?.new_price_cny ?? costPriceCny
  const displayCurrentIdr = currentPrice?.new_price_idr ?? costPriceIdr

  // 判断是否有任何价格信息
  const hasAnyPrice = displayCurrentCny != null || displayCurrentIdr != null || futurePrice != null
  // 判断是否只有一条记录（没有价格历史，但有当前价格）
  const hasOnlyCurrentPrice = priceHistory.length === 0 && (costPriceCny != null || costPriceIdr != null)

  return (
    <VStack align="stretch" spacing={3}>
      {/* 即将生效的价格 */}
      {futurePrice && (
        <Box
          p={3}
          borderRadius="md"
          bg={futureBg}
          borderWidth="1px"
          borderColor="blue.200"
        >
          <HStack mb={2} justify="space-between">
            <HStack spacing={2}>
              <Clock size={14} color="blue" />
              <Text fontSize="xs" fontWeight="semibold" color="blue.700">
                {t('vendorProductPrice.futurePrice')}
              </Text>
            </HStack>
            <Badge colorScheme="blue" fontSize="xs">
              {t('vendorProductPrice.effectiveFrom')}: {formatDateTime(futurePrice.effective_from)}
            </Badge>
          </HStack>
          
          <VStack align="stretch" spacing={1.5} fontSize="sm">
            <Text fontWeight="medium" color={textColor}>
              {formatPrice(futurePrice.new_price_cny, 'CNY')}
            </Text>
            <Text fontWeight="medium" color={textColor}>
              {formatPrice(futurePrice.new_price_idr, 'IDR')}
            </Text>
          </VStack>
        </Box>
      )}

      {/* 当前价格 - 如果有价格信息就显示，即使只有一条记录 */}
      {hasAnyPrice && (
        <Box
          p={3}
          borderRadius="md"
          bg={currentBg}
          borderWidth="1px"
          borderColor={borderColor}
        >
          {/* 只有在有价格历史时才显示生效时间 */}
          {currentPrice && priceHistory.length > 0 && (
            <HStack mb={2} justify="flex-end">
              <Badge fontSize="xs" colorScheme="gray">
                {currentPrice.effective_to
                  ? `${t('vendorProductPrice.effectiveFrom')}: ${formatDateTime(currentPrice.effective_from)} - ${formatDateTime(currentPrice.effective_to)}`
                  : `${t('vendorProductPrice.effectiveFrom')}: ${formatDateTime(currentPrice.effective_from)}`}
              </Badge>
            </HStack>
          )}
          
          <VStack align="stretch" spacing={1.5} fontSize="sm">
            <Text fontWeight="medium" color={textColor}>
              {formatPrice(displayCurrentCny, 'CNY')}
            </Text>
            <Text fontWeight="medium" color={textColor}>
              {formatPrice(displayCurrentIdr, 'IDR')}
            </Text>
          </VStack>
        </Box>
      )}

      {/* 只有在真正没有任何价格信息时才显示"暂无价格" */}
      {!hasAnyPrice && (
        <Text fontSize="sm" color={labelColor} textAlign="center" py={2}>
          {t('vendorProductPrice.noPrice')}
        </Text>
      )}
    </VStack>
  )
}

export default VendorProductPriceDisplay
