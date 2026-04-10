---
name: design-system-react-vercel
description: >
  Charte graphique personnalisée de Flo — applications React déployées sur Vercel.
  DOIT être utilisé pour TOUTE création d'application React : dashboards, outils browser,
  applications multi-pages, interfaces de données, ou tout projet front-end complexe
  destiné à être utilisé en dehors de Claude. Déclencher dès qu'il est question de
  React, application web, dashboard, Vercel, projet front-end, ou interface complexe
  — même sans mention explicite du design system.
---

# Flo Design System — React + Vercel

Ce skill est conçu pour **Claude Code**. Il génère des applications React complètes,
déployées automatiquement sur Vercel.

L'utilisateur est débutant : générer un projet entièrement fonctionnel sans étape
manuelle technique de sa part. Il crée le repo GitHub vide, Claude Code fait tout le reste.

---

## Modes d'utilisation

### Mode GÉNÉRATION (principal)
Quand l'utilisateur demande de créer une application :
1. Lire ce fichier + les références pertinentes (voir § Fichiers de référence)
2. Demander le nom du repo GitHub si non précisé
3. Générer la structure complète du projet (voir § Structure du projet)
4. Respecter strictement tous les tokens et règles de design ci-dessous
5. Livrer avec les instructions de démarrage (voir § Instructions à donner à l'utilisateur)

### Mode AUDIT
Quand l'utilisateur fournit du code React existant à vérifier :
1. Lire ce fichier + les références pertinentes
2. Lister chaque violation : `❌ Violation` → `Règle` → `✅ Correction`

### Règle de contraste contextuel
Un composant peut légitimement utiliser un token de fond différent si le token de référence
crée une collision visuelle avec son conteneur parent. Signaler comme **NOTE** plutôt
que **VIOLATION** dans ce cas.

---

## Fichiers de référence

Lire le fichier approprié **avant** de générer :

| Besoin | Fichier | Quand le lire |
|---|---|---|
| Boutons, inputs, cartes, modales, badges, tableaux, navigation, tab bar, search | `references/components.md` | Dès qu'un composant UI est impliqué |
| Graphiques, charts, KPI cards, data-viz (Recharts) | `references/data-viz.md` | Dès qu'il y a un graphique ou données |
| Animations, skeleton loaders, états vides/erreur/disabled, toasts, modales, dropdowns, transitions de route | `references/motion-states.md` | Dès qu'il y a du mouvement ou des états spéciaux |

---

## Structure du projet (générer TOUJOURS ces fichiers)

```
nom-du-projet/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   └── ui/                 ← Button, Card, Badge, Modal, etc.
│   ├── pages/                  ← Pages de l'application (si multi-pages)
│   ├── hooks/                  ← Hooks custom si nécessaire
│   ├── data/
│   │   └── index.js            ← Données constantes / mock data
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── vercel.json                 ← Règle SPA rewrite (routes directes)
└── README.md
```

---

## Fichiers de configuration (templates exacts)

### `package.json`

```json
{
  "name": "NOM_DU_PROJET",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev":     "vite",
    "build":   "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react":            "^18.3.1",
    "react-dom":        "^18.3.1",
    "react-router-dom": "^6.27.0",
    "recharts":         "^2.13.3",
    "lucide-react":     "^0.462.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.3",
    "autoprefixer":         "^10.4.20",
    "postcss":              "^8.4.49",
    "tailwindcss":          "^3.4.15",
    "vite":                 "^5.4.11"
  }
}
```

### `vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
})
```

### `postcss.config.js`

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### `vercel.json`

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Ce fichier est **indispensable** pour React Router : sans lui, les routes comme `/dashboard`
ou `/transactions` retourneraient un 404 sur Vercel lors d'un accès direct ou d'un refresh.

### `tailwind.config.js`

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg:              '#FFFFFF',
        'bg-secondary':  '#FAFAFA',
        'bg-tertiary':   '#F2F2F2',
        text:            '#111111',
        'text-muted':    '#666666',
        'text-subtle':   '#999999',
        border:          '#EAEAEA',
        'border-strong': '#000000',
        'border-focus':  '#000000',
        accent:          '#000000',
        'accent-text':   '#FFFFFF',
        success:         '#16A34A',
        error:           '#EE0000',
        warning:         '#F5A623',
        'data-1':        '#0070F3',
        'data-2':        '#06B6D4',
        'data-3':        '#7928CA',
        'data-4':        '#FF0080',
        'data-5':        '#FF4D4D',
        'data-6':        '#F5A623',
        'data-7':        '#10B981',
        // Tokens dark — utiliser via dark: prefix (ex: dark:bg-dark-bg)
        // Évite les valeurs hex dispersées dans les composants
        'dark-bg':           '#000000',
        'dark-bg-secondary': '#0A0A0A',
        'dark-bg-tertiary':  '#111111',
        'dark-text':         '#EDEDED',
        'dark-text-muted':   '#888888',
        'dark-text-subtle':  '#555555',
        'dark-border':       '#333333',
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['Geist Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        h1:    ['42px', { fontWeight: '700', lineHeight: '1.1',  letterSpacing: '-0.04em' }],
        h2:    ['28px', { fontWeight: '600', lineHeight: '1.2',  letterSpacing: '-0.03em' }],
        h3:    ['20px', { fontWeight: '600', lineHeight: '1.3',  letterSpacing: '-0.02em' }],
        body:  ['16px', { lineHeight: '1.5' }],
        small: ['14px', { lineHeight: '1.5' }],
        label: ['12px', { fontWeight: '500', lineHeight: '1',    letterSpacing: '0.05em'  }],
        code:  ['13px', { lineHeight: '1.6' }],
      },
      borderRadius: {
        sm:   '6px',
        md:   '8px',
        lg:   '12px',
        full: '9999px',
      },
      boxShadow: {
        0: 'none',
        1: '0 4px 12px rgba(0,0,0,0.05)',
        2: '0 8px 32px rgba(0,0,0,0.08)',
      },
      zIndex: {
        dropdown: '100',
        sticky:   '150',
        modal:    '200',
        toast:    '300',
        tooltip:  '400',
      },
    },
  },
  plugins: [],
}
```

### `src/index.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --ease-out:    cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --backdrop:    blur(12px) saturate(1.8);
  --backdrop-bg: rgba(255, 255, 255, 0.85);
}

.dark {
  --backdrop-bg: rgba(0, 0, 0, 0.85);
}

*:focus         { outline: none; }
*:focus-visible {
  outline:        2px solid #000000;
  outline-offset: 2px;
  border-radius:  6px;
}
.dark *:focus-visible { outline-color: #FFFFFF; }

@keyframes pulse-skeleton {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
@keyframes enter {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes exit {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(4px); }
}
@keyframes modal-in {
  from { opacity: 0; transform: translateY(8px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0)   scale(1); }
}
@keyframes modal-out {
  from { opacity: 1; transform: translateY(0)   scale(1); }
  to   { opacity: 0; transform: translateY(8px) scale(0.98); }
}
@keyframes dropdown-in {
  from { opacity: 0; transform: translateY(-4px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0)    scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration:  0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### `index.html`

```html
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>NOM_DE_L_APPLICATION</title>
    <link rel="icon" type="image/svg+xml" href="./favicon.svg" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

### `src/main.jsx`

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

---

## Routing (React Router)

Toujours utiliser `BrowserRouter` (Vercel gère le routing côté serveur via `vercel.json`) :

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Nav from './components/ui/Nav'
import Dashboard from './pages/Dashboard'
import Settings  from './pages/Settings'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-bg font-sans text-text">
        <Nav />
        <Routes>
          <Route path="/"         element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
```

**Règle absolue :** `BrowserRouter` uniquement. Ne jamais utiliser `HashRouter` (URLs avec `#`
ne sont pas nécessaires sur Vercel).

---

## 6 Principes Fondamentaux

1. **Le contenu est roi, l'interface est son cadre.** Générer uniquement ce qui sert la donnée. Ni section décorative, ni composant non demandé.
2. **Structure par la grille et le vide.** Espacement strict base 8px. Aucun bloc de couleur lourd.
3. **Typographie "Engineered".** Letter-spacing négatif sur les titres. Dense, technique, précis.
4. **États toujours visibles.** Focus, Hover, Active, Disabled — chaque état interactif est visuellement distinct.
5. **Élévation sans ombre lourde.** `backdrop-blur` + bordures pour détacher les éléments flottants.
6. **Perception de vitesse.** Animations UI ≤ 300ms. Skeleton loaders uniquement pour le chargement (jamais de spinner plein écran). Transitions instantanées sur les états hover/focus.

---

## Principe de Proportionnalité — OBLIGATOIRE

| Demande | Livrable attendu |
|---|---|
| Composant isolé | Fichier du composant uniquement |
| Page | Fichier de page + composants nécessaires |
| Application complète | Projet entier (voir § Structure du projet) |

Ne jamais ajouter ce qui n'a pas été demandé.

---

## Palette — Règles Strictes

- L'interface est **monochrome**. Noir, blanc, gris uniquement pour les éléments UI.
- `accent` / `accent-text` pour les boutons primaires et liens actifs.
- Couleurs sémantiques (`success`, `error`, `warning`) : états fonctionnels uniquement. Jamais décoratives.
- Couleurs `data-1` à `data-7` : **exclusivement** pour les graphiques Recharts.
- La couleur seule ne doit jamais être le seul vecteur d'information.

---

## Typographie

| Rôle | Classe Tailwind |
|---|---|
| Titre App (H1) | `text-h1 font-sans` |
| Titre Section (H2) | `text-h2 font-sans` |
| Titre Carte (H3) | `text-h3 font-sans` |
| Corps | `text-body font-sans` |
| Corps dense | `text-small font-sans` |
| Label / Surtitre | `text-label font-sans uppercase` |
| Code inline | `text-code font-mono bg-bg-tertiary px-1.5 py-0.5 rounded-sm` |

- Minimum : `text-label` (12px).
- Maximum 3 poids de fonte par interface.
- Labels uppercase → toujours `text-text-muted`.
- Valeurs numériques → `style={{ fontVariantNumeric: 'tabular-nums' }}`.

---

## Iconographie

- **Lucide React exclusivement** : `import { Search, ChevronRight } from 'lucide-react'`
- `strokeWidth={1.5}` (compact) ou `strokeWidth={2}` (accent). Constant dans toute l'interface.
- Tailles : `size={16}` (inline), `size={20}` (bouton), `size={24}` (accent max).

---

## Espacement & Layout

- Padding de page : `px-16 py-12` desktop → `md:px-8` → `px-4` mobile
- Padding interne d'une carte : `p-6`
- Breakpoints : `md:` 768px, `lg:` 1024px, `xl:` 1280px

### Layout Dashboard
```jsx
<div className="flex min-h-screen">
  <aside className="w-[260px] shrink-0 border-r border-border sticky top-0 h-screen overflow-y-auto" />
  <main className="flex-1 overflow-auto" />
</div>
```

---

## Dark Mode

Activé via la classe `dark` sur `<html>`. Prévoir un toggle dans la nav.

```jsx
const [dark, setDark] = useState(false)
useEffect(() => {
  document.documentElement.classList.toggle('dark', dark)
}, [dark])
```

Les tokens dark sont nommés dans `tailwind.config.js` — préférer les classes sémantiques
aux valeurs hex arbitraires dans les composants :

| Light | Classe dark préférée | Valeur hex (fallback) |
|---|---|---|
| `bg-bg` | `dark:bg-dark-bg` | `dark:bg-[#000000]` |
| `bg-bg-secondary` | `dark:bg-dark-bg-secondary` | `dark:bg-[#0A0A0A]` |
| `bg-bg-tertiary` | `dark:bg-dark-bg-tertiary` | `dark:bg-[#111111]` |
| `text-text` | `dark:text-dark-text` | `dark:text-[#EDEDED]` |
| `text-text-muted` | `dark:text-dark-text-muted` | `dark:text-[#888888]` |
| `text-text-subtle` | `dark:text-dark-text-subtle` | `dark:text-[#555555]` |
| `border-border` | `dark:border-dark-border` | `dark:border-[#333333]` |

---

## Élévation & Profondeur

| Niveau | Classe | Usage |
|---|---|---|
| 0 | `shadow-none` | Cartes par défaut |
| 1 | `shadow-1` | Card hover, dropdowns |
| 2 | `shadow-2` | Modales |

---

## React — Règles de code

- Tailwind d'abord. `hover:`, `focus:`, `disabled:`, `dark:` avant tout CSS custom.
- `useState` uniquement pour ce qui change. Valeurs dérivées = variables JS.
- Découper en composants si un pattern se répète ≥ 3 fois.
- `useEffect` uniquement pour les effets de bord réels.
- Données mock dans `src/data/index.js`, jamais inline dans le JSX.

---

## Accessibilité — Obligatoire

- `*:focus-visible` dans `index.css` — ne jamais supprimer.
- Tous les `<input>` ont un `<label>` associé.
- Modales : focus-trap + fermeture `Escape`.

---

## Interdictions Absolues

- Spinner plein écran → skeleton loaders
- Gradients décoratifs
- Shadow hors `shadow-1` / `shadow-2` / `shadow-none`
- Texte sous 12px
- Plus de 3 poids de fonte
- `z-index` arbitraires
- `HashRouter` → toujours `BrowserRouter` (Vercel gère le rewrite via `vercel.json`)

---



## Instructions à donner à l'utilisateur (après génération)

Après avoir généré et poussé le projet, Claude Code doit fournir ces instructions :

```
Ton projet est prêt. Voici comment le mettre en ligne :

1. Va sur github.com → bouton "New repository"
   - Nom : NOM_DU_REPO
   - ⚠️ Laisse tout décoché (pas de README, pas de .gitignore)
   - Clique "Create repository"

2. Dans ton terminal, depuis le dossier du projet :
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/TON_USERNAME/NOM_DU_REPO.git
   git push -u origin main

3. Va sur vercel.com → "Add New Project"
   - Importe ton repo GitHub
   - Framework Preset : Vite (détecté automatiquement)
   - Clique "Deploy"

4. ⚠️ Variables d'environnement : si l'app utilise Supabase ou d'autres services,
   ajoute-les dans Vercel → Settings → Environment Variables.

5. Ton app sera accessible à l'URL Vercel générée (ex: nom-du-repo.vercel.app).

Pour toute mise à jour : modifier le code, puis `git add . && git commit -m "..." && git push`.
Vercel redéploie automatiquement à chaque push sur main.
```
