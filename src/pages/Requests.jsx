import { useEffect, useState } from 'react'
import { fetchRequests, deleteRequest } from '../services/requestService'
import { useToast } from '../context/ToastContext'
import { List, Plus, Search, Trash2, Pencil, Filter } from 'lucide-react'
import { STATUSES, PRIORITIES, TYPES, STATUS_LABELS, PRIORITY_LABELS, TYPE_LABELS } from '../utils/constants'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import RequestModal from '../components/RequestModal'

export default function Requests() {
  const { addToast } = useToast()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRequest, setEditingRequest] = useState(null)
  const [filters, setFilters] = useState({ search: '', status: '', priority: '', type: '' })

  async function load() {
    try {
      const data = await fetchRequests()
      setRequests(data)
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = requests.filter(r => {
    if (filters.search && !r.title.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.status && r.status !== filters.status) return false
    if (filters.priority && r.priority !== filters.priority) return false
    if (filters.type && r.type !== filters.type) return false
    return true
  })

  async function handleDelete(id) {
    if (!confirm('Supprimer cette demande ?')) return
    try {
      await deleteRequest(id)
      setRequests(prev => prev.filter(r => r.id !== id))
      addToast('Demande supprimée.', 'success')
    } catch (err) {
      addToast(err.message, 'error')
    }
  }

  function openCreate() {
    setEditingRequest(null)
    setShowModal(true)
  }

  function openEdit(req) {
    setEditingRequest(req)
    setShowModal(true)
  }

  function onSaved() {
    setShowModal(false)
    load()
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1><List size={24} /> Demandes</h1>
        <button className="btn btn--primary" onClick={openCreate}>
          <Plus size={16} /> Nouvelle demande
        </button>
      </div>

      <div className="filters-bar">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            className="search-input"
          />
        </div>
        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
          <option value="">Tous les statuts</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
        <select value={filters.priority} onChange={e => setFilters(f => ({ ...f, priority: e.target.value }))}>
          <option value="">Toutes priorités</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
        </select>
        <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
          <option value="">Tous les types</option>
          {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
        </select>
        {(filters.search || filters.status || filters.priority || filters.type) && (
          <button className="btn btn--ghost btn--sm" onClick={() => setFilters({ search: '', status: '', priority: '', type: '' })}>
            Effacer
          </button>
        )}
      </div>

      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>Aucune demande trouvée.</p>
          <button className="btn btn--primary" onClick={openCreate}><Plus size={16} /> Créer une demande</button>
        </div>
      ) : (
        <div className="card">
          <table className="table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Priorité</th>
                <th>Client</th>
                <th>Budget</th>
                <th>Deadline</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className="table-row--clickable" onClick={() => openEdit(r)}>
                  <td><strong>{r.title}</strong></td>
                  <td><span className="type-tag">{TYPE_LABELS[r.type] ?? r.type}</span></td>
                  <td><StatusBadge status={r.status} /></td>
                  <td><PriorityBadge priority={r.priority} /></td>
                  <td>{r.client_name ?? '—'}</td>
                  <td>{r.budget ? `${parseFloat(r.budget).toFixed(0)} €` : '—'}</td>
                  <td>{r.deadline ? new Date(r.deadline).toLocaleDateString('fr-FR') : '—'}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="row-actions">
                      <button className="icon-btn" onClick={() => openEdit(r)} title="Modifier">
                        <Pencil size={15} />
                      </button>
                      <button className="icon-btn icon-btn--danger" onClick={() => handleDelete(r.id)} title="Supprimer">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <RequestModal
          request={editingRequest}
          onClose={() => setShowModal(false)}
          onSaved={onSaved}
        />
      )}
    </div>
  )
}
