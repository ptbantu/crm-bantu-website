/**
 * 批量价格编辑器组件
 * 顶部：批量操作栏（统一设置价格）
 * 中间：产品价格编辑表格（行内编辑）
 * 底部：操作按钮
 * 符合阿里云ECS高密度风格
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { RefreshCw } from 'lucide-react'
import {
  getSupplierServices,
  SupplierService,
} from '@/api/suppliers'
import { useToast } from '@/components/ToastContainer'
import { formatPrice } from '@/utils/formatPrice'
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Select,
  Spinner,
  Flex,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react'

export interface BatchPriceEditorProps {
  supplierId: string
  productIds: string[]
  onConfirm: (updates: Array<{
    product_id: string
    cost_price?: number | null
    currency?: string | null
    processing_days?: number | null
    is_available?: boolean | null
  }>) => void
  onCancel: () => void
}

interface ProductPriceRow {
  product_id: string
  product_name: string
  product_code?: string | null
  current_cost_price?: number | null
  current_currency?: string | null
  current_processing_days?: number | null
  current_is_available: boolean
  // 编辑后的值
  cost_price?: number | null
  currency?: string | null
  processing_days?: number | null
  is_available?: boolean | null
  // 是否已修改
  isModified: boolean
}

const BatchPriceEditor = ({
  supplierId,
  productIds,
  onConfirm,
  onCancel,
}: BatchPriceEditorProps) => {
  const { t } = useTranslation()
  const { showError } = useToast()

  // 颜色模式
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('#F0F0F0', 'gray.700')
  const hoverBg = useColorModeValue('#F5F5F5', 'gray.700')

  // 状态
  const [loading, setLoading] = useState(false)
  const [rows, setRows] = useState<ProductPriceRow[]>([])
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set())

  // 批量操作值
  const [batchCostPrice, setBatchCostPrice] = useState('')
  const [batchCurrency, setBatchCurrency] = useState<string>('IDR')
  const [batchProcessingDays, setBatchProcessingDays] = useState('')
  const [batchIsAvailable, setBatchIsAvailable] = useState<string>('')

  // 加载产品数据
  useEffect(() => {
    const loadProducts = async () => {
      if (productIds.length === 0) return

      setLoading(true)
      try {
        // 获取供应商的所有服务
        const result = await getSupplierServices(supplierId, {
          page: 1,
          size: 1000, // 获取所有
        })

        // 过滤出选中的产品
        const selectedProducts = result.records.filter(service =>
          productIds.includes(service.product_id)
        )

        // 转换为行数据
        const initialRows: ProductPriceRow[] = selectedProducts.map(service => ({
          product_id: service.product_id,
          product_name: service.product_name,
          product_code: service.product_code,
          current_cost_price: service.cost_price,
          current_currency: service.currency || 'IDR',
          current_processing_days: service.processing_days,
          current_is_available: service.is_available,
          cost_price: service.cost_price,
          currency: service.currency || 'IDR',
          processing_days: service.processing_days,
          is_available: service.is_available,
          isModified: false,
        }))

        setRows(initialRows)
      } catch (error: any) {
        console.error('Failed to load products:', error)
        showError(error.message || t('batchPriceEditor.loadError'))
      } finally {
        setLoading(false)
      }
    }

    if (supplierId && productIds.length > 0) {
      loadProducts()
    }
  }, [supplierId, productIds, t, showError])

  // 更新行数据
  const updateRow = (productId: string, field: keyof ProductPriceRow, value: any) => {
    setRows(prevRows =>
      prevRows.map(row => {
        if (row.product_id === productId) {
          const updated = { ...row, [field]: value }
          // 检查是否已修改
          const isModified =
            updated.cost_price !== updated.current_cost_price ||
            updated.currency !== updated.current_currency ||
            updated.processing_days !== updated.current_processing_days ||
            updated.is_available !== updated.current_is_available
          return { ...updated, isModified }
        }
        return row
      })
    )
  }

  // 批量应用
  const handleBatchApply = () => {
    const updates: Partial<ProductPriceRow> = {}

    if (batchCostPrice.trim()) {
      updates.cost_price = parseFloat(batchCostPrice) || null
    }
    if (batchCurrency) {
      updates.currency = batchCurrency
    }
    if (batchProcessingDays.trim()) {
      updates.processing_days = parseInt(batchProcessingDays) || null
    }
    if (batchIsAvailable !== '') {
      updates.is_available = batchIsAvailable === 'true'
    }

    // 应用到选中的行
    if (selectedRows.size > 0) {
      setRows(prevRows =>
        prevRows.map(row => {
          if (selectedRows.has(row.product_id)) {
            const updated = { ...row, ...updates }
            const isModified =
              updated.cost_price !== updated.current_cost_price ||
              updated.currency !== updated.current_currency ||
              updated.processing_days !== updated.current_processing_days ||
              updated.is_available !== updated.current_is_available
            return { ...updated, isModified }
          }
          return row
        })
      )
    } else {
      // 应用到所有行
      setRows(prevRows =>
        prevRows.map(row => {
          const updated = { ...row, ...updates }
          const isModified =
            updated.cost_price !== updated.current_cost_price ||
            updated.currency !== updated.current_currency ||
            updated.processing_days !== updated.current_processing_days ||
            updated.is_available !== updated.current_is_available
          return { ...updated, isModified }
        })
      )
    }

    // 清空批量操作值
    setBatchCostPrice('')
    setBatchCurrency('IDR')
    setBatchProcessingDays('')
    setBatchIsAvailable('')
  }

  // 重置单行
  const handleResetRow = (productId: string) => {
    setRows(prevRows =>
      prevRows.map(row => {
        if (row.product_id === productId) {
          return {
            ...row,
            cost_price: row.current_cost_price,
            currency: row.current_currency,
            processing_days: row.current_processing_days,
            is_available: row.current_is_available,
            isModified: false,
          }
        }
        return row
      })
    )
  }

  // 切换行选择
  const toggleRow = (productId: string) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedRows(newSelected)
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedRows.size === rows.length) {
      setSelectedRows(new Set())
    } else {
      setSelectedRows(new Set(rows.map(r => r.product_id)))
    }
  }

  // 确认提交
  const handleConfirm = () => {
    const updates = rows
      .filter(row => row.isModified)
      .map(row => ({
        product_id: row.product_id,
        cost_price: row.cost_price,
        currency: row.currency,
        processing_days: row.processing_days,
        is_available: row.is_available,
      }))

    onConfirm(updates)
  }

  const modifiedCount = rows.filter(r => r.isModified).length

  return (
    <Box w="full" h="600px" display="flex" flexDirection="column" bg={bgColor}>
      {/* 顶部批量操作栏 */}
      <Box p="12px" borderBottom={`1px solid ${borderColor}`} bg={bgColor}>
        <VStack align="stretch" spacing={2}>
          <Text fontSize="14px" fontWeight="semibold" color="#262626">
            {t('batchPriceEditor.batchOperation')}
          </Text>
          <HStack spacing={2} flexWrap="wrap">
            <Box>
              <Text fontSize="11px" color="#8C8C8C" mb={1}>
                {t('batchPriceEditor.vendorPrice')}
              </Text>
              <Input
                size="sm"
                value={batchCostPrice}
                onChange={(e) => setBatchCostPrice(e.target.value)}
                placeholder={t('batchPriceEditor.enterPrice')}
                fontSize="12px"
                h="28px"
                w="150px"
                type="number"
              />
            </Box>
            <Box>
              <Text fontSize="11px" color="#8C8C8C" mb={1}>
                {t('batchPriceEditor.currency')}
              </Text>
              <Select
                size="sm"
                value={batchCurrency}
                onChange={(e) => setBatchCurrency(e.target.value)}
                fontSize="12px"
                h="28px"
                w="120px"
              >
                <option value="IDR">IDR</option>
                <option value="CNY">CNY</option>
              </Select>
            </Box>
            <Box>
              <Text fontSize="11px" color="#8C8C8C" mb={1}>
                {t('batchPriceEditor.processingDays')}
              </Text>
              <Input
                size="sm"
                value={batchProcessingDays}
                onChange={(e) => setBatchProcessingDays(e.target.value)}
                placeholder={t('batchPriceEditor.enterDays')}
                fontSize="12px"
                h="28px"
                w="120px"
                type="number"
              />
            </Box>
            <Box>
              <Text fontSize="11px" color="#8C8C8C" mb={1}>
                {t('batchPriceEditor.isAvailable')}
              </Text>
              <Select
                size="sm"
                value={batchIsAvailable}
                onChange={(e) => setBatchIsAvailable(e.target.value)}
                fontSize="12px"
                h="28px"
                w="120px"
              >
                <option value="">{t('common.keep')}</option>
                <option value="true">{t('common.yes')}</option>
                <option value="false">{t('common.no')}</option>
              </Select>
            </Box>
            <Box display="flex" alignItems="flex-end" pb={1}>
              <Button
                size="sm"
                colorScheme="blue"
                onClick={handleBatchApply}
                fontSize="12px"
                h="28px"
                px="16px"
              >
                {t('batchPriceEditor.apply')}
              </Button>
            </Box>
          </HStack>
        </VStack>
      </Box>

      {/* 中间表格 */}
      <Box flex={1} overflowY="auto" overflowX="auto">
        {loading ? (
          <Flex justify="center" align="center" h="full">
            <Spinner size="sm" />
          </Flex>
        ) : rows.length === 0 ? (
          <Flex justify="center" align="center" h="full">
            <Text fontSize="12px" color="#8C8C8C">
              {t('batchPriceEditor.noProducts')}
            </Text>
          </Flex>
        ) : (
          <Table variant="simple" size="sm">
            <Thead bg="#F5F5F5" position="sticky" top={0} zIndex={1}>
              <Tr>
                <Th w="40px" p="8px 12px">
                  <Checkbox
                    isChecked={selectedRows.size === rows.length && rows.length > 0}
                    isIndeterminate={
                      selectedRows.size > 0 && selectedRows.size < rows.length
                    }
                    onChange={toggleSelectAll}
                  />
                </Th>
                <Th fontSize="13px" fontWeight="semibold" color="#262626" p="8px 12px">
                  {t('batchPriceEditor.productName')}
                </Th>
                <Th fontSize="13px" fontWeight="semibold" color="#262626" p="8px 12px">
                  {t('batchPriceEditor.currentPrice')}
                </Th>
                <Th fontSize="13px" fontWeight="semibold" color="#262626" p="8px 12px">
                  {t('batchPriceEditor.vendorPrice')}
                </Th>
                <Th fontSize="13px" fontWeight="semibold" color="#262626" p="8px 12px">
                  {t('batchPriceEditor.currency')}
                </Th>
                <Th fontSize="13px" fontWeight="semibold" color="#262626" p="8px 12px">
                  {t('batchPriceEditor.processingDays')}
                </Th>
                <Th fontSize="13px" fontWeight="semibold" color="#262626" p="8px 12px">
                  {t('batchPriceEditor.isAvailable')}
                </Th>
                <Th fontSize="13px" fontWeight="semibold" color="#262626" p="8px 12px" w="100px">
                  {t('common.actions')}
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {rows.map((row) => (
                <Tr
                  key={row.product_id}
                  bg={row.isModified ? '#FFF7E6' : 'transparent'}
                  _hover={{ bg: hoverBg }}
                >
                  <Td p="8px 12px">
                    <Checkbox
                      isChecked={selectedRows.has(row.product_id)}
                      onChange={() => toggleRow(row.product_id)}
                    />
                  </Td>
                  <Td fontSize="12px" color="#262626" p="8px 12px">
                    <VStack align="flex-start" spacing={0}>
                      <Text fontWeight="medium">{row.product_name}</Text>
                      {row.product_code && (
                        <Text fontSize="11px" color="#8C8C8C">
                          {row.product_code}
                        </Text>
                      )}
                    </VStack>
                  </Td>
                  <Td fontSize="12px" color="#8C8C8C" p="8px 12px">
                    {row.current_cost_price ? (
                      <Text fontSize="11px">
                        {formatPrice(row.current_cost_price, row.current_currency || 'IDR')}
                      </Text>
                    ) : (
                      <Text>-</Text>
                    )}
                  </Td>
                  <Td p="8px 12px">
                    <Input
                      size="sm"
                      value={row.cost_price || ''}
                      onChange={(e) =>
                        updateRow(
                          row.product_id,
                          'cost_price',
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
                      fontSize="12px"
                      h="28px"
                      type="number"
                      placeholder="-"
                    />
                  </Td>
                  <Td p="8px 12px">
                    <Select
                      size="sm"
                      value={row.currency || 'IDR'}
                      onChange={(e) =>
                        updateRow(
                          row.product_id,
                          'currency',
                          e.target.value
                        )
                      }
                      fontSize="12px"
                      h="28px"
                    >
                      <option value="IDR">IDR</option>
                      <option value="CNY">CNY</option>
                    </Select>
                  </Td>
                  <Td p="8px 12px">
                    <Input
                      size="sm"
                      value={row.processing_days || ''}
                      onChange={(e) =>
                        updateRow(
                          row.product_id,
                          'processing_days',
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                      fontSize="12px"
                      h="28px"
                      type="number"
                      placeholder="-"
                    />
                  </Td>
                  <Td p="8px 12px">
                    <Select
                      size="sm"
                      value={row.is_available === null ? '' : String(row.is_available)}
                      onChange={(e) =>
                        updateRow(
                          row.product_id,
                          'is_available',
                          e.target.value === '' ? null : e.target.value === 'true'
                        )
                      }
                      fontSize="12px"
                      h="28px"
                    >
                      <option value="true">{t('common.yes')}</option>
                      <option value="false">{t('common.no')}</option>
                    </Select>
                  </Td>
                  <Td p="8px 12px">
                    {row.isModified && (
                      <Button
                        size="xs"
                        variant="ghost"
                        leftIcon={<RefreshCw size={12} />}
                        onClick={() => handleResetRow(row.product_id)}
                        fontSize="11px"
                        h="24px"
                      >
                        {t('common.reset')}
                      </Button>
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>

      {/* 底部操作栏 */}
      <Box
        p="12px"
        borderTop={`1px solid ${borderColor}`}
        bg={bgColor}
      >
        <Flex justify="space-between" align="center">
          <HStack spacing={2}>
            <Text fontSize="12px" color="#8C8C8C">
              {t('batchPriceEditor.totalProducts', { count: rows.length })}
            </Text>
            {modifiedCount > 0 && (
              <>
                <Text fontSize="12px" color="#8C8C8C">|</Text>
                <Badge colorScheme="orange" fontSize="10px">
                  {t('batchPriceEditor.modifiedCount', { count: modifiedCount })}
                </Badge>
              </>
            )}
          </HStack>
          <HStack spacing={2}>
            <Button
              size="sm"
              variant="outline"
              onClick={onCancel}
              fontSize="12px"
              h="28px"
              px="16px"
            >
              {t('common.cancel')}
            </Button>
            <Button
              size="sm"
              colorScheme="blue"
              onClick={handleConfirm}
              fontSize="12px"
              h="28px"
              px="16px"
              isDisabled={modifiedCount === 0}
            >
              {t('common.confirm')}
            </Button>
          </HStack>
        </Flex>
      </Box>
    </Box>
  )
}

export default BatchPriceEditor
