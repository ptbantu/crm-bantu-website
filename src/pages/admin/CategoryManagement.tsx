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

const CategoryManagement = () => {
  const { t } = useTranslation()
  const { showSuccess, showError } = useToast()

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
      {/* 页面标题 */}
      <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-1.5 tracking-tight">
              {t('categoryManagement.title')}
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              {t('categoryManagement.subtitle')}
            </p>
          </div>
          <button
            onClick={handleCreate}
            className="inline-flex items-center space-x-1.5 px-4 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>{t('categoryManagement.create')}</span>
          </button>
      </div>

      {/* 查询表单 */}
      <div className="bg-white rounded-xl border border-gray-200 p-2 mb-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('categoryManagement.search.code')}
            </label>
            <div className="relative">
              <Folder className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder={t('categoryManagement.search.codePlaceholder')}
                className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('categoryManagement.search.name')}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={t('categoryManagement.search.namePlaceholder')}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('categoryManagement.search.parent')}
            </label>
            <select
              value={formData.parent_id}
              onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
            >
              <option value="">{t('categoryManagement.search.allCategories')}</option>
              {allCategories
                .filter(cat => !editingCategory || cat.id !== editingCategory.id)
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} {cat.code ? `(${cat.code})` : ''}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('categoryManagement.search.status')}
            </label>
            <select
              value={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.value as '' | 'true' | 'false' })}
              className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm bg-white"
            >
              <option value="">{t('categoryManagement.search.allStatus')}</option>
              <option value="true">{t('categoryManagement.search.active')}</option>
              <option value="false">{t('categoryManagement.search.inactive')}</option>
            </select>
          </div>
        </div>
        <div className="flex items-center justify-end space-x-2">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('categoryManagement.search.reset')}
          </button>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-1.5 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-1.5"
          >
            <Search className="h-3.5 w-3.5" />
            <span>{t('categoryManagement.search.search')}</span>
          </button>
          </div>
        </div>

      {/* 分类列表 */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <div className="text-sm text-gray-500">{t('categoryManagement.loading')}</div>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-sm text-gray-500">{t('categoryManagement.noData')}</div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-1 py-1 text-left text-xs font-semibold text-gray-900">
                      {t('categoryManagement.table.code')}
                    </th>
                    <th className="px-1 py-1 text-left text-xs font-semibold text-gray-900">
                      {t('categoryManagement.table.name')}
                    </th>
                    <th className="px-1 py-1 text-left text-xs font-semibold text-gray-900">
                      {t('categoryManagement.table.status')}
                    </th>
                    <th className="px-1 py-1 text-left text-xs font-semibold text-gray-900 w-20">
                      {t('categoryManagement.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr
                      key={category.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-1 py-1 text-sm text-gray-900 font-medium">
                        {category.code}
                      </td>
                      <td className="px-1 py-1 text-sm text-gray-700">
                        {category.name}
                      </td>
                      <td className="px-1 py-1">
                        {category.is_active ? (
                          <span className="inline-flex items-center space-x-1 text-xs text-green-600">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>{t('categoryManagement.table.active')}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-xs text-red-600">
                            <XCircle className="h-3.5 w-3.5" />
                            <span>{t('categoryManagement.table.inactive')}</span>
                          </span>
                        )}
                      </td>
                      <td className="px-1 py-1">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleEdit(category)}
                            className="p-1 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                            title={t('categoryManagement.edit')}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title={t('categoryManagement.delete')}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {pages > 1 && (
              <div className="px-1 py-1 border-t border-gray-200 flex items-center justify-between">
                <div className="text-xs text-gray-600">
                  {t('categoryManagement.pagination.total').replace('{{total}}', total.toString())}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2 py-0.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('categoryManagement.pagination.prev')}
                  </button>
                  <div className="text-xs text-gray-700">
                    {t('categoryManagement.pagination.page')
                      .replace('{{current}}', currentPage.toString())
                      .replace('{{total}}', pages.toString())}
                  </div>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pages}
                    className="px-2 py-0.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('categoryManagement.pagination.next')}
                  </button>
                </div>
              </div>
            )}
            </>
          )}
        </div>

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


