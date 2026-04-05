import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { LoginPage, RegisterPage } from './pages/auth'
import { CategoryPage } from './pages/categories'
import { TransactionListPage, TransactionFormPage } from './pages/transactions'

// Placeholder page components — will be replaced with real implementations in later tasks.
const DashboardPage = () => <div className="p-8 text-center font-bold text-2xl">Dashboard</div>
const BudgetPage = () => <div className="p-8 text-center font-bold text-2xl">Budgets</div>

// Placeholder ProtectedRoute — will be replaced with real auth guard in task 10.2.
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // TODO: Check auth state from AuthContext and redirect to /login if not authenticated.
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <TransactionListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/new"
            element={
              <ProtectedRoute>
                <TransactionFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions/:id/edit"
            element={
              <ProtectedRoute>
                <TransactionFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <CategoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/budgets"
            element={
              <ProtectedRoute>
                <BudgetPage />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
