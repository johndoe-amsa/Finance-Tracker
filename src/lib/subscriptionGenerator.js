import { db } from './supabase'

export async function generateMissingSubscriptionTransactions() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() // 0-based
  const dayOfMonth = today.getDate()
  const lastDay = new Date(year, month + 1, 0).getDate()

  const pad = (n) => String(n).padStart(2, '0')
  const firstOfMonth = `${year}-${pad(month + 1)}-01`
  const endOfMonth = `${year}-${pad(month + 1)}-${pad(lastDay)}`

  const { data: subs, error: subError } = await db
    .from('subscriptions')
    .select('*')
    .eq('is_active', true)
    .lte('start_date', today.toISOString().split('T')[0])

  if (subError || !subs) return

  const { data: existingTx } = await db
    .from('transactions')
    .select('subscription_id')
    .eq('is_auto', true)
    .gte('date', firstOfMonth)
    .lte('date', endOfMonth)

  const existingSubIds = new Set((existingTx || []).map((t) => t.subscription_id))

  const { data: { user } } = await db.auth.getUser()
  if (!user) return

  for (const sub of subs) {
    if (existingSubIds.has(sub.id)) continue
    if (sub.end_date && new Date(sub.end_date + 'T00:00:00') < today) continue

    if (sub.frequency === 'monthly') {
      if (sub.billing_day > dayOfMonth) continue

      const txDay = Math.min(sub.billing_day, lastDay)
      const txDate = `${year}-${pad(month + 1)}-${pad(txDay)}`

      await db.from('transactions').insert({
        type: sub.type,
        amount: sub.amount,
        title: sub.name,
        category_id: sub.category_id,
        subscription_id: sub.id,
        date: txDate,
        is_auto: true,
        is_verified: false,
        user_id: user.id,
      })
    }

    if (sub.frequency === 'yearly') {
      const startDate = new Date(sub.start_date + 'T00:00:00')
      if (month !== startDate.getMonth()) continue
      if (sub.billing_day > dayOfMonth) continue

      const txDay = Math.min(sub.billing_day, lastDay)
      const txDate = `${year}-${pad(month + 1)}-${pad(txDay)}`

      await db.from('transactions').insert({
        type: sub.type,
        amount: sub.amount,
        title: sub.name,
        category_id: sub.category_id,
        subscription_id: sub.id,
        date: txDate,
        is_auto: true,
        is_verified: false,
        user_id: user.id,
      })
    }
  }
}
