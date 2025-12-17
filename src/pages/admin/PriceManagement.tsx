/**
 * 价格与汇率管理页面
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Flex,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  HStack,
  VStack,
  Text,
  Badge,
  Button,
  useColorModeValue,
  Card,
  CardBody,
  Spinner,
} from '@chakra-ui/react'
import { RefreshCw, Download, FileText, Calendar } from 'lucide-react'
import { useToast } from '@/components/ToastContainer'
import { PageHeader } from '@/components/admin/PageHeader'
import { useAuth } from '@/hooks/useAuth'
import { ProductPriceTable } from '@/components/admin/price/ProductPriceTable'
import { ExchangeRatePanel } from '@/components/admin/price/ExchangeRatePanel'
import { UpcomingPriceChanges } from '@/components/admin/price/UpcomingPriceChanges'
import { PriceChangeLogs } from '@/components/admin/price/PriceChangeLogs'

const PriceManagement = () => {
  const { t } = useTranslation()
  const { showSuccess, showError } = useToast()
  const { user } = useAuth()
  
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  
  const [activeTab, setActiveTab] = useState(0)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date())
  const [loading, setLoading] = useState(false)
  
  // 检查是否为管理员
  const isAdmin = user?.roles?.includes('ADMIN') || user?.roles?.includes('admin')
  
  // 刷新数据
  const handleRefresh = async () => {
    setLoading(true)
    try {
      // 触发子组件刷新
      setLastUpdateTime(new Date())
      showSuccess('数据已刷新')
    } catch (error: any) {
      showError(error.message || '刷新失败')
    } finally {
      setLoading(false)
    }
  }
  
  // 导出价格表
  const handleExport = () => {
    // TODO: 实现导出功能
    showSuccess('导出功能开发中')
  }
  
  // 查看操作日志
  const handleViewLogs = () => {
    setActiveTab(2)
  }
  
  return (
    <Box>
      <PageHeader
        title="价格与汇率管理"
        description="管理产品价格和汇率，支持未来生效价格设置"
      />
      
      {/* 顶部操作栏 */}
      <Card mb={4} bg={bgColor} borderColor={borderColor}>
        <CardBody>
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <HStack spacing={4}>
              <Badge colorScheme={isAdmin ? 'blue' : 'gray'}>
                {isAdmin ? '管理员' : '查看者'}
              </Badge>
              <Text fontSize="sm" color="gray.500">
                最后更新: {lastUpdateTime.toLocaleString('zh-CN')}
              </Text>
            </HStack>
            
            <HStack spacing={2}>
              <Button
                size="sm"
                leftIcon={<RefreshCw size={16} />}
                onClick={handleRefresh}
                isLoading={loading}
                variant="outline"
              >
                刷新数据
              </Button>
              {isAdmin && (
                <>
                  <Button
                    size="sm"
                    leftIcon={<Download size={16} />}
                    onClick={handleExport}
                    variant="outline"
                  >
                    导出价格表
                  </Button>
                  <Button
                    size="sm"
                    leftIcon={<FileText size={16} />}
                    onClick={handleViewLogs}
                    variant="outline"
                  >
                    操作日志
                  </Button>
                </>
              )}
            </HStack>
          </Flex>
        </CardBody>
      </Card>
      
      {/* 主内容区域 */}
      <Tabs index={activeTab} onChange={setActiveTab} colorScheme="blue">
        <TabList>
          <Tab>产品价格管理</Tab>
          <Tab>汇率管理</Tab>
          <Tab>即将生效变更</Tab>
          {isAdmin && <Tab>操作日志</Tab>}
        </TabList>
        
        <TabPanels>
          {/* 产品价格管理 */}
          <TabPanel px={0}>
            <ProductPriceTable isAdmin={isAdmin} refreshKey={lastUpdateTime.getTime()} />
          </TabPanel>
          
          {/* 汇率管理 */}
          <TabPanel px={0}>
            <Flex gap={4} direction={{ base: 'column', lg: 'row' }}>
              <Box flex={1}>
                <ExchangeRatePanel isAdmin={isAdmin} refreshKey={lastUpdateTime.getTime()} />
              </Box>
            </Flex>
          </TabPanel>
          
          {/* 即将生效变更 */}
          <TabPanel px={0}>
            <UpcomingPriceChanges isAdmin={isAdmin} refreshKey={lastUpdateTime.getTime()} />
          </TabPanel>
          
          {/* 操作日志 */}
          {isAdmin && (
            <TabPanel px={0}>
              <PriceChangeLogs refreshKey={lastUpdateTime.getTime()} />
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </Box>
  )
}

export default PriceManagement
