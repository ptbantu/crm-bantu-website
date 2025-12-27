/**
 * 产品价格配置侧边栏组件
 * 用于配置产品价格，包括价格表格、汇率设置等
 */
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Save, Check } from 'lucide-react'
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Radio,
  RadioGroup,
  Box,
  Text,
  Divider,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Flex,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react'
import { ProductBasicInfo } from './ProductBasicInfoSidebar'

export interface ProductPriceConfig {
  default_currency: 'CNY' | 'IDR'
  effective_from: string
  effective_to: string
  exchange_rate: number
  price_cost_idr: number
  price_cost_cny: number
  price_channel_idr: number
  price_channel_cny: number
  price_direct_idr: number
  price_direct_cny: number
  price_list_idr: number
  price_list_cny: number
}

interface ProductPriceConfigSidebarProps {
  isOpen: boolean
  onClose: () => void
  onBack: () => void
  onSubmit: (basicInfo: ProductBasicInfo, priceConfig: ProductPriceConfig) => void
  basicInfo: ProductBasicInfo | null
  initialData?: Partial<ProductPriceConfig>
}

const DRAFT_STORAGE_KEY = 'product_price_config_draft'

const ProductPriceConfigSidebar = ({
  isOpen,
  onClose,
  onBack,
  onSubmit,
  basicInfo,
  initialData,
}: ProductPriceConfigSidebarProps) => {
  const { t } = useTranslation()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const sectionBg = useColorModeValue('gray.50', 'gray.700')
  const tableHeaderBg = useColorModeValue('blue.50', 'blue.900')

  // 表单状态
  const [formData, setFormData] = useState<ProductPriceConfig>({
    default_currency: 'CNY',
    effective_from: '',
    effective_to: '',
    exchange_rate: 2200, // 默认汇率 1 CNY = 2200 IDR
    price_cost_idr: 0,
    price_cost_cny: 0,
    price_channel_idr: 0,
    price_channel_cny: 0,
    price_direct_idr: 0,
    price_direct_cny: 0,
    price_list_idr: 0,
    price_list_cny: 0,
  })

  // 验证错误
  const [errors, setErrors] = useState<Record<string, string>>({})

  // 价格联动模式：'cny' | 'idr' | 'none'
  const [linkMode, setLinkMode] = useState<'cny' | 'idr' | 'none'>('none')

  // 加载初始数据
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }))
    }
  }, [initialData])

  // 设置默认日期
  useEffect(() => {
    if (isOpen && !formData.effective_from) {
      const now = new Date()
      const nextYear = new Date(now)
      nextYear.setFullYear(now.getFullYear() + 1)

      setFormData((prev) => ({
        ...prev,
        effective_from: now.toISOString().slice(0, 16),
        effective_to: nextYear.toISOString().slice(0, 16),
      }))
    }
  }, [isOpen])

  // 草稿保存和加载
  const saveDraft = useCallback(() => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formData))
    } catch (error) {
      console.error('Failed to save draft:', error)
    }
  }, [formData])

  const loadDraft = () => {
    try {
      const draft = localStorage.getItem(DRAFT_STORAGE_KEY)
      if (draft && !initialData) {
        const draftData = JSON.parse(draft)
        setFormData((prev) => ({ ...prev, ...draftData }))
      }
    } catch (error) {
      console.error('Failed to load draft:', error)
    }
  }

  // 自动保存草稿
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        saveDraft()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [formData, isOpen, saveDraft])

  // 汇率计算：CNY 转 IDR
  const cnyToIdr = (cny: number): number => {
    return cny * formData.exchange_rate
  }

  // 汇率计算：IDR 转 CNY
  const idrToCny = (idr: number): number => {
    return idr / formData.exchange_rate
  }

  // 处理价格变化（带联动）
  const handlePriceChange = (
    field: keyof ProductPriceConfig,
    value: number,
    sourceCurrency: 'CNY' | 'IDR'
  ) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value }

      // 如果启用了联动，自动计算对应货币的价格
      if (linkMode !== 'none') {
        const isCnyField = field.includes('_cny')
        const isIdrField = field.includes('_idr')

        if (sourceCurrency === 'CNY' && isCnyField && linkMode === 'cny') {
          // 从CNY字段更新，自动计算IDR
          const idrField = field.replace('_cny', '_idr') as keyof ProductPriceConfig
          updated[idrField] = cnyToIdr(value)
        } else if (sourceCurrency === 'IDR' && isIdrField && linkMode === 'idr') {
          // 从IDR字段更新，自动计算CNY
          const cnyField = field.replace('_idr', '_cny') as keyof ProductPriceConfig
          updated[cnyField] = idrToCny(value)
        }
      }

      return updated
    })
  }

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.effective_from) {
      newErrors.effective_from = t('productManagement.createWizard.priceConfig.validation.effectiveFromRequired', '价格生效时间不能为空')
    }

    if (!formData.effective_to) {
      newErrors.effective_to = t('productManagement.createWizard.priceConfig.validation.effectiveToRequired', '价格有效期不能为空')
    }

    if (formData.exchange_rate <= 0) {
      newErrors.exchange_rate = t('productManagement.createWizard.priceConfig.validation.exchangeRateInvalid', '汇率必须大于0')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 处理提交
  const handleSubmit = () => {
    if (!basicInfo) {
      return
    }

    if (validateForm()) {
      // 清除草稿
      localStorage.removeItem(DRAFT_STORAGE_KEY)
      localStorage.removeItem('product_basic_info_draft')
      onSubmit(basicInfo, formData)
    }
  }

  // 处理关闭
  const handleClose = () => {
    // 保存草稿
    saveDraft()
    onClose()
  }

  // 格式化日期时间显示
  const formatDateTime = (dateTime: string) => {
    if (!dateTime) return ''
    const date = new Date(dateTime)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={handleClose} size="md">
      <DrawerOverlay />
      <DrawerContent bg={bgColor} maxW={{ base: '100%', md: '500px' }}>
        <DrawerCloseButton />
        {/* 标题栏 */}
        <DrawerHeader
          borderBottomWidth="1px"
          borderColor={borderColor}
          h="60px"
          display="flex"
          alignItems="center"
        >
          <Text fontSize="lg" fontWeight="semibold" color="gray.900">
            {t('productManagement.createWizard.priceConfig.title', '价格配置')}
          </Text>
        </DrawerHeader>

        {/* 内容区 */}
        <DrawerBody p={0} overflowY="auto">
          <VStack spacing={6} p={6} align="stretch">
            {/* 上下文显示区域：产品基本信息 */}
            {basicInfo && (
              <Box bg={sectionBg} p={4} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
                <Text fontSize="xs" fontWeight="semibold" color="gray.600" mb={2}>
                  {t('productManagement.createWizard.priceConfig.productInfo', '产品信息')}
                </Text>
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm" fontWeight="medium" color="gray.900">
                    {basicInfo.name}
                  </Text>
                  {basicInfo.code && (
                    <Text fontSize="xs" color="gray.600">
                      {t('productManagement.form.code', '编码')}: {basicInfo.code}
                    </Text>
                  )}
                  {basicInfo.category_id && (
                    <Text fontSize="xs" color="gray.600">
                      {t('productManagement.form.category', '分类')}: {basicInfo.category_id}
                    </Text>
                  )}
                </VStack>
              </Box>
            )}

            {/* 基础价格设置 */}
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={4}>
                {t('productManagement.createWizard.priceConfig.section1', '基础设置')}
              </Text>
              <VStack spacing={4} align="stretch">
                {/* 默认货币 */}
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="medium" color="gray.700">
                    {t('productManagement.createWizard.priceConfig.defaultCurrency', '默认货币')}
                  </FormLabel>
                  <RadioGroup
                    value={formData.default_currency}
                    onChange={(value: 'CNY' | 'IDR') =>
                      setFormData((prev) => ({ ...prev, default_currency: value }))
                    }
                  >
                    <HStack spacing={4}>
                      <Radio value="CNY" size="sm">
                        CNY
                      </Radio>
                      <Radio value="IDR" size="sm">
                        IDR
                      </Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>

                {/* 价格生效时间 */}
                <FormControl isInvalid={!!errors.effective_from}>
                  <FormLabel fontSize="xs" fontWeight="medium" color="gray.700">
                    {t('productManagement.createWizard.priceConfig.effectiveFrom', '价格生效时间')}
                  </FormLabel>
                  <Input
                    type="datetime-local"
                    value={formData.effective_from}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, effective_from: e.target.value }))
                    }
                    size="sm"
                  />
                  <FormErrorMessage>{errors.effective_from}</FormErrorMessage>
                </FormControl>

                {/* 价格有效期 */}
                <FormControl isInvalid={!!errors.effective_to}>
                  <FormLabel fontSize="xs" fontWeight="medium" color="gray.700">
                    {t('productManagement.createWizard.priceConfig.effectiveTo', '价格有效期')}
                  </FormLabel>
                  <Input
                    type="datetime-local"
                    value={formData.effective_to}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, effective_to: e.target.value }))
                    }
                    size="sm"
                  />
                  <FormErrorMessage>{errors.effective_to}</FormErrorMessage>
                </FormControl>
              </VStack>
            </Box>

            <Divider />

            {/* 汇率设置 */}
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={4}>
                {t('productManagement.createWizard.priceConfig.section2', '汇率设置')}
              </Text>
              <VStack spacing={4} align="stretch">
                <FormControl isInvalid={!!errors.exchange_rate}>
                  <FormLabel fontSize="xs" fontWeight="medium" color="gray.700">
                    {t('productManagement.createWizard.priceConfig.exchangeRate', '汇率')}
                  </FormLabel>
                  <InputGroup size="sm">
                    <Input
                      type="number"
                      value={formData.exchange_rate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          exchange_rate: parseFloat(e.target.value) || 0,
                        }))
                      }
                      placeholder="2200"
                      step="0.01"
                    />
                    <InputRightElement width="4.5rem">
                      <Text fontSize="xs" color="gray.500">
                        IDR
                      </Text>
                    </InputRightElement>
                  </InputGroup>
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    {t('productManagement.createWizard.priceConfig.exchangeRateHint', '1 CNY = X IDR')}
                  </Text>
                  <FormErrorMessage>{errors.exchange_rate}</FormErrorMessage>
                </FormControl>

                {/* 价格联动规则 */}
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="medium" color="gray.700">
                    {t('productManagement.createWizard.priceConfig.priceLinkage', '价格联动')}
                  </FormLabel>
                  <RadioGroup
                    value={linkMode}
                    onChange={(value: 'cny' | 'idr' | 'none') => setLinkMode(value)}
                  >
                    <VStack align="start" spacing={2}>
                      <Radio value="none" size="sm">
                        {t('productManagement.createWizard.priceConfig.linkageNone', '不联动')}
                      </Radio>
                      <Radio value="cny" size="sm">
                        {t('productManagement.createWizard.priceConfig.linkageCny', 'CNY为主，自动计算IDR')}
                      </Radio>
                      <Radio value="idr" size="sm">
                        {t('productManagement.createWizard.priceConfig.linkageIdr', 'IDR为主，自动计算CNY')}
                      </Radio>
                    </VStack>
                  </RadioGroup>
                </FormControl>
              </VStack>
            </Box>

            <Divider />

            {/* 价格表格 */}
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={4}>
                {t('productManagement.createWizard.priceConfig.section3', '价格设置')}
              </Text>
              <Box overflowX="auto">
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th bg={tableHeaderBg} fontSize="xs" fontWeight="semibold" color="gray.700">
                        {t('productManagement.createWizard.priceConfig.priceType', '价格类型')}
                      </Th>
                      <Th bg={tableHeaderBg} fontSize="xs" fontWeight="semibold" color="gray.700" isNumeric>
                        CNY
                      </Th>
                      <Th bg={tableHeaderBg} fontSize="xs" fontWeight="semibold" color="gray.700" isNumeric>
                        IDR
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {/* 成本价 */}
                    <Tr>
                      <Td fontSize="xs" color="gray.700">
                        {t('productManagement.table.priceCost', '成本价')}
                      </Td>
                      <Td>
                        <Input
                          type="number"
                          value={formData.price_cost_cny || ''}
                          onChange={(e) =>
                            handlePriceChange(
                              'price_cost_cny',
                              parseFloat(e.target.value) || 0,
                              'CNY'
                            )
                          }
                          size="sm"
                          placeholder="0"
                        />
                      </Td>
                      <Td>
                        <Input
                          type="number"
                          value={formData.price_cost_idr || ''}
                          onChange={(e) =>
                            handlePriceChange(
                              'price_cost_idr',
                              parseFloat(e.target.value) || 0,
                              'IDR'
                            )
                          }
                          size="sm"
                          placeholder="0"
                        />
                      </Td>
                    </Tr>
                    {/* 渠道价 */}
                    <Tr>
                      <Td fontSize="xs" color="gray.700">
                        {t('productManagement.table.priceChannel', '渠道价')}
                      </Td>
                      <Td>
                        <Input
                          type="number"
                          value={formData.price_channel_cny || ''}
                          onChange={(e) =>
                            handlePriceChange(
                              'price_channel_cny',
                              parseFloat(e.target.value) || 0,
                              'CNY'
                            )
                          }
                          size="sm"
                          placeholder="0"
                        />
                      </Td>
                      <Td>
                        <Input
                          type="number"
                          value={formData.price_channel_idr || ''}
                          onChange={(e) =>
                            handlePriceChange(
                              'price_channel_idr',
                              parseFloat(e.target.value) || 0,
                              'IDR'
                            )
                          }
                          size="sm"
                          placeholder="0"
                        />
                      </Td>
                    </Tr>
                    {/* 直客价 */}
                    <Tr>
                      <Td fontSize="xs" color="gray.700">
                        {t('productManagement.table.priceDirect', '直客价')}
                      </Td>
                      <Td>
                        <Input
                          type="number"
                          value={formData.price_direct_cny || ''}
                          onChange={(e) =>
                            handlePriceChange(
                              'price_direct_cny',
                              parseFloat(e.target.value) || 0,
                              'CNY'
                            )
                          }
                          size="sm"
                          placeholder="0"
                        />
                      </Td>
                      <Td>
                        <Input
                          type="number"
                          value={formData.price_direct_idr || ''}
                          onChange={(e) =>
                            handlePriceChange(
                              'price_direct_idr',
                              parseFloat(e.target.value) || 0,
                              'IDR'
                            )
                          }
                          size="sm"
                          placeholder="0"
                        />
                      </Td>
                    </Tr>
                  </Tbody>
                </Table>
              </Box>
            </Box>
          </VStack>
        </DrawerBody>

        {/* 操作栏 */}
        <Box
          borderTopWidth="1px"
          borderColor={borderColor}
          bg={sectionBg}
          px={6}
          py={4}
          h="80px"
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={onBack}>
            {t('productManagement.createWizard.back', '上一步')}
          </Button>
          <HStack spacing={3}>
            <Button variant="outline" size="sm" onClick={handleClose}>
              {t('productManagement.cancel', '取消')}
            </Button>
            <Button
              colorScheme="blue"
              size="sm"
              leftIcon={<Check size={14} />}
              onClick={handleSubmit}
              isDisabled={!basicInfo}
            >
              {t('productManagement.createWizard.submit', '提交')}
            </Button>
          </HStack>
        </Box>
      </DrawerContent>
    </Drawer>
  )
}

export default ProductPriceConfigSidebar
