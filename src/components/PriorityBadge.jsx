import { PRIORITY_LABELS, PRIORITY_COLORS } from '../utils/constants'

export default function PriorityBadge({ priority, size = 'md' }) {
  return (
    <span
      className={`badge badge--priority ${size === 'sm' ? 'badge--sm' : ''}`}
      style={{ background: PRIORITY_COLORS[priority] + '22', color: PRIORITY_COLORS[priority], border: `1px solid ${PRIORITY_COLORS[priority]}55` }}
    >
      {PRIORITY_LABELS[priority] ?? priority}
    </span>
  )
}
