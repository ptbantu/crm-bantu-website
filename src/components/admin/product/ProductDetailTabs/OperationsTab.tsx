/**
 * 快捷操作Tab
 */
import { useTranslation } from 'react-i18next'
import { Edit, DollarSign, Building2, BarChart3, Copy, Ban, Download, Printer, Share2, RefreshCw } from 'lucide-react'
import {
  Box,
  VStack,
  SimpleGrid,
  Button,
  Heading,
  HStack,
} from '@chakra-ui/react'
import { ProductDetailAggregated } from '@/api/types'

interface OperationsTabProps {
  data: ProductDetailAggregated
  productId: string
  onEdit?: (productId: string) => void
  isAdmin?: boolean
}

const OperationsTab = ({ data, productId, onEdit, isAdmin = false }: OperationsTabProps) => {
  const { t } = useTranslation()
  const handleEdit = () => {
    if (onEdit) {
      onEdit(productId)
    }
  }

  const handleCopy = () => {
    // 复制产品信息到剪贴板
    const productInfo = `${t('productManagement.detail.productName', '产品名称')}: ${data.overview.name}\n${t('productManagement.detail.productCode', '产品编码')}: ${data.overview.code || '-'}\n${t('productManagement.detail.category', '分类')}: ${data.overview.category_name || '-'}`
    navigator.clipboard.writeText(productInfo)
  }

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="md">{t('productManagement.detail.quickActions', '快捷操作')}</Heading>
      
      <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
        {isAdmin && (
          <Button
            leftIcon={<Edit size={16} />}
            colorScheme="blue"
            onClick={handleEdit}
          >
            {t('productManagement.detail.editProduct', '编辑产品')}
          </Button>
        )}

        {isAdmin && (
          <Button
            leftIcon={<DollarSign size={16} />}
            variant="outline"
          >
            {t('productManagement.detail.adjustPrice', '调整价格')}
          </Button>
        )}

        {isAdmin && (
          <Button
            leftIcon={<Building2 size={16} />}
            variant="outline"
          >
            {t('productManagement.detail.supplierManagement', '供应商管理')}
          </Button>
        )}

        <Button
          leftIcon={<BarChart3 size={16} />}
          variant="outline"
        >
          {t('productManagement.detail.viewStatistics', '查看统计报表')}
        </Button>

        {isAdmin && (
          <Button
            leftIcon={<Copy size={16} />}
            variant="outline"
            onClick={handleCopy}
          >
            {t('productManagement.detail.copyProduct', '复制产品')}
          </Button>
        )}

        {isAdmin && (
          <Button
            leftIcon={<Ban size={16} />}
            variant="outline"
            colorScheme="red"
          >
            {t('productManagement.detail.disableProduct', '禁用产品')}
          </Button>
        )}

        <Button
          leftIcon={<Download size={16} />}
          variant="outline"
        >
          {t('productManagement.detail.exportData', '导出数据')}
        </Button>

        <Button
          leftIcon={<Printer size={16} />}
          variant="outline"
        >
          {t('productManagement.detail.printDetail', '打印详情')}
        </Button>

        <Button
          leftIcon={<Share2 size={16} />}
          variant="outline"
        >
          {t('productManagement.detail.shareLink', '分享链接')}
        </Button>
      </SimpleGrid>

      <HStack spacing={2} mt={4}>
        <Button
          leftIcon={<RefreshCw size={16} />}
          variant="outline"
          size="sm"
        >
          {t('productManagement.detail.refreshDetail', '刷新详情')}
        </Button>
        <Button
          variant="outline"
          size="sm"
        >
          {t('productManagement.detail.exportAll', '导出全部')}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
        >
          {t('productManagement.detail.copyInfo', '复制信息')}
        </Button>
      </HStack>
    </VStack>
  )
}

export default OperationsTab
