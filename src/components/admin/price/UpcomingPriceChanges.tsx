/**
 * 即将生效价格变更列表组件
 */
import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  IconButton,
  Flex,
  Spinner,
  Button,
} from '@chakra-ui/react'
import { X, Eye } from 'lucide-react'
import { useToast } from '@/components/ToastContainer'
import { getUpcomingPriceChanges, PriceStrategy } from '@/api/prices'
import { formatPrice } from '@/utils/formatPrice'
import { getPriceTypeLabel, getCurrencyIcon } from '@/utils/priceUtils'
import { PriceEditModal } from './PriceEditModal'

interface UpcomingPriceChangesProps {
  isAdmin: boolean
  refreshKey?: number
}

export const UpcomingPriceChanges = ({ isAdmin, refreshKey }: UpcomingPriceChangesProps) => {
  const { showError, showSuccess } = useToast()
  
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  
  const [upcomingPrices, setUpcomingPrices] = useState<PriceStrategy[]>([])
  const [loading, setLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedPrice, setSelectedPrice] = useState<PriceStrategy | null>(null)
  
  const loadUpcomingPrices = async () => {
    setLoading(true)
    try {
      const prices = await getUpcomingPriceChanges(undefined, 168) // 未来7天
      setUpcomingPrices(prices)
    } catch (error: any) {
      showError(error.message || '加载即将生效价格失败')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadUpcomingPrices()
  }, [refreshKey])
  
  const handleCancel = async (price: PriceStrategy) => {
    if (!isAdmin) {
      showError('需要管理员权限')
      return
    }
    
    // TODO: 实现取消未来价格的功能
    showSuccess('取消功能开发中')
  }
  
  const handleView = (price: PriceStrategy) => {
    setSelectedPrice(price)
    setShowEditModal(true)
  }
  
  const getHoursUntil = (effectiveFrom: string) => {
    const now = new Date()
    const from = new Date(effectiveFrom)
    const hours = Math.floor((from.getTime() - now.getTime()) / (1000 * 60 * 60))
    return hours
  }
  
  return (
    <Card bg={bgColor} borderColor={borderColor}>
      <CardBody>
        <Flex justify="space-between" align="center" mb={4}>
          <Text fontSize="lg" fontWeight="bold">
            即将生效的价格变更
          </Text>
          <Button size="sm" variant="ghost" onClick={loadUpcomingPrices}>
            刷新
          </Button>
        </Flex>
        
        {loading ? (
          <Flex justify="center" py={8}>
            <Spinner />
          </Flex>
        ) : upcomingPrices.length === 0 ? (
          <Text textAlign="center" color="gray.500" py={8}>
            暂无即将生效的价格变更
          </Text>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>产品</Th>
                  <Th>价格类型</Th>
                  <Th>新价格</Th>
                  <Th>生效时间</Th>
                  <Th>倒计时</Th>
                  <Th>操作</Th>
                </Tr>
              </Thead>
              <Tbody>
                {upcomingPrices.map((price) => {
                  const hoursUntil = getHoursUntil(price.effective_from)
                  const daysUntil = Math.floor(hoursUntil / 24)
                  
                  return (
                    <Tr key={price.id}>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{price.product_name || price.product_id}</Text>
                          <Text fontSize="xs" color="gray.500">{price.product_id}</Text>
                        </VStack>
                      </Td>
                      <Td>
                        <Badge>
                          {getPriceTypeLabel(price.price_type)} · {getCurrencyIcon(price.currency)}
                        </Badge>
                      </Td>
                      <Td>
                        <Text fontWeight="bold" color="orange.500">
                          {formatPrice(Number(price.amount), price.currency)}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm">
                          {new Date(price.effective_from).toLocaleString('zh-CN')}
                        </Text>
                      </Td>
                      <Td>
                        <Badge colorScheme="orange">
                          {daysUntil > 0 ? `${daysUntil}天` : `${hoursUntil}小时`}后生效
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="查看"
                            icon={<Eye size={16} />}
                            size="sm"
                            variant="ghost"
                            onClick={() => handleView(price)}
                          />
                          {isAdmin && (
                            <IconButton
                              aria-label="取消"
                              icon={<X size={16} />}
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleCancel(price)}
                            />
                          )}
                        </HStack>
                      </Td>
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          </Box>
        )}
      </CardBody>
      
      {/* 编辑模态框 */}
      {showEditModal && selectedPrice && (
        <PriceEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedPrice(null)
          }}
          price={selectedPrice}
          onSuccess={() => {
            loadUpcomingPrices()
            setShowEditModal(false)
          }}
        />
      )}
    </Card>
  )
}
