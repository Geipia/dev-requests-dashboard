import { useState, useEffect } from 'react'
import { createRequest, updateRequest, addComment, fetchRequest } from '../services/requestService'
import { useToast } from '../context/ToastContext'
import { X, Save, MessageSquarePlus, Send } from 'lucide-react'
import { STATUSES, PRIORITIES, TYPES, STATUS_LABELS, PRIORITY_LABELS, TYPE_LABELS } from '../utils/constants'

const TECH_OPTIONS = ['React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Laravel', 'WordPress', 'Shopify', 'Python', 'Django', 'Flutter', 'React Native', 'PostgreSQL', 'MySQL', 'MongoDB', 'Figma', 'Tailwind', 'TypeScript']

const EMPTY = {
  title: '', description: '', type: 'website', status: 'new', priority: 'medium',
  client_name: '', client_email: '', budget: '', actual_cost: '',
  start_date: '', deadline: '', technologies: [], notes: '',
}

export default function RequestModal({ request, onClose, onSaved }) {
  const { addToast } = useToast()
  const [form, setForm] = useState(EMPTY)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [saving, setSaving] = useState(false)
  const [sendingComment, setSendingComment] = useState(false)
  const [tab, setTab] = useState('details')

  useEffect(() => {
    if (request) {
      setForm({
        title: request.title ?? '',
        description: request.description ?? '',
        type: request.type ?? 'website',
        status: request.status ?? 'new',
        priority: request.priority ?? 'medium',
        client_name: request.client_name ?? '',
        client_email: request.client_email ?? '',
        budget: request.budget ?? '',
        actual_cost: request.actual_cost ?? '',
        start_date: request.start_date ?? '',
        deadline: request.deadline ?? '',
        technologies: request.technologies ?? [],
        notes: request.notes ?? '',
      })
      loadComments(request.id)
    }
  }, [request])

  async function loadComments(id) {
    try {
      const data = await fetchRequest(id)
      setComments(data.request_comments ?? [])
    } catch {}
  }

  function set(field, value) {
    setForm(f => ({ ...f, [field]: value }))
  }

  function toggleTech(tech) {
    setForm(f => ({
      ...f,
      technologies: f.technologies.includes(tech)
        ? f.technologies.filter(t => t !== tech)
        : [...f.technologies, tech],
    }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = { ...form }
      if (!payload.budget) payload.budget = null
      if (!payload.actual_cost) payload.actual_cost = null
      if (!payload.start_date) payload.start_date = null
      if (!payload.deadline) payload.deadline = null

      if (request) {
        await updateRequest(request.id, payload)
        addToast('Demande mise à jour.', 'success')
      } else {
        await createRequest(payload)
        addToast('Demande créée !', 'success')
      }
      onSaved()
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  async function handleComment(e) {
    e.preventDefault()
    if (!newComment.trim() || !request) return
    setSendingComment(true)
    try {
      const c = await addComment(request.id, newComment.trim())
      setComments(prev => [...prev, c])
      setNewComment('')
    } catch (err) {
      addToast(err.message, 'error')
    } finally {
      setSendingComment(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal--large">
        <div className="modal-header">
          <h2>{request ? 'Modifier la demande' : 'Nouvelle demande'}</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        {request && (
          <div className="modal-tabs">
            <button className={`tab-btn ${tab === 'details' ? 'tab-btn--active' : ''}`} onClick={() => setTab('details')}>Détails</button>
            <button className={`tab-btn ${tab === 'comments' ? 'tab-btn--active' : ''}`} onClick={() => setTab('comments')}>
              <MessageSquarePlus size={14} /> Notes ({comments.length})
            </button>
          </div>
        )}

        {tab === 'details' && (
          <form onSubmit={handleSave} className="modal-body modal-form">
            <div className="form-row">
              <div className="form-group form-group--full">
                <label>Titre *</label>
                <input type="text" value={form.title} onChange={e => set('title', e.target.value)} required placeholder="Nom du projet..." />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Type *</label>
                <select value={form.type} onChange={e => set('type', e.target.value)}>
                  {TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Statut</label>
                <select value={form.status} onChange={e => set('status', e.target.value)}>
                  {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Priorité</label>
                <select value={form.priority} onChange={e => set('priority', e.target.value)}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group form-group--full">
                <label>Description</label>
                <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Description détaillée du projet..." />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Nom du client</label>
                <input type="text" value={form.client_name} onChange={e => set('client_name', e.target.value)} placeholder="Jean Dupont" />
              </div>
              <div className="form-group">
                <label>Email du client</label>
                <input type="email" value={form.client_email} onChange={e => set('client_email', e.target.value)} placeholder="client@exemple.com" />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Budget (€)</label>
                <input type="number" value={form.budget} onChange={e => set('budget', e.target.value)} placeholder="0" min="0" step="0.01" />
              </div>
              <div className="form-group">
                <label>Coût réel (€)</label>
                <input type="number" value={form.actual_cost} onChange={e => set('actual_cost', e.target.value)} placeholder="0" min="0" step="0.01" />
              </div>
              <div className="form-group">
                <label>Date de début</label>
                <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input type="date" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label>Technologies utilisées</label>
              <div className="tech-grid">
                {TECH_OPTIONS.map(tech => (
                  <button
                    key={tech}
                    type="button"
                    className={`tech-chip ${form.technologies.includes(tech) ? 'tech-chip--active' : ''}`}
                    onClick={() => toggleTech(tech)}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Notes internes</label>
              <textarea rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Notes, remarques, points d'attention..." />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn--ghost" onClick={onClose}>Annuler</button>
              <button type="submit" className="btn btn--primary" disabled={saving}>
                <Save size={16} /> {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </form>
        )}

        {tab === 'comments' && request && (
          <div className="modal-body comments-section">
            <div className="comments-list">
              {comments.length === 0 && <p className="empty-text">Aucune note pour l&apos;instant.</p>}
              {comments.map(c => (
                <div key={c.id} className="comment">
                  <p>{c.content}</p>
                  <span className="comment-date">{new Date(c.created_at).toLocaleString('fr-FR')}</span>
                </div>
              ))}
            </div>
            <form onSubmit={handleComment} className="comment-form">
              <textarea
                rows={2}
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Ajouter une note..."
                required
              />
              <button type="submit" className="btn btn--primary" disabled={sendingComment}>
                <Send size={14} /> {sendingComment ? 'Envoi...' : 'Ajouter'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
