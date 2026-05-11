import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchStats, fetchRequests } from '../services/requestService'
import { useToast } from '../context/ToastContext'
import { LayoutDashboard, TrendingUp, Clock, CheckCircle2, AlertCircle, DollarSign, ArrowRight } from 'lucide-react'
import { STATUSES, PRIORITIES, TYPES, STATUS_LABELS, PRIORITY_LABELS, TYPE_LABELS } from '../utils/constants'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'

export default function Dashboard() {
  const { addToast } = useToast()
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [s, r] = await Promise.all([
          fetchStats(),
          fetchRequests(),
        ])
        setStats(s)
        setRecent(r.slice(0, 5))
      } catch (err) {
        addToast(err.message, 'error')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="page-loading"><div className="spinner" /></div>

  const urgent = (stats?.byPriority?.urgent ?? 0) + (stats?.byPriority?.high ?? 0)
  const completed = stats?.byStatus?.completed ?? 0
  const inProgress = stats?.byStatus?.in_progress ?? 0

  return (
    <div className="page">
      <div className="page-header">
        <h1><LayoutDashboard size={24} /> Tableau de bord</h1>
      </div>

      <div className="stat-grid">
        <div className="stat-card stat-card--blue">
          <div className="stat-icon"><TrendingUp size={24} /></div>
          <div className="stat-body">
            <span className="stat-value">{stats?.total ?? 0}</span>
            <span className="stat-label">Total demandes</span>
          </div>
        </div>
        <div className="stat-card stat-card--yellow">
          <div className="stat-icon"><Clock size={24} /></div>
          <div className="stat-body">
            <span className="stat-value">{inProgress}</span>
            <span className="stat-label">En cours</span>
          </div>
        </div>
        <div className="stat-card stat-card--green">
          <div className="stat-icon"><CheckCircle2 size={24} /></div>
          <div className="stat-body">
            <span className="stat-value">{completed}</span>
            <span className="stat-label">Terminées</span>
          </div>
        </div>
        <div className="stat-card stat-card--red">
          <div className="stat-icon"><AlertCircle size={24} /></div>
          <div className="stat-body">
            <span className="stat-value">{urgent}</span>
            <span className="stat-label">Priorité haute</span>
          </div>
        </div>
        <div className="stat-card stat-card--purple">
          <div className="stat-icon"><DollarSign size={24} /></div>
          <div className="stat-body">
            <span className="stat-value">{stats?.totalBudget?.toFixed(0) ?? 0} €</span>
            <span className="stat-label">Budget total</span>
          </div>
        </div>
        <div className="stat-card stat-card--teal">
          <div className="stat-icon"><DollarSign size={24} /></div>
          <div className="stat-body">
            <span className="stat-value">{stats?.totalCost?.toFixed(0) ?? 0} €</span>
            <span className="stat-label">Coût réel total</span>
          </div>
        </div>
      </div>

      <div className="dashboard-bottom">
        <div className="card">
          <div className="card-header">
            <h2>Répartition par statut</h2>
          </div>
          <div className="breakdown-list">
            {STATUSES.map(s => (
              <div key={s} className="breakdown-row">
                <StatusBadge status={s} />
                <div className="breakdown-bar-wrap">
                  <div
                    className="breakdown-bar"
                    style={{ width: stats?.total ? `${((stats.byStatus[s] ?? 0) / stats.total) * 100}%` : '0%' }}
                  />
                </div>
                <span className="breakdown-count">{stats?.byStatus?.[s] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Répartition par type</h2>
          </div>
          <div className="breakdown-list">
            {TYPES.map(t => (
              <div key={t} className="breakdown-row">
                <span className="type-tag">{TYPE_LABELS[t]}</span>
                <div className="breakdown-bar-wrap">
                  <div
                    className="breakdown-bar breakdown-bar--type"
                    style={{ width: stats?.total ? `${((stats.byType[t] ?? 0) / stats.total) * 100}%` : '0%' }}
                  />
                </div>
                <span className="breakdown-count">{stats?.byType?.[t] ?? 0}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <h2>Dernières demandes</h2>
          <Link to="/demandes" className="btn btn--ghost btn--sm">
            Voir tout <ArrowRight size={14} />
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="empty-text">Aucune demande pour l&apos;instant.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Priorité</th>
                <th>Client</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(r => (
                <tr key={r.id}>
                  <td><strong>{r.title}</strong></td>
                  <td><span className="type-tag">{TYPE_LABELS[r.type] ?? r.type}</span></td>
                  <td><StatusBadge status={r.status} /></td>
                  <td><PriorityBadge priority={r.priority} /></td>
                  <td>{r.client_name ?? '—'}</td>
                  <td>{new Date(r.created_at).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
