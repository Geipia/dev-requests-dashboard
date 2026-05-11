import { Calendar, DollarSign, User } from 'lucide-react'
import { TYPE_LABELS } from '../utils/constants'
import PriorityBadge from './PriorityBadge'

export default function RequestCard({ request, onClick }) {
  const overdue = request.deadline && new Date(request.deadline) < new Date() && request.status !== 'completed'

  return (
    <div className={`request-card ${overdue ? 'request-card--overdue' : ''}`} onClick={onClick}>
      <div className="request-card-top">
        <span className="type-tag type-tag--sm">{TYPE_LABELS[request.type] ?? request.type}</span>
        <PriorityBadge priority={request.priority} size="sm" />
      </div>
      <h3 className="request-card-title">{request.title}</h3>
      {request.description && (
        <p className="request-card-desc">{request.description.substring(0, 80)}{request.description.length > 80 ? '…' : ''}</p>
      )}
      <div className="request-card-meta">
        {request.client_name && (
          <span className="meta-item"><User size={12} /> {request.client_name}</span>
        )}
        {request.deadline && (
          <span className={`meta-item ${overdue ? 'meta-item--danger' : ''}`}>
            <Calendar size={12} /> {new Date(request.deadline).toLocaleDateString('fr-FR')}
          </span>
        )}
        {request.budget && (
          <span className="meta-item"><DollarSign size={12} /> {parseFloat(request.budget).toFixed(0)} €</span>
        )}
      </div>
      {request.technologies?.length > 0 && (
        <div className="request-card-techs">
          {request.technologies.slice(0, 3).map(t => <span key={t} className="tech-pill">{t}</span>)}
          {request.technologies.length > 3 && <span className="tech-pill">+{request.technologies.length - 3}</span>}
        </div>
      )}
    </div>
  )
}
