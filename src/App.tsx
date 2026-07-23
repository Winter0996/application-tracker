import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import ApplicationForm from './components/ApplicationForm'
import ApplicationList from './components/ApplicationList'
import Analytics from './components/Analytics'
import Sidebar, { type Page } from './components/Sidebar'
import type { Session } from '@supabase/supabase-js'
import type { Application, Reminder } from './lib/types'

type WorkspaceRole = 'owner' | 'advisor' | 'member'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)
  const [role, setRole] = useState<WorkspaceRole | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [profileMap, setProfileMap] = useState<Record<string, string>>({})
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [page, setPage] = useState<Page>('applications')

  useEffect(() => {
    const stored = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (stored === 'dark' || (!stored && prefersDark)) {
      document.documentElement.classList.add('dark')
    }

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
        setReminders([])
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
      await loadApplications()
      await loadProfiles()
      await loadReminders()
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

  async function loadReminders() {
    const { data, error } = await supabase.from('reminders').select('*')

    if (error) {
      console.error('Failed to load reminders:', error)
      return
    }

    setReminders(data as Reminder[])
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

  if (loading)
    return (
      <p className="text-center mt-20 text-gray-500 dark:text-gray-400">
        Loading...
      </p>
    )

  if (!session) return <Auth />

  const isAdvisor = role === 'advisor'

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        currentPage={page}
        onNavigate={setPage}
        userEmail={session.user.email ?? ''}
        isAdvisor={isAdvisor}
        onSignOut={() => supabase.auth.signOut()}
        workspaceId={workspaceId as string}
      />

        <main className="flex-1 w-full p-4 sm:p-6 md:p-8 max-w-4xl overflow-x-auto">
        {workspaceId ? (
          <>
            {page === 'analytics' && <Analytics applications={applications} />}

            {page === 'applications' && (
              <>
                <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                  Applications
                </h2>
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
                  reminders={reminders}
                  onReminderChanged={loadReminders}
                />
              </>
            )}
          </>
        ) : (
          <p className="text-gray-500 dark:text-gray-400">
            Setting up your workspace...
          </p>
        )}
      </main>
    </div>
  )
}

export default App