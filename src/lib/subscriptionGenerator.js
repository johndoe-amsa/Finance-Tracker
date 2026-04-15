import { db } from './supabase'

// Module-level guard: prevents two concurrent invocations (e.g. a fast
// session change that re-fires the AuthGate effect, or two tabs within
// the same JS context) from racing and inserting duplicate transactions.
let isGenerating = false

export async function generateMissingSubscriptionTransactions() {
  if (isGenerating) return
  isGenerating = true
  try {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() // 0-based
    const dayOfMonth = today.getDate()
    const lastDay = new Date(year, month + 1, 0).getDate()

    const pad = (n) => String(n).padStart(2, '0')
    const todayStr = `${year}-${pad(month + 1)}-${pad(dayOfMonth)}`
    const firstOfMonth = `${year}-${pad(month + 1)}-01`
    const endOfMonth = `${year}-${pad(month + 1)}-${pad(lastDay)}`

    // Fetch the user first so every subsequent query can be scoped
    // explicitly — we do not want to rely solely on RLS for correctness.
    const { data: { user }, error: userError } = await db.auth.getUser()
    if (userError) throw new Error(`Impossible de récupérer l'utilisateur : ${userError.message}`)
    if (!user) return

    const { data: subs, error: subError } = await db
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .lte('start_date', todayStr)

    if (subError) throw new Error(`Impossible de charger les abonnements : ${subError.message}`)
    if (!subs || subs.length === 0) return

    const { data: existingTx, error: txError } = await db
      .from('transactions')
      .select('subscription_id, date')
      .eq('user_id', user.id)
      .eq('is_auto', true)
      .gte('date', firstOfMonth)
      .lte('date', endOfMonth)

    if (txError) throw new Error(`Impossible de charger les transactions : ${txError.message}`)

    // Dedup by the composite key (subscription_id, date) rather than the
    // subscription id alone. Belt-and-suspenders: today the scope is one
    // month, so the collision set is tiny, but this keeps the check
    // correct if the scope ever widens.
    const existingKeys = new Set(
      (existingTx || []).map((t) => `${t.subscription_id}::${t.date}`),
    )

    for (const sub of subs) {
      if (sub.end_date && new Date(sub.end_date + 'T00:00:00') < today) continue

      let shouldInsert = false
      let txDate = null

      if (sub.frequency === 'monthly') {
        if (sub.billing_day > dayOfMonth) continue
        const txDay = Math.min(sub.billing_day, lastDay)
        txDate = `${year}-${pad(month + 1)}-${pad(txDay)}`
        shouldInsert = true
      } else if (sub.frequency === 'yearly') {
        const startDate = new Date(sub.start_date + 'T00:00:00')
        if (month !== startDate.getMonth()) continue
        if (sub.billing_day > dayOfMonth) continue
        const txDay = Math.min(sub.billing_day, lastDay)
        txDate = `${year}-${pad(month + 1)}-${pad(txDay)}`
        shouldInsert = true
      }

      if (!shouldInsert || !txDate) continue
      if (existingKeys.has(`${sub.id}::${txDate}`)) continue

      const { error: insertError } = await db.from('transactions').insert({
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

      if (insertError) {
        // Don't abort the whole loop on one failure — log and keep going.
        console.error(
          `[Abonnements] Échec de l'insertion pour "${sub.name}" :`,
          insertError.message,
        )
        continue
      }

      // Track what we just inserted so a same-run re-evaluation would skip it.
      existingKeys.add(`${sub.id}::${txDate}`)
    }
  } finally {
    isGenerating = false
  }
}
