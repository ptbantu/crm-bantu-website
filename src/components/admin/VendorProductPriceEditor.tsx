/**
 * 供应商产品价格编辑组件
 * 弹窗编辑，支持设置生效时间
 * 如果价格未生效，只能编辑价格不能修改生效时间
 */
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { updateVendorProductPrice, PriceHistoryItem } from '@/api/suppliers'
import { useToast } from '@/components/ToastContainer'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Input,
  FormControl,
  FormLabel,
  FormHelperText,
  useColorModeValue,
  Box,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { Calendar } from 'lucide-react'

export interface VendorProductPriceEditorProps {
  isOpen: boolean
  onClose: () => void
  supplierId: string
  productId: string
  productName: string
  currentCostPriceCny?: number | null
  currentCostPriceIdr?: number | null
  priceHistory?: PriceHistoryItem[]
  onSuccess?: () => void
}

const VendorProductPriceEditor = ({
  isOpen,
  onClose,
  supplierId,
  productId,
  productName,
  currentCostPriceCny,
  currentCostPriceIdr,
  priceHistory = [],
  onSuccess,
}: VendorProductPriceEditorProps) => {
  const { t } = useTranslation()
  const { showSuccess, showError } = useToast()

  const textColor = useColorModeValue('gray.700', 'gray.300')
  const labelColor = useColorModeValue('gray.500', 'gray.400')

  // 表单状态
  const [costPriceCny, setCostPriceCny] = useState<string>('')
  const [costPriceIdr, setCostPriceIdr] = useState<string>('') // 存储jt单位的值
  const [effectiveFrom, setEffectiveFrom] = useState<string>('')
  const [loading, setLoading] = useState(false)
  
  // IDR转jt：将实际IDR值转换为jt单位（除以1,000,000）
  const idrToJt = (idr: number | null | undefined): string => {
    if (idr === null || idr === undefined || isNaN(idr)) return ''
    return (idr / 1000000).toString()
  }
  
  // jt转IDR：将jt单位转换为实际IDR值（乘以1,000,000）
  const jtToIdr = (jt: string): number | null => {
    if (!jt || jt.trim() === '') return null
    const jtValue = Number(jt)
    if (isNaN(jtValue)) return null
    return jtValue * 1000000
  }

  // 检查是否有未生效的价格
  const hasFuturePrice = useMemo(() => {
    const now = new Date()
    return priceHistory.some(
      (item) =>
        new Date(item.effective_from) > now &&
        !item.effective_to
    )
  }, [priceHistory])

  // 获取未生效价格的生效时间
  const futureEffectiveFrom = useMemo(() => {
    if (!hasFuturePrice) return null
    const now = new Date()
    const future = priceHistory.find(
      (item) =>
        new Date(item.effective_from) > now &&
        !item.effective_to
    )
    return future ? future.effective_from : null
  }, [priceHistory, hasFuturePrice])

  // 计算最小日期（明天）
  const minDateTime = useMemo(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    return tomorrow.toISOString().slice(0, 16) // 格式：YYYY-MM-DDTHH:mm
  }, [])

  // 初始化表单
  useEffect(() => {
    if (isOpen) {
      // 设置默认价格为当前价格
      setCostPriceCny(currentCostPriceCny?.toString() || '')
      // IDR价格转换为jt单位显示
      setCostPriceIdr(idrToJt(currentCostPriceIdr))

      // 生效时间默认选项：+1天（明天）
      // 如果有未生效的价格且可以编辑生效时间，使用其生效时间，否则默认为明天
      if (futureEffectiveFrom && !hasFuturePrice) {
        // 后端返回的是 UTC 时区，需要转换为 UTC+7 时区显示
        const date = new Date(futureEffectiveFrom)
        // 转换为 UTC+7 时区的本地时间字符串（用于 datetime-local 输入框）
        // datetime-local 输入框需要本地时区的字符串格式
        const jakartaStr = date.toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }).replace(' ', 'T').slice(0, 16)
        
        // 确保日期不早于明天
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0)
        const tomorrowJakartaStr = tomorrow.toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }).replace(' ', 'T').slice(0, 16)
        
        if (jakartaStr < tomorrowJakartaStr) {
          setEffectiveFrom(minDateTime)
        } else {
          setEffectiveFrom(jakartaStr)
        }
      } else {
        // 默认设置为明天 00:00（UTC+7 时区），即+1天
        setEffectiveFrom(minDateTime)
      }
    }
  }, [isOpen, currentCostPriceCny, currentCostPriceIdr, futureEffectiveFrom, minDateTime])

  // 处理提交
  const handleSubmit = async () => {
    // 验证至少有一个价格
    if (!costPriceCny && !costPriceIdr) {
      showError(t('vendorProductPriceEditor.atLeastOnePrice'))
      return
    }

    // 验证价格格式
    if (costPriceCny && isNaN(Number(costPriceCny))) {
      showError(t('vendorProductPriceEditor.invalidCnyPrice'))
      return
    }

    // 验证IDR价格格式（jt单位）
    if (costPriceIdr && isNaN(Number(costPriceIdr))) {
      showError(t('vendorProductPriceEditor.invalidIdrPrice'))
      return
    }
    
    // 将jt单位转换为实际IDR值
    const actualIdrValue = jtToIdr(costPriceIdr)

    // 验证生效时间
    if (!effectiveFrom) {
      showError(t('vendorProductPriceEditor.invalidEffectiveDate'))
      return
    }

    // 验证生效时间不能早于明天（使用 UTC+7 时区）
    // datetime-local 返回的是本地时区（UTC+7）的字符串
    const selectedDate = new Date(effectiveFrom)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(0, 0, 0, 0)
    
    if (selectedDate < tomorrow) {
      showError(t('vendorProductPriceEditor.dateTooEarly'))
      return
    }

    setLoading(true)
    try {
      // 将 UTC+7 时区的 datetime-local 值转换为 UTC 时区的 ISO 字符串
      // datetime-local 返回的是本地时区（UTC+7）的字符串，需要转换为 UTC
      let effectiveFromUTC: string | null = null
      if (effectiveFrom) {
        // datetime-local 格式: "YYYY-MM-DDTHH:mm"
        // 创建 UTC+7 时区的 Date 对象
        const localDate = new Date(effectiveFrom + ':00') // 添加秒数
        // 转换为 UTC 时区的 ISO 字符串
        effectiveFromUTC = localDate.toISOString()
      }
      
      await updateVendorProductPrice(supplierId, productId, {
        cost_price_cny: costPriceCny ? Number(costPriceCny) : null,
        cost_price_idr: actualIdrValue, // 使用转换后的实际IDR值
        effective_from: effectiveFromUTC,
      })

      showSuccess(t('vendorProductPriceEditor.updateSuccess'))
      onSuccess?.()
      onClose()
    } catch (error: any) {
      console.error('Failed to update price:', error)
      showError(error.message || t('vendorProductPriceEditor.updateFailed'))
    } finally {
      setLoading(false)
    }
  }

  // 格式化日期时间显示（使用 UTC+7 时区）
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize="md" fontWeight="semibold">
          {t('vendorProductPriceEditor.title')} - {productName}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* 未生效价格提示 */}
            {hasFuturePrice && futureEffectiveFrom && (
              <Alert status="info" fontSize="sm">
                <AlertIcon />
                <Box>
                  <Text fontSize="xs" fontWeight="medium">
                    {t('vendorProductPriceEditor.futurePriceWarning')}
                  </Text>
                  <Text fontSize="xs" mt={1}>
                    {t('vendorProductPriceEditor.effectiveFrom')}: {formatDateTime(futureEffectiveFrom)}
                  </Text>
                </Box>
              </Alert>
            )}

            {/* CNY价格 */}
            <FormControl>
              <FormLabel fontSize="sm" color={labelColor}>
                {t('vendorProductPriceEditor.cnyPrice')}
              </FormLabel>
              <Input
                type="number"
                step="0.01"
                value={costPriceCny}
                onChange={(e) => setCostPriceCny(e.target.value)}
                placeholder={t('vendorProductPriceEditor.cnyPricePlaceholder')}
                size="sm"
              />
              <FormHelperText fontSize="xs" color={labelColor}>
                {t('vendorProductPriceEditor.cnyPriceHelper')}
              </FormHelperText>
            </FormControl>

            {/* IDR价格（jt单位） */}
            <FormControl>
              <FormLabel fontSize="sm" color={labelColor}>
                {t('vendorProductPriceEditor.idrPrice')} (jt)
              </FormLabel>
              <Input
                type="number"
                step="0.01"
                value={costPriceIdr}
                onChange={(e) => setCostPriceIdr(e.target.value)}
                placeholder={t('vendorProductPriceEditor.idrPricePlaceholder')}
                size="sm"
              />
              <FormHelperText fontSize="xs" color={labelColor}>
                {t('vendorProductPriceEditor.idrPriceHelper')}
              </FormHelperText>
            </FormControl>

            {/* 生效时间 */}
            <FormControl>
              <FormLabel fontSize="sm" color={labelColor}>
                <HStack spacing={2}>
                  <Calendar size={14} />
                  <Text>{t('vendorProductPriceEditor.effectiveFrom')}</Text>
                </HStack>
              </FormLabel>
              <Input
                type="datetime-local"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                min={minDateTime}
                size="sm"
                isDisabled={hasFuturePrice}
              />
              <FormHelperText fontSize="xs" color={labelColor}>
                {hasFuturePrice
                  ? t('vendorProductPriceEditor.effectiveDateDisabled')
                  : t('vendorProductPriceEditor.effectiveDateHelper')}
              </FormHelperText>
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <HStack spacing={2}>
            <Button size="sm" variant="outline" onClick={onClose} isDisabled={loading}>
              {t('common.cancel')}
            </Button>
            <Button
              size="sm"
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={loading}
            >
              {t('common.confirm')}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default VendorProductPriceEditor
