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
import EmployeeList from './pages/admin/EmployeeList'
import EmployeeManagement from './pages/admin/EmployeeManagement'
import Organizations from './pages/admin/Organizations'
import UserInfo from './pages/admin/UserInfo'
import SystemStatus from './pages/admin/SystemStatus'
import ProductManagement from './pages/admin/ProductManagement'
import VendorProductList from './pages/admin/VendorProductList'
import CategoryManagement from './pages/admin/CategoryManagement'
import CustomerList from './pages/admin/CustomerList'
import ContactList from './pages/admin/ContactList'
import OrderList from './pages/admin/OrderList'
import OrderDetail from './pages/admin/OrderDetail'

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
          
          {/* 用户管理模块（仅 ADMIN） */}
          <Route
            path="/admin/user-management/employee-list"
            element={
              <AdminLayout>
                <PermissionGuard role="ADMIN">
                  <EmployeeList />
                </PermissionGuard>
              </AdminLayout>
            }
          />
          <Route
            path="/admin/user-management/employee-management"
            element={
              <AdminLayout>
                <PermissionGuard role="ADMIN">
                  <EmployeeManagement />
                </PermissionGuard>
              </AdminLayout>
            }
          />
          <Route
            path="/admin/user-management/organizations"
            element={
              <AdminLayout>
                <PermissionGuard role="ADMIN">
                  <Organizations />
                </PermissionGuard>
              </AdminLayout>
            }
          />
          
          {/* 系统管理模块（仅 ADMIN） */}
          <Route
            path="/admin/system-management/user-info"
            element={
              <AdminLayout>
                <PermissionGuard role="ADMIN">
                  <UserInfo />
                </PermissionGuard>
              </AdminLayout>
            }
          />
          <Route
            path="/admin/system-management/system-status"
            element={
              <AdminLayout>
                <PermissionGuard role="ADMIN">
                  <SystemStatus />
                </PermissionGuard>
              </AdminLayout>
            }
          />
          
          {/* 产品/服务管理模块（仅 ADMIN） */}
          <Route
            path="/admin/product/management"
            element={
              <AdminLayout>
                <PermissionGuard role="ADMIN">
                  <ProductManagement />
                </PermissionGuard>
              </AdminLayout>
            }
          />
          
          {/* 供应商服务列表（仅 ADMIN） */}
          <Route
            path="/admin/product/vendor-list"
            element={
              <AdminLayout>
                <PermissionGuard role="ADMIN">
                  <VendorProductList />
                </PermissionGuard>
              </AdminLayout>
            }
          />
          
          {/* 服务分类管理（仅 ADMIN） */}
          <Route
            path="/admin/product/category-management"
            element={
              <AdminLayout>
                <PermissionGuard role="ADMIN">
                  <CategoryManagement />
                </PermissionGuard>
              </AdminLayout>
            }
          />
          
          {/* 客户管理模块（仅 ADMIN） */}
          <Route
            path="/admin/customer/list"
            element={
              <AdminLayout>
                <PermissionGuard role="ADMIN">
                  <CustomerList />
                </PermissionGuard>
              </AdminLayout>
            }
          />
          <Route
            path="/admin/customer/contacts"
            element={
              <AdminLayout>
                <PermissionGuard role="ADMIN">
                  <ContactList />
                </PermissionGuard>
              </AdminLayout>
            }
          />
          
          {/* 订单管理模块（仅 ADMIN） */}
          <Route
            path="/admin/order/list"
            element={
              <AdminLayout>
                <PermissionGuard role="ADMIN">
                  <OrderList />
                </PermissionGuard>
              </AdminLayout>
            }
          />
          <Route
            path="/admin/order/detail/:id"
            element={
              <AdminLayout>
                <PermissionGuard role="ADMIN">
                  <OrderDetail />
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

