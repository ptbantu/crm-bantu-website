/**
 * 价格编辑模态框组件（列格式：一条记录包含所有价格类型和货币）
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
  Button,
  Text,
  Radio,
  RadioGroup,
  Stack,
  useColorModeValue,
  Divider,
  Box,
  Grid,
  GridItem,
} from '@chakra-ui/react'
import { useToast } from '@/components/ToastContainer'
import {
  createPriceStrategy,
  updatePriceStrategy,
  PriceStrategy,
  CreatePriceStrategyRequest,
} from '@/api/prices'
import { formatPrice } from '@/utils/formatPrice'

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
    price_channel_idr: null,
    price_channel_cny: null,
    price_direct_idr: null,
    price_direct_cny: null,
    price_list_idr: null,
    price_list_cny: null,
    exchange_rate: null,
    effective_from: null,
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
        price_channel_idr: price.price_channel_idr ?? null,
        price_channel_cny: price.price_channel_cny ?? null,
        price_direct_idr: price.price_direct_idr ?? null,
        price_direct_cny: price.price_direct_cny ?? null,
        price_list_idr: price.price_list_idr ?? null,
        price_list_cny: price.price_list_cny ?? null,
        exchange_rate: price.exchange_rate ?? null,
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
        price_channel_idr: null,
        price_channel_cny: null,
        price_direct_idr: null,
        price_direct_cny: null,
        price_list_idr: null,
        price_list_cny: null,
        exchange_rate: null,
        effective_from: null,
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
    
    // 检查至少有一个价格字段
    const hasAnyPrice = 
      formData.price_channel_idr !== null ||
      formData.price_channel_cny !== null ||
      formData.price_direct_idr !== null ||
      formData.price_direct_cny !== null
    
    if (!hasAnyPrice) {
      showError('请至少填写一个价格')
      return
    }
    
    setSubmitting(true)
    try {
      const requestData: CreatePriceStrategyRequest = {
        ...formData,
        effective_from: effectiveType === 'immediate' 
          ? new Date().toISOString() 
          : formData.effective_from || new Date().toISOString(),
      }
      
      if (price) {
        // 更新价格
        await updatePriceStrategy(price.id, {
          price_channel_idr: requestData.price_channel_idr,
          price_channel_cny: requestData.price_channel_cny,
          price_direct_idr: requestData.price_direct_idr,
          price_direct_cny: requestData.price_direct_cny,
          price_list_idr: requestData.price_list_idr,
          price_list_cny: requestData.price_list_cny,
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
    <Modal isOpen={isOpen} onClose={onClose} size="2xl" scrollBehavior="inside">
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
            
            <Divider />
            
            {/* 价格字段 */}
            <Text fontSize="md" fontWeight="semibold">价格设置（列格式：一条记录包含所有价格）</Text>
            
            {/* 渠道价 */}
            <Box p={3} border="1px" borderColor="gray.200" borderRadius="md">
              <Text fontSize="sm" fontWeight="medium" mb={2}>渠道价</Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <FormControl>
                    <FormLabel fontSize="sm">渠道价-IDR</FormLabel>
                    <Input
                      type="number"
                      value={formData.price_channel_idr ?? ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        price_channel_idr: e.target.value ? Number(e.target.value) : null 
                      }))}
                      placeholder="请输入价格"
                      min={0}
                      step="0.01"
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel fontSize="sm">渠道价-CNY</FormLabel>
                    <Input
                      type="number"
                      value={formData.price_channel_cny ?? ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        price_channel_cny: e.target.value ? Number(e.target.value) : null 
                      }))}
                      placeholder="请输入价格"
                      min={0}
                      step="0.01"
                    />
                  </FormControl>
                </GridItem>
              </Grid>
            </Box>
            
            {/* 直客价 */}
            <Box p={3} border="1px" borderColor="gray.200" borderRadius="md">
              <Text fontSize="sm" fontWeight="medium" mb={2}>直客价</Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <FormControl>
                    <FormLabel fontSize="sm">直客价-IDR</FormLabel>
                    <Input
                      type="number"
                      value={formData.price_direct_idr ?? ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        price_direct_idr: e.target.value ? Number(e.target.value) : null 
                      }))}
                      placeholder="请输入价格"
                      min={0}
                      step="0.01"
                    />
                  </FormControl>
                </GridItem>
                <GridItem>
                  <FormControl>
                    <FormLabel fontSize="sm">直客价-CNY</FormLabel>
                    <Input
                      type="number"
                      value={formData.price_direct_cny ?? ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        price_direct_cny: e.target.value ? Number(e.target.value) : null 
                      }))}
                      placeholder="请输入价格"
                      min={0}
                      step="0.01"
                    />
                  </FormControl>
                </GridItem>
              </Grid>
            </Box>
            
            {/* 汇率 */}
            <FormControl>
              <FormLabel>汇率（可选）</FormLabel>
              <Input
                type="number"
                value={formData.exchange_rate ?? ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  exchange_rate: e.target.value ? Number(e.target.value) : null 
                }))}
                placeholder="请输入汇率"
                min={0}
                step="0.000001"
              />
            </FormControl>
            
            <Divider />
            
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
