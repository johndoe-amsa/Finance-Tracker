import { useState, useEffect } from 'react'
import Button from '../ui/Button'
import Field from '../ui/Field'
import SelectField from '../ui/SelectField'
import ToggleGroup from '../ui/ToggleGroup'
import { useCategories } from '../../hooks/useCategories'
import { todayISO } from '../../lib/utils'

export default function SubscriptionForm({ subscription, onSubmit, onDelete, loading }) {
  const [name, setName] = useState(subscription?.name || '')
  const [type, setType] = useState(subscription?.type || 'expense')
  const [amount, setAmount] = useState(subscription?.amount?.toString() || '')
  const [frequency, setFrequency] = useState(subscription?.frequency || 'monthly')
  const [categoryId, setCategoryId] = useState(subscription?.category_id || '')
  const [billingDay, setBillingDay] = useState(subscription?.billing_day?.toString() || '1')
  const [startDate, setStartDate] = useState(subscription?.start_date || todayISO())
  const [endDate, setEndDate] = useState(subscription?.end_date || '')
  const [isActive, setIsActive] = useState(subscription?.is_active ?? true)

  const { data: categories = [] } = useCategories()
  const filteredCategories = categories.filter((c) => c.type === type)

  useEffect(() => {
    if (categoryId) {
      const cat = categories.find((c) => c.id === categoryId)
      if (cat && cat.type !== type) setCategoryId('')
    }
  }, [type, categoryId, categories])

  const isEdit = !!subscription

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      name,
      type,
      amount: parseFloat(amount),
      frequency,
      category_id: categoryId || null,
      billing_day: parseInt(billingDay, 10),
      start_date: startDate,
      end_date: endDate || null,
      ...(isEdit ? { is_active: isActive } : {}),
    })
  }

  const isValid = name && amount && parseFloat(amount) > 0 && billingDay && startDate

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field
        label="Nom"
        id="sub-name"
        placeholder="Ex : Netflix"
        value={name}
        onChange={(e) => setName(e.target.value)}
        inCard
      />

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
        id="sub-amount"
        type="number"
        placeholder="0.00"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        inCard
        step="0.01"
        min="0.01"
        inputMode="decimal"
      />

      <SelectField
        label="Frequence"
        id="sub-frequency"
        value={frequency}
        onChange={(e) => setFrequency(e.target.value)}
        inCard
      >
        <option value="monthly">Mensuel</option>
        <option value="yearly">Annuel</option>
      </SelectField>

      <SelectField
        label="Categorie"
        id="sub-category"
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
        label="Jour de facturation"
        id="sub-billing-day"
        type="number"
        value={billingDay}
        onChange={(e) => setBillingDay(e.target.value)}
        inCard
        min="1"
        max="31"
      />

      <Field
        label="Date de debut"
        id="sub-start-date"
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        inCard
      />

      <Field
        label="Date de fin (optionnel)"
        id="sub-end-date"
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        inCard
      />

      {isEdit && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="sub-active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 accent-accent"
          />
          <label htmlFor="sub-active" className="text-small text-text dark:text-[#EDEDED]">
            Abonnement actif
          </label>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        {isEdit && onDelete ? (
          <Button variant="destructive" type="button" onClick={onDelete} disabled={loading}>
            Supprimer
          </Button>
        ) : <div />}
        <Button variant="primary" type="submit" disabled={loading || !isValid}>
          {loading ? 'Chargement...' : isEdit ? 'Modifier' : 'Ajouter'}
        </Button>
      </div>
    </form>
  )
}
