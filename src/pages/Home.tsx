import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Building2, FileText, Calculator, Users, Award, Copyright, Mail, MessageCircle, Target, Rocket } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import AnimatedNumber from '@/components/AnimatedNumber'

const Home = () => {
  const { t } = useTranslation()
  const [isVisible, setIsVisible] = useState(false)
  const statsRef = useRef<HTMLDivElement>(null)

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

      {/* About Section */}
      <section className="py-24 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4 tracking-tight">
              {t('home.about.title')}
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 mb-2 font-bold">
              {t('home.about.slogan.content')}
            </p>
            <p className="text-xl md:text-2xl text-gray-600 mb-2 font-medium">
              {t('home.about.subtitle')}
            </p>
            <p className="text-lg text-gray-500 leading-relaxed max-w-3xl mx-auto">
              {t('home.about.description')}
            </p>
          </div>

          {/* Stats */}
          <div ref={statsRef} className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                {isVisible && (
                  <>
                    <AnimatedNumber value={3} duration={2000} />
                    年
                  </>
                )}
              </div>
              <p className="text-sm text-gray-600">{t('home.about.stats.years')}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                {isVisible && (
                  <AnimatedNumber value={1000} suffix="+" duration={2500} />
                )}
              </div>
              <p className="text-sm text-gray-600">{t('home.about.stats.companies')}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                {isVisible && (
                  <AnimatedNumber value={100} suffix="+" duration={2000} />
                )}
              </div>
              <p className="text-sm text-gray-600">{t('home.about.stats.services')}</p>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
                {isVisible && (
                  <AnimatedNumber value={50} suffix="+" duration={2000} />
                )}
              </div>
              <p className="text-sm text-gray-600">{t('home.about.stats.team')}</p>
            </div>
          </div>

          {/* Key Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-8 border-l-4 border-primary-600 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <Target className="h-6 w-6 text-primary-600" />
                <h3 className="text-lg font-medium text-gray-500 uppercase tracking-wider">
                  {t('home.about.mission.title')}
                </h3>
              </div>
              <p className="text-2xl font-semibold text-gray-900 leading-relaxed">
                {t('home.about.mission.content')}
              </p>
            </div>
            <div className="bg-white rounded-xl p-8 border-l-4 border-primary-600 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <Rocket className="h-6 w-6 text-primary-600" />
                <h3 className="text-lg font-medium text-gray-500 uppercase tracking-wider">
                  {t('home.about.goal.title')}
                </h3>
              </div>
              <p className="text-2xl font-semibold text-gray-900 leading-relaxed">
                {t('home.about.goal.content')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-gray-50/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4 tracking-tight">
              {t('home.features.title')}
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 mb-3 font-medium">
              {t('home.features.subtitle')}
            </p>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto leading-relaxed">
              {t('home.features.description')}
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-primary-300 hover:shadow-xl transition-all duration-300 h-full flex flex-col group"
                >
                  <div className="mb-5">
                    <Icon className="h-10 w-10 text-primary-600 group-hover:text-primary-700 transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4 tracking-tight group-hover:text-primary-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-base text-gray-600 leading-relaxed flex-grow">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Customers Section */}
      <section className="py-24 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4 tracking-tight">
              {t('home.customers.title')}
            </h2>
            <p className="text-lg text-gray-500 mb-8">
              {t('home.customers.subtitle')}
            </p>
          </div>

          {/* Customer List */}
          <div className="text-center mb-12">
            <p className="text-lg md:text-xl text-gray-700 font-medium leading-relaxed">
              {t('home.customers.list')}
            </p>
          </div>
          
          {/* Customer Logo */}
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

      {/* Contact Section */}
      <section className="py-24 px-4 bg-gray-50/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4 tracking-tight">
              {t('contact.title')}
            </h2>
            <p className="text-lg text-gray-500 mb-2">
              {t('contact.subtitle')}
            </p>
            <p className="text-base text-gray-400 max-w-2xl mx-auto">
              {t('contact.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Map */}
            <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-200">
              <iframe
                src="https://www.google.com/maps?q=SOHO+CAPITAL+36th+floor,+unit+08.+Jl.+Tanjung+Duren+Raya+No.1+3,+RT.3/RW.5,+Tj.+Duren+Sel.,+Kec.+Grogol+petamburan,Kota+Jakarta+Barat,+Daerah+Khusus+Ibukota+Jakarta+11470&output=embed"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t('contact.map.title')}
              ></iframe>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col justify-center space-y-6">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight">
                  {t('contact.map.title')}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {t('contact.map.address')}
                </p>
              </div>
              
              <div className="pt-6 border-t border-gray-200 space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      {t('footer.contact.email')}
                    </p>
                    <a
                      href="mailto:lily@bantuqifu.com"
                      className="text-gray-700 hover:text-primary-600 transition-colors"
                    >
                      lily@bantuqifu.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MessageCircle className="h-5 w-5 text-primary-600 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      {t('footer.contact.whatsapp')}
                    </p>
                    <a
                      href="https://wa.me/6282327758858"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-700 hover:text-primary-600 transition-colors underline"
                    >
                      +62 823-2775-8858
                    </a>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/contact"
                  className="inline-block bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-all shadow-sm hover:shadow-md"
                >
                  {t('contact.title')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home

