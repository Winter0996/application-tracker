import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import ApplicationForm from './components/ApplicationForm'
import ApplicationList from './components/ApplicationList'
import Analytics from './components/Analytics'
import type { Session } from '@supabase/supabase-js'
import type { Application } from './lib/types'

type WorkspaceRole = 'owner' | 'advisor' | 'member'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [role, setRole] = useState<WorkspaceRole | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [profileMap, setProfileMap] = useState<Record<string, string>>({})

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
        setRole(null)
        setApplications([])
        setProfileMap({})
        return
      }

      const { data: memberRow, error: memberError } = await supabase
      .from('workspace_members')
      .select('workspace_id, role')
      .eq('user_id', session.user.id)
      .single()

      if (memberError || !memberRow) {
        console.error('Could not find workspace for user:', memberError)
        return
      }

      setWorkspaceId(memberRow.workspace_id)
      setRole(memberRow.role as WorkspaceRole)
      console.log('Detected role:', memberRow.role, 'for workspace:', memberRow.workspace_id)
      await loadApplications()
      await loadProfiles()
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

  async function loadProfiles() {
    const { data, error } = await supabase.from('profiles').select('id, email')

    if (error) {
      console.error('Failed to load profiles:', error)
      return
    }

    const map: Record<string, string> = {}
    data.forEach((p: { id: string; email: string }) => {
      map[p.id] = p.email
    })
    setProfileMap(map)
  }

  if (loading) return <p className="text-center mt-20">Loading...</p>

  if (!session) return <Auth />

  const isAdvisor = role === 'advisor'

  return (
    <div className="max-w-3xl mx-auto mt-12 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-semibold">
            Applications {isAdvisor ? '(Advisor view)' : `for ${session.user.email}`}
          </h1>
          {workspaceId && (
            <p className="text-xs text-gray-400 mt-1">Workspace ID: {workspaceId}</p>
          )}
        </div>
        <button
          onClick={() => supabase.auth.signOut()}
          className="text-sm underline text-gray-600"
        >
          Sign out
        </button>
      </div>

      {workspaceId ? (
        <>
          <Analytics applications={applications} />
          {!isAdvisor && (
            <ApplicationForm
              workspaceId={workspaceId}
              userId={session.user.id}
              onAdded={loadApplications}
            />
          )}
          <ApplicationList
            applications={applications}
            onChanged={loadApplications}
            isAdvisor={isAdvisor}
            profileMap={profileMap}
          />
        </>
      ) : (
        <p className="text-gray-500">Setting up your workspace...</p>
      )}
    </div>
  )
}

export default App