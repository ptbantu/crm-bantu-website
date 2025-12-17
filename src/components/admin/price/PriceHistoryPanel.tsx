/**
 * 价格历史面板组件
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
} from '@chakra-ui/react'
import { getPriceHistory, PriceHistory } from '@/api/prices'
import { formatPrice } from '@/utils/formatPrice'
import { getPriceTypeLabel, getCurrencyIcon, calculatePriceChange } from '@/utils/priceUtils'
import { TrendingUp, TrendingDown } from 'lucide-react'

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
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>价格历史记录</ModalHeader>
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
                  <Th>价格类型</Th>
                  <Th>变更前</Th>
                  <Th>变更后</Th>
                  <Th>变动</Th>
                  <Th>生效时间</Th>
                  <Th>变更原因</Th>
                </Tr>
              </Thead>
              <Tbody>
                {history.map((item) => {
                  const change = calculatePriceChange(item.old_price, item.new_price)
                  
                  return (
                    <Tr key={item.id}>
                      <Td>
                        <Text fontSize="sm">
                          {new Date(item.created_at).toLocaleString('zh-CN')}
                        </Text>
                      </Td>
                      <Td>
                        <Badge>
                          {getPriceTypeLabel(item.price_type)} · {getCurrencyIcon(item.currency)}
                        </Badge>
                      </Td>
                      <Td>
                        {item.old_price !== null ? (
                          <Text fontSize="sm">
                            {formatPrice(item.old_price, item.currency)}
                          </Text>
                        ) : (
                          <Text fontSize="sm" color="gray.400">-</Text>
                        )}
                      </Td>
                      <Td>
                        {item.new_price !== null ? (
                          <Text fontSize="sm" fontWeight="medium">
                            {formatPrice(item.new_price, item.currency)}
                          </Text>
                        ) : (
                          <Text fontSize="sm" color="gray.400">-</Text>
                        )}
                      </Td>
                      <Td>
                        {change && change.direction !== 'same' ? (
                          <HStack spacing={1}>
                            {change.direction === 'up' ? (
                              <TrendingUp size={14} color="#52C41A" />
                            ) : (
                              <TrendingDown size={14} color="#F5222D" />
                            )}
                            <Text
                              fontSize="sm"
                              color={change.direction === 'up' ? 'green.500' : 'red.500'}
                            >
                              {change.direction === 'up' ? '+' : '-'}
                              {change.percentage.toFixed(2)}%
                            </Text>
                          </HStack>
                        ) : (
                          <Text fontSize="sm" color="gray.400">-</Text>
                        )}
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
