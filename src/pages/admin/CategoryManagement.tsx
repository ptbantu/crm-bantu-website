/**
 * 服务分类管理页面
 * 用于对服务分类进行增删改查
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Plus, Edit, Trash2, X, Folder, CheckCircle2, XCircle } from 'lucide-react'
import {
  getCategoryList,
  getCategoryDetail,
  createCategory,
  updateCategory,
  deleteCategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@/api/categories'
import { CategoryListParams, ProductCategory } from '@/api/types'
import { useToast } from '@/components/ToastContainer'
import { PageHeader } from '@/components/admin/PageHeader'
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
} from '@chakra-ui/react'

const CategoryManagement = () => {
  const { t } = useTranslation()
  const { showSuccess, showError } = useToast()
  
  // Chakra UI 颜色模式
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  // 查询参数
  const [queryParams, setQueryParams] = useState<CategoryListParams>({
    page: 1,
    size: 10,
  })

  // 数据
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [allCategories, setAllCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [pages, setPages] = useState(0)

  // 表单状态
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    parent_id: '',
    is_active: '' as '' | 'true' | 'false',
  })

  // 弹窗状态
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null)
  const [modalFormData, setModalFormData] = useState({
    code: '',
    name: '',
    description: '',
    parent_id: '',
    display_order: 0,
    is_active: true,
  })
  const [submitting, setSubmitting] = useState(false)

  // 加载所有分类（用于父分类选择）
  useEffect(() => {
    const loadAllCategories = async () => {
      try {
        const result = await getCategoryList({ size: 1000 })
        setAllCategories(result.records)
      } catch (error: any) {
        console.error('Failed to load categories:', error)
      }
    }
    loadAllCategories()
  }, [])

  // 加载分类列表
  const loadCategories = async (params: CategoryListParams) => {
    setLoading(true)
    try {
      const result = await getCategoryList(params)
      setCategories(result.records)
      setTotal(result.total)
      setCurrentPage(result.current)
      setPages(result.pages)
    } catch (error: any) {
      showError(error.message || t('categoryManagement.error.loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadCategories(queryParams)
  }, [queryParams.page, queryParams.size])

  // 搜索
  const handleSearch = () => {
    setQueryParams({
      ...queryParams,
      code: formData.code || undefined,
      name: formData.name || undefined,
      parent_id: formData.parent_id || undefined,
      is_active: formData.is_active === '' ? undefined : formData.is_active === 'true',
      page: 1,
    })
  }

  // 重置
  const handleReset = () => {
    setFormData({
      code: '',
      name: '',
      parent_id: '',
      is_active: '',
    })
    setQueryParams({
      page: 1,
      size: 10,
    })
  }

  // 分页
  const handlePageChange = (page: number) => {
    setQueryParams({ ...queryParams, page })
  }

  // 创建
  const handleCreate = () => {
    setEditingCategory(null)
    setModalFormData({
      code: '',
      name: '',
      description: '',
      parent_id: '',
      display_order: 0,
      is_active: true,
    })
    setShowModal(true)
  }

  // 编辑
  const handleEdit = async (category: ProductCategory) => {
    try {
      const detail = await getCategoryDetail(category.id)
      setEditingCategory(detail)
      setModalFormData({
        code: detail.code,
        name: detail.name,
        description: detail.description || '',
        parent_id: detail.parent_id || '',
        display_order: detail.display_order || 0,
        is_active: detail.is_active,
      })
      setShowModal(true)
    } catch (error: any) {
      showError(error.message || t('categoryManagement.error.loadDetailFailed'))
    }
  }

  // 删除
  const handleDelete = async (category: ProductCategory) => {
    if (!window.confirm(t('categoryManagement.confirm.delete').replace('{{name}}', category.name))) {
      return
    }
    try {
      await deleteCategory(category.id)
      showSuccess(t('categoryManagement.success.delete'))
      loadCategories(queryParams)
    } catch (error: any) {
      showError(error.message || t('categoryManagement.error.deleteFailed'))
    }
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!modalFormData.name.trim()) {
      showError(t('categoryManagement.validation.nameRequired'))
      return
    }

    if (!editingCategory && !modalFormData.code.trim()) {
      showError(t('categoryManagement.validation.codeRequired'))
      return
    }

    setSubmitting(true)
    try {
      if (editingCategory) {
        const updateData: UpdateCategoryRequest = {
          name: modalFormData.name,
          description: modalFormData.description || undefined,
          display_order: modalFormData.display_order,
          is_active: modalFormData.is_active,
        }
        await updateCategory(editingCategory.id, updateData)
        showSuccess(t('categoryManagement.success.update'))
      } else {
        const createData: CreateCategoryRequest = {
          code: modalFormData.code,
          name: modalFormData.name,
          description: modalFormData.description || undefined,
          parent_id: modalFormData.parent_id || null,
          display_order: modalFormData.display_order,
          is_active: modalFormData.is_active,
        }
        await createCategory(createData)
        showSuccess(t('categoryManagement.success.create'))
      }
      setShowModal(false)
      loadCategories(queryParams)
      // 重新加载所有分类（用于父分类选择）
      const result = await getCategoryList({ size: 1000 })
      setAllCategories(result.records)
    } catch (error: any) {
      showError(error.message || t('categoryManagement.error.saveFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      {/* 页面头部 */}
      <PageHeader
        icon={Folder}
        title={t('categoryManagement.title')}
        subtitle={t('categoryManagement.subtitle')}
        actions={
          <Button
            colorScheme="primary"
            leftIcon={<Plus size={16} />}
            onClick={handleCreate}
            size="sm"
          >
            {t('categoryManagement.create')}
          </Button>
        }
      />

      {/* 查询表单 */}
      <Card mb={4} bg={bgColor} borderColor={borderColor}>
        <CardBody>
          <HStack spacing={3} align="flex-end" flexWrap="wrap">
            {/* 分类编码 */}
            <Box flex={1} minW="150px">
              <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.700">
                {t('categoryManagement.search.code')}
              </Text>
              <InputGroup size="sm">
                <InputLeftElement pointerEvents="none">
                  <Folder size={14} color="gray" />
                </InputLeftElement>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder={t('categoryManagement.search.codePlaceholder')}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </InputGroup>
            </Box>

            {/* 分类名称 */}
            <Box flex={1} minW="150px">
              <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.700">
                {t('categoryManagement.search.name')}
              </Text>
              <Input
                size="sm"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('categoryManagement.search.namePlaceholder')}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </Box>

            {/* 父分类 */}
            <Box flex={1} minW="120px">
              <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.700">
                {t('categoryManagement.search.parent')}
              </Text>
              <Select
                size="sm"
                value={formData.parent_id}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
              >
                <option value="">{t('categoryManagement.search.allCategories')}</option>
                {allCategories
                  .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name} {cat.code ? `(${cat.code})` : ''}
                    </option>
                  ))}
              </Select>
            </Box>

            {/* 状态 */}
            <Box flex={1} minW="120px">
              <Text fontSize="xs" fontWeight="medium" mb={1} color="gray.700">
                {t('categoryManagement.search.status')}
              </Text>
              <Select
                size="sm"
                value={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value as '' | 'true' | 'false' })}
              >
                <option value="">{t('categoryManagement.search.allStatus')}</option>
                <option value="true">{t('categoryManagement.search.active')}</option>
                <option value="false">{t('categoryManagement.search.inactive')}</option>
              </Select>
            </Box>

            {/* 操作按钮 */}
            <HStack spacing={2}>
              <Button
                size="sm"
                variant="outline"
                onClick={handleReset}
              >
                {t('categoryManagement.search.reset')}
              </Button>
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={<Search size={14} />}
                onClick={handleSearch}
                isLoading={loading}
              >
                {t('categoryManagement.search.search')}
              </Button>
            </HStack>
          </HStack>
        </CardBody>
      </Card>

      {/* 分类列表 */}
      {loading ? (
        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <Flex justify="center" align="center" py={8}>
              <Spinner size="lg" color="blue.500" />
              <Text ml={4} color="gray.500">{t('categoryManagement.loading')}</Text>
            </Flex>
          </CardBody>
        </Card>
      ) : categories.length === 0 ? (
        <Card bg={bgColor} borderColor={borderColor}>
          <CardBody>
            <VStack py={8} spacing={3}>
              <Folder size={48} color="gray" />
              <Text color="gray.500">{t('categoryManagement.noData')}</Text>
            </VStack>
          </CardBody>
        </Card>
      ) : (
        <Card bg={bgColor} borderColor={borderColor} overflow="hidden">
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead bg="gray.50">
                <Tr>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('categoryManagement.table.code')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('categoryManagement.table.name')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('categoryManagement.table.status')}</Th>
                  <Th fontSize="xs" fontWeight="semibold" color="gray.700">{t('categoryManagement.table.actions')}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {categories.map((category) => (
                  <Tr key={category.id} _hover={{ bg: hoverBg }} transition="background-color 0.2s">
                    <Td fontSize="sm" color="gray.900" fontWeight="medium">{category.code}</Td>
                    <Td fontSize="sm" color="gray.600">{category.name}</Td>
                    <Td fontSize="sm">
                      {category.is_active ? (
                        <Badge colorScheme="green" fontSize="xs">
                          {t('categoryManagement.table.active')}
                        </Badge>
                      ) : (
                        <Badge colorScheme="red" fontSize="xs">
                          {t('categoryManagement.table.inactive')}
                        </Badge>
                      )}
                    </Td>
                    <Td fontSize="sm">
                      <HStack spacing={1}>
                        <IconButton
                          aria-label={t('categoryManagement.edit')}
                          icon={<Edit size={14} />}
                          size="xs"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => handleEdit(category)}
                        />
                        <IconButton
                          aria-label={t('categoryManagement.delete')}
                          icon={<Trash2 size={14} />}
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDelete(category)}
                        />
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
                {t('categoryManagement.pagination.info', { current: currentPage, total: pages, size: queryParams.size || 10 })}
              </Text>
              <HStack spacing={1}>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => handlePageChange(currentPage - 1)}
                  isDisabled={currentPage === 1}
                >
                  {t('categoryManagement.pagination.prev')}
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
                  {t('categoryManagement.pagination.next')}
                </Button>
              </HStack>
            </Flex>
          </CardBody>
        </Card>
      )}

      {/* 创建/编辑弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-4 py-2.5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingCategory ? t('categoryManagement.modal.editTitle') : t('categoryManagement.modal.createTitle')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {!editingCategory && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                      {t('categoryManagement.modal.code')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={modalFormData.code}
                      onChange={(e) => setModalFormData({ ...modalFormData, code: e.target.value })}
                      placeholder={t('categoryManagement.modal.codePlaceholder')}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    {t('categoryManagement.modal.name')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={modalFormData.name}
                    onChange={(e) => setModalFormData({ ...modalFormData, name: e.target.value })}
                    placeholder={t('categoryManagement.modal.namePlaceholder')}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-0.5">
                    {t('categoryManagement.modal.description')}
                  </label>
                  <textarea
                    value={modalFormData.description}
                    onChange={(e) => setModalFormData({ ...modalFormData, description: e.target.value })}
                    placeholder={t('categoryManagement.modal.descriptionPlaceholder')}
                    rows={3}
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
                {!editingCategory && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                      {t('categoryManagement.modal.parent')}
                    </label>
                    <select
                      value={modalFormData.parent_id}
                      onChange={(e) => setModalFormData({ ...modalFormData, parent_id: e.target.value })}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
                    >
                      <option value="">{t('categoryManagement.modal.noParent')}</option>
                      {allCategories
                        .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                        .map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name} {cat.code ? `(${cat.code})` : ''}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                      {t('categoryManagement.modal.displayOrder')}
                    </label>
                    <input
                      type="number"
                      value={modalFormData.display_order}
                      onChange={(e) => setModalFormData({ ...modalFormData, display_order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-0.5">
                      {t('categoryManagement.modal.isActive')}
                    </label>
                    <div className="flex items-center mt-2">
                      <input
                        type="checkbox"
                        checked={modalFormData.is_active}
                        onChange={(e) => setModalFormData({ ...modalFormData, is_active: e.target.checked })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-xs text-gray-700">
                        {modalFormData.is_active ? t('categoryManagement.modal.active') : t('categoryManagement.modal.inactive')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 py-2.5 border-t border-gray-200 flex items-center justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t('categoryManagement.modal.cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? t('categoryManagement.modal.saving') : t('categoryManagement.modal.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CategoryManagement


