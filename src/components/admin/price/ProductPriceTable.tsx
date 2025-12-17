/**
 * 产品价格表格组件
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
  Select,
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
  
  // 获取未来价格
  const getUpcomingPrice = (productId: string, priceType: string, currency: string) => {
    // TODO: 从即将生效价格列表中查找
    return null
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
            
            <Select
              placeholder="价格类型"
              maxW="150px"
              value={filters.price_type || ''}
              onChange={(e) => handleFilterChange('price_type', e.target.value || undefined)}
            >
              <option value="">全部类型</option>
              <option value="cost">成本价</option>
              <option value="channel">渠道价</option>
              <option value="direct">直客价</option>
              <option value="list">列表价</option>
            </Select>
            
            <Select
              placeholder="货币"
              maxW="120px"
              value={filters.currency || ''}
              onChange={(e) => handleFilterChange('currency', e.target.value || undefined)}
            >
              <option value="">全部货币</option>
              <option value="CNY">CNY</option>
              <option value="IDR">IDR</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </Select>
            
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
                    <Th>价格类型</Th>
                    <Th>当前价格</Th>
                    <Th>未来价格</Th>
                    <Th>状态</Th>
                    <Th>操作</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {prices.length === 0 ? (
                    <Tr>
                      <Td colSpan={6} textAlign="center" py={8}>
                        <Text color="gray.500">暂无数据</Text>
                      </Td>
                    </Tr>
                  ) : (
                    prices.map((price) => {
                      const status = getPriceStatus(price.effective_from, price.effective_to)
                      const upcomingPrice = getUpcomingPrice(price.product_id, price.price_type, price.currency)
                      
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
                            <VStack align="start" spacing={0}>
                              <Text>{getPriceTypeLabel(price.price_type)}</Text>
                              <Badge colorScheme="blue" fontSize="xs">
                                {getCurrencyIcon(price.currency)} {price.currency}
                              </Badge>
                            </VStack>
                          </Td>
                          <Td>
                            <Text fontWeight="bold" color="blue.500">
                              {formatPrice(Number(price.amount), price.currency)}
                            </Text>
                          </Td>
                          <Td>
                            {upcomingPrice ? (
                              <VStack align="start" spacing={0}>
                                <Text color="gray.500">
                                  {formatPrice(Number(upcomingPrice.amount), upcomingPrice.currency)}
                                </Text>
                                <Text fontSize="xs" color="gray.400">
                                  {new Date(upcomingPrice.effective_from).toLocaleDateString('zh-CN')}
                                </Text>
                              </VStack>
                            ) : (
                              <Text color="gray.400">-</Text>
                            )}
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
