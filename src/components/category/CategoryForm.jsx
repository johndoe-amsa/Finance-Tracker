import { useState } from 'react'
import Button from '../ui/Button'
import Field from '../ui/Field'
import { DATA_COLORS } from '../../data'

const PALETTE = [
  DATA_COLORS[1], DATA_COLORS[2], DATA_COLORS[3], DATA_COLORS[4],
  DATA_COLORS[5], DATA_COLORS[6], DATA_COLORS[7],
]

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
  const [color, setColor] = useState(category?.color || DATA_COLORS[1])

  const isEdit = !!category

  const handleSubmit = (e) => {
    e.preventDefault()
    const data = { name, type, color }
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

      <div>
        <p className="text-[13px] font-medium text-text-muted dark:text-[#888888] mb-2">Couleur</p>
        <div className="flex flex-wrap gap-2">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="w-7 h-7 rounded-full transition-transform duration-100 cursor-pointer"
              style={{
                backgroundColor: c,
                transform: color === c ? 'scale(1.25)' : 'scale(1)',
                outline: color === c ? `2px solid ${c}` : 'none',
                outlineOffset: '2px',
              }}
            />
          ))}
        </div>
      </div>

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
