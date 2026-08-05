import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase'

export type NotificationPrefs = {
  browserEnabled: boolean
  /** Local time as "HH:mm". */
  time: string
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  browserEnabled: false,
  time: '20:00',
}

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/

function cacheKey(uid: string) {
  return `eq:notificationPrefs:${uid}`
}

function userRef(uid: string) {
  return doc(db, 'users', uid)
}

export function isValidReminderTime(time: string): boolean {
  return TIME_RE.test(time)
}

export function normalizeNotificationPrefs(
  raw: unknown,
): NotificationPrefs {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_NOTIFICATION_PREFS }
  }

  const data = raw as Record<string, unknown>
  const time =
    typeof data.time === 'string' && isValidReminderTime(data.time)
      ? data.time
      : DEFAULT_NOTIFICATION_PREFS.time

  return {
    browserEnabled: data.browserEnabled === true,
    time,
  }
}

export function getCachedNotificationPrefs(
  uid: string,
): NotificationPrefs | null {
  try {
    const raw = localStorage.getItem(cacheKey(uid))
    if (!raw) return null
    return normalizeNotificationPrefs(JSON.parse(raw) as unknown)
  } catch {
    return null
  }
}

export function setCachedNotificationPrefs(
  uid: string,
  prefs: NotificationPrefs,
) {
  try {
    localStorage.setItem(cacheKey(uid), JSON.stringify(prefs))
  } catch {
    // Ignore quota / private mode failures.
  }
}

export const NOTIFICATION_PREFS_CHANGED_EVENT = 'eq:notification-prefs-changed'

export function notifyNotificationPrefsChanged() {
  window.dispatchEvent(new Event(NOTIFICATION_PREFS_CHANGED_EVENT))
}

export async function getNotificationPrefs(
  uid: string,
): Promise<NotificationPrefs> {
  try {
    const snap = await getDoc(userRef(uid))
    const prefs = normalizeNotificationPrefs(
      snap.exists() ? snap.data()?.notifications : null,
    )
    setCachedNotificationPrefs(uid, prefs)
    return prefs
  } catch {
    return (
      getCachedNotificationPrefs(uid) ?? { ...DEFAULT_NOTIFICATION_PREFS }
    )
  }
}

export async function setNotificationPrefs(
  uid: string,
  prefs: NotificationPrefs,
): Promise<void> {
  const next = normalizeNotificationPrefs(prefs)
  setCachedNotificationPrefs(uid, next)
  await setDoc(
    userRef(uid),
    {
      notifications: {
        browserEnabled: next.browserEnabled,
        time: next.time,
      },
    },
    { merge: true },
  )
  notifyNotificationPrefsChanged()
}
