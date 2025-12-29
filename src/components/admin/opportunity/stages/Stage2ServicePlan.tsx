/**
 * 阶段2：服务方案
 * 左方案树 + 右配置区布局
 */
import React, { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  Input,
  FormControl,
  FormLabel,
  Select,
  Grid,
  GridItem,
  Badge,
  Divider,
  Checkbox,
} from '@chakra-ui/react'
import { Search, Package, CheckCircle2 } from 'lucide-react'
import { Opportunity, OpportunityExtended } from '@/api/types'
import { StatusBadge } from '../common/StatusBadge'
import { DataTable, Column } from '../common/DataTable'

interface Stage2ServicePlanProps {
  opportunityId: string
  opportunity: OpportunityExtended
  onDataUpdate: () => void
}

interface ServicePlan {
  id: string
  name: string
  description: string
  category: string
}

interface ProductService {
  id: string
  name: string
  category: string
  price: number
  selected: boolean
}

export const Stage2ServicePlan: React.FC<Stage2ServicePlanProps> = ({
  opportunityId,
  opportunity,
  onDataUpdate,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<ServicePlan | null>(null)
  const [servicePeriod, setServicePeriod] = useState('monthly')
  const [searchQuery, setSearchQuery] = useState('')

  // 模拟方案库数据
  const servicePlans: ServicePlan[] = [
    { id: '1', name: '基础服务方案', description: '适合小型企业', category: '基础' },
    { id: '2', name: '标准服务方案', description: '适合中型企业', category: '标准' },
    { id: '3', name: '高级服务方案', description: '适合大型企业', category: '高级' },
  ]

  // 模拟产品服务矩阵
  const productServices: ProductService[] = [
    { id: '1', name: '公司注册', category: '注册服务', price: 5000000, selected: false },
    { id: '2', name: '税务申报', category: '税务服务', price: 2000000, selected: false },
    { id: '3', name: '会计服务', category: '财务服务', price: 3000000, selected: false },
    { id: '4', name: '法律咨询', category: '法律服务', price: 4000000, selected: false },
  ]

  const [products, setProducts] = useState<ProductService[]>(productServices)

  const toggleProduct = (id: string) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p))
    )
  }

  const columns: Column<ProductService>[] = [
    {
      key: 'name',
      label: '产品/服务名称',
      render: (value, row) => (
        <HStack spacing={2}>
          <Checkbox
            isChecked={row.selected}
            onChange={() => toggleProduct(row.id)}
            size="sm"
          />
          <Text fontSize="12px">{value}</Text>
        </HStack>
      ),
    },
    {
      key: 'category',
      label: '类别',
      render: (value) => <Badge fontSize="10px">{value}</Badge>,
    },
    {
      key: 'price',
      label: '价格',
      render: (value) => (
        <Text fontSize="12px">IDR {value.toLocaleString()}</Text>
      ),
    },
  ]

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <Text fontSize="14px" fontWeight="600" color="var(--ali-text-primary)">
          阶段2：服务方案
        </Text>

        <Grid templateColumns="260px 1fr" gap={4}>
          {/* 左侧方案库面板 */}
          <GridItem>
            <Card variant="elevated" size="sm" boxShadow="var(--ali-card-shadow)" h="100%">
              <CardBody p={3}>
                <VStack spacing={3} align="stretch">
                  <Text fontSize="12px" fontWeight="600" color="var(--ali-text-primary)">
                    方案库
                  </Text>

                  {/* 搜索 */}
                  <Input
                    placeholder="搜索方案..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    size="sm"
                    fontSize="11px"
                    h="28px"
                  />

                  {/* 方案列表 */}
                  <VStack spacing={2} align="stretch" maxH="500px" overflowY="auto">
                    {servicePlans.map((plan) => (
                      <Card
                        key={plan.id}
                        variant="outline"
                        size="sm"
                        cursor="pointer"
                        onClick={() => setSelectedPlan(plan)}
                        borderColor={
                          selectedPlan?.id === plan.id
                            ? 'var(--ali-primary)'
                            : 'var(--ali-border)'
                        }
                        bg={
                          selectedPlan?.id === plan.id
                            ? 'var(--ali-primary-light)'
                            : 'white'
                        }
                        _hover={{ borderColor: 'var(--ali-primary)' }}
                      >
                        <CardBody p={2}>
                          <VStack align="start" spacing={1}>
                            <HStack justify="space-between" w="100%">
                              <Text fontSize="11px" fontWeight="500" color="var(--ali-text-primary)">
                                {plan.name}
                              </Text>
                              {selectedPlan?.id === plan.id && (
                                <CheckCircle2 size={14} color="var(--ali-primary)" />
                              )}
                            </HStack>
                            <Text fontSize="10px" color="var(--ali-text-secondary)">
                              {plan.description}
                            </Text>
                            <StatusBadge status="info" fontSize="10px">
                              {plan.category}
                            </StatusBadge>
                          </VStack>
                        </CardBody>
                      </Card>
                    ))}
                  </VStack>
                </VStack>
              </CardBody>
            </Card>
          </GridItem>

          {/* 右侧配置区 */}
          <GridItem>
            <VStack spacing={4} align="stretch">
              {/* 服务周期选择卡片 */}
              <Card variant="elevated" size="sm" boxShadow="var(--ali-card-shadow)">
                <CardBody p={3}>
                  <Text fontSize="12px" fontWeight="600" color="var(--ali-text-primary)" mb={3}>
                    服务周期
                  </Text>
                  <Grid templateColumns="repeat(3, 1fr)" gap={2}>
                    {['monthly', 'quarterly', 'yearly'].map((period) => (
                      <Button
                        key={period}
                        size="sm"
                        variant={servicePeriod === period ? 'solid' : 'outline'}
                        colorScheme={servicePeriod === period ? 'blue' : 'gray'}
                        onClick={() => setServicePeriod(period)}
                        fontSize="11px"
                        h="32px"
                      >
                        {period === 'monthly'
                          ? '月度'
                          : period === 'quarterly'
                          ? '季度'
                          : '年度'}
                      </Button>
                    ))}
                  </Grid>
                </CardBody>
              </Card>

              {/* 产品服务矩阵表 */}
              <Card variant="elevated" size="sm" boxShadow="var(--ali-card-shadow)">
                <CardBody p={3}>
                  <Text fontSize="12px" fontWeight="600" color="var(--ali-text-primary)" mb={3}>
                    产品服务矩阵
                  </Text>
                  <DataTable columns={columns} data={products} />
                </CardBody>
              </Card>

              {/* 资料依赖检查面板 */}
              <Card variant="elevated" size="sm" boxShadow="var(--ali-card-shadow)">
                <CardBody p={3}>
                  <Text fontSize="12px" fontWeight="600" color="var(--ali-text-primary)" mb={3}>
                    资料依赖检查
                  </Text>
                  <VStack spacing={2} align="stretch">
                    {[
                      { name: '营业执照', status: 'pending' },
                      { name: '税务登记证', status: 'completed' },
                      { name: '法人身份证', status: 'pending' },
                    ].map((item) => (
                      <HStack
                        key={item.name}
                        justify="space-between"
                        p={2}
                        bg="var(--ali-bg-light)"
                        borderRadius="4px"
                      >
                        <Text fontSize="11px" color="var(--ali-text-primary)">
                          {item.name}
                        </Text>
                        <StatusBadge
                          status={item.status === 'completed' ? 'success' : 'warning'}
                        >
                          {item.status === 'completed' ? '已提供' : '待提供'}
                        </StatusBadge>
                      </HStack>
                    ))}
                  </VStack>
                </CardBody>
              </Card>

              {/* 操作按钮 */}
              <HStack spacing={2} justify="flex-end">
                <Button variant="outline" size="sm" fontSize="11px" h="32px">
                  保存草稿
                </Button>
                <Button colorScheme="blue" size="sm" fontSize="11px" h="32px">
                  提交方案
                </Button>
              </HStack>
            </VStack>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  )
}
