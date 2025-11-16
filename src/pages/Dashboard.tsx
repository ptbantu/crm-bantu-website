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
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('dashboard.welcome')}
          </h1>
          <p className="text-gray-600 mt-2">
            {t('dashboard.title')}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <div className="mt-4">
                  <span
                    className={`text-sm font-medium ${
                      stat.changeType === 'positive'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-600 ml-1">
                    vs last month
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Additional Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>
            <p className="text-gray-600">
              {/* TODO: 添加活动列表 */}
              No recent activity
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                Add New Customer
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
                Create Order
              </button>
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md">
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

