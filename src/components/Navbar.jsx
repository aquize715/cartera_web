import { NavLink } from 'react-router-dom'
import './Navbar.css'

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/fundamentos', label: 'Fundamentos' },
  { to: '/indicadores', label: 'Indicadores' },
]

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar__inner">
        <div className="navbar__brand">
          <img
            src="/logos/UMSA.png"
            alt="UMSA"
            className="navbar__umsa-logo"
          />
          <span className="navbar__title">Cartera de Créditos</span>
        </div>
        <div className="navbar__divider" />
        <div className="navbar__links">
          {links.map(({ to, label, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                'navbar__link' + (isActive ? ' active' : '')
              }
            >
              {label}
              {badge && <span className="navbar__badge">{badge}</span>}
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
