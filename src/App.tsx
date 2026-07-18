import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import type { Session } from '@supabase/supabase-js'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <p className="text-center mt-20">Loading...</p>

  if (!session) return <Auth />

  return (
    <div className="max-w-2xl mx-auto mt-20 p-6">
      <h1 className="text-xl font-semibold mb-4">Logged in as {session.user.email}</h1>
      <button
        onClick={() => supabase.auth.signOut()}
        className="bg-black text-white rounded px-3 py-2"
      >
        Sign out
      </button>
    </div>
  )
}

export default App