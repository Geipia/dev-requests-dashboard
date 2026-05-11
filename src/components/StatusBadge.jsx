import { STATUS_LABELS, STATUS_COLORS } from '../utils/constants'

export default function StatusBadge({ status }) {
  return (
    <span
      className="badge"
      style={{ background: STATUS_COLORS[status] + '22', color: STATUS_COLORS[status], border: `1px solid ${STATUS_COLORS[status]}55` }}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  )
}
