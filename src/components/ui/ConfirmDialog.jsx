import Modal from './Modal'
import Button from './Button'

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirmer',
  loading = false,
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <p className="text-small text-text-muted dark:text-[#a1a1aa] mb-6">{message}</p>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose} disabled={loading}>
          Annuler
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={loading}>
          {loading ? 'Chargement...' : confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
