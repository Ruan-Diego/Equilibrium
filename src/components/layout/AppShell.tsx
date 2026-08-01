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
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3 sm:gap-4">
          <div className="flex min-w-0 items-center gap-2 sm:gap-6">
            <Link
              to="/"
              className="shrink-0 text-base font-semibold tracking-tight text-foreground sm:text-lg"
            >
              Equilibrium
            </Link>
            <nav
              className="-mx-1 flex items-center gap-0.5 overflow-x-auto px-1 sm:gap-1"
              aria-label="Principal"
            >
              {links.map(({ to, label, ...rest }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={'end' in rest ? rest.end : false}
                  className={({ isActive }) =>
                    cn(
                      'shrink-0 px-2 py-1.5 text-sm transition-colors sm:px-3',
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
            className="shrink-0"
            onClick={() => {
              void signOut()
            }}
          >
            Sair
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <Outlet />
      </main>
    </div>
  )
}
