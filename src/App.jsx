import { useState, useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
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
          <Route path="/" element={<DashboardPage />} />
          <Route path="/verify" element={<VerifyPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
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
      <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-[#000000]">
        <div className="w-16 h-16 bg-accent dark:bg-[#EDEDED] text-accent-text dark:text-[#000000] rounded-lg flex items-center justify-center text-[32px] font-bold tracking-[-0.03em]">
          F
        </div>
      </div>
    )
  }

  if (!session) {
    return <LoginPage onLogin={setSession} />
  }

  if (!initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-[#000000]">
        <div className="w-16 h-16 bg-accent dark:bg-[#EDEDED] text-accent-text dark:text-[#000000] rounded-lg flex items-center justify-center text-[32px] font-bold tracking-[-0.03em]"
          style={{ animation: 'pulse-skeleton 1.8s ease-in-out infinite' }}
        >
          F
        </div>
      </div>
    )
  }

  return (
    <HashRouter>
      <AppShell />
    </HashRouter>
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
