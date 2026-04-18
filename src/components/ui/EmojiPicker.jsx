import { useState } from 'react'

// Un seul champ natif — l'utilisateur ouvre son clavier emoji OS
// (Win+. sur Windows, Ctrl+Cmd+Espace sur macOS, clavier emoji sur iOS/Android)
// et tape ou colle n'importe quel emoji Unicode.
export default function EmojiPicker({ value, onChange }) {
  const [text, setText] = useState(value || '')

  const handleChange = (e) => {
    const arr = Array.from(e.target.value)
    const last = arr.length ? arr[arr.length - 1] : ''
    setText(last)
    onChange(last || null)
  }

  const clear = () => {
    setText('')
    onChange(null)
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className="w-10 h-10 flex items-center justify-center rounded-md bg-bg dark:bg-[#18181b] border border-border dark:border-[#52525b] text-[22px] leading-none shrink-0"
        aria-hidden
      >
        {value || '·'}
      </span>
      <input
        type="text"
        inputMode="text"
        autoComplete="off"
        placeholder="Win+. · Ctrl+Cmd+Espace · clavier emoji"
        value={text}
        onChange={handleChange}
        className="flex-1 h-10 px-3 rounded-md text-small bg-bg dark:bg-[#18181b] border border-border dark:border-[#52525b] text-text dark:text-[#EDEDED] placeholder:text-text-subtle dark:placeholder:text-[#71717a] focus:outline-none focus:border-border-focus focus:ring-[3px] focus:ring-black/[0.08]"
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          className="text-[12px] font-medium text-error hover:underline shrink-0"
        >
          Retirer
        </button>
      )}
    </div>
  )
}
