/**
 * 产品基本信息侧边栏组件
 * 用于收集产品基本信息，包括产品名称、分类、服务配置等
 */
import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Save } from 'lucide-react'
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
  Select,
  Textarea,
  Switch,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
  Box,
  Text,
  Divider,
  useColorModeValue,
  Badge,
  InputGroup,
  InputLeftElement,
  Tag,
  TagLabel,
  TagCloseButton,
  Flex,
  IconButton,
} from '@chakra-ui/react'
import { getCategoryList } from '@/api/categories'
import { ProductCategory } from '@/api/types'
import { checkProductCode } from '@/api/products'

export interface ProductBasicInfo {
  name: string
  service_type: string
  category_id: string
  code: string
  status: 'active' | 'suspended'
  description: string
  processing_days: string
  is_urgent_available: boolean
  applicable_regions: string[]
  required_documents: string[]
  service_level: string
  tags: string[]
}

interface ProductBasicInfoSidebarProps {
  isOpen: boolean
  onClose: () => void
  onNext: (data: ProductBasicInfo) => void
  initialData?: Partial<ProductBasicInfo>
  isEditMode?: boolean
  productId?: string
  onSubmit?: (data: ProductBasicInfo) => void
}

const DRAFT_STORAGE_KEY = 'product_basic_info_draft'

const ProductBasicInfoSidebar = ({
  isOpen,
  onClose,
  onNext,
  initialData,
  isEditMode = false,
  productId,
  onSubmit,
}: ProductBasicInfoSidebarProps) => {
  const { t } = useTranslation()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const sectionBg = useColorModeValue('gray.50', 'gray.700')

  // 表单状态
  const [formData, setFormData] = useState<ProductBasicInfo>({
    name: '',
    service_type: '',
    category_id: '',
    code: '',
    status: 'active',
    description: '',
    processing_days: '',
    is_urgent_available: false,
    applicable_regions: [],
    required_documents: [],
    service_level: '',
    tags: [],
  })

  // 分类列表
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)

  // 验证错误
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // 编码重复检查状态
  const [checkingCode, setCheckingCode] = useState(false)

  // 标签输入
  const [tagInput, setTagInput] = useState('')

  // 加载分类列表
  useEffect(() => {
    if (isOpen) {
      loadCategories()
      loadDraft()
    }
  }, [isOpen])

  // 加载初始数据
  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }))
    }
  }, [initialData])

  const loadCategories = async () => {
    setLoadingCategories(true)
    try {
      const result = await getCategoryList({ size: 1000, is_active: true })
      setCategories(result.records)
    } catch (error) {
      console.error('Failed to load categories:', error)
    } finally {
      setLoadingCategories(false)
    }
  }

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
    if (isOpen && formData.name) {
      const timer = setTimeout(() => {
        saveDraft()
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [formData, isOpen, saveDraft])

  // 检查编码是否重复
  const handleCodeBlur = async () => {
    if (!formData.code.trim() || isEditMode) {
      return // 编辑模式下不检查编码
    }
    
    setCheckingCode(true)
    try {
      const result = await checkProductCode(formData.code.trim())
      if (result.exists) {
        setErrors((prev) => ({
          ...prev,
          code: t('productManagement.validation.codeExists', '产品编码已存在'),
        }))
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors.code
          return newErrors
        })
      }
    } catch (error: any) {
      console.error('检查编码失败:', error)
      // 检查失败时不阻止提交，只记录错误
    } finally {
      setCheckingCode(false)
    }
  }

  // 验证表单
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = t('productManagement.validation.nameRequired')
    }
    
    // 新增模式下，编码必须填写
    if (!isEditMode && !formData.code.trim()) {
      newErrors.code = t('productManagement.validation.codeRequired', '产品编码必须填写')
    }
    
    // 如果有编码错误（重复），禁止提交
    if (errors.code) {
      return false
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 处理下一步或保存
  const handleNext = () => {
    if (validateForm()) {
      // 清除草稿
      localStorage.removeItem(DRAFT_STORAGE_KEY)
      if (isEditMode && onSubmit) {
        onSubmit(formData)
      } else {
        onNext(formData)
      }
    }
  }

  // 处理关闭
  const handleClose = () => {
    // 保存草稿
    saveDraft()
    onClose()
  }

  // 添加标签
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }))
      setTagInput('')
    }
  }

  // 删除标签
  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  // 预设选项
  const serviceTypes = ['visa', 'company_registration', 'tax', 'hr', 'certification', 'ip']
  const processingDaysOptions = ['1', '3', '5', '7', '10', '15', '30', '60', '90']
  const applicableRegions = ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Bali', '其他']
  const targetCustomers = ['individual', 'enterprise', 'both']
  const requiredDocumentsOptions = [
    'passport',
    'visa_application',
    'company_documents',
    'tax_certificate',
    'other',
  ]
  const serviceLevels = ['standard', 'premium', 'vip']

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
            {isEditMode
              ? t('productManagement.edit', '编辑产品')
              : t('productManagement.createWizard.basicInfo.title', '产品基本信息')}
          </Text>
        </DrawerHeader>

        {/* 内容区 */}
        <DrawerBody p={0} overflowY="auto">
          <VStack spacing={6} p={6} align="stretch">
            {/* 区块1：产品基本信息 */}
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={4}>
                {t('productManagement.createWizard.basicInfo.section1', '基本信息')}
              </Text>
              <VStack spacing={4} align="stretch">
                {/* 产品名称 */}
                <FormControl isInvalid={!!errors.name} isRequired>
                  <FormLabel fontSize="xs" fontWeight="medium" color="gray.700">
                    {t('productManagement.form.name', '服务名称')}
                  </FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder={t('productManagement.form.name', '请输入服务名称')}
                    size="sm"
                    isDisabled={isEditMode}
                  />
                  <FormErrorMessage>{errors.name}</FormErrorMessage>
                </FormControl>

                {/* 服务类型 */}
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="medium" color="gray.700">
                    {t('productManagement.createWizard.basicInfo.serviceType', '服务类型')}
                  </FormLabel>
                  <Select
                    value={formData.service_type}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, service_type: e.target.value }))
                    }
                    placeholder={t('productManagement.createWizard.basicInfo.selectServiceType', '请选择服务类型')}
                    size="sm"
                  >
                    {serviceTypes.map((type) => (
                      <option key={type} value={type}>
                        {t(`productManagement.createWizard.basicInfo.serviceTypes.${type}`, type)}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* 产品分类 */}
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="medium" color="gray.700">
                    {t('productManagement.form.category', '产品分类')}
                  </FormLabel>
                  <Select
                    value={formData.category_id}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, category_id: e.target.value }))
                    }
                    placeholder={t('productManagement.form.selectCategory', '请选择分类')}
                    size="sm"
                    isLoading={loadingCategories}
                    isDisabled={isEditMode}
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* 产品编码 */}
                <FormControl isInvalid={!!errors.code} isRequired={!isEditMode}>
                  <FormLabel fontSize="xs" fontWeight="medium" color="gray.700">
                    {t('productManagement.form.code', '产品编码')}
                  </FormLabel>
                  <InputGroup size="sm">
                    <Input
                      value={formData.code}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, code: e.target.value }))
                        // 清除编码错误（用户正在修改）
                        if (errors.code) {
                          setErrors((prev) => {
                            const newErrors = { ...prev }
                            delete newErrors.code
                            return newErrors
                          })
                        }
                      }}
                      onBlur={handleCodeBlur}
                      placeholder={isEditMode 
                        ? t('productManagement.form.codeReadonly', '编码不可修改')
                        : t('productManagement.createWizard.basicInfo.codePlaceholder', '请输入产品编码')}
                      isDisabled={isEditMode}
                      isLoading={checkingCode}
                    />
                  </InputGroup>
                  {!isEditMode && (
                    <Text fontSize="xs" color="gray.500" mt={1}>
                      {t('productManagement.form.codeRequiredHint', '服务编码必须手动填写')}
                    </Text>
                  )}
                  <FormErrorMessage>{errors.code}</FormErrorMessage>
                </FormControl>

                {/* 初始状态 */}
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="medium" color="gray.700">
                    {t('productManagement.createWizard.basicInfo.initialStatus', '初始状态')}
                  </FormLabel>
                  <RadioGroup
                    value={formData.status}
                    onChange={(value: 'active' | 'suspended') =>
                      setFormData((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <HStack spacing={4}>
                      <Radio value="active" size="sm">
                        {t('productManagement.form.statusActive', '激活')}
                      </Radio>
                      <Radio value="suspended" size="sm">
                        {t('productManagement.form.statusSuspended', '暂停')}
                      </Radio>
                    </HStack>
                  </RadioGroup>
                </FormControl>

                {/* 产品描述 */}
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="medium" color="gray.700">
                    {t('productManagement.createWizard.basicInfo.description', '产品描述')}
                  </FormLabel>
                  <Textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    placeholder={t('productManagement.createWizard.basicInfo.descriptionPlaceholder', '请输入产品描述')}
                    size="sm"
                    rows={3}
                  />
                </FormControl>
              </VStack>
            </Box>

            <Divider />

            {/* 区块2：服务配置 */}
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={4}>
                {t('productManagement.createWizard.basicInfo.section2', '服务配置')}
              </Text>
              <VStack spacing={4} align="stretch">
                {/* 处理时长 */}
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="medium" color="gray.700">
                    {t('productManagement.form.processingDays', '处理时长')}
                  </FormLabel>
                  <Select
                    value={formData.processing_days}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, processing_days: e.target.value }))
                    }
                    placeholder={t('productManagement.createWizard.basicInfo.selectProcessingDays', '请选择处理时长')}
                    size="sm"
                  >
                    {processingDaysOptions.map((days) => (
                      <option key={days} value={days}>
                        {days} {t('productManagement.table.day', '天')}
                      </option>
                    ))}
                  </Select>
                </FormControl>

                {/* 是否支持加急 */}
                <FormControl>
                  <Flex align="center" justify="space-between">
                    <FormLabel fontSize="xs" fontWeight="medium" color="gray.700" mb={0}>
                      {t('productManagement.createWizard.basicInfo.urgentAvailable', '是否支持加急')}
                    </FormLabel>
                    <Switch
                      isChecked={formData.is_urgent_available}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, is_urgent_available: e.target.checked }))
                      }
                      colorScheme="blue"
                      size="sm"
                    />
                  </Flex>
                </FormControl>

                {/* 适用地区 */}
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="medium" color="gray.700">
                    {t('productManagement.createWizard.basicInfo.applicableRegions', '适用地区')}
                  </FormLabel>
                  <CheckboxGroup
                    value={formData.applicable_regions}
                    onChange={(value: string[]) =>
                      setFormData((prev) => ({ ...prev, applicable_regions: value }))
                    }
                  >
                    <VStack align="start" spacing={2}>
                      {applicableRegions.map((region) => (
                        <Checkbox key={region} value={region} size="sm">
                          {region}
                        </Checkbox>
                      ))}
                    </VStack>
                  </CheckboxGroup>
                </FormControl>

                {/* 所需材料 */}
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="medium" color="gray.700">
                    {t('productManagement.createWizard.basicInfo.requiredDocuments', '所需材料')}
                  </FormLabel>
                  <CheckboxGroup
                    value={formData.required_documents}
                    onChange={(value: string[]) =>
                      setFormData((prev) => ({ ...prev, required_documents: value }))
                    }
                  >
                    <VStack align="start" spacing={2}>
                      {requiredDocumentsOptions.map((doc) => (
                        <Checkbox key={doc} value={doc} size="sm">
                          {t(`productManagement.createWizard.basicInfo.documents.${doc}`, doc)}
                        </Checkbox>
                      ))}
                    </VStack>
                  </CheckboxGroup>
                </FormControl>
              </VStack>
            </Box>

            <Divider />

            {/* 区块3：供应商设置 */}
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={4}>
                {t('productManagement.createWizard.basicInfo.section3', '供应商设置')}
              </Text>
              <VStack spacing={4} align="stretch">
                {/* 服务等级 */}
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="medium" color="gray.700">
                    {t('productManagement.createWizard.basicInfo.serviceLevel', '服务等级')}
                  </FormLabel>
                  <HStack spacing={2} flexWrap="wrap">
                    {serviceLevels.map((level) => (
                      <Badge
                        key={level}
                        as="button"
                        px={3}
                        py={1}
                        borderRadius="full"
                        colorScheme={formData.service_level === level ? 'blue' : 'gray'}
                        cursor="pointer"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, service_level: level }))
                        }
                        fontSize="xs"
                      >
                        {t(`productManagement.createWizard.basicInfo.serviceLevels.${level}`, level)}
                      </Badge>
                    ))}
                  </HStack>
                </FormControl>
              </VStack>
            </Box>

            <Divider />

            {/* 区块4：标签与分类 */}
            <Box>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={4}>
                {t('productManagement.createWizard.basicInfo.section4', '标签与分类')}
              </Text>
              <VStack spacing={4} align="stretch">
                {/* 产品标签 */}
                <FormControl>
                  <FormLabel fontSize="xs" fontWeight="medium" color="gray.700">
                    {t('productManagement.createWizard.basicInfo.tags', '产品标签')}
                  </FormLabel>
                  <HStack spacing={2}>
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddTag()
                        }
                      }}
                      placeholder={t('productManagement.createWizard.basicInfo.tagsPlaceholder', '输入标签后按回车添加')}
                      size="sm"
                    />
                    <Button size="sm" onClick={handleAddTag}>
                      {t('common.add', '添加')}
                    </Button>
                  </HStack>
                  {formData.tags.length > 0 && (
                    <HStack spacing={2} mt={2} flexWrap="wrap">
                      {formData.tags.map((tag) => (
                        <Tag key={tag} size="sm" colorScheme="blue">
                          <TagLabel>{tag}</TagLabel>
                          <TagCloseButton onClick={() => handleRemoveTag(tag)} />
                        </Tag>
                      ))}
                    </HStack>
                  )}
                </FormControl>
              </VStack>
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
          justifyContent="flex-end"
        >
          <HStack spacing={3}>
            <Button variant="outline" size="sm" onClick={handleClose}>
              {t('productManagement.cancel', '取消')}
            </Button>
            <Button
              colorScheme="blue"
              size="sm"
              leftIcon={<Save size={14} />}
              onClick={handleNext}
              isDisabled={!!errors.code || checkingCode}
            >
              {isEditMode
                ? t('productManagement.save', '保存')
                : t('productManagement.createWizard.next', '下一步')}
            </Button>
          </HStack>
        </Box>
      </DrawerContent>
    </Drawer>
  )
}

export default ProductBasicInfoSidebar
