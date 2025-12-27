import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import './i18n/config'
import { ToastProvider } from './components/ToastContainer'
import { AuthProvider } from './contexts/AuthContext'
import { ChakraProvider } from './providers/ChakraProvider'
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
import RoleManagement from './pages/admin/RoleManagement'
import Organizations from './pages/admin/Organizations'
import OrganizationsNew from './pages/admin/OrganizationsNew'
import UserInfo from './pages/admin/UserInfo'
import SystemStatus from './pages/admin/SystemStatus'
import SystemLogs from './pages/admin/SystemLogs'
import AuditLogs from './pages/admin/AuditLogs'
import EnterpriseServiceProduct from './pages/admin/EnterpriseServiceProduct'
import VendorProductList from './pages/admin/VendorProductList'
import EnterpriseServiceSupplier from './pages/admin/EnterpriseServiceSupplier'
import CategoryManagement from './pages/admin/CategoryManagement'
import CustomerList from './pages/admin/CustomerList'
import CustomerDetail from './pages/admin/CustomerDetail'
import OrderList from './pages/admin/OrderList'
import OrderDetail from './pages/admin/OrderDetail'
import LeadList from './pages/admin/LeadList'
import LeadDetail from './pages/admin/LeadDetail'
import OpportunityList from './pages/admin/OpportunityList'
import OpportunityDetail from './pages/admin/OpportunityDetail'
import PriceManagement from './pages/admin/PriceManagement'
import SystemConfig from './pages/admin/SystemConfig'
import QueryTool from './pages/admin/QueryTool'

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
          
          {/* 检索工具（所有登录用户） */}
          <Route
            path="/admin/query-tool"
            element={
              <AdminLayout>
                <QueryTool />
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
                  <OrganizationsNew />
                </PermissionGuard>
              </AdminLayout>
            }
          />
          <Route
            path="/admin/user-management/role-management"
            element={
              <AdminLayout>
                <PermissionGuard role="ADMIN">
                  <RoleManagement />
                </PermissionGuard>
              </AdminLayout>
            }
          />
          
          {/* 个人信息页面（所有用户可见） */}
          <Route
            path="/admin/profile"
            element={
              <AdminLayout>
                <UserInfo />
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
          <Route
            path="/admin/system-management/system-logs"
            element={
              <AdminLayout>
                <PermissionGuard role="ADMIN">
                  <SystemLogs />
                </PermissionGuard>
              </AdminLayout>
            }
          />
          <Route
            path="/admin/system-management/audit-logs"
            element={
              <AdminLayout>
                <PermissionGuard role="ADMIN">
                  <AuditLogs />
                </PermissionGuard>
              </AdminLayout>
            }
          />
          <Route
            path="/admin/system-management/system-config"
            element={
              <AdminLayout>
                <PermissionGuard role="ADMIN">
                  <SystemConfig />
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
                  <EnterpriseServiceProduct />
                </PermissionGuard>
              </AdminLayout>
            }
          />
          
          {/* 企服供应商（仅 ADMIN） */}
          <Route
            path="/admin/product/supplier-list"
            element={
              <AdminLayout>
                <PermissionGuard role="ADMIN">
                  <EnterpriseServiceSupplier />
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
          
          {/* 价格管理（仅 ADMIN） */}
          <Route
            path="/admin/price/management"
            element={
              <AdminLayout>
                <PermissionGuard role="ADMIN">
                  <PriceManagement />
                </PermissionGuard>
              </AdminLayout>
            }
          />
          
          {/* 客户管理模块（SALES, ADMIN） */}
          <Route
            path="/admin/customer/list"
            element={
              <AdminLayout>
                <PermissionGuard role={['SALES', 'ADMIN']}>
                  <CustomerList />
                </PermissionGuard>
              </AdminLayout>
            }
          />
          <Route
            path="/admin/customer/detail/:id"
            element={
              <AdminLayout>
                <PermissionGuard role={['SALES', 'ADMIN']}>
                  <CustomerDetail />
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
          
          {/* 线索管理模块（SALES, ADMIN） */}
          <Route
            path="/admin/leads/list"
            element={
              <AdminLayout>
                <PermissionGuard role={['SALES', 'ADMIN']}>
                  <LeadList />
                </PermissionGuard>
              </AdminLayout>
            }
          />
          <Route
            path="/admin/leads/detail/:id"
            element={
              <AdminLayout>
                <PermissionGuard role={['SALES', 'ADMIN']}>
                  <LeadDetail />
                </PermissionGuard>
              </AdminLayout>
            }
          />
          
          {/* 商机管理模块（SALES, ADMIN） */}
          <Route
            path="/admin/opportunities/list"
            element={
              <AdminLayout>
                <PermissionGuard role={['SALES', 'ADMIN']}>
                  <OpportunityList />
                </PermissionGuard>
              </AdminLayout>
            }
          />
          <Route
            path="/admin/opportunities/detail/:id"
            element={
              <AdminLayout>
                <PermissionGuard role={['SALES', 'ADMIN']}>
                  <OpportunityDetail />
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
    <ChakraProvider>
      <ToastProvider>
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ToastProvider>
    </ChakraProvider>
  )
}

export default App

