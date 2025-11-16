import { useTranslation } from 'react-i18next'
import { Building2, FileText, Calculator, Users, Award, Copyright } from 'lucide-react'

const Services = () => {
  const { t } = useTranslation()

  const services = [
    {
      icon: Building2,
      title: t('services.companyRegistration.title'),
      description: t('services.companyRegistration.description'),
      features: [
        t('services.companyRegistration.features.0'),
        t('services.companyRegistration.features.1'),
        t('services.companyRegistration.features.2'),
        t('services.companyRegistration.features.3'),
        t('services.companyRegistration.features.4'),
        t('services.companyRegistration.features.5'),
      ],
    },
    {
      icon: FileText,
      title: t('services.visaService.title'),
      description: t('services.visaService.description'),
      features: [
        t('services.visaService.features.0'),
        t('services.visaService.features.1'),
        t('services.visaService.features.2'),
        t('services.visaService.features.3'),
        t('services.visaService.features.4'),
        t('services.visaService.features.5'),
      ],
    },
    {
      icon: Calculator,
      title: t('services.financeTax.title'),
      description: t('services.financeTax.description'),
      features: [
        t('services.financeTax.features.0'),
        t('services.financeTax.features.1'),
        t('services.financeTax.features.2'),
        t('services.financeTax.features.3'),
        t('services.financeTax.features.4'),
        t('services.financeTax.features.5'),
      ],
    },
    {
      icon: Users,
      title: t('services.hrOutsourcing.title'),
      description: t('services.hrOutsourcing.description'),
      features: [
        t('services.hrOutsourcing.features.0'),
        t('services.hrOutsourcing.features.1'),
        t('services.hrOutsourcing.features.2'),
        t('services.hrOutsourcing.features.3'),
        t('services.hrOutsourcing.features.4'),
        t('services.hrOutsourcing.features.5'),
      ],
    },
    {
      icon: Award,
      title: t('services.certification.title'),
      description: t('services.certification.description'),
      features: [
        t('services.certification.features.0'),
        t('services.certification.features.1'),
        t('services.certification.features.2'),
        t('services.certification.features.3'),
        t('services.certification.features.4'),
        t('services.certification.features.5'),
      ],
    },
    {
      icon: Copyright,
      title: t('services.intellectualProperty.title'),
      description: t('services.intellectualProperty.description'),
      features: [
        t('services.intellectualProperty.features.0'),
        t('services.intellectualProperty.features.1'),
        t('services.intellectualProperty.features.2'),
        t('services.intellectualProperty.features.3'),
        t('services.intellectualProperty.features.4'),
        t('services.intellectualProperty.features.5'),
      ],
    },
  ]

  return (
    <div className="min-h-screen py-24 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4 tracking-tight">
            {t('services.title')}
          </h1>
          <p className="text-lg text-gray-500">
            {t('services.subtitle')}
          </p>
        </div>
        <div className="space-y-8">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-gray-100 p-10 hover:border-primary-200 hover:shadow-lg transition-all"
              >
                <div className="flex items-start space-x-8">
                  <div className="bg-primary-50 w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-4 tracking-tight">
                      {service.title}
                    </h2>
                    <p className="text-gray-500 mb-6 leading-relaxed">{service.description}</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {service.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-center text-gray-600"
                        >
                          <span className="text-primary-600 mr-3 font-semibold">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Services

