import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { Application } from '../lib/types'
import { STATUS_LABELS, STATUS_ORDER } from '../lib/types'

interface Props {
  applications: Application[]
}

export default function Analytics({ applications }: Props) {
  const total = applications.length

  const statusCounts = STATUS_ORDER.map((status) => ({
    status: STATUS_LABELS[status],
    count: applications.filter((a) => a.status === status).length,
  }))

  const respondedCount = applications.filter((a) => a.status !== 'applied').length
  const interviewCount = applications.filter(
    (a) => a.status === 'technical' || a.status === 'offer'
  ).length
  const offerCount = applications.filter((a) => a.status === 'offer').length

  const responseRate = total > 0 ? Math.round((respondedCount / total) * 100) : 0
  const interviewRate = total > 0 ? Math.round((interviewCount / total) * 100) : 0
  const offerRate = total > 0 ? Math.round((offerCount / total) * 100) : 0

  if (total === 0) {
    return (
      <div className="mb-8 p-4 border rounded-lg text-gray-500">
        Add a few applications to see your analytics here.
      </div>
    )
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-3">Analytics</h2>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Response rate" value={`${responseRate}%`} />
        <StatCard label="Interview rate" value={`${interviewRate}%`} />
        <StatCard label="Offer rate" value={`${offerRate}%`} />
      </div>

      <div className="h-64 border rounded-lg p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={statusCounts}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="status" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#000000" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border rounded-lg p-4 text-center">
      <p className="text-2xl font-semibold">{value}</p>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  )
}