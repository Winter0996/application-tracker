import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(true)
  const [joinMode, setJoinMode] = useState<'new' | 'existing'>('new')
  const [existingWorkspaceId, setExistingWorkspaceId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

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

      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
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

      const { error: memberError } = await supabase
        .from('workspace_members')
        .insert({
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

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
    }

    setLoading(false)
  }

  return (
    <div className="max-w-sm mx-auto mt-20 p-6 border rounded-lg">
      <h1 className="text-xl font-semibold mb-4">
        {isSignUp ? 'Create an account' : 'Log in'}
      </h1>

      {isSignUp && (
        <div className="flex gap-2 mb-4 text-sm">
          <button
            type="button"
            onClick={() => setJoinMode('new')}
            className={`flex-1 border rounded px-2 py-1 ${
              joinMode === 'new' ? 'bg-black text-white' : ''
            }`}
          >
            New workspace
          </button>
          <button
            type="button"
            onClick={() => setJoinMode('existing')}
            className={`flex-1 border rounded px-2 py-1 ${
              joinMode === 'existing' ? 'bg-black text-white' : ''
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
          className="w-full border rounded px-3 py-2"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2"
          required
          minLength={6}
        />
        {isSignUp && joinMode === 'existing' && (
          <input
            type="text"
            placeholder="Workspace ID to join"
            value={existingWorkspaceId}
            onChange={(e) => setExistingWorkspaceId(e.target.value)}
            className="w-full border rounded px-3 py-2"
            required
          />
        )}
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white rounded px-3 py-2 disabled:opacity-50"
        >
          {loading ? 'Loading...' : isSignUp ? 'Sign up' : 'Log in'}
        </button>
      </form>
      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="text-sm text-blue-600 mt-3 underline"
      >
        {isSignUp ? 'Already have an account? Log in' : "Need an account? Sign up"}
      </button>
    </div>
  )
}