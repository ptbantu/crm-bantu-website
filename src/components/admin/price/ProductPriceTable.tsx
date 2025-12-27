/**
 * 产品价格表格组件（列格式：一条记录包含所有价格类型和货币）
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
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
  Button,
  Badge,
  Text,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  Flex,
  Spinner,
  Card,
  CardBody,
} from '@chakra-ui/react'
import { Search, Plus } from 'lucide-react'
import { useToast } from '@/components/ToastContainer'
import { getPriceList, PriceStrategy, PriceListParams } from '@/api/prices'
import { formatPrice } from '@/utils/formatPrice'
import { getPriceStatus } from '@/utils/priceUtils'
import { PriceEditModal } from './PriceEditModal'
import { PriceHistoryPanel } from './PriceHistoryPanel'

interface ProductPriceTableProps {
  isAdmin: boolean
  refreshKey?: number
}

export const ProductPriceTable = ({ isAdmin, refreshKey }: ProductPriceTableProps) => {
  const { t } = useTranslation()
  const { showError } = useToast()
  
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const priceBg = useColorModeValue('blue.50', 'blue.900')
  
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
      showError(error.message || t('priceManagement.error.loadFailed'))
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
      showError(t('priceManagement.error.adminRequired'))
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
      showError(t('priceManagement.error.adminRequired'))
      return
    }
    setSelectedPrice(null)
    setShowEditModal(true)
  }
  
  // 格式化日期时间
  const formatDateTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-'
    try {
      const date = new Date(dateStr)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
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
                placeholder={t('priceManagement.searchPlaceholder')}
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
                {t('priceManagement.addPrice')}
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
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th 
                      position="sticky" 
                      left={0} 
                      zIndex={10} 
                      bg={bgColor} 
                      borderRight="1px" 
                      borderColor={borderColor}
                      whiteSpace="nowrap"
                      minW="120px"
                    >
                      {t('priceManagement.table.productName')}
                    </Th>
                    <Th whiteSpace="nowrap" minW="100px">{t('priceManagement.table.category')}</Th>
                    <Th whiteSpace="nowrap" minW="100px">{t('priceManagement.table.serviceCode')}</Th>
                    <Th bg={priceBg} whiteSpace="nowrap" minW="110px">{t('priceManagement.table.priceCostIdr')}</Th>
                    <Th bg={priceBg} whiteSpace="nowrap" minW="110px">{t('priceManagement.table.priceCostCny')}</Th>
                    <Th bg={priceBg} whiteSpace="nowrap" minW="110px">{t('priceManagement.table.priceDirectIdr')}</Th>
                    <Th bg={priceBg} whiteSpace="nowrap" minW="110px">{t('priceManagement.table.priceDirectCny')}</Th>
                    <Th bg={priceBg} whiteSpace="nowrap" minW="110px">{t('priceManagement.table.priceChannelIdr')}</Th>
                    <Th bg={priceBg} whiteSpace="nowrap" minW="110px">{t('priceManagement.table.priceChannelCny')}</Th>
                    <Th whiteSpace="nowrap" minW="140px">{t('priceManagement.table.effectiveFrom')}</Th>
                    <Th whiteSpace="nowrap" minW="140px">{t('priceManagement.table.effectiveTo')}</Th>
                    <Th whiteSpace="nowrap" minW="100px">{t('priceManagement.table.status')}</Th>
                    <Th 
                      position="sticky" 
                      right={0} 
                      zIndex={10} 
                      bg={bgColor} 
                      borderLeft="1px" 
                      borderColor={borderColor}
                      whiteSpace="nowrap"
                      minW="150px"
                    >
                      {t('priceManagement.table.actions')}
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {prices.length === 0 ? (
                    <Tr>
                      <Td colSpan={13} textAlign="center" py={8}>
                        <Text color="gray.500">{t('priceManagement.noData')}</Text>
                      </Td>
                    </Tr>
                  ) : (
                    prices.map((price) => {
                      const status = getPriceStatus(price.effective_from, price.effective_to)
                      
                      return (
                        <Tr key={price.id} _hover={{ bg: hoverBg }}>
                          <Td 
                            position="sticky" 
                            left={0} 
                            zIndex={5} 
                            bg={bgColor}
                            borderRight="1px" 
                            borderColor={borderColor}
                            fontWeight="medium"
                          >
                            {price.product_name || '-'}
                          </Td>
                          <Td>{price.category_name || '-'}</Td>
                          <Td>{price.product_code || '-'}</Td>
                          <Td bg={priceBg} fontFamily="mono" fontSize="xs">
                            {price.price_cost_idr !== null && price.price_cost_idr !== undefined 
                              ? formatPrice(price.price_cost_idr, 'IDR') 
                              : '-'}
                          </Td>
                          <Td bg={priceBg} fontFamily="mono" fontSize="xs">
                            {price.price_cost_cny !== null && price.price_cost_cny !== undefined 
                              ? formatPrice(price.price_cost_cny, 'CNY') 
                              : '-'}
                          </Td>
                          <Td bg={priceBg} fontFamily="mono" fontSize="xs">
                            {price.price_direct_idr !== null && price.price_direct_idr !== undefined 
                              ? formatPrice(price.price_direct_idr, 'IDR') 
                              : '-'}
                          </Td>
                          <Td bg={priceBg} fontFamily="mono" fontSize="xs">
                            {price.price_direct_cny !== null && price.price_direct_cny !== undefined 
                              ? formatPrice(price.price_direct_cny, 'CNY') 
                              : '-'}
                          </Td>
                          <Td bg={priceBg} fontFamily="mono" fontSize="xs">
                            {price.price_channel_idr !== null && price.price_channel_idr !== undefined 
                              ? formatPrice(price.price_channel_idr, 'IDR') 
                              : '-'}
                          </Td>
                          <Td bg={priceBg} fontFamily="mono" fontSize="xs">
                            {price.price_channel_cny !== null && price.price_channel_cny !== undefined 
                              ? formatPrice(price.price_channel_cny, 'CNY') 
                              : '-'}
                          </Td>
                          <Td fontSize="xs">{formatDateTime(price.effective_from)}</Td>
                          <Td fontSize="xs">{formatDateTime(price.effective_to)}</Td>
                          <Td>
                            <Badge 
                              colorScheme={
                                status.status === 'active' ? 'green' : 
                                status.status === 'upcoming' ? 'orange' : 
                                'red'
                              }
                            >
                              {status.status === 'active' 
                                ? t('priceManagement.table.statusActive', '生效中')
                                : status.status === 'upcoming'
                                ? t('priceManagement.table.statusUpcoming', '未来生效', { hours: status.hoursUntil || 0 })
                                : t('priceManagement.table.statusExpired', '已过期')}
                            </Badge>
                          </Td>
                          <Td 
                            position="sticky" 
                            right={0} 
                            zIndex={5} 
                            bg={bgColor}
                            borderLeft="1px" 
                            borderColor={borderColor}
                          >
                            <HStack spacing={2} flexWrap="wrap">
                              {isAdmin ? (
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="blue"
                                  onClick={() => handleEdit(price)}
                                >
                                  {t('priceManagement.table.edit')}
                                </Button>
                              ) : (
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  colorScheme="blue"
                                  onClick={() => handleEdit(price)}
                                >
                                  {t('priceManagement.table.view')}
                                </Button>
                              )}
                              <Button
                                size="xs"
                                variant="ghost"
                                colorScheme="gray"
                                onClick={() => handleViewHistory(price.product_id)}
                              >
                                {t('priceManagement.table.history')}
                              </Button>
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
                {t('priceManagement.pagination.total')} {total} {t('priceManagement.pagination.records')}
              </Text>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  isDisabled={currentPage === 1}
                >
                  {t('priceManagement.pagination.previous')}
                </Button>
                <Text fontSize="sm">
                  {t('priceManagement.pagination.page')} {currentPage} / {Math.ceil(total / pageSize)} {t('priceManagement.pagination.pageUnit')}
                </Text>
                <Button
                  size="sm"
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  isDisabled={currentPage >= Math.ceil(total / pageSize)}
                >
                  {t('priceManagement.pagination.next')}
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
