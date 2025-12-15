/**
 * 批量产品选择器组件
 * 左侧：分类树（可展开/折叠）
 * 右侧：产品列表（支持多选、搜索、已选标记）
 * 底部：已选产品统计和操作按钮
 * 符合阿里云ECS高密度风格
 */
import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, ChevronRight, ChevronDown, Check } from 'lucide-react'
import {
  getCategoryTreeWithProducts,
  CategoryTreeNode,
} from '@/api/categories'
import {
  getExistingSupplierProductIds,
} from '@/api/suppliers'
import { useToast } from '@/components/ToastContainer'
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Button,
  Checkbox,
  Badge,
  Spinner,
  Flex,
  useColorModeValue,
  Divider,
} from '@chakra-ui/react'

export interface BatchProductSelectorProps {
  supplierId: string
  onConfirm: (selectedProductIds: string[]) => void
  onCancel: () => void
}

interface CategoryNodeWithExpanded extends CategoryTreeNode {
  expanded?: boolean
}

const BatchProductSelector = ({
  supplierId,
  onConfirm,
  onCancel,
}: BatchProductSelectorProps) => {
  const { t } = useTranslation()
  const { showError } = useToast()

  // 颜色模式
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('#F0F0F0', 'gray.700')
  const hoverBg = useColorModeValue('#F5F5F5', 'gray.700')
  const selectedBg = useColorModeValue('#E6F7FF', 'blue.900')

  // 状态
  const [loading, setLoading] = useState(false)
  const [categoryTree, setCategoryTree] = useState<CategoryNodeWithExpanded[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set())
  const [existingProductIds, setExistingProductIds] = useState<Set<string>>(new Set())
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // 加载分类树和已存在的产品ID
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // 并行加载分类树和已存在的产品ID
        const [treeResult, existingIds] = await Promise.all([
          getCategoryTreeWithProducts(true, true),
          getExistingSupplierProductIds(supplierId),
        ])

        // 设置分类树，默认展开第一层
        const tree = treeResult.categories.map(cat => ({
          ...cat,
          expanded: false,
        }))
        setCategoryTree(tree)

        // 设置已存在的产品ID
        setExistingProductIds(new Set(existingIds))
      } catch (error: any) {
        console.error('Failed to load data:', error)
        showError(error.message || t('batchProductSelector.loadError'))
      } finally {
        setLoading(false)
      }
    }

    if (supplierId) {
      loadData()
    }
  }, [supplierId, t, showError])

  // 递归展开/折叠分类
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  // 递归查找分类及其子分类的所有产品
  const getCategoryProducts = (category: CategoryTreeNode): Array<{
    id: string
    name: string
    code?: string | null
    enterprise_service_code?: string | null
    is_active: boolean
  }> => {
    const products = category.products || []
    const childProducts = category.children.flatMap(child => getCategoryProducts(child))
    return [...products, ...childProducts]
  }

  // 获取当前选中分类的产品列表
  const currentProducts = useMemo(() => {
    if (!selectedCategoryId) return []

    const findCategory = (categories: CategoryTreeNode[], id: string): CategoryTreeNode | null => {
      for (const cat of categories) {
        if (cat.id === id) return cat
        const found = findCategory(cat.children, id)
        if (found) return found
      }
      return null
    }

    const category = findCategory(categoryTree, selectedCategoryId)
    if (!category) return []

    return getCategoryProducts(category)
  }, [selectedCategoryId, categoryTree])

  // 过滤产品（根据搜索关键词）
  const filteredProducts = useMemo(() => {
    if (!searchKeyword.trim()) return currentProducts

    const keyword = searchKeyword.toLowerCase()
    return currentProducts.filter(product =>
      product.name.toLowerCase().includes(keyword) ||
      product.code?.toLowerCase().includes(keyword) ||
      product.enterprise_service_code?.toLowerCase().includes(keyword)
    )
  }, [currentProducts, searchKeyword])

  // 切换产品选择
  const toggleProduct = (productId: string) => {
    const newSelected = new Set(selectedProductIds)
    if (newSelected.has(productId)) {
      newSelected.delete(productId)
    } else {
      newSelected.add(productId)
    }
    setSelectedProductIds(newSelected)
  }

  // 全选/取消全选当前页
  const toggleSelectAll = () => {
    const allSelected = filteredProducts.every(p => selectedProductIds.has(p.id))
    const newSelected = new Set(selectedProductIds)

    if (allSelected) {
      filteredProducts.forEach(p => newSelected.delete(p.id))
    } else {
      filteredProducts.forEach(p => {
        if (!existingProductIds.has(p.id)) {
          newSelected.add(p.id)
        }
      })
    }

    setSelectedProductIds(newSelected)
  }

  // 渲染分类树节点
  const renderCategoryNode = (category: CategoryTreeNode, level: number = 0) => {
    const isExpanded = expandedCategories.has(category.id)
    const isSelected = selectedCategoryId === category.id
    const hasChildren = category.children.length > 0

    return (
      <Box key={category.id}>
        <Flex
          align="center"
          h="28px"
          px={`${12 + level * 16}px`}
          cursor="pointer"
          bg={isSelected ? selectedBg : 'transparent'}
          _hover={{ bg: hoverBg }}
          onClick={() => setSelectedCategoryId(category.id)}
          fontSize="12px"
          color="#262626"
        >
          {/* 展开/折叠图标 */}
          <Box w="16px" display="flex" alignItems="center" justifyContent="center">
            {hasChildren ? (
              <Box
                onClick={(e) => {
                  e.stopPropagation()
                  toggleCategory(category.id)
                }}
                cursor="pointer"
              >
                {isExpanded ? (
                  <ChevronDown size={14} color="#8C8C8C" />
                ) : (
                  <ChevronRight size={14} color="#8C8C8C" />
                )}
              </Box>
            ) : (
              <Box w="14px" />
            )}
          </Box>

          {/* 分类名称 */}
          <Text flex={1} fontWeight={isSelected ? 'semibold' : 'normal'}>
            {category.name}
          </Text>

          {/* 产品数量 */}
          <Badge
            fontSize="10px"
            colorScheme="blue"
            variant="subtle"
            ml={2}
          >
            {category.product_count}
          </Badge>
        </Flex>

        {/* 子分类 */}
        {hasChildren && isExpanded && (
          <Box>
            {category.children.map(child => renderCategoryNode(child, level + 1))}
          </Box>
        )}
      </Box>
    )
  }

  // 确认选择
  const handleConfirm = () => {
    const productIds = Array.from(selectedProductIds)
    onConfirm(productIds)
  }

  return (
    <Box w="full" h="600px" display="flex" flexDirection="column" bg={bgColor}>
      {/* 主要内容区域 */}
      <Flex flex={1} overflow="hidden">
        {/* 左侧：分类树 */}
        <Box
          w="300px"
          borderRight={`1px solid ${borderColor}`}
          overflowY="auto"
          bg={bgColor}
        >
          {loading ? (
            <Flex justify="center" align="center" h="full">
              <Spinner size="sm" />
            </Flex>
          ) : (
            <VStack align="stretch" spacing={0} py={2}>
              {categoryTree.map(category => renderCategoryNode(category))}
            </VStack>
          )}
        </Box>

        {/* 右侧：产品列表 */}
        <Box flex={1} display="flex" flexDirection="column" overflow="hidden">
          {/* 搜索栏 */}
          <Box p="12px" borderBottom={`1px solid ${borderColor}`}>
            <InputGroup size="sm">
              <InputLeftElement pointerEvents="none">
                <Search size={14} color="#8C8C8C" />
              </InputLeftElement>
              <Input
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder={t('batchProductSelector.searchPlaceholder')}
                fontSize="12px"
                h="28px"
                bg="white"
                borderColor={borderColor}
                _focus={{ borderColor: '#1890FF' }}
              />
            </InputGroup>
          </Box>

          {/* 产品列表 */}
          <Box flex={1} overflowY="auto" p="12px">
            {!selectedCategoryId ? (
              <Flex justify="center" align="center" h="full">
                <Text fontSize="12px" color="#8C8C8C">
                  {t('batchProductSelector.selectCategory')}
                </Text>
              </Flex>
            ) : filteredProducts.length === 0 ? (
              <Flex justify="center" align="center" h="full">
                <Text fontSize="12px" color="#8C8C8C">
                  {t('batchProductSelector.noProducts')}
                </Text>
              </Flex>
            ) : (
              <VStack align="stretch" spacing={0}>
                {/* 全选/取消全选 */}
                <Flex
                  align="center"
                  h="36px"
                  px="12px"
                  borderBottom={`1px solid ${borderColor}`}
                  mb={1}
                >
                  <Checkbox
                    isChecked={filteredProducts.length > 0 && filteredProducts.every(p => selectedProductIds.has(p.id))}
                    isIndeterminate={
                      filteredProducts.some(p => selectedProductIds.has(p.id)) &&
                      !filteredProducts.every(p => selectedProductIds.has(p.id))
                    }
                    onChange={toggleSelectAll}
                    fontSize="12px"
                  >
                    <Text fontSize="12px" ml={2}>
                      {t('batchProductSelector.selectAll')}
                    </Text>
                  </Checkbox>
                </Flex>

                {/* 产品列表 */}
                {filteredProducts.map((product) => {
                  const isSelected = selectedProductIds.has(product.id)
                  const isExisting = existingProductIds.has(product.id)

                  return (
                    <Flex
                      key={product.id}
                      align="center"
                      h="36px"
                      px="12px"
                      py="8px"
                      borderBottom={`1px solid ${borderColor}`}
                      _hover={{ bg: hoverBg }}
                      cursor="pointer"
                      onClick={() => !isExisting && toggleProduct(product.id)}
                      opacity={isExisting ? 0.6 : 1}
                    >
                      <Checkbox
                        isChecked={isSelected}
                        onChange={() => !isExisting && toggleProduct(product.id)}
                        isDisabled={isExisting}
                        fontSize="12px"
                      >
                        <Box ml={2}>
                          <HStack spacing={2}>
                            <Text fontSize="12px" fontWeight="medium" color="#262626">
                              {product.name}
                            </Text>
                            {product.code && (
                              <Text fontSize="11px" color="#8C8C8C">
                                ({product.code})
                              </Text>
                            )}
                            {isExisting && (
                              <Badge fontSize="10px" colorScheme="gray" variant="subtle">
                                {t('batchProductSelector.existing')}
                              </Badge>
                            )}
                          </HStack>
                        </Box>
                      </Checkbox>
                    </Flex>
                  )
                })}
              </VStack>
            )}
          </Box>
        </Box>
      </Flex>

      {/* 底部操作栏 */}
      <Box
        p="12px"
        borderTop={`1px solid ${borderColor}`}
        bg={bgColor}
      >
        <Flex justify="space-between" align="center">
          <Text fontSize="12px" color="#8C8C8C">
            {t('batchProductSelector.selectedCount', {
              count: selectedProductIds.size,
            })}
          </Text>
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
              isDisabled={selectedProductIds.size === 0}
            >
              {t('common.confirm')}
            </Button>
          </HStack>
        </Flex>
      </Box>
    </Box>
  )
}

export default BatchProductSelector
