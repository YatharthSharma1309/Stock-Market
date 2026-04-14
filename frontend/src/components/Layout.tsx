import { useRef, useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import {
  TrendingUp, LayoutDashboard, BarChart2, Briefcase, History,
  GraduationCap, LogOut, Trophy, Sun, Moon, Menu, X,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTheme } from '@/context/ThemeContext'
import AIAssistantPanel, { type AIAssistantHandle } from '@/components/AIAssistantPanel'
import { AIContext } from '@/context/AIContext'
import type { ChatContext } from '@/context/AIContext'

const navLinks = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: BarChart2, label: 'Markets', to: '/markets' },
  { icon: Briefcase, label: 'Portfolio', to: '/portfolio' },
  { icon: History, label: 'Trade History', to: '/trades' },
  { icon: GraduationCap, label: 'Learn', to: '/learn' },
  { icon: Trophy, label: 'Leaderboard', to: '/leaderboard' },
]

export default function Layout() {
  const { payload, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const aiPanelRef = useRef<AIAssistantHandle>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function openWithMessage(message: string, context?: ChatContext) {
    aiPanelRef.current?.openWithMessage(message, context)
  }

  const pageTitle = location.pathname.slice(1).split('/')[0] || 'dashboard'

  return (
    <AIContext.Provider value={{ openWithMessage }}>
      <div className="min-h-screen bg-background flex">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col
            transform transition-transform duration-200 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            lg:static lg:translate-x-0 lg:transition-none lg:transform-none
          `}
        >
          <div className="flex items-center gap-2.5 px-6 py-5 border-b border-border">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <span className="font-bold text-foreground">StockSim Pro</span>
            {/* Close button on mobile */}
            <button
              className="ml-auto lg:hidden text-muted-foreground hover:text-foreground"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1">
            {navLinks.map(({ icon: Icon, label, to }) => {
              const active = location.pathname === to || location.pathname.startsWith(to + '/')
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {label}
                </Link>
              )
            })}
          </nav>

          <div className="px-3 py-4 border-t border-border">
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors text-sm font-medium"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-8 shrink-0">
            <div className="flex items-center gap-3">
              {/* Hamburger — mobile only */}
              <button
                className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-lg font-semibold text-foreground capitalize">
                {pageTitle}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* User avatar */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm shrink-0">
                  {payload?.sub?.[0]?.toUpperCase() ?? 'U'}
                </div>
                <span className="text-sm text-muted-foreground hidden sm:block">{payload?.sub}</span>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto overflow-x-hidden">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Floating AI panel — present on every page */}
      <AIAssistantPanel ref={aiPanelRef} />
    </AIContext.Provider>
  )
}
