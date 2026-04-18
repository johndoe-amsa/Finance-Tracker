export function formatAmount(amount) {
  return parseFloat(amount).toLocaleString('fr-CH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + ' CHF'
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
// or null if the sub is inactive / has ended. The day of the month comes
// from billing_day, clamped to the last day of the month when the month
// is shorter than billing_day (e.g. 31 -> 28 in February).
export function getNextBillingDate(sub) {
  if (!sub.is_active) return null
  if (!sub.start_date) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const startDate = new Date(sub.start_date + 'T00:00:00')
  const endDate = sub.end_date ? new Date(sub.end_date + 'T00:00:00') : null
  const billingDay = Number.isFinite(sub.billing_day) ? sub.billing_day : 1

  const clampDay = (y, m) => Math.min(billingDay, new Date(y, m + 1, 0).getDate())

  let candidate
  if (sub.frequency === 'monthly') {
    let y = today.getFullYear()
    let m = today.getMonth()
    candidate = new Date(y, m, clampDay(y, m))
    if (candidate < today) {
      m++
      if (m > 11) { m = 0; y++ }
      candidate = new Date(y, m, clampDay(y, m))
    }
  } else if (sub.frequency === 'yearly') {
    const startMonth = startDate.getMonth()
    let y = today.getFullYear()
    candidate = new Date(y, startMonth, clampDay(y, startMonth))
    if (candidate < today) {
      y++
      candidate = new Date(y, startMonth, clampDay(y, startMonth))
    }
  } else {
    return null
  }

  // Never earlier than the start date — snap forward into the subscription
  // window if necessary.
  if (candidate < startDate) {
    const sy = startDate.getFullYear()
    const sm = startDate.getMonth()
    candidate = new Date(sy, sm, clampDay(sy, sm))
    if (candidate < startDate) {
      const nm = sm + 1
      const ny = nm > 11 ? sy + 1 : sy
      const nm0 = nm > 11 ? 0 : nm
      candidate = new Date(ny, nm0, clampDay(ny, nm0))
    }
  }
  if (endDate && candidate > endDate) return null
  return candidate
}
