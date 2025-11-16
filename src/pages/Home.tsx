import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Building2, FileText, Calculator, Users, Award, Copyright } from 'lucide-react'

const Home = () => {
  const { t } = useTranslation()

  const features = [
    {
      icon: Building2,
      title: t('home.features.companyRegistration.title'),
      description: t('home.features.companyRegistration.description'),
    },
    {
      icon: FileText,
      title: t('home.features.visaService.title'),
      description: t('home.features.visaService.description'),
    },
    {
      icon: Calculator,
      title: t('home.features.financeTax.title'),
      description: t('home.features.financeTax.description'),
    },
    {
      icon: Users,
      title: t('home.features.hrOutsourcing.title'),
      description: t('home.features.hrOutsourcing.description'),
    },
    {
      icon: Award,
      title: t('home.features.certification.title'),
      description: t('home.features.certification.description'),
    },
    {
      icon: Copyright,
      title: t('home.features.intellectualProperty.title'),
      description: t('home.features.intellectualProperty.description'),
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-primary-50/50 py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-5xl md:text-6xl font-semibold text-gray-900 mb-6 tracking-tight">
                {t('home.hero.title')}
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-4 font-medium">
                {t('home.hero.subtitle')}
              </p>
              <p className="text-lg text-gray-500 mb-10 max-w-2xl lg:max-w-none">
                {t('home.hero.description')}
              </p>
              <Link
                to="/services"
                className="inline-block bg-primary-600 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-primary-700 transition-all shadow-sm hover:shadow-md"
              >
                {t('home.hero.cta')}
              </Link>
            </div>
            {/* Right: Welcome Image */}
            <div className="flex items-center justify-center lg:justify-end">
              <div className="relative">
                <img
                  src="/pics/welcome.png"
                  alt="Welcome"
                  className="max-w-full h-auto"
                  style={{ maxHeight: '500px', objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4 tracking-tight">
              {t('home.features.title')}
            </h2>
            <p className="text-lg text-gray-500">
              {t('home.features.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="p-8 rounded-2xl border border-gray-100 bg-white hover:border-primary-200 hover:shadow-lg transition-all"
                >
                  <div className="bg-primary-50 w-14 h-14 rounded-xl flex items-center justify-center mb-5">
                    <Icon className="h-7 w-7 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Customers Section */}
      <section className="py-24 px-4 bg-gray-50/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4 tracking-tight">
              {t('home.customers.title')}
            </h2>
            <p className="text-lg text-gray-500">
              {t('home.customers.subtitle')}
            </p>
          </div>
          <div className="flex items-center justify-center">
            <img
              src="/pics/customer.png"
              alt="Our Customers"
              className="max-w-full h-auto mx-auto"
              style={{ maxHeight: '400px', objectFit: 'contain', width: 'auto' }}
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-6 text-center tracking-tight">
            {t('home.about.title')}
          </h2>
          <p className="text-lg text-gray-500 text-center leading-relaxed max-w-2xl mx-auto">
            {t('home.about.description')}
          </p>
        </div>
      </section>
    </div>
  )
}

export default Home

