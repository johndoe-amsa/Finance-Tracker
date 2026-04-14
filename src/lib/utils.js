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

export function getNextBillingDate(sub) {
  if (!sub.is_active) return null
  if (sub.end_date && new Date(sub.end_date + 'T00:00:00') < new Date()) return null

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const startDate = new Date(sub.start_date + 'T00:00:00')

  if (sub.frequency === 'monthly') {
    let year = today.getFullYear()
    let month = today.getMonth()

    const clampDay = (y, m) => Math.min(sub.billing_day, new Date(y, m + 1, 0).getDate())

    let candidate = new Date(year, month, clampDay(year, month))
    if (candidate < today) {
      month++
      if (month > 11) { month = 0; year++ }
      candidate = new Date(year, month, clampDay(year, month))
    }
    if (candidate < startDate) {
      let sY = startDate.getFullYear()
      let sM = startDate.getMonth()
      candidate = new Date(sY, sM, clampDay(sY, sM))
      if (candidate < startDate) {
        sM++
        if (sM > 11) { sM = 0; sY++ }
        candidate = new Date(sY, sM, clampDay(sY, sM))
      }
    }
    if (sub.end_date && candidate > new Date(sub.end_date + 'T00:00:00')) return null
    return candidate
  }

  if (sub.frequency === 'yearly') {
    const startMonth = startDate.getMonth()
    let year = today.getFullYear()
    const clampDay = (y) => Math.min(sub.billing_day, new Date(y, startMonth + 1, 0).getDate())

    let candidate = new Date(year, startMonth, clampDay(year))
    if (candidate < today) {
      year++
      candidate = new Date(year, startMonth, clampDay(year))
    }
    if (candidate < startDate) candidate = startDate
    if (sub.end_date && candidate > new Date(sub.end_date + 'T00:00:00')) return null
    return candidate
  }

  return null
}
