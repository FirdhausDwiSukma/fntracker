import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import type { MonthlyAggregate } from '../../types/dashboard'

interface Props {
  data: MonthlyAggregate[]
}

export function MonthlyChart({ data }: Props) {
  return (
    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] p-4">
      <h2 className="text-lg font-black mb-4">Monthly Income vs Expense</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#000" strokeOpacity={0.15} />
          <XAxis dataKey="month" tick={{ fontWeight: 700, fontSize: 12 }} />
          <YAxis tick={{ fontWeight: 700, fontSize: 12 }} tickFormatter={(v) => v.toLocaleString()} />
          <Tooltip formatter={(value: number) => value.toLocaleString()} />
          <Legend wrapperStyle={{ fontWeight: 700 }} />
          <Bar dataKey="income" name="Income" fill="#22C55E" stroke="#000" strokeWidth={2} />
          <Bar dataKey="expense" name="Expense" fill="#EF4444" stroke="#000" strokeWidth={2} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
