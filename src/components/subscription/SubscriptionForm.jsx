import { useState, useEffect, useMemo } from 'react'
import Button from '../ui/Button'
import Field from '../ui/Field'
import SelectField from '../ui/SelectField'
import ToggleGroup from '../ui/ToggleGroup'
import { useCategories } from '../../hooks/useCategories'
import { todayISO, kindToType } from '../../lib/utils'
import useFormValidation from '../../hooks/useFormValidation'

export default function SubscriptionForm({ subscription, onSubmit, onDelete, loading }) {
  // Déduit le kind initial pour les enregistrements existants (avant migration appliquée).
  const initialKind =
    subscription?.kind ||
    (subscription?.type === 'income' ? 'income' : 'subscription')

  const [kind, setKind] = useState(initialKind)
  const [name, setName] = useState(subscription?.name || '')
  const [amount, setAmount] = useState(subscription?.amount?.toString() || '')
  const [frequency, setFrequency] = useState(subscription?.frequency || 'monthly')
  const [categoryId, setCategoryId] = useState(subscription?.category_id || '')
  const [billingDay, setBillingDay] = useState(subscription?.billing_day?.toString() || '1')
  const [startDate, setStartDate] = useState(subscription?.start_date || todayISO())
  const [endDate, setEndDate] = useState(subscription?.end_date || '')
  const [isActive, setIsActive] = useState(subscription?.is_active ?? true)

  const type = kindToType(kind)

  const { data: categories = [] } = useCategories()
  const filteredCategories = categories.filter((c) => c.type === type)

  const validationSchema = useMemo(() => ({
    name: (v) => !v?.trim() ? 'Nom requis' : null,
    amount: (v) => !v || parseFloat(v) <= 0 ? 'Montant requis (> 0)' : null,
    billingDay: (v) => {
      const d = parseInt(v, 10)
      return !v || isNaN(d) || d < 1 || d > 31 ? 'Jour entre 1 et 31' : null
    },
    startDate: (v) => !v ? 'Date de debut requise' : null,
  }), [])

  const { errors, validate, clearError } = useFormValidation(validationSchema)

  // Si on change le kind et que la catégorie sélectionnée n'est plus compatible, on la réinitialise.
  useEffect(() => {
    if (categoryId) {
      const cat = categories.find((c) => c.id === categoryId)
      if (cat && cat.type !== type) setCategoryId('')
    }
  }, [type, categoryId, categories])

  const isEdit = !!subscription

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate({ name, amount, billingDay, startDate })) return
    onSubmit({
      name,
      kind,
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

  const namePlaceholder =
    kind === 'income' ? 'Ex : Salaire' :
    kind === 'fixed_expense' ? 'Ex : Loyer' :
    'Ex : Netflix'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-[13px] font-medium text-text-muted block mb-1">Type de récurrence</label>
        <ToggleGroup
          options={[
            { value: 'subscription', label: 'Abonnement' },
            { value: 'fixed_expense', label: 'Charge fixe' },
            { value: 'income', label: 'Revenu' },
          ]}
          value={kind}
          onChange={setKind}
        />
      </div>

      <Field
        label="Nom"
        id="sub-name"
        placeholder={namePlaceholder}
        value={name}
        onChange={(e) => { setName(e.target.value); clearError('name') }}
        error={errors.name}
        inCard
      />

      <Field
        label="Montant"
        id="sub-amount"
        type="number"
        placeholder="0.00"
        value={amount}
        onChange={(e) => { setAmount(e.target.value); clearError('amount') }}
        error={errors.amount}
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
        onChange={(e) => { setBillingDay(e.target.value); clearError('billingDay') }}
        error={errors.billingDay}
        inCard
        min="1"
        max="31"
      />

      <Field
        label="Date de debut"
        id="sub-start-date"
        type="date"
        value={startDate}
        onChange={(e) => { setStartDate(e.target.value); clearError('startDate') }}
        error={errors.startDate}
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
            Récurrence active
          </label>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        {isEdit && onDelete ? (
          <Button variant="destructive" type="button" onClick={onDelete} disabled={loading}>
            Supprimer
          </Button>
        ) : <div />}
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Chargement...' : isEdit ? 'Modifier' : 'Ajouter'}
        </Button>
      </div>
    </form>
  )
}
