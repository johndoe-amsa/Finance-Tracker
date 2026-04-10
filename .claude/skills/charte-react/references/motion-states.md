# Référence Motion Design & États Spéciaux — React

## Table des matières
1. [Règles Motion](#règles-motion)
2. [Skeleton / Loading](#skeleton--loading)
3. [États Vides](#états-vides)
4. [États d'Erreur](#états-derreur)
5. [États Désactivés](#états-désactivés)
6. [Toast / Notifications](#toast--notifications)
7. [Modal — Animation d'entrée/sortie](#modal--animation-dentréesortie)
8. [Dropdown — Animation d'entrée](#dropdown--animation-dentrée)
9. [Transitions de route](#transitions-de-route-react-router)

Les keyframes `pulse-skeleton`, `enter`, `exit`, `modal-in`, `modal-out`, `dropdown-in` sont définis dans `src/index.css`.

---

## Règles Motion

- Jamais d'animation UI > 300ms. Exception : `pulse-skeleton` (loop infinie, hors de ce seuil).
- Jamais `ease-in` sur les entrées.
- Animer uniquement `transform` et `opacity`. Exceptions : width du search field au focus.
- `prefers-reduced-motion` géré globalement dans `index.css`.

Durées Tailwind :
- Hover / micro-interaction : `duration-150`
- Transition d'état : `duration-200`
- Entrée de composant : `duration-300`

Keyframes disponibles (définis dans `src/index.css`) :

| Keyframe | Usage |
|---|---|
| `enter` | Entrée générique (fade-in + slide up 6px) |
| `exit` | Sortie générique (fade-out + slide down 4px) |
| `modal-in` | Entrée de modale (fade-in + slide up 8px + scale 0.98→1) |
| `modal-out` | Sortie de modale (inverse de modal-in) |
| `dropdown-in` | Entrée de dropdown (fade-in + slide down 4px + scale 0.98→1) |
| `pulse-skeleton` | Pulsation des skeleton loaders (1.8s loop) |

Easing custom (CSS vars) :
- `var(--ease-out)` → `cubic-bezier(0.16, 1, 0.3, 1)` — spring-like, pour les entrées
- `var(--ease-in-out)` → `cubic-bezier(0.4, 0, 0.2, 1)` — standard, pour les transitions d'état

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
      className="flex items-center gap-3 bg-bg dark:bg-[#0A0A0A] border border-border dark:border-[#333333] rounded-lg shadow-2 px-4 py-3 text-small font-sans min-w-[280px] max-w-xs"
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
import { useState, useCallback } from 'react'
import Toast from '../components/ui/Toast'

let _id = 0

export function useToast() {
  const [toasts, setToasts] = useState([])

  const show = useCallback((message, type = 'neutral') => {
    const id = ++_id
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const ToastContainer = (
    <div className="fixed bottom-6 right-6 z-toast flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onDismiss={() => dismiss(t.id)}
        />
      ))}
    </div>
  )

  return { show, ToastContainer }
}
```

### Usage
```jsx
import { useToast } from '../hooks/useToast.jsx'

function MyPage() {
  const { show, ToastContainer } = useToast()

  return (
    <div>
      <ToastContainer />
      <Button onClick={() => show('Sauvegardé avec succès.', 'success')}>
        Sauvegarder
      </Button>
    </div>
  )
}
```

---

## Modal — Animation d'entrée/sortie

Pattern complet avec `modal-in` / `modal-out` et gestion de l'état de fermeture animée :

```jsx
// src/components/ui/Modal.jsx
import { useEffect, useState } from 'react'

export default function Modal({ isOpen, onClose, children, title }) {
  const [visible, setVisible]   = useState(false)
  const [animOut, setAnimOut]   = useState(false)

  useEffect(() => {
    if (isOpen) { setAnimOut(false); setVisible(true) }
  }, [isOpen])

  function handleClose() {
    setAnimOut(true)
    setTimeout(() => { setVisible(false); onClose() }, 200)
  }

  // Fermeture Escape
  useEffect(() => {
    if (!visible) return
    const handler = (e) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [visible])

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center p-4"
      style={{
        backdropFilter: 'var(--backdrop)',
        backgroundColor: 'var(--backdrop-bg)',
        animation: animOut
          ? 'exit 200ms var(--ease-in-out) forwards'
          : 'enter 200ms var(--ease-out)',
      }}
      onClick={handleClose}
    >
      <div
        className="bg-bg dark:bg-[#0A0A0A] border border-border dark:border-[#333333] rounded-lg shadow-2 w-full max-w-md"
        style={{
          animation: animOut
            ? 'modal-out 200ms var(--ease-in-out) forwards'
            : 'modal-in 300ms var(--ease-out)',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border dark:border-[#333333]">
          <h2 id="modal-title" className="text-h3 font-sans text-text dark:text-[#EDEDED]">{title}</h2>
          <button
            onClick={handleClose}
            className="text-text-muted hover:text-text dark:text-[#888888] dark:hover:text-[#EDEDED] transition-colors duration-150"
            aria-label="Fermer"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  )
}
```

> **Règle :** Le backdrop utilise `--backdrop-bg` pour le fond semi-transparent et `--backdrop` pour le blur. Ne jamais utiliser de couleur fixe.
> Pour `components.md` → voir le composant Modal complet avec focus-trap.

---

## Dropdown — Animation d'entrée

```jsx
// Wrapper à appliquer sur le panneau du dropdown
<div
  style={{ animation: 'dropdown-in 150ms var(--ease-out)' }}
  className="absolute top-full mt-1 z-dropdown bg-bg dark:bg-[#0A0A0A] border border-border dark:border-[#333333] rounded-md shadow-1 py-1 min-w-[160px]"
>
  {/* items */}
</div>
```

Règle : `dropdown-in` uniquement sur l'entrée. Pas d'animation de sortie sur les dropdowns (retrait immédiat via `display:none` ou unmount conditionnel).

---

## Transitions de route (React Router)

Sans librairie externe. Basé sur `key` prop + keyframe `enter` :

```jsx
// src/App.jsx
import { useLocation, Routes, Route } from 'react-router-dom'

export default function App() {
  const location = useLocation()

  return (
    <div key={location.pathname} style={{ animation: 'enter 200ms var(--ease-out)' }}>
      <Routes location={location}>
        <Route path="/"         element={<Dashboard />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  )
}
```

> **Règle :** La durée est volontairement courte (200ms) pour ne pas ralentir la navigation. Ne pas animer les transitions de route vers des pages de données lourdes — le skeleton loader suffit.
