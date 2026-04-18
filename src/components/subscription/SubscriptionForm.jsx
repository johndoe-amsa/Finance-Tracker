import { useState, useEffect, useMemo } from 'react'
import Button from '../ui/Button'
import Field from '../ui/Field'
import SelectField from '../ui/SelectField'
import ToggleGroup from '../ui/ToggleGroup'
import { useCategories } from '../../hooks/useCategories'
import { kindToType } from '../../lib/utils'
import useFormValidation from '../../hooks/useFormValidation'
import { useToastStore } from '../../store/useToastStore'

// Returns the current "YYYY-MM" in local time, suitable for <input type="month">.
function currentMonthISO() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

// Extract "YYYY-MM" from a "YYYY-MM-DD" stored value (or empty).
function toMonthInput(dateStr) {
  return dateStr ? dateStr.slice(0, 7) : ''
}

export default function SubscriptionForm({ subscription, onSubmit, onDelete, loading }) {
  const initialKind =
    subscription?.kind ||
    (subscription?.type === 'income' ? 'income' : 'subscription')

  const [kind, setKind] = useState(initialKind)
  const [name, setName] = useState(subscription?.name || '')
  const [amount, setAmount] = useState(subscription?.amount?.toString() || '')
  const [frequency, setFrequency] = useState(subscription?.frequency || 'monthly')
  const [categoryId, setCategoryId] = useState(subscription?.category_id || '')
  const [billingDay, setBillingDay] = useState(subscription?.billing_day?.toString() || '1')
  const [startMonth, setStartMonth] = useState(
    toMonthInput(subscription?.start_date) || currentMonthISO(),
  )
  const [endMonth, setEndMonth] = useState(toMonthInput(subscription?.end_date))
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
    startMonth: (v) => !v ? 'Mois de début requis' : null,
  }), [])

  const { errors, validate, clearError } = useFormValidation(validationSchema)

  useEffect(() => {
    if (categoryId) {
      const cat = categories.find((c) => c.id === categoryId)
      if (cat && cat.type !== type) setCategoryId('')
    }
  }, [type, categoryId, categories])

  const isEdit = !!subscription
  const showToast = useToastStore((s) => s.show)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate({ name, amount, billingDay, startMonth })) return
    if (endMonth && endMonth < startMonth) {
      showToast('Le mois de fin doit être après le mois de début', 'error')
      return
    }
    onSubmit({
      name,
      kind,
      type,
      amount: parseFloat(amount),
      frequency,
      category_id: categoryId || null,
      billing_day: parseInt(billingDay, 10),
      // Month + year define the retroactive window; the day within each
      // month comes from billing_day.
      start_date: `${startMonth}-01`,
      end_date: endMonth ? `${endMonth}-01` : null,
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
          <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ${c.name}` : c.name}</option>
        ))}
      </SelectField>

      <div>
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
        {!errors.billingDay && (
          <p className="text-[12px] text-text-muted dark:text-[#a1a1aa] mt-1">
            Les mois qui n'ont pas ce jour (ex : 31 en février) utilisent leur dernier jour.
          </p>
        )}
      </div>

      <Field
        label="Mois de début"
        id="sub-start-month"
        type="month"
        value={startMonth}
        onChange={(e) => { setStartMonth(e.target.value); clearError('startMonth') }}
        error={errors.startMonth}
        inCard
      />

      <Field
        label="Mois de fin (optionnel)"
        id="sub-end-month"
        type="month"
        value={endMonth}
        onChange={(e) => { setEndMonth(e.target.value); clearError('endMonth') }}
        error={errors.endMonth}
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
