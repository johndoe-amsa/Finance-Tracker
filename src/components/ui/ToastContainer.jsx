import { useToastStore } from '../../store/useToastStore'
import Toast from './Toast'

export default function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-4 z-toast flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            message={toast.message}
            type={toast.type}
            onDismiss={() => dismiss(toast.id)}
          />
        </div>
      ))}
    </div>
  )
}
