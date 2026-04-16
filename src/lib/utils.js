export function formatAmount(amount) {
  return parseFloat(amount).toFixed(2) + ' CHF'
}

export function formatDate(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('fr-CH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function formatDateLabel(dateStr) {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.getTime() === today.getTime()) return "Aujourd'hui"
  if (date.getTime() === yesterday.getTime()) return 'Hier'
  return date.toLocaleDateString('fr-CH', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function formatMonthYear(year, month) {
  return new Date(year, month - 1, 1).toLocaleDateString('fr-CH', {
    month: 'long',
    year: 'numeric',
  })
}

export function todayISO() {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

export function calculateMonthTotals(transactions) {
  let totalIncome = 0
  let totalExpense = 0
  for (const t of transactions) {
    if (t.type === 'income') totalIncome += parseFloat(t.amount)
    else totalExpense += parseFloat(t.amount)
  }
  return { totalIncome, totalExpense, balance: totalIncome - totalExpense }
}

export function calculateExpensesByCategory(transactions) {
  const result = {}
  for (const t of transactions) {
    if (t.type === 'expense' && t.category_id) {
      result[t.category_id] = (result[t.category_id] || 0) + parseFloat(t.amount)
    }
  }
  return result
}

export function calculateMonthlyTotal(subscriptions) {
  let total = 0
  for (const sub of subscriptions) {
    if (!sub.is_active) continue
    const amount = parseFloat(sub.amount)
    const sign = sub.type === 'expense' ? 1 : -1
    total += sign * (sub.frequency === 'monthly' ? amount : amount / 12)
  }
  return total
}

// Déduit le kind effectif d'un enregistrement (rétro-compat avec les données
// créées avant l'ajout de la colonne `kind`).
export function subscriptionKind(sub) {
  if (sub?.kind) return sub.kind
  return sub?.type === 'income' ? 'income' : 'subscription'
}

// Convertit un kind en type income/expense pour les calculs et la DB.
export function kindToType(kind) {
  return kind === 'income' ? 'income' : 'expense'
}

export const KIND_LABELS = {
  subscription: 'Abonnement',
  fixed_expense: 'Charge fixe',
  income: 'Revenu',
}

// Renvoie le coût mensuel lissé pour un seul kind (valeur absolue).
// Utile pour afficher "Abonnements : 45 CHF/mois" indépendamment du signe.
export function monthlyAmountByKind(subscriptions, targetKind) {
  let total = 0
  for (const sub of subscriptions) {
    if (!sub.is_active) continue
    if (subscriptionKind(sub) !== targetKind) continue
    const amount = parseFloat(sub.amount)
    total += sub.frequency === 'monthly' ? amount : amount / 12
  }
  return total
}

export function interactiveProps(onClick, ariaLabel) {
  return {
    role: 'button',
    tabIndex: 0,
    'aria-label': ariaLabel,
    onKeyDown: (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        onClick()
      }
    },
  }
}

// Returns the Date of the next expected auto-transaction for a subscription,
// or null if the sub is inactive / has ended. Transactions are always dated
// on the 1st of the month, so the "next" one is the first of the next month
// (for monthly) or the first of the anniversary month next year (for yearly)
// once the current month has already produced its transaction.
export function getNextBillingDate(sub) {
  if (!sub.is_active) return null
  if (!sub.start_date) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const startDate = new Date(sub.start_date + 'T00:00:00')
  const endDate = sub.end_date ? new Date(sub.end_date + 'T00:00:00') : null

  // end_date is inclusive at the month level — normalize to the 1st of
  // the end month for the comparison below.
  if (endDate && endDate < firstOfThisMonth) return null

  let candidate
  if (sub.frequency === 'monthly') {
    // Current month is already covered by the generator, so next is the
    // 1st of next month.
    candidate = new Date(today.getFullYear(), today.getMonth() + 1, 1)
  } else if (sub.frequency === 'yearly') {
    const startMonth = startDate.getMonth()
    let year = today.getFullYear()
    candidate = new Date(year, startMonth, 1)
    if (candidate <= firstOfThisMonth) {
      candidate = new Date(year + 1, startMonth, 1)
    }
  } else {
    return null
  }

  if (candidate < startDate) {
    candidate = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
  }
  if (endDate && candidate > endDate) return null
  return candidate
}
