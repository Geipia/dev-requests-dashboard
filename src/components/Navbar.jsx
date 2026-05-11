import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Kanban, List, LogOut, Code2 } from 'lucide-react'

const NAV = [
  { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
  { to: '/kanban', icon: <Kanban size={18} />, label: 'Kanban' },
  { to: '/demandes', icon: <List size={18} />, label: 'Demandes' },
]

export default function Navbar() {
  const { user, signOut } = useAuth()

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Code2 size={24} />
        <span>DevRequests</span>
      </div>
      <div className="navbar-links">
        {NAV.map(n => (
          <NavLink
            key={n.to}
            to={n.to}
            end={n.to === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'nav-link--active' : ''}`}
          >
            {n.icon} {n.label}
          </NavLink>
        ))}
      </div>
      <div className="navbar-end">
        <span className="navbar-email">{user?.email}</span>
        <button className="icon-btn icon-btn--ghost" onClick={signOut} title="Se déconnecter">
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  )
}
