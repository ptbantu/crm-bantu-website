import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import './i18n/config'
import { ToastProvider } from './components/ToastContainer'
import { AuthProvider } from './contexts/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import { AdminLayout } from './layouts/AdminLayout'
import { PermissionGuard } from './components/admin/PermissionGuard'
import { Permission } from './config/permissions'
import Home from './pages/Home'
import About from './pages/About'
import Services from './pages/Services'
import Contact from './pages/Contact'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'

const AppContent = () => {
  const location = useLocation()
  const isBackendPage = location.pathname === '/login' || location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin')

  return (
    <div className="flex flex-col min-h-screen">
      {!isBackendPage && <Header />}
      <main className={isBackendPage ? 'flex-grow' : 'flex-grow'}>
        <Routes>
          {/* 前台页面 */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* 登录页面 */}
          <Route path="/login" element={<Login />} />
          
          {/* 后台管理页面 */}
          <Route
            path="/dashboard"
            element={
              <AdminLayout>
                <Dashboard />
              </AdminLayout>
            }
          />
          
          {/* 基础管理模块 */}
          <Route
            path="/admin/foundation/organizations"
            element={
              <AdminLayout>
                <PermissionGuard permission={Permission.ORG_READ}>
                  <div>组织管理页面（待实现）</div>
                </PermissionGuard>
              </AdminLayout>
            }
          />
          <Route
            path="/admin/foundation/users"
            element={
              <AdminLayout>
                <PermissionGuard permission={Permission.USER_READ}>
                  <div>用户管理页面（待实现）</div>
                </PermissionGuard>
              </AdminLayout>
            }
          />
          <Route
            path="/admin/foundation/roles"
            element={
              <AdminLayout>
                <PermissionGuard permission={Permission.USER_READ}>
                  <div>角色管理页面（待实现）</div>
                </PermissionGuard>
              </AdminLayout>
            }
          />
          <Route
            path="/admin/foundation/settings"
            element={
              <AdminLayout>
                <PermissionGuard role="ADMIN">
                  <div>系统设置页面（待实现）</div>
                </PermissionGuard>
              </AdminLayout>
            }
          />
          
          {/* 其他模块（占位） */}
          <Route
            path="/admin/*"
            element={
              <AdminLayout>
                <div className="text-center py-12">
                  <p className="text-gray-500">页面开发中...</p>
                </div>
              </AdminLayout>
            }
          />
        </Routes>
      </main>
      {!isBackendPage && <Footer />}
    </div>
  )
}

const App = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ToastProvider>
  )
}

export default App

