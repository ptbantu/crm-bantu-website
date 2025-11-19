/**
 * 仪表盘页面
 * 显示系统概览、统计数据、趋势图表等
 */
import { useTranslation } from 'react-i18next'
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp,
  Package,
  Building2,
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  FileText,
  Bell,
  LayoutDashboard
} from 'lucide-react'
import { PageHeader } from '@/components/admin/PageHeader'
import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  HStack,
  VStack,
  Box,
  Flex,
  Text,
  Badge,
  Progress,
  Checkbox,
  Divider,
  useColorModeValue,
} from '@chakra-ui/react'

interface StatCard {
  icon: typeof Users
  label: string
  value: string
  change: string
  changeType: 'positive' | 'negative'
  color: string
}

interface ActivityItem {
  id: string
  type: 'order' | 'customer' | 'payment' | 'system'
  title: string
  description: string
  time: string
  icon: typeof ShoppingCart
}

interface TodoItem {
  id: string
  title: string
  priority: 'high' | 'medium' | 'low'
  dueDate: string
  completed: boolean
}

interface OrderItem {
  id: string
  customer: string
  service: string
  amount: string
  status: 'pending' | 'processing' | 'completed'
  date: string
}

const Dashboard = () => {
  const { t } = useTranslation()
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.700')

  // 统计数据
  const stats: StatCard[] = [
    {
      icon: Users,
      label: t('dashboard.stats.customers'),
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      color: 'blue',
    },
    {
      icon: ShoppingCart,
      label: t('dashboard.stats.orders'),
      value: '567',
      change: '+8%',
      changeType: 'positive',
      color: 'green',
    },
    {
      icon: DollarSign,
      label: t('dashboard.stats.revenue'),
      value: 'Rp 12.5M',
      change: '+15%',
      changeType: 'positive',
      color: 'purple',
    },
    {
      icon: TrendingUp,
      label: t('dashboard.stats.growth'),
      value: '23%',
      change: '+5%',
      changeType: 'positive',
      color: 'orange',
    },
    {
      icon: Package,
      label: t('dashboard.stats.services'),
      value: '89',
      change: '+3',
      changeType: 'positive',
      color: 'indigo',
    },
    {
      icon: Building2,
      label: t('dashboard.stats.vendors'),
      value: '24',
      change: '+2',
      changeType: 'positive',
      color: 'pink',
    },
  ]

  // 最近活动
  const recentActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'order',
      title: t('dashboard.activities.newOrder'),
      description: '订单 #ORD-2024-001 已创建',
      time: '5分钟前',
      icon: ShoppingCart,
    },
    {
      id: '2',
      type: 'customer',
      title: t('dashboard.activities.newCustomer'),
      description: '新客户 "PT. ABC Indonesia" 已注册',
      time: '15分钟前',
      icon: Users,
    },
    {
      id: '3',
      type: 'payment',
      title: t('dashboard.activities.paymentReceived'),
      description: '收到付款 Rp 5,000,000',
      time: '1小时前',
      icon: DollarSign,
    },
    {
      id: '4',
      type: 'system',
      title: t('dashboard.activities.systemUpdate'),
      description: '系统更新完成',
      time: '2小时前',
      icon: Activity,
    },
    {
      id: '5',
      type: 'order',
      title: t('dashboard.activities.orderCompleted'),
      description: '订单 #ORD-2024-002 已完成',
      time: '3小时前',
      icon: CheckCircle2,
    },
  ]

  // 待办事项
  const todos: TodoItem[] = [
    {
      id: '1',
      title: t('dashboard.todos.reviewOrders'),
      priority: 'high',
      dueDate: '今天',
      completed: false,
    },
    {
      id: '2',
      title: t('dashboard.todos.updatePrices'),
      priority: 'medium',
      dueDate: '明天',
      completed: false,
    },
    {
      id: '3',
      title: t('dashboard.todos.contactVendor'),
      priority: 'low',
      dueDate: '本周',
      completed: true,
    },
    {
      id: '4',
      title: t('dashboard.todos.generateReport'),
      priority: 'medium',
      dueDate: '本周',
      completed: false,
    },
  ]

  // 最近订单
  const recentOrders: OrderItem[] = [
    {
      id: 'ORD-2024-001',
      customer: 'PT. ABC Indonesia',
      service: '签证服务',
      amount: 'Rp 2,500,000',
      status: 'pending',
      date: '2024-01-15',
    },
    {
      id: 'ORD-2024-002',
      customer: 'XYZ Company',
      service: '公司注册',
      amount: 'Rp 5,000,000',
      status: 'processing',
      date: '2024-01-14',
    },
    {
      id: 'ORD-2024-003',
      customer: 'DEF Corp',
      service: '税务申报',
      amount: 'Rp 1,200,000',
      status: 'completed',
      date: '2024-01-13',
    },
    {
      id: 'ORD-2024-004',
      customer: 'GHI Ltd',
      service: '商标注册',
      amount: 'Rp 3,800,000',
      status: 'processing',
      date: '2024-01-12',
    },
  ]

  // 收入趋势数据（最近7天）
  const revenueTrend = [
    { day: '周一', value: 1.2 },
    { day: '周二', value: 1.8 },
    { day: '周三', value: 1.5 },
    { day: '周四', value: 2.1 },
    { day: '周五', value: 2.5 },
    { day: '周六', value: 1.9 },
    { day: '周日', value: 2.2 },
  ]

  const maxRevenue = Math.max(...revenueTrend.map(r => r.value))

  const getStatusColorScheme = (status: string): string => {
    switch (status) {
      case 'completed':
        return 'green'
      case 'processing':
        return 'blue'
      case 'pending':
        return 'yellow'
      default:
        return 'gray'
    }
  }

  const getPriorityColorScheme = (priority: string): string => {
    switch (priority) {
      case 'high':
        return 'red'
      case 'medium':
        return 'yellow'
      case 'low':
        return 'blue'
      default:
        return 'gray'
    }
  }

  const getColorScheme = (color: string): string => {
    const colorMap: Record<string, string> = {
      blue: 'blue',
      green: 'green',
      purple: 'purple',
      orange: 'orange',
      indigo: 'indigo',
      pink: 'pink',
    }
    return colorMap[color] || 'gray'
  }

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Box w="full" py={2} px={1}>
        {/* 页面头部 */}
        <PageHeader
          icon={LayoutDashboard}
          title={t('dashboard.welcome')}
          subtitle={t('dashboard.title')}
        />

        {/* 统计数据网格 */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 6 }} spacing={3} mb={3}>
          {stats.map((stat, index) => {
            const Icon = stat.icon
            const colorScheme = getColorScheme(stat.color)
            return (
              <Card
                key={index}
                bg={`${colorScheme}.50`}
                borderColor={`${colorScheme}.200`}
                borderWidth={1}
                _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }}
                transition="all 0.2s"
              >
                <CardBody>
                  <Stat>
                    <Flex align="start" justify="space-between" mb={2}>
                      <Box flex={1}>
                        <StatLabel fontSize="xs" fontWeight="medium" color="gray.500" mb={1}>
                          {stat.label}
                        </StatLabel>
                        <StatNumber fontSize="xl" fontWeight="semibold" color="gray.900">
                          {stat.value}
                        </StatNumber>
                      </Box>
                      <Box
                        as={Icon}
                        size={5}
                        color={`${colorScheme}.600`}
                        bg={`${colorScheme}.100`}
                        p={2}
                        borderRadius="lg"
                        flexShrink={0}
                      />
                    </Flex>
                    <Divider my={2} />
                    <HStack spacing={1}>
                      {stat.changeType === 'positive' ? (
                        <StatArrow type="increase" color="green.500" />
                      ) : (
                        <StatArrow type="decrease" color="red.500" />
                      )}
                      <Text
                        fontSize="xs"
                        fontWeight="medium"
                        color={stat.changeType === 'positive' ? 'green.600' : 'red.600'}
                      >
                        {stat.change}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {t('dashboard.stats.vsLastMonth')}
                      </Text>
                    </HStack>
                  </Stat>
                </CardBody>
              </Card>
            )
          })}
        </SimpleGrid>

        {/* 主要内容区域 */}
        <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={3} mb={3}>
          {/* 收入趋势 */}
          <Card gridColumn={{ lg: 'span 2' }} bg={bgColor} borderColor={borderColor}>
            <CardHeader pb={3}>
              <HStack spacing={2}>
                <Box as={TrendingUp} size={4} />
                <Heading size="sm">{t('dashboard.revenueTrend.title')}</Heading>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={2} align="stretch">
                {revenueTrend.map((item, index) => (
                  <Box key={index}>
                    <HStack spacing={2} mb={1}>
                      <Text fontSize="xs" color="gray.600" w={12}>
                        {item.day}
                      </Text>
                      <Text fontSize="xs" fontWeight="medium" color="gray.700">
                        Rp {(item.value * 1).toFixed(1)}M
                      </Text>
                    </HStack>
                    <Progress
                      value={(item.value / maxRevenue) * 100}
                      colorScheme="blue"
                      size="sm"
                      borderRadius="full"
                      bg="gray.100"
                    />
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>

          {/* 待办事项 */}
          <Card bg={bgColor} borderColor={borderColor}>
            <CardHeader pb={3}>
              <HStack spacing={2}>
                <Box as={Bell} size={4} />
                <Heading size="sm">{t('dashboard.todos.title')}</Heading>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={2} align="stretch">
                {todos.map((todo) => (
                  <Box
                    key={todo.id}
                    p={2}
                    borderRadius="lg"
                    borderWidth={1}
                    borderColor={borderColor}
                    bg={todo.completed ? 'gray.50' : bgColor}
                    opacity={todo.completed ? 0.6 : 1}
                  >
                    <Flex align="start" justify="space-between" mb={1}>
                      <HStack spacing={2} flex={1}>
                        <Checkbox
                          isChecked={todo.completed}
                          isReadOnly
                          size="sm"
                          colorScheme="blue"
                        />
                        <Text
                          fontSize="xs"
                          fontWeight="medium"
                          color={todo.completed ? 'gray.400' : 'gray.900'}
                          textDecoration={todo.completed ? 'line-through' : 'none'}
                        >
                          {todo.title}
                        </Text>
                      </HStack>
                      <Badge
                        colorScheme={getPriorityColorScheme(todo.priority)}
                        fontSize="xs"
                      >
                        {t(`dashboard.todos.priority.${todo.priority}`)}
                      </Badge>
                    </Flex>
                    <HStack spacing={1} ml={7} mt={1}>
                      <Box as={Clock} size={3} color="gray.500" />
                      <Text fontSize="xs" color="gray.500">
                        {todo.dueDate}
                      </Text>
                    </HStack>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* 最近活动和最近订单 */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={3} mb={3}>
          {/* 最近活动 */}
          <Card bg={bgColor} borderColor={borderColor}>
            <CardHeader pb={3}>
              <HStack spacing={2}>
                <Box as={Activity} size={4} />
                <Heading size="sm">{t('dashboard.activities.title')}</Heading>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={2} align="stretch">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon
                  return (
                    <HStack
                      key={activity.id}
                      spacing={2}
                      p={2}
                      borderRadius="lg"
                      _hover={{ bg: hoverBg }}
                      transition="background-color 0.2s"
                      align="start"
                    >
                      <Box
                        as={Icon}
                        size={4}
                        color="blue.600"
                        bg="blue.50"
                        p={1.5}
                        borderRadius="lg"
                      />
                      <Box flex={1} minW={0}>
                        <Text fontSize="xs" fontWeight="medium" color="gray.900" mb={0.5}>
                          {activity.title}
                        </Text>
                        <Text fontSize="xs" color="gray.600" mb={1}>
                          {activity.description}
                        </Text>
                        <HStack spacing={1}>
                          <Box as={Clock} size={3} color="gray.500" />
                          <Text fontSize="xs" color="gray.500">
                            {activity.time}
                          </Text>
                        </HStack>
                      </Box>
                    </HStack>
                  )
                })}
              </VStack>
            </CardBody>
          </Card>

          {/* 最近订单 */}
          <Card bg={bgColor} borderColor={borderColor}>
            <CardHeader pb={3}>
              <HStack spacing={2}>
                <Box as={ShoppingCart} size={4} />
                <Heading size="sm">{t('dashboard.recentOrders.title')}</Heading>
              </HStack>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={2} align="stretch">
                {recentOrders.map((order) => (
                  <Box
                    key={order.id}
                    p={2}
                    borderRadius="lg"
                    borderWidth={1}
                    borderColor={borderColor}
                    _hover={{ bg: hoverBg }}
                    transition="background-color 0.2s"
                  >
                    <Flex align="start" justify="space-between" mb={1}>
                      <Box flex={1}>
                        <Text fontSize="xs" fontWeight="medium" color="gray.900" mb={0.5}>
                          {order.id}
                        </Text>
                        <Text fontSize="xs" color="gray.600" mb={1}>
                          {order.customer} - {order.service}
                        </Text>
                        <HStack spacing={2}>
                          <Text fontSize="xs" fontWeight="semibold" color="gray.900">
                            {order.amount}
                          </Text>
                          <Badge
                            colorScheme={getStatusColorScheme(order.status)}
                            fontSize="xs"
                          >
                            {t(`dashboard.recentOrders.status.${order.status}`)}
                          </Badge>
                        </HStack>
                      </Box>
                      <Text fontSize="xs" color="gray.500">
                        {order.date}
                      </Text>
                    </Flex>
                  </Box>
                ))}
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* 系统状态概览 */}
        <Card bg={bgColor} borderColor={borderColor}>
          <CardHeader pb={3}>
            <HStack spacing={2}>
              <Box as={CheckCircle2} size={4} color="green.600" />
              <Heading size="sm">{t('dashboard.systemStatus.title')}</Heading>
            </HStack>
          </CardHeader>
          <CardBody pt={0}>
            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={3}>
              <Box textAlign="center" p={2} bg="green.50" borderRadius="lg">
                <Text fontSize="xs" color="gray.600" mb={1}>
                  {t('dashboard.systemStatus.allServices')}
                </Text>
                <Text fontSize="lg" fontWeight="semibold" color="green.700">
                  6/6
                </Text>
              </Box>
              <Box textAlign="center" p={2} bg="blue.50" borderRadius="lg">
                <Text fontSize="xs" color="gray.600" mb={1}>
                  {t('dashboard.systemStatus.apiRequests')}
                </Text>
                <Text fontSize="lg" fontWeight="semibold" color="blue.700">
                  1,234
                </Text>
              </Box>
              <Box textAlign="center" p={2} bg="purple.50" borderRadius="lg">
                <Text fontSize="xs" color="gray.600" mb={1}>
                  {t('dashboard.systemStatus.activeUsers')}
                </Text>
                <Text fontSize="lg" fontWeight="semibold" color="purple.700">
                  156
                </Text>
              </Box>
              <Box textAlign="center" p={2} bg="orange.50" borderRadius="lg">
                <Text fontSize="xs" color="gray.600" mb={1}>
                  {t('dashboard.systemStatus.uptime')}
                </Text>
                <Text fontSize="lg" fontWeight="semibold" color="orange.700">
                  15天
                </Text>
              </Box>
            </SimpleGrid>
          </CardBody>
        </Card>
      </Box>
    </Box>
  )
}

export default Dashboard
