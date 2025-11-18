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
  Bell
} from 'lucide-react'

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'processing':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700'
      case 'low':
        return 'bg-blue-100 text-blue-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getIconColor = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-50 text-blue-600',
      green: 'bg-green-50 text-green-600',
      purple: 'bg-purple-50 text-purple-600',
      orange: 'bg-orange-50 text-orange-600',
      indigo: 'bg-indigo-50 text-indigo-600',
      pink: 'bg-pink-50 text-pink-600',
    }
    return colors[color] || 'bg-gray-50 text-gray-600'
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full py-2 px-1">
        {/* 页面标题 */}
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-1.5 tracking-tight">
            {t('dashboard.welcome')}
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            {t('dashboard.title')}
          </p>
        </div>

        {/* 统计数据网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-3">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 p-3 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-xl font-semibold text-gray-900 tracking-tight">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconColor(stat.color)}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-100 flex items-center">
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="h-3 w-3 text-green-600 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3 text-red-600 mr-1" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">
                    {t('dashboard.stats.vsLastMonth')}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* 主要内容区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-3">
          {/* 收入趋势 */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-3">
            <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>{t('dashboard.revenueTrend.title')}</span>
            </h2>
            <div className="space-y-2">
              {revenueTrend.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-12 text-xs text-gray-600">{item.day}</div>
                  <div className="flex-1 bg-gray-100 rounded-full h-4 relative overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all"
                      style={{ width: `${(item.value / maxRevenue) * 100}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-gray-700">
                        Rp {(item.value * 1).toFixed(1)}M
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 待办事项 */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>{t('dashboard.todos.title')}</span>
            </h2>
            <div className="space-y-2">
              {todos.map((todo) => (
                <div
                  key={todo.id}
                  className={`p-2 rounded-lg border ${
                    todo.completed
                      ? 'bg-gray-50 border-gray-200 opacity-60'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center space-x-2 flex-1">
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        readOnly
                        className="h-3.5 w-3.5 text-primary-600 rounded border-gray-300"
                      />
                      <span
                        className={`text-xs font-medium ${
                          todo.completed ? 'line-through text-gray-400' : 'text-gray-900'
                        }`}
                      >
                        {todo.title}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded ${getPriorityColor(todo.priority)}`}
                    >
                      {t(`dashboard.todos.priority.${todo.priority}`)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500 ml-5.5">
                    <Clock className="h-3 w-3" />
                    <span>{todo.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 最近活动和最近订单 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mb-3">
          {/* 最近活动 */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>{t('dashboard.activities.title')}</span>
            </h2>
            <div className="space-y-2">
              {recentActivities.map((activity) => {
                const Icon = activity.icon
                return (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="bg-blue-50 p-1.5 rounded-lg">
                      <Icon className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-gray-900 mb-0.5">
                        {activity.title}
                      </div>
                      <div className="text-xs text-gray-600 mb-1">
                        {activity.description}
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 最近订单 */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <ShoppingCart className="h-4 w-4" />
              <span>{t('dashboard.recentOrders.title')}</span>
            </h2>
            <div className="space-y-2">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <div className="text-xs font-medium text-gray-900 mb-0.5">
                        {order.id}
                      </div>
                      <div className="text-xs text-gray-600 mb-1">
                        {order.customer} - {order.service}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-gray-900">
                          {order.amount}
                        </span>
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded border ${getStatusColor(order.status)}`}
                        >
                          {t(`dashboard.recentOrders.status.${order.status}`)}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {order.date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 系统状态概览 */}
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center space-x-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span>{t('dashboard.systemStatus.title')}</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">{t('dashboard.systemStatus.allServices')}</div>
              <div className="text-lg font-semibold text-green-700">6/6</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">{t('dashboard.systemStatus.apiRequests')}</div>
              <div className="text-lg font-semibold text-blue-700">1,234</div>
            </div>
            <div className="text-center p-2 bg-purple-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">{t('dashboard.systemStatus.activeUsers')}</div>
              <div className="text-lg font-semibold text-purple-700">156</div>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded-lg">
              <div className="text-xs text-gray-600 mb-1">{t('dashboard.systemStatus.uptime')}</div>
              <div className="text-lg font-semibold text-orange-700">15天</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
