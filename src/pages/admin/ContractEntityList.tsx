/**
 * 财税主体管理页面
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, Edit, Trash2, Save, X } from 'lucide-react'
import {
  getContractEntityList,
  getContractEntityDetail,
  createContractEntity,
  updateContractEntity,
  deleteContractEntity,
  ContractEntity,
  ContractEntityListParams,
  CreateContractEntityRequest,
  UpdateContractEntityRequest,
} from '@/api/contractEntities'
import { useToast } from '@/components/ToastContainer'
import { PageHeader } from '@/components/admin/PageHeader'
import EcsModal from '@/components/admin/EcsModal'
import {
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
  HStack,
  VStack,
  Box,
  Flex,
  Spinner,
  Text,
  Badge,
  IconButton,
  Card,
  CardBody,
  useColorModeValue,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react'

const ContractEntityList = () => {
  const { t } = useTranslation()
  const { showSuccess, showError } = useToast()
  
  // Chakra UI 颜色模式
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  // 查询参数
  const [queryParams, setQueryParams] = useState<ContractEntityListParams>({
    page: 1,
    size: 10,
  })

  // 数据
  const [entities, setEntities] = useState<ContractEntity[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pages, setPages] = useState(0)

  // 表单状态
  const [formData, setFormData] = useState({
    entity_code: '',
    entity_name: '',
    short_name: '',
    currency: '' as '' | 'CNY' | 'IDR',
    is_active: '' as '' | 'true' | 'false',
  })

  // 弹窗状态
  const [showModal, setShowModal] = useState(false)
  const [editingEntity, setEditingEntity] = useState<ContractEntity | null>(null)
  const [modalFormData, setModalFormData] = useState<CreateContractEntityRequest>({
    entity_code: '',
    entity_name: '',
    short_name: '',
    legal_representative: '',
    tax_rate: 0,
    tax_id: '',
    bank_name: '',
    bank_account_no: '',
    bank_account_name: '',
    currency: 'CNY',
    address: '',
    contact_phone: '',
    is_active: true,
  })
  const [submitting, setSubmitting] = useState(false)

  // 确认弹窗状态
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean
    entity: ContractEntity | null
  }>({
    open: false,
    entity: null,
  })

  // 加载财税主体列表
  const loadEntities = async (params: ContractEntityListParams) => {
    setLoading(true)
    try {
      const result = await getContractEntityList(params)
      setEntities(result.records)
      setTotal(result.total)
      setCurrentPage(result.current)
      setPages(result.pages)
    } catch (error: any) {
      showError(error.message || t('contractEntity.error.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadEntities(queryParams)
  }, [])

  // 处理查询
  const handleSearch = () => {
    const params: ContractEntityListParams = {
      page: 1,
      size: queryParams.size || 10,
    }

    if (formData.entity_code.trim()) {
      params.entity_code = formData.entity_code.trim()
    }
    if (formData.entity_name.trim()) {
      params.entity_name = formData.entity_name.trim()
    }
    if (formData.short_name.trim()) {
      params.short_name = formData.short_name.trim()
    }
    if (formData.currency) {
      params.currency = formData.currency
    }
    if (formData.is_active !== '') {
      params.is_active = formData.is_active === 'true'
    }

    setQueryParams(params)
    loadEntities(params)
  }

  // 重置查询
  const handleReset = () => {
    setFormData({
      entity_code: '',
      entity_name: '',
      short_name: '',
      currency: '',
      is_active: '',
    })
    const defaultParams: ContractEntityListParams = {
      page: 1,
      size: 10,
    }
    setQueryParams(defaultParams)
    loadEntities(defaultParams)
  }

  // 分页
  const handlePageChange = (page: number) => {
    const params = { ...queryParams, page }
    setQueryParams(params)
    loadEntities(params)
  }

  // 打开创建弹窗
  const handleCreate = () => {
    setEditingEntity(null)
    setModalFormData({
      entity_code: '',
      entity_name: '',
      short_name: '',
      legal_representative: '',
      tax_rate: 0,
      tax_id: '',
      bank_name: '',
      bank_account_no: '',
      bank_account_name: '',
      currency: 'CNY',
      address: '',
      contact_phone: '',
      is_active: true,
    })
    setShowModal(true)
  }

  // 打开编辑弹窗
  const handleEdit = async (entity: ContractEntity) => {
    setEditingEntity(entity)
    try {
      const detail = await getContractEntityDetail(entity.id)
      setModalFormData({
        entity_code: detail.entity_code,
        entity_name: detail.entity_name,
        short_name: detail.short_name,
        legal_representative: detail.legal_representative || '',
        tax_rate: detail.tax_rate,
        tax_id: detail.tax_id || '',
        bank_name: detail.bank_name || '',
        bank_account_no: detail.bank_account_no || '',
        bank_account_name: detail.bank_account_name || '',
        currency: detail.currency,
        address: detail.address || '',
        contact_phone: detail.contact_phone || '',
        is_active: detail.is_active,
      })
      setShowModal(true)
    } catch (error: any) {
      showError(error.message || t('contractEntity.error.loadDetailFailed'))
    }
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!modalFormData.entity_code.trim()) {
      showError(t('contractEntity.error.entityCodeRequired'))
      return
    }
    if (!modalFormData.entity_name.trim()) {
      showError(t('contractEntity.error.entityNameRequired'))
      return
    }
    if (!modalFormData.short_name.trim()) {
      showError(t('contractEntity.error.shortNameRequired'))
      return
    }

    setSubmitting(true)
    try {
      if (editingEntity) {
        const updateData: UpdateContractEntityRequest = { ...modalFormData }
        await updateContractEntity(editingEntity.id, updateData)
        showSuccess(t('contractEntity.success.updateSuccess'))
      } else {
        await createContractEntity(modalFormData)
        showSuccess(t('contractEntity.success.createSuccess'))
      }
      setShowModal(false)
      loadEntities(queryParams)
    } catch (error: any) {
      showError(error.message || t('contractEntity.error.submitFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  // 删除确认
  const handleDeleteConfirm = (entity: ContractEntity) => {
    setConfirmModal({ open: true, entity })
  }

  // 执行删除
  const handleDelete = async () => {
    if (!confirmModal.entity) return

    try {
      await deleteContractEntity(confirmModal.entity.id)
      showSuccess(t('contractEntity.success.deleteSuccess'))
      setConfirmModal({ open: false, entity: null })
      loadEntities(queryParams)
    } catch (error: any) {
      showError(error.message || t('contractEntity.error.deleteFailed'))
    }
  }

  return (
    <Box>
      <PageHeader
        title={t('contractEntity.title')}
        description={t('contractEntity.description')}
      />

      {/* 查询表单 */}
      <Card mb={4} bg={bgColor} borderColor={borderColor}>
        <CardBody>
          <HStack spacing={4} flexWrap="wrap">
            <InputGroup maxW="200px">
              <Input
                placeholder={t('contractEntity.search.entityCode')}
                value={formData.entity_code}
                onChange={(e) => setFormData({ ...formData, entity_code: e.target.value })}
              />
            </InputGroup>
            <InputGroup maxW="200px">
              <Input
                placeholder={t('contractEntity.search.entityName')}
                value={formData.entity_name}
                onChange={(e) => setFormData({ ...formData, entity_name: e.target.value })}
              />
            </InputGroup>
            <InputGroup maxW="200px">
              <Input
                placeholder={t('contractEntity.search.shortName')}
                value={formData.short_name}
                onChange={(e) => setFormData({ ...formData, short_name: e.target.value })}
              />
            </InputGroup>
            <Select
              placeholder={t('contractEntity.search.currency')}
              maxW="150px"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value as '' | 'CNY' | 'IDR' })}
            >
              <option value="CNY">CNY</option>
              <option value="IDR">IDR</option>
            </Select>
            <Select
              placeholder={t('contractEntity.search.status')}
              maxW="150px"
              value={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.value as '' | 'true' | 'false' })}
            >
              <option value="true">{t('common.enabled')}</option>
              <option value="false">{t('common.disabled')}</option>
            </Select>
            <Button onClick={handleSearch}>
              {t('common.search')}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              {t('common.reset')}
            </Button>
            <Button colorScheme="blue" onClick={handleCreate}>
              {t('contractEntity.add')}
            </Button>
          </HStack>
        </CardBody>
      </Card>

      {/* 数据表格 */}
      <Card bg={bgColor} borderColor={borderColor}>
        <CardBody>
          {loading ? (
            <Flex justify="center" align="center" py={8}>
              <Spinner size="lg" />
            </Flex>
          ) : (
            <>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>{t('contractEntity.table.entityCode')}</Th>
                    <Th>{t('contractEntity.table.entityName')}</Th>
                    <Th>{t('contractEntity.table.shortName')}</Th>
                    <Th>{t('contractEntity.table.legalRepresentative')}</Th>
                    <Th>{t('contractEntity.table.taxRate')}</Th>
                    <Th>{t('contractEntity.table.taxId')}</Th>
                    <Th>{t('contractEntity.table.currency')}</Th>
                    <Th>{t('contractEntity.table.status')}</Th>
                    <Th>{t('common.actions')}</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {entities.length === 0 ? (
                    <Tr>
                      <Td colSpan={9} textAlign="center" py={8}>
                        <Text color="gray.500">{t('contractEntity.noData')}</Text>
                      </Td>
                    </Tr>
                  ) : (
                    entities.map((entity) => (
                      <Tr key={entity.id} _hover={{ bg: hoverBg }}>
                        <Td>{entity.entity_code}</Td>
                        <Td>{entity.entity_name}</Td>
                        <Td>{entity.short_name}</Td>
                        <Td>{entity.legal_representative || '-'}</Td>
                        <Td>{(Number(entity.tax_rate) * 100).toFixed(2)}%</Td>
                        <Td>{entity.tax_id || '-'}</Td>
                        <Td>{entity.currency}</Td>
                        <Td>
                          <Badge colorScheme={entity.is_active ? 'green' : 'red'}>
                            {entity.is_active ? t('common.enabled') : t('common.disabled')}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(entity)}
                            >
                              {t('common.edit')}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleDeleteConfirm(entity)}
                            >
                              {t('common.delete')}
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>

              {/* 分页 */}
              {pages > 1 && (
                <Flex justify="flex-end" mt={4}>
                  <HStack spacing={2}>
                    <Button
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      isDisabled={currentPage === 1}
                    >
                      {t('common.previous')}
                    </Button>
                    <Text>
                      {t('common.pageInfo', { current: currentPage, total: pages })}
                    </Text>
                    <Button
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      isDisabled={currentPage === pages}
                    >
                      {t('common.next')}
                    </Button>
                  </HStack>
                </Flex>
              )}
            </>
          )}
        </CardBody>
      </Card>

      {/* 创建/编辑弹窗 */}
      <EcsModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingEntity ? t('contractEntity.edit') : t('contractEntity.create')}
        size="xl"
      >
        <VStack spacing={4} align="stretch">
          <Box>
            <Text mb={2} fontWeight="medium">
              {t('contractEntity.form.entityCode')} <Text as="span" color="red.500">*</Text>
            </Text>
            <Input
              value={modalFormData.entity_code}
              onChange={(e) => setModalFormData({ ...modalFormData, entity_code: e.target.value })}
              placeholder={t('contractEntity.form.entityCodePlaceholder')}
              isDisabled={!!editingEntity}
            />
          </Box>
          <Box>
            <Text mb={2} fontWeight="medium">
              {t('contractEntity.form.entityName')} <Text as="span" color="red.500">*</Text>
            </Text>
            <Input
              value={modalFormData.entity_name}
              onChange={(e) => setModalFormData({ ...modalFormData, entity_name: e.target.value })}
              placeholder={t('contractEntity.form.entityNamePlaceholder')}
            />
          </Box>
          <Box>
            <Text mb={2} fontWeight="medium">
              {t('contractEntity.form.shortName')} <Text as="span" color="red.500">*</Text>
            </Text>
            <Input
              value={modalFormData.short_name}
              onChange={(e) => setModalFormData({ ...modalFormData, short_name: e.target.value })}
              placeholder={t('contractEntity.form.shortNamePlaceholder')}
            />
          </Box>
          <Box>
            <Text mb={2} fontWeight="medium">{t('contractEntity.form.legalRepresentative')}</Text>
            <Input
              value={modalFormData.legal_representative}
              onChange={(e) => setModalFormData({ ...modalFormData, legal_representative: e.target.value })}
              placeholder={t('contractEntity.form.legalRepresentativePlaceholder')}
            />
          </Box>
          <HStack spacing={4}>
            <Box flex={1}>
              <Text mb={2} fontWeight="medium">{t('contractEntity.form.taxRate')}</Text>
              <NumberInput
                value={modalFormData.tax_rate}
                onChange={(_, value) => setModalFormData({ ...modalFormData, tax_rate: isNaN(value) ? 0 : value })}
                min={0}
                max={1}
                step={0.0001}
                precision={4}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Box>
            <Box flex={1}>
              <Text mb={2} fontWeight="medium">{t('contractEntity.form.taxId')}</Text>
              <Input
                value={modalFormData.tax_id}
                onChange={(e) => setModalFormData({ ...modalFormData, tax_id: e.target.value })}
                placeholder={t('contractEntity.form.taxIdPlaceholder')}
              />
            </Box>
          </HStack>
          <Box>
            <Text mb={2} fontWeight="medium">{t('contractEntity.form.bankName')}</Text>
            <Input
              value={modalFormData.bank_name}
              onChange={(e) => setModalFormData({ ...modalFormData, bank_name: e.target.value })}
              placeholder={t('contractEntity.form.bankNamePlaceholder')}
            />
          </Box>
          <HStack spacing={4}>
            <Box flex={1}>
              <Text mb={2} fontWeight="medium">{t('contractEntity.form.bankAccountNo')}</Text>
              <Input
                value={modalFormData.bank_account_no}
                onChange={(e) => setModalFormData({ ...modalFormData, bank_account_no: e.target.value })}
                placeholder={t('contractEntity.form.bankAccountNoPlaceholder')}
              />
            </Box>
            <Box flex={1}>
              <Text mb={2} fontWeight="medium">{t('contractEntity.form.bankAccountName')}</Text>
              <Input
                value={modalFormData.bank_account_name}
                onChange={(e) => setModalFormData({ ...modalFormData, bank_account_name: e.target.value })}
                placeholder={t('contractEntity.form.bankAccountNamePlaceholder')}
              />
            </Box>
          </HStack>
          <HStack spacing={4}>
            <Box flex={1}>
              <Text mb={2} fontWeight="medium">{t('contractEntity.form.currency')}</Text>
              <Select
                value={modalFormData.currency}
                onChange={(e) => setModalFormData({ ...modalFormData, currency: e.target.value as 'CNY' | 'IDR' })}
              >
                <option value="CNY">CNY</option>
                <option value="IDR">IDR</option>
              </Select>
            </Box>
            <Box flex={1}>
              <Text mb={2} fontWeight="medium">{t('contractEntity.form.contactPhone')}</Text>
              <Input
                value={modalFormData.contact_phone}
                onChange={(e) => setModalFormData({ ...modalFormData, contact_phone: e.target.value })}
                placeholder={t('contractEntity.form.contactPhonePlaceholder')}
              />
            </Box>
          </HStack>
          <Box>
            <Text mb={2} fontWeight="medium">{t('contractEntity.form.address')}</Text>
            <Textarea
              value={modalFormData.address}
              onChange={(e) => setModalFormData({ ...modalFormData, address: e.target.value })}
              placeholder={t('contractEntity.form.addressPlaceholder')}
              rows={3}
            />
          </Box>
          <Box>
            <Text mb={2} fontWeight="medium">{t('contractEntity.form.status')}</Text>
            <Select
              value={modalFormData.is_active ? 'true' : 'false'}
              onChange={(e) => setModalFormData({ ...modalFormData, is_active: e.target.value === 'true' })}
            >
              <option value="true">{t('common.enabled')}</option>
              <option value="false">{t('common.disabled')}</option>
            </Select>
          </Box>
          <HStack spacing={4} justify="flex-end" pt={4}>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={submitting}
            >
              {t('common.save')}
            </Button>
          </HStack>
        </VStack>
      </EcsModal>

      {/* 删除确认弹窗 */}
      <EcsModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, entity: null })}
        title={t('contractEntity.deleteConfirm.title')}
      >
        <VStack spacing={4} align="stretch">
          <Text>
            {t('contractEntity.deleteConfirm.message', { name: confirmModal.entity?.entity_name })}
          </Text>
          <HStack spacing={4} justify="flex-end" pt={4}>
            <Button variant="outline" onClick={() => setConfirmModal({ open: false, entity: null })}>
              {t('common.cancel')}
            </Button>
            <Button colorScheme="red" onClick={handleDelete}>
              {t('common.confirm')}
            </Button>
          </HStack>
        </VStack>
      </EcsModal>
    </Box>
  )
}

export default ContractEntityList
