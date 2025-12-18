/**
 * 系统配置管理页面
 * 阿里云ECS风格
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
import { Settings } from 'lucide-react'
import { PageHeader } from '@/components/admin/PageHeader'
import { OSSConfigComponent } from '@/components/admin/system-config/OSSConfig'
import { AIConfigComponent } from '@/components/admin/system-config/AIConfig'
import { SMSConfigComponent } from '@/components/admin/system-config/SMSConfig'
import { EmailConfigComponent } from '@/components/admin/system-config/EmailConfig'
import { SystemStatusComponent } from '@/components/admin/system-config/SystemStatus'

const SystemConfig = () => {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState(0)

  return (
    <Box minH="100vh" bg="gray.50" py={6} px={6}>
      <PageHeader
        icon={Settings}
        title={t('systemConfig.title')}
        subtitle={t('systemConfig.subtitle')}
      />

      <Box mt={6}>
        <Tabs
          index={activeTab}
          onChange={setActiveTab}
          colorScheme="blue"
          variant="enclosed"
        >
          <TabList>
            <Tab>{t('systemConfig.tabs.oss')}</Tab>
            <Tab>{t('systemConfig.tabs.ai')}</Tab>
            <Tab>{t('systemConfig.tabs.sms')}</Tab>
            <Tab>{t('systemConfig.tabs.email')}</Tab>
            <Tab>{t('systemConfig.tabs.status')}</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0} py={4}>
              <VStack spacing={4} align="stretch">
                <OSSConfigComponent />
              </VStack>
            </TabPanel>

            <TabPanel px={0} py={4}>
              <VStack spacing={4} align="stretch">
                <AIConfigComponent />
              </VStack>
            </TabPanel>

            <TabPanel px={0} py={4}>
              <VStack spacing={4} align="stretch">
                <SMSConfigComponent />
              </VStack>
            </TabPanel>

            <TabPanel px={0} py={4}>
              <VStack spacing={4} align="stretch">
                <EmailConfigComponent />
              </VStack>
            </TabPanel>

            <TabPanel px={0} py={4}>
              <VStack spacing={4} align="stretch">
                <SystemStatusComponent />
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Box>
  )
}

export default SystemConfig
