import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, X } from 'lucide-react'
import { cn } from '@/utils/cn'

const Header = () => {
  const { t, i18n } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)

  const currentLang = i18n.language

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang)
    setIsLangMenuOpen(false)
  }

  const handleNavClick = () => {
    setIsMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/pics/bantu/bantu_logo.png"
              alt="Bantu Logo"
              className="h-9 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
            >
              {t('header.nav.home')}
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
            >
              {t('header.nav.about')}
            </Link>
            <Link
              to="/services"
              className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
            >
              {t('header.nav.services')}
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
            >
              {t('header.nav.contact')}
            </Link>
            <Link
              to="/login"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              {t('header.nav.dashboard')}
            </Link>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors"
              >
                <span className="text-lg">
                  {currentLang === 'zh-CN' ? '🇨🇳' : '🇮🇩'}
                </span>
                <span>{currentLang === 'zh-CN' ? '中文' : 'ID'}</span>
              </button>
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-36 rounded-xl bg-white shadow-lg border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => handleLanguageChange('zh-CN')}
                    className={cn(
                      'w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center space-x-2',
                      currentLang === 'zh-CN' && 'bg-primary-50 text-primary-600'
                    )}
                  >
                    <span className="text-lg">🇨🇳</span>
                    <span>{t('common.chinese')}</span>
                  </button>
                  <button
                    onClick={() => handleLanguageChange('id-ID')}
                    className={cn(
                      'w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center space-x-2',
                      currentLang === 'id-ID' && 'bg-primary-50 text-primary-600'
                    )}
                  >
                    <span className="text-lg">🇮🇩</span>
                    <span>{t('common.indonesian')}</span>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="p-2 text-gray-600 hover:text-primary-600 transition-colors text-xl"
            >
              {currentLang === 'zh-CN' ? '🇨🇳' : '🇮🇩'}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 space-y-1 border-t border-gray-100">
            <Link
              to="/"
              onClick={handleNavClick}
              className="block px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
            >
              {t('header.nav.home')}
            </Link>
            <Link
              to="/about"
              onClick={handleNavClick}
              className="block px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
            >
              {t('header.nav.about')}
            </Link>
            <Link
              to="/services"
              onClick={handleNavClick}
              className="block px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
            >
              {t('header.nav.services')}
            </Link>
            <Link
              to="/contact"
              onClick={handleNavClick}
              className="block px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
            >
              {t('header.nav.contact')}
            </Link>
            <Link
              to="/login"
              onClick={handleNavClick}
              className="block px-4 py-3 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-xl transition-colors"
            >
              {t('header.nav.dashboard')}
            </Link>
            {isLangMenuOpen && (
              <div className="px-4 py-2 space-y-1">
                <button
                  onClick={() => {
                    handleLanguageChange('zh-CN')
                    setIsMenuOpen(false)
                  }}
                  className={cn(
                    'w-full text-left px-4 py-3 text-sm rounded-xl hover:bg-gray-50 transition-colors flex items-center space-x-2',
                    currentLang === 'zh-CN' && 'bg-primary-50 text-primary-600'
                  )}
                >
                  <span className="text-lg">🇨🇳</span>
                  <span>{t('common.chinese')}</span>
                </button>
                <button
                  onClick={() => {
                    handleLanguageChange('id-ID')
                    setIsMenuOpen(false)
                  }}
                  className={cn(
                    'w-full text-left px-4 py-3 text-sm rounded-xl hover:bg-gray-50 transition-colors flex items-center space-x-2',
                    currentLang === 'id-ID' && 'bg-primary-50 text-primary-600'
                  )}
                >
                  <span className="text-lg">🇮🇩</span>
                  <span>{t('common.indonesian')}</span>
                </button>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}

export default Header

