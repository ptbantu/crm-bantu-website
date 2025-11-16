import { useTranslation } from 'react-i18next'
import { Target, Award, Shield, Heart, CheckCircle2 } from 'lucide-react'

const About = () => {
  const { t } = useTranslation()

  const values = [
    {
      icon: Award,
      title: t('home.about.values.professional.title'),
      content: t('home.about.values.professional.content'),
    },
    {
      icon: CheckCircle2,
      title: t('home.about.values.efficient.title'),
      content: t('home.about.values.efficient.content'),
    },
    {
      icon: Shield,
      title: t('home.about.values.reliable.title'),
      content: t('home.about.values.reliable.content'),
    },
    {
      icon: Heart,
      title: t('home.about.values.customer.title'),
      content: t('home.about.values.customer.content'),
    },
  ]

  return (
    <div className="min-h-screen py-24 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4 tracking-tight">
            {t('home.about.title')}
          </h1>
          <p className="text-lg text-gray-500 mb-6">
            {t('home.about.subtitle')}
          </p>
          <p className="text-lg text-gray-500 leading-relaxed max-w-3xl mx-auto">
            {t('home.about.description')}
          </p>
        </div>

        {/* Mission */}
        <div className="mb-16">
          <div className="bg-primary-50 rounded-2xl p-8 border border-primary-100">
            <div className="flex items-start space-x-4">
              <div className="bg-primary-600 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-3 tracking-tight">
                  {t('home.about.mission.title')}
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {t('home.about.mission.content')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center tracking-tight">
            {t('home.about.values.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div
                  key={index}
                  className="p-6 rounded-2xl border border-gray-100 bg-white hover:border-primary-200 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-primary-50 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 tracking-tight">
                        {value.title}
                      </h3>
                      <p className="text-gray-500 leading-relaxed">
                        {value.content}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Why Choose Us */}
        <div>
          <h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center tracking-tight">
            {t('home.about.why.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3 p-4 rounded-xl bg-gray-50">
              <CheckCircle2 className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <p className="text-gray-600">{t('home.about.why.experience')}</p>
            </div>
            <div className="flex items-start space-x-3 p-4 rounded-xl bg-gray-50">
              <CheckCircle2 className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <p className="text-gray-600">{t('home.about.why.team')}</p>
            </div>
            <div className="flex items-start space-x-3 p-4 rounded-xl bg-gray-50">
              <CheckCircle2 className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <p className="text-gray-600">{t('home.about.why.network')}</p>
            </div>
            <div className="flex items-start space-x-3 p-4 rounded-xl bg-gray-50">
              <CheckCircle2 className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
              <p className="text-gray-600">{t('home.about.why.success')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About

