import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tag,
  Target,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

interface SidebarProps {
  open?: boolean
  collapsed?: boolean
  onClose?: () => void
  onToggleCollapse?: () => void
}

const navItems = [
  { to: '/dashboard',    label: 'Dashboard',    Icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', Icon: ArrowLeftRight },
  { to: '/categories',   label: 'Categories',   Icon: Tag },
  { to: '/budgets',      label: 'Budgets',      Icon: Target },
]

export default function Sidebar({ open = true, collapsed = false, onClose, onToggleCollapse }: SidebarProps) {
  const sidebarWidth = collapsed ? 'w-14' : 'w-56'

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
          'fixed top-14 left-0 h-[calc(100vh-3.5rem)] z-30',
          'bg-light border-r-neo-thick border-dark',
          'flex flex-col',
          'transition-all duration-200',
          sidebarWidth,
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
        ].join(' ')}
      >
        <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              title={collapsed ? label : undefined}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-4 py-3 font-bold text-sm',
                  'border-b-2 border-dark',
                  'hover:bg-primary transition-colors',
                  collapsed ? 'justify-center' : '',
                  isActive ? 'bg-primary' : '',
                ].join(' ')
              }
            >
              <Icon size={18} strokeWidth={2.5} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle button — desktop only */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={[
              'hidden lg:flex items-center justify-center',
              'h-10 border-t-2 border-dark',
              'hover:bg-primary transition-colors font-bold',
            ].join(' ')}
          >
            {collapsed
              ? <ChevronRight size={18} strokeWidth={2.5} />
              : <ChevronLeft size={18} strokeWidth={2.5} />
            }
          </button>
        )}
      </aside>
    </>
  )
}
