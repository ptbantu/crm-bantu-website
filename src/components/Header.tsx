import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, X, Globe } from 'lucide-react'
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
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/pics/logo.png"
              alt="Bantu Logo"
              className="h-10 w-auto"
            />
            <span className="text-xl font-bold text-gray-900">
              {t('header.title')}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              {t('header.nav.home')}
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              {t('header.nav.about')}
            </Link>
            <Link
              to="/services"
              className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              {t('header.nav.services')}
            </Link>
            <Link
              to="/contact"
              className="text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
            >
              {t('header.nav.contact')}
            </Link>
            <Link
              to="/dashboard"
              className="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
            >
              {t('header.nav.dashboard')}
            </Link>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-primary-600 transition-colors"
              >
                <Globe className="h-4 w-4" />
                <span>{currentLang === 'zh-CN' ? '中文' : 'ID'}</span>
              </button>
              {isLangMenuOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-md bg-white shadow-lg border">
                  <button
                    onClick={() => handleLanguageChange('zh-CN')}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors',
                      currentLang === 'zh-CN' && 'bg-primary-50 text-primary-600'
                    )}
                  >
                    {t('common.chinese')}
                  </button>
                  <button
                    onClick={() => handleLanguageChange('id-ID')}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors',
                      currentLang === 'id-ID' && 'bg-primary-50 text-primary-600'
                    )}
                  >
                    {t('common.indonesian')}
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              className="p-2 text-gray-700"
            >
              <Globe className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-700"
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
          <nav className="md:hidden py-4 space-y-2 border-t">
            <Link
              to="/"
              onClick={handleNavClick}
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              {t('header.nav.home')}
            </Link>
            <Link
              to="/about"
              onClick={handleNavClick}
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              {t('header.nav.about')}
            </Link>
            <Link
              to="/services"
              onClick={handleNavClick}
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              {t('header.nav.services')}
            </Link>
            <Link
              to="/contact"
              onClick={handleNavClick}
              className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              {t('header.nav.contact')}
            </Link>
            <Link
              to="/dashboard"
              onClick={handleNavClick}
              className="block px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-md"
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
                    'w-full text-left px-4 py-2 text-sm rounded-md hover:bg-gray-100',
                    currentLang === 'zh-CN' && 'bg-primary-50 text-primary-600'
                  )}
                >
                  {t('common.chinese')}
                </button>
                <button
                  onClick={() => {
                    handleLanguageChange('id-ID')
                    setIsMenuOpen(false)
                  }}
                  className={cn(
                    'w-full text-left px-4 py-2 text-sm rounded-md hover:bg-gray-100',
                    currentLang === 'id-ID' && 'bg-primary-50 text-primary-600'
                  )}
                >
                  {t('common.indonesian')}
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

