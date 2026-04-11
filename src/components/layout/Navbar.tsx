import { Link } from 'react-router-dom'
import { Menu, Sun, Moon } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../contexts/ThemeContext'
import Button from '../ui/Button'

interface NavbarProps {
  onMenuToggle?: () => void
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const { user, logout, isLogoutLoading } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="bg-primary border-b-neo-thick border-dark shadow-neo-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 h-14">
        {/* Left: hamburger + brand */}
        <div className="flex items-center gap-3">
          {onMenuToggle && (
            <button
              onClick={onMenuToggle}
              aria-label="Toggle menu"
              className="lg:hidden border-neo-thick border-dark bg-light w-9 h-9 flex items-center justify-center hover:bg-gray-neo transition-colors"
            >
              <Menu size={18} strokeWidth={2.5} />
            </button>
          )}
          <Link to="/dashboard" className="font-black text-lg tracking-tight">
            Finance Tracker
          </Link>
        </div>

        {/* Right: theme toggle + user info + logout */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="border-neo-thick border-dark bg-light w-9 h-9 flex items-center justify-center hover:bg-gray-neo transition-colors"
          >
            {theme === 'dark' ? <Sun size={16} strokeWidth={2.5} /> : <Moon size={16} strokeWidth={2.5} />}
          </button>
          {user && (
            <span className="hidden sm:block font-bold text-sm border-neo-thick border-dark bg-light px-3 py-1">
              {user.name}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => logout()}
            loading={isLogoutLoading}
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}
