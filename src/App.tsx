import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import ApplicationForm from './components/ApplicationForm'
import ApplicationList from './components/ApplicationList'
import type { Session } from '@supabase/supabase-js'
import type { Application } from './lib/types'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [applications, setApplications] = useState<Application[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    async function loadWorkspaceAndApplications() {
      if (!session) {
        setWorkspaceId(null)
        setApplications([])
        return
      }
  
      const { data: memberRow, error: memberError } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .limit(1)
        .single()
  
      if (memberError || !memberRow) {
        console.error('Could not find workspace for user:', memberError)
        return
      }
  
      setWorkspaceId(memberRow.workspace_id)
      await loadApplications()
    }
  
    loadWorkspaceAndApplications()
  }, [session])
  async function loadApplications() {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to load applications:', error)
      return
    }

    setApplications(data as Application[])
  }

  if (loading) return <p className="text-center mt-20">Loading...</p>

  if (!session) return <Auth />

  return (
    <div className="max-w-3xl mx-auto mt-12 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">
          Applications for {session.user.email}
        </h1>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-sm underline text-gray-600"
        >
          Sign out
        </button>
      </div>

      {workspaceId ? (
        <>
          <ApplicationForm
            workspaceId={workspaceId}
            userId={session.user.id}
            onAdded={loadApplications}
          />
          <ApplicationList applications={applications} onChanged={loadApplications} />
        </>
      ) : (
        <p className="text-gray-500">Setting up your workspace...</p>
      )}
    </div>
  )
}

export default App