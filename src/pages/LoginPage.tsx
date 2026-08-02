import { useState, type FormEvent } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IntroOverlay } from '@/components/intro/IntroOverlay'
import { useIntroController } from '@/hooks/useIntroController'

type Mode = 'login' | 'signup' | 'reset'

export function LoginPage() {
  const { signInGoogle, signInEmail, signUpEmail, resetPassword } = useAuth()
  const intro = useIntroController()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function run(action: () => Promise<void>) {
    setError(null)
    setInfo(null)
    setBusy(true)
    try {
      await action()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Algo deu errado.')
    } finally {
      setBusy(false)
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (mode === 'login') {
      void run(() => signInEmail(email, password))
      return
    }
    if (mode === 'signup') {
      void run(() => signUpEmail(email, password))
      return
    }
    void run(async () => {
      await resetPassword(email)
      setInfo('Enviamos um link de redefinição para o seu e-mail.')
    })
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12 text-foreground">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,color-mix(in_srgb,var(--balanced)_12%,transparent),transparent_55%),radial-gradient(ellipse_at_80%_80%,color-mix(in_srgb,var(--healthy)_8%,transparent),transparent_50%)]"
      />

      <div className="relative z-10 w-full max-w-sm">
        <header className="mb-10 text-center">
          <p className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Equilibrium
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Atenção equilibrada às áreas da sua vida.
          </p>
        </header>

        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <Input
            type="email"
            name="email"
            autoComplete="email"
            required
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
          />

          {mode !== 'reset' && (
            <Input
              type="password"
              name="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              required
              minLength={6}
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
            />
          )}

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          {info && (
            <p role="status" className="text-sm text-[var(--healthy)]">
              {info}
            </p>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {mode === 'login' && 'Entrar'}
            {mode === 'signup' && 'Criar conta'}
            {mode === 'reset' && 'Enviar link'}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-3 text-muted-foreground">ou</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="w-full"
          disabled={busy}
          onClick={() => void run(() => signInGoogle())}
        >
          Continuar com Google
        </Button>

        <div className="mt-8 flex flex-col items-center gap-2 text-sm text-muted-foreground">
          {mode === 'login' && (
            <>
              <button
                type="button"
                className="hover:text-foreground"
                onClick={() => {
                  setMode('signup')
                  setError(null)
                  setInfo(null)
                }}
              >
                Criar conta com e-mail
              </button>
              <button
                type="button"
                className="hover:text-foreground"
                onClick={() => {
                  setMode('reset')
                  setError(null)
                  setInfo(null)
                }}
              >
                Esqueci a senha
              </button>
            </>
          )}
          {mode !== 'login' && (
            <button
              type="button"
              className="hover:text-foreground"
              onClick={() => {
                setMode('login')
                setError(null)
                setInfo(null)
              }}
            >
              Voltar ao login
            </button>
          )}
          <button
            type="button"
            className="mt-2 hover:text-foreground"
            onClick={intro.openPreview}
          >
            Conhecer o app
          </button>
        </div>
      </div>

      <IntroOverlay
        open={intro.open}
        mode={intro.mode}
        onOpenChange={(next) => {
          if (!next) intro.close()
        }}
        onComplete={intro.complete}
      />
    </main>
  )
}
