import { useEffect, useRef, useState } from 'react'
import {
  getNotificationPrefs,
  NOTIFICATION_PREFS_CHANGED_EVENT,
  type NotificationPrefs,
} from '@/data/notificationPrefs'
import {
  localDateKey,
  msUntil,
  nextReminderAt,
  scheduleTimeout,
  setLastNotifiedDate,
  shouldNotifyNow,
  showBrowserReminder,
} from '@/lib/dailyBrowserReminder'

type UseDailyBrowserReminderOptions = {
  uid?: string | null
}

function fireReminder(uid: string) {
  const result = showBrowserReminder()
  if (result.ok) {
    setLastNotifiedDate(uid, localDateKey())
  }
}

export function useDailyBrowserReminder({
  uid = null,
}: UseDailyBrowserReminderOptions = {}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [reloadToken, setReloadToken] = useState(0)

  useEffect(() => {
    const onChange = () => setReloadToken((n) => n + 1)
    window.addEventListener(NOTIFICATION_PREFS_CHANGED_EVENT, onChange)
    return () => {
      window.removeEventListener(NOTIFICATION_PREFS_CHANGED_EVENT, onChange)
    }
  }, [])

  useEffect(() => {
    if (!uid) return

    let cancelled = false

    const clearTimer = () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    const arm = (prefs: NotificationPrefs) => {
      clearTimer()
      if (!prefs.browserEnabled) return
      if (typeof Notification === 'undefined') return
      if (Notification.permission !== 'granted') return

      if (shouldNotifyNow(uid, prefs.time)) {
        fireReminder(uid)
      }

      const next = nextReminderAt(prefs.time)
      if (!next) return

      const delay = msUntil(next)
      timerRef.current = scheduleTimeout(delay, () => {
        if (cancelled) return
        if (shouldNotifyNow(uid, prefs.time)) {
          fireReminder(uid)
        }
        arm(prefs)
      })
    }

    void getNotificationPrefs(uid).then((prefs) => {
      if (cancelled) return
      arm(prefs)
    })

    return () => {
      cancelled = true
      clearTimer()
    }
  }, [uid, reloadToken])
}
