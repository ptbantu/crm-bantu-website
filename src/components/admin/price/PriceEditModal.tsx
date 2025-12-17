/**
 * 价格编辑模态框组件
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
  Select,
  Button,
  Text,
  Radio,
  RadioGroup,
  Stack,
  useColorModeValue,
  Divider,
  Box,
  Badge,
} from '@chakra-ui/react'
import { useToast } from '@/components/ToastContainer'
import {
  createPriceStrategy,
  updatePriceStrategy,
  PriceStrategy,
  CreatePriceStrategyRequest,
} from '@/api/prices'
import { formatPrice } from '@/utils/formatPrice'
import { getPriceTypeLabel } from '@/utils/priceUtils'

interface PriceEditModalProps {
  isOpen: boolean
  onClose: () => void
  price: PriceStrategy | null
  onSuccess: () => void
}

export const PriceEditModal = ({ isOpen, onClose, price, onSuccess }: PriceEditModalProps) => {
  const { showSuccess, showError } = useToast()
  
  const [formData, setFormData] = useState<CreatePriceStrategyRequest>({
    product_id: '',
    organization_id: null,
    price_type: 'channel',
    currency: 'CNY',
    amount: 0,
    exchange_rate: null,
    effective_from: new Date().toISOString(),
    effective_to: null,
    source: 'manual',
    change_reason: '',
  })
  
  const [effectiveType, setEffectiveType] = useState<'immediate' | 'future'>('immediate')
  const [submitting, setSubmitting] = useState(false)
  
  useEffect(() => {
    if (price) {
      // 编辑模式
      setFormData({
        product_id: price.product_id,
        organization_id: price.organization_id,
        price_type: price.price_type,
        currency: price.currency,
        amount: Number(price.amount),
        exchange_rate: price.exchange_rate ? Number(price.exchange_rate) : null,
        effective_from: price.effective_from,
        effective_to: price.effective_to || null,
        source: price.source || 'manual',
        change_reason: '',
      })
      
      // 判断是否为未来生效
      const effectiveFrom = new Date(price.effective_from)
      const now = new Date()
      setEffectiveType(effectiveFrom > now ? 'future' : 'immediate')
    } else {
      // 新增模式
      setFormData({
        product_id: '',
        organization_id: null,
        price_type: 'channel',
        currency: 'CNY',
        amount: 0,
        exchange_rate: null,
        effective_from: new Date().toISOString(),
        effective_to: null,
        source: 'manual',
        change_reason: '',
      })
      setEffectiveType('immediate')
    }
  }, [price, isOpen])
  
  const handleSubmit = async () => {
    if (!formData.product_id) {
      showError('请选择产品')
      return
    }
    
    if (formData.amount <= 0) {
      showError('价格必须大于0')
      return
    }
    
    setSubmitting(true)
    try {
      const requestData: CreatePriceStrategyRequest = {
        ...formData,
        effective_from: effectiveType === 'immediate' 
          ? new Date().toISOString() 
          : formData.effective_from,
      }
      
      if (price) {
        // 更新价格
        await updatePriceStrategy(price.id, {
          amount: requestData.amount,
          exchange_rate: requestData.exchange_rate,
          effective_from: requestData.effective_from,
          effective_to: requestData.effective_to,
          change_reason: requestData.change_reason,
        })
        showSuccess('价格更新成功')
      } else {
        // 创建价格
        await createPriceStrategy(requestData)
        showSuccess('价格创建成功')
      }
      
      onSuccess()
      onClose()
    } catch (error: any) {
      showError(error.message || '操作失败')
    } finally {
      setSubmitting(false)
    }
  }
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {price ? '编辑价格' : '新增价格'}
        </ModalHeader>
        <ModalCloseButton />
        
        <ModalBody>
          <VStack spacing={4} align="stretch">
            {/* 产品信息 */}
            {price && (
              <Box p={3} bg="gray.50" borderRadius="md">
                <Text fontSize="sm" fontWeight="medium" mb={2}>产品信息</Text>
                <Text fontSize="sm" color="gray.600">
                  产品: {price.product_name || price.product_id}
                </Text>
              </Box>
            )}
            
            {/* 产品ID（新增时） */}
            {!price && (
              <FormControl isRequired>
                <FormLabel>产品ID</FormLabel>
                <Input
                  value={formData.product_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, product_id: e.target.value }))}
                  placeholder="请输入产品ID"
                />
              </FormControl>
            )}
            
            {/* 价格类型 */}
            <FormControl isRequired>
              <FormLabel>价格类型</FormLabel>
              <Select
                value={formData.price_type}
                onChange={(e) => setFormData(prev => ({ ...prev, price_type: e.target.value as any }))}
              >
                <option value="cost">成本价</option>
                <option value="channel">渠道价</option>
                <option value="direct">直客价</option>
                <option value="list">列表价</option>
              </Select>
            </FormControl>
            
            {/* 货币 */}
            <FormControl isRequired>
              <FormLabel>货币</FormLabel>
              <Select
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
              >
                <option value="CNY">CNY (人民币)</option>
                <option value="IDR">IDR (印尼盾)</option>
                <option value="USD">USD (美元)</option>
                <option value="EUR">EUR (欧元)</option>
              </Select>
            </FormControl>
            
            {/* 价格金额 */}
            <FormControl isRequired>
              <FormLabel>价格金额</FormLabel>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))}
                placeholder="请输入价格"
                min={0}
                step="0.01"
              />
              {formData.amount > 0 && (
                <Text fontSize="sm" color="gray.500" mt={1}>
                  预览: {formatPrice(formData.amount, formData.currency)}
                </Text>
              )}
            </FormControl>
            
            {/* 生效时间 */}
            <FormControl>
              <FormLabel>生效时间</FormLabel>
              <RadioGroup value={effectiveType} onChange={(val) => setEffectiveType(val as any)}>
                <Stack direction="row" spacing={4}>
                  <Radio value="immediate">立即生效</Radio>
                  <Radio value="future">未来生效</Radio>
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
            
            {/* 失效时间（可选） */}
            <FormControl>
              <FormLabel>失效时间（可选）</FormLabel>
              <Input
                type="datetime-local"
                value={formData.effective_to ? new Date(formData.effective_to).toISOString().slice(0, 16) : ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  effective_to: e.target.value ? new Date(e.target.value).toISOString() : null 
                }))}
              />
            </FormControl>
            
            {/* 变更原因 */}
            <FormControl>
              <FormLabel>变更原因（可选）</FormLabel>
              <Input
                value={formData.change_reason || ''}
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
              {price ? '更新' : '创建'}
            </Button>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
