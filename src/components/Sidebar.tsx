import { useState } from 'react'
import ThemeToggle from './ThemeToggle'

export type Page = 'applications' | 'analytics'

interface Props {
  currentPage: Page
  onNavigate: (page: Page) => void
  userEmail: string
  isAdvisor: boolean
  onSignOut: () => void
  workspaceId: string 
}

export default function Sidebar({
  currentPage,
  onNavigate,
  userEmail,
  isAdvisor,
  onSignOut,
  workspaceId,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleNavigate(page: Page) {
    onNavigate(page)
    setMobileOpen(false)
  }

  function copyWorkspaceId() {
    navigator.clipboard.writeText(workspaceId)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 sticky top-0 z-30">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          ApplyFlow
        </h1>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="p-2 -mr-2 text-gray-700 dark:text-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar: slide-in drawer on mobile, static column on desktop */}
      <div
        className={`
          fixed md:sticky top-0 left-0 z-50
          w-64 md:w-56 h-screen
          flex flex-col
          border-r border-gray-200 dark:border-gray-800
          bg-white dark:bg-gray-950
          px-3 py-4
          transition-transform duration-200
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        <div className="flex items-center justify-between px-3 mb-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              ApplyFlow
            </h1>
            {isAdvisor && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Advisor view
              </p>
            )}
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
            className="md:hidden p-1 text-gray-500 dark:text-gray-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <button
          onClick={copyWorkspaceId}
          title={workspaceId}
          className="text-left mx-3 mb-4 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Workspace ID
          </p>
          <p className="text-xs font-mono text-gray-700 dark:text-gray-300 truncate max-w-45">
            {copied ? 'Copied!' : workspaceId}
          </p>
        </button>

        <nav className="flex flex-col gap-1 flex-1">
          <NavButton
            label="Applications"
            active={currentPage === 'applications'}
            onClick={() => handleNavigate('applications')}
          />
          <NavButton
            label="Analytics"
            active={currentPage === 'analytics'}
            onClick={() => handleNavigate('analytics')}
          />
        </nav>

        <div className="flex flex-col gap-1 pt-3 border-t border-gray-200 dark:border-gray-800">
          <ThemeToggle />
          <p className="text-xs text-gray-500 dark:text-gray-400 px-3 pt-2 truncate">
            {userEmail}
          </p>
          <button
            onClick={onSignOut}
            className="text-sm text-left text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            Sign out
          </button>
        </div>
      </div>
    </>
  )
}

function NavButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`text-left text-sm px-3 py-2 rounded-lg ${
        active
          ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
      }`}
    >
      {label}
    </button>
  )
}