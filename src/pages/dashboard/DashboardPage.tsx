import { useState } from 'react'
import { useDashboard } from '../../hooks/useDashboard'
import { MonthlyChart } from '../../components/charts/MonthlyChart'
import { CategoryPieChart } from '../../components/charts/CategoryPieChart'
import type { Budget } from '../../types/budget'

const currentDate = new Date()
const currentMonth = currentDate.getMonth() + 1
const currentYear = currentDate.getFullYear()

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function ProgressBar({ percentage }: { percentage: number }) {
  const clamped = Math.min(percentage, 100)
  const color =
    percentage >= 100 ? 'bg-[#EF4444]' : percentage >= 80 ? 'bg-[#FACC15]' : 'bg-[#22C55E]'
  return (
    <div className="w-full bg-[#F5F5F5] border-2 border-black h-5 relative">
      <div className={`${color} h-full transition-all`} style={{ width: `${clamped}%` }} />
      <span className="absolute inset-0 flex items-center justify-center text-xs font-black">
        {percentage.toFixed(1)}%
      </span>
    </div>
  )
}

function SummaryCard({
  label,
  value,
  bg,
}: {
  label: string
  value: number
  bg: string
}) {
  return (
    <div className={`${bg} border-2 border-black shadow-[4px_4px_0px_#000] p-5 flex flex-col gap-1`}>
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
    <div className="min-h-screen bg-[#F5F5F5] p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-black tracking-tight">Dashboard</h1>
          <div className="flex gap-3">
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(Number(e.target.value))}
              className="border-2 border-black px-3 py-2 font-medium bg-white focus:outline-none shadow-[2px_2px_0px_#000]"
            >
              {MONTH_NAMES.map((name, i) => (
                <option key={i + 1} value={i + 1}>{name}</option>
              ))}
            </select>
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
              className="border-2 border-black px-3 py-2 font-medium bg-white focus:outline-none shadow-[2px_2px_0px_#000]"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] p-12 text-center font-bold text-gray-500">
            Loading dashboard…
          </div>
        ) : isError ? (
          <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] p-12 text-center">
            <p className="font-bold text-[#EF4444] mb-4">Failed to load dashboard data.</p>
            <button
              onClick={() => refetch()}
              className="bg-[#FACC15] border-2 border-black shadow-[4px_4px_0px_#000] px-4 py-2 font-bold text-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000] transition-all"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <SummaryCard label="Total Income" value={data?.totalIncome ?? 0} bg="bg-[#22C55E]" />
              <SummaryCard label="Total Expense" value={data?.totalExpense ?? 0} bg="bg-[#EF4444]" />
              <SummaryCard label="Balance" value={data?.balance ?? 0} bg="bg-[#FACC15]" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <MonthlyChart data={data?.monthlyData ?? []} />
              <CategoryPieChart data={data?.topCategories ?? []} />
            </div>

            {/* Budget Status */}
            <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] p-5">
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
                        <div className="flex items-center gap-2">
                          <span className="font-black">{b.categoryName}</span>
                          {b.exceeded && (
                            <span className="bg-[#EF4444] text-white border-2 border-black px-2 py-0.5 text-xs font-black uppercase">
                              Exceeded
                            </span>
                          )}
                          {b.warning && !b.exceeded && (
                            <span className="bg-[#FACC15] text-black border-2 border-black px-2 py-0.5 text-xs font-black uppercase">
                              Warning
                            </span>
                          )}
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
            </div>
          </>
        )}
      </div>
    </div>
  )
}
