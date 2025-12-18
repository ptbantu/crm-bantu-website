/**
 * 测试连接按钮组件
 */
import { useState } from 'react'
import { Button, useToast } from '@chakra-ui/react'
import { Wifi } from 'lucide-react'
import { testConnection, ConfigType } from '@/api/systemConfig'
import { useTranslation } from 'react-i18next'

interface TestButtonProps {
  configType: ConfigType
  onTestComplete?: (success: boolean, message: string) => void
}

export const TestButton = ({ configType, onTestComplete }: TestButtonProps) => {
  const { t } = useTranslation()
  const toast = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleTest = async () => {
    setIsLoading(true)
    try {
      const result = await testConnection(configType)
      const success = result.success
      const message = result.message

      toast({
        title: success ? t('systemConfig.test.success') : t('systemConfig.test.failed'),
        description: message,
        status: success ? 'success' : 'error',
        duration: 3000,
        isClosable: true,
      })

      if (onTestComplete) {
        onTestComplete(success, message)
      }
    } catch (error: any) {
      const errorMessage = error.message || t('systemConfig.test.error')
      toast({
        title: t('systemConfig.test.failed'),
        description: errorMessage,
        status: 'error',
        duration: 3000,
        isClosable: true,
      })

      if (onTestComplete) {
        onTestComplete(false, errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      leftIcon={<Wifi size={16} />}
      onClick={handleTest}
      isLoading={isLoading}
      loadingText={t('systemConfig.test.testing')}
      colorScheme="blue"
      variant="outline"
      size="sm"
    >
      {t('systemConfig.test.test')}
    </Button>
  )
}
