import { useState, useMemo } from 'react'

// Emojis courants, regroupés par thème. Rendu natif sur iOS / Android /
// Windows / macOS / Linux — aucune dépendance externe requise.
const PRESETS = {
  Finance:   ['💰', '💵', '💳', '🏦', '📈', '📉', '💸', '🪙', '💹', '🧾'],
  Courses:   ['🛒', '🛍️', '🥖', '🥦', '🍎', '🥩', '🧀', '🍕', '🍔', '☕'],
  Maison:    ['🏠', '🛋️', '🛏️', '🚿', '🔌', '💡', '🔧', '🧹', '🧺', '🪴'],
  Transport: ['🚗', '⛽', '🚌', '🚆', '✈️', '🚕', '🛵', '🚲', '🅿️', '🛻'],
  Loisirs:   ['🎬', '🎮', '🎵', '📚', '🎨', '🎭', '🎟️', '🏀', '🎳', '🎉'],
  Santé:     ['💊', '🏥', '🩺', '🦷', '👓', '🧘', '🏋️', '🧴', '🩹', '❤️'],
  Divers:    ['📱', '💻', '🎁', '🐶', '🐱', '🌍', '☂️', '🔑', '📦', '✂️'],
}

export default function EmojiPicker({ value, onChange }) {
  const firstTab = Object.keys(PRESETS)[0]
  const [tab, setTab] = useState(firstTab)
  const [customOpen, setCustomOpen] = useState(false)
  const [custom, setCustom] = useState('')

  const tabs = useMemo(() => Object.keys(PRESETS), [])

  const handleCustomChange = (e) => {
    const raw = e.target.value
    // Un seul emoji : on garde le dernier caractère graphème.
    const arr = Array.from(raw)
    const last = arr.length ? arr[arr.length - 1] : ''
    setCustom(last)
    onChange(last || null)
  }

  const clear = () => {
    setCustom('')
    onChange(null)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="w-8 h-8 flex items-center justify-center rounded-md bg-bg dark:bg-[#18181b] border border-border dark:border-[#52525b] text-[18px] leading-none"
            aria-hidden
          >
            {value || '·'}
          </span>
          <button
            type="button"
            onClick={() => setCustomOpen((v) => !v)}
            className="text-[12px] font-medium text-text-muted dark:text-[#a1a1aa] hover:text-text dark:hover:text-[#EDEDED] underline-offset-2 hover:underline"
          >
            Autre…
          </button>
        </div>
        {value && (
          <button
            type="button"
            onClick={clear}
            className="text-[12px] font-medium text-error hover:underline"
          >
            Retirer
          </button>
        )}
      </div>

      {customOpen && (
        <input
          type="text"
          inputMode="text"
          autoComplete="off"
          placeholder="Tapez ou collez un emoji (Win+. / Ctrl+Cmd+Espace)"
          value={custom}
          onChange={handleCustomChange}
          className="w-full h-9 px-3 rounded-md text-small bg-bg dark:bg-[#18181b] border border-border dark:border-[#52525b] text-text dark:text-[#EDEDED] placeholder:text-text-subtle dark:placeholder:text-[#71717a] focus:outline-none focus:border-border-focus focus:ring-[3px] focus:ring-black/[0.08]"
        />
      )}

      <div className="flex flex-wrap gap-1">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-full transition-colors duration-150 ${
              tab === t
                ? 'bg-accent dark:bg-[#EDEDED] text-bg dark:text-[#000000]'
                : 'bg-bg-secondary dark:bg-[#27272a] text-text-muted dark:text-[#a1a1aa] hover:text-text dark:hover:text-[#EDEDED]'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-10 gap-1">
        {PRESETS[tab].map((emo) => {
          const selected = emo === value
          return (
            <button
              key={emo}
              type="button"
              onClick={() => onChange(emo)}
              className={`aspect-square flex items-center justify-center rounded-md text-[18px] leading-none transition-colors duration-100 ${
                selected
                  ? 'bg-accent/10 dark:bg-[#EDEDED]/10 ring-1 ring-accent dark:ring-[#EDEDED]'
                  : 'bg-bg dark:bg-[#18181b] border border-border dark:border-[#52525b] hover:bg-bg-tertiary dark:hover:bg-[#27272a]'
              }`}
              aria-label={`Choisir ${emo}`}
            >
              {emo}
            </button>
          )
        })}
      </div>
    </div>
  )
}
