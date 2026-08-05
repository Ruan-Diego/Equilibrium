import { isValidReminderTime } from '@/data/notificationPrefs'

export const REMINDER_TITLE = 'Equilibrium'
export const REMINDER_BODY = 'Hora de olhar o equilíbrio das suas áreas.'

function lastNotifiedKey(uid: string) {
  return `eq:lastBrowserReminder:${uid}`
}

/** Local calendar date as YYYY-MM-DD. */
export function localDateKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function parseReminderTime(
  time: string,
): { hours: number; minutes: number } | null {
  if (!isValidReminderTime(time)) return null
  const [h, m] = time.split(':').map(Number)
  return { hours: h, minutes: m }
}

/**
 * Next Date at which the daily reminder should fire in local time.
 * If today's slot is still ahead of `now`, returns today; otherwise tomorrow.
 */
export function nextReminderAt(time: string, now: Date = new Date()): Date | null {
  const parsed = parseReminderTime(time)
  if (!parsed) return null

  const next = new Date(now)
  next.setSeconds(0, 0)
  next.setHours(parsed.hours, parsed.minutes, 0, 0)

  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1)
  }

  return next
}

/** True when `now` is on/after today's reminder time. */
export function isPastReminderTime(
  time: string,
  now: Date = new Date(),
): boolean {
  const parsed = parseReminderTime(time)
  if (!parsed) return false

  const todaySlot = new Date(now)
  todaySlot.setSeconds(0, 0)
  todaySlot.setHours(parsed.hours, parsed.minutes, 0, 0)
  return now.getTime() >= todaySlot.getTime()
}

export function getLastNotifiedDate(uid: string): string | null {
  try {
    return localStorage.getItem(lastNotifiedKey(uid))
  } catch {
    return null
  }
}

export function setLastNotifiedDate(uid: string, dateKey: string) {
  try {
    localStorage.setItem(lastNotifiedKey(uid), dateKey)
  } catch {
    // Ignore quota / private mode failures.
  }
}

export function wasNotifiedOn(uid: string, dateKey: string): boolean {
  return getLastNotifiedDate(uid) === dateKey
}

export function shouldNotifyNow(
  uid: string,
  time: string,
  now: Date = new Date(),
): boolean {
  if (!isPastReminderTime(time, now)) return false
  return !wasNotifiedOn(uid, localDateKey(now))
}

export type ShowReminderResult =
  | { ok: true }
  | { ok: false; reason: 'unsupported' | 'denied' | 'error' }

export function showBrowserReminder(
  onClick?: () => void,
): ShowReminderResult {
  if (typeof Notification === 'undefined') {
    return { ok: false, reason: 'unsupported' }
  }
  if (Notification.permission !== 'granted') {
    return { ok: false, reason: 'denied' }
  }

  try {
    const notification = new Notification(REMINDER_TITLE, {
      body: REMINDER_BODY,
      tag: 'eq-daily-reminder',
    })
    notification.onclick = () => {
      onClick?.()
      window.focus()
      notification.close()
    }
    return { ok: true }
  } catch {
    return { ok: false, reason: 'error' }
  }
}

export async function requestNotificationPermission(): Promise<
  NotificationPermission | 'unsupported'
> {
  if (typeof Notification === 'undefined') return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  try {
    return await Notification.requestPermission()
  } catch {
    return 'denied'
  }
}

/** Max delay for setTimeout (browsers clamp around 2^31-1 ms). */
const MAX_TIMEOUT_MS = 2_147_483_647

export function msUntil(target: Date, now: Date = new Date()): number {
  return Math.max(0, target.getTime() - now.getTime())
}

export function scheduleTimeout(
  ms: number,
  callback: () => void,
): ReturnType<typeof setTimeout> {
  const delay = Math.min(ms, MAX_TIMEOUT_MS)
  return setTimeout(callback, delay)
}
