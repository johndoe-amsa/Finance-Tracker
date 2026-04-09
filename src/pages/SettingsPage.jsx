import { useState, useEffect } from 'react'
import { Plus, LogOut, Moon, Sun } from 'lucide-react'
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

  const [addType, setAddType] = useState(null)
  const [editCat, setEditCat] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)
  const [txCount, setTxCount] = useState(0)
  const [dark, setDark] = useState(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
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

  const renderCategorySection = (title, type, items) => (
    <div className="px-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-label uppercase tracking-[0.05em] text-text-muted dark:text-[#888888]">
          {title}
        </h3>
        <Button variant="ghost" size="sm" onClick={() => setAddType(type)}>
          <Plus size={16} strokeWidth={1.5} /> Ajouter
        </Button>
      </div>
      {isLoading ? (
        <div className="bg-bg-secondary dark:bg-[#0A0A0A] border border-border dark:border-[#333333] rounded-lg p-4 space-y-3">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
        </div>
      ) : (
        <div className="bg-bg-secondary dark:bg-[#0A0A0A] border border-border dark:border-[#333333] rounded-lg divide-y divide-border dark:divide-[#333333]">
          {items.length === 0 ? (
            <p className="p-4 text-small text-text-muted dark:text-[#888888] text-center">
              Aucune categorie
            </p>
          ) : (
            items.map((cat) => (
              <CategoryItem key={cat.id} category={cat} onClick={() => setEditCat(cat)} />
            ))
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="pb-24">
      <div className="px-4 py-4">
        <h2 className="text-h3 text-text dark:text-[#EDEDED]">Parametres</h2>
      </div>

      {renderCategorySection('Categories de depenses', 'expense', expenseCategories)}
      {renderCategorySection('Categories de revenus', 'income', incomeCategories)}

      {/* Dark mode toggle */}
      <div className="px-4 mb-4">
        <button
          onClick={() => setDark(!dark)}
          className="w-full flex items-center justify-between p-4 bg-bg-secondary dark:bg-[#0A0A0A] border border-border dark:border-[#333333] rounded-lg transition-colors duration-150 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            {dark ? (
              <Sun size={20} strokeWidth={1.5} className="text-text-muted dark:text-[#888888]" />
            ) : (
              <Moon size={20} strokeWidth={1.5} className="text-text-muted" />
            )}
            <span className="text-small font-medium text-text dark:text-[#EDEDED]">
              {dark ? 'Mode clair' : 'Mode sombre'}
            </span>
          </div>
        </button>
      </div>

      {/* Logout */}
      <div className="px-4">
        <Button
          variant="destructive"
          className="w-full justify-center"
          onClick={() => setConfirmLogout(true)}
        >
          <LogOut size={16} strokeWidth={1.5} /> Se deconnecter
        </Button>
      </div>

      {/* Add category */}
      <Modal
        open={!!addType}
        onClose={() => setAddType(null)}
        title={`Ajouter une categorie de ${addType === 'expense' ? 'depenses' : 'revenus'}`}
      >
        {addType && (
          <CategoryForm type={addType} onSubmit={handleCreate} loading={createMutation.isPending} />
        )}
      </Modal>

      {/* Edit category */}
      <Modal open={!!editCat} onClose={() => setEditCat(null)} title="Modifier la categorie">
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

      {/* Confirm delete category */}
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={handleDelete}
        title="Supprimer la categorie"
        message={
          txCount > 0
            ? `${txCount} transaction${txCount > 1 ? 's' : ''} ${txCount > 1 ? 'sont liees' : 'est liee'} a cette categorie. La categorie sera retiree de ces transactions. Continuer ?`
            : 'Etes-vous sur de vouloir supprimer cette categorie ?'
        }
        confirmLabel="Supprimer"
        loading={deleteMutation.isPending}
      />

      {/* Confirm logout */}
      <ConfirmDialog
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        onConfirm={handleLogout}
        title="Deconnexion"
        message="Etes-vous sur de vouloir vous deconnecter ?"
        confirmLabel="Se deconnecter"
      />
    </div>
  )
}
