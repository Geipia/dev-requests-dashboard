import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { LogIn, UserPlus, KeyRound, Code2 } from 'lucide-react'

const TABS = ['login', 'signup', 'reset']
const TAB_LABELS = { login: 'Connexion', signup: 'Inscription', reset: 'Mot de passe oublié' }

export default function Login() {
  const { user, signIn, signUp, resetPassword } = useAuth()
  const { addToast } = useToast()
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      if (tab === 'login') {
        await signIn(email, password)
      } else if (tab === 'signup') {
        await signUp(email, password)
        addToast('Compte créé ! Vérifiez votre email.', 'success')
        setTab('login')
      } else {
        await resetPassword(email)
        addToast('Email de réinitialisation envoyé !', 'success')
        setTab('login')
      }
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <Code2 size={40} className="login-logo" />
          <h1>DevRequests</h1>
          <p>Gérez vos demandes de création</p>
        </div>

        <div className="tabs">
          {TABS.map(t => (
            <button
              key={t}
              className={`tab-btn ${tab === t ? 'tab-btn--active' : ''}`}
              onClick={() => setTab(t)}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="vous@exemple.com"
              required
              autoComplete="email"
            />
          </div>

          {tab !== 'reset' && (
            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
              />
            </div>
          )}

          <button type="submit" className="btn btn--primary btn--full" disabled={loading}>
            {tab === 'login' && <><LogIn size={16} /> {loading ? 'Connexion...' : 'Se connecter'}</>}
            {tab === 'signup' && <><UserPlus size={16} /> {loading ? 'Création...' : "Créer un compte"}</>}
            {tab === 'reset' && <><KeyRound size={16} /> {loading ? 'Envoi...' : 'Envoyer le lien'}</>}
          </button>
        </form>
      </div>
    </div>
  )
}
