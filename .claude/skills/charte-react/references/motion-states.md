# Référence Motion Design & États Spéciaux — React

## Table des matières
1. [Règles Motion](#règles-motion)
2. [Skeleton / Loading](#skeleton--loading)
3. [États Vides](#états-vides)
4. [États d'Erreur](#états-derreur)
5. [États Désactivés](#états-désactivés)
6. [Toast / Notifications](#toast--notifications)

Les animations `pulse-skeleton`, `enter`, et `modal-in` sont définies dans `src/index.css`.

---

## Règles Motion

- Jamais d'animation > 400ms.
- Jamais `ease-in` sur les entrées.
- Animer uniquement `transform` et `opacity`. Exceptions : width du search field au focus.
- `prefers-reduced-motion` géré globalement dans `index.css`.

Durées Tailwind :
- Hover / micro-interaction : `duration-150`
- Transition d'état : `duration-200`
- Entrée de composant : `duration-300`

---

## Skeleton / Loading

> Règle absolue : jamais de spinner plein écran.

`src/components/ui/Skeleton.jsx`

```jsx
export default function Skeleton({ className = '' }) {
  return (
    <div
      className={`bg-bg-tertiary dark:bg-[#111111] rounded-md ${className}`}
      style={{ animation: 'pulse-skeleton 1.8s ease-in-out infinite' }}
      aria-hidden="true"
    />
  )
}
```

### Patterns prêts à l'emploi

```jsx
// Ligne de texte
<Skeleton className="h-4 w-3/4" />

// Titre
<Skeleton className="h-6 w-1/2" />

// Avatar
<Skeleton className="h-10 w-10 rounded-full" />

// KPI Card entière
function KpiCardSkeleton() {
  return (
    <div className="bg-bg-secondary dark:bg-[#0A0A0A] border border-border dark:border-[#333333] rounded-lg p-6">
      <Skeleton className="h-3 w-24 mb-4" />
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  )
}

// Ligne de tableau
function TableRowSkeleton({ cols = 4 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3 border-b border-border dark:border-[#333333]">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}
```

### Pattern d'utilisation avec état de chargement

```jsx
function DataSection() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])

  useEffect(() => {
    fetchData().then((d) => { setData(d); setLoading(false) })
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        <KpiCardSkeleton />
        <KpiCardSkeleton />
        <KpiCardSkeleton />
      </div>
    )
  }

  return <>{/* contenu réel */}</>
}
```

---

## États Vides

`src/components/ui/EmptyState.jsx`

```jsx
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <Icon size={24} className="text-text-subtle dark:text-[#555555] mb-4" aria-hidden="true" strokeWidth={1.5} />
      )}
      <h3 className="text-[16px] font-semibold text-text dark:text-[#EDEDED] mb-2">{title}</h3>
      <p className="text-small text-text-muted dark:text-[#888888] max-w-xs mb-6">{description}</p>
      {action && action}
    </div>
  )
}
```

### Usage
```jsx
import { Search } from 'lucide-react'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'

<EmptyState
  icon={Search}
  title="Aucun résultat"
  description="Essayez d'élargir votre recherche ou de modifier les filtres."
  action={<Button variant="secondary" onClick={onReset}>Réinitialiser</Button>}
/>
```

---

## États d'Erreur

`src/components/ui/ErrorState.jsx`

```jsx
import { AlertCircle, RefreshCw } from 'lucide-react'
import Button from './Button'

export default function ErrorState({ title = 'Une erreur est survenue', description, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <AlertCircle size={24} className="text-error mb-4" aria-hidden="true" strokeWidth={1.5} />
      <h3 className="text-[16px] font-semibold text-text dark:text-[#EDEDED] mb-2">{title}</h3>
      {description && (
        <p className="text-small text-text-muted dark:text-[#888888] max-w-xs mb-6">{description}</p>
      )}
      {onRetry && (
        <Button variant="secondary" onClick={onRetry}>
          <RefreshCw size={16} strokeWidth={1.5} /> Réessayer
        </Button>
      )}
    </div>
  )
}
```

---

## États Désactivés

```jsx
// Éléments natifs (button, input) — via prop disabled + classes Tailwind
<button
  disabled
  className="... disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none"
/>

// Éléments non-natifs (div, section)
<div className={isDisabled ? 'opacity-40 cursor-not-allowed pointer-events-none select-none' : ''}>
  Contenu
</div>
```

Règle : jamais de couleur grise différente. L'opacité seule (`opacity-40`) préserve la cohérence des thèmes.

---

## Toast / Notifications

`src/components/ui/Toast.jsx` + `src/hooks/useToast.jsx`

```jsx
// src/components/ui/Toast.jsx
import { useEffect } from 'react'
import { X, Info, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react'

const ICONS = {
  neutral: <Info size={16} strokeWidth={1.5} className="text-text-muted" />,
  success: <CheckCircle size={16} strokeWidth={1.5} className="text-success" />,
  error:   <AlertCircle size={16} strokeWidth={1.5} className="text-error" />,
  warning: <AlertTriangle size={16} strokeWidth={1.5} className="text-warning" />,
}

export default function Toast({ message, type = 'neutral', onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 4000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div
      className="fixed bottom-6 right-6 z-toast flex items-center gap-3 bg-bg dark:bg-[#0A0A0A] border border-border dark:border-[#333333] rounded-lg shadow-2 px-4 py-3 text-small font-sans min-w-[280px] max-w-xs"
      style={{ animation: 'enter 300ms var(--ease-out)' }}
      role="alert"
    >
      <span className="shrink-0">{ICONS[type]}</span>
      <p className="text-text dark:text-[#EDEDED] flex-1">{message}</p>
      <button
        onClick={onDismiss}
        className="text-text-muted hover:text-text dark:text-[#888888] dark:hover:text-[#EDEDED] transition-colors duration-150 shrink-0"
        aria-label="Fermer"
      >
        <X size={14} strokeWidth={1.5} />
      </button>
    </div>
  )
}
```

```jsx
// src/hooks/useToast.jsx
import { useState } from 'react'
import Toast from '../components/ui/Toast'

export function useToast() {
  const [toast, setToast] = useState(null)
  const show = (message, type = 'neutral') => setToast({ message, type })
  const dismiss = () => setToast(null)
  const ToastComponent = toast ? <Toast {...toast} onDismiss={dismiss} /> : null
  return { show, ToastComponent }
}
```

### Usage
```jsx
import { useToast } from '../hooks/useToast.jsx'

function MyPage() {
  const { show, ToastComponent } = useToast()

  return (
    <div>
      {ToastComponent}
      <Button onClick={() => show('Sauvegardé avec succès.', 'success')}>
        Sauvegarder
      </Button>
    </div>
  )
}
```
