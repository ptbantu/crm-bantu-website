import { useTranslation } from 'react-i18next'
import { Users, Workflow, DollarSign } from 'lucide-react'

const Services = () => {
  const { t } = useTranslation()

  const services = [
    {
      icon: Users,
      title: t('services.crm.title'),
      description: t('services.crm.description'),
      features: [
        t('services.crm.features.0'),
        t('services.crm.features.1'),
        t('services.crm.features.2'),
        t('services.crm.features.3'),
      ],
    },
    {
      icon: Workflow,
      title: t('services.workflow.title'),
      description: t('services.workflow.description'),
      features: [
        t('services.workflow.features.0'),
        t('services.workflow.features.1'),
        t('services.workflow.features.2'),
        t('services.workflow.features.3'),
      ],
    },
    {
      icon: DollarSign,
      title: t('services.finance.title'),
      description: t('services.finance.description'),
      features: [
        t('services.finance.features.0'),
        t('services.finance.features.1'),
        t('services.finance.features.2'),
        t('services.finance.features.3'),
      ],
    },
  ]

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {t('services.title')}
          </h1>
          <p className="text-lg text-gray-600">
            {t('services.subtitle')}
          </p>
        </div>
        <div className="space-y-12">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <div
                key={index}
                className="bg-white rounded-lg shadow-md p-8 border border-gray-200"
              >
                <div className="flex items-start space-x-6">
                  <div className="bg-primary-100 w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      {service.title}
                    </h2>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {service.features.map((feature, featureIndex) => (
                        <li
                          key={featureIndex}
                          className="flex items-center text-gray-700"
                        >
                          <span className="text-primary-600 mr-2">✓</span>
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

