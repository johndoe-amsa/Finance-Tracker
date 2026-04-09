# Référence Data-Viz — Recharts

## Règles fondamentales

- Les graphiques sont **toujours** encapsulés dans un composant `<Card>`.
- Utiliser **Recharts** exclusivement (`recharts` est dans le `package.json`).
- Les couleurs `data-*` sont **exclusivement** pour les graphiques.
- **Pas de dégradés** sur les lignes ou barres. Fill area uniquement pour `AreaChart`.
- Les données de démo vont dans `src/data/index.js`, jamais inline.

---

## Constante de couleurs (dans `src/data/index.js`)

```js
export const DATA_COLORS = {
  1: '#0070F3',
  2: '#06B6D4',
  3: '#7928CA',
  4: '#FF0080',
  5: '#FF4D4D',
  6: '#F5A623',
  7: '#10B981',
  grid: '#EAEAEA',
  gridDark: '#333333',
}
```

---

## Import Recharts

```jsx
import {
  LineChart, BarChart, AreaChart, PieChart,
  Line, Bar, Area, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { DATA_COLORS } from '../../data'
```

---

## Tooltip personnalisé (toujours utiliser ce composant)

```jsx
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-bg dark:bg-[#0A0A0A] border border-border-strong dark:border-[#FFFFFF] rounded-md shadow-2 px-3 py-2 text-[12px] font-sans">
      <p className="text-text-muted dark:text-[#888888] mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="font-medium" style={{ color: entry.color }}>
          {entry.name} : {entry.value}
        </p>
      ))}
    </div>
  )
}
```

---

## Légende personnalisée

```jsx
function ChartLegend({ items }) {
  return (
    <div className="flex gap-4 flex-wrap">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2 text-[12px] text-text-muted dark:text-[#888888]">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} aria-hidden="true" />
          {item.label}
        </div>
      ))}
    </div>
  )
}
```

---

## Props d'axes standards (copier tel quel)

```jsx
<CartesianGrid vertical={false} stroke={DATA_COLORS.grid} strokeWidth={1} />

<XAxis
  dataKey="month"
  axisLine={false}
  tickLine={false}
  tick={{ fontSize: 12, fill: '#666666', fontFamily: 'Geist, system-ui, sans-serif' }}
/>

<YAxis
  axisLine={false}
  tickLine={false}
  width={48}
  tick={{ fontSize: 12, fill: '#666666', fontFamily: 'Geist, system-ui, sans-serif' }}
/>
```

---

## Line Chart (exemple complet)

`src/components/charts/RevenueChart.jsx`

```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardTitle } from '../ui/Card'
import { DATA_COLORS } from '../../data'

function ChartTooltip({ active, payload, label }) { /* ... voir ci-dessus */ }
function ChartLegend({ items }) { /* ... voir ci-dessus */ }

export default function RevenueChart({ data }) {
  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <CardTitle>Évolution des revenus</CardTitle>
        <ChartLegend items={[
          { label: 'Revenus',  color: DATA_COLORS[1] },
          { label: 'Dépenses', color: DATA_COLORS[5] },
        ]} />
      </div>
      <div style={{ height: 240 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke={DATA_COLORS.grid} strokeWidth={1} />
            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666666' }} />
            <YAxis axisLine={false} tickLine={false} width={48} tick={{ fontSize: 12, fill: '#666666' }} />
            <Tooltip content={<ChartTooltip />} />
            <Line type="monotone" dataKey="revenus"  stroke={DATA_COLORS[1]} strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="depenses" stroke={DATA_COLORS[5]} strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
```

---

## Bar Chart

```jsx
<BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="40%">
  <CartesianGrid vertical={false} stroke={DATA_COLORS.grid} strokeWidth={1} />
  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666666' }} />
  <YAxis axisLine={false} tickLine={false} width={40} tick={{ fontSize: 12, fill: '#666666' }} />
  <Tooltip content={<ChartTooltip />} />
  <Bar dataKey="value" fill={DATA_COLORS[1]} radius={[4, 4, 0, 0]} />
</BarChart>
```

---

## Area Chart

```jsx
<AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
  <defs>
    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%"  stopColor={DATA_COLORS[1]} stopOpacity={0.15} />
      <stop offset="95%" stopColor={DATA_COLORS[1]} stopOpacity={0} />
    </linearGradient>
  </defs>
  <CartesianGrid vertical={false} stroke={DATA_COLORS.grid} strokeWidth={1} />
  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666666' }} />
  <YAxis axisLine={false} tickLine={false} width={48} tick={{ fontSize: 12, fill: '#666666' }} />
  <Tooltip content={<ChartTooltip />} />
  <Area type="monotone" dataKey="value" stroke={DATA_COLORS[1]} strokeWidth={2} fill="url(#areaGrad)" />
</AreaChart>
```

Note : le dégradé (`fill`) est autorisé **uniquement dans la zone sous la courbe** d'un Area Chart.

---

## Pie Chart (toujours en donut)

```jsx
<PieChart>
  <Pie
    data={data}
    cx="50%"
    cy="50%"
    innerRadius={50}
    outerRadius={72}
    dataKey="value"
    paddingAngle={2}
  >
    {data.map((_, i) => (
      <Cell key={i} fill={DATA_COLORS[(i % 7) + 1]} />
    ))}
  </Pie>
  <Tooltip content={<ChartTooltip />} />
</PieChart>
```

`innerRadius` obligatoire — jamais de camembert plein.

---

## Règles strictes Recharts

- `dot={false}` sur les `<Line>` par défaut.
- `barCategoryGap="40%"` pour les bar charts.
- `innerRadius` obligatoire sur les `<Pie>`.
- `margin={{ top: 4, right: 4, left: 0, bottom: 0 }}` sur tous les charts.
- Hauteur du conteneur : `240px` (défaut), `200px` (compact), `320px` (large). Jamais en %.
- `strokeWidth={2}` sur toutes les lignes.
- `radius={[4, 4, 0, 0]}` sur les `<Bar>` (coins arrondis en haut uniquement).
