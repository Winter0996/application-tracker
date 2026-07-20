import { supabase } from '../lib/supabase'
import type { Application, ApplicationStatus } from '../lib/types'
import { STATUS_LABELS, STATUS_ORDER } from '../lib/types'

interface Props {
  applications: Application[]
  onChanged: () => void
  isAdvisor: boolean
  profileMap: Record<string, string>
}

export default function ApplicationList({
  applications,
  onChanged,
  isAdvisor,
  profileMap,
}: Props) {
  async function updateStatus(id: string, status: ApplicationStatus) {
    const { error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', id)

    if (error) {
      alert(`Failed to update status: ${error.message}`)
      return
    }

    onChanged()
  }

  if (applications.length === 0) {
    return <p className="text-gray-500">No applications yet. Add your first one above.</p>
  }

  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="text-left border-b">
          {isAdvisor && <th className="py-2">Applicant</th>}
          <th className="py-2">Company</th>
          <th className="py-2">Role</th>
          <th className="py-2">Applied</th>
          <th className="py-2">Status</th>
        </tr>
      </thead>
      <tbody>
        {applications.map((app) => (
          <tr key={app.id} className="border-b">
            {isAdvisor && (
              <td className="py-2 text-sm text-gray-600">
                {profileMap[app.owner_user_id] || 'Unknown'}
              </td>
            )}
            <td className="py-2">{app.company}</td>
            <td className="py-2">{app.role}</td>
            <td className="py-2">{app.applied_date}</td>
            <td className="py-2">
              <select
                value={app.status}
                onChange={(e) =>
                  updateStatus(app.id, e.target.value as ApplicationStatus)
                }
                className="border rounded px-2 py-1"
              >
                {STATUS_ORDER.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}