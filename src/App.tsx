import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastProvider } from './components/ui/Toast'
import { Navbar, Sidebar, ProtectedRoute } from './components/layout'
import { ErrorBoundary } from './components/ErrorBoundary'
import { LoginPage, RegisterPage } from './pages/auth'
import { CategoryPage } from './pages/categories'
import { TransactionListPage, TransactionFormPage } from './pages/transactions'
import { DashboardPage } from './pages/dashboard'
import { BudgetPage } from './pages/budgets'

function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-gray-neo">
      <Navbar onMenuToggle={() => setSidebarOpen((v) => !v)} />
      <Sidebar
        open={sidebarOpen}
        collapsed={sidebarCollapsed}
        onClose={() => setSidebarOpen(false)}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      />
      {/* Main content — offset by sidebar width on large screens */}
      <main
        className={[
          'min-h-[calc(100vh-3.5rem)] transition-all duration-200',
          sidebarCollapsed ? 'lg:ml-14' : 'lg:ml-56',
        ].join(' ')}
      >
        {children}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected routes with layout */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <DashboardPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/transactions"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <TransactionListPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/transactions/new"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <TransactionFormPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/transactions/:id/edit"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <TransactionFormPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/categories"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <CategoryPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/budgets"
                  element={
                    <ProtectedRoute>
                      <AppLayout>
                        <BudgetPage />
                      </AppLayout>
                    </ProtectedRoute>
                  }
                />

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
