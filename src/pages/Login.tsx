import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { login } from '@/api/auth'
import { ApiError } from '@/api/client'

const Login = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await login(formData.email, formData.password)
      // 登录成功，跳转到仪表板
      navigate('/dashboard')
    } catch (err) {
      // 处理错误
      if (err instanceof ApiError) {
        setError(err.message || '登录失败，请检查邮箱和密码')
      } else {
        setError('网络错误，请稍后重试')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img
            src="/pics/logo.png"
            alt="Bantu Logo"
            className="mx-auto h-16 w-auto"
          />
          <h2 className="mt-4 text-2xl font-semibold text-gray-900 tracking-tight">
            {t('login.backendTitle')}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            {t('login.title')}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                {t('login.email')}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder={t('login.emailPlaceholder')}
                className="appearance-none rounded-t-xl relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm bg-white"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t('login.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder={t('login.passwordPlaceholder')}
                className="appearance-none rounded-b-xl relative block w-full px-4 py-3 border border-gray-200 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm bg-white"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={formData.remember}
                onChange={handleChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-900"
              >
                {t('login.remember')}
              </label>
            </div>

            <div className="text-sm">
              <a
                href="#"
                className="font-medium text-primary-600 hover:text-primary-500"
              >
                {t('login.forgot')}
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('login.submitting') || '登录中...' : t('login.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login

