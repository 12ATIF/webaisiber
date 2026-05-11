import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Shield, Menu, X, Moon, Sun, Bell } from 'lucide-react'
import { clsx } from 'clsx'
import { useApp } from '../context/AppContext'

const navLinks = [
  { to: '/', label: 'Beranda' },
  { to: '/analyze', label: 'Analisis' },
  { to: '/community', label: 'Komunitas' },
  { to: '/profile', label: 'Riwayat' },
]

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const { state, dispatch } = useApp()

  const isActive = (path: string) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-blue-700 transition-colors">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-[15px]">
              WaspadaSiber
              <span className="text-blue-600 ml-0.5">AI</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={clsx(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                  isActive(link.to)
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <button
              aria-label="Notifikasi"
              className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button
              onClick={() => dispatch({ type: 'TOGGLE_DARK_MODE' })}
              aria-label="Toggle dark mode"
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {state.darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Menu"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pb-4 pt-2 animate-fade-in">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={clsx(
                'block px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                isActive(link.to)
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400'
                  : 'text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800',
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
