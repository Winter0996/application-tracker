import { useState } from 'react'
import { supabase } from '../lib/supabase'
import ThemeToggle from './ThemeToggle'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(true)
  // 'new' creates a fresh workspaces (becomes owner); 'existing' joins one by ID (becomes advisor)
  const [joinMode, setJoinMode] = useState<'new' | 'existing'>('new')
  const [existingWorkspaceId, setExistingWorkspaceId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setLoading(false)
      return
    }

    if (joinMode === 'existing') {
      if (!existingWorkspaceId.trim()) {
        setError('Please enter a workspace ID to join.')
        setLoading(false)
        return
      }

      // New members joining an existing workspace always come in as advisor
      const { error: memberError } = await supabase.from('workspace_members').insert({
        workspace_id: existingWorkspaceId.trim(),
        user_id: data.user.id,
        role: 'advisor',
      })

      if (memberError) {
        setError(`Could not join workspace: ${memberError.message}`)
        setLoading(false)
        return
      }
    } else {
      // Create a brand-new workspace, then add this user as its owner
      const { data: workspace, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({ name: `${email}'s Workspace` })
        .select()
        .single()

      if (workspaceError) {
        setError(`Signed up, but workspace creation failed: ${workspaceError.message}`)
        setLoading(false)
        return
      }

      const { error: memberError } = await supabase.from('workspace_members').insert({
        workspace_id: workspace.id,
        user_id: data.user.id,
        role: 'owner',
      })

      if (memberError) {
        setError(`Workspace created, but membership failed: ${memberError.message}`)
        setLoading(false)
        return
      }
    }

    setLoading(false)
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(signInError.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">ApplyFlow</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track your job search, all in one place
          </p>
        </div>

        <div className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {isSignUp ? 'Create an account' : 'Log in'}
            </h2>
            <ThemeToggle compact />
          </div>

          {isSignUp && (
            <div className="flex gap-2 mb-4 text-sm">
              <button
                type="button"
                onClick={() => setJoinMode('new')}
                className={`flex-1 border rounded-lg px-2 py-1.5 transition-colors ${
                  joinMode === 'new'
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                    : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                New workspace
              </button>
              <button
                type="button"
                onClick={() => setJoinMode('existing')}
                className={`flex-1 border rounded-lg px-2 py-1.5 transition-colors ${
                  joinMode === 'existing'
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                    : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                Join existing
              </button>
            </div>
          )}

          <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
              required
              minLength={6}
            />
            {isSignUp && joinMode === 'existing' && (
              <input
                type="text"
                placeholder="Workspace ID to join"
                value={existingWorkspaceId}
                onChange={(e) => setExistingWorkspaceId(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
                required
              />
            )}
            {error && <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg px-3 py-2 font-medium disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {loading ? 'Loading...' : isSignUp ? 'Sign up' : 'Log in'}
            </button>
          </form>
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-blue-600 dark:text-blue-400 mt-4 underline block mx-auto"
          >
            {isSignUp ? 'Already have an account? Log in' : "Need an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  )
}