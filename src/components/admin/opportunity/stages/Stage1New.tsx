/**
 * 阶段1：新建商机
 * 3步向导表单：1. 客户关联 2. 基础信息 3. 初步拆分标记预览
 */
import React, { useState, useEffect } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Input,
  FormControl,
  FormLabel,
  Select,
  Grid,
  GridItem,
  Badge,
  Card,
  CardBody,
  Divider,
  InputGroup,
  InputLeftElement,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { Search, UserPlus, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react'
import { OpportunityExtended } from '@/api/types'
import { getCustomerList, createCustomer, CreateCustomerRequest, Customer } from '@/api/customers'
import { updateOpportunity } from '@/api/opportunities'
import { useToast } from '@/components/ToastContainer'

interface Stage1NewProps {
  opportunityId: string
  opportunity: OpportunityExtended
  onDataUpdate: () => void
}

export const Stage1New: React.FC<Stage1NewProps> = ({ opportunityId, opportunity, onDataUpdate }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchingCustomers, setSearchingCustomers] = useState(false)
  const [customerSearchQuery, setCustomerSearchQuery] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    opportunity.customer_id ? { id: opportunity.customer_id, name: opportunity.customer_name || '' } as Customer : null
  )
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false)
  const { showSuccess, showError } = useToast()

  // 表单数据
  const [formData, setFormData] = useState({
    customer_id: opportunity.customer_id || '',
    name: opportunity.name || '',
    amount: opportunity.amount?.toString() || '',
    probability: opportunity.probability?.toString() || '50',
    service_type: opportunity.service_type || 'one_time',
    description: opportunity.description || '',
    // 新建客户表单
    newCustomerName: '',
    newCustomerCode: '',
    newCustomerType: 'organization' as 'individual' | 'organization',
  })

  // 搜索客户
  const handleSearchCustomers = async () => {
    if (!customerSearchQuery.trim()) {
      setCustomers([])
      return
    }
    setSearchingCustomers(true)
    try {
      const result = await getCustomerList({ name: customerSearchQuery, size: 10 })
      setCustomers(result.records)
    } catch (error: any) {
      showError(error.message || '搜索客户失败')
    } finally {
      setSearchingCustomers(false)
    }
  }

  // 创建新客户
  const handleCreateCustomer = async () => {
    if (!formData.newCustomerName.trim()) {
      showError('请输入客户名称')
      return
    }
    setLoading(true)
    try {
      const newCustomerData: CreateCustomerRequest = {
        name: formData.newCustomerName,
        code: formData.newCustomerCode || undefined,
        customer_type: formData.newCustomerType,
        source_id: '1', // 默认来源ID，实际应从配置获取
      }
      const newCustomer = await createCustomer(newCustomerData)
      setSelectedCustomer(newCustomer)
      setFormData({ ...formData, customer_id: newCustomer.id })
      setShowNewCustomerForm(false)
      setCustomerSearchQuery('')
      setCustomers([])
      showSuccess('客户创建成功')
    } catch (error: any) {
      showError(error.message || '创建客户失败')
    } finally {
      setLoading(false)
    }
  }

  // 保存商机信息
  const handleSave = async () => {
    if (!formData.customer_id) {
      showError('请先关联客户')
      return
    }
    if (!formData.name.trim()) {
      showError('请输入商机名称')
      return
    }
    setLoading(true)
    try {
      await updateOpportunity(opportunityId, {
        customer_id: formData.customer_id,
        name: formData.name,
        amount: formData.amount ? parseFloat(formData.amount) : undefined,
        probability: formData.probability ? parseInt(formData.probability) : undefined,
        service_type: formData.service_type as any,
        description: formData.description || undefined,
      })
      showSuccess('商机信息已保存')
      onDataUpdate()
    } catch (error: any) {
      showError(error.message || '保存失败')
    } finally {
      setLoading(false)
    }
  }

  // Step 1: 客户关联
  const renderStep1 = () => (
    <VStack spacing={4} align="stretch">
      <Text fontSize="14px" fontWeight="600" color="var(--ali-text-primary)" mb={2}>
        步骤 1/3：客户关联
      </Text>
      
      {/* 客户搜索 */}
      <FormControl>
        <FormLabel fontSize="12px" color="var(--ali-text-secondary)">
          搜索客户
        </FormLabel>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Search size={16} color="var(--ali-text-secondary)" />
          </InputLeftElement>
          <Input
            placeholder="输入客户名称或编码搜索"
            value={customerSearchQuery}
            onChange={(e) => setCustomerSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearchCustomers()}
            fontSize="12px"
            h="32px"
          />
        </InputGroup>
        <Button
          size="sm"
          mt={2}
          onClick={handleSearchCustomers}
          isLoading={searchingCustomers}
          fontSize="11px"
          h="28px"
        >
          搜索
        </Button>
      </FormControl>

      {/* 客户列表 */}
      {customers.length > 0 && (
        <VStack spacing={2} align="stretch" maxH="200px" overflowY="auto">
          {customers.map((customer) => (
            <Card
              key={customer.id}
              variant="outline"
              size="sm"
              cursor="pointer"
              onClick={() => {
                setSelectedCustomer(customer)
                setFormData({ ...formData, customer_id: customer.id })
                setCustomers([])
                setCustomerSearchQuery('')
              }}
              _hover={{ borderColor: 'var(--ali-primary)', bg: 'var(--ali-primary-light)' }}
              borderColor={selectedCustomer?.id === customer.id ? 'var(--ali-primary)' : 'var(--ali-border)'}
            >
              <CardBody p={2}>
                <HStack justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text fontSize="12px" fontWeight="500" color="var(--ali-text-primary)">
                      {customer.name}
                    </Text>
                    <Text fontSize="11px" color="var(--ali-text-secondary)">
                      {customer.code || customer.id}
                    </Text>
                  </VStack>
                  <Badge fontSize="10px" colorScheme={customer.customer_type === 'organization' ? 'blue' : 'gray'}>
                    {customer.customer_type === 'organization' ? '组织' : '个人'}
                  </Badge>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}

      {/* 已选客户显示 */}
      {selectedCustomer && (
        <Alert status="success" borderRadius="4px" fontSize="11px" py={2}>
          <AlertIcon boxSize="14px" />
          <VStack align="start" spacing={0}>
            <Text fontWeight="500">已选择客户：{selectedCustomer.name}</Text>
            <Text fontSize="10px" color="var(--ali-text-secondary)">
              {selectedCustomer.code || selectedCustomer.id}
            </Text>
          </VStack>
        </Alert>
      )}

      {/* 新建客户 */}
      <Divider />
      <Button
        leftIcon={<UserPlus size={14} />}
        variant="outline"
        size="sm"
        onClick={() => setShowNewCustomerForm(!showNewCustomerForm)}
        fontSize="11px"
        h="32px"
      >
        {showNewCustomerForm ? '取消新建' : '新建客户'}
      </Button>

      {showNewCustomerForm && (
        <Card variant="outline" size="sm" p={3}>
          <VStack spacing={3} align="stretch">
            <FormControl isRequired>
              <FormLabel fontSize="11px" color="var(--ali-text-secondary)">
                客户名称
              </FormLabel>
              <Input
                value={formData.newCustomerName}
                onChange={(e) => setFormData({ ...formData, newCustomerName: e.target.value })}
                placeholder="请输入客户名称"
                fontSize="12px"
                h="32px"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="11px" color="var(--ali-text-secondary)">
                客户编码（可选）
              </FormLabel>
              <Input
                value={formData.newCustomerCode}
                onChange={(e) => setFormData({ ...formData, newCustomerCode: e.target.value })}
                placeholder="留空则自动生成"
                fontSize="12px"
                h="32px"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="11px" color="var(--ali-text-secondary)">
                客户类型
              </FormLabel>
              <Select
                value={formData.newCustomerType}
                onChange={(e) => setFormData({ ...formData, newCustomerType: e.target.value as any })}
                fontSize="12px"
                h="32px"
              >
                <option value="organization">组织</option>
                <option value="individual">个人</option>
              </Select>
            </FormControl>
            <Button
              colorScheme="blue"
              size="sm"
              onClick={handleCreateCustomer}
              isLoading={loading}
              fontSize="11px"
              h="32px"
            >
              创建客户
            </Button>
          </VStack>
        </Card>
      )}
    </VStack>
  )

  // Step 2: 基础信息
  const renderStep2 = () => (
    <VStack spacing={4} align="stretch">
      <Text fontSize="14px" fontWeight="600" color="var(--ali-text-primary)" mb={2}>
        步骤 2/3：基础信息
      </Text>

      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
        <GridItem colSpan={2}>
          <FormControl isRequired>
            <FormLabel fontSize="12px" color="var(--ali-text-secondary)">
              商机名称
            </FormLabel>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入商机名称"
              fontSize="12px"
              h="32px"
            />
          </FormControl>
        </GridItem>

        <GridItem>
          <FormControl>
            <FormLabel fontSize="12px" color="var(--ali-text-secondary)">
              预计金额
            </FormLabel>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
              fontSize="12px"
              h="32px"
            />
          </FormControl>
        </GridItem>

        <GridItem>
          <FormControl>
            <FormLabel fontSize="12px" color="var(--ali-text-secondary)">
              成交概率 (%)
            </FormLabel>
            <Input
              type="number"
              min="0"
              max="100"
              value={formData.probability}
              onChange={(e) => setFormData({ ...formData, probability: e.target.value })}
              placeholder="50"
              fontSize="12px"
              h="32px"
            />
          </FormControl>
        </GridItem>

        <GridItem colSpan={2}>
          <FormControl>
            <FormLabel fontSize="12px" color="var(--ali-text-secondary)">
              服务类型
            </FormLabel>
            <Select
              value={formData.service_type}
              onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
              fontSize="12px"
              h="32px"
            >
              <option value="one_time">一次性</option>
              <option value="long_term">长周期</option>
              <option value="mixed">混合</option>
            </Select>
          </FormControl>
        </GridItem>

        <GridItem colSpan={2}>
          <FormControl>
            <FormLabel fontSize="12px" color="var(--ali-text-secondary)">
              描述
            </FormLabel>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="请输入商机描述（可选）"
              fontSize="12px"
              h="32px"
            />
          </FormControl>
        </GridItem>
      </Grid>
    </VStack>
  )

  // Step 3: 初步拆分标记预览
  const renderStep3 = () => (
    <VStack spacing={4} align="stretch">
      <Text fontSize="14px" fontWeight="600" color="var(--ali-text-primary)" mb={2}>
        步骤 3/3：信息预览
      </Text>

      <Card variant="outline" size="sm">
        <CardBody p={3}>
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between">
              <Text fontSize="11px" color="var(--ali-text-secondary)">
                客户：
              </Text>
              <Text fontSize="12px" fontWeight="500" color="var(--ali-text-primary)">
                {selectedCustomer?.name || '未选择'}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="11px" color="var(--ali-text-secondary)">
                商机名称：
              </Text>
              <Text fontSize="12px" fontWeight="500" color="var(--ali-text-primary)">
                {formData.name || '-'}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="11px" color="var(--ali-text-secondary)">
                预计金额：
              </Text>
              <Text fontSize="12px" fontWeight="500" color="var(--ali-text-primary)">
                {formData.amount ? `IDR ${parseFloat(formData.amount).toLocaleString()}` : '-'}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="11px" color="var(--ali-text-secondary)">
                成交概率：
              </Text>
              <Text fontSize="12px" fontWeight="500" color="var(--ali-text-primary)">
                {formData.probability}%
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text fontSize="11px" color="var(--ali-text-secondary)">
                服务类型：
              </Text>
              <Badge fontSize="11px" colorScheme="blue">
                {formData.service_type === 'one_time'
                  ? '一次性'
                  : formData.service_type === 'long_term'
                  ? '长周期'
                  : '混合'}
              </Badge>
            </HStack>
          </VStack>
        </CardBody>
      </Card>

      <Alert status="info" borderRadius="4px" fontSize="11px" py={2}>
        <AlertIcon boxSize="14px" />
        <Text>请确认以上信息无误后点击保存</Text>
      </Alert>
    </VStack>
  )

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        {/* 步骤指示器 */}
        <HStack spacing={2} justify="center" mb={4}>
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <HStack spacing={2}>
                <Box
                  w="24px"
                  h="24px"
                  borderRadius="full"
                  bg={currentStep >= step ? 'var(--ali-primary)' : 'var(--ali-border)'}
                  color={currentStep >= step ? 'white' : 'var(--ali-text-secondary)'}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="11px"
                  fontWeight="600"
                >
                  {currentStep > step ? <CheckCircle2 size={14} /> : step}
                </Box>
                {step < 3 && (
                  <Box
                    w="40px"
                    h="2px"
                    bg={currentStep > step ? 'var(--ali-primary)' : 'var(--ali-border)'}
                  />
                )}
              </HStack>
            </React.Fragment>
          ))}
        </HStack>

        {/* 步骤内容 */}
        <Card variant="elevated" size="sm" boxShadow="var(--ali-card-shadow)">
          <CardBody p={4}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
          </CardBody>
        </Card>

        {/* 操作按钮 */}
        <HStack spacing={2} justify="flex-end">
          {currentStep > 1 && (
            <Button
              leftIcon={<ArrowLeft size={14} />}
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep(currentStep - 1)}
              fontSize="11px"
              h="32px"
            >
              上一步
            </Button>
          )}
          {currentStep < 3 ? (
            <Button
              rightIcon={<ArrowRight size={14} />}
              colorScheme="blue"
              size="sm"
              onClick={() => {
                if (currentStep === 1 && !formData.customer_id) {
                  showError('请先选择或创建客户')
                  return
                }
                if (currentStep === 2 && !formData.name.trim()) {
                  showError('请输入商机名称')
                  return
                }
                setCurrentStep(currentStep + 1)
              }}
              fontSize="11px"
              h="32px"
            >
              下一步
            </Button>
          ) : (
            <Button
              colorScheme="blue"
              size="sm"
              onClick={handleSave}
              isLoading={loading}
              fontSize="11px"
              h="32px"
            >
              保存
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  )
}
