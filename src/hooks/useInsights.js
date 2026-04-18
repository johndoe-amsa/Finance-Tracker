import { useQuery } from '@tanstack/react-query'
import { db } from '../lib/supabase'

export function useInsights(year, month) {
  return useQuery({
    queryKey: ['insights', year, month],
    queryFn: async () => {
      // Compute prev month
      const prevYear = month === 1 ? year - 1 : year
      const prevMonth = month === 1 ? 12 : month - 1

      const pad = (n) => String(n).padStart(2, '0')

      // Current month range
      const curStart = `${year}-${pad(month)}-01`
      const curLastDay = new Date(year, month, 0).getDate()
      const curEnd = `${year}-${pad(month)}-${pad(curLastDay)}`

      // Prev month range
      const prevStart = `${prevYear}-${pad(prevMonth)}-01`
      const prevLastDay = new Date(prevYear, prevMonth, 0).getDate()
      const prevEnd = `${prevYear}-${pad(prevMonth)}-${pad(prevLastDay)}`

      const { data, error } = await db
        .from('transactions')
        .select('date, type, amount, category_id')
        .gte('date', prevStart)
        .lte('date', curEnd)

      if (error) throw error

      // Split into current / previous month
      const currentTx = []
      const prevTx = []

      for (const tx of data) {
        if (tx.date >= curStart && tx.date <= curEnd) currentTx.push(tx)
        else if (tx.date >= prevStart && tx.date <= prevEnd) prevTx.push(tx)
      }

      return { currentTx, prevTx, curLastDay, prevLastDay }
    },
  })
}

export function computeInsights(data, categories, month) {
  if (!data) return []

  const { currentTx, prevTx, curLastDay } = data
  const insights = []

  // Totals
  let curIncome = 0, curExpense = 0
  for (const tx of currentTx) {
    if (tx.type === 'income') curIncome += parseFloat(tx.amount)
    else curExpense += parseFloat(tx.amount)
  }

  let prevIncome = 0, prevExpense = 0
  for (const tx of prevTx) {
    if (tx.type === 'income') prevIncome += parseFloat(tx.amount)
    else prevExpense += parseFloat(tx.amount)
  }

  const prevMonthLabel = new Date(
    month === 1 ? new Date().getFullYear() - 1 : new Date().getFullYear(),
    (month === 1 ? 12 : month - 1) - 1,
    1,
  ).toLocaleDateString('fr-CH', { month: 'long' })

  // 1. Month-over-month spending change
  if (prevExpense > 0) {
    const change = ((curExpense - prevExpense) / prevExpense) * 100
    if (Math.abs(change) >= 1) {
      insights.push({
        type: change > 0 ? 'warning' : 'success',
        title: change > 0
          ? `Depenses en hausse de ${Math.abs(change).toFixed(0)}%`
          : `Depenses en baisse de ${Math.abs(change).toFixed(0)}%`,
        detail: `vs ${prevMonthLabel}`,
      })
    }
  }

  // 2. Savings rate
  if (curIncome > 0) {
    const rate = ((curIncome - curExpense) / curIncome) * 100
    insights.push({
      type: rate >= 20 ? 'success' : rate >= 0 ? 'info' : 'warning',
      title: `Taux d'epargne : ${rate.toFixed(0)}%`,
      detail: rate >= 0 ? `${(curIncome - curExpense).toFixed(2)} CHF epargnes` : 'Depenses superieures aux revenus',
    })
  }

  // 3. Budget pace alerts
  const today = new Date()
  const dayOfMonth = today.getDate()
  if (dayOfMonth > 1) {
    const expCats = categories.filter((c) => c.type === 'expense' && c.budget_limit > 0)
    const catSpent = {}
    for (const tx of currentTx) {
      if (tx.type === 'expense' && tx.category_id) {
        catSpent[tx.category_id] = (catSpent[tx.category_id] || 0) + parseFloat(tx.amount)
      }
    }

    for (const cat of expCats) {
      const spent = catSpent[cat.id] || 0
      const projected = (spent / dayOfMonth) * curLastDay
      const limit = parseFloat(cat.budget_limit)
      if (projected > limit * 0.9 && spent < limit) {
        const overBy = (projected - limit).toFixed(0)
        insights.push({
          type: 'warning',
          title: `${cat.icon ? cat.icon + ' ' : ''}${cat.name} risque de depasser`,
          detail: `Projection : +${overBy} CHF au-dela du budget`,
        })
        break // Only show one budget alert to avoid noise
      }
    }
  }

  // 4. Top changed category
  if (prevTx.length > 0) {
    const curByCat = {}
    const prevByCat = {}
    for (const tx of currentTx) {
      if (tx.type === 'expense' && tx.category_id) {
        curByCat[tx.category_id] = (curByCat[tx.category_id] || 0) + parseFloat(tx.amount)
      }
    }
    for (const tx of prevTx) {
      if (tx.type === 'expense' && tx.category_id) {
        prevByCat[tx.category_id] = (prevByCat[tx.category_id] || 0) + parseFloat(tx.amount)
      }
    }

    let maxDelta = 0
    let topCatId = null
    for (const catId of Object.keys(curByCat)) {
      const delta = curByCat[catId] - (prevByCat[catId] || 0)
      if (Math.abs(delta) > Math.abs(maxDelta)) {
        maxDelta = delta
        topCatId = catId
      }
    }

    if (topCatId && Math.abs(maxDelta) >= 10) {
      const cat = categories.find((c) => c.id === topCatId)
      if (cat) {
        insights.push({
          type: maxDelta > 0 ? 'warning' : 'success',
          title: `${cat.icon ? cat.icon + ' ' : ''}${cat.name} : ${maxDelta > 0 ? '+' : ''}${maxDelta.toFixed(0)} CHF`,
          detail: `vs ${prevMonthLabel}`,
        })
      }
    }
  }

  return insights.slice(0, 4) // Max 4 insights
}
