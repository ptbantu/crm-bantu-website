/**
 * 短信服务配置组件
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  FormControl,
  FormLabel,
  Input,
  Switch,
  Button,
  VStack,
  HStack,
  useToast,
  Select,
} from '@chakra-ui/react'
import { ConfigCard } from './ConfigCard'
import { SensitiveInput } from './SensitiveInput'
import { TestButton } from './TestButton'
import { getSystemConfig, updateSystemConfig, SMSConfig } from '@/api/systemConfig'

export const SMSConfigComponent = () => {
  const { t } = useTranslation()
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<SMSConfig>({
    provider: 'aliyun',
    access_key_id: '',
    access_key_secret: '',
    sign_name: '',
    template_code: '',
    region: '',
    is_enabled: true,
  })

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const data = await getSystemConfig('sms')
      if (data && Object.keys(data).length > 0) {
        setConfig(data as SMSConfig)
      }
    } catch (error: any) {
      toast({
        title: t('systemConfig.loadError'),
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSystemConfig('sms', config)
      toast({
        title: t('systemConfig.saveSuccess'),
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      await loadConfig()
    } catch (error: any) {
      toast({
        title: t('systemConfig.saveError'),
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <ConfigCard
      title={t('systemConfig.sms.title')}
      status={config.is_enabled ? 'enabled' : 'disabled'}
      actions={
        <HStack spacing={2}>
          <TestButton configType="sms" />
          <Button
            colorScheme="blue"
            onClick={handleSave}
            isLoading={saving}
            loadingText={t('common.save')}
            size="sm"
          >
            {t('common.save')}
          </Button>
        </HStack>
      }
    >
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>{t('systemConfig.sms.provider')}</FormLabel>
          <Select
            value={config.provider}
            onChange={(e) => setConfig({ ...config, provider: e.target.value })}
          >
            <option value="aliyun">阿里云短信</option>
            <option value="tencent">腾讯云短信</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>{t('systemConfig.sms.accessKeyId')}</FormLabel>
          <Input
            value={config.access_key_id}
            onChange={(e) => setConfig({ ...config, access_key_id: e.target.value })}
            placeholder="LTAI5t..."
          />
        </FormControl>

        <FormControl>
          <FormLabel>{t('systemConfig.sms.accessKeySecret')}</FormLabel>
          <SensitiveInput
            value={config.access_key_secret}
            onChange={(value) => setConfig({ ...config, access_key_secret: value })}
            placeholder="输入AccessKey Secret"
          />
        </FormControl>

        <FormControl>
          <FormLabel>{t('systemConfig.sms.signName')}</FormLabel>
          <Input
            value={config.sign_name || ''}
            onChange={(e) => setConfig({ ...config, sign_name: e.target.value })}
            placeholder="短信签名"
          />
        </FormControl>

        <FormControl>
          <FormLabel>{t('systemConfig.sms.templateCode')}</FormLabel>
          <Input
            value={config.template_code || ''}
            onChange={(e) => setConfig({ ...config, template_code: e.target.value })}
            placeholder="SMS_123456789"
          />
        </FormControl>

        <FormControl>
          <FormLabel>{t('systemConfig.sms.region')}</FormLabel>
          <Input
            value={config.region || ''}
            onChange={(e) => setConfig({ ...config, region: e.target.value })}
            placeholder="cn-hangzhou"
          />
        </FormControl>

        <FormControl display="flex" alignItems="center">
          <FormLabel mb={0}>{t('systemConfig.enabled')}</FormLabel>
          <Switch
            isChecked={config.is_enabled}
            onChange={(e) => setConfig({ ...config, is_enabled: e.target.checked })}
          />
        </FormControl>
      </VStack>
    </ConfigCard>
  )
}
