# Référence Composants UI — React / Tailwind

## Table des matières
1. [Boutons](#boutons)
2. [Formulaires](#formulaires)
3. [Cartes](#cartes)
4. [Modales](#modales)
5. [Badges](#badges)
6. [Tableaux](#tableaux)
7. [Navigation](#navigation)
8. [Tab Bar](#tab-bar)
9. [Search Field](#search-field)
10. [KPI Card](#kpi-card)

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

## Navigation

`src/components/ui/Nav.jsx`

```jsx
import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { Moon, Sun } from 'lucide-react'

export default function Nav({ items = [], logo }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <nav
      className="sticky top-0 z-sticky h-16 flex items-center justify-between px-6 border-b border-border dark:border-[#333333] font-sans"
      style={{ background: 'var(--backdrop-bg)', backdropFilter: 'var(--backdrop)' }}
    >
      <div className="flex items-center gap-6">
        {logo && <span className="text-small font-semibold text-text dark:text-[#EDEDED]">{logo}</span>}
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `text-small font-medium transition-colors duration-150 ${
                isActive ? 'text-text dark:text-[#EDEDED]' : 'text-text-muted dark:text-[#888888] hover:text-text dark:hover:text-[#EDEDED]'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
      <button
        onClick={() => setDark(!dark)}
        className="text-text-muted hover:text-text dark:text-[#888888] dark:hover:text-[#EDEDED] transition-colors duration-150 p-2 rounded-md"
        aria-label={dark ? 'Mode clair' : 'Mode sombre'}
      >
        {dark ? <Sun size={16} strokeWidth={1.5} /> : <Moon size={16} strokeWidth={1.5} />}
      </button>
    </nav>
  )
}
```

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

export default function KpiCard({ label, value, delta, deltaLabel, icon: Icon }) {
  const isPositive = delta >= 0
  return (
    <Card>
      <div className="flex items-start justify-between mb-4">
        <p className="text-label uppercase tracking-[0.05em] text-text-muted dark:text-[#888888]">
          {label}
        </p>
        {Icon && <Icon size={16} className="text-text-subtle dark:text-[#555555]" aria-hidden="true" strokeWidth={1.5} />}
      </div>
      <p
        className="text-[32px] font-bold tracking-[-0.03em] text-text dark:text-[#EDEDED] mb-1"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {value}
      </p>
      {delta !== undefined && (
        <p className={`text-[13px] font-medium ${isPositive ? 'text-success' : 'text-error'}`}>
          {isPositive ? '+' : ''}{delta}% {deltaLabel}
        </p>
      )}
    </Card>
  )
}
```
