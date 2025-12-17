/**
 * 汇率编辑模态框组件
 */
import { useState, useEffect } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  Stack,
  Button,
  Text,
  useColorModeValue,
  Box,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { useToast } from '@/components/ToastContainer'
import {
  updateExchangeRate,
  createExchangeRate,
  ExchangeRateHistory,
  CreateExchangeRateRequest,
  UpdateExchangeRateRequest,
} from '@/api/exchangeRates'
import { formatCurrency } from '@/utils/priceUtils'

interface ExchangeRateEditModalProps {
  isOpen: boolean
  onClose: () => void
  rate: ExchangeRateHistory | null
  onSuccess: () => void
}

export const ExchangeRateEditModal = ({ isOpen, onClose, rate, onSuccess }: ExchangeRateEditModalProps) => {
  const { showSuccess, showError } = useToast()
  
  const [formData, setFormData] = useState({
    rate: 0,
    effective_from: new Date().toISOString(),
    effective_to: null as string | null,
    change_reason: '',
  })
  
  const [effectiveType, setEffectiveType] = useState<'immediate' | 'future'>('immediate')
  const [submitting, setSubmitting] = useState(false)
  
  useEffect(() => {
    if (rate) {
      setFormData({
        rate: Number(rate.rate),
        effective_from: rate.effective_from,
        effective_to: rate.effective_to || null,
        change_reason: '',
      })
      
      const effectiveFrom = new Date(rate.effective_from)
      const now = new Date()
      setEffectiveType(effectiveFrom > now ? 'future' : 'immediate')
    } else {
      setFormData({
        rate: 0,
        effective_from: new Date().toISOString(),
        effective_to: null,
        change_reason: '',
      })
      setEffectiveType('immediate')
    }
  }, [rate, isOpen])
  
  const handleSubmit = async () => {
    if (formData.rate <= 0) {
      showError('汇率必须大于0')
      return
    }
    
    setSubmitting(true)
    try {
      if (rate) {
        // 更新汇率
        const updateData: UpdateExchangeRateRequest = {
          rate: formData.rate,
          effective_from: effectiveType === 'immediate' 
            ? new Date().toISOString() 
            : formData.effective_from,
          effective_to: formData.effective_to,
          change_reason: formData.change_reason,
        }
        await updateExchangeRate(rate.id, updateData)
        showSuccess('汇率更新成功')
      } else {
        // 创建汇率（需要指定货币对）
        showError('请先选择货币对')
        return
      }
      
      onSuccess()
      onClose()
    } catch (error: any) {
      showError(error.message || '操作失败')
    } finally {
      setSubmitting(false)
    }
  }
  
  if (!rate) {
    return null
  }
  
  const rateChange = rate ? ((formData.rate - Number(rate.rate)) / Number(rate.rate)) * 100 : 0
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>修改汇率</ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* 货币对信息 */}
            <Box p={3} bg="gray.50" borderRadius="md">
              <Text fontSize="sm" fontWeight="medium" mb={2}>货币对</Text>
              <Text fontSize="lg">
                {rate.from_currency} → {rate.to_currency}
              </Text>
            </Box>
            
            {/* 当前汇率 */}
            <Box p={3} bg="blue.50" borderRadius="md">
              <Text fontSize="sm" fontWeight="medium" mb={1}>当前汇率</Text>
              <Text fontSize="xl" fontWeight="bold" color="blue.600">
                {formatCurrency(rate.rate, rate.from_currency, { showSymbol: false })}
              </Text>
            </Box>
            
            {/* 新汇率 */}
            <FormControl isRequired>
              <FormLabel>新汇率</FormLabel>
              <Input
                type="number"
                value={formData.rate}
                onChange={(e) => setFormData(prev => ({ ...prev, rate: Number(e.target.value) }))}
                placeholder="请输入汇率"
                min={0}
                step="0.01"
              />
              {formData.rate > 0 && (
                <Text fontSize="sm" color="gray.500" mt={1}>
                  预览: {formatCurrency(formData.rate, rate.from_currency, { showSymbol: false })}
                </Text>
              )}
            </FormControl>
            
            {/* 汇率变动提示 */}
            {formData.rate > 0 && rate && Math.abs(rateChange) > 0.01 && (
              <Alert status={rateChange > 0 ? 'info' : 'warning'}>
                <AlertIcon />
                <Text fontSize="sm">
                  汇率变动: {rateChange > 0 ? '+' : ''}
                  {rateChange.toFixed(2)}%
                </Text>
              </Alert>
            )}
            
            {/* 生效时间 */}
            <FormControl>
              <FormLabel>生效时间</FormLabel>
              <RadioGroup value={effectiveType} onChange={(val) => setEffectiveType(val as any)}>
                <Stack direction="row" spacing={4}>
                  <Radio value="immediate">立即生效</Radio>
                  <Radio value="future">指定时间生效</Radio>
                </Stack>
              </RadioGroup>
              
              {effectiveType === 'future' && (
                <Input
                  type="datetime-local"
                  value={formData.effective_from ? new Date(formData.effective_from).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    effective_from: new Date(e.target.value).toISOString() 
                  }))}
                  mt={2}
                />
              )}
            </FormControl>
            
            {/* 变更原因 */}
            <FormControl>
              <FormLabel>变更原因（可选）</FormLabel>
              <Input
                value={formData.change_reason}
                onChange={(e) => setFormData(prev => ({ ...prev, change_reason: e.target.value }))}
                placeholder="请输入变更原因"
              />
            </FormControl>
          </VStack>
        </ModalBody>
        
        <ModalFooter>
          <HStack spacing={2}>
            <Button variant="ghost" onClick={onClose}>
              取消
            </Button>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              isLoading={submitting}
            >
              确认修改
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
