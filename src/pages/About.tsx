import { useTranslation } from 'react-i18next'

const About = () => {
  const { t } = useTranslation()

  return (
    <div className="min-h-screen py-24 px-4 bg-white">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-12 text-center tracking-tight">
          {t('home.about.title')}
        </h1>
        <div className="prose prose-lg max-w-none">
          <p className="text-lg text-gray-500 leading-relaxed mb-6">
            {t('home.about.description')}
          </p>
          <p className="text-lg text-gray-500 leading-relaxed">
            {/* 这里可以根据PDF内容添加更多详细信息 */}
            {t('home.about.description')}
          </p>
        </div>
      </div>
    </div>
  )
}

export default About

