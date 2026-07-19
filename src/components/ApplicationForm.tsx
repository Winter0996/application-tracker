import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface Props {
  workspaceId: string
  userId: string
  onAdded: () => void
}

export default function ApplicationForm({ workspaceId, userId, onAdded }: Props) {
  const [company, setCompany] = useState('')
  const [role, setRole] = useState('')
  const [appliedDate, setAppliedDate] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: insertError } = await supabase.from('applications').insert({
      workspace_id: workspaceId,
      owner_user_id: userId,
      company,
      role,
      applied_date: appliedDate,
      status: 'applied',
    })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setCompany('')
    setRole('')
    setLoading(false)
    onAdded()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-2 mb-6 items-end">
      <div className="flex flex-col">
        <label className="text-sm text-gray-600">Company</label>
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="border rounded px-3 py-2"
          required
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm text-gray-600">Role</label>
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border rounded px-3 py-2"
          required
        />
      </div>
      <div className="flex flex-col">
        <label className="text-sm text-gray-600">Applied date</label>
        <input
          type="date"
          value={appliedDate}
          onChange={(e) => setAppliedDate(e.target.value)}
          className="border rounded px-3 py-2"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white rounded px-4 py-2 disabled:opacity-50"
      >
        {loading ? 'Adding...' : 'Add application'}
      </button>
      {error && <p className="text-red-600 text-sm w-full">{error}</p>}
    </form>
  )
}