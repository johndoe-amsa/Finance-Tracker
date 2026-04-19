import { useState, useEffect, useRef, useReducer } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { useSearchTransactions } from '../../hooks/useSearchTransactions'
import { useCategories } from '../../hooks/useCategories'
import TransactionList from '../transaction/TransactionList'
import EmptyState from '../ui/EmptyState'
import Skeleton from '../ui/Skeleton'

const CLOSE_DURATION = 170

function filterReducer(state, action) {
  switch (action.type) {
    case 'SET_TERM': return { ...state, term: action.value }
    case 'SET_TYPE': return { ...state, txType: action.value }
    case 'SET_CATEGORY': return { ...state, categoryId: action.value }
    case 'SET_AMOUNT_MIN': return { ...state, amountMin: action.value }
    case 'SET_AMOUNT_MAX': return { ...state, amountMax: action.value }
    case 'SET_DATE_FROM': return { ...state, dateFrom: action.value }
    case 'SET_DATE_TO': return { ...state, dateTo: action.value }
    case 'SET_AUTO': return { ...state, isAuto: action.value }
    case 'RESET': return initialFilters
    default: return state
  }
}

const initialFilters = {
  term: '',
  txType: '',
  categoryId: '',
  amountMin: '',
  amountMax: '',
  dateFrom: '',
  dateTo: '',
  isAuto: false,
}

export default function SearchModal({ open, onClose, onItemClick, onVerify, hasModalAbove = false }) {
  const [render, setRender] = useState(open)
  const [closing, setClosing] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, dispatch] = useReducer(filterReducer, initialFilters)
  const [debouncedTerm, setDebouncedTerm] = useState('')
  const inputRef = useRef(null)

  const { data: categories = [] } = useCategories()

  const hasAnyFilter = filters.term || filters.txType || filters.categoryId || filters.amountMin || filters.amountMax || filters.dateFrom || filters.dateTo || filters.isAuto
  const shouldSearch = debouncedTerm.length >= 2 || filters.txType || filters.categoryId || filters.amountMin || filters.amountMax || filters.dateFrom || filters.dateTo || filters.isAuto

  const { data: results, isLoading } = useSearchTransactions({
    term: debouncedTerm,
    type: filters.txType || undefined,
    categoryId: filters.categoryId || undefined,
    amountMin: filters.amountMin || undefined,
    amountMax: filters.amountMax || undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    isAuto: filters.isAuto || undefined,
    enabled: render && shouldSearch,
  })

  // Debounce search term
  useEffect(() => {
    const t = setTimeout(() => setDebouncedTerm(filters.term), 300)
    return () => clearTimeout(t)
  }, [filters.term])

  // Open/close render logic
  useEffect(() => {
    if (open) {
      setRender(true)
      setClosing(false)
      return
    }
    if (!render) return
    setClosing(true)
    const t = setTimeout(() => {
      setRender(false)
      setClosing(false)
    }, CLOSE_DURATION)
    return () => clearTimeout(t)
  }, [open, render])

  // Focus input on open
  useEffect(() => {
    if (open && render) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, render])

  // Escape key — suppressed when a modal is stacked above (e.g. edit modal opened from results)
  useEffect(() => {
    if (!open || hasModalAbove) return
    const handleKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose, hasModalAbove])

  // Lock scroll — position:fixed is required for iOS Safari which ignores overflow:hidden on body
  useEffect(() => {
    if (!render) return
    const scrollY = window.scrollY
    document.body.style.overflow = 'hidden'
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      window.scrollTo(0, scrollY)
    }
  }, [render])

  if (!render) return null

  const state = closing ? 'closed' : 'open'

  // Don't close search when opening a transaction detail — the edit modal
  // opens on top and search stays visible underneath with state preserved.
  const handleItemClick = (tx) => {
    onItemClick(tx)
  }

  const filteredCategories = filters.txType
    ? categories.filter((c) => c.type === filters.txType)
    : categories

  const activeFilterCount = [filters.txType, filters.categoryId, filters.amountMin, filters.amountMax, filters.dateFrom, filters.dateTo, filters.isAuto].filter(Boolean).length

  return (
    <div
      data-state={state}
      className="modal-backdrop fixed inset-0 z-modal bg-bg dark:bg-dark-bg"
    >
      <div
        data-state={state}
        className="search-modal h-full flex flex-col"
      >
        {/* Search header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border dark:border-dark-border">
          <Search size={18} strokeWidth={1.5} className="text-text-muted dark:text-dark-text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Rechercher une transaction..."
            value={filters.term}
            onChange={(e) => dispatch({ type: 'SET_TERM', value: e.target.value })}
            className="flex-1 bg-transparent text-text dark:text-dark-text text-small font-sans placeholder:text-text-subtle dark:placeholder:text-dark-text-subtle outline-none"
          />
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`relative p-1.5 rounded-md transition-colors duration-150 ${showFilters ? 'bg-bg-secondary dark:bg-dark-bg-tertiary' : ''} text-text-muted dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text`}
            aria-label="Filtres"
          >
            <SlidersHorizontal size={18} strokeWidth={1.5} />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center bg-accent dark:bg-dark-accent text-bg dark:text-dark-accent-text text-label font-bold rounded-full px-1">
                {activeFilterCount}
              </span>
            )}
          </button>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text dark:text-dark-text-muted dark:hover:text-dark-text transition-colors duration-150 p-1"
            aria-label="Fermer"
          >
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="px-4 py-3 border-b border-border dark:border-dark-border space-y-3" style={{ animation: 'enter 200ms var(--ease-out) both' }}>
            {/* Auto filter */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-text-muted dark:text-dark-text-muted w-16 shrink-0">Origine</span>
              <div className="flex gap-1.5">
                {[
                  { value: false, label: 'Toutes' },
                  { value: true, label: 'Automatiques' },
                ].map((opt) => (
                  <button
                    key={String(opt.value)}
                    onClick={() => dispatch({ type: 'SET_AUTO', value: opt.value })}
                    className={`px-3 py-1 text-[12px] font-medium rounded-full transition-colors duration-150 ${
                      filters.isAuto === opt.value
                        ? 'bg-accent dark:bg-dark-accent text-bg dark:text-dark-accent-text'
                        : 'bg-bg-secondary dark:bg-dark-bg-tertiary text-text-muted dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Type filter */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-text-muted dark:text-dark-text-muted w-16 shrink-0">Type</span>
              <div className="flex gap-1.5">
                {[
                  { value: '', label: 'Tous' },
                  { value: 'expense', label: 'Depenses' },
                  { value: 'income', label: 'Revenus' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => dispatch({ type: 'SET_TYPE', value: opt.value })}
                    className={`px-3 py-1 text-[12px] font-medium rounded-full transition-colors duration-150 ${
                      filters.txType === opt.value
                        ? 'bg-accent dark:bg-dark-accent text-bg dark:text-dark-accent-text'
                        : 'bg-bg-secondary dark:bg-dark-bg-tertiary text-text-muted dark:text-dark-text-muted hover:text-text dark:hover:text-dark-text'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category filter */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-text-muted dark:text-dark-text-muted w-16 shrink-0">Categorie</span>
              <select
                value={filters.categoryId}
                onChange={(e) => dispatch({ type: 'SET_CATEGORY', value: e.target.value })}
                className="flex-1 h-8 pl-2 pr-6 rounded-md text-[12px] text-text dark:text-dark-text bg-bg-secondary dark:bg-dark-bg-tertiary border border-border dark:border-dark-border appearance-none"
              >
                <option value="">Toutes</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ${c.name}` : c.name}</option>
                ))}
              </select>
            </div>

            {/* Amount range */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-text-muted dark:text-dark-text-muted w-16 shrink-0">Montant</span>
              <input
                type="number"
                placeholder="Min"
                value={filters.amountMin}
                onChange={(e) => dispatch({ type: 'SET_AMOUNT_MIN', value: e.target.value })}
                className="w-24 h-8 px-2 rounded-md text-[12px] text-text dark:text-dark-text bg-bg-secondary dark:bg-dark-bg-tertiary border border-border dark:border-dark-border placeholder:text-text-subtle dark:placeholder:text-dark-text-subtle"
                inputMode="decimal"
              />
              <span className="text-[12px] text-text-muted">—</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.amountMax}
                onChange={(e) => dispatch({ type: 'SET_AMOUNT_MAX', value: e.target.value })}
                className="w-24 h-8 px-2 rounded-md text-[12px] text-text dark:text-dark-text bg-bg-secondary dark:bg-dark-bg-tertiary border border-border dark:border-dark-border placeholder:text-text-subtle dark:placeholder:text-dark-text-subtle"
                inputMode="decimal"
              />
            </div>

            {/* Date range */}
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-medium text-text-muted dark:text-dark-text-muted w-16 shrink-0">Periode</span>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => dispatch({ type: 'SET_DATE_FROM', value: e.target.value })}
                className="flex-1 h-8 px-2 rounded-md text-[12px] text-text dark:text-dark-text bg-bg-secondary dark:bg-dark-bg-tertiary border border-border dark:border-dark-border"
              />
              <span className="text-[12px] text-text-muted">—</span>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => dispatch({ type: 'SET_DATE_TO', value: e.target.value })}
                className="flex-1 h-8 px-2 rounded-md text-[12px] text-text dark:text-dark-text bg-bg-secondary dark:bg-dark-bg-tertiary border border-border dark:border-dark-border"
              />
            </div>

            {/* Reset */}
            {hasAnyFilter && (
              <button
                onClick={() => dispatch({ type: 'RESET' })}
                className="text-[12px] font-medium text-error hover:underline"
              >
                Reinitialiser les filtres
              </button>
            )}
          </div>
        )}

        {/* Results */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
          {!shouldSearch ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Search size={40} strokeWidth={1} className="text-text-subtle dark:text-dark-text-subtle mb-3" />
              <p className="text-small text-text-muted dark:text-dark-text-muted">
                Tapez au moins 2 caracteres ou appliquez un filtre
              </p>
            </div>
          ) : isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : !results || results.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Aucun resultat"
              description="Essayez avec d'autres termes ou filtres."
            />
          ) : (
            <div>
              <p className="text-label text-text-muted dark:text-dark-text-muted mb-3">
                {results.length} resultat{results.length > 1 ? 's' : ''}
              </p>
              <TransactionList
                transactions={results}
                onItemClick={handleItemClick}
                onVerify={onVerify}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
