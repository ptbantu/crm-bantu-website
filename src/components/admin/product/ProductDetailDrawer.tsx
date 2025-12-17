/**
 * 产品详情抽屉组件
 * 从右侧滑出显示产品详细信息
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Spinner,
  Alert,
  AlertIcon,
  Box,
  useColorModeValue,
} from '@chakra-ui/react'
import { getProductDetailAggregated } from '@/api/products'
import { ProductDetailAggregated } from '@/api/types'
import { useToast } from '@/components/ToastContainer'
import OverviewTab from './ProductDetailTabs/OverviewTab'
import PriceTab from './ProductDetailTabs/PriceTab'
import SupplierTab from './ProductDetailTabs/SupplierTab'
import StatisticsTab from './ProductDetailTabs/StatisticsTab'
import HistoryTab from './ProductDetailTabs/HistoryTab'
import RulesTab from './ProductDetailTabs/RulesTab'
import OperationsTab from './ProductDetailTabs/OperationsTab'

interface ProductDetailDrawerProps {
  productId: string | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (productId: string) => void
  isAdmin?: boolean
}

const ProductDetailDrawer = ({ productId, isOpen, onClose, onEdit, isAdmin = false }: ProductDetailDrawerProps) => {
  const { t } = useTranslation()
  const { showError } = useToast()
  const [data, setData] = useState<ProductDetailAggregated | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState(0)
  
  const bgColor = useColorModeValue('white', 'gray.800')

  useEffect(() => {
    if (isOpen && productId) {
      loadDetail()
    } else {
      // 关闭时重置状态
      setData(null)
      setError(null)
      setActiveTab(0)
    }
  }, [isOpen, productId])

  const loadDetail = async () => {
    if (!productId) return
    
    setLoading(true)
    setError(null)
    
    try {
      const result = await getProductDetailAggregated(productId)
      setData(result)
    } catch (err: any) {
      const errorMessage = err.message || t('productManagement.detail.error.loadFailed', '加载产品详情失败')
      setError(errorMessage)
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (index: number) => {
    setActiveTab(index)
  }

  if (!productId) {
    return null
  }

  return (
    <Drawer
      isOpen={isOpen}
      placement="right"
      onClose={onClose}
      size="xl"
    >
      <DrawerOverlay />
      <DrawerContent bg={bgColor}>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px" pb={4}>
          {data ? (
            <>
              {t('productManagement.detail.title', '产品详情')} - {data.overview.name}
              {data.overview.code && (
                <Box as="span" fontSize="sm" color="gray.500" fontWeight="normal" ml={2}>
                  ({data.overview.code})
                </Box>
              )}
            </>
          ) : (
            t('productManagement.detail.title', '产品详情')
          )}
        </DrawerHeader>

        <DrawerBody p={0}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minH="400px">
              <Spinner size="xl" />
            </Box>
          ) : error ? (
            <Alert status="error" m={4}>
              <AlertIcon />
              {error}
            </Alert>
          ) : data ? (
            <Tabs index={activeTab} onChange={handleTabChange} colorScheme="blue">
              <TabList px={4} borderBottomWidth="1px" position="sticky" top={0} bg={bgColor} zIndex={1}>
                <Tab>{t('productManagement.detail.tabs.overview', '概览')}</Tab>
                <Tab>{t('productManagement.detail.tabs.price', '价格')}</Tab>
                <Tab>{t('productManagement.detail.tabs.supplier', '供应商')}</Tab>
                <Tab>{t('productManagement.detail.tabs.statistics', '统计')}</Tab>
                <Tab>{t('productManagement.detail.tabs.history', '历史')}</Tab>
                <Tab>{t('productManagement.detail.tabs.rules', '规则')}</Tab>
                <Tab>{t('productManagement.detail.tabs.operations', '操作')}</Tab>
              </TabList>

              <TabPanels>
                <TabPanel px={4} py={6}>
                  <OverviewTab data={data} />
                </TabPanel>
                <TabPanel px={4} py={6}>
                  <PriceTab data={data} />
                </TabPanel>
                <TabPanel px={4} py={6}>
                  <SupplierTab data={data} />
                </TabPanel>
                <TabPanel px={4} py={6}>
                  <StatisticsTab data={data} />
                </TabPanel>
                <TabPanel px={4} py={6}>
                  <HistoryTab data={data} />
                </TabPanel>
                <TabPanel px={4} py={6}>
                  <RulesTab data={data} />
                </TabPanel>
                <TabPanel px={4} py={6}>
                  <OperationsTab data={data} productId={productId} onEdit={onEdit} isAdmin={isAdmin} />
                </TabPanel>
              </TabPanels>
            </Tabs>
          ) : null}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export default ProductDetailDrawer
