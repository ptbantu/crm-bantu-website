/**
 * 系统状态页面
 * 显示系统运行状态、性能指标等信息
 */
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Database, 
  Server, 
  FileText, 
  Cpu,
  HardDrive,
  MemoryStick,
  Clock,
  Network,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react'

interface ServiceStatus {
  name: string
  status: 'normal' | 'warning' | 'error'
  message: string
  icon: typeof CheckCircle2
}

interface SystemInfo {
  uptime: string
  cpuUsage: number
  memoryUsage: number
  diskUsage: number
  dbConnections: number
  apiRequests: number
  activeUsers: number
  version: string
}

const SystemStatus = () => {
  const { t } = useTranslation()
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    uptime: '15天 8小时 32分钟',
    cpuUsage: 45.2,
    memoryUsage: 62.8,
    diskUsage: 38.5,
    dbConnections: 24,
    apiRequests: 1234,
    activeUsers: 156,
    version: 'v2.1.0',
  })

  // Mock数据 - 服务状态
  const services: ServiceStatus[] = [
    {
      name: t('systemStatus.services.backend'),
      status: 'normal',
      message: t('systemStatus.status.normal'),
      icon: Server,
    },
    {
      name: 'MySQL',
      status: 'normal',
      message: t('systemStatus.status.normal'),
      icon: Database,
    },
    {
      name: 'MongoDB',
      status: 'normal',
      message: t('systemStatus.status.normal'),
      icon: Database,
    },
    {
      name: 'Redis',
      status: 'normal',
      message: t('systemStatus.status.normal'),
      icon: Database,
    },
    {
      name: t('systemStatus.services.log'),
      status: 'normal',
      message: t('systemStatus.status.normal'),
      icon: FileText,
    },
    {
      name: t('systemStatus.services.backendService'),
      status: 'normal',
      message: t('systemStatus.status.normal'),
      icon: Cpu,
    },
  ]

  // 模拟实时更新（每30秒更新一次）
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemInfo(prev => ({
        ...prev,
        cpuUsage: Math.max(20, Math.min(80, prev.cpuUsage + (Math.random() - 0.5) * 5)),
        memoryUsage: Math.max(30, Math.min(90, prev.memoryUsage + (Math.random() - 0.5) * 3)),
        apiRequests: prev.apiRequests + Math.floor(Math.random() * 10),
      }))
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle2 className="h-4 w-4" />
      case 'warning':
      case 'error':
        return <XCircle className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getUsageColor = (usage: number) => {
    if (usage < 50) return 'bg-green-500'
    if (usage < 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString('zh-CN')
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full py-2 px-1">
        {/* 页面标题 */}
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-1.5 tracking-tight">
            {t('systemStatus.title')}
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            {t('systemStatus.subtitle')}
          </p>
        </div>

        {/* 系统运行时间与版本信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-900">
                {t('systemStatus.systemInfo.uptime')}
              </h3>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {systemInfo.uptime}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-semibold text-gray-900">
                {t('systemStatus.systemInfo.version')}
              </h3>
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {systemInfo.version}
            </div>
          </div>
        </div>

        {/* 性能指标 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
          {/* CPU使用率 */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Cpu className="h-4 w-4 text-blue-600" />
                <span className="text-xs font-medium text-gray-700">
                  {t('systemStatus.performance.cpu')}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {systemInfo.cpuUsage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getUsageColor(systemInfo.cpuUsage)}`}
                style={{ width: `${systemInfo.cpuUsage}%` }}
              />
            </div>
          </div>

          {/* 内存使用率 */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <MemoryStick className="h-4 w-4 text-green-600" />
                <span className="text-xs font-medium text-gray-700">
                  {t('systemStatus.performance.memory')}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {systemInfo.memoryUsage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getUsageColor(systemInfo.memoryUsage)}`}
                style={{ width: `${systemInfo.memoryUsage}%` }}
              />
            </div>
          </div>

          {/* 磁盘使用率 */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <HardDrive className="h-4 w-4 text-orange-600" />
                <span className="text-xs font-medium text-gray-700">
                  {t('systemStatus.performance.disk')}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {systemInfo.diskUsage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getUsageColor(systemInfo.diskUsage)}`}
                style={{ width: `${systemInfo.diskUsage}%` }}
              />
            </div>
          </div>

          {/* 数据库连接数 */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Database className="h-4 w-4 text-indigo-600" />
                <span className="text-xs font-medium text-gray-700">
                  {t('systemStatus.performance.dbConnections')}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {systemInfo.dbConnections}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {t('systemStatus.performance.maxConnections')}: 100
            </div>
          </div>
        </div>

        {/* 服务状态卡片 */}
        <div className="mb-3">
          <h2 className="text-base font-semibold text-gray-900 mb-2">
            {t('systemStatus.services.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {services.map((service, index) => {
              const IconComponent = service.icon
              return (
                <div
                  key={index}
                  className={`bg-white rounded-xl border-2 p-3 transition-all hover:shadow-md ${getStatusColor(service.status)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <IconComponent className="h-5 w-5" />
                      <h3 className="text-sm font-semibold text-gray-900">
                        {service.name}
                      </h3>
                    </div>
                    <div className={`flex items-center space-x-1 ${service.status === 'normal' ? 'text-green-600' : service.status === 'warning' ? 'text-yellow-600' : 'text-red-600'}`}>
                      {getStatusIcon(service.status)}
                    </div>
                  </div>
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 font-medium">
                      {service.message}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          {/* API请求统计 */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-900">
                {t('systemStatus.stats.apiRequests')}
              </h3>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {formatNumber(systemInfo.apiRequests)}
            </div>
            <div className="text-xs text-gray-500">
              {t('systemStatus.stats.today')}
            </div>
          </div>

          {/* 活跃用户 */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Users className="h-4 w-4 text-green-600" />
              <h3 className="text-sm font-semibold text-gray-900">
                {t('systemStatus.stats.activeUsers')}
              </h3>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {systemInfo.activeUsers}
            </div>
            <div className="text-xs text-gray-500">
              {t('systemStatus.stats.currentOnline')}
            </div>
          </div>

          {/* 网络状态 */}
          <div className="bg-white rounded-xl border border-gray-200 p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Network className="h-4 w-4 text-purple-600" />
              <h3 className="text-sm font-semibold text-gray-900">
                {t('systemStatus.stats.network')}
              </h3>
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">
              {t('systemStatus.status.normal')}
            </div>
            <div className="text-xs text-gray-500">
              {t('systemStatus.stats.latency')}: 12ms
            </div>
          </div>
        </div>

        {/* 系统概览 */}
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            {t('systemStatus.overview.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-gray-50 rounded-lg p-2.5">
              <div className="text-xs text-gray-500 mb-1">
                {t('systemStatus.overview.totalServices')}
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {services.length}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-2.5">
              <div className="text-xs text-green-600 mb-1">
                {t('systemStatus.overview.normalServices')}
              </div>
              <div className="text-lg font-semibold text-green-700">
                {services.filter(s => s.status === 'normal').length}
              </div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-2.5">
              <div className="text-xs text-yellow-600 mb-1">
                {t('systemStatus.overview.warningServices')}
              </div>
              <div className="text-lg font-semibold text-yellow-700">
                {services.filter(s => s.status === 'warning').length}
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-2.5">
              <div className="text-xs text-red-600 mb-1">
                {t('systemStatus.overview.errorServices')}
              </div>
              <div className="text-lg font-semibold text-red-700">
                {services.filter(s => s.status === 'error').length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SystemStatus
