import { useState } from 'react'
import { useDashboard } from '../../hooks/useDashboard'
import { MonthlyChart } from '../../components/charts/MonthlyChart'
import { CategoryPieChart } from '../../components/charts/CategoryPieChart'
import Card from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import ProgressBar from '../../components/ui/ProgressBar'
import Badge from '../../components/ui/Badge'
import type { Budget } from '../../types/budget'

const currentDate = new Date()
const currentMonth = currentDate.getMonth() + 1
const currentYear = currentDate.getFullYear()

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function SummaryCard({ label, value, bg }: { label: string; value: number; bg: string }) {
  return (
    <div className={`${bg} border-neo-thick border-dark shadow-neo p-5 flex flex-col gap-1`}>
      <span className="text-sm font-bold uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-black">{value.toLocaleString()}</span>
    </div>
  )
}

export default function DashboardPage() {
  const [filterMonth, setFilterMonth] = useState(currentMonth)
  const [filterYear, setFilterYear] = useState(currentYear)

  const { data, isLoading, isError, refetch } = useDashboard(filterMonth, filterYear)
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
          <div className="flex gap-3">
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(Number(e.target.value))}
              className="border-neo-thick border-dark px-3 py-2 font-medium bg-light focus:outline-none shadow-neo-sm"
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={i + 1} value={i + 1}>{name}</option>
              ))}
            </select>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
              className="border-neo-thick border-dark px-3 py-2 font-medium bg-light focus:outline-none shadow-neo-sm"
            >
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {isLoading ? (
          <Card>
            <div className="p-8 text-center font-bold text-gray-500">Loading dashboard…</div>
          </Card>
        ) : isError ? (
          <Card>
            <div className="p-8 text-center">
              <p className="font-bold text-danger mb-4">Failed to load dashboard data.</p>
              <Button onClick={() => refetch()}>Retry</Button>
            </div>
          </Card>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <SummaryCard label="Total Income"   value={data?.totalIncome  ?? 0} bg="bg-success" />
              <SummaryCard label="Total Expense"  value={data?.totalExpense ?? 0} bg="bg-danger"  />
              <SummaryCard label="Balance"        value={data?.balance      ?? 0} bg="bg-primary" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <MonthlyChart data={data?.monthlyData ?? []} />
              <CategoryPieChart data={data?.topCategories ?? []} />
            </div>

            {/* Budget Status */}
            <Card>
              <h2 className="text-lg font-black mb-4">Budget Status</h2>
              {!data?.budgetStatus?.length ? (
                <p className="text-gray-500 font-medium text-sm">
                  No budgets set for {MONTH_NAMES[filterMonth - 1]} {filterYear}.
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {data.budgetStatus.map((b: Budget) => (
                    <div key={b.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black">{b.categoryName}</span>
                          {b.exceeded && <Badge variant="exceeded" />}
                          {b.warning && !b.exceeded && <Badge variant="warning" />}
                        </div>
                        <span className="text-sm font-bold text-gray-600">
                          {b.usedAmount.toLocaleString()} / {b.limitAmount.toLocaleString()}
                        </span>
                      </div>
                      <ProgressBar percentage={b.percentage} />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
