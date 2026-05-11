import { useEffect, useState } from 'react'
import { fetchRequests, updateRequest } from '../services/requestService'
import { useToast } from '../context/ToastContext'
import { Kanban as KanbanIcon, Plus } from 'lucide-react'
import { STATUSES, STATUS_LABELS, STATUS_COLORS } from '../utils/constants'
import RequestCard from '../components/RequestCard'
import RequestModal from '../components/RequestModal'

export default function Kanban() {
  const { addToast } = useToast()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingRequest, setEditingRequest] = useState(null)
  const [dragId, setDragId] = useState(null)
  const [dragOver, setDragOver] = useState(null)

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

  function byStatus(status) {
    return requests.filter(r => r.status === status)
  }

  function handleDragStart(e, id) {
    setDragId(id)
    e.dataTransfer.effectAllowed = 'move'
  }

  function handleDragOver(e, status) {
    e.preventDefault()
    setDragOver(status)
  }

  async function handleDrop(e, status) {
    e.preventDefault()
    setDragOver(null)
    if (!dragId) return
    const req = requests.find(r => r.id === dragId)
    if (!req || req.status === status) return
    setRequests(prev => prev.map(r => r.id === dragId ? { ...r, status } : r))
    try {
      await updateRequest(dragId, { status })
    } catch (err) {
      addToast(err.message, 'error')
      load()
    }
    setDragId(null)
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

  if (loading) return <div className="page-loading"><div className="spinner" /></div>

  return (
    <div className="page page--kanban">
      <div className="page-header">
        <h1><KanbanIcon size={24} /> Kanban</h1>
        <button className="btn btn--primary" onClick={openCreate}>
          <Plus size={16} /> Nouvelle demande
        </button>
      </div>

      <div className="kanban-board">
        {STATUSES.map(status => (
          <div
            key={status}
            className={`kanban-col ${dragOver === status ? 'kanban-col--over' : ''}`}
            onDragOver={e => handleDragOver(e, status)}
            onDrop={e => handleDrop(e, status)}
            onDragLeave={() => setDragOver(null)}
          >
            <div className="kanban-col-header" style={{ borderTopColor: STATUS_COLORS[status] }}>
              <span className="kanban-col-title">{STATUS_LABELS[status]}</span>
              <span className="kanban-col-count">{byStatus(status).length}</span>
            </div>
            <div className="kanban-cards">
              {byStatus(status).map(req => (
                <div
                  key={req.id}
                  draggable
                  onDragStart={e => handleDragStart(e, req.id)}
                  className={`draggable ${dragId === req.id ? 'draggable--dragging' : ''}`}
                >
                  <RequestCard request={req} onClick={() => openEdit(req)} />
                </div>
              ))}
              {byStatus(status).length === 0 && (
                <div className="kanban-empty">Aucune demande</div>
              )}
            </div>
          </div>
        ))}
      </div>

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
