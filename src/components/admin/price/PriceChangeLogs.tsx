/**
 * 价格变更日志组件
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
  Flex,
  Spinner,
  Badge,
  Button,
} from '@chakra-ui/react'
import { Search } from 'lucide-react'
import { useToast } from '@/components/ToastContainer'
import { getPriceChangeLogs, PriceChangeLog, PriceChangeLogListParams } from '@/api/priceChangeLogs'
import { formatPrice } from '@/utils/formatPrice'
import { getPriceTypeLabel, getCurrencyIcon, calculatePriceChange } from '@/utils/priceUtils'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface PriceChangeLogsProps {
  refreshKey?: number
}

export const PriceChangeLogs = ({ refreshKey }: PriceChangeLogsProps) => {
  const { t } = useTranslation()
  const { showError } = useToast()
  
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  
  const [logs, setLogs] = useState<PriceChangeLog[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  
  const [filters, setFilters] = useState<PriceChangeLogListParams>({
    page: 1,
    size: pageSize,
  })
  
  const loadLogs = async () => {
    setLoading(true)
    try {
      const params: PriceChangeLogListParams = {
        ...filters,
        page: currentPage,
        size: pageSize,
      }
      const result = await getPriceChangeLogs(params)
      setLogs(result.records)
      setTotal(result.total)
    } catch (error: any) {
      showError(error.message || t('priceManagement.error.loadLogsFailed', '加载日志失败'))
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    loadLogs()
  }, [currentPage, filters, refreshKey])
  
  const handleFilterChange = (key: keyof PriceChangeLogListParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }
  
  const getChangeTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      create: t('priceManagement.changeType.create', '创建'),
      update: t('priceManagement.changeType.update', '更新'),
      delete: t('priceManagement.changeType.delete', '删除'),
      activate: t('priceManagement.changeType.activate', '激活'),
      deactivate: t('priceManagement.changeType.deactivate', '停用'),
    }
    return labels[type] || type
  }
  
  return (
    <Card bg={bgColor} borderColor={borderColor}>
      <CardBody>
        {/* 筛选栏 */}
        <Flex gap={4} mb={4} wrap="wrap">
          <Select
            placeholder={t('priceManagement.filter.changeType', '变更类型')}
            maxW="150px"
            value={filters.change_type || ''}
            onChange={(e) => handleFilterChange('change_type', e.target.value || undefined)}
          >
            <option value="">{t('priceManagement.filter.allTypes', '全部类型')}</option>
            <option value="create">{t('priceManagement.changeType.create', '创建')}</option>
            <option value="update">{t('priceManagement.changeType.update', '更新')}</option>
            <option value="delete">{t('priceManagement.changeType.delete', '删除')}</option>
          </Select>
          
          <Select
            placeholder={t('priceManagement.filter.priceType', '价格类型')}
            maxW="150px"
            value={filters.price_type || ''}
            onChange={(e) => handleFilterChange('price_type', e.target.value || undefined)}
          >
            <option value="">{t('priceManagement.filter.allTypes', '全部类型')}</option>
            <option value="cost">{t('productManagement.detail.priceTypes.cost', '成本价')}</option>
            <option value="channel">{t('productManagement.detail.priceTypes.channel', '渠道价')}</option>
            <option value="direct">{t('productManagement.detail.priceTypes.direct', '直客价')}</option>
            <option value="list">{t('productManagement.detail.priceTypes.list', '列表价')}</option>
          </Select>
          
          <Select
            placeholder={t('priceManagement.filter.currency', '货币')}
            maxW="120px"
            value={filters.currency || ''}
            onChange={(e) => handleFilterChange('currency', e.target.value || undefined)}
          >
            <option value="">{t('priceManagement.filter.allCurrencies', '全部货币')}</option>
            <option value="CNY">CNY</option>
            <option value="IDR">IDR</option>
          </Select>
        </Flex>
        
        {/* 日志表格 */}
        {loading ? (
          <Flex justify="center" py={8}>
            <Spinner />
          </Flex>
        ) : logs.length === 0 ? (
          <Text textAlign="center" color="gray.500" py={8}>
            {t('priceManagement.noLogs', '暂无日志记录')}
          </Text>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>{t('priceManagement.table.time', '时间')}</Th>
                  <Th>{t('priceManagement.table.product', '产品')}</Th>
                  <Th>{t('priceManagement.table.changeType', '变更类型')}</Th>
                  <Th>{t('priceManagement.table.priceType', '价格类型')}</Th>
                  <Th>{t('priceManagement.table.before', '变更前')}</Th>
                  <Th>{t('priceManagement.table.after', '变更后')}</Th>
                  <Th>{t('priceManagement.table.change', '变动')}</Th>
                  <Th>{t('priceManagement.table.operator', '操作人')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {logs.map((log) => {
                  const change = calculatePriceChange(log.old_price, log.new_price)
                  
                  return (
                    <Tr key={log.id}>
                      <Td>
                        <Text fontSize="sm">
                          {new Date(log.changed_at).toLocaleString('zh-CN')}
                        </Text>
                      </Td>
                      <Td>
                        <Text fontSize="sm" color="gray.600">
                          {log.product_id}
                        </Text>
                      </Td>
                      <Td>
                        <Badge>{getChangeTypeLabel(log.change_type)}</Badge>
                      </Td>
                      <Td>
                        <Badge fontSize="xs">
                          {getPriceTypeLabel(log.price_type)} · {getCurrencyIcon(log.currency)}
                        </Badge>
                      </Td>
                      <Td>
                        {log.old_price !== null ? (
                          <Text fontSize="sm">
                            {formatPrice(log.old_price, log.currency)}
                          </Text>
                        ) : (
                          <Text fontSize="sm" color="gray.400">-</Text>
                        )}
                      </Td>
                      <Td>
                        {log.new_price !== null ? (
                          <Text fontSize="sm" fontWeight="medium">
                            {formatPrice(log.new_price, log.currency)}
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
                        <Text fontSize="sm" color="gray.500">
                          {log.changed_by || '-'}
                        </Text>
                      </Td>
                    </Tr>
                  )
                })}
              </Tbody>
            </Table>
          </Box>
        )}
        
        {/* 分页 */}
        {total > pageSize && (
          <Flex justify="space-between" align="center" mt={4} pt={4} borderTop="1px" borderColor={borderColor}>
            <Text fontSize="sm" color="gray.500">
              {t('priceManagement.pagination.total', '共')} {total} {t('priceManagement.pagination.records', '条记录')}
            </Text>
            <HStack spacing={2}>
              <Button
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                isDisabled={currentPage === 1}
              >
                {t('priceManagement.pagination.previous', '上一页')}
              </Button>
              <Text fontSize="sm">
                {t('priceManagement.pagination.page', '第')} {currentPage} / {Math.ceil(total / pageSize)} {t('priceManagement.pagination.pageUnit', '页')}
              </Text>
              <Button
                size="sm"
                onClick={() => setCurrentPage(prev => prev + 1)}
                isDisabled={currentPage >= Math.ceil(total / pageSize)}
              >
                {t('priceManagement.pagination.next', '下一页')}
              </Button>
            </HStack>
          </Flex>
        )}
      </CardBody>
    </Card>
  )
}
