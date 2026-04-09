import { useState } from 'react'
import Button from '../ui/Button'
import Field from '../ui/Field'

export default function CategoryForm({
  category,
  type,
  transactionCount = 0,
  onSubmit,
  onDelete,
  loading,
}) {
  const [name, setName] = useState(category?.name || '')
  const [budgetLimit, setBudgetLimit] = useState(category?.budget_limit?.toString() || '')

  const isEdit = !!category

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = { name, type }
    if (type === 'expense') {
      data.budget_limit = budgetLimit ? parseFloat(budgetLimit) : null
    }
    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field
        label="Nom"
        id="cat-name"
        placeholder="Nom de la categorie"
        value={name}
        onChange={(e) => setName(e.target.value)}
        inCard
      />

      {type === 'expense' && (
        <Field
          label="Budget mensuel"
          id="cat-budget"
          type="number"
          placeholder="Laisser vide = pas de budget"
          value={budgetLimit}
          onChange={(e) => setBudgetLimit(e.target.value)}
          inCard
          step="0.01"
          min="0"
        />
      )}

      {isEdit && (
        <p className="text-[13px] text-text-muted dark:text-[#888888]">
          {transactionCount} transaction{transactionCount > 1 ? 's' : ''} liee{transactionCount > 1 ? 's' : ''} a cette categorie.
        </p>
      )}

      <div className="flex items-center justify-between pt-2">
        {isEdit && onDelete ? (
          <Button variant="destructive" type="button" onClick={onDelete} disabled={loading}>
            Supprimer
          </Button>
        ) : <div />}
        <Button variant="primary" type="submit" disabled={loading || !name}>
          {loading ? 'Chargement...' : isEdit ? 'Modifier' : 'Ajouter'}
        </Button>
      </div>
    </form>
  )
}
