import { NavLink } from 'react-router-dom'

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

const navItems = [
  { to: '/dashboard',    label: 'Dashboard',     icon: '📊' },
  { to: '/transactions', label: 'Transactions',  icon: '💸' },
  { to: '/categories',   label: 'Categories',    icon: '🏷️' },
  { to: '/budgets',      label: 'Budgets',       icon: '🎯' },
]

export default function Sidebar({ open = true, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {open && onClose && (
        <div
          className="fixed inset-0 bg-dark/50 z-30 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          'fixed top-14 left-0 h-[calc(100vh-3.5rem)] w-56 z-30',
          'bg-light border-r-neo-thick border-dark',
          'flex flex-col',
          'transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
        ].join(' ')}
      >
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-4 py-3 font-bold text-sm',
                  'border-b-2 border-dark',
                  'hover:bg-primary transition-colors',
                  isActive ? 'bg-primary' : '',
                ].join(' ')
              }
            >
              <span>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
