/**
 * 邮箱服务配置组件
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
  NumberInput,
  NumberInputField,
} from '@chakra-ui/react'
import { ConfigCard } from './ConfigCard'
import { SensitiveInput } from './SensitiveInput'
import { TestButton } from './TestButton'
import { getSystemConfig, updateSystemConfig, EmailConfig } from '@/api/systemConfig'

export const EmailConfigComponent = () => {
  const { t } = useTranslation()
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<EmailConfig>({
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    use_tls: true,
    from_email: '',
    from_name: '',
    is_enabled: true,
  })

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const data = await getSystemConfig('email')
      if (data && Object.keys(data).length > 0) {
        setConfig(data as EmailConfig)
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
      await updateSystemConfig('email', config)
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
      title={t('systemConfig.email.title')}
      status={config.is_enabled ? 'enabled' : 'disabled'}
      actions={
        <HStack spacing={2}>
          <TestButton configType="email" />
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
          <FormLabel>{t('systemConfig.email.smtpHost')}</FormLabel>
          <Input
            value={config.smtp_host}
            onChange={(e) => setConfig({ ...config, smtp_host: e.target.value })}
            placeholder="smtp.example.com"
          />
        </FormControl>

        <FormControl>
          <FormLabel>{t('systemConfig.email.smtpPort')}</FormLabel>
          <NumberInput
            value={config.smtp_port}
            onChange={(_, value) => setConfig({ ...config, smtp_port: value })}
            min={1}
            max={65535}
          >
            <NumberInputField />
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormLabel>{t('systemConfig.email.smtpUser')}</FormLabel>
          <Input
            value={config.smtp_user}
            onChange={(e) => setConfig({ ...config, smtp_user: e.target.value })}
            placeholder="user@example.com"
          />
        </FormControl>

        <FormControl>
          <FormLabel>{t('systemConfig.email.smtpPassword')}</FormLabel>
          <SensitiveInput
            value={config.smtp_password}
            onChange={(value) => setConfig({ ...config, smtp_password: value })}
            placeholder="输入SMTP密码"
          />
        </FormControl>

        <FormControl display="flex" alignItems="center">
          <FormLabel mb={0}>{t('systemConfig.email.useTls')}</FormLabel>
          <Switch
            isChecked={config.use_tls}
            onChange={(e) => setConfig({ ...config, use_tls: e.target.checked })}
          />
        </FormControl>

        <FormControl>
          <FormLabel>{t('systemConfig.email.fromEmail')}</FormLabel>
          <Input
            value={config.from_email}
            onChange={(e) => setConfig({ ...config, from_email: e.target.value })}
            placeholder="noreply@example.com"
            type="email"
          />
        </FormControl>

        <FormControl>
          <FormLabel>{t('systemConfig.email.fromName')}</FormLabel>
          <Input
            value={config.from_name || ''}
            onChange={(e) => setConfig({ ...config, from_name: e.target.value })}
            placeholder="系统通知"
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
