import {
  PieChart,
  Pie,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import type { Application, ApplicationStatus } from '../lib/types'
import { STATUS_LABELS, STATUS_ORDER } from '../lib/types'

interface Props {
  applications: Application[]
}

const STATUS_COLORS: Record<ApplicationStatus, string> = {
  applied: '#2a78d6',
  screen: '#eb6834',
  technical: '#1baf7a',
  offer: '#eda100',
  rejected: '#898781',
}

// Dashboard showing response/interview/offer rates, a pipeline breakdown donut chart,
// & a weekly application volume trend line
export default function Analytics({ applications }: Props) {
  const total = applications.length

   // Each entry carries its own `fill` color -- Recharts' Pie reads this directly per data point,
  // avoiding need for the deprecated <Cell> component
  const statusCounts = STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    count: applications.filter((a) => a.status === status).length,
    fill: STATUS_COLORS[status],
  })).filter((s) => s.count > 0)

  const respondedCount = applications.filter((a) => a.status !== 'applied').length
  const interviewCount = applications.filter(
    (a) => a.status === 'technical' || a.status === 'offer'
  ).length
  const offerCount = applications.filter((a) => a.status === 'offer').length

  const responseRate = total > 0 ? Math.round((respondedCount / total) * 100) : 0
  const interviewRate = total > 0 ? Math.round((interviewCount / total) * 100) : 0
  const offerRate = total > 0 ? Math.round((offerCount / total) * 100) : 0

  // Group applications by week (based on applied_date) for the trend line
  const weeklyMap = new Map<string, number>()
  applications.forEach((app) => {
    const date = new Date(app.applied_date)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    const key = weekStart.toISOString().split('T')[0]
    weeklyMap.set(key, (weeklyMap.get(key) || 0) + 1)
  })
  const weeklyData = Array.from(weeklyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, count]) => ({
      week: new Date(week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count,
    }))

    if (total === 0) {
      return (
        <div className="mb-8 p-4 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg text-gray-500 dark:text-gray-400">
          Add a few applications to see your analytics here.
        </div>
      )
    }
  
    return (
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">Analytics</h2>
  
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard label="Response rate" value={`${responseRate}%`} />
          <StatCard label="Interview rate" value={`${interviewRate}%`} />
          <StatCard label="Offer rate" value={`${offerRate}%`} />
        </div>
  
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Pipeline breakdown</p>
        <div className="h-56 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg p-4 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusCounts}
                dataKey="count"
                nameKey="label"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap gap-3 mb-8 text-xs text-gray-600 dark:text-gray-400">
          {statusCounts.map((entry) => (
            <span key={entry.status} className="flex items-center gap-1">
              <span
                className="w-2.5 h-2.5 rounded-sm inline-block"
                style={{ backgroundColor: STATUS_COLORS[entry.status] }}
              />
              {entry.label} ({entry.count})
            </span>
          ))}
        </div>
  
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Applications per week</p>
        <div className="h-56 border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#2a78d6"
                strokeWidth={2}
                dot={{ r: 4, fill: '#2a78d6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-lg p-4 text-center">
      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    </div>
  )
}