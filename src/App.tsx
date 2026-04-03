import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Placeholder page components — will be replaced with real implementations in later tasks.
const LoginPage = () => <div className="p-8 text-center font-bold text-2xl">Login Page</div>
const RegisterPage = () => <div className="p-8 text-center font-bold text-2xl">Register Page</div>
const DashboardPage = () => <div className="p-8 text-center font-bold text-2xl">Dashboard</div>
const TransactionListPage = () => <div className="p-8 text-center font-bold text-2xl">Transactions</div>
const CategoryPage = () => <div className="p-8 text-center font-bold text-2xl">Categories</div>
const BudgetPage = () => <div className="p-8 text-center font-bold text-2xl">Budgets</div>

// Placeholder ProtectedRoute — will be replaced with real auth guard in task 10.2.
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // TODO: Check auth state from AuthContext and redirect to /login if not authenticated.
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  )
}
