import { Link, NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/areas', label: 'Áreas' },
  { to: '/history', label: 'Histórico' },
] as const

export function AppShell() {
  const { signOut } = useAuth()

  return (
    <div className="min-h-screen text-foreground">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              to="/"
              className="text-lg font-semibold tracking-tight text-foreground"
            >
              Equilibrium
            </Link>
            <nav className="flex items-center gap-1" aria-label="Principal">
              {links.map(({ to, label, ...rest }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={'end' in rest ? rest.end : false}
                  className={({ isActive }) =>
                    cn(
                      'px-3 py-1.5 text-sm transition-colors',
                      isActive
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              void signOut()
            }}
          >
            Sair
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
