# Référence Composants UI — React / Tailwind

## Table des matières
1. [Boutons](#boutons)
2. [Formulaires](#formulaires)
3. [Select](#select)
4. [Cartes](#cartes)
5. [Modales](#modales)
6. [Divider](#divider)
7. [Badges](#badges)
8. [Tableaux](#tableaux)
9. [Pagination](#pagination)
10. [Tooltip](#tooltip)
11. [Navigation](#navigation)
12. [Tab Bar](#tab-bar)
13. [Search Field](#search-field)
14. [KPI Card](#kpi-card)

Tous les composants ci-dessous sont des fichiers autonomes dans `src/components/ui/`.

---

## Boutons

`src/components/ui/Button.jsx`

```jsx
export default function Button({
  variant = 'primary',
  size = 'default',
  disabled,
  children,
  onClick,
  type = 'button',
  className = '',
}) {
  const base =
    'inline-flex items-center gap-2 rounded-full font-medium font-sans cursor-pointer ' +
    'transition-all duration-150 focus-visible:outline-2 focus-visible:outline-border-focus ' +
    'focus-visible:outline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none'

  const variants = {
    primary:     'bg-accent text-accent-text hover:opacity-85 active:scale-[0.97] dark:bg-[#EDEDED] dark:text-[#000000]',
    secondary:   'bg-transparent text-text border border-border hover:opacity-85 active:scale-[0.97]',
    ghost:       'bg-transparent text-text-muted hover:text-text active:scale-[0.97]',
    destructive: 'bg-error text-white hover:opacity-85 active:scale-[0.97]',
  }

  const sizes = {
    sm:      'h-8 px-3 text-[13px]',
    default: 'h-10 px-4 text-small',
    lg:      'h-12 px-6 text-body',
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  )
}
```

### Usage
```jsx
import Button from '../components/ui/Button'
import { Plus, Trash2 } from 'lucide-react'

<Button variant="primary">Enregistrer</Button>
<Button variant="secondary" size="sm"><Plus size={16} /> Ajouter</Button>
<Button variant="ghost" disabled>Désactivé</Button>
<Button variant="destructive"><Trash2 size={16} /> Supprimer</Button>
```

---

## Formulaires

`src/components/ui/Field.jsx`

```jsx
export default function Field({
  label,
  id,
  error,
  type = 'text',
  placeholder,
  value,
  onChange,
  inCard = false,
  disabled = false,
}) {
  const inputBg = inCard ? 'bg-bg dark:bg-[#000000]' : 'bg-bg-secondary dark:bg-[#0A0A0A]'

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[13px] font-medium text-text-muted">
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={[
          'h-10 px-3 rounded-md text-small text-text font-sans border transition-all duration-150',
          inputBg,
          error
            ? 'border-error ring-[3px] ring-error/10'
            : 'border-border focus:border-border-focus focus:ring-[3px] focus:ring-black/[0.08]',
          'focus:outline-none',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-bg-tertiary',
          'dark:text-[#EDEDED] dark:border-[#333333]',
        ].join(' ')}
      />
      {error && <p className="text-[12px] text-error">{error}</p>}
    </div>
  )
}
```

### Règles
- Label TOUJOURS visible au-dessus du champ. Jamais placeholder seul.
- `inCard={true}` quand l'input est dans une `<Card>`.

---

## Select

`src/components/ui/Select.jsx`

```jsx
import { ChevronDown } from 'lucide-react'

export default function Select({
  label,
  id,
  error,
  value,
  onChange,
  options = [],
  placeholder = 'Choisir…',
  inCard = false,
  disabled = false,
}) {
  const inputBg = inCard ? 'bg-bg dark:bg-[#000000]' : 'bg-bg-secondary dark:bg-[#0A0A0A]'

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[13px] font-medium text-text-muted dark:text-[#888888]">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={[
            'w-full h-10 pl-3 pr-9 rounded-md text-small font-sans border appearance-none transition-all duration-150',
            inputBg,
            'text-text dark:text-[#EDEDED]',
            error
              ? 'border-error ring-[3px] ring-error/10'
              : 'border-border dark:border-[#333333] focus:border-border-focus dark:focus:border-[#FFFFFF] focus:ring-[3px] focus:ring-black/[0.08] dark:focus:ring-white/10',
            'focus:outline-none',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          ].join(' ')}
        >
          {placeholder && (
            <option value="" disabled hidden>{placeholder}</option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted dark:text-[#888888] pointer-events-none"
          aria-hidden="true"
        />
      </div>
      {error && <p className="text-[12px] text-error">{error}</p>}
    </div>
  )
}
```

### Usage
```jsx
import Select from '../components/ui/Select'

<Select
  label="Catégorie"
  id="category"
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  options={[
    { value: 'design',  label: 'Design' },
    { value: 'dev',     label: 'Développement' },
    { value: 'marketing', label: 'Marketing' },
  ]}
/>

// Dans une Card
<Select label="Devise" id="currency" value={currency} onChange={…} inCard />
```

### Règles
- Même logique de contraste `inCard` que `Field`.
- `appearance-none` obligatoire — l'icône `ChevronDown` remplace le chevron natif du navigateur.
- Options passées comme tableau `{ value, label }`, jamais inline dans le JSX parent.

---

## Cartes

`src/components/ui/Card.jsx`

```jsx
export function Card({ children, clickable = false, className = '' }) {
  return (
    <div
      className={[
        'bg-bg-secondary border border-border rounded-lg p-6 shadow-none',
        'transition-all duration-200',
        'dark:bg-[#0A0A0A] dark:border-[#333333]',
        clickable ? 'hover:shadow-1 hover:border-border-strong cursor-pointer' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}

export function CardLabel({ children }) {
  return (
    <p className="text-label uppercase tracking-[0.05em] text-text-muted dark:text-[#888888] mb-2">
      {children}
    </p>
  )
}

export function CardTitle({ children }) {
  return (
    <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-text dark:text-[#EDEDED] mb-2">
      {children}
    </h3>
  )
}

export function CardBody({ children }) {
  return (
    <p className="text-small text-text-muted dark:text-[#888888] leading-[1.5]">
      {children}
    </p>
  )
}
```

---

## Modales

`src/components/ui/Modal.jsx`

```jsx
import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import Button from './Button'

export default function Modal({ open, onClose, title, children }) {
  const firstFocusRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    firstFocusRef.current?.focus()
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg bg-bg dark:bg-[#0A0A0A] border border-border dark:border-[#333333] rounded-lg shadow-2 p-6"
        style={{ animation: 'modal-in 300ms var(--ease-out)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="modal-title" className="text-h3 text-text dark:text-[#EDEDED]">{title}</h2>
          <button
            ref={firstFocusRef}
            onClick={onClose}
            className="text-text-muted hover:text-text transition-colors duration-150 rounded-md p-1"
            aria-label="Fermer"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
```

---

## Divider

`src/components/ui/Divider.jsx`

```jsx
export default function Divider({ label }) {
  if (label) {
    return (
      <div className="flex items-center gap-3 my-2">
        <span className="flex-1 border-t border-border dark:border-[#333333]" />
        <span className="text-label uppercase tracking-[0.05em] text-text-subtle dark:text-[#555555]">
          {label}
        </span>
        <span className="flex-1 border-t border-border dark:border-[#333333]" />
      </div>
    )
  }
  return (
    <hr className="border-none border-t border-border dark:border-[#333333] my-2" />
  )
}
```

### Usage
```jsx
import Divider from '../components/ui/Divider'

// Séparateur simple
<Divider />

// Séparateur avec texte centré
<Divider label="ou" />
<Divider label="Cette semaine" />
```

### Règles
- `my-2` par défaut — ajuster avec `className` si le contexte l'exige.
- Jamais de couleur autre que `border-border`. Pas de séparateur décoratif coloré.

---

## Badges

`src/components/ui/Badge.jsx`

```jsx
export default function Badge({ variant = 'neutral', children }) {
  const variants = {
    neutral: 'bg-bg-tertiary text-text-muted dark:bg-[#111111] dark:text-[#888888]',
    success: 'bg-[rgba(22,163,74,0.1)] text-success',
    error:   'bg-[rgba(238,0,0,0.08)] text-error',
    warning: 'bg-[rgba(245,166,35,0.1)] text-warning',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-medium tracking-[0.02em] ${variants[variant]}`}>
      {children}
    </span>
  )
}
```

---

## Tableaux

`src/components/ui/Table.jsx`

```jsx
export default function Table({ columns, rows }) {
  return (
    <div className="border border-border dark:border-[#333333] rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className="bg-bg-tertiary dark:bg-[#111111] text-label uppercase tracking-[0.05em] text-text-muted px-4 py-[10px] text-left border-b border-border dark:border-[#333333] font-medium"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-bg-secondary dark:hover:bg-[#0A0A0A] transition-colors duration-100">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-4 py-3 text-small text-text dark:text-[#EDEDED] border-b border-border dark:border-[#333333] last:border-b-0"
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## Tooltip

`src/components/ui/Tooltip.jsx`

```jsx
import { useState } from 'react'

export default function Tooltip({ content, children, position = 'top' }) {
  const [visible, setVisible] = useState(false)

  const positions = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left:   'right-full top-1/2 -translate-y-1/2 mr-2',
    right:  'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={[
            'absolute z-tooltip whitespace-nowrap',
            'bg-text dark:bg-[#EDEDED] text-bg dark:text-[#000000]',
            'text-[11px] font-medium font-sans px-2 py-1 rounded-md',
            'pointer-events-none',
            positions[position],
          ].join(' ')}
          style={{ animation: 'enter 150ms var(--ease-out)' }}
        >
          {content}
        </div>
      )}
    </div>
  )
}
```

### Usage
```jsx
import Tooltip from '../components/ui/Tooltip'
import Button from '../components/ui/Button'
import { Info } from 'lucide-react'

<Tooltip content="Exporter au format CSV">
  <Button variant="ghost" size="sm">Exporter</Button>
</Tooltip>

<Tooltip content="Calculé sur les 30 derniers jours" position="right">
  <Info size={14} strokeWidth={1.5} className="text-text-muted cursor-help" />
</Tooltip>
```

### Règles
- Fond inversé : `bg-text` sur fond clair, `dark:bg-[#EDEDED]` en dark — contraste maximal sans couleur.
- `position` : `top` (défaut), `bottom`, `left`, `right`.
- Jamais de tooltip sur des éléments non focusables sans `tabIndex={0}` — accessibilité obligatoire.
- Contenu court uniquement (max ~60 chars). Pour du contenu long → utiliser une modale ou un popover.

---

## Pagination

`src/components/ui/Pagination.jsx`

```jsx
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  // Afficher max 5 pages autour de la page active
  const visible = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  )
  // Injecter les ellipses
  const items = []
  let prev = null
  for (const p of visible) {
    if (prev !== null && p - prev > 1) items.push('…')
    items.push(p)
    prev = p
  }

  return (
    <div className="flex items-center gap-1 font-sans select-none">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="h-8 w-8 flex items-center justify-center rounded-md text-text-muted hover:text-text hover:bg-bg-tertiary dark:hover:bg-[#111111] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
        aria-label="Page précédente"
      >
        <ChevronLeft size={16} strokeWidth={1.5} />
      </button>

      {items.map((item, i) =>
        item === '…' ? (
          <span key={`ellipsis-${i}`} className="h-8 w-8 flex items-center justify-center text-text-subtle dark:text-[#555555] text-small">
            …
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onChange(item)}
            className={[
              'h-8 w-8 flex items-center justify-center rounded-md text-small transition-colors duration-150',
              item === page
                ? 'bg-accent text-accent-text dark:bg-[#EDEDED] dark:text-[#000000] font-medium'
                : 'text-text-muted hover:text-text hover:bg-bg-tertiary dark:hover:bg-[#111111]',
            ].join(' ')}
            aria-current={item === page ? 'page' : undefined}
          >
            {item}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="h-8 w-8 flex items-center justify-center rounded-md text-text-muted hover:text-text hover:bg-bg-tertiary dark:hover:bg-[#111111] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-150"
        aria-label="Page suivante"
      >
        <ChevronRight size={16} strokeWidth={1.5} />
      </button>
    </div>
  )
}
```

### Usage
```jsx
import { useState } from 'react'
import Pagination from '../components/ui/Pagination'

function DataTable({ data, pageSize = 20 }) {
  const [page, setPage] = useState(1)
  const totalPages = Math.ceil(data.length / pageSize)
  const rows = data.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div>
      <Table columns={columns} rows={rows} />
      <div className="flex justify-end mt-4">
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </div>
    </div>
  )
}
```

### Règles
- Retourne `null` si `totalPages <= 1` — pas de pagination inutile.
- Page active : style `accent` (identique au bouton primary).
- Ellipses générées automatiquement si > 5 pages.
- `aria-current="page"` sur la page active — accessibilité obligatoire.

---

## Navigation

`src/components/ui/Nav.jsx`

```jsx
import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'

function getInitialDark() {
  // 1. Préférence sauvegardée
  const saved = localStorage.getItem('theme')
  if (saved) return saved === 'dark'
  // 2. Préférence système
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export default function Nav({ items = [], logo }) {
  const [dark, setDark] = useState(getInitialDark)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  return (
    <nav
      className="sticky top-0 z-sticky h-16 flex items-center justify-between px-6 border-b border-border dark:border-dark-border font-sans"
      style={{ background: 'var(--backdrop-bg)', backdropFilter: 'var(--backdrop)' }}
    >
      <div className="flex items-center gap-6">
        {logo && <span className="text-small font-semibold text-text dark:text-dark-text">{logo}</span>}
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `text-small font-medium transition-colors duration-150 ${
                isActive
                  ? 'text-text dark:text-dark-text'
                  : 'text-text-muted dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
      <button
        onClick={() => setDark(!dark)}
        className="text-text-muted hover:text-text dark:text-dark-text-muted dark:hover:text-dark-text transition-colors duration-150 p-2 rounded-md"
        aria-label={dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
      >
        {dark ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
      </button>
    </nav>
  )
}
```

> **Logique dark mode :** `getInitialDark()` lit d'abord `localStorage`, puis se rabat sur `prefers-color-scheme`. Chaque changement persiste automatiquement. À migrer dans un `useTheme` hook si plusieurs composants ont besoin du thème.

---

## Tab Bar

`src/components/ui/TabBar.jsx`

```jsx
export default function TabBar({ tabs, active, onChange }) {
  return (
    <div className="inline-flex items-center gap-1 p-1 bg-bg-secondary dark:bg-[#0A0A0A] border border-border dark:border-[#333333] rounded-lg overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={[
            'h-9 px-4 text-[13px] font-medium rounded-md transition-all duration-150 whitespace-nowrap',
            active === tab.key
              ? 'text-text dark:text-[#EDEDED] bg-bg dark:bg-[#000000] shadow-1'
              : 'text-text-muted dark:text-[#888888] hover:text-text dark:hover:text-[#EDEDED] hover:bg-bg-tertiary dark:hover:bg-[#111111]',
          ].join(' ')}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
```

---

## Search Field

`src/components/ui/SearchField.jsx`

```jsx
import { Search } from 'lucide-react'

export default function SearchField({ value, onChange, placeholder = 'Rechercher…' }) {
  return (
    <div className="relative flex items-center">
      <Search
        size={16}
        className="absolute left-[10px] text-text-subtle dark:text-[#555555] pointer-events-none"
        aria-hidden="true"
        strokeWidth={1.5}
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={[
          'h-9 pl-[34px] pr-3 bg-bg-secondary dark:bg-[#0A0A0A]',
          'border border-border dark:border-[#333333] rounded-full',
          'text-small text-text dark:text-[#EDEDED] font-sans',
          'w-[260px] transition-all duration-200',
          'focus:outline-none focus:border-border-focus focus:ring-[3px] focus:ring-black/[0.08] focus:w-[320px]',
          'dark:focus:border-[#FFFFFF] dark:focus:ring-white/10',
        ].join(' ')}
      />
    </div>
  )
}
```

---

## KPI Card

`src/components/ui/KpiCard.jsx`

```jsx
import { Card } from './Card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function KpiCard({ label, value, delta, deltaLabel = 'vs mois précédent', icon: Icon }) {
  const isPositive = delta > 0
  const isNeutral  = delta === 0 || delta === undefined

  const deltaColor = isNeutral ? 'text-text-muted dark:text-dark-text-muted'
    : isPositive ? 'text-success' : 'text-error'

  const DeltaIcon = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown

  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <p className="text-label uppercase tracking-[0.05em] text-text-muted dark:text-dark-text-muted">
          {label}
        </p>
        {Icon && (
          <Icon size={16} className="text-text-subtle dark:text-dark-text-subtle" aria-hidden="true" strokeWidth={1.5} />
        )}
      </div>
      <p
        className="text-[32px] font-bold tracking-[-0.03em] text-text dark:text-dark-text mb-1"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </p>
      {delta !== undefined && (
        <div className={`flex items-center gap-1 text-[13px] font-medium ${deltaColor}`}>
          <DeltaIcon size={13} strokeWidth={2} aria-hidden="true" />
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>
            {isPositive ? '+' : ''}{delta}%
          </span>
          <span className="text-text-subtle dark:text-dark-text-subtle font-normal">
            {deltaLabel}
          </span>
        </div>
      )}
    </Card>
  )
}
```

### Usage
```jsx
<KpiCard label="Revenus" value="CHF 12 450" delta={+8.3} />
<KpiCard label="Dépenses" value="CHF 3 210" delta={-2.1} deltaLabel="vs semaine dernière" />
<KpiCard label="Utilisateurs" value="1 842" delta={0} />
<KpiCard label="Taux de conversion" value="3.4%" icon={Target} />
```

### Règles
- `deltaLabel` : défaut `"vs mois précédent"` — surcharger si la période diffère.
- `delta === 0` → icône `Minus`, couleur neutre (`text-muted`). Pas de vert pour zéro.
- `delta` en pourcentage entier ou décimal. Formatage `+/-` géré par le composant.
- `fontVariantNumeric: 'tabular-nums'` sur la valeur **et** le delta — alignement garanti.
