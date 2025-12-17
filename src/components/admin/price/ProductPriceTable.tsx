/**
 * 产品价格表格组件（列格式：一条记录包含所有价格类型和货币）
 */
import { useState, useEffect, useMemo } from 'react'
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  HStack,
  VStack,
  Button,
  Badge,
  Text,
  IconButton,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  Flex,
  Spinner,
  Card,
  CardBody,
  Grid,
  GridItem,
} from '@chakra-ui/react'
import { Search, Edit, Eye, History, Plus, Filter } from 'lucide-react'
import { useToast } from '@/components/ToastContainer'
import { getPriceList, PriceStrategy, PriceListParams } from '@/api/prices'
import { formatPrice } from '@/utils/formatPrice'
import { getPriceStatus, getPriceTypeLabel, getCurrencyIcon } from '@/utils/priceUtils'
import { PriceEditModal } from './PriceEditModal'
import { PriceHistoryPanel } from './PriceHistoryPanel'

interface ProductPriceTableProps {
  isAdmin: boolean
  refreshKey?: number
}

export const ProductPriceTable = ({ isAdmin, refreshKey }: ProductPriceTableProps) => {
  const { showError } = useToast()
  
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  
  const [prices, setPrices] = useState<PriceStrategy[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  
  // 筛选条件
  const [filters, setFilters] = useState<PriceListParams>({
    page: 1,
    size: pageSize,
  })
  const [searchKeyword, setSearchKeyword] = useState('')
  
  // 模态框状态
  const [showEditModal, setShowEditModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [selectedPrice, setSelectedPrice] = useState<PriceStrategy | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  
  // 加载价格列表
  const loadPrices = async () => {
    setLoading(true)
    try {
      const params: PriceListParams = {
        ...filters,
        page: currentPage,
        size: pageSize,
      }
      const result = await getPriceList(params)
      setPrices(result.records)
      setTotal(result.total)
    } catch (error: any) {
      showError(error.message || '加载价格列表失败')
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadPrices()
  }, [currentPage, filters, refreshKey])
  
  // 处理筛选
  const handleFilterChange = (key: keyof PriceListParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }
  
  // 处理编辑
  const handleEdit = (price: PriceStrategy) => {
    if (!isAdmin) {
      showError('需要管理员权限')
      return
    }
    setSelectedPrice(price)
    setShowEditModal(true)
  }
  
  // 处理查看历史
  const handleViewHistory = (productId: string) => {
    setSelectedProductId(productId)
    setShowHistoryModal(true)
  }
  
  // 处理新增价格
  const handleAddPrice = () => {
    if (!isAdmin) {
      showError('需要管理员权限')
      return
    }
    setSelectedPrice(null)
    setShowEditModal(true)
  }
  
  // 获取价格显示（列格式：一条记录包含所有价格）
  const getPriceDisplay = (price: PriceStrategy) => {
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
    if (price.price_list_idr !== null && price.price_list_idr !== undefined) {
      prices.push({ type: 'list', currency: 'IDR', value: price.price_list_idr })
    }
    if (price.price_list_cny !== null && price.price_list_cny !== undefined) {
      prices.push({ type: 'list', currency: 'CNY', value: price.price_list_cny })
    }
    
    return prices
  }
  
  return (
    <Box>
      {/* 筛选栏 */}
      <Card mb={4} bg={bgColor} borderColor={borderColor}>
        <CardBody>
          <Flex gap={4} wrap="wrap" align="center">
            <InputGroup maxW="300px">
              <InputLeftElement pointerEvents="none">
                <Search size={16} />
              </InputLeftElement>
              <Input
                placeholder="搜索产品名称或编码"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </InputGroup>
            
            {isAdmin && (
              <Button
                leftIcon={<Plus size={16} />}
                colorScheme="blue"
                onClick={handleAddPrice}
              >
                新增价格
              </Button>
            )}
          </Flex>
        </CardBody>
      </Card>
      
      {/* 价格表格 */}
      <Card bg={bgColor} borderColor={borderColor}>
        <CardBody p={0}>
          {loading ? (
            <Flex justify="center" align="center" py={8}>
              <Spinner size="lg" />
            </Flex>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>产品信息</Th>
                    <Th>价格详情（列格式：一条记录包含所有价格）</Th>
                    <Th>状态</Th>
                    <Th>操作</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {prices.length === 0 ? (
                    <Tr>
                      <Td colSpan={4} textAlign="center" py={8}>
                        <Text color="gray.500">暂无数据</Text>
                      </Td>
                    </Tr>
                  ) : (
                    prices.map((price) => {
                      const status = getPriceStatus(price.effective_from, price.effective_to)
                      const priceDisplay = getPriceDisplay(price)
                      
                      return (
                        <Tr key={price.id} _hover={{ bg: hoverBg }}>
                          <Td>
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="medium">{price.product_name || '未知产品'}</Text>
                              <Text fontSize="sm" color="gray.500">
                                {price.product_id}
                              </Text>
                            </VStack>
                          </Td>
                          <Td>
                            <VStack align="start" spacing={2}>
                              {priceDisplay.length === 0 ? (
                                <Text color="gray.400">暂无价格</Text>
                              ) : (
                                priceDisplay.map((p, idx) => (
                                  <HStack key={idx} spacing={2}>
                                    <Badge colorScheme="blue" fontSize="xs">
                                      {getPriceTypeLabel(p.type)}
                                    </Badge>
                                    <Badge colorScheme="green" fontSize="xs">
                                      {getCurrencyIcon(p.currency)} {p.currency}
                                    </Badge>
                                    <Text fontWeight="bold" color="blue.500" fontSize="sm">
                                      {formatPrice(p.value!, p.currency)}
                                    </Text>
                                  </HStack>
                                ))
                              )}
                              {price.exchange_rate && (
                                <Text fontSize="xs" color="gray.500">
                                  汇率: {price.exchange_rate}
                                </Text>
                              )}
                            </VStack>
                          </Td>
                          <Td>
                            <Badge colorScheme={status.status === 'active' ? 'green' : status.status === 'upcoming' ? 'orange' : 'red'}>
                              {status.label}
                            </Badge>
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              {isAdmin ? (
                                <IconButton
                                  aria-label="编辑"
                                  icon={<Edit size={16} />}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEdit(price)}
                                />
                              ) : (
                                <IconButton
                                  aria-label="查看"
                                  icon={<Eye size={16} />}
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleEdit(price)}
                                />
                              )}
                              <IconButton
                                aria-label="历史"
                                icon={<History size={16} />}
                                size="sm"
                                variant="ghost"
                                onClick={() => handleViewHistory(price.product_id)}
                              />
                            </HStack>
                          </Td>
                        </Tr>
                      )
                    })
                  )}
                </Tbody>
              </Table>
            </Box>
          )}
          
          {/* 分页 */}
          {total > pageSize && (
            <Flex justify="space-between" align="center" p={4} borderTop="1px" borderColor={borderColor}>
              <Text fontSize="sm" color="gray.500">
                共 {total} 条记录
              </Text>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  isDisabled={currentPage === 1}
                >
                  上一页
                </Button>
                <Text fontSize="sm">
                  第 {currentPage} / {Math.ceil(total / pageSize)} 页
                </Text>
                <Button
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  isDisabled={currentPage >= Math.ceil(total / pageSize)}
                >
                  下一页
                </Button>
              </HStack>
            </Flex>
          )}
        </CardBody>
      </Card>
      
      {/* 编辑模态框 */}
      {showEditModal && (
        <PriceEditModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false)
            setSelectedPrice(null)
          }}
          price={selectedPrice}
          onSuccess={() => {
            loadPrices()
            setShowEditModal(false)
          }}
        />
      )}
      
      {/* 历史记录模态框 */}
      {showHistoryModal && selectedProductId && (
        <PriceHistoryPanel
          isOpen={showHistoryModal}
          onClose={() => {
            setShowHistoryModal(false)
            setSelectedProductId(null)
          }}
          productId={selectedProductId}
        />
      )}
    </Box>
  )
}
