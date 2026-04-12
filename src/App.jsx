import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { db } from './lib/supabase'
import { generateMissingSubscriptionTransactions } from './lib/subscriptionGenerator'
import { useUnverifiedCount } from './hooks/useUnverifiedCount'
import { useCreateTransaction } from './hooks/useTransactions'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import VerifyPage from './pages/VerifyPage'
import SubscriptionsPage from './pages/SubscriptionsPage'
import SettingsPage from './pages/SettingsPage'
import BottomNav from './components/layout/BottomNav'
import PageTransition from './components/layout/PageTransition'
import FAB from './components/layout/FAB'
import Modal from './components/ui/Modal'
import TransactionForm from './components/transaction/TransactionForm'
import ToastContainer from './components/ui/ToastContainer'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

function AppShell() {
  const [showAddTx, setShowAddTx] = useState(false)
  const createMutation = useCreateTransaction()

  useUnverifiedCount()

  const handleCreate = (data) => {
    createMutation.mutate(data, { onSuccess: () => setShowAddTx(false) })
  }

  return (
    <div className="min-h-screen bg-bg dark:bg-[#000000] font-sans text-text dark:text-[#EDEDED]">
      <main style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>
        <Routes>
          <Route path="/" element={<PageTransition><DashboardPage /></PageTransition>} />
          <Route path="/verify" element={<PageTransition><VerifyPage /></PageTransition>} />
          <Route path="/subscriptions" element={<PageTransition><SubscriptionsPage /></PageTransition>} />
          <Route path="/settings" element={<PageTransition><SettingsPage /></PageTransition>} />
        </Routes>
      </main>

      <FAB onClick={() => setShowAddTx(true)} />
      <BottomNav />

      <Modal open={showAddTx} onClose={() => setShowAddTx(false)} title="Ajouter une transaction">
        <TransactionForm onSubmit={handleCreate} loading={createMutation.isPending} />
      </Modal>
    </div>
  )
}

function AuthGate() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    db.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = db.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session && !initialized) {
      generateMissingSubscriptionTransactions()
        .catch(() => {})
        .finally(() => setInitialized(true))
    }
  }, [session, initialized])

  if (loading) {
    return (
      <div className="min-h-screen bg-bg dark:bg-dark-bg px-4 py-12">
        <div className="max-w-sm mx-auto space-y-4">
          <div className="bg-bg-secondary dark:bg-dark-bg-secondary border border-border dark:border-dark-border rounded-lg p-6">
            <div className="h-3 w-24 bg-bg-tertiary dark:bg-dark-bg-tertiary rounded-md mb-4" style={{ animation: 'pulse-skeleton 1.8s ease-in-out infinite' }} />
            <div className="h-8 w-32 bg-bg-tertiary dark:bg-dark-bg-tertiary rounded-md mb-2" style={{ animation: 'pulse-skeleton 1.8s ease-in-out infinite' }} />
            <div className="h-3 w-20 bg-bg-tertiary dark:bg-dark-bg-tertiary rounded-md" style={{ animation: 'pulse-skeleton 1.8s ease-in-out infinite' }} />
          </div>
        </div>
      </div>
    )
  }

  if (!session) {
    return <LoginPage onLogin={setSession} />
  }

  if (!initialized) {
    return (
      <div className="min-h-screen bg-bg dark:bg-dark-bg px-4 py-12">
        <div className="max-w-sm mx-auto space-y-4">
          <div className="bg-bg-secondary dark:bg-dark-bg-secondary border border-border dark:border-dark-border rounded-lg p-6">
            <div className="h-3 w-24 bg-bg-tertiary dark:bg-dark-bg-tertiary rounded-md mb-4" style={{ animation: 'pulse-skeleton 1.8s ease-in-out infinite' }} />
            <div className="h-8 w-32 bg-bg-tertiary dark:bg-dark-bg-tertiary rounded-md mb-2" style={{ animation: 'pulse-skeleton 1.8s ease-in-out infinite' }} />
            <div className="h-3 w-20 bg-bg-tertiary dark:bg-dark-bg-tertiary rounded-md" style={{ animation: 'pulse-skeleton 1.8s ease-in-out infinite' }} />
          </div>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthGate />
      <ToastContainer />
    </QueryClientProvider>
  )
}
