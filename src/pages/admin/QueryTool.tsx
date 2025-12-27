/**
 * 检索工具页面
 * 阿里云ECS风格，Tab布局
 */
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  VStack,
} from '@chakra-ui/react'
import { Search } from 'lucide-react'
import { PageHeader } from '@/components/admin/PageHeader'
import { EnterpriseQueryComponent } from '@/components/admin/query-tool/EnterpriseQuery'

const QueryTool = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState(0)

  return (
    <Box minH="100vh" bg="var(--ali-bg-gray)">
      <Box w="full" py={4} px={6}>
        {/* 页面头部 */}
        <PageHeader
          icon={Search}
          title={t('queryTool.title')}
          subtitle={t('queryTool.subtitle')}
        />

        {/* Tab内容区域 */}
        <Box mt={6}>
          <Tabs
            index={activeTab}
            onChange={setActiveTab}
            colorScheme="blue"
            variant="enclosed"
          >
            <TabList>
              <Tab>{t('queryTool.tabs.enterprise')}</Tab>
            </TabList>

            <TabPanels>
              <TabPanel px={0} py={4}>
                <VStack spacing={4} align="stretch">
                  <EnterpriseQueryComponent />
                </VStack>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
    </Box>
  )
}

export default QueryTool
