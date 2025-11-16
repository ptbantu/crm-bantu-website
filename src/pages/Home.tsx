import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Users, Workflow, DollarSign, Network } from 'lucide-react'

const Home = () => {
  const { t } = useTranslation()

  const features = [
    {
      icon: Users,
      title: t('home.features.crm.title'),
      description: t('home.features.crm.description'),
    },
    {
      icon: Workflow,
      title: t('home.features.workflow.title'),
      description: t('home.features.workflow.description'),
    },
    {
      icon: DollarSign,
      title: t('home.features.finance.title'),
      description: t('home.features.finance.description'),
    },
    {
      icon: Network,
      title: t('home.features.integration.title'),
      description: t('home.features.integration.description'),
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-primary-100 py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t('home.hero.title')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-4">
            {t('home.hero.subtitle')}
          </p>
          <p className="text-lg text-gray-600 mb-8">
            {t('home.hero.description')}
          </p>
          <Link
            to="/services"
            className="inline-block bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            {t('home.hero.cta')}
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t('home.features.title')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('home.features.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 text-center">
            {t('home.about.title')}
          </h2>
          <p className="text-lg text-gray-600 text-center leading-relaxed">
            {t('home.about.description')}
          </p>
        </div>
      </section>
    </div>
  )
}

export default Home

