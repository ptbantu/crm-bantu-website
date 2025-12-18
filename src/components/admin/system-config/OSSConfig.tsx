/**
 * OSS配置组件
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
} from '@chakra-ui/react'
import { ConfigCard } from './ConfigCard'
import { SensitiveInput } from './SensitiveInput'
import { TestButton } from './TestButton'
import { getSystemConfig, updateSystemConfig, OSSConfig } from '@/api/systemConfig'

export const OSSConfigComponent = () => {
  const { t } = useTranslation()
  const toast = useToast()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<OSSConfig>({
    endpoint: '',
    access_key_id: '',
    access_key_secret: '',
    bucket_name: '',
    region: '',
    is_enabled: true,
  })

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    setLoading(true)
    try {
      const data = await getSystemConfig('oss')
      if (data && Object.keys(data).length > 0) {
        setConfig(data as OSSConfig)
      }
    } catch (error: any) {
      toast({
        title: t('systemConfig.loadError'),
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSystemConfig('oss', config)
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
      title={t('systemConfig.oss.title')}
      status={config.is_enabled ? 'enabled' : 'disabled'}
      actions={
        <HStack spacing={2}>
          <TestButton configType="oss" />
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
          <FormLabel>{t('systemConfig.oss.endpoint')}</FormLabel>
          <Input
            value={config.endpoint}
            onChange={(e) => setConfig({ ...config, endpoint: e.target.value })}
            placeholder="oss-cn-hangzhou.aliyuncs.com"
          />
        </FormControl>

        <FormControl>
          <FormLabel>{t('systemConfig.oss.accessKeyId')}</FormLabel>
          <Input
            value={config.access_key_id}
            onChange={(e) => setConfig({ ...config, access_key_id: e.target.value })}
            placeholder="LTAI5t..."
          />
        </FormControl>

        <FormControl>
          <FormLabel>{t('systemConfig.oss.accessKeySecret')}</FormLabel>
          <SensitiveInput
            value={config.access_key_secret}
            onChange={(value) => setConfig({ ...config, access_key_secret: value })}
            placeholder="输入AccessKey Secret"
          />
        </FormControl>

        <FormControl>
          <FormLabel>{t('systemConfig.oss.bucketName')}</FormLabel>
          <Input
            value={config.bucket_name}
            onChange={(e) => setConfig({ ...config, bucket_name: e.target.value })}
            placeholder="my-bucket"
          />
        </FormControl>

        <FormControl>
          <FormLabel>{t('systemConfig.oss.region')}</FormLabel>
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
