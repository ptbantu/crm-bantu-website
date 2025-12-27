/**
 * 价格历史面板组件（列格式：一条记录包含所有价格类型和货币）
 */
import { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue,
  Spinner,
  Flex,
  Box,
  Grid,
  GridItem,
} from '@chakra-ui/react'
import { getPriceHistory, PriceHistory } from '@/api/prices'
import { formatPrice } from '@/utils/formatPrice'
import { getPriceTypeLabel, getCurrencyIcon } from '@/utils/priceUtils'

interface PriceHistoryPanelProps {
  isOpen: boolean
  onClose: () => void
  productId: string
}

export const PriceHistoryPanel = ({ isOpen, onClose, productId }: PriceHistoryPanelProps) => {
  const [history, setHistory] = useState<PriceHistory[]>([])
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    if (isOpen && productId) {
      loadHistory()
    }
  }, [isOpen, productId])
  
  const loadHistory = async () => {
    setLoading(true)
    try {
      const result = await getPriceHistory(productId, { page: 1, size: 50 })
      setHistory(result.records)
    } catch (error: any) {
      console.error('Failed to load price history:', error)
    } finally {
      setLoading(false)
    }
  }
  
  // 获取价格显示（列格式：一条记录包含所有价格）
  const getPriceDisplay = (price: PriceHistory) => {
    const prices: Array<{ type: string; currency: string; value: number | null }> = []
    
    if (price.price_channel_idr !== null && price.price_channel_idr !== undefined) {
      prices.push({ type: 'channel', currency: 'IDR', value: price.price_channel_idr })
    }
    if (price.price_channel_cny !== null && price.price_channel_cny !== undefined) {
      prices.push({ type: 'channel', currency: 'CNY', value: price.price_channel_cny })
    }
    if (price.price_direct_idr !== null && price.price_direct_idr !== undefined) {
      prices.push({ type: 'direct', currency: 'IDR', value: price.price_direct_idr })
    }
    if (price.price_direct_cny !== null && price.price_direct_cny !== undefined) {
      prices.push({ type: 'direct', currency: 'CNY', value: price.price_direct_cny })
    }
    
    return prices
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>价格历史记录（列格式：一条记录包含所有价格类型和货币）</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          {loading ? (
            <Flex justify="center" py={8}>
              <Spinner />
            </Flex>
          ) : history.length === 0 ? (
            <Text textAlign="center" color="gray.500" py={8}>
              暂无历史记录
            </Text>
          ) : (
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>时间</Th>
                  <Th>价格详情（列格式）</Th>
                  <Th>生效时间</Th>
                  <Th>变更原因</Th>
                </Tr>
              </Thead>
              <Tbody>
                {history.map((item) => {
                  const priceDisplay = getPriceDisplay(item)
                  
                  return (
                    <Tr key={item.id}>
                      <Td>
                        <Text fontSize="sm">
                          {new Date(item.created_at).toLocaleString('zh-CN')}
                        </Text>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={2}>
                          {priceDisplay.length === 0 ? (
                            <Text fontSize="sm" color="gray.400">暂无价格</Text>
                          ) : (
                            priceDisplay.map((p, idx) => (
                              <HStack key={idx} spacing={2}>
                                <Badge colorScheme="blue" fontSize="xs">
                                  {getPriceTypeLabel(p.type)}
                                </Badge>
                                <Badge colorScheme="green" fontSize="xs">
                                  {getCurrencyIcon(p.currency)} {p.currency}
                                </Badge>
                                <Text fontSize="sm" fontWeight="medium">
                                  {formatPrice(p.value!, p.currency)}
                                </Text>
                              </HStack>
                            ))
                          )}
                          {item.exchange_rate && (
                            <Text fontSize="xs" color="gray.500">
                              汇率: {item.exchange_rate}
                            </Text>
                          )}
                        </VStack>
                      </Td>
                      <Td>
                        <VStack align="start" spacing={0}>
                          <Text fontSize="xs">
                            {new Date(item.effective_from).toLocaleDateString('zh-CN')}
                          </Text>
                          {item.effective_to && (
                            <Text fontSize="xs" color="gray.500">
                              至 {new Date(item.effective_to).toLocaleDateString('zh-CN')}
                            </Text>
                          )}
                        </VStack>
                      </Td>
                      <Td>
                        <Text fontSize="sm" color="gray.500">
                          {item.change_reason || '-'}
                        </Text>
                      </Td>
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          )}
        </ModalBody>
        
        <ModalFooter>
          <Button onClick={onClose}>关闭</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
