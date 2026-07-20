export type ApplicationStatus =
  | 'applied'
  | 'screen'
  | 'technical'
  | 'offer'
  | 'rejected'

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

export interface Reminder {
  id: string
  application_id: string
  remind_at: string
  sent_at: string | null
  message: string | null
}

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  applied: 'Applied',
  screen: 'Recruiter Screen',
  technical: 'Technical',
  offer: 'Offer',
  rejected: 'Rejected',
}

export const STATUS_ORDER: ApplicationStatus[] = [
  'applied',
  'screen',
  'technical',
  'offer',
  'rejected',
]