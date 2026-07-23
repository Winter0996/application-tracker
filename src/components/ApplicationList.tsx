import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Application, ApplicationStatus, Reminder } from '../lib/types'
import { STATUS_LABELS, STATUS_ORDER } from '../lib/types'

interface Props {
  applications: Application[]
  onChanged: () => void
  isAdvisor: boolean
  profileMap: Record<string, string>
  reminders: Reminder[]
  onReminderChanged: () => void
}

export default function ApplicationList({
  applications,
  onChanged,
  isAdvisor,
  profileMap,
  reminders,
  onReminderChanged,
}: Props) {
  const [reminderFormOpenFor, setReminderFormOpenFor] = useState<string | null>(null)
  const [reminderDate, setReminderDate] = useState('')
  const [reminderMessage, setReminderMessage] = useState('')

  async function updateStatus(id: string, status: ApplicationStatus) {
    const { error } = await supabase.from('applications').update({ status }).eq('id', id)
    if (error) {
      alert(`Failed to update status: ${error.message}`)
      return
    }
    onChanged()
  }

  async function addReminder(applicationId: string) {
    if (!reminderDate) return
    const { error } = await supabase.from('reminders').insert({
      application_id: applicationId,
      remind_at: new Date(reminderDate).toISOString(),
      message: reminderMessage || 'Follow up on this application',
    })
    if (error) {
      alert(`Failed to set reminder: ${error.message}`)
      return
    }
    setReminderFormOpenFor(null)
    setReminderDate('')
    setReminderMessage('')
    onReminderChanged()
  }

  function upcomingReminderFor(applicationId: string) {
    return reminders.find((r) => r.application_id === applicationId && !r.sent_at)
  }

  if (applications.length === 0) {
    return <p className="text-gray-500 dark:text-gray-400">No applications yet. Add your first one above.</p>
  }

  return (
    <div className="overflow-x-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg">
      <table className="w-full border-collapse min-w-160">
        <thead>
          <tr className="text-left border-b border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300">
            {isAdvisor && <th className="py-3 px-4">Applicant</th>}
            <th className="py-3 px-4">Company</th>
            <th className="py-3 px-4">Role</th>
            <th className="py-3 px-4">Applied</th>
            <th className="py-3 px-4">Status</th>
            {!isAdvisor && <th className="py-3 px-4">Reminder</th>}
          </tr>
        </thead>
        <tbody className="text-gray-900 dark:text-gray-100">
          {applications.map((app) => {
            const reminder = upcomingReminderFor(app.id)
            return (
              <tr key={app.id} className="border-b border-gray-100 dark:border-gray-800 align-top">
                {isAdvisor && (
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                    {profileMap[app.owner_user_id] || 'Unknown'}
                  </td>
                )}
                <td className="py-3 px-4">{app.company}</td>
                <td className="py-3 px-4">{app.role}</td>
                <td className="py-3 px-4">{app.applied_date}</td>
                <td className="py-3 px-4">
                  <select
                    value={app.status}
                    onChange={(e) => updateStatus(app.id, e.target.value as ApplicationStatus)}
                    className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 rounded-lg px-2 py-1"
                  >
                    {STATUS_ORDER.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </td>
                {!isAdvisor && (
                  <td className="py-3 px-4">
                    {reminder ? (
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(reminder.remind_at).toLocaleDateString()} — {reminder.message}
                      </span>
                    ) : reminderFormOpenFor === app.id ? (
                      <div className="flex flex-col gap-1">
                        <input
                          type="date"
                          value={reminderDate}
                          onChange={(e) => setReminderDate(e.target.value)}
                          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 rounded-lg px-2 py-1 text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Message (optional)"
                          value={reminderMessage}
                          onChange={(e) => setReminderMessage(e.target.value)}
                          className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 rounded-lg px-2 py-1 text-xs"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => addReminder(app.id)}
                            className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs rounded-lg px-2 py-1"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setReminderFormOpenFor(null)}
                            className="text-xs underline text-gray-500 dark:text-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReminderFormOpenFor(app.id)}
                        className="text-xs underline text-blue-600 dark:text-blue-400"
                      >
                        + Set reminder
                      </button>
                    )}
                  </td>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}