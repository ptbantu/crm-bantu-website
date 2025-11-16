import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Mail, Phone, MapPin } from 'lucide-react'

const Contact = () => {
  const { t } = useTranslation()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: 实现表单提交逻辑
    console.log('Form submitted:', formData)
    alert('感谢您的留言，我们会尽快与您联系！')
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="min-h-screen py-24 px-4 bg-white">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 mb-4 tracking-tight">
            {t('contact.title')}
          </h1>
          <p className="text-lg text-gray-500">
            {t('contact.subtitle')}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-primary-50 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 tracking-tight">Email</h3>
                <p className="text-gray-500">info@bantu.sbs</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-primary-50 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 tracking-tight">Phone</h3>
                <p className="text-gray-500">+62 XXX XXX XXXX</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <div className="bg-primary-50 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1 tracking-tight">Address</h3>
                <p className="text-gray-500">Jakarta, Indonesia</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t('contact.form.name')}
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('contact.form.namePlaceholder')}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t('contact.form.email')}
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('contact.form.emailPlaceholder')}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t('contact.form.phone')}
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={t('contact.form.phonePlaceholder')}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t('contact.form.message')}
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder={t('contact.form.messagePlaceholder')}
                required
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-primary-600 text-white px-6 py-3.5 rounded-xl font-medium hover:bg-primary-700 transition-all shadow-sm hover:shadow-md"
            >
              {t('contact.form.submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Contact

