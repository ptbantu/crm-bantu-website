import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Mail, MessageCircle, MapPin } from 'lucide-react'

const Footer = () => {
  const { t } = useTranslation()

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-5">
              <img
                src="/pics/logo.png"
                alt="Bantu Logo"
                className="h-9 w-auto"
              />
              <span className="text-lg font-semibold text-white tracking-tight">
                {t('header.title')}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-4 leading-relaxed max-w-md">
              {t('home.about.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-5 tracking-tight">
              {t('common.home')}
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {t('header.nav.home')}
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {t('header.nav.about')}
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {t('header.nav.services')}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {t('header.nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-5 tracking-tight">
              {t('header.nav.contact')}
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start space-x-2">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  {t('footer.contact.email')}:{' '}
                  <a
                    href="mailto:lily@bantuqifu.com"
                    className="hover:text-white transition-colors"
                  >
                    lily@bantuqifu.com
                  </a>
                </span>
              </li>
              <li className="flex items-start space-x-2">
                <MessageCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>
                  {t('footer.contact.whatsapp')}:{' '}
                  <a
                    href="https://wa.me/6282327758858"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors underline"
                  >
                    +62 823-2775-8858
                  </a>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Offices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-8 border-t border-gray-800">
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-tight flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>{t('footer.beijingOffice.title')}</span>
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              {t('footer.beijingOffice.address')}
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 tracking-tight flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <span>{t('footer.jakartaOffice.title')}</span>
            </h4>
            <p className="text-sm text-gray-400 leading-relaxed">
              {t('footer.jakartaOffice.address')}
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500 space-y-2">
          <p>{t('footer.copyright')}</p>
          <p>{t('footer.icp')}</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

