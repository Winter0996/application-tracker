import { createClient } from '@supabase/supabase-js'

export const config = {
  runtime: 'nodejs',
}

interface DueReminder {
  id: string
  message: string | null
  remind_at: string
  applications: {
    company: string
    role: string
    owner_user_id: string
  }
}

export default async function handler(req: Request): Promise<Response> {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: dueReminders, error: fetchError } = await supabase
    .from('reminders')
    .select('id, message, remind_at, applications(company, role, owner_user_id)')
    .lte('remind_at', new Date().toISOString())
    .is('sent_at', null)

  if (fetchError) {
    return Response.json({ error: fetchError.message }, { status: 500 })
  }

  if (!dueReminders || dueReminders.length === 0) {
    return Response.json({ sent: 0, message: 'No due reminders' })
  }

  let sentCount = 0
  const errors: string[] = []

  for (const reminder of dueReminders as unknown as DueReminder[]) {
    const application = reminder.applications

    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', application.owner_user_id)
      .single()

    if (!profile || !profile.email) {
      errors.push('No profile email found for reminder ' + reminder.id)
      continue
    }

    const subjectLine = 'Reminder: ' + application.company + ' - ' + application.role

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'ApplyFlow <onboarding@resend.dev>',
        to: profile.email,
        subject: subjectLine,
        text: reminder.message || 'Follow up on this application.',
      }),
    })

    if (!emailRes.ok) {
      const errText = await emailRes.text()
      errors.push('Failed to send reminder ' + reminder.id + ': ' + errText)
      continue
    }

    await supabase
      .from('reminders')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', reminder.id)

    sentCount++
  }

  return Response.json({ sent: sentCount, errors: errors })
}