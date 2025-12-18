/**
 * AI服务配置组件
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
  NumberInput,
  NumberInputField,
  useToast,
  Select,
} from '@chakra-ui/react'
import { ConfigCard } from './ConfigCard'
import { SensitiveInput } from './SensitiveInput'
import { TestButton } from './TestButton'
import { getSystemConfig, updateSystemConfig, AIConfig } from '@/api/systemConfig'

export const AIConfigComponent = () => {
  const { t } = useTranslation()
  const toast = useToast()
  const [saving, setSaving] = useState(false)
  const [config, setConfig] = useState<AIConfig>({
    provider: 'openai',
    api_key: '',
    api_base: '',
    model: '',
    temperature: 0.7,
    max_tokens: undefined,
    is_enabled: true,
  })

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const data = await getSystemConfig('ai')
      if (data && Object.keys(data).length > 0) {
        setConfig(data as AIConfig)
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
      await updateSystemConfig('ai', config)
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
      title={t('systemConfig.ai.title')}
      status={config.is_enabled ? 'enabled' : 'disabled'}
      actions={
        <HStack spacing={2}>
          <TestButton configType="ai" />
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
          <FormLabel>{t('systemConfig.ai.provider')}</FormLabel>
          <Select
            value={config.provider}
            onChange={(e) => setConfig({ ...config, provider: e.target.value })}
          >
            <option value="openai">OpenAI</option>
            <option value="azure">Azure OpenAI</option>
            <option value="alibaba">阿里云通义千问</option>
          </Select>
        </FormControl>

        <FormControl>
          <FormLabel>{t('systemConfig.ai.apiKey')}</FormLabel>
          <SensitiveInput
            value={config.api_key}
            onChange={(value) => setConfig({ ...config, api_key: value })}
            placeholder="输入API密钥"
          />
        </FormControl>

        <FormControl>
          <FormLabel>{t('systemConfig.ai.apiBase')}</FormLabel>
          <Input
            value={config.api_base || ''}
            onChange={(e) => setConfig({ ...config, api_base: e.target.value })}
            placeholder="https://api.openai.com/v1"
          />
        </FormControl>

        <FormControl>
          <FormLabel>{t('systemConfig.ai.model')}</FormLabel>
          <Input
            value={config.model || ''}
            onChange={(e) => setConfig({ ...config, model: e.target.value })}
            placeholder="gpt-4"
          />
        </FormControl>

        <FormControl>
          <FormLabel>{t('systemConfig.ai.temperature')}</FormLabel>
          <NumberInput
            value={config.temperature}
            onChange={(_, value) => setConfig({ ...config, temperature: value })}
            min={0}
            max={2}
            step={0.1}
          >
            <NumberInputField />
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormLabel>{t('systemConfig.ai.maxTokens')}</FormLabel>
          <NumberInput
            value={config.max_tokens}
            onChange={(_, value) => setConfig({ ...config, max_tokens: value })}
            min={1}
          >
            <NumberInputField placeholder="不限制" />
          </NumberInput>
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
