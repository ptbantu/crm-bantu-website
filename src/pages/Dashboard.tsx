import { useTranslation } from 'react-i18next'
import { Users, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react'

const Dashboard = () => {
  const { t } = useTranslation()

  const stats = [
    {
      icon: Users,
      label: t('dashboard.stats.customers'),
      value: '1,234',
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      icon: ShoppingCart,
      label: t('dashboard.stats.orders'),
      value: '567',
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      icon: DollarSign,
      label: t('dashboard.stats.revenue'),
      value: 'Rp 12.5M',
      change: '+15%',
      changeType: 'positive' as const,
    },
    {
      icon: TrendingUp,
      label: t('dashboard.stats.growth'),
      value: '23%',
      change: '+5%',
      changeType: 'positive' as const,
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto max-w-7xl py-12 px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-3 tracking-tight">
            {t('dashboard.welcome')}
          </h1>
          <p className="text-lg text-gray-500 font-medium">
            {t('dashboard.title')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-2">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-semibold text-gray-900 tracking-tight">
                      {stat.value}
                    </p>
                  </div>
                  <div className="bg-primary-50 w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary-600" />
                  </div>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <span
                    className={`text-sm font-medium ${
                      stat.changeType === 'positive'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-2">
                    vs last month
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Additional Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 tracking-tight">
              Recent Activity
            </h2>
            <p className="text-base text-gray-500">
              {/* TODO: 添加活动列表 */}
              No recent activity
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 tracking-tight">
              Quick Actions
            </h2>
            <div className="space-y-1">
              <button className="w-full text-left px-4 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium">
                Add New Customer
              </button>
              <button className="w-full text-left px-4 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium">
                Create Order
              </button>
              <button className="w-full text-left px-4 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors font-medium">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

