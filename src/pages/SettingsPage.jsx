import { useState, useEffect } from 'react'
import { Plus, LogOut, Moon, Sun, ChevronRight, ChevronLeft, Tag } from 'lucide-react'
import {
  useCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
} from '../hooks/useCategories'
import { db } from '../lib/supabase'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Skeleton from '../components/ui/Skeleton'
import CategoryItem from '../components/category/CategoryItem'
import CategoryForm from '../components/category/CategoryForm'

export default function SettingsPage() {
  const { data: categories = [], isLoading } = useCategories()
  const createMutation = useCreateCategory()
  const updateMutation = useUpdateCategory()
  const deleteMutation = useDeleteCategory()

  const [activeSub, setActiveSub] = useState(null) // null | 'expense' | 'income'
  const [addType, setAddType] = useState(null)
  const [editCat, setEditCat] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [txCount, setTxCount] = useState(0)
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return false
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [activeSub])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
    const themeColor = document.querySelector('meta[name="theme-color"]')
    if (themeColor) themeColor.content = dark ? '#18181b' : '#FFFFFF'
    const statusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]')
    if (statusBar) statusBar.content = dark ? 'black' : 'default'
  }, [dark])

  useEffect(() => {
    if (!editCat) {
      setTxCount(0)
      return
    }
    db.from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('category_id', editCat.id)
      .then(({ count }) => setTxCount(count || 0))
  }, [editCat])

  const expenseCategories = categories.filter((c) => c.type === 'expense')
  const incomeCategories = categories.filter((c) => c.type === 'income')

  const handleCreate = (data) => {
    createMutation.mutate(data, { onSuccess: () => setAddType(null) })
  }

  const handleUpdate = (data) => {
    updateMutation.mutate({ id: editCat.id, ...data }, { onSuccess: () => setEditCat(null) })
  }

  const handleDelete = () => {
    deleteMutation.mutate(editCat.id, {
      onSuccess: () => {
        setEditCat(null)
        setConfirmDelete(false)
      },
    })
  }

  const handleLogout = async () => {
    await db.auth.signOut()
    window.location.reload()
  }

  // ── Sub-panel : category list ──────────────────────────────────────────────
  if (activeSub) {
    const items = activeSub === 'expense' ? expenseCategories : incomeCategories
    const label = activeSub === 'expense' ? 'dépenses' : 'revenus'

    return (
      <div className="pb-24 page-transition">
        {/* Header */}
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveSub(null)}
              className="-ml-1 p-1 flex items-center text-text-muted hover:text-text dark:text-[#a1a1aa] dark:hover:text-[#EDEDED] transition-colors duration-150"
            >
              <ChevronLeft size={20} strokeWidth={1.5} />
            </button>
            <h2 className="text-h3 text-text dark:text-[#EDEDED]">
              Catégories de {label}
            </h2>
          </div>
          <Button variant="secondary" size="sm" onClick={() => setAddType(activeSub)}>
            <Plus size={16} strokeWidth={1.5} /> Ajouter
          </Button>
        </div>

        {/* List */}
        <div className="px-4">
          {isLoading ? (
            <div className="bg-bg-secondary dark:bg-[#1f1f23] border border-border dark:border-[#52525b] rounded-lg p-4 space-y-3">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ) : (
            <div className="bg-bg-secondary dark:bg-[#1f1f23] border border-border dark:border-[#52525b] rounded-lg divide-y divide-border dark:divide-[#52525b] overflow-hidden">
              {items.length === 0 ? (
                <p className="p-4 text-small text-text-muted dark:text-[#a1a1aa] text-center">
                  Aucune catégorie
                </p>
              ) : (
                items.map((cat) => (
                  <CategoryItem key={cat.id} category={cat} onClick={() => setEditCat(cat)} />
                ))
              )}
            </div>
          )}
        </div>

        {/* Modals */}
        <Modal
          open={!!addType}
          onClose={() => setAddType(null)}
          title={`Ajouter une catégorie de ${addType === 'expense' ? 'dépenses' : 'revenus'}`}
        >
          {addType && (
            <CategoryForm type={addType} onSubmit={handleCreate} loading={createMutation.isPending} />
          )}
        </Modal>

        <Modal open={!!editCat} onClose={() => setEditCat(null)} title="Modifier la catégorie">
          {editCat && (
            <CategoryForm
              category={editCat}
              type={editCat.type}
              transactionCount={txCount}
              onSubmit={handleUpdate}
              onDelete={() => setConfirmDelete(true)}
              loading={updateMutation.isPending}
            />
          )}
        </Modal>

        <ConfirmDialog
          open={confirmDelete}
          onClose={() => setConfirmDelete(false)}
          onConfirm={handleDelete}
          title="Supprimer la catégorie"
          message={
            txCount > 0
              ? `${txCount} transaction${txCount > 1 ? 's' : ''} ${txCount > 1 ? 'sont liées' : 'est liée'} à cette catégorie. La catégorie sera retirée de ces transactions. Continuer ?`
              : 'Êtes-vous sûr de vouloir supprimer cette catégorie ?'
          }
          confirmLabel="Supprimer"
          loading={deleteMutation.isPending}
        />
      </div>
    )
  }

  // ── Main settings view ─────────────────────────────────────────────────────
  return (
    <div className="pb-24 page-transition">
      <div className="px-4 py-4">
        <h2 className="text-h3 text-text dark:text-[#EDEDED]">Paramètres</h2>
      </div>

      {/* ── Apparence ── */}
      <div className="px-4 mb-6">
        <h3 className="text-label uppercase tracking-[0.05em] text-text-muted dark:text-[#a1a1aa] mb-3">
          Apparence
        </h3>
        <div className="bg-bg-secondary dark:bg-[#1f1f23] border border-border dark:border-[#52525b] rounded-lg overflow-hidden">
          <button
            onClick={() => setDark(!dark)}
            className="w-full flex items-center justify-between p-4 hover:bg-bg-tertiary dark:hover:bg-[#27272a] transition-colors duration-150"
          >
            <div className="flex items-center gap-3">
              {dark ? (
                <Sun size={16} strokeWidth={1.5} className="text-text-muted dark:text-[#a1a1aa]" />
              ) : (
                <Moon size={16} strokeWidth={1.5} className="text-text-muted" />
              )}
              <span className="text-small font-medium text-text dark:text-[#EDEDED]">
                {dark ? 'Mode clair' : 'Mode sombre'}
              </span>
            </div>
            {/* Toggle switch */}
            <div
              className={`w-10 h-6 rounded-full relative transition-colors duration-200 ${
                dark ? 'bg-success' : 'bg-border dark:bg-[#52525b]'
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                  dark ? 'translate-x-5' : 'translate-x-1'
                }`}
              />
            </div>
          </button>
        </div>
      </div>

      {/* ── Catégories ── */}
      <div className="px-4 mb-6">
        <h3 className="text-label uppercase tracking-[0.05em] text-text-muted dark:text-[#a1a1aa] mb-3">
          Catégories
        </h3>
        <div className="bg-bg-secondary dark:bg-[#1f1f23] border border-border dark:border-[#52525b] rounded-lg divide-y divide-border dark:divide-[#52525b] overflow-hidden">
          <button
            onClick={() => setActiveSub('expense')}
            className="w-full flex items-center justify-between p-4 hover:bg-bg-tertiary dark:hover:bg-[#27272a] transition-colors duration-150"
          >
            <div className="flex items-center gap-3">
              <Tag size={16} strokeWidth={1.5} className="text-text-muted dark:text-[#a1a1aa]" />
              <span className="text-small font-medium text-text dark:text-[#EDEDED]">Dépenses</span>
            </div>
            <div className="flex items-center gap-2">
              {!isLoading && (
                <span className="text-small text-text-muted dark:text-[#a1a1aa]">
                  {expenseCategories.length}
                </span>
              )}
              <ChevronRight size={16} strokeWidth={1.5} className="text-text-muted dark:text-[#a1a1aa]" />
            </div>
          </button>

          <button
            onClick={() => setActiveSub('income')}
            className="w-full flex items-center justify-between p-4 hover:bg-bg-tertiary dark:hover:bg-[#27272a] transition-colors duration-150"
          >
            <div className="flex items-center gap-3">
              <Tag size={16} strokeWidth={1.5} className="text-text-muted dark:text-[#a1a1aa]" />
              <span className="text-small font-medium text-text dark:text-[#EDEDED]">Revenus</span>
            </div>
            <div className="flex items-center gap-2">
              {!isLoading && (
                <span className="text-small text-text-muted dark:text-[#a1a1aa]">
                  {incomeCategories.length}
                </span>
              )}
              <ChevronRight size={16} strokeWidth={1.5} className="text-text-muted dark:text-[#a1a1aa]" />
            </div>
          </button>
        </div>
      </div>

      {/* ── Compte ── */}
      <div className="px-4 mb-6">
        <h3 className="text-label uppercase tracking-[0.05em] text-text-muted dark:text-[#a1a1aa] mb-3">
          Compte
        </h3>
        <div className="bg-bg-secondary dark:bg-[#1f1f23] border border-border dark:border-[#52525b] rounded-lg overflow-hidden">
          <button
            onClick={() => setConfirmLogout(true)}
            className="w-full flex items-center gap-3 p-4 hover:bg-bg-tertiary dark:hover:bg-[#27272a] transition-colors duration-150"
          >
            <LogOut size={16} strokeWidth={1.5} className="text-error" />
            <span className="text-small font-medium text-error">Se déconnecter</span>
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={handleLogout}
        title="Déconnexion"
        message="Êtes-vous sûr de vouloir vous déconnecter ?"
        confirmLabel="Se déconnecter"
      />
    </div>
  )
}
