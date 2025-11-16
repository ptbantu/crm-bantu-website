import { useTranslation } from 'react-i18next'
import { Target, Award, Shield, Heart, CheckCircle2, Building2, Users, Briefcase, MapPin, TrendingUp } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import AnimatedNumber from '@/components/AnimatedNumber'

const About = () => {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)

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

  const stats = [
    {
      icon: TrendingUp,
      label: t('home.about.stats.years'),
      value: 3,
      suffix: '年',
    },
    {
      icon: Building2,
      label: t('home.about.stats.companies'),
      value: 1000,
      suffix: '+',
    },
    {
      icon: Briefcase,
      label: t('home.about.stats.services'),
      value: 100,
      suffix: '+',
    },
    {
      icon: Users,
      label: t('home.about.stats.team'),
      value: 50,
      suffix: '+',
    },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.3 }
    )

    if (statsRef.current) {
      observer.observe(statsRef.current)
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current)
      }
    }
  }, [])

  return (
    <div className="min-h-screen py-24 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4 tracking-tight">
            {t('home.about.title')}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-6 font-medium">
            {t('home.about.subtitle')}
          </p>
          <p className="text-lg text-gray-500 leading-relaxed max-w-3xl mx-auto">
            {t('home.about.description')}
          </p>
        </div>

        {/* Stats */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center tracking-tight">
            {t('home.about.stats.title')}
          </h2>
          <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 border border-gray-200 text-center hover:border-primary-300 hover:shadow-md transition-all"
                >
                  <div className="mb-4 flex justify-center">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                    {isVisible && (
                      <>
                        <AnimatedNumber value={stat.value} duration={2000} />
                        {stat.suffix}
                      </>
                    )}
                  </div>
                  <p className="text-base font-medium text-gray-700">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Goal, Vision, Mission, Slogan */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white rounded-xl p-8 border-l-4 border-primary-600 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-gray-500 mb-4 uppercase tracking-wider">
              {t('home.about.goal.title')}
            </h3>
            <p className="text-xl font-semibold text-gray-900 leading-relaxed">
              {t('home.about.goal.content')}
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 border-l-4 border-primary-600 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-gray-500 mb-4 uppercase tracking-wider">
              {t('home.about.vision.title')}
            </h3>
            <p className="text-xl font-semibold text-gray-900 leading-relaxed">
              {t('home.about.vision.content')}
            </p>
          </div>
          <div className="bg-white rounded-xl p-8 border-l-4 border-primary-600 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <Target className="h-6 w-6 text-primary-600 flex-shrink-0" />
              <h3 className="text-lg font-medium text-gray-500 uppercase tracking-wider">
                {t('home.about.mission.title')}
              </h3>
            </div>
            <p className="text-xl font-semibold text-gray-900 leading-relaxed">
              {t('home.about.mission.content')}
            </p>
          </div>
          <div className="bg-primary-600 rounded-xl p-8 text-white shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-medium text-primary-100 mb-4 uppercase tracking-wider">
              {t('home.about.slogan.title')}
            </h3>
            <p className="text-xl font-semibold text-white leading-relaxed">
              {t('home.about.slogan.content')}
            </p>
          </div>
        </div>

        {/* Offices */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center tracking-tight">
            {t('home.about.offices.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-primary-200 hover:shadow-lg transition-all">
              <div className="flex items-start space-x-3 mb-3">
                <MapPin className="h-5 w-5 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
                    {t('home.about.offices.beijing.title')}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('home.about.offices.beijing.type')}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-primary-200 hover:shadow-lg transition-all">
              <div className="flex items-start space-x-3 mb-3">
                <MapPin className="h-5 w-5 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
                    {t('home.about.offices.wuhan.title')}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('home.about.offices.wuhan.type')}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-primary-200 hover:shadow-lg transition-all">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 tracking-tight">
                    {t('home.about.offices.jakarta1.title')}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {t('home.about.offices.jakarta1.address')}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-primary-200 hover:shadow-lg transition-all">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 tracking-tight">
                    {t('home.about.offices.jakarta2.title')}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {t('home.about.offices.jakarta2.address')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-900 mb-8 text-center tracking-tight">
            {t('home.about.values.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-8 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
                >
                  <div className="mb-5">
                    <Icon className="h-10 w-10 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 tracking-tight">
                    {value.title}
                  </h3>
                  <p className="text-base text-gray-600 leading-relaxed">
                    {value.content}
                  </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-3 p-6 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all">
              <CheckCircle2 className="h-6 w-6 text-primary-600 mt-0.5 flex-shrink-0" />
              <p className="text-base text-gray-700 leading-relaxed">{t('home.about.why.experience')}</p>
            </div>
            <div className="flex items-start space-x-3 p-6 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all">
              <CheckCircle2 className="h-6 w-6 text-primary-600 mt-0.5 flex-shrink-0" />
              <p className="text-base text-gray-700 leading-relaxed">{t('home.about.why.team')}</p>
            </div>
            <div className="flex items-start space-x-3 p-6 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all">
              <CheckCircle2 className="h-6 w-6 text-primary-600 mt-0.5 flex-shrink-0" />
              <p className="text-base text-gray-700 leading-relaxed">{t('home.about.why.network')}</p>
            </div>
            <div className="flex items-start space-x-3 p-6 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all">
              <CheckCircle2 className="h-6 w-6 text-primary-600 mt-0.5 flex-shrink-0" />
              <p className="text-base text-gray-700 leading-relaxed">{t('home.about.why.success')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default About

