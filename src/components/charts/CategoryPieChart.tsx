import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts'
import type { CategoryExpense } from '../../types/dashboard'

const COLORS = ['#FACC15', '#EF4444', '#22C55E', '#3B82F6', '#A855F7']

interface Props {
  data: CategoryExpense[]
}

export function CategoryPieChart({ data }: Props) {
  return (
    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_#000] p-4">
      <h2 className="text-lg font-black mb-4">Top Expense Categories</h2>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="total"
            nameKey="categoryName"
            cx="50%"
            cy="50%"
            outerRadius={100}
            stroke="#000"
            strokeWidth={2}
            label={({ categoryName, percentage }) =>
              `${categoryName} (${percentage.toFixed(1)}%)`
            }
            labelLine={false}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => value.toLocaleString()} />
          <Legend
            formatter={(value) => <span style={{ fontWeight: 700 }}>{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
