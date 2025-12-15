/**
 * 企服供应商页面
 * 展示供应商对应的所有服务和价格
 * 按照阿里云ECS控制台风格设计（高信息密度）
 */
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, Download, Grid, List, Building2, Package } from 'lucide-react'
import {
  getSupplierList,
  getSupplierDetail,
  getSupplierServices,
  batchAddSupplierProducts,
  batchUpdateSupplierPrices,
  Supplier,
  SupplierService,
  SupplierListParams,
  SupplierServiceListParams,
} from '@/api/suppliers'
import { useToast } from '@/components/ToastContainer'
import { PageHeader } from '@/components/admin/PageHeader'
import BatchProductSelector from '@/components/admin/BatchProductSelector'
import BatchPriceEditor from '@/components/admin/BatchPriceEditor'
import VendorProductPriceDisplay from '@/components/admin/VendorProductPriceDisplay'
import VendorProductPriceEditor from '@/components/admin/VendorProductPriceEditor'
import { formatPrice } from '@/utils/formatPrice'
import { useAuth } from '@/hooks/useAuth'
import { Role } from '@/config/permissions'
import {
  Button,
  Card,
  CardBody,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  VStack,
  HStack,
  Flex,
  Box,
  Text,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react'

const EnterpriseServiceSupplier = () => {
  const { t } = useTranslation()
  const { showSuccess, showError } = useToast()
  const { checkRole } = useAuth()
  const isAdmin = checkRole(Role.ADMIN)
  
  // Chakra UI 颜色模式
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')
  const cardHoverBg = useColorModeValue('blue.50', 'gray.700')

  // 视图模式：card（卡片视图）或 list（列表视图）
  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')

  // 查询参数
  const [queryParams, setQueryParams] = useState<SupplierListParams>({
    page: 1,
    size: 10,
  })

  // 数据
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pages, setPages] = useState(0)

  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    is_active: '' as '' | 'true' | 'false',
    is_locked: '' as '' | 'true' | 'false',
  })

  // 详情模态框
  const { isOpen: isDetailOpen, onOpen: onDetailOpen, onClose: onDetailClose } = useDisclosure()
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null)
  const [supplierServices, setSupplierServices] = useState<SupplierService[]>([])
  const [loadingServices, setLoadingServices] = useState(false)
  const [servicesPage, setServicesPage] = useState(1)
  const [servicesTotal, setServicesTotal] = useState(0)

  // 价格编辑模态框
  const { isOpen: isPriceEditorOpen, onOpen: onPriceEditorOpen, onClose: onPriceEditorClose } = useDisclosure()
  const [selectedService, setSelectedService] = useState<SupplierService | null>(null)

  // 按分类分组服务
  const servicesByCategory = useMemo(() => {
    const grouped: Record<string, SupplierService[]> = {}
    
    supplierServices.forEach((service) => {
      const categoryKey = service.category_id || 'uncategorized'
      const categoryName = service.category_name || t('enterpriseServiceSupplier.detailModal.uncategorized')
      
      if (!grouped[categoryKey]) {
        grouped[categoryKey] = []
      }
      grouped[categoryKey].push(service)
    })
    
    // 转换为数组并排序（按分类名称）
    return Object.entries(grouped)
      .map(([categoryId, services]) => ({
        categoryId,
        categoryName: services[0]?.category_name || t('enterpriseServiceSupplier.detailModal.uncategorized'),
        services,
      }))
      .sort((a, b) => {
        // 未分类放在最后
        if (a.categoryId === 'uncategorized') return 1
        if (b.categoryId === 'uncategorized') return -1
        return a.categoryName.localeCompare(b.categoryName)
      })
  }, [supplierServices, t])

  // 批量操作模态框
  const { isOpen: isBatchProductOpen, onOpen: onBatchProductOpen, onClose: onBatchProductClose } = useDisclosure()
  const { isOpen: isBatchPriceOpen, onOpen: onBatchPriceOpen, onClose: onBatchPriceClose } = useDisclosure()
  const [batchPriceProductIds, setBatchPriceProductIds] = useState<string[]>([])

  // 加载供应商列表
  const loadSuppliers = async (params: SupplierListParams) => {
    setLoading(true)
    try {
      const result = await getSupplierList(params)
      setSuppliers(result.records || [])
      setTotal(result.total || 0)
      setCurrentPage(result.current || 1)
      setPages(result.pages || 0)
    } catch (error: any) {
      console.error('Failed to load suppliers:', error)
      showError(error.message || t('enterpriseServiceSupplier.loading'))
      setSuppliers([])
      setTotal(0)
      setCurrentPage(1)
      setPages(0)
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadSuppliers(queryParams)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 处理查询
  const handleSearch = () => {
    const params: SupplierListParams = {
      page: 1,
      size: queryParams.size || 10,
    }

    if (formData.name.trim()) {
      params.name = formData.name.trim()
    }
    if (formData.code.trim()) {
      params.code = formData.code.trim()
    }
    if (formData.is_active !== '') {
      params.is_active = formData.is_active === 'true'
    }
    if (formData.is_locked !== '') {
      params.is_locked = formData.is_locked === 'true'
    }

    setQueryParams(params)
    loadSuppliers(params)
  }

  // 重置查询
  const handleReset = () => {
    setFormData({
      name: '',
      code: '',
      is_active: '',
      is_locked: '',
    })
    const defaultParams: SupplierListParams = {
      page: 1,
      size: 10,
    }
    setQueryParams(defaultParams)
    loadSuppliers(defaultParams)
  }

  // 分页
  const handlePageChange = (page: number) => {
    const params = { ...queryParams, page }
    setQueryParams(params)
    loadSuppliers(params)
  }

  // 打开详情模态框
  const handleViewDetail = async (supplierId: string) => {
    setSelectedSupplierId(supplierId)
    setServicesPage(1)
    onDetailOpen()
    await loadSupplierServices(supplierId, { page: 1, size: 20 })
  }

  // 加载供应商服务
  const loadSupplierServices = async (supplierId: string, params: SupplierServiceListParams) => {
    setLoadingServices(true)
    try {
      const result = await getSupplierServices(supplierId, params)
      setSupplierServices(result.records || [])
      setServicesTotal(result.total || 0)
    } catch (error: any) {
      console.error('Failed to load supplier services:', error)
      showError(error.message || t('enterpriseServiceSupplier.loading'))
      setSupplierServices([])
      setServicesTotal(0)
    } finally {
      setLoadingServices(false)
    }
  }

  return (
    <div className="w-full">
      {/* 页面头部 */}
      <PageHeader
        icon={Building2}
        title={t('enterpriseServiceSupplier.title')}
        subtitle={t('enterpriseServiceSupplier.subtitle')}
      />

      {/* 查询表单 */}
      <Card mb={4} bg={bgColor} borderColor={borderColor}>
        <CardBody>
          <HStack spacing={3} align="flex-end" flexWrap="wrap">
            {/* 供应商名称 */}
            <Box flex={1} minW="150px">
              <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.700">
                {t('enterpriseServiceSupplier.table.name')}
              </Text>
              <InputGroup size="sm">
                <InputLeftElement pointerEvents="none">
                  <Building2 size={14} color="gray" />
                </InputLeftElement>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('enterpriseServiceSupplier.table.name')}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </InputGroup>
            </Box>

            {/* 供应商代码 */}
            <Box flex={1} minW="150px">
              <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.700">
                {t('enterpriseServiceSupplier.table.code')}
              </Text>
              <InputGroup size="sm">
                <InputLeftElement pointerEvents="none">
                  <Search size={14} color="gray" />
                </InputLeftElement>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder={t('enterpriseServiceSupplier.table.code')}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </InputGroup>
            </Box>

            {/* 状态 */}
            <Box flex={1} minW="120px">
              <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.700">
                {t('productManagement.search.status')}
              </Text>
              <Select
                size="sm"
                value={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value as '' | 'true' | 'false' })}
              >
                <option value="">{t('productManagement.search.allStatus')}</option>
                <option value="true">{t('productManagement.search.active')}</option>
                <option value="false">{t('productManagement.search.inactive')}</option>
              </Select>
            </Box>

            {/* 视图切换 */}
            <HStack spacing={2}>
              <Button
                size="sm"
                variant={viewMode === 'card' ? 'solid' : 'outline'}
                colorScheme={viewMode === 'card' ? 'blue' : 'gray'}
                leftIcon={<Grid size={14} />}
                onClick={() => setViewMode('card')}
              >
                {t('enterpriseServiceSupplier.viewMode.card')}
              </Button>
              <Button
                size="sm"
                variant={viewMode === 'list' ? 'solid' : 'outline'}
                colorScheme={viewMode === 'list' ? 'blue' : 'gray'}
                leftIcon={<List size={14} />}
                onClick={() => setViewMode('list')}
              >
                {t('enterpriseServiceSupplier.viewMode.list')}
              </Button>
            </HStack>

            {/* 操作按钮 */}
            <HStack spacing={2}>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReset}
              >
                {t('productManagement.search.reset')}
              </Button>
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<Search size={14} />}
                onClick={handleSearch}
                isLoading={loading}
              >
                服务关联
              </Button>
            </HStack>
          </HStack>
        </CardBody>
      </Card>

      {/* 供应商列表 */}
      {loading ? (
        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <Flex justify="center" align="center" py={8}>
              <Spinner size="lg" color="blue.500" />
              <Text ml={4} color="gray.500">{t('enterpriseServiceSupplier.loading')}</Text>
            </Flex>
          </CardBody>
        </Card>
      ) : suppliers.length === 0 ? (
        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <VStack py={8} spacing={3}>
              <Building2 size={48} color="gray" />
              <Text color="gray.500">{t('enterpriseServiceSupplier.noData')}</Text>
            </VStack>
          </CardBody>
        </Card>
      ) : viewMode === 'card' ? (
        // 卡片视图
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 4 }} spacing={3}>
          {suppliers.map((supplier) => (
            <Card
              key={supplier.id}
              bg={bgColor}
              borderColor={borderColor}
              _hover={{ bg: cardHoverBg, cursor: 'pointer' }}
              transition="all 0.2s"
              minW="280px"
              h="180px"
            >
              <CardBody p={3}>
                <VStack align="stretch" spacing={2} h="full">
                  {/* 顶部：供应商名称 + 状态 */}
                  <HStack justify="space-between" align="flex-start">
                    <Text fontSize="13px" fontWeight="bold" color="gray.900" noOfLines={1}>
                      {supplier.name}
                    </Text>
                    {supplier.is_active ? (
                      <Badge colorScheme="green" fontSize="11px">
                        {t('productManagement.table.active')}
                      </Badge>
                    ) : (
                      <Badge colorScheme="red" fontSize="11px">
                        {t('productManagement.table.inactive')}
                      </Badge>
                    )}
                  </HStack>

                  {/* 中部：核心信息两列展示 */}
                  <Flex flex={1} gap={3}>
                    <VStack align="flex-start" spacing={1} flex={1}>
                      <Text fontSize="12px" color="gray.600">
                        {t('enterpriseServiceSupplier.card.code')}: {supplier.code || '-'}
                      </Text>
                      <Text fontSize="12px" color="gray.600">
                        {t('enterpriseServiceSupplier.card.level')}: -
                      </Text>
                      <Text fontSize="12px" color="gray.600">
                        {t('enterpriseServiceSupplier.card.contact')}: {supplier.phone || '-'}
                      </Text>
                    </VStack>
                    <VStack align="flex-start" spacing={1} flex={1}>
                      <Text fontSize="12px" color="gray.600">
                        {t('enterpriseServiceSupplier.card.serviceCount')}: {supplier.service_count ?? 0}
                      </Text>
                      <Text fontSize="12px" color="gray.600">
                        {t('enterpriseServiceSupplier.card.cooperationStatus')}: {supplier.is_locked ? t('productManagement.table.inactive') : t('productManagement.table.active')}
                      </Text>
                      <Text fontSize="12px" color="gray.600">
                        {t('enterpriseServiceSupplier.card.lastTransaction')}: -
                      </Text>
                    </VStack>
                  </Flex>

                  {/* 底部：操作按钮 */}
                  <HStack spacing={1} fontSize="11px" color="blue.600">
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => handleViewDetail(supplier.id)}
                    >
                      企服关联
                    </Button>
                    <Text>|</Text>
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => {
                        // TODO: 实现联系功能
                        showSuccess('功能开发中...')
                      }}
                    >
                      {t('enterpriseServiceSupplier.card.contact')}
                    </Button>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      ) : (
        // 列表视图
        <Card bg={bgColor} borderColor={borderColor} overflow="hidden">
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th fontSize="13px" fontWeight="semibold" color="gray.700">{t('enterpriseServiceSupplier.table.code')}</Th>
                  <Th fontSize="13px" fontWeight="semibold" color="gray.700">{t('enterpriseServiceSupplier.table.name')}</Th>
                  <Th fontSize="13px" fontWeight="semibold" color="gray.700">{t('enterpriseServiceSupplier.table.level')}</Th>
                  <Th fontSize="13px" fontWeight="semibold" color="gray.700">{t('enterpriseServiceSupplier.table.mainCategory')}</Th>
                  <Th fontSize="13px" fontWeight="semibold" color="gray.700">{t('enterpriseServiceSupplier.table.serviceCount')}</Th>
                  <Th fontSize="13px" fontWeight="semibold" color="gray.700">{t('enterpriseServiceSupplier.table.cooperationStatus')}</Th>
                  <Th fontSize="13px" fontWeight="semibold" color="gray.700">{t('enterpriseServiceSupplier.table.lastTransaction')}</Th>
                  <Th fontSize="13px" fontWeight="semibold" color="gray.700">{t('enterpriseServiceSupplier.table.actions')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {suppliers.map((supplier) => (
                  <Tr key={supplier.id} _hover={{ bg: hoverBg }} transition="background-color 0.2s">
                    <Td fontSize="12px" color="gray.600">{supplier.code || '-'}</Td>
                    <Td fontSize="12px" color="gray.900" fontWeight="medium">{supplier.name}</Td>
                    <Td fontSize="12px" color="gray.600">-</Td>
                    <Td fontSize="12px" color="gray.600">-</Td>
                    <Td fontSize="12px" color="gray.600">{supplier.service_count ?? 0}</Td>
                    <Td fontSize="12px">
                      {supplier.is_locked ? (
                        <Badge colorScheme="red" fontSize="xs">
                          {t('productManagement.table.inactive')}
                        </Badge>
                      ) : (
                        <Badge colorScheme="green" fontSize="xs">
                          {t('productManagement.table.active')}
                        </Badge>
                      )}
                    </Td>
                    <Td fontSize="12px" color="gray.600">-</Td>
                    <Td fontSize="12px">
                      <HStack spacing={2}>
                        <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => handleViewDetail(supplier.id)}
                        >
                          企服关联
                        </Button>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Card>
      )}

      {/* 分页 */}
      {pages > 1 && (
        <Card mt={4} bg={bgColor} borderColor={borderColor}>
          <CardBody py={2}>
            <Flex justify="space-between" align="center">
              <Text fontSize="xs" color="gray.600">
                {t('productManagement.pagination.info', { current: currentPage, total: pages, size: queryParams.size || 10 })}
              </Text>
              <HStack spacing={1}>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  isDisabled={currentPage === 1}
                >
                  {t('productManagement.pagination.prev')}
                </Button>
                {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
                  let pageNum: number
                  if (pages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= pages - 2) {
                    pageNum = pages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  return (
                    <Button
                      key={pageNum}
                      size="xs"
                      variant={currentPage === pageNum ? 'solid' : 'outline'}
                      colorScheme={currentPage === pageNum ? 'blue' : 'gray'}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => handlePageChange(currentPage + 1)}
                  isDisabled={currentPage === pages}
                >
                  {t('productManagement.pagination.next')}
                </Button>
              </HStack>
            </Flex>
          </CardBody>
        </Card>
      )}

      {/* 供应商详情模态框 */}
      <Modal isOpen={isDetailOpen} onClose={onDetailClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="14px" fontWeight="semibold">
            <Flex justify="space-between" align="center">
              <Text>{t('enterpriseServiceSupplier.detailModal.title')}</Text>
              {selectedSupplierId && (
                <HStack spacing={2}>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    onClick={onBatchProductOpen}
                    fontSize="12px"
                    h="28px"
                  >
                    {t('enterpriseServiceSupplier.batchAddProducts')}
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    variant="outline"
                    onClick={() => {
                      // 获取当前供应商的所有产品ID
                      const productIds = supplierServices.map(s => s.product_id)
                      setBatchPriceProductIds(productIds)
                      onBatchPriceOpen()
                    }}
                    fontSize="12px"
                    h="28px"
                    isDisabled={supplierServices.length === 0}
                  >
                    {t('enterpriseServiceSupplier.batchSetPrices')}
                  </Button>
                </HStack>
              )}
            </Flex>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {loadingServices ? (
              <Flex justify="center" align="center" py={8}>
                <Spinner size="lg" color="blue.500" />
                <Text ml={4} color="gray.500">{t('enterpriseServiceSupplier.loading')}</Text>
              </Flex>
            ) : supplierServices.length === 0 ? (
              <VStack py={8} spacing={3}>
                <Package size={48} color="gray" />
                <Text color="gray.500">{t('enterpriseServiceSupplier.noData')}</Text>
              </VStack>
            ) : (
              <VStack align="stretch" spacing={4}>
                <Accordion defaultIndex={[0]} allowMultiple>
                  {servicesByCategory.map((categoryGroup) => (
                    <AccordionItem key={categoryGroup.categoryId} border="none" mb={2}>
                      <AccordionButton
                        px={3}
                        py={2}
                        bg="#F5F5F5"
                        borderRadius="4px"
                        _hover={{ bg: '#EBEBEB' }}
                        fontSize="13px"
                        fontWeight="semibold"
                      >
                        <Box flex="1" textAlign="left">
                          <HStack spacing={2}>
                            <Text color="#262626">{categoryGroup.categoryName}</Text>
                            <Badge fontSize="10px" colorScheme="blue" variant="subtle">
                              {categoryGroup.services.length}
                            </Badge>
                          </HStack>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel px={0} pb={4}>
                        <Box overflowX="auto">
                          <Table variant="simple" size="sm">
                            <Thead bg="gray.50">
                              <Tr>
                                <Th fontSize="13px" fontWeight="semibold" color="gray.700">{t('enterpriseServiceSupplier.detailModal.serviceCode')}</Th>
                                <Th fontSize="13px" fontWeight="semibold" color="gray.700">{t('enterpriseServiceSupplier.detailModal.serviceName')}</Th>
                                <Th fontSize="13px" fontWeight="semibold" color="gray.700">RMB价格</Th>
                                <Th fontSize="13px" fontWeight="semibold" color="gray.700">IDR价格</Th>
                                <Th fontSize="13px" fontWeight="semibold" color="gray.700">{t('enterpriseServiceSupplier.detailModal.status')}</Th>
                                {isAdmin && (
                                  <Th fontSize="13px" fontWeight="semibold" color="gray.700">{t('enterpriseServiceSupplier.detailModal.actions')}</Th>
                                )}
                              </Tr>
                            </Thead>
                            <Tbody>
                              {categoryGroup.services.map((service) => {
                                // 获取当前价格和即将生效的价格
                                const now = new Date()
                                const currentPrice = service.price_history?.find(
                                  (item) =>
                                    new Date(item.effective_from) <= now &&
                                    (!item.effective_to || new Date(item.effective_to) >= now)
                                )
                                const displayCny = currentPrice?.new_price_cny ?? service.cost_price_cny
                                const displayIdr = currentPrice?.new_price_idr ?? service.cost_price_idr
                                
                                return (
                                  <Tr key={service.product_id} _hover={{ bg: hoverBg }}>
                                    <Td fontSize="12px" color="gray.600">{service.enterprise_service_code || service.product_code || '-'}</Td>
                                    <Td fontSize="12px" color="gray.900" fontWeight="medium">{service.product_name}</Td>
                                    <Td fontSize="12px" color="gray.600">
                                      {displayCny != null ? formatPrice(displayCny, 'CNY') : '-'}
                                    </Td>
                                    <Td fontSize="12px" color="gray.600">
                                      {displayIdr != null ? formatPrice(displayIdr, 'IDR') : '-'}
                                    </Td>
                                    <Td fontSize="12px">
                                      {service.is_active ? (
                                        <Badge colorScheme="green" fontSize="xs">
                                          {t('productManagement.table.active')}
                                        </Badge>
                                      ) : (
                                        <Badge colorScheme="red" fontSize="xs">
                                          {t('productManagement.table.inactive')}
                                        </Badge>
                                      )}
                                    </Td>
                                    {isAdmin && (
                                      <Td fontSize="12px">
                                        <HStack spacing={2}>
                                          <Button
                                            size="xs"
                                            variant="ghost"
                                            colorScheme="blue"
                                            onClick={() => {
                                              setSelectedService(service)
                                              onPriceEditorOpen()
                                            }}
                                          >
                                            {t('enterpriseServiceSupplier.editPrice')}
                                          </Button>
                                        </HStack>
                                      </Td>
                                    )}
                                  </Tr>
                                )
                              })}
                            </Tbody>
                          </Table>
                        </Box>
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* 批量添加产品模态框 */}
      <Modal isOpen={isBatchProductOpen} onClose={onBatchProductClose} size="5xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="14px" fontWeight="semibold">
            {t('enterpriseServiceSupplier.batchAddProducts')}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={0}>
            {selectedSupplierId && (
              <BatchProductSelector
                supplierId={selectedSupplierId}
                onConfirm={async (selectedProductIds) => {
                  try {
                    const result = await batchAddSupplierProducts(selectedSupplierId, {
                      product_ids: selectedProductIds,
                      is_available: true,
                      is_primary: false,
                    })
                    
                    if (result.success_count > 0) {
                      showSuccess(
                        t('enterpriseServiceSupplier.batchAddSuccess', {
                          success: result.success_count,
                          failed: result.failed_count,
                        })
                      )
                      // 重新加载服务列表
                      if (selectedSupplierId) {
                        await loadSupplierServices(selectedSupplierId, {
                          page: servicesPage,
                          size: 20,
                        })
                      }
                      onBatchProductClose()
                    } else {
                      showError(
                        t('enterpriseServiceSupplier.batchAddFailed', {
                          failed: result.failed_count,
                        })
                      )
                    }
                  } catch (error: any) {
                    console.error('Failed to batch add products:', error)
                    showError(error.message || t('enterpriseServiceSupplier.batchAddError'))
                  }
                }}
                onCancel={onBatchProductClose}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* 价格编辑模态框 */}
      {selectedService && (
        <VendorProductPriceEditor
          isOpen={isPriceEditorOpen}
          onClose={onPriceEditorClose}
          supplierId={selectedSupplierId!}
          productId={selectedService.product_id}
          productName={selectedService.product_name}
          currentCostPriceCny={selectedService.cost_price_cny}
          currentCostPriceIdr={selectedService.cost_price_idr}
          priceHistory={selectedService.price_history}
          onSuccess={async () => {
            // 重新加载服务列表
            if (selectedSupplierId) {
              await loadSupplierServices(selectedSupplierId, {
                page: servicesPage,
                size: 20,
              })
            }
          }}
        />
      )}

      {/* 批量设置价格模态框 */}
      <Modal isOpen={isBatchPriceOpen} onClose={onBatchPriceClose} size="6xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontSize="14px" fontWeight="semibold">
            {t('enterpriseServiceSupplier.batchSetPrices')}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody p={0}>
            {selectedSupplierId && batchPriceProductIds.length > 0 && (
              <BatchPriceEditor
                supplierId={selectedSupplierId}
                productIds={batchPriceProductIds}
                onConfirm={async (updates) => {
                  try {
                    const result = await batchUpdateSupplierPrices(selectedSupplierId, {
                      updates,
                    })
                    
                    if (result.success_count > 0) {
                      showSuccess(
                        t('enterpriseServiceSupplier.batchPriceSuccess', {
                          success: result.success_count,
                        })
                      )
                      // 重新加载服务列表
                      if (selectedSupplierId) {
                        await loadSupplierServices(selectedSupplierId, {
                          page: servicesPage,
                          size: 20,
                        })
                      }
                      onBatchPriceClose()
                    } else {
                      showError(t('enterpriseServiceSupplier.batchPriceFailed'))
                    }
                  } catch (error: any) {
                    console.error('Failed to batch update prices:', error)
                    showError(error.message || t('enterpriseServiceSupplier.batchPriceError'))
                  }
                }}
                onCancel={onBatchPriceClose}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  )
}

export default EnterpriseServiceSupplier
