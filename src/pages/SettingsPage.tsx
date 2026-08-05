import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  DEFAULT_NOTIFICATION_PREFS,
  getCachedNotificationPrefs,
  getNotificationPrefs,
  isValidReminderTime,
  setNotificationPrefs,
  type NotificationPrefs,
} from '@/data/notificationPrefs'
import { useAuth } from '@/hooks/useAuth'
import { requestNotificationPermission } from '@/lib/dailyBrowserReminder'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

export function SettingsPage() {
  const { user } = useAuth()
  const uid = user?.uid

  const [prefs, setPrefs] = useState<NotificationPrefs>(() => {
    if (!uid) return { ...DEFAULT_NOTIFICATION_PREFS }
    return getCachedNotificationPrefs(uid) ?? { ...DEFAULT_NOTIFICATION_PREFS }
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!uid) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    void getNotificationPrefs(uid).then((next) => {
      if (cancelled) return
      setPrefs(next)
      setLoading(false)
    })

    return () => {
      cancelled = true
    }
  }, [uid])

  async function persist(next: NotificationPrefs) {
    if (!uid || saving) return
    setSaving(true)
    setPrefs(next)
    try {
      await setNotificationPrefs(uid, next)
    } catch {
      toast.error('Não foi possível salvar as preferências.')
      try {
        const fresh = await getNotificationPrefs(uid)
        setPrefs(fresh)
      } catch {
        // Keep optimistic state if reload also fails.
      }
    } finally {
      setSaving(false)
    }
  }

  async function onToggleBrowser(enabled: boolean) {
    if (!enabled) {
      await persist({ ...prefs, browserEnabled: false })
      return
    }

    const permission = await requestNotificationPermission()
    if (permission === 'unsupported') {
      toast.error('Este navegador não suporta notificações.')
      return
    }
    if (permission !== 'granted') {
      toast.error(
        'Permissão de notificação negada. Ative nas configurações do navegador.',
      )
      return
    }

    await persist({ ...prefs, browserEnabled: true })
  }

  async function onTimeChange(time: string) {
    if (!isValidReminderTime(time)) return
    await persist({ ...prefs, time })
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ajustes do Equilibrium. Mais opções vão aparecer aqui com o tempo.
        </p>
      </div>

      <section className="space-y-4" aria-labelledby="settings-reminders">
        <div>
          <h2
            id="settings-reminders"
            className="text-lg font-medium tracking-tight"
          >
            Lembretes
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Um aviso diário no horário que você escolher. Funciona melhor com o
            app aberto (ou em uma aba em segundo plano).
          </p>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : (
          <div className="space-y-5">
            <label className="flex items-center justify-between gap-4">
              <span className="text-sm">Notificação no navegador</span>
              <Switch
                checked={prefs.browserEnabled}
                disabled={saving || !uid}
                onCheckedChange={(checked) => {
                  void onToggleBrowser(checked)
                }}
                aria-label="Ativar notificação no navegador"
              />
            </label>

            <label className="flex flex-col gap-1.5 text-sm sm:max-w-xs">
              <span className="text-muted-foreground">Horário</span>
              <Input
                type="time"
                value={prefs.time}
                disabled={saving || !uid}
                onChange={(e) => {
                  void onTimeChange(e.target.value)
                }}
              />
            </label>
          </div>
        )}
      </section>
    </div>
  )
}
