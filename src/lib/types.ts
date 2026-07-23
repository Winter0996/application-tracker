// Status values an application can be in, in pipeline order
export type ApplicationStatus =
  | 'applied'
  | 'screen'
  | 'technical'
  | 'offer'
  | 'rejected'

// Mirrors shape of a row in the `applications` table
export interface Application {
  id: string
  workspace_id: string
  owner_user_id: string
  company: string
  role: string
  status: ApplicationStatus
  applied_date: string
  notes: string | null
  created_at: string
}

// Mirrors shape of a row in the `reminders` table
export interface Reminder {
  id: string
  application_id: string
  remind_at: string
  sent_at: string | null
  message: string | null
}

// labels for each status, used in dropdowns and charts
export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  screen: 'Recruiter Screen',
  technical: 'Technical',
  offer: 'Offer',
  rejected: 'Rejected',
}

// pipeline order, used for dropdown options and chart ordering
export const STATUS_ORDER: ApplicationStatus[] = [
  'applied',
  'screen',
  'technical',
  'offer',
  'rejected',
]