import { db } from './supabase'

// Module-level guard: prevents two concurrent invocations (e.g. a fast
// session change that re-fires the AuthGate effect, or two tabs within
// the same JS context) from racing and inserting duplicate transactions.
let isGenerating = false

const pad = (n) => String(n).padStart(2, '0')

// Returns the "YYYY-MM" prefix for a YYYY-MM-DD date string.
const monthKey = (dateStr) => dateStr.slice(0, 7)

/**
 * Backfills missing auto-transactions for every active subscription, one
 * per month from the subscription's start month up to and including the
 * current month.
 *
 * - Transactions are always dated on the 1st of the month.
 * - Yearly subscriptions only fire in their anniversary month.
 * - `end_date` is inclusive at month granularity: an end_date in April 2026
 *   still produces the April 2026 transaction.
 * - Deduplication is done at month granularity (one auto-tx per sub per
 *   month), so legacy transactions dated on arbitrary days are preserved.
 */
export async function generateMissingSubscriptionTransactions() {
  if (isGenerating) return
  isGenerating = true
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth() // 0-11

    const { data: { user }, error: userError } = await db.auth.getUser()
    if (userError) throw new Error(`Impossible de récupérer l'utilisateur : ${userError.message}`)
    if (!user) return

    const { data: subs, error: subError } = await db
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (subError) throw new Error(`Impossible de charger les abonnements : ${subError.message}`)
    if (!subs || subs.length === 0) return

    // Find the earliest start month across all active subscriptions so we
    // can fetch existing auto-transactions in a single query.
    let earliestStart = null
    for (const sub of subs) {
      if (!sub.start_date) continue
      if (!earliestStart || sub.start_date < earliestStart) {
        earliestStart = sub.start_date
      }
    }
    if (!earliestStart) return

    const earliestFirstOfMonth = monthKey(earliestStart) + '-01'
    const lastDay = new Date(currentYear, currentMonth + 1, 0).getDate()
    const endOfCurrentMonth = `${currentYear}-${pad(currentMonth + 1)}-${pad(lastDay)}`

    const { data: existingTx, error: txError } = await db
      .from('transactions')
      .select('subscription_id, date')
      .eq('user_id', user.id)
      .eq('is_auto', true)
      .gte('date', earliestFirstOfMonth)
      .lte('date', endOfCurrentMonth)

    if (txError) throw new Error(`Impossible de charger les transactions : ${txError.message}`)

    // Key = "sub_id::YYYY-MM" so we dedup at the month level. This lets us
    // coexist with legacy transactions that were generated on arbitrary
    // days (e.g. the old billing_day logic).
    const existingKeys = new Set(
      (existingTx || []).map((t) => `${t.subscription_id}::${monthKey(t.date)}`),
    )

    const toInsert = []

    for (const sub of subs) {
      if (!sub.start_date) continue

      const [startY, startM1] = sub.start_date.split('-').map(Number)
      const startMonth0 = startM1 - 1 // 0-11

      const endCapMonth = sub.end_date ? monthKey(sub.end_date) : null

      let y = startY
      let m = startMonth0 // 0-11

      while (y < currentYear || (y === currentYear && m <= currentMonth)) {
        const yearMonth = `${y}-${pad(m + 1)}`

        if (endCapMonth && yearMonth > endCapMonth) break

        const fires =
          sub.frequency === 'monthly' ||
          (sub.frequency === 'yearly' && m === startMonth0)

        if (fires) {
          const key = `${sub.id}::${yearMonth}`
          if (!existingKeys.has(key)) {
            toInsert.push({
              type: sub.type,
              amount: sub.amount,
              title: sub.name,
              category_id: sub.category_id,
              subscription_id: sub.id,
              date: `${yearMonth}-01`,
              is_auto: true,
              is_verified: false,
              user_id: user.id,
            })
            existingKeys.add(key)
          }
        }

        // advance one month
        m++
        if (m > 11) { m = 0; y++ }
      }
    }

    if (toInsert.length === 0) return

    // One bulk insert is both faster and atomic. If it fails (e.g. a
    // unique constraint is hit because another tab raced us), we log and
    // leave it alone — the next run will re-evaluate.
    const { error: insertError } = await db.from('transactions').insert(toInsert)
    if (insertError) {
      console.error(
        '[Abonnements] Échec de la génération en lot :',
        insertError.message,
      )
    }
  } finally {
    isGenerating = false
  }
}
