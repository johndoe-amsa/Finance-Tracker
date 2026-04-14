import { useState } from 'react'
import { db } from '../lib/supabase'
import Button from '../components/ui/Button'

export default function LoginPage({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data, error: authError } = await db.auth.signInWithPassword({
        email: 'user@tracker.local',
        password,
      })
      if (authError) throw authError
      onLogin(data.session)
    } catch {
      setError('Mot de passe incorrect.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg dark:bg-[#18181b] px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <img src="/favicon.svg" alt="Finance Tracker" className="w-16 h-16 mb-4" />
          <h1 className="text-h2 text-text dark:text-[#EDEDED]">Finance Tracker</h1>
          <p className="text-small text-text-muted dark:text-[#a1a1aa] mt-2 text-center">
            Entrez votre mot de passe pour acceder a vos finances.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-[13px] font-medium text-text-muted">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={[
                'h-10 px-3 rounded-md text-small text-text font-sans border transition-all duration-150',
                'bg-bg-secondary dark:bg-[#1f1f23]',
                'border-border focus:border-border-focus focus:ring-[3px] focus:ring-black/[0.08]',
                'focus:outline-none',
                'dark:text-[#EDEDED] dark:border-[#52525b]',
              ].join(' ')}
            />
          </div>

          {error && <p className="text-[13px] text-error">{error}</p>}

          <Button
            variant="primary"
            type="submit"
            disabled={loading || !password}
            className="w-full justify-center"
          >
            {loading ? 'Connexion...' : 'Entrer'}
          </Button>
        </form>
      </div>
    </div>
  )
}
