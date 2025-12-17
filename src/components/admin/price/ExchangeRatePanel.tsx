/**
 * 汇率管理面板组件
 */
import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Button,
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
} from '@chakra-ui/react'
import { Edit, History, TrendingUp, TrendingDown } from 'lucide-react'
import { useToast } from '@/components/ToastContainer'
import {
  getCurrentRates,
  getRateHistory,
  ExchangeRateHistory,
  ExchangeRateListParams,
} from '@/api/exchangeRates'
import { formatCurrency, calculatePriceChange } from '@/utils/priceUtils'
import { ExchangeRateEditModal } from './ExchangeRateEditModal'

interface ExchangeRatePanelProps {
  isAdmin: boolean
  refreshKey?: number
}

export const ExchangeRatePanel = ({ isAdmin, refreshKey }: ExchangeRatePanelProps) => {
  const { showError } = useToast()
  
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  
  const [currentRates, setCurrentRates] = useState<ExchangeRateHistory[]>([])
  const [rateHistory, setRateHistory] = useState<ExchangeRateHistory[]>([])
  const [loading, setLoading] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [selectedRate, setSelectedRate] = useState<ExchangeRateHistory | null>(null)
  
  // 加载当前汇率
  const loadCurrentRates = async () => {
    setLoading(true)
    try {
      const rates = await getCurrentRates()
      setCurrentRates(rates)
    } catch (error: any) {
      showError(error.message || '加载汇率失败')
    } finally {
      setLoading(false)
    }
  }
  
  // 加载汇率历史
  const loadRateHistory = async () => {
    try {
      const result = await getRateHistory({ page: 1, size: 10 })
      setRateHistory(result.records)
    } catch (error: any) {
      showError(error.message || '加载汇率历史失败')
    }
  }
  
  useEffect(() => {
    loadCurrentRates()
    loadRateHistory()
  }, [refreshKey])
  
  // 处理编辑汇率
  const handleEdit = (rate: ExchangeRateHistory) => {
    if (!isAdmin) {
      showError('需要管理员权限')
      return
    }
    setSelectedRate(rate)
    setShowEditModal(true)
  }
  
  // 主要货币对（IDR -> CNY）
  const mainRate = currentRates.find(r => r.from_currency === 'IDR' && r.to_currency === 'CNY')
  
  return (
    <VStack spacing={4} align="stretch">
      {/* 当前有效汇率卡片 */}
      <Card bg={bgColor} borderColor={borderColor}>
        <CardBody>
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize="lg" fontWeight="bold">
              当前有效汇率
            </Text>
            {isAdmin && (
              <Button
                size="sm"
                leftIcon={<Edit size={16} />}
                colorScheme="blue"
                onClick={() => mainRate && handleEdit(mainRate)}
              >
                编辑汇率
              </Button>
            )}
          </Flex>
          
          {loading ? (
            <Flex justify="center" py={8}>
              <Spinner />
            </Flex>
          ) : mainRate ? (
            <Box
              p={4}
              bg="blue.50"
              borderRadius="md"
              border="1px"
              borderColor="blue.200"
            >
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" color="gray.600">
                    {mainRate.from_currency} → {mainRate.to_currency}
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                    {formatCurrency(mainRate.rate, mainRate.from_currency, { showSymbol: false })}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    生效: {new Date(mainRate.effective_from).toLocaleDateString('zh-CN')}
                  </Text>
                </VStack>
                {isAdmin && (
                  <IconButton
                    aria-label="编辑"
                    icon={<Edit size={20} />}
                    onClick={() => handleEdit(mainRate)}
                    colorScheme="blue"
                    variant="ghost"
                  />
                )}
              </HStack>
            </Box>
          ) : (
            <Text color="gray.500" textAlign="center" py={4}>
              暂无汇率数据
            </Text>
          )}
        </CardBody>
      </Card>
      
      {/* 汇率历史 */}
      <Card bg={bgColor} borderColor={borderColor}>
        <CardBody>
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontSize="lg" fontWeight="bold">
              汇率历史
            </Text>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowHistoryModal(true)}
            >
              查看更多
            </Button>
          </Flex>
          
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>日期</Th>
                  <Th>汇率</Th>
                  <Th>变更</Th>
                  <Th>操作人</Th>
                </Tr>
              </Thead>
              <Tbody>
                {rateHistory.length === 0 ? (
                  <Tr>
                    <Td colSpan={4} textAlign="center" py={4}>
                      <Text color="gray.500">暂无历史记录</Text>
                    </Td>
                  </Tr>
                ) : (
                  rateHistory.map((rate, index) => {
                    const prevRate = index < rateHistory.length - 1 ? rateHistory[index + 1] : null
                    const change = prevRate ? calculatePriceChange(prevRate.rate, rate.rate) : null
                    
                    return (
                      <Tr key={rate.id}>
                        <Td>{new Date(rate.effective_from).toLocaleDateString('zh-CN')}</Td>
                        <Td>
                          <Text fontWeight="medium">
                            {formatCurrency(rate.rate, rate.from_currency, { showSymbol: false })}
                          </Text>
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
                            <Text fontSize="sm" color="gray.400">
                              -
                            </Text>
                          )}
                        </Td>
                        <Td>
                          <Text fontSize="sm" color="gray.500">
                            {rate.changed_by || '-'}
                          </Text>
                        </Td>
                      </Tr>
                    )
                  })
                )}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>
      
      {/* 编辑汇率模态框 */}
      {showEditModal && selectedRate && (
        <ExchangeRateEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedRate(null)
          }}
          rate={selectedRate}
          onSuccess={() => {
            loadCurrentRates()
            loadRateHistory()
            setShowEditModal(false)
          }}
        />
      )}
    </VStack>
  )
}
