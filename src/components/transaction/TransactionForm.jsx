import { useState, useEffect } from 'react'
import Button from '../ui/Button'
import Field from '../ui/Field'
import SelectField from '../ui/SelectField'
import ToggleGroup from '../ui/ToggleGroup'
import { useCategories } from '../../hooks/useCategories'
import { todayISO } from '../../lib/utils'

export default function TransactionForm({ transaction, onSubmit, onDelete, loading }) {
  const [type, setType] = useState(transaction?.type || 'expense')
  const [amount, setAmount] = useState(transaction?.amount?.toString() || '')
  const [title, setTitle] = useState(transaction?.title || '')
  const [description, setDescription] = useState(transaction?.description || '')
  const [categoryId, setCategoryId] = useState(transaction?.category_id || '')
  const [date, setDate] = useState(transaction?.date || todayISO())

  const { data: categories = [] } = useCategories()
  const filteredCategories = categories.filter((c) => c.type === type)

  useEffect(() => {
    if (categoryId) {
      const cat = categories.find((c) => c.id === categoryId)
      if (cat && cat.type !== type) setCategoryId('')
    }
  }, [type, categoryId, categories])

  const isEdit = !!transaction

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      type,
      amount: parseFloat(amount),
      title: title || null,
      description: description || null,
      category_id: categoryId || null,
      date,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-[13px] font-medium text-text-muted block mb-1">Type</label>
        <ToggleGroup
          options={[
            { value: 'expense', label: 'Depense' },
            { value: 'income', label: 'Revenu' },
          ]}
          value={type}
          onChange={setType}
        />
      </div>

      <Field
        label="Montant"
        id="tx-amount"
        type="number"
        placeholder="0.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        inCard
        step="0.01"
        min="0.01"
        inputMode="decimal"
      />

      <Field
        label="Titre"
        id="tx-title"
        placeholder="Ex : Courses, Loyer..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        inCard
      />

      <Field
        label="Description"
        id="tx-description"
        placeholder="Note complementaire (optionnel)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        inCard
      />

      <SelectField
        label="Categorie"
        id="tx-category"
        value={categoryId}
        onChange={(e) => setCategoryId(e.target.value)}
        inCard
      >
        <option value="">&mdash; Choisir &mdash;</option>
        {filteredCategories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </SelectField>

      <Field
        label="Date"
        id="tx-date"
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        inCard
      />

      <div className="flex items-center justify-between pt-2">
        {isEdit && onDelete ? (
          <Button variant="destructive" type="button" onClick={onDelete} disabled={loading}>
            Supprimer
          </Button>
        ) : <div />}
        <Button
          variant="primary"
          type="submit"
          disabled={loading || !amount || parseFloat(amount) <= 0}
        >
          {loading ? 'Chargement...' : isEdit ? 'Modifier' : 'Ajouter'}
        </Button>
      </div>
    </form>
  )
}
