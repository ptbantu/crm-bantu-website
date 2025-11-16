import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const Footer = () => {
  const { t } = useTranslation()

  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
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

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-5 tracking-tight">
              {t('header.nav.contact')}
            </h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li>Email: info@bantu.sbs</li>
              <li>Phone: +62 XXX XXX XXXX</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} {t('header.title')}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer

