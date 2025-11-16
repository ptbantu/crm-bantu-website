import { useTranslation } from 'react-i18next'

const About = () => {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 text-center">
          {t('home.about.title')}
        </h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            {t('home.about.description')}
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            {/* 这里可以根据PDF内容添加更多详细信息 */}
            {t('home.about.description')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default About

